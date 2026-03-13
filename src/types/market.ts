export interface MarketPrice {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  sell_price_max: number;
  sell_price_max_date: string;
  buy_price_min: number;
  buy_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}

export interface PriceHistory {
  item_id: string;
  location: string;
  quality: number;
  data: PriceHistoryEntry[];
}

export interface PriceHistoryEntry {
  item_count: number;
  avg_price: number;
  timestamp: string;
}

export interface GoldPrice {
  price: number;
  timestamp: string;
}

export type Region = "europe" | "americas" | "asia";

export const REGION_HOSTS: Record<Region, string> = {
  europe: "europe.albion-online-data.com",
  americas: "west.albion-online-data.com",
  asia: "east.albion-online-data.com",
};

export const CITIES = [
  "Caerleon",
  "Bridgewatch",
  "Fort Sterling",
  "Lymhurst",
  "Martlock",
  "Thetford",
  "Black Market",
] as const;

export type City = (typeof CITIES)[number];
