import { AISLES, type Item } from "../types";

type Props = {
  items: Item[]; // only items with status "approved"
  onToggleBought: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ShoppingList({ items, onToggleBought, onDelete }: Props) {
  return (
    <section className="section">
      <h2>🛒 Shopping List</h2>
      {items.length === 0 && <p className="empty">Nothing to buy 🎉</p>}

      {/* Walk the aisles in store order and show only aisles that have items */}
      {AISLES.map((aisle) => {
        const inAisle = items.filter((i) => i.aisle === aisle);
        if (inAisle.length === 0) return null;
        return (
          <div key={aisle} className="aisle">
            <h3>{aisle}</h3>
            {inAisle.map((item) => (
              <label key={item.id} className="row">
                <span>
                  <input type="checkbox" checked={false} onChange={() => onToggleBought(item.id)} />{" "}
                  {item.name} <small>{item.quantity}</small>
                  {item.recipe && <small className="tag">{item.recipe}</small>}
                </span>
                <button className="row-actions" onClick={() => onDelete(item.id)}>✕</button>
              </label>
            ))}
          </div>
        );
      })}
    </section>
  );
}
