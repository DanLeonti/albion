/**
 * Parse an Albion item ID like T4_BAG@1 into components
 */
export interface ParsedItemId {
  tier: number;
  enchantment: number;
  baseId: string;
  fullId: string;
}

export function parseItemId(itemId: string): ParsedItemId {
  const enchantMatch = itemId.match(/@(\d+)$/);
  const enchantment = enchantMatch ? parseInt(enchantMatch[1]) : 0;
  const baseWithoutEnchant = enchantMatch ? itemId.slice(0, -enchantMatch[0].length) : itemId;

  const tierMatch = baseWithoutEnchant.match(/^T(\d+)_/);
  const tier = tierMatch ? parseInt(tierMatch[1]) : 0;

  return {
    tier,
    enchantment,
    baseId: baseWithoutEnchant,
    fullId: itemId,
  };
}

/**
 * Build an item ID from components
 */
export function buildItemId(baseId: string, enchantment: number): string {
  if (enchantment === 0) return baseId;
  return `${baseId}@${enchantment}`;
}

/**
 * Get display tier string like "T4.1"
 */
export function tierDisplay(tier: number, enchantment: number): string {
  if (enchantment === 0) return `T${tier}`;
  return `T${tier}.${enchantment}`;
}

/**
 * Get the tier color for UI display
 */
export function tierColor(tier: number): string {
  const colors: Record<number, string> = {
    2: "#b0b0b0",
    3: "#51a842",
    4: "#3b8ed0",
    5: "#a335ee",
    6: "#ff8000",
    7: "#e6cc80",
    8: "#e6cc80",
  };
  return colors[tier] ?? "#ffffff";
}
