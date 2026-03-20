import { batchFetchPrices } from "@/lib/api/batch-fetcher";
import { priceCache } from "@/lib/cache/price-cache";
import { loadItemsMeta, getItemNames } from "@/lib/data/items";
import { MARKET_TAX, PAGE_SIZE } from "@/lib/data/constants";
import type { ItemMeta } from "@/types/item";
import type { TradeRouteResult, TradeRouteQuery, TradeRouteSortField } from "@/types/trade-route";
import type { Region } from "@/types/market";
import type { AlbionPriceResponse } from "@/lib/api/types";

export interface TradeRouteRankerResult {
  items: TradeRouteResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Filter items based on query parameters.
 */
function filterItems(items: ItemMeta[], query: TradeRouteQuery): ItemMeta[] {
  return items.filter((item) => {
    if (query.tiers?.length && !query.tiers.includes(item.tier)) return false;
    if (query.enchantments?.length && !query.enchantments.includes(item.enchantment)) return false;
    if (query.categories?.length && !query.categories.includes(item.category)) return false;
    return true;
  });
}

/**
 * Sort trade route results by the specified field.
 */
function sortResults(
  results: TradeRouteResult[],
  sortBy: TradeRouteSortField = "profit",
  sortOrder: "asc" | "desc" = "desc"
): TradeRouteResult[] {
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

/**
 * Main trade route ranking function: filter items -> fetch prices -> calculate -> sort -> paginate.
 */
export async function rankTradeRoutes(
  query: TradeRouteQuery,
  region?: Region
): Promise<TradeRouteRankerResult> {
  const allItems = loadItemsMeta();
  const itemNames = getItemNames();
  const filtered = filterItems(allItems, query);

  if (filtered.length === 0) {
    return { items: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0 };
  }

  const itemIds = filtered.map((item) => item.itemId);
  const locations = [query.fromCity, query.toCity];

  // Check cache first
  const cacheKey = `trade-route:${itemIds.sort().join(",")}:${locations.join(",")}`;
  let priceMap = priceCache.get<Map<string, Map<string, AlbionPriceResponse>>>(cacheKey);

  if (!priceMap) {
    priceMap = await batchFetchPrices(itemIds, locations, region);
    priceCache.set(cacheKey, priceMap);
  }

  // Calculate profit for each item
  const results: TradeRouteResult[] = [];
  for (const item of filtered) {
    const itemPrices = priceMap.get(item.itemId);
    if (!itemPrices) continue;

    const fromPriceData = itemPrices.get(query.fromCity);
    const toPriceData = itemPrices.get(query.toCity);

    if (!fromPriceData || !toPriceData) continue;
    if (fromPriceData.sell_price_min <= 0 || toPriceData.sell_price_min <= 0) continue;

    const buyPrice = fromPriceData.sell_price_min;
    const sellPrice = toPriceData.sell_price_min;
    const profit = sellPrice * (1 - MARKET_TAX) - buyPrice;
    const profitMargin = sellPrice > 0 ? profit / sellPrice : 0;

    // Use the oldest date of the two data points
    const lastUpdated =
      fromPriceData.sell_price_min_date < toPriceData.sell_price_min_date
        ? fromPriceData.sell_price_min_date
        : toPriceData.sell_price_min_date;

    results.push({
      itemId: item.itemId,
      name: itemNames.get(item.itemId) ?? item.itemId,
      tier: item.tier,
      enchantment: item.enchantment,
      category: item.category,
      subcategory: item.subcategory,
      fromCity: query.fromCity,
      toCity: query.toCity,
      buyPrice,
      sellPrice,
      profit,
      profitMargin,
      lastUpdated,
    });
  }

  // Filter out non-profitable items
  let filtered2 = results.filter((r) => r.profit > 0);

  // Apply minProfit filter
  if (query.minProfit) {
    filtered2 = filtered2.filter((r) => r.profit >= query.minProfit!);
  }

  // Apply maxAge filter
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
  const pageSize = PAGE_SIZE;
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
