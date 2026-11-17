import { useEffect, useState } from "react";
import { useItems } from "./crdt/useItems";
import * as actions from "./crdt/actions";
import { setOnline } from "./crdt/sync";
import { useSyncStatus } from "./crdt/useSyncStatus";
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

  // The REAL connection state, reported by the WebSocket provider.
  const status = useSyncStatus();

  // Whether the user WANTS to be online (the button simulates losing signal).
  const [wantOnline, setWantOnline] = useState(true);
  function toggleOnline() {
    setOnline(!wantOnline);
    setWantOnline(!wantOnline);
  }
  const statusLabel = !wantOnline
    ? "🔴 Offline"
    : status === "connected"
      ? "🟢 Synced"
      : "🟡 Connecting…"; // e.g. the server isn't running

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
          <button
            onClick={toggleOnline}
            className={status === "connected" && wantOnline ? "online" : "offline"}
            title="Click to simulate losing signal"
          >
            {statusLabel}
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
