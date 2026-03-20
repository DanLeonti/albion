import { MARKET_TAX } from "@/lib/data/constants";
import type { AlbionPriceResponse } from "@/lib/api/types";
import type { FlipResult } from "@/types/flip";

/**
 * Find the best flip opportunity for an item across cities.
 * Buy at the lowest sell_price_min in buy cities, sell at the highest sell_price_min in sell cities.
 * Profit = sellPrice * (1 - MARKET_TAX) - buyPrice
 */
export function findBestFlip(
  itemId: string,
  name: string,
  tier: number,
  enchantment: number,
  category: string,
  subcategory: string,
  cityPrices: Map<string, AlbionPriceResponse>,
  buyCities: string[],
  sellCities: string[]
): FlipResult | null {
  let bestBuyCity = "";
  let bestBuyPrice = Infinity;
  let bestBuyDate = "";

  let bestSellCity = "";
  let bestSellPrice = 0;
  let bestSellDate = "";

  for (const city of buyCities) {
    const price = cityPrices.get(city);
    if (price && price.sell_price_min > 0 && price.sell_price_min < bestBuyPrice) {
      bestBuyPrice = price.sell_price_min;
      bestBuyCity = city;
      bestBuyDate = price.sell_price_min_date;
    }
  }

  for (const city of sellCities) {
    const price = cityPrices.get(city);
    if (price && price.sell_price_min > 0 && price.sell_price_min > bestSellPrice) {
      bestSellPrice = price.sell_price_min;
      bestSellCity = city;
      bestSellDate = price.sell_price_min_date;
    }
  }

  if (!bestBuyCity || !bestSellCity || bestBuyCity === bestSellCity) return null;
  if (bestBuyPrice >= bestSellPrice) return null;

  const profit = bestSellPrice * (1 - MARKET_TAX) - bestBuyPrice;
  if (profit <= 0) return null;

  const profitMargin = bestSellPrice > 0 ? profit / bestSellPrice : 0;

  // Use oldest date
  const lastUpdated = bestBuyDate < bestSellDate ? bestBuyDate : bestSellDate;

  return {
    itemId,
    name,
    tier,
    enchantment,
    category,
    subcategory,
    buyCity: bestBuyCity,
    buyPrice: bestBuyPrice,
    sellCity: bestSellCity,
    sellPrice: bestSellPrice,
    profit,
    profitMargin,
    lastUpdated,
  };
}
