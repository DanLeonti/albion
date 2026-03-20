"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TIERS, ENCHANTMENTS, CATEGORIES, CATEGORY_LABELS } from "@/lib/data/constants";
import { CITIES } from "@/types/market";
import { useCallback } from "react";

const TRADE_CITIES = CITIES.filter((c) => c !== "Black Market");

export default function TradeRouteFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // Reset page on filter change
      router.push(`/trade-routes?${params.toString()}`);
    },
    [router, searchParams]
  );

  const currentFrom = searchParams.get("from") ?? "Caerleon";
  const currentTo = searchParams.get("to") ?? "Black Market";
  const currentTiers = searchParams.get("tiers") ?? "";
  const currentEnchants = searchParams.get("enchantments") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  function toggleTier(tier: number) {
    const tiers = currentTiers ? currentTiers.split(",").map(Number) : [];
    const idx = tiers.indexOf(tier);
    if (idx >= 0) tiers.splice(idx, 1);
    else tiers.push(tier);
    updateParam("tiers", tiers.join(","));
  }

  function toggleEnchant(ench: number) {
    const enchs = currentEnchants ? currentEnchants.split(",").map(Number) : [];
    const idx = enchs.indexOf(ench);
    if (idx >= 0) enchs.splice(idx, 1);
    else enchs.push(ench);
    updateParam("enchantments", enchs.join(","));
  }

  const activeTiers = currentTiers ? currentTiers.split(",").map(Number) : [];
  const activeEnchs = currentEnchants ? currentEnchants.split(",").map(Number) : [];

  return (
    <div className="bg-albion-darker rounded-lg p-4 mb-4 border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* From City */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">From City (Buy)</label>
          <select
            value={currentFrom}
            onChange={(e) => updateParam("from", e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {TRADE_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* To City */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">To City (Sell)</label>
          <select
            value={currentTo}
            onChange={(e) => updateParam("to", e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Tier filter */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Tier</label>
          <div className="flex gap-1 flex-wrap">
            {TIERS.map((t) => (
              <button
                key={t}
                onClick={() => toggleTier(t)}
                className={`px-2 py-1 text-xs rounded ${
                  activeTiers.includes(t)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                T{t}
              </button>
            ))}
          </div>
        </div>

        {/* Enchantment filter */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Enchantment</label>
          <div className="flex gap-1 flex-wrap">
            {ENCHANTMENTS.map((e) => (
              <button
                key={e}
                onClick={() => toggleEnchant(e)}
                className={`px-2 py-1 text-xs rounded ${
                  activeEnchs.includes(e)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                .{e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-700 flex-wrap">
        {/* Category */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Category:</label>
          <select
            value={currentCategory}
            onChange={(e) => updateParam("category", e.target.value)}
            className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c] ?? c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Min Profit */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Min Profit:</label>
          <input
            type="number"
            placeholder="0"
            value={searchParams.get("minprofit") ?? ""}
            onChange={(e) => updateParam("minprofit", e.target.value)}
            className="w-24 bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Max Age */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Max Age:</label>
          <select
            value={searchParams.get("maxage") ?? ""}
            onChange={(e) => updateParam("maxage", e.target.value)}
            className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Any</option>
            <option value="1">1h</option>
            <option value="6">6h</option>
            <option value="24">24h</option>
            <option value="72">3d</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-gray-400">Sort:</label>
          <select
            value={searchParams.get("sort") ?? "profit"}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="profit">Profit</option>
            <option value="profitMargin">Margin %</option>
            <option value="buyPrice">Buy Price</option>
            <option value="sellPrice">Sell Price</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
    </div>
  );
}
