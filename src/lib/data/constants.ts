/** Market tax applied when selling items (6.5%) */
export const MARKET_TAX = 0.065;

/** Base resource return rate without focus (15.2%) */
export const BASE_RETURN_RATE = 0.152;

/** Resource return rate with focus (43.5%) */
export const FOCUS_RETURN_RATE = 0.435;

/** Default crafting station usage fee percentage */
export const DEFAULT_FEE_PERCENTAGE = 0.03;

/** City bonus multiplier for return rate */
export const CITY_BONUS_RETURN_MULTIPLIER = 1.15;

/** Number of items per page in dashboard */
export const PAGE_SIZE = 50;

/** Cache TTL in milliseconds (30 seconds) */
export const CACHE_TTL = 30 * 1000;

/** Max items per API batch request (~120 to stay under 4096 URL chars) */
export const BATCH_SIZE = 120;

/** Max concurrent API requests */
export const MAX_CONCURRENCY = 5;

/** All tier numbers available */
export const TIERS = [2, 3, 4, 5, 6, 7, 8] as const;

/** Enchantment levels */
export const ENCHANTMENTS = [0, 1, 2, 3, 4] as const;

/** Item categories for filtering */
export const CATEGORIES = [
  "weapon",
  "armor",
  "accessory",
  "consumable",
  "material",
  "mount",
  "tool",
  "offhand",
  "bag",
  "cape",
] as const;

export type Category = (typeof CATEGORIES)[number];
