import { DEFAULT_FEE_PERCENTAGE } from "@/lib/data/constants";

/**
 * Calculate crafting station fee.
 * Fee = itemValue * usageFeePercentage
 * itemValue comes from the recipe's craftingFee field (silver value set by game).
 */
export function calculateCraftingFee(
  itemValue: number,
  feePercentage: number = DEFAULT_FEE_PERCENTAGE
): number {
  return itemValue * feePercentage;
}
