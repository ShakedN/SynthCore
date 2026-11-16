import { useState } from "react";
import { AISLES, type Aisle } from "../types";

type Props = {
  onAdd: (name: string, quantity: string, aisle: Aisle) => void;
};

// A "controlled form": each input's value comes from React state,
// and every keystroke updates that state.
export function AddItemForm({ onAdd }: Props) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [aisle, setAisle] = useState<Aisle>("Other");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // stop the page from reloading
    if (name.trim() === "") return;
    onAdd(name.trim(), quantity.trim(), aisle);
    setName("");
    setQuantity("");
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add an item…" />
      <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Qty" className="qty" />
      <select value={aisle} onChange={(e) => setAisle(e.target.value as Aisle)}>
        {AISLES.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
      <button type="submit">Add</button>
    </form>
  );
}
