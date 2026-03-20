"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ItemMeta } from "@/types/item";
import type { AlbionPriceResponse } from "@/lib/api/types";
import type { Region } from "@/types/market";
import { CITIES } from "@/types/market";
import ItemIcon from "@/components/ui/ItemIcon";
import SilverDisplay from "@/components/ui/SilverDisplay";
import { formatRelativeTime } from "@/lib/utils/formatting";
import { tierDisplay, tierColor } from "@/lib/utils/item-ids";

interface PriceCheckerProps {
  items: ItemMeta[];
}

interface CityPriceSummary {
  city: string;
  sell_price_min: number;
  sell_price_min_date: string;
  sell_price_max: number;
  sell_price_max_date: string;
  buy_price_min: number;
  buy_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}

export default function PriceChecker({ items }: PriceCheckerProps) {
  const searchParams = useSearchParams();
  const region = (searchParams.get("region") ?? "europe") as Region;

  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemMeta | null>(null);
  const [prices, setPrices] = useState<CityPriceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return [];
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const results: ItemMeta[] = [];
    for (const item of items) {
      const name = item.name.toLowerCase();
      if (terms.every((t) => name.includes(t))) {
        results.push(item);
        if (results.length >= 20) break;
      }
    }
    return results;
  }, [query, items]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchItemPrices = useCallback(
    async (item: ItemMeta) => {
      setLoading(true);
      setError(null);
      setPrices([]);
      try {
        const res = await fetch(
          `/api/prices-check?itemId=${encodeURIComponent(item.itemId)}&region=${region}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const data: AlbionPriceResponse[] = await res.json();

        // Aggregate by city: pick quality 1 or best available per city
        const cityMap = new Map<string, CityPriceSummary>();
        for (const city of CITIES) {
          cityMap.set(city, {
            city,
            sell_price_min: 0,
            sell_price_min_date: "",
            sell_price_max: 0,
            sell_price_max_date: "",
            buy_price_min: 0,
            buy_price_min_date: "",
            buy_price_max: 0,
            buy_price_max_date: "",
          });
        }

        for (const entry of data) {
          const existing = cityMap.get(entry.city);
          if (!existing) continue;

          // Use the entry with the lowest non-zero sell_price_min, or fill in if empty
          if (
            entry.sell_price_min > 0 &&
            (existing.sell_price_min === 0 || entry.sell_price_min < existing.sell_price_min)
          ) {
            existing.sell_price_min = entry.sell_price_min;
            existing.sell_price_min_date = entry.sell_price_min_date;
          }
          if (entry.sell_price_max > existing.sell_price_max) {
            existing.sell_price_max = entry.sell_price_max;
            existing.sell_price_max_date = entry.sell_price_max_date;
          }
          if (
            entry.buy_price_min > 0 &&
            (existing.buy_price_min === 0 || entry.buy_price_min < existing.buy_price_min)
          ) {
            existing.buy_price_min = entry.buy_price_min;
            existing.buy_price_min_date = entry.buy_price_min_date;
          }
          if (entry.buy_price_max > existing.buy_price_max) {
            existing.buy_price_max = entry.buy_price_max;
            existing.buy_price_max_date = entry.buy_price_max_date;
          }
        }

        setPrices(Array.from(cityMap.values()));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch prices");
      } finally {
        setLoading(false);
      }
    },
    [region]
  );

  function selectItem(item: ItemMeta) {
    setSelectedItem(item);
    setQuery(item.name);
    setShowDropdown(false);
    setHighlightIndex(-1);
    fetchItemPrices(item);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || filteredItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filteredItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      selectItem(filteredItems[highlightIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  // Find cheapest and most expensive sell cities for highlighting
  const cheapestSellCity = useMemo(() => {
    const withSell = prices.filter((p) => p.sell_price_min > 0);
    if (withSell.length === 0) return null;
    return withSell.reduce((a, b) => (a.sell_price_min < b.sell_price_min ? a : b)).city;
  }, [prices]);

  const expensiveSellCity = useMemo(() => {
    const withSell = prices.filter((p) => p.sell_price_min > 0);
    if (withSell.length === 0) return null;
    return withSell.reduce((a, b) => (a.sell_price_min > b.sell_price_min ? a : b)).city;
  }, [prices]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Price Check</h1>
        <p className="text-gray-400 text-sm">
          Search for any item to see current prices across all cities.
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
            setHighlightIndex(-1);
            if (!e.target.value.trim()) {
              setSelectedItem(null);
              setPrices([]);
            }
          }}
          onFocus={() => {
            if (query.trim()) setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search items by name..."
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm placeholder-gray-500"
        />
        {showDropdown && filteredItems.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-40 top-full mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-80 overflow-y-auto"
          >
            {filteredItems.map((item, idx) => (
              <button
                key={item.itemId}
                onClick={() => selectItem(item)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition hover:bg-gray-700 ${
                  idx === highlightIndex ? "bg-gray-700" : ""
                }`}
              >
                <ItemIcon itemId={item.itemId} size={32} />
                <div className="flex-1 min-w-0">
                  <span className="text-white truncate block">{item.name}</span>
                  <span className="text-xs text-gray-400">
                    <span style={{ color: tierColor(item.tier) }}>
                      {tierDisplay(item.tier, item.enchantment)}
                    </span>
                    {" \u00B7 "}
                    {item.subcategory || item.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected item header */}
      {selectedItem && (
        <div className="flex items-center gap-4 bg-albion-darker rounded-lg p-4 border border-gray-700">
          <ItemIcon itemId={selectedItem.itemId} size={64} />
          <div>
            <h2 className="text-xl font-bold text-white">{selectedItem.name}</h2>
            <p className="text-sm text-gray-400">
              <span style={{ color: tierColor(selectedItem.tier) }}>
                {tierDisplay(selectedItem.tier, selectedItem.enchantment)}
              </span>
              {" \u00B7 "}
              {selectedItem.subcategory || selectedItem.category}
              {" \u00B7 "}
              <span className="text-gray-500 font-mono text-xs">{selectedItem.itemId}</span>
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="inline-block w-6 h-6 border-2 border-gray-500 border-t-blue-500 rounded-full animate-spin mb-2" />
          <p className="text-sm">Fetching prices...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Price table */}
      {!loading && !error && prices.length > 0 && selectedItem && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-left">
                <th className="py-3 px-3 font-medium">City</th>
                <th className="py-3 px-3 font-medium text-right">Sell Min</th>
                <th className="py-3 px-3 font-medium text-right">Sell Max</th>
                <th className="py-3 px-3 font-medium text-right">Buy Order Min</th>
                <th className="py-3 px-3 font-medium text-right">Buy Order Max</th>
                <th className="py-3 px-3 font-medium text-right">Updated</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((row) => {
                const isCheapest = row.city === cheapestSellCity && row.sell_price_min > 0;
                const isExpensive = row.city === expensiveSellCity && row.sell_price_min > 0;
                const rowBorder = isCheapest
                  ? "border-l-2 border-l-green-500"
                  : isExpensive
                    ? "border-l-2 border-l-yellow-500"
                    : "border-l-2 border-l-transparent";

                return (
                  <tr
                    key={row.city}
                    className={`border-b border-gray-700/50 hover:bg-gray-800/50 transition ${rowBorder}`}
                  >
                    <td className="py-3 px-3">
                      <span className="text-white font-medium">{row.city}</span>
                      {isCheapest && (
                        <span className="ml-2 text-xs text-green-400 font-medium">CHEAPEST</span>
                      )}
                      {isExpensive && (
                        <span className="ml-2 text-xs text-yellow-400 font-medium">HIGHEST</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {row.sell_price_min > 0 ? (
                        <SilverDisplay
                          amount={row.sell_price_min}
                          className={isCheapest ? "!text-green-400" : isExpensive ? "!text-yellow-400" : ""}
                        />
                      ) : (
                        <span className="text-gray-600">--</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {row.sell_price_max > 0 ? (
                        <SilverDisplay amount={row.sell_price_max} />
                      ) : (
                        <span className="text-gray-600">--</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {row.buy_price_min > 0 ? (
                        <SilverDisplay amount={row.buy_price_min} />
                      ) : (
                        <span className="text-gray-600">--</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {row.buy_price_max > 0 ? (
                        <SilverDisplay amount={row.buy_price_max} />
                      ) : (
                        <span className="text-gray-600">--</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-500 text-xs">
                      {row.sell_price_min_date
                        ? formatRelativeTime(row.sell_price_min_date)
                        : "--"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !selectedItem && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">Search for an item above to check its prices.</p>
        </div>
      )}
    </div>
  );
}
