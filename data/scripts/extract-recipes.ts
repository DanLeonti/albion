/**
 * Extract crafting recipes from ao-bin-dumps.
 * Run: npx tsx data/scripts/extract-recipes.ts
 *
 * Fetches items.json and formatted/items.json from github.com/ao-data/ao-bin-dumps,
 * parses craftingrequirements, and outputs:
 * - data/recipes.json
 * - data/items-meta.json
 */

import * as fs from "fs";
import * as path from "path";

const ITEMS_URL =
  "https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json";
const LOCALIZED_URL =
  "https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json";

// Item categories in the root JSON that contain craftable items
const ITEM_CATEGORIES = [
  "weapon",
  "equipmentitem",
  "simpleitem",
  "consumableitem",
  "consumablefrominventoryitem",
  "farmableitem",
  "mount",
  "furnitureitem",
  "journalitem",
  "labourercontract",
  "trackingitem",
] as const;

interface CraftResource {
  "@uniquename": string;
  "@count": string;
}

interface CraftRequirement {
  "@silver"?: string;
  "@time"?: string;
  "@craftingfocus"?: string;
  craftresource?: CraftResource | CraftResource[];
}

interface RawItem {
  "@uniquename": string;
  "@tier"?: string;
  "@shopcategory"?: string;
  "@shopsubcategory1"?: string;
  "@itemvalue"?: string;
  craftingrequirements?: CraftRequirement | CraftRequirement[];
  enchantments?: {
    enchantment?: EnchantmentEntry | EnchantmentEntry[];
  };
  [key: string]: any;
}

interface EnchantmentEntry {
  "@enchantmentlevel": string;
  craftingrequirements?: CraftRequirement | CraftRequirement[];
  [key: string]: any;
}

interface LocalizedItem {
  LocalizedNames?: Record<string, string>;
  LocalizationNameVariable?: string;
  UniqueName?: string;
  Index?: string;
}

interface Recipe {
  itemId: string;
  category: string;
  subcategory: string;
  tier: number;
  enchantment: number;
  craftingRequirements: { itemId: string; count: number }[];
  craftingFee: number;
  craftingCategory: string;
}

interface ItemMeta {
  itemId: string;
  name: string;
  tier: number;
  enchantment: number;
  category: string;
  subcategory: string;
}

function parseTier(uniqueName: string): number {
  const match = uniqueName.match(/^T(\d+)_/);
  return match ? parseInt(match[1]) : 0;
}

