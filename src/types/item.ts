export interface CraftingMaterial {
  itemId: string;
  count: number;
}

export interface Recipe {
  itemId: string;
  category: string;
  subcategory: string;
  tier: number;
  enchantment: number;
  craftingRequirements: CraftingMaterial[];
  /** Silver cost defined in recipe (item value for fee calc) */
  craftingFee: number;
  /** Crafting category for city bonus matching */
  craftingCategory: string;
}

export interface ItemMeta {
  itemId: string;
  name: string;
  tier: number;
  enchantment: number;
  category: string;
  subcategory: string;
}

export interface RecipeTreeNode {
  itemId: string;
  name: string;
  quantity: number;
  recipe: Recipe | undefined;
  profit: import("@/types/profit").ProfitResult | null;
  marketPrice: number | null;
  craftCost: number | null;
  children: RecipeTreeNode[];
  isRaw: boolean;
  depth: number;
}
