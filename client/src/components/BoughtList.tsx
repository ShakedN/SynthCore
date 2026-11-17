import type { Item } from "@synthcore/shared";

type Props = {
  items: Item[]; // only items with status "bought"
  onToggleBought: (id: string) => void;
  onClear: () => void;
};

export function BoughtList({ items, onToggleBought, onClear }: Props) {
  if (items.length === 0) return null;
  return (
    <section className="section bought">
      <div className="recipe-header">
        <h2>✅ Bought ({items.length})</h2>
        <button onClick={onClear}>Clear</button>
      </div>
      {items.map((item) => (
        <label key={item.id} className="row">
          <span>
            <input type="checkbox" checked onChange={() => onToggleBought(item.id)} />{" "}
            <s>{item.name}</s> <small>{item.quantity}</small>
          </span>
        </label>
      ))}
    </section>
  );
}
