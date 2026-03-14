"use client";

import { useState, useMemo } from "react";
import type { Recipe } from "@/types/item";
import { CITIES } from "@/types/market";
import { loadRecipes, getAllCategories } from "@/lib/data/recipes";
import { getItemNames } from "@/lib/data/items";
import { calculateReturnRate } from "@/lib/engine/return-rate";
import { calculateCraftingFee } from "@/lib/engine/crafting-fee";
import { MARKET_TAX } from "@/lib/data/constants";
import { tierDisplay, tierColor, parseItemId } from "@/lib/utils/item-ids";
import ItemIcon from "@/components/ui/ItemIcon";
import SilverDisplay from "@/components/ui/SilverDisplay";

const inputClass =
  "bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none";

export default function CraftCalculator() {
  const recipes = useMemo(() => loadRecipes(), []);
  const itemNames = useMemo(() => getItemNames(), []);
  const categories = useMemo(() => getAllCategories(), []);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [materialCosts, setMaterialCosts] = useState<Record<string, number>>({});
  const [sellPrice, setSellPrice] = useState(0);
  const [useFocus, setUseFocus] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Caerleon");
  const [feePercentage, setFeePercentage] = useState(3);

  const filteredRecipes = useMemo(() => {
    let filtered = recipes;
    if (selectedCategory) {
      filtered = filtered.filter((r) => r.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((r) => {
        const name = itemNames.get(r.itemId) ?? r.itemId;
        return name.toLowerCase().includes(q);
      });
    }
    return filtered;
  }, [recipes, itemNames, selectedCategory, searchQuery]);

  function selectRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe);
    const costs: Record<string, number> = {};
    for (const mat of recipe.craftingRequirements) {
      costs[mat.itemId] = 0;
    }
    setMaterialCosts(costs);
    setSellPrice(0);
  }

  function setMaterialCost(itemId: string, value: number) {
    setMaterialCosts((prev) => ({ ...prev, [itemId]: value }));
  }

  // Computed results
  const results = useMemo(() => {
    if (!selectedRecipe) return null;

    const totalMaterialCost = selectedRecipe.craftingRequirements.reduce(
      (sum, mat) => sum + (materialCosts[mat.itemId] ?? 0) * mat.count,
      0
    );
    const returnRate = calculateReturnRate(useFocus, selectedCity, selectedRecipe.craftingCategory);
    const costAfterReturn = totalMaterialCost * (1 - returnRate);
    const fee = calculateCraftingFee(selectedRecipe.craftingFee, feePercentage / 100);
    const tax = sellPrice * MARKET_TAX;
    const profit = sellPrice * (1 - MARKET_TAX) - costAfterReturn - fee;
    const margin = sellPrice > 0 ? profit / sellPrice : 0;

    return { totalMaterialCost, returnRate, costAfterReturn, fee, tax, profit, margin };
  }, [selectedRecipe, materialCosts, sellPrice, useFocus, selectedCity, feePercentage]);

  const recipeParsed = selectedRecipe ? parseItemId(selectedRecipe.itemId) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">Craft Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left panel — Recipe Selector */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="space-y-3 mb-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`${inputClass} w-full`}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputClass} w-full`}
            />
          </div>
          <div className="max-h-[600px] overflow-y-auto space-y-1">
            {filteredRecipes.map((recipe) => {
              const parsed = parseItemId(recipe.itemId);
              const name = itemNames.get(recipe.itemId) ?? recipe.itemId;
              const isSelected = selectedRecipe?.itemId === recipe.itemId;
              return (
                <button
                  key={recipe.itemId}
                  onClick={() => selectRecipe(recipe)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition ${
                    isSelected
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <ItemIcon itemId={recipe.itemId} size={32} />
                  <span className="truncate flex-1">{name}</span>
                  <span
                    className="text-xs font-mono shrink-0"
                    style={{ color: tierColor(parsed.tier) }}
                  >
                    {tierDisplay(parsed.tier, parsed.enchantment)}
                  </span>
                </button>
              );
            })}
            {filteredRecipes.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No recipes found</p>
            )}
          </div>
        </div>

        {/* Right panel — Calculator */}
        <div>
          {!selectedRecipe ? (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center text-gray-500">
              Select a recipe to start calculating
            </div>
          ) : (
            <div className="space-y-4">
              {/* Section A — Header */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex items-center gap-3">
                <ItemIcon itemId={selectedRecipe.itemId} size={48} />
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {itemNames.get(selectedRecipe.itemId) ?? selectedRecipe.itemId}
                  </h2>
                  <span
                    className="text-sm font-mono"
                    style={{ color: tierColor(recipeParsed!.tier) }}
                  >
                    {tierDisplay(recipeParsed!.tier, recipeParsed!.enchantment)}
                  </span>
                </div>
              </div>

              {/* Section B — Material Inputs */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Materials</h3>
                <div className="space-y-2">
                  {selectedRecipe.craftingRequirements.map((mat) => {
                    const costPerUnit = materialCosts[mat.itemId] ?? 0;
                    const total = costPerUnit * mat.count;
                    return (
                      <div
                        key={mat.itemId}
                        className="flex items-center gap-3 text-sm"
                      >
                        <ItemIcon itemId={mat.itemId} size={32} />
                        <span className="text-gray-300 flex-1 truncate">
                          {itemNames.get(mat.itemId) ?? mat.itemId}
                        </span>
                        <span className="text-gray-500 shrink-0">&times;{mat.count}</span>
                        <input
                          type="number"
                          min={0}
                          value={costPerUnit || ""}
                          placeholder="0"
                          onChange={(e) =>
                            setMaterialCost(mat.itemId, Math.max(0, Number(e.target.value) || 0))
                          }
                          className={`${inputClass} w-24 text-right`}
                        />
                        <span className="text-gray-400 font-mono w-24 text-right shrink-0">
                          = {total.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section C — Settings */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <label className="flex items-center gap-2 text-gray-400">
                    Sell Price
                    <input
                      type="number"
                      min={0}
                      value={sellPrice || ""}
                      placeholder="0"
                      onChange={(e) => setSellPrice(Math.max(0, Number(e.target.value) || 0))}
                      className={`${inputClass} w-28 text-right`}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-gray-400">
                    City
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className={inputClass}
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useFocus}
                      onChange={(e) => setUseFocus(e.target.checked)}
                      className="accent-blue-500"
                    />
                    Focus
                  </label>
                  <label className="flex items-center gap-2 text-gray-400">
                    Fee %
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={feePercentage}
                      onChange={(e) => setFeePercentage(Math.max(0, Number(e.target.value) || 0))}
                      className={`${inputClass} w-20 text-right`}
                    />
                  </label>
                </div>
              </div>

              {/* Section D — Results */}
              {results && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <ResultRow label="Sell Price">
                      <SilverDisplay amount={sellPrice} />
                    </ResultRow>
                    <ResultRow label={`Market Tax (${(MARKET_TAX * 100).toFixed(1)}%)`}>
                      <SilverDisplay amount={-results.tax} />
                    </ResultRow>
                    <hr className="border-gray-700" />
                    <ResultRow label="Raw Material Cost">
                      <SilverDisplay amount={-results.totalMaterialCost} />
                    </ResultRow>
                    <ResultRow label={`Return Rate (${(results.returnRate * 100).toFixed(1)}%)`}>
                      <span className="text-blue-400 font-mono">
                        {(results.returnRate * 100).toFixed(1)}%
                      </span>
                    </ResultRow>
                    <ResultRow label="Cost After Return">
                      <SilverDisplay amount={-results.costAfterReturn} />
                    </ResultRow>
                    <ResultRow label="Crafting Fee">
                      <SilverDisplay amount={-results.fee} />
                    </ResultRow>
                    <hr className="border-gray-700" />
                    <ResultRow label="Profit" bold>
                      <SilverDisplay amount={results.profit} showSign />
                    </ResultRow>
                    <ResultRow label="Margin" bold>
                      <span
                        className={`font-mono font-bold ${
                          results.margin > 0
                            ? "text-green-400"
                            : results.margin < 0
                              ? "text-red-400"
                              : "text-gray-400"
                        }`}
                      >
                        {(results.margin * 100).toFixed(1)}%
                      </span>
                    </ResultRow>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultRow({
  label,
  children,
  bold = false,
}: {
  label: string;
  children: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-gray-400 ${bold ? "font-bold text-gray-300" : ""}`}>{label}</span>
      <span className={bold ? "font-bold" : ""}>{children}</span>
    </div>
  );
}
