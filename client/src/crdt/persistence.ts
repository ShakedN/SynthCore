import { IndexeddbPersistence } from "y-indexeddb";
import { doc } from "./doc";

// Connect our Y.Doc to IndexedDB, a database built into every browser.
//
// What this one line does:
//   1. On page load: read every saved update from IndexedDB and apply it to `doc`,
//      so the list comes back exactly as you left it.
//   2. From then on: every time `doc` changes (your edits OR changes from other
//      devices), the update is saved to IndexedDB automatically.
//
// "synthcore-list" is the database name. Later each household gets its own name.
export const persistence = new IndexeddbPersistence("synthcore-list", doc);

// A Promise that resolves once the saved data has been loaded into `doc`.
export const whenLoaded: Promise<unknown> = persistence.whenSynced;
