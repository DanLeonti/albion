export interface TradeRouteResult {
  itemId: string;
  name: string;
  tier: number;
  enchantment: number;
  category: string;
  subcategory: string;
  fromCity: string;
  toCity: string;
  buyPrice: number;  // sell_price_min in fromCity
  sellPrice: number; // sell_price_min in toCity
  profit: number;    // sellPrice * (1 - MARKET_TAX) - buyPrice
  profitMargin: number;
  lastUpdated: string;
}

export interface TradeRouteQuery {
  fromCity: string;
  toCity: string;
  tiers?: number[];
  enchantments?: number[];
  categories?: string[];
  minProfit?: number;
  sortBy?: TradeRouteSortField;
  sortOrder?: "asc" | "desc";
  page?: number;
  maxAge?: number;
}

export type TradeRouteSortField = "profit" | "profitMargin" | "buyPrice" | "sellPrice" | "name";
