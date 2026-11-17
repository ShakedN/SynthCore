import * as Y from "yjs";
import { doc, itemsMap } from "./doc";
import type { Aisle, ItemStatus } from "../types";
import { FAKE_RECIPE } from "../fakeRecipe";

// These replace the 7 functions that used to live in App.tsx.
// Before: build a new array and call setItems(...)
// Now:    edit the Y.Doc directly. Yjs records each edit as a small "update"
//         that can be sent to other devices and merged.

function createItem(fields: {
  name: string;
  quantity: string;
  aisle: Aisle;
  status: ItemStatus;
  recipe?: string;
}) {
  const id = crypto.randomUUID();
  const item = new Y.Map<unknown>();
  item.set("id", id);
  item.set("name", fields.name);
  item.set("quantity", fields.quantity);
  item.set("aisle", fields.aisle);
  item.set("status", fields.status);
  if (fields.recipe) item.set("recipe", fields.recipe);
  item.set("createdAt", Date.now());
  itemsMap.set(id, item);
}

export function addItem(name: string, quantity: string, aisle: Aisle) {
  createItem({ name, quantity, aisle, status: "approved" });
}

export function addRecipe() {
  // transact = group many edits into ONE update (one message, one re-render)
  doc.transact(() => {
    for (const ing of FAKE_RECIPE.ingredients) {
      createItem({ ...ing, status: "pending", recipe: FAKE_RECIPE.title });
    }
  });
}

export function approveItem(id: string) {
  itemsMap.get(id)?.set("status", "approved"); // change ONE field only
}

export function approveRecipe(recipe: string) {
  doc.transact(() => {
    itemsMap.forEach((item) => {
      if (item.get("status") === "pending" && item.get("recipe") === recipe) {
        item.set("status", "approved");
      }
    });
  });
}

export function toggleBought(id: string) {
  const item = itemsMap.get(id);
  if (!item) return;
  item.set("status", item.get("status") === "bought" ? "approved" : "bought");
}

export function deleteItem(id: string) {
  itemsMap.delete(id);
}

export function clearBought() {
  doc.transact(() => {
    itemsMap.forEach((item, id) => {
      if (item.get("status") === "bought") itemsMap.delete(id);
    });
  });
}
