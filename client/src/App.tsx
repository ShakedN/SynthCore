import { useEffect, useState } from "react";
import { useItems } from "./crdt/useItems";
import * as actions from "./crdt/actions";
import { setOnline } from "./crdt/tabSync";
import { whenLoaded } from "./crdt/persistence";
import { AddItemForm } from "./components/AddItemForm";
import { PendingSection } from "./components/PendingSection";
import { ShoppingList } from "./components/ShoppingList";
import { BoughtList } from "./components/BoughtList";
import "./App.css";

export default function App() {
  // Before: const [items, setItems] = useState(...)
  // Now:    the data lives in the Yjs document; this hook just reads it.
  const items = useItems();

  // Wait until the saved list has been read from IndexedDB. Without this, the
  // page would flash "Nothing to buy" for a moment before the items appear.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    whenLoaded.then(() => setLoaded(true));
  }, []);

  // Online/offline switch for the demo (simulates losing signal).
  const [online, setOnlineState] = useState(true);
  function toggleOnline() {
    setOnline(!online);
    setOnlineState(!online);
  }

  // Derived data, exactly as before
  const pending = items.filter((i) => i.status === "pending");
  const approved = items.filter((i) => i.status === "approved");
  const bought = items.filter((i) => i.status === "bought");

  if (!loaded) return <div className="app">Loading your list…</div>;

  return (
    <div className="app">
      <header>
        <h1>SynthCore 🛒</h1>
        <div className="header-actions">
          <button onClick={toggleOnline} className={online ? "online" : "offline"}>
            {online ? "🟢 Online" : "🔴 Offline"}
          </button>
          <button onClick={actions.addRecipe}>+ Add recipe (fake AI)</button>
        </div>
      </header>

      <AddItemForm onAdd={actions.addItem} />
      <PendingSection
        items={pending}
        onApprove={actions.approveItem}
        onApproveRecipe={actions.approveRecipe}
        onDismiss={actions.deleteItem}
      />
      <ShoppingList items={approved} onToggleBought={actions.toggleBought} onDelete={actions.deleteItem} />
      <BoughtList items={bought} onToggleBought={actions.toggleBought} onClear={actions.clearBought} />
    </div>
  );
}