function categorizeFromShop(
  shopCategory: string | undefined,
  shopSubcategory: string | undefined,
  uniqueName: string
): { category: string; subcategory: string; craftingCategory: string } {
  const sc = (shopCategory ?? "").toLowerCase();
  const ss = (shopSubcategory ?? "").toLowerCase();
  const name = uniqueName.toUpperCase();

  // Weapons
  if (sc === "weapons") {
    return { category: "weapon", subcategory: ss || "weapon", craftingCategory: ss || "weapon" };
  }

  // Armor types
  if (sc === "armor" || sc === "offhand" || sc === "accessories") {
    if (name.includes("CLOTH") || ss.includes("cloth"))
      return { category: "armor", subcategory: "cloth", craftingCategory: "cloth_armor" };
    if (name.includes("LEATHER") || ss.includes("leather"))
      return { category: "armor", subcategory: "leather", craftingCategory: "leather_armor" };
    if (name.includes("PLATE") || ss.includes("plate"))
      return { category: "armor", subcategory: "plate", craftingCategory: "plate_armor" };
    if (name.includes("OFF_") || name.includes("SHIELD") || ss.includes("shield") || sc === "offhand")
      return { category: "offhand", subcategory: ss || "offhand", craftingCategory: "offhand" };
    if (name.includes("BAG") || ss.includes("bag"))
      return { category: "bag", subcategory: "bag", craftingCategory: "bag" };
    if (name.includes("CAPE") || ss.includes("cape"))
      return { category: "cape", subcategory: "cape", craftingCategory: "cape" };
    return { category: "armor", subcategory: ss || "armor", craftingCategory: ss || "armor" };
  }

  // Gathering tools
  if (sc === "gathering" || sc === "tools") {
    return { category: "tool", subcategory: ss || "tool", craftingCategory: "tool" };
  }

  // Consumables
  if (sc === "consumables" || sc === "foodandpotions") {
    return { category: "consumable", subcategory: ss || "consumable", craftingCategory: "cooking" };
  }

  // Mounts
  if (sc === "mounts") {
    return { category: "mount", subcategory: ss || "mount", craftingCategory: "mount" };
  }

  // Materials / resources
  if (sc === "resources" || sc === "materials") {
    return { category: "material", subcategory: ss || "material", craftingCategory: "refining" };
  }

  // Furniture
  if (sc === "furniture" || sc === "luxurygoods") {
    return { category: "other", subcategory: ss || "furniture", craftingCategory: "other" };
  }

  // Fallback by name patterns
  if (name.includes("BAG")) return { category: "bag", subcategory: "bag", craftingCategory: "bag" };
  if (name.includes("CAPE")) return { category: "cape", subcategory: "cape", craftingCategory: "cape" };
  if (name.includes("POTION")) return { category: "consumable", subcategory: "potion", craftingCategory: "cooking" };
  if (name.includes("MEAL") || name.includes("STEW") || name.includes("PIE"))
    return { category: "consumable", subcategory: "food", craftingCategory: "cooking" };
  if (name.includes("MOUNT") || name.includes("HORSE") || name.includes("OX"))
    return { category: "mount", subcategory: "mount", craftingCategory: "mount" };
  if (name.includes("METALBAR") || name.includes("PLANKS"))
    return { category: "material", subcategory: "refined", craftingCategory: "refining" };

  return { category: "other", subcategory: ss || "other", craftingCategory: "other" };
}

function extractCraftResources(req: CraftRequirement): { itemId: string; count: number }[] {
  if (!req.craftresource) return [];
  const resources = Array.isArray(req.craftresource) ? req.craftresource : [req.craftresource];
  return resources
    .filter((r) => r["@uniquename"] && r["@count"])
    .map((r) => ({
      itemId: r["@uniquename"],
      count: parseInt(r["@count"]) || 1,
    }));
}

