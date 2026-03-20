"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ItemIcon from "@/components/ui/ItemIcon";
import { tierDisplay, tierColor } from "@/lib/utils/item-ids";
import { formatSilverCompact } from "@/lib/utils/formatting";
import { CITIES } from "@/types/market";
import type { AlbionHistoryResponse } from "@/lib/api/types";

interface ItemInfo {
  itemId: string;
  name: string;
  tier: number;
  enchantment: number;
  category: string;
  subcategory: string;
}

interface PriceChartViewerProps {
  items: ItemInfo[];
}

const CITY_COLORS: Record<string, string> = {
  Caerleon: "#e6cc80",
  Bridgewatch: "#ff8c00",
  "Fort Sterling": "#a0a0a0",
  Lymhurst: "#22c55e",
  Martlock: "#3b82f6",
  Thetford: "#a855f7",
  "Black Market": "#ef4444",
};

export default function PriceChartViewer({ items }: PriceChartViewerProps) {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemInfo | null>(null);
  const [enabledCities, setEnabledCities] = useState<Set<string>>(
    new Set(CITIES)
  );
  const [historyData, setHistoryData] = useState<AlbionHistoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter items for search results
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
    return items
      .filter((item) => {
        const haystack = `${item.name} ${item.itemId}`.toLowerCase();
        return terms.every((term) => haystack.includes(term));
      })
      .slice(0, 20);
  }, [search, items]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch history when item or cities change
  const fetchHistory = useCallback(async (itemId: string, cities: string[]) => {
    if (cities.length === 0) {
      setHistoryData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const locations = cities.join(",");
      const res = await fetch(
        `/api/prices?type=history&itemId=${encodeURIComponent(itemId)}&locations=${encodeURIComponent(locations)}`
      );
      if (!res.ok) throw new Error("Failed to fetch price history");
      const data: AlbionHistoryResponse[] = await res.json();
      setHistoryData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedItem) {
      const cities = Array.from(enabledCities);
      fetchHistory(selectedItem.itemId, cities);
    }
  }, [selectedItem, enabledCities, fetchHistory]);

  function selectItem(item: ItemInfo) {
    setSelectedItem(item);
    setSearch(item.name);
    setShowDropdown(false);
  }

  function toggleCity(city: string) {
    setEnabledCities((prev) => {
      const next = new Set(prev);
      if (next.has(city)) {
        next.delete(city);
      } else {
        next.add(city);
      }
      return next;
    });
  }

  // Transform history data into chart-friendly format
  const chartData = useMemo(() => {
    if (historyData.length === 0) return [];

    // Collect all timestamps across all cities
    const timeMap = new Map<string, Record<string, number>>();

    for (const series of historyData) {
      for (const point of series.data) {
        const date = new Date(point.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (!timeMap.has(point.timestamp)) {
          timeMap.set(point.timestamp, { _ts: new Date(point.timestamp).getTime() });
        }
        const entry = timeMap.get(point.timestamp)!;
        entry[series.location] = point.avg_price;
      }
    }

    return Array.from(timeMap.values()).sort((a, b) => a._ts - b._ts);
  }, [historyData]);

  const activeCities = useMemo(
    () => CITIES.filter((c) => enabledCities.has(c)),
    [enabledCities]
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-albion-darker rounded-lg p-4 border border-gray-700">
        <label className="block text-xs text-gray-400 mb-1">
          Search for an item
        </label>
        <div className="relative" ref={dropdownRef}>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => search.trim() && setShowDropdown(true)}
            placeholder="Type an item name..."
            className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-40 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.itemId}
                  onClick={() => selectItem(item)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 transition text-left"
                >
                  <ItemIcon itemId={item.itemId} size={28} />
                  <div>
                    <div className="text-sm text-white">{item.name}</div>
                    <div
                      className="text-xs"
                      style={{ color: tierColor(item.tier) }}
                    >
                      {tierDisplay(item.tier, item.enchantment)} ·{" "}
                      {item.subcategory}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected item info + city filters + chart */}
      {selectedItem && (
        <>
          {/* Item header */}
          <div className="bg-albion-darker rounded-lg p-4 border border-gray-700 flex items-center gap-3">
            <ItemIcon itemId={selectedItem.itemId} size={48} />
            <div>
              <div className="text-lg font-bold text-white">
                {selectedItem.name}
              </div>
              <div
                className="text-sm"
                style={{ color: tierColor(selectedItem.tier) }}
              >
                {tierDisplay(selectedItem.tier, selectedItem.enchantment)} ·{" "}
                {selectedItem.category} · {selectedItem.subcategory}
              </div>
            </div>
          </div>

          {/* City filter */}
          <div className="bg-albion-darker rounded-lg p-4 border border-gray-700">
            <label className="block text-xs text-gray-400 mb-2">
              Cities
            </label>
            <div className="flex gap-2 flex-wrap">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => toggleCity(city)}
                  className={`px-3 py-1 text-xs rounded flex items-center gap-1.5 ${
                    enabledCities.has(city)
                      ? "text-white"
                      : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                  }`}
                  style={
                    enabledCities.has(city)
                      ? { backgroundColor: CITY_COLORS[city] + "33", borderColor: CITY_COLORS[city], borderWidth: 1 }
                      : undefined
                  }
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: CITY_COLORS[city] }}
                  />
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="bg-albion-darker rounded-lg p-4 border border-gray-700">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-400">{error}</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p>No price history data available</p>
                <p className="text-sm mt-1">
                  Try selecting different cities or a different item
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={450}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="_ts"
                    tickFormatter={(ts) =>
                      new Date(ts).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(v) => formatSilverCompact(v)}
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                    }}
                    labelFormatter={(ts) =>
                      new Date(ts).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                    formatter={(value: number, name: string) => [
                      formatSilverCompact(value),
                      name,
                    ]}
                  />
                  <Legend />
                  {activeCities.map((city) => (
                    <Line
                      key={city}
                      type="monotone"
                      dataKey={city}
                      name={city}
                      stroke={CITY_COLORS[city]}
                      dot={false}
                      strokeWidth={2}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
