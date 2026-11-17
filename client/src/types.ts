// The supermarket aisles, in the order you walk through the store.
// "as const" makes TypeScript treat this as a fixed list of exact strings.
export const AISLES = [
  "Produce",
  "Bakery",
  "Dairy",
  "Meat & Fish",
  "Dry Goods",
  "Frozen",
  "Drinks",
  "Household",
  "Other",
] as const;

// Aisle = one of the strings above ("Produce" | "Bakery" | ...).
export type Aisle = (typeof AISLES)[number];

// Every item is in exactly one of these 3 stages.
export type ItemStatus = "pending" | "approved" | "bought";

export type Item = {
  id: string;
  name: string;
  quantity: string; // free text for now: "2", "200g", "1 pack"
  aisle: Aisle;
  status: ItemStatus;
  recipe?: string; // "?" = optional. Only items that came from a recipe have it.
  createdAt: number; // timestamp, used to keep the same order on every device
};
