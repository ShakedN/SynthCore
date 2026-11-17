import { bigserial, customType, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Postgres "bytea" = raw bytes. Yjs updates are binary (Uint8Array), so we
// store them as-is. customType tells Drizzle how to convert in both directions.
const bytea = customType<{ data: Uint8Array; driverData: Buffer }>({
  dataType: () => "bytea",
  toDriver: (value) => Buffer.from(value),
  fromDriver: (value) => new Uint8Array(value),
});

// An APPEND-ONLY log of every Yjs update, per document (room).
//
//   id | doc_name        | update (bytes) | created_at
//   1  | household-demo  | <binary>       | 2026-11-17 10:00:01
//   2  | household-demo  | <binary>       | 2026-11-17 10:00:04
//
// We never UPDATE or DELETE rows. To load a document we merge all its updates.
// Why a log instead of "one row with the latest state"?
//   - Every write is a cheap INSERT (no read-modify-write, no race conditions).
//   - We keep the full history, which we'll use for the Time Travel feature.
export const yjsUpdates = pgTable(
  "yjs_updates",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    docName: text("doc_name").notNull(),
    update: bytea("update").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // An index makes "all updates for doc X, in order" fast, even with millions of rows.
  (t) => [index("yjs_updates_doc_name_id_idx").on(t.docName, t.id)]
);
