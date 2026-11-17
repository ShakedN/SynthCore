import { useEffect, useState } from "react";
import { itemsMap } from "./doc";
import type { Item } from "../types";

// Turn the Yjs data into a plain array that React components understand.
function readItems(): Item[] {
  return Array.from(itemsMap.values())
    .map((m) => m.toJSON() as Item)
    .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
}

// A custom hook: "give me the items, and re-render me whenever they change".
// It doesn't care WHO changed them (this tab or another device). Any change
// to the Y.Doc triggers a re-render.
export function useItems(): Item[] {
  const [items, setItems] = useState<Item[]>(readItems);

  useEffect(() => {
    const onChange = () => setItems(readItems());
    itemsMap.observeDeep(onChange); // listen to changes anywhere inside "items"
    return () => itemsMap.unobserveDeep(onChange); // stop listening on unmount
  }, []);

  return items;
}
