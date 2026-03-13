import type { Recipe, RecipeTreeNode } from "@/types/item";
import type { ProfitResult } from "@/types/profit";
import type { AlbionPriceResponse } from "@/lib/api/types";
import { calculateProfit, type CalculationOptions } from "./profit-calculator";

type GetRecipe = (itemId: string) => Recipe | undefined;
type PriceMap = Map<string, Map<string, AlbionPriceResponse>>;
type ItemNameMap = Map<string, string>;

const MAX_DEPTH = 10;

/**
 * Recursively collect all item IDs in the crafting tree.
 * Returns a flat deduplicated list for batch price fetching.
 */
export function collectAllItemIds(
  itemId: string,
  getRecipe: GetRecipe,
  visited: Set<string> = new Set()
): string[] {
  if (visited.has(itemId)) return [];
  visited.add(itemId);

  const ids: string[] = [itemId];
  const recipe = getRecipe(itemId);
  if (!recipe) return ids;

  for (const mat of recipe.craftingRequirements) {
    ids.push(...collectAllItemIds(mat.itemId, getRecipe, visited));
  }

  return ids;
}

/**
 * Build a recursive recipe tree with profit data at every node.
 */
export function buildRecipeTree(
  itemId: string,
  quantity: number,
  depth: number,
  getRecipe: GetRecipe,
  prices: PriceMap,
  itemNames: ItemNameMap,
  options: CalculationOptions,
  visited: Set<string> = new Set()
): RecipeTreeNode {
  const recipe = getRecipe(itemId);
  const name = itemNames.get(itemId) ?? itemId;

  // Get market price (sell_price_min = cost to buy this item)
  const itemPriceMap = prices.get(itemId);
  let marketPrice: number | null = null;
  if (itemPriceMap) {
    // Try craft city first, then find cheapest
    const cityPrice = itemPriceMap.get(options.city);
    if (cityPrice && cityPrice.sell_price_min > 0) {
      marketPrice = cityPrice.sell_price_min;
    } else {
      let minPrice = Infinity;
      for (const [, p] of itemPriceMap) {
        if (p.sell_price_min > 0 && p.sell_price_min < minPrice) {
          minPrice = p.sell_price_min;
        }
      }
      if (minPrice < Infinity) marketPrice = minPrice;
    }
  }

  // Leaf node: no recipe, cycle detected, or max depth
  if (!recipe || visited.has(itemId) || depth >= MAX_DEPTH) {
    return {
      itemId,
      name,
      quantity,
      recipe: undefined,
      profit: null,
      marketPrice,
      craftCost: null,
      children: [],
      isRaw: !recipe,
      depth,
    };
  }

  visited.add(itemId);

  // Calculate profit for this node
  let profitResult: ProfitResult | null = null;
  let craftCost: number | null = null;
  try {
    profitResult = calculateProfit(recipe, prices, itemNames, options);
    if (profitResult) {
      craftCost = profitResult.materialCostAfterReturn + profitResult.craftingFee;
    }
  } catch {
    // profit calc failed, leave as null
  }

  // Recurse into children
  const children: RecipeTreeNode[] = recipe.craftingRequirements.map((mat) =>
    buildRecipeTree(
      mat.itemId,
      mat.count,
      depth + 1,
      getRecipe,
      prices,
      itemNames,
      options,
      new Set(visited) // copy so siblings don't block each other
    )
  );

  return {
    itemId,
    name,
    quantity,
    recipe,
    profit: profitResult,
    marketPrice,
    craftCost,
    children,
    isRaw: false,
    depth,
  };
}
