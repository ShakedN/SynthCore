import { useState } from "react";
import type { Aisle, Item, ItemStatus } from "./types";
import { FAKE_RECIPE } from "./fakeRecipe";
import { AddItemForm } from "./components/AddItemForm";
import { PendingSection } from "./components/PendingSection";
import { ShoppingList } from "./components/ShoppingList";
import { BoughtList } from "./components/BoughtList";
import "./App.css";

const initialItems: Item[] = [
  { id: "1", name: "Milk", quantity: "2", aisle: "Dairy", status: "approved" },
  { id: "2", name: "Bananas", quantity: "6", aisle: "Produce", status: "approved" },
];

export default function App() {
  // ONE flat list of items. The "sections" on screen are just filters by status.
  const [items, setItems] = useState<Item[]>(initialItems);

  // ---- The ONLY functions that change data. In Step 2 we rewrite these 7 to use Yjs. ----

  function addItem(name: string, quantity: string, aisle: Aisle) {
    // Items you type yourself skip approval and go straight to the list.
    const item: Item = { id: crypto.randomUUID(), name, quantity, aisle, status: "approved" };
    setItems((prev) => [...prev, item]);
  }

  function addRecipe() {
    const newItems: Item[] = FAKE_RECIPE.ingredients.map((ing) => ({
      id: crypto.randomUUID(),
      ...ing,
      status: "pending",
      recipe: FAKE_RECIPE.title,
    }));
    setItems((prev) => [...prev, ...newItems]);
  }

  // Helper: return a copy of the list with one item's status changed.
  function setStatus(id: string, status: ItemStatus) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  const approveItem = (id: string) => setStatus(id, "approved");

  function approveRecipe(recipe: string) {
    setItems((prev) =>
      prev.map((i) => (i.status === "pending" && i.recipe === recipe ? { ...i, status: "approved" } : i))
    );
  }

  function toggleBought(id: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: i.status === "bought" ? "approved" : "bought" } : i))
    );
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearBought() {
    setItems((prev) => prev.filter((i) => i.status !== "bought"));
  }

  // ---- Derived data: computed from `items` on every render, never stored separately ----
  const pending = items.filter((i) => i.status === "pending");
  const approved = items.filter((i) => i.status === "approved");
  const bought = items.filter((i) => i.status === "bought");

  return (
    <div className="app">
      <header>
        <h1>SynthCore 🛒</h1>
        <button onClick={addRecipe}>+ Add recipe (fake AI)</button>
      </header>

      <AddItemForm onAdd={addItem} />
      <PendingSection items={pending} onApprove={approveItem} onApproveRecipe={approveRecipe} onDismiss={deleteItem} />
      <ShoppingList items={approved} onToggleBought={toggleBought} onDelete={deleteItem} />
      <BoughtList items={bought} onToggleBought={toggleBought} onClear={clearBought} />
    </div>
  );
}
