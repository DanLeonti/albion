"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TIERS, ENCHANTMENTS, CATEGORIES, CATEGORY_LABELS } from "@/lib/data/constants";
import { CITIES } from "@/types/market";
import { useCallback, useState } from "react";

const ROYAL_CITIES = CITIES.filter((c) => c !== "Black Market");

export default function FlipFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/flipper?${params.toString()}`);
    },
    [router, searchParams]
  );

  const currentTiers = searchParams.get("tiers") ?? "";
  const currentEnchants = searchParams.get("enchantments") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentBuyCities = searchParams.get("buyCities") ?? "";
  const currentSellCities = searchParams.get("sellCities") ?? "";

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

  function toggleBuyCity(city: string) {
    const cities = currentBuyCities ? currentBuyCities.split(",") : [];
    const idx = cities.indexOf(city);
    if (idx >= 0) cities.splice(idx, 1);
    else cities.push(city);
    updateParam("buyCities", cities.join(","));
  }

  function toggleSellCity(city: string) {
    const cities = currentSellCities ? currentSellCities.split(",") : [];
    const idx = cities.indexOf(city);
    if (idx >= 0) cities.splice(idx, 1);
    else cities.push(city);
    updateParam("sellCities", cities.join(","));
  }

  const activeTiers = currentTiers ? currentTiers.split(",").map(Number) : [];
  const activeEnchs = currentEnchants ? currentEnchants.split(",").map(Number) : [];
  const activeBuyCities = currentBuyCities ? currentBuyCities.split(",") : [];
  const activeSellCities = currentSellCities ? currentSellCities.split(",") : [];

  return (
    <div className="bg-albion-darker rounded-lg p-4 mb-4 border border-gray-700">
      {/* Row 1: Buy From / Sell To cities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Buy From (select cities)</label>
          <div className="flex gap-1 flex-wrap">
            {ROYAL_CITIES.map((c) => (
              <button
                key={c}
                onClick={() => toggleBuyCity(c)}
                className={`px-2 py-1 text-xs rounded ${
                  activeBuyCities.includes(c)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {activeBuyCities.length === 0 && (
            <span className="text-[10px] text-gray-500 mt-0.5">All royal cities</span>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Sell To (select cities)</label>
          <div className="flex gap-1 flex-wrap">
            {[...CITIES].map((c) => (
              <button
                key={c}
                onClick={() => toggleSellCity(c)}
                className={`px-2 py-1 text-xs rounded ${
                  activeSellCities.includes(c)
                    ? c === "Black Market"
                      ? "bg-red-700 text-white"
                      : "bg-green-700 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {activeSellCities.length === 0 && (
            <span className="text-[10px] text-gray-500 mt-0.5">All cities + Black Market</span>
          )}
        </div>
      </div>

      {/* Row 2: Tier, Enchantment, Category, Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-700">
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

        <div>
          <label className="block text-xs text-gray-400 mb-1">Category</label>
          <select
            value={currentCategory}
            onChange={(e) => updateParam("category", e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c] ?? c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Search</label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateParam("search", searchInput.trim());
            }}
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onBlur={() => updateParam("search", searchInput.trim())}
              placeholder="Search items..."
              className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </form>
        </div>
      </div>

      {/* Row 3: Min Profit, Min Margin, Max Age, Sort */}
      <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-700 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Min Profit:</label>
          <input
            type="number"
            value={searchParams.get("minProfit") ?? ""}
            onChange={(e) => updateParam("minProfit", e.target.value)}
            placeholder="0"
            className="w-24 bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Min Margin:</label>
          <input
            type="number"
            value={searchParams.get("minMargin") ?? ""}
            onChange={(e) => updateParam("minMargin", e.target.value)}
            placeholder="0"
            min="0"
            max="100"
            step="1"
            className="w-20 bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <span className="text-sm text-gray-500">%</span>
        </div>

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

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-gray-400">Sort:</label>
          <select
            value={searchParams.get("sort") ?? "profit"}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="profit">Profit</option>
            <option value="profitMargin">Margin %</option>
            <option value="sellPrice">Sell Price</option>
            <option value="buyPrice">Buy Price</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
    </div>
  );
}
