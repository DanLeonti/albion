import { BASE_RETURN_RATE, FOCUS_RETURN_RATE, CITY_BONUS_RETURN_MULTIPLIER } from "@/lib/data/constants";
import { hasCityBonus } from "@/lib/data/city-bonuses";

/**
 * Calculate the effective resource return rate.
 * Base: 15.2%, Focus: 43.5%, City bonus: x1.15
 */
export function calculateReturnRate(
  useFocus: boolean,
  city: string,
  craftingCategory: string
): number {
  const baseRate = useFocus ? FOCUS_RETURN_RATE : BASE_RETURN_RATE;
  const hasBonus = hasCityBonus(city, craftingCategory);
  return hasBonus ? baseRate * CITY_BONUS_RETURN_MULTIPLIER : baseRate;
}
