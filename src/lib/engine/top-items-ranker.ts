import { loadItemsMeta, getItemNames } from "@/lib/data/items";
import { batchFetchPrices } from "@/lib/api/batch-fetcher";
import { CITIES, type Region } from "@/types/market";
import { PAGE_SIZE } from "@/lib/data/constants";
import type { ItemMeta } from "@/types/item";
import type { AlbionPriceResponse } from "@/lib/api/types";

export interface TopItemEntry {
  itemId: string;
  name: string;
  tier: number;
  enchantment: number;
  category: string;
  subcategory: string;
  bestPrice: number;
  bestCity: string;
  lastUpdated: string;
}

export interface TopItemsQuery {
  tiers?: number[];
  enchantments?: number[];
  category?: string;
  sortBy: "price" | "name";
  sortOrder: "asc" | "desc";
  page: number;
}

export interface TopItemsResult {
  items: TopItemEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function rankTopItems(
  query: TopItemsQuery,
  region: Region = "europe"
): Promise<TopItemsResult> {
  let allItems = loadItemsMeta();
  const itemNames = getItemNames();

  // Apply filters
  if (query.tiers?.length) {
    allItems = allItems.filter((i) => query.tiers!.includes(i.tier));
  }
  if (query.enchantments?.length) {
    allItems = allItems.filter((i) => query.enchantments!.includes(i.enchantment));
  }
  if (query.category) {
    allItems = allItems.filter((i) => i.category === query.category);
  }

  const itemIds = allItems.map((i) => i.itemId);
  const locations = [...CITIES];

  // Fetch all prices
  const priceMap = await batchFetchPrices(itemIds, locations, region);

  // Build top items list
  const entries: TopItemEntry[] = [];
  const metaMap = new Map<string, ItemMeta>();
  for (const item of allItems) {
    metaMap.set(item.itemId, item);
  }

  for (const item of allItems) {
    const cityPrices = priceMap.get(item.itemId);
    if (!cityPrices) continue;

    let bestPrice = 0;
    let bestCity = "";
    let lastUpdated = "";

    for (const [city, priceData] of cityPrices) {
      if (priceData.sell_price_min > bestPrice) {
        bestPrice = priceData.sell_price_min;
        bestCity = city;
        lastUpdated = priceData.sell_price_min_date;
      }
    }

    if (bestPrice <= 0) continue;

    entries.push({
      itemId: item.itemId,
      name: itemNames.get(item.itemId) ?? item.itemId,
      tier: item.tier,
      enchantment: item.enchantment,
      category: item.category,
      subcategory: item.subcategory,
      bestPrice,
      bestCity,
      lastUpdated,
    });
  }

  // Sort
  if (query.sortBy === "name") {
    entries.sort((a, b) =>
      query.sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
  } else {
    entries.sort((a, b) =>
      query.sortOrder === "asc"
        ? a.bestPrice - b.bestPrice
        : b.bestPrice - a.bestPrice
    );
  }

  // Paginate
  const total = entries.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const page = Math.max(1, Math.min(query.page, totalPages || 1));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = entries.slice(start, start + PAGE_SIZE);

  return {
    items: pageItems,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}
