/**
 * City crafting bonuses - each royal city gives a return rate bonus
 * for specific crafting categories.
 */

export interface CityBonus {
  city: string;
  categories: string[];
}

export const CITY_BONUSES: CityBonus[] = [
  {
    city: "Martlock",
    categories: ["ranged", "leather_armor", "leather_shoes", "leather_head"],
  },
  {
    city: "Lymhurst",
    categories: ["arcane", "curse", "fire", "frost", "holy", "nature", "cloth_armor", "cloth_shoes", "cloth_head"],
  },
  {
    city: "Bridgewatch",
    categories: ["crossbow", "dagger", "spear", "plate_shoes"],
  },
  {
    city: "Fort Sterling",
    categories: ["hammer", "mace", "sword", "plate_armor", "plate_head"],
  },
  {
    city: "Thetford",
    categories: ["axe", "quarterstaff", "cape", "bag", "offhand"],
  },
  {
    city: "Caerleon",
    categories: [], // No specific bonus but access to Black Market
  },
];

/**
 * Check if a city provides a crafting bonus for a given category
 */
export function hasCityBonus(city: string, craftingCategory: string): boolean {
  const bonus = CITY_BONUSES.find((b) => b.city === city);
  if (!bonus) return false;
  return bonus.categories.some(
    (c) => craftingCategory.toLowerCase().includes(c) || c.includes(craftingCategory.toLowerCase())
  );
}