async function main() {
  console.log("Fetching items.json from ao-bin-dumps...");
  const [itemsRes, localizedRes] = await Promise.all([
    fetch(ITEMS_URL),
    fetch(LOCALIZED_URL),
  ]);

  if (!itemsRes.ok) throw new Error(`Failed to fetch items: ${itemsRes.status}`);
  if (!localizedRes.ok) throw new Error(`Failed to fetch localized: ${localizedRes.status}`);

  const rawData = await itemsRes.json();
  const localizedItems: LocalizedItem[] = await localizedRes.json();

  // Build localized name lookup
  const nameMap = new Map<string, string>();
  for (const item of localizedItems) {
    const id = item.UniqueName ?? item.LocalizationNameVariable?.replace("@ITEMS_", "");
    const name = item.LocalizedNames?.["EN-US"];
    if (id && name) {
      nameMap.set(id, name);
    }
  }
  console.log(`Loaded ${nameMap.size} localized names`);

  // Collect all items from the various category arrays
  const allItems: RawItem[] = [];
  const items = rawData.items ?? rawData;

  for (const cat of ITEM_CATEGORIES) {
    const catItems = items[cat];
    if (!catItems) continue;
    const arr = Array.isArray(catItems) ? catItems : [catItems];
    allItems.push(...arr);
  }
  console.log(`Collected ${allItems.length} raw items`);

  const recipes: Recipe[] = [];
  const itemsMeta: ItemMeta[] = [];
  const seenIds = new Set<string>();

  for (const item of allItems) {
    const uniqueName = item["@uniquename"];
    if (!uniqueName) continue;

    const tier = parseTier(uniqueName);
    const name = nameMap.get(uniqueName) ?? uniqueName;
    const shopCat = item["@shopcategory"];
    const shopSub = item["@shopsubcategory1"];

    // Add to items-meta
    if (!seenIds.has(uniqueName)) {
      seenIds.add(uniqueName);
      const { category, subcategory } = categorizeFromShop(shopCat, shopSub, uniqueName);
      itemsMeta.push({
        itemId: uniqueName,
        name,
        tier,
        enchantment: 0,
        category,
        subcategory,
      });
    }

    // Extract base crafting requirements
    if (item.craftingrequirements) {
      const reqs = Array.isArray(item.craftingrequirements)
        ? item.craftingrequirements
        : [item.craftingrequirements];

      for (const req of reqs) {
        const resources = extractCraftResources(req);
        if (resources.length === 0) continue;
        if (tier < 2) continue;

        const { category, subcategory, craftingCategory } = categorizeFromShop(shopCat, shopSub, uniqueName);
        const silver = parseInt(req["@silver"] ?? item["@itemvalue"] ?? "0");

        recipes.push({
          itemId: uniqueName,
          category,
          subcategory,
          tier,
          enchantment: 0,
          craftingRequirements: resources,
          craftingFee: silver,
          craftingCategory,
        });
      }
    }

    // Handle enchantment variants
    if (item.enchantments?.enchantment) {
      const enchants = Array.isArray(item.enchantments.enchantment)
        ? item.enchantments.enchantment
        : [item.enchantments.enchantment];

      for (const ench of enchants) {
        const enchLevel = parseInt(ench["@enchantmentlevel"] ?? "0");
        if (enchLevel === 0) continue;

        const enchItemId = `${uniqueName}@${enchLevel}`;
        const enchName = nameMap.get(enchItemId) ?? `${name} (${enchLevel})`;

        if (!seenIds.has(enchItemId)) {
          seenIds.add(enchItemId);
          const { category, subcategory } = categorizeFromShop(shopCat, shopSub, uniqueName);
          itemsMeta.push({
            itemId: enchItemId,
            name: enchName,
            tier,
            enchantment: enchLevel,
            category,
            subcategory,
          });
        }

        if (ench.craftingrequirements) {
          const reqs = Array.isArray(ench.craftingrequirements)
            ? ench.craftingrequirements
            : [ench.craftingrequirements];

          for (const req of reqs) {
            const resources = extractCraftResources(req);
            if (resources.length === 0) continue;

            const { category, subcategory, craftingCategory } = categorizeFromShop(shopCat, shopSub, uniqueName);
            const silver = parseInt(req["@silver"] ?? item["@itemvalue"] ?? "0");

            recipes.push({
              itemId: enchItemId,
              category,
              subcategory,
              tier,
              enchantment: enchLevel,
              craftingRequirements: resources,
              craftingFee: silver,
              craftingCategory,
            });
          }
        }
      }
    }
  }

  // Write output
  const dataDir = path.join(__dirname, "..");
  fs.mkdirSync(dataDir, { recursive: true });

  const recipesPath = path.join(dataDir, "recipes.json");
  const metaPath = path.join(dataDir, "items-meta.json");

  fs.writeFileSync(recipesPath, JSON.stringify(recipes, null, 2));
  fs.writeFileSync(metaPath, JSON.stringify(itemsMeta, null, 2));

  console.log(`Wrote ${recipes.length} recipes to ${recipesPath}`);
  console.log(`Wrote ${itemsMeta.length} items to ${metaPath}`);

  // Print category breakdown
  const catCounts = new Map<string, number>();
  for (const r of recipes) {
    catCounts.set(r.category, (catCounts.get(r.category) ?? 0) + 1);
  }
  console.log("\nRecipes by category:");
  const sorted = Array.from(catCounts.entries()).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sorted) {
    console.log(`  ${cat}: ${count}`);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
