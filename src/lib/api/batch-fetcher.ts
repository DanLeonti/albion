import { fetchPrices } from "./albion-client";
import type { AlbionPriceResponse } from "./types";
import { BATCH_SIZE, MAX_CONCURRENCY } from "@/lib/data/constants";
import type { Region } from "@/types/market";

/**
 * Split item IDs into batches that fit within URL length limits.
 * Each batch targets ~120 items to stay under 4096 char URLs.
 */
export function createBatches(itemIds: string[], batchSize: number = BATCH_SIZE): string[][] {
  const batches: string[][] = [];
  for (let i = 0; i < itemIds.length; i += batchSize) {
    batches.push(itemIds.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Fetch prices for many items with automatic batching and concurrency control.
 */
export async function batchFetchPrices(
  itemIds: string[],
  locations: string[],
  region?: Region,
  qualities?: number[]
): Promise<Map<string, Map<string, AlbionPriceResponse>>> {
  const uniqueIds = [...new Set(itemIds)];
  const batches = createBatches(uniqueIds);
  const results = new Map<string, Map<string, AlbionPriceResponse>>();

  // Process batches with concurrency limit
  for (let i = 0; i < batches.length; i += MAX_CONCURRENCY) {
    const chunk = batches.slice(i, i + MAX_CONCURRENCY);
    const responses = await Promise.all(
      chunk.map((batch) => fetchPrices(batch, locations, region, qualities).catch(() => [] as AlbionPriceResponse[]))
    );

    for (const batch of responses) {
      for (const price of batch) {
        if (!results.has(price.item_id)) {
          results.set(price.item_id, new Map());
        }
        results.get(price.item_id)!.set(price.city, price);
      }
    }
  }

  return results;
}
