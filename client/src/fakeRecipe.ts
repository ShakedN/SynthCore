import type { Aisle } from "@synthcore/shared";

// A stand-in for the AI. In Step 6 a real server will return data in this exact
// shape after reading a recipe video. Building against a fake first lets us finish
// the UI without waiting for the AI part.
export type ExtractedIngredient = { name: string; quantity: string; aisle: Aisle };

export const FAKE_RECIPE: { title: string; ingredients: ExtractedIngredient[] } = {
  title: "🍝 Rosé Pasta",
  ingredients: [
    { name: "Penne pasta", quantity: "500g", aisle: "Dry Goods" },
    { name: "Heavy cream", quantity: "250ml", aisle: "Dairy" },
    { name: "Tomato paste", quantity: "1 can", aisle: "Dry Goods" },
    { name: "Garlic", quantity: "4 cloves", aisle: "Produce" },
    { name: "Onion", quantity: "1", aisle: "Produce" },
    { name: "Parmesan", quantity: "100g", aisle: "Dairy" },
    { name: "Basil", quantity: "1 bunch", aisle: "Produce" },
    { name: "Olive oil", quantity: "2 tbsp", aisle: "Dry Goods" },
    { name: "Chili flakes", quantity: "1 tsp", aisle: "Dry Goods" },
  ],
};
