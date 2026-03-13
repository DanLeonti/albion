export interface AlbionPriceResponse {
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

export interface AlbionHistoryResponse {
  item_id: string;
  location: string;
  quality: number;
  data: {
    item_count: number;
    avg_price: number;
    timestamp: string;
  }[];
}
