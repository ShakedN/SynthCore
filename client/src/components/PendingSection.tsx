import type { Item } from "../types";

type Props = {
  items: Item[]; // only items with status "pending"
  onApprove: (id: string) => void;
  onApproveRecipe: (recipe: string) => void;
  onDismiss: (id: string) => void;
};

export function PendingSection({ items, onApprove, onApproveRecipe, onDismiss }: Props) {
  if (items.length === 0) return null; // nothing pending → draw nothing

  // Group the items by recipe name: { "🍝 Rosé Pasta": [item, item, ...] }
  const groups: Record<string, Item[]> = {};
  for (const item of items) {
    const key = item.recipe ?? "Other"; // ?? = "if undefined, use this instead"
    (groups[key] ??= []).push(item);
  }

  return (
    <section className="section pending">
      <h2>🕐 Pending Approval</h2>
      {Object.entries(groups).map(([recipe, recipeItems]) => (
        <div key={recipe} className="recipe-group">
          <div className="recipe-header">
            <strong>{recipe}: {recipeItems.length} items</strong>
            <button onClick={() => onApproveRecipe(recipe)}>Approve all</button>
          </div>
          {recipeItems.map((item) => (
            <div key={item.id} className="row">
              <span>
                {item.name} <small>{item.quantity}</small>
              </span>
              <span className="row-actions">
                <button title="I need this" onClick={() => onApprove(item.id)}>✓</button>
                <button title="I have this at home" onClick={() => onDismiss(item.id)}>✕</button>
              </span>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
