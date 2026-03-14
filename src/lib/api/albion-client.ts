import { Region, REGION_HOSTS } from "@/types/market";
import type { AlbionPriceResponse, AlbionHistoryResponse } from "./types";

const DEFAULT_REGION: Region = "europe";

function getBaseUrl(region: Region = DEFAULT_REGION): string {
  return `https://${REGION_HOSTS[region]}`;
}

export async function fetchPrices(
  itemIds: string[],
  locations: string[],
  region: Region = DEFAULT_REGION,
  qualities: number[] = [1]
): Promise<AlbionPriceResponse[]> {
  const ids = itemIds.join(",");
  const locs = locations.join(",");
  const quals = qualities.join(",");
  const url = `${getBaseUrl(region)}/api/v2/stats/prices/${ids}.json?locations=${locs}&qualities=${quals}`;

  if (url.length > 4096) {
    throw new Error(`URL exceeds 4096 char limit (${url.length}). Reduce batch size.`);
  }

  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) {
    throw new Error(`Albion API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchHistory(
  itemId: string,
  locations: string[],
  region: Region = DEFAULT_REGION
): Promise<AlbionHistoryResponse[]> {
  const locs = locations.join(",");
  const url = `${getBaseUrl(region)}/api/v2/stats/history/${itemId}.json?locations=${locs}&time-scale=6`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) {
    throw new Error(`Albion API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchGoldPrices(
  region: Region = DEFAULT_REGION
): Promise<{ price: number; timestamp: string }[]> {
  const url = `${getBaseUrl(region)}/api/v2/stats/gold.json?count=24`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) {
    throw new Error(`Albion API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
