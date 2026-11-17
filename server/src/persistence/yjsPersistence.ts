import * as Y from "yjs";
import type { DocStore } from "./docStore.js";

// A marker so we can tell "this update came from the database" apart from
// "this update came from a device". (Same idea as origin === "remote" in Step 2.)
const FROM_DB = Symbol("from-db");

// Connects the sync server's in-memory docs to Postgres.
// The sync server calls bindState() the first time a room is opened.
export function createYjsPersistence(store: DocStore) {
  // Writes that have started but not finished. Lets us wait for them on
  // shutdown so no update is lost, and lets tests wait for them too.
  const pending = new Set<Promise<void>>();

  function track(p: Promise<void>) {
    pending.add(p);
    p.finally(() => pending.delete(p));
  }

  return {
    provider: null,

    async bindState(docName: string, ydoc: Y.Doc) {
      // 1. Start listening BEFORE loading. If a device sends an update while
      //    we're still reading from the database, we must not miss it.
      ydoc.on("update", (update: Uint8Array, origin: unknown) => {
        if (origin === FROM_DB) return; // already in the database, don't save twice
        track(
          store.append(docName, update).catch((err) => {
            console.error(`[db] failed to save update for "${docName}"`, err);
          })
        );
      });

      // 2. Load what's saved and merge it in. Devices that are already
      //    connected receive it through normal sync.
      const saved = await store.load(docName);
      if (saved) Y.applyUpdate(ydoc, saved, FROM_DB);
    },

    // Called when the last device leaves a room. Every update was already
    // saved as it arrived, so there's nothing left to do.
    async writeState() {},

    /** Resolves when every in-flight write has finished. */
    async flush() {
      await Promise.all([...pending]);
    },
  };
}
