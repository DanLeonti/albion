export interface FlipResult {
  itemId: string;
  name: string;
  tier: number;
  enchantment: number;
  category: string;
  subcategory: string;
  buyCity: string;
  buyPrice: number;
  sellCity: string;
  sellPrice: number;
  profit: number;
  profitMargin: number;
  /** Oldest price data timestamp */
  lastUpdated: string;
}

export interface FlipQuery {
  tiers?: number[];
  enchantments?: number[];
  categories?: string[];
  buyCities?: string[];
  sellCities?: string[];
  minProfit?: number;
  minMargin?: number;
  sortBy?: FlipSortField;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  maxAge?: number;
  search?: string;
}

export type FlipSortField =
  | "profit"
  | "profitMargin"
  | "buyPrice"
  | "sellPrice"
  | "name";
