import { calculateProfit, type CalculationOptions } from "./profit-calculator";
import { batchFetchPrices } from "@/lib/api/batch-fetcher";
import { priceCache } from "@/lib/cache/price-cache";
import { loadRecipes } from "@/lib/data/recipes";
import { getItemNames } from "@/lib/data/items";
import type { Recipe } from "@/types/item";
import type { ProfitResult, ProfitQuery, SortField } from "@/types/profit";
import type { Region } from "@/types/market";
import { CITIES, type City } from "@/types/market";
import { PAGE_SIZE } from "@/lib/data/constants";
import type { AlbionPriceResponse } from "@/lib/api/types";

/**
 * Filter recipes based on query parameters.
 */
function filterRecipes(recipes: Recipe[], query: ProfitQuery): Recipe[] {
  return recipes.filter((r) => {
    if (query.tiers?.length && !query.tiers.includes(r.tier)) return false;
    if (query.enchantments?.length && !query.enchantments.includes(r.enchantment)) return false;
    if (query.categories?.length && !query.categories.includes(r.category)) return false;
    if (query.unlocks && Object.keys(query.unlocks).length > 0) {
      const maxTier = query.unlocks[r.subcategory];
      if (maxTier === undefined || r.tier > maxTier) return false;
    }
    return true;
  });
}

/**
 * Collect all unique item IDs needed for price lookups.
 */
function collectItemIds(recipes: Recipe[]): string[] {
  const ids = new Set<string>();
  for (const recipe of recipes) {
    ids.add(recipe.itemId);
    for (const mat of recipe.craftingRequirements) {
      ids.add(mat.itemId);
    }
  }
  return [...ids];
}

/**
 * Sort profit results by the specified field.
 */
function sortResults(
  results: ProfitResult[],
  sortBy: SortField = "profit",
  sortOrder: "asc" | "desc" = "desc"
): ProfitResult[] {
  return results.sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;
    switch (sortBy) {
      case "profit": aVal = a.profit; bVal = b.profit; break;
      case "profitMargin": aVal = a.profitMargin; bVal = b.profitMargin; break;
      case "sellPrice": aVal = a.sellPrice; bVal = b.sellPrice; break;
      case "materialCost": aVal = a.materialCost; bVal = b.materialCost; break;
      case "dailyVolume": aVal = a.dailyVolume; bVal = b.dailyVolume; break;
      case "silverPerHour": aVal = a.silverPerHour ?? 0; bVal = b.silverPerHour ?? 0; break;
      case "name": aVal = a.name; bVal = b.name; break;
      default: aVal = a.profit; bVal = b.profit;
    }
    if (typeof aVal === "string") {
      return sortOrder === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
    }
    return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });
}

export interface RankerResult {
  items: ProfitResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Main ranking function: filter -> fetch prices -> calculate -> sort -> paginate.
 */
export async function rankProfits(
  query: ProfitQuery,
  region?: Region
): Promise<RankerResult> {
  const allRecipes = loadRecipes();
  const itemNames = getItemNames();
  const filtered = filterRecipes(allRecipes, query);

  if (filtered.length === 0) {
    return { items: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0 };
  }

  // Collect all item IDs we need prices for
  const allItemIds = collectItemIds(filtered);
  const city = query.city ?? "Caerleon";
  const locations = [...CITIES];

  // Check cache first
  const cacheKey = `prices:${allItemIds.sort().join(",")}:${locations.join(",")}`;
  let priceMap = priceCache.get<Map<string, Map<string, AlbionPriceResponse>>>(cacheKey);

  if (!priceMap) {
    priceMap = await batchFetchPrices(allItemIds, locations, region);
    priceCache.set(cacheKey, priceMap);
  }

  // Calculate profits
  const calcOptions: CalculationOptions = {
    city,
    useFocus: query.useFocus ?? false,
    feePercentage: query.feePercentage ?? 0.03,
  };

  const results: ProfitResult[] = [];
  for (const recipe of filtered) {
    const result = calculateProfit(recipe, priceMap, itemNames, calcOptions);
    if (result) {
      results.push(result);
    }
  }

  // Sort
  const sorted = sortResults(results, query.sortBy, query.sortOrder);

  // Paginate
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? PAGE_SIZE;
  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  return {
    items: paginated,
    total: sorted.length,
    page,
    pageSize,
    totalPages: Math.ceil(sorted.length / pageSize),
  };
}
