import * as Y from "yjs";
import { asc, eq } from "drizzle-orm";
import type { Db } from "../db/client.js";
import { yjsUpdates } from "../db/schema.js";

// The ONLY code that knows how Yjs documents are stored in Postgres.
// Everything else just calls load() and append(). If we ever change storage,
// we change this one file.
export function createDocStore(db: Db) {
  return {
    /** Load a document: read all its updates and merge them into one. */
    async load(docName: string): Promise<Uint8Array | null> {
      const rows = await db
        .select({ update: yjsUpdates.update })
        .from(yjsUpdates)
        .where(eq(yjsUpdates.docName, docName))
        .orderBy(asc(yjsUpdates.id));

      if (rows.length === 0) return null;
      // CRDT property: merging updates gives the same result as applying them
      // one by one, so we can combine them into a single update.
      return Y.mergeUpdates(rows.map((r) => r.update));
    },

    /** Save one new update (one INSERT). */
    async append(docName: string, update: Uint8Array): Promise<void> {
      await db.insert(yjsUpdates).values({ docName, update });
    },
  };
}

export type DocStore = ReturnType<typeof createDocStore>;
