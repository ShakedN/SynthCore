import * as Y from "yjs";

// A Y.Doc is ONE shared CRDT document. Every tab and device has its own copy,
// and Yjs knows how to merge the copies.
export const doc = new Y.Doc();

// Inside the doc we keep a Y.Map called "items":
//   items = {
//     "<item id>": Y.Map { name, quantity, aisle, status, recipe, createdAt },
//     ...
//   }
// Each item is its OWN nested Y.Map, so two people can change DIFFERENT fields
// of the same item (one changes status, the other changes quantity) and both
// changes are kept.
export const itemsMap = doc.getMap<Y.Map<unknown>>("items");
