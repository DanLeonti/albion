import { Suspense } from "react";
import Link from "next/link";
import ItemIcon from "@/components/ui/ItemIcon";
import SilverDisplay from "@/components/ui/SilverDisplay";
import CostBreakdown from "@/components/item/CostBreakdown";
import RecipeDisplay from "@/components/item/RecipeDisplay";
import PriceChart from "@/components/item/PriceChart";
import { getRecipeById } from "@/lib/data/recipes";
import { getItemNames, getItemMeta } from "@/lib/data/items";
import { calculateProfit } from "@/lib/engine/profit-calculator";
import { collectAllItemIds, buildRecipeTree } from "@/lib/engine/recipe-tree";
import { batchFetchPrices } from "@/lib/api/batch-fetcher";
import { tierDisplay, tierColor } from "@/lib/utils/item-ids";
import { formatPercent } from "@/lib/utils/formatting";
import { CITIES, type Region } from "@/types/market";
import RecipeTreeComponent from "@/components/item/RecipeTree";
import ItemCitySelector from "@/components/item/ItemCitySelector";

interface ItemPageProps {
  params: { itemId: string };
  searchParams: { city?: string; focus?: string; fee?: string; region?: string };
}

export default async function ItemPage({ params, searchParams }: ItemPageProps) {
  const itemId = decodeURIComponent(params.itemId);
  const recipe = getRecipeById(itemId);
  const itemNames = getItemNames();
  const meta = getItemMeta(itemId);

  if (!recipe) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-lg">Recipe not found for {itemId}</p>
        <Link href="/dashboard" className="text-blue-400 hover:underline mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const city = searchParams.city ?? "Caerleon";
  const useFocus = searchParams.focus === "true";
  const feePercentage = searchParams.fee ? parseInt(searchParams.fee) / 100 : 0.03;
  const region = (searchParams.region as Region) ?? "europe";

  // Collect all item IDs in the full crafting tree
  const allIds = collectAllItemIds(recipe.itemId, getRecipeById);
  const locations = [...CITIES];
  const calcOptions = { city, useFocus, feePercentage };

  let profitResult = null;
  let recipeTree = null;
  try {
    const prices = await batchFetchPrices(allIds, locations, region);
    profitResult = calculateProfit(recipe, prices, itemNames, calcOptions);
    recipeTree = buildRecipeTree(recipe.itemId, 1, 0, getRecipeById, prices, itemNames, calcOptions);
  } catch {
    // Will show without profit data
  }

  const name = meta?.name ?? itemNames.get(itemId) ?? itemId;
  const tier = meta?.tier ?? recipe.tier;
  const enchantment = meta?.enchantment ?? recipe.enchantment;

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-blue-400 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <ItemIcon itemId={itemId} size={64} />
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="text-sm" style={{ color: tierColor(tier) }}>
            {tierDisplay(tier, enchantment)} · {recipe.category} · {recipe.subcategory}
          </p>
        </div>
        {profitResult && (
          <div className="ml-auto text-right">
            <div className="text-sm text-gray-400">Profit</div>
            <SilverDisplay amount={profitResult.profit} className="text-2xl font-bold" showSign />
            <div className="text-sm">
              <span className={profitResult.profitMargin > 0 ? "text-green-400" : "text-red-400"}>
                {formatPercent(profitResult.profitMargin)} margin
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <ItemCitySelector currentCity={city} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Recipe */}
        <RecipeDisplay recipe={recipe} itemNames={itemNames} />

        {/* Cost Breakdown */}
        {profitResult && (
          <CostBreakdown
            materials={profitResult.materials}
            totalCost={profitResult.materialCost}
            costAfterReturn={profitResult.materialCostAfterReturn}
            craftingFee={profitResult.craftingFee}
            marketTax={profitResult.marketTax}
          />
        )}
      </div>

      {/* Full Crafting Tree */}
      {recipeTree && <RecipeTreeComponent tree={recipeTree} />}

      {/* Price Chart */}
      <PriceChart itemId={itemId} region={region} />
    </div>
  );
}
