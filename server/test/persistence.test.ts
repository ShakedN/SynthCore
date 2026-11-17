import { afterAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import * as Y from "yjs";
import { count, eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { yjsUpdates } from "../src/db/schema.js";
import { createDocStore } from "../src/persistence/docStore.js";
import { createYjsPersistence } from "../src/persistence/yjsPersistence.js";

// Integration tests: these talk to the REAL Postgres from docker-compose.
// Each test uses a random doc name so tests never see each other's data.

const store = createDocStore(db);
const newDocName = () => `test-${randomUUID()}`;

async function rowCount(docName: string) {
  const [row] = await db.select({ n: count() }).from(yjsUpdates).where(eq(yjsUpdates.docName, docName));
  return row.n;
}

afterAll(async () => {
  await sql.end(); // close the database connection so the test process can exit
});

describe("Yjs persistence in Postgres", () => {
  it("returns null for a document that was never saved", async () => {
    expect(await store.load(newDocName())).toBeNull();
  });

  it("a document survives a server restart", async () => {
    const name = newDocName();

    // "Server run #1": a device makes edits.
    const before = createYjsPersistence(store);
    const doc1 = new Y.Doc();
    await before.bindState(name, doc1);
    doc1.getMap("items").set("milk", "approved");
    doc1.getMap("items").set("eggs", "bought");
    await before.flush();

    // "Server run #2": a fresh process with empty memory loads the room.
    const after = createYjsPersistence(store);
    const doc2 = new Y.Doc();
    await after.bindState(name, doc2);

    expect(doc2.getMap("items").toJSON()).toEqual({ milk: "approved", eggs: "bought" });
  });

  it("does not lose an update that arrives while the document is still loading", async () => {
    const name = newDocName();
    const persistence = createYjsPersistence(store);
    const doc = new Y.Doc();

    const loading = persistence.bindState(name, doc); // NOT awaited yet
    doc.getMap("items").set("coffee", "approved"); // arrives mid-load
    await loading;
    await persistence.flush();

    const reloaded = new Y.Doc();
    Y.applyUpdate(reloaded, (await store.load(name))!);
    expect(reloaded.getMap("items").get("coffee")).toBe("approved");
  });

  it("does not write the loaded state back to the database", async () => {
    const name = newDocName();
    const first = createYjsPersistence(store);
    const doc1 = new Y.Doc();
    await first.bindState(name, doc1);
    doc1.getMap("items").set("milk", "approved");
    await first.flush();
    const rowsBefore = await rowCount(name);

    const second = createYjsPersistence(store);
    await second.bindState(name, new Y.Doc());
    await second.flush();

    expect(await rowCount(name)).toBe(rowsBefore);
  });
});
