import { MARKET_TAX } from "@/lib/data/constants";
import { calculateReturnRate } from "./return-rate";
import { calculateCraftingFee } from "./crafting-fee";
import type { Recipe } from "@/types/item";
import type { ProfitResult, MaterialCost } from "@/types/profit";
import type { AlbionPriceResponse } from "@/lib/api/types";

interface PriceMap {
  get(itemId: string): Map<string, AlbionPriceResponse> | undefined;
}

interface ItemNameMap {
  get(itemId: string): string | undefined;
}

export interface CalculationOptions {
  city: string;
  useFocus: boolean;
  feePercentage: number;
  sellCity?: string; // defaults to same as craft city
}

/**
 * Calculate profit for a single recipe given current market prices.
 */
export function calculateProfit(
  recipe: Recipe,
  prices: PriceMap,
  itemNames: ItemNameMap,
  options: CalculationOptions
): ProfitResult | null {
  const { city, useFocus, feePercentage } = options;
  const sellCity = options.sellCity ?? city;

  // Get sell price for crafted item in the selected city
  const itemPrices = prices.get(recipe.itemId);
  if (!itemPrices) return null;

  let sellPriceData: AlbionPriceResponse | undefined;
  let actualSellCity = sellCity;

  // Use selected city price
  const cityPrice = itemPrices.get(sellCity);
  if (cityPrice && cityPrice.sell_price_min > 0) {
    sellPriceData = cityPrice;
  }

  // No data for selected city — skip this item
  if (!sellPriceData) return null;

  const sellPrice = sellPriceData.sell_price_min;
  const returnRate = calculateReturnRate(useFocus, city, recipe.craftingCategory);
  const fee = calculateCraftingFee(recipe.craftingFee, feePercentage);
  const taxAmount = sellPrice * MARKET_TAX;

  // Calculate material costs
  const materials: MaterialCost[] = [];
  let totalMaterialCost = 0;
  let oldestDate = sellPriceData.sell_price_min_date;

  for (const mat of recipe.craftingRequirements) {
    const matPrices = prices.get(mat.itemId);
    const bestPrice = matPrices?.get(city);

    if (!bestPrice || bestPrice.sell_price_min <= 0) return null;

    // Track oldest date across all data points
    if (bestPrice.sell_price_min_date < oldestDate) {
      oldestDate = bestPrice.sell_price_min_date;
    }

    const unitPrice = bestPrice.sell_price_min;
    const totalPrice = unitPrice * mat.count;
    totalMaterialCost += totalPrice;

    materials.push({
      itemId: mat.itemId,
      name: itemNames.get(mat.itemId) ?? mat.itemId,
      quantity: mat.count,
      unitPrice,
      totalPrice,
      buyCity: city,
    });
  }

  const materialCostAfterReturn = totalMaterialCost * (1 - returnRate);
  const profit = sellPrice * (1 - MARKET_TAX) - materialCostAfterReturn - fee;
  const profitMargin = sellPrice > 0 ? profit / sellPrice : 0;

  return {
    itemId: recipe.itemId,
    name: itemNames.get(recipe.itemId) ?? recipe.itemId,
    isArtifact: recipe.itemId.includes("ARTEFACT") || /^T\d_(RUNE|SOUL|RELIC|SHARD_AVALONIAN)$/.test(recipe.itemId) || recipe.itemId.endsWith("_BP") || recipe.itemId.endsWith("_MAP"),
    tier: recipe.tier,
    enchantment: recipe.enchantment,
    category: recipe.category,
    subcategory: recipe.subcategory,
    sellPrice,
    sellCity: actualSellCity,
    materialCost: totalMaterialCost,
    materialCostAfterReturn,
    craftingFee: fee,
    marketTax: taxAmount,
    profit,
    profitMargin,
    dailyVolume: 0, // Would need history API data
    silverPerHour: null,
    materials,
    lastUpdated: oldestDate,
  };
}
