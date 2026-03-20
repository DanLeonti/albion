import { batchFetchPrices } from "@/lib/api/batch-fetcher";
import { priceCache } from "@/lib/cache/price-cache";
import { loadItemsMeta, getItemNames } from "@/lib/data/items";
import { findBestFlip } from "./flip-calculator";
import { PAGE_SIZE } from "@/lib/data/constants";
import { CITIES, type Region } from "@/types/market";
import type { AlbionPriceResponse } from "@/lib/api/types";
import type { FlipResult, FlipQuery, FlipSortField } from "@/types/flip";

export interface FlipRankerResult {
  items: FlipResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function sortResults(
  results: FlipResult[],
  sortBy: FlipSortField = "profit",
  sortOrder: "asc" | "desc" = "desc"
): FlipResult[] {
  return results.sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;
    switch (sortBy) {
      case "profit": aVal = a.profit; bVal = b.profit; break;
      case "profitMargin": aVal = a.profitMargin; bVal = b.profitMargin; break;
      case "buyPrice": aVal = a.buyPrice; bVal = b.buyPrice; break;
      case "sellPrice": aVal = a.sellPrice; bVal = b.sellPrice; break;
      case "name": aVal = a.name; bVal = b.name; break;
      default: aVal = a.profit; bVal = b.profit;
    }
    if (typeof aVal === "string") {
      return sortOrder === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
    }
    return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });
}

export async function rankFlips(
  query: FlipQuery,
  region?: Region
): Promise<FlipRankerResult> {
  const allItems = loadItemsMeta();
  const itemNames = getItemNames();

  // Filter items by tier, enchantment, category
  let filtered = allItems;
  if (query.tiers?.length) {
    filtered = filtered.filter((i) => query.tiers!.includes(i.tier));
  }
  if (query.enchantments?.length) {
    filtered = filtered.filter((i) => query.enchantments!.includes(i.enchantment));
  }
  if (query.categories?.length) {
    filtered = filtered.filter((i) => query.categories!.includes(i.category));
  }
  if (query.search) {
    const terms = query.search.toLowerCase().split(/\s+/);
    filtered = filtered.filter((i) => {
      const name = (itemNames.get(i.itemId) ?? i.itemId).toLowerCase();
      return terms.every((t) => name.includes(t));
    });
  }

  if (filtered.length === 0) {
    return { items: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0 };
  }

  const itemIds = filtered.map((i) => i.itemId);
  const locations = [...CITIES];

  // Check cache
  const cacheKey = `flip-prices:${itemIds.sort().join(",")}:${locations.join(",")}`;
  let priceMap = priceCache.get<Map<string, Map<string, AlbionPriceResponse>>>(cacheKey);

  if (!priceMap) {
    priceMap = await batchFetchPrices(itemIds, locations, region);
    priceCache.set(cacheKey, priceMap);
  }

  const buyCities = query.buyCities?.length ? query.buyCities : [...CITIES].filter(c => c !== "Black Market");
  const sellCities = query.sellCities?.length ? query.sellCities : [...CITIES];

  // Calculate flips
  const results: FlipResult[] = [];
  for (const item of filtered) {
    const cityPrices = priceMap.get(item.itemId);
    if (!cityPrices) continue;

    const flip = findBestFlip(
      item.itemId,
      itemNames.get(item.itemId) ?? item.itemId,
      item.tier,
      item.enchantment,
      item.category,
      item.subcategory,
      cityPrices,
      buyCities,
      sellCities
    );
    if (flip) results.push(flip);
  }

  // Filter by min profit / margin
  let filtered2 = results;
  if (query.minProfit) {
    filtered2 = filtered2.filter((r) => r.profit >= query.minProfit!);
  }
  if (query.minMargin) {
    filtered2 = filtered2.filter((r) => r.profitMargin >= query.minMargin!);
  }

  // Filter by max age
  if (query.maxAge) {
    filtered2 = filtered2.filter((r) => {
      const ageMs = Date.now() - new Date(r.lastUpdated).getTime();
      const ageHours = ageMs / (1000 * 60 * 60);
      return ageHours <= query.maxAge!;
    });
  }

  // Sort
  const sorted = sortResults(filtered2, query.sortBy, query.sortOrder);

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
