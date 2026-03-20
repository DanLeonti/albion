"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { TIERS, ENCHANTMENTS, CATEGORIES, CATEGORY_LABELS } from "@/lib/data/constants";

export default function TopItemsFilterBar() {
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
      params.delete("page");
      router.push(`/top-items?${params.toString()}`);
    },
    [router, searchParams]
  );

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
  const activeEnchs = currentEnchants
    ? currentEnchants.split(",").map(Number)
    : [];

  return (
    <div className="bg-albion-darker rounded-lg p-4 mb-4 border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <label className="block text-xs text-gray-400 mb-1">
            Enchantment
          </label>
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

        {/* Category */}
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

        {/* Sort */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Sort By</label>
          <select
            value={searchParams.get("sort") ?? "price"}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="price">Price</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
    </div>
  );
}
