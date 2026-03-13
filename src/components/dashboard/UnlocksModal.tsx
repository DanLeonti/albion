"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TIERS } from "@/lib/data/constants";

const STORAGE_KEY = "albion-unlocks";

interface UnlocksModalProps {
  open: boolean;
  onClose: () => void;
  subcategoriesByCategory: Record<string, string[]>;
}

function loadUnlocksFromStorage(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveUnlocksToStorage(unlocks: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocks));
  } catch {}
}

function encodeUnlocksParam(unlocks: Record<string, number>): string {
  return Object.entries(unlocks)
    .map(([sub, tier]) => `${sub}:${tier}`)
    .join(",");
}

function formatName(s: string): string {
  return s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function parseUnlocksParam(param: string): Record<string, number> {
  if (!param) return {};
  return Object.fromEntries(
    param.split(",").map((s) => {
      const [sub, tier] = s.split(":");
      return [sub, parseInt(tier)];
    })
  );
}

export function useUnlocksSync() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const urlUnlocks = searchParams.get("unlocks");
    if (urlUnlocks) return; // URL already has unlocks, don't overwrite

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const unlocks = JSON.parse(stored) as Record<string, number>;
        if (Object.keys(unlocks).length > 0) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("unlocks", encodeUnlocksParam(unlocks));
          params.delete("page");
          router.replace(`/dashboard?${params.toString()}`);
        }
      }
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

export default function UnlocksModal({
  open,
  onClose,
  subcategoriesByCategory,
}: UnlocksModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [unlocks, setUnlocks] = useState<Record<string, number>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      // Load from URL param first, fall back to localStorage
      const urlParam = searchParams.get("unlocks");
      if (urlParam) {
        setUnlocks(parseUnlocksParam(urlParam));
      } else {
        setUnlocks(loadUnlocksFromStorage());
      }
    }
  }, [open, searchParams]);

  const applyUnlocks = useCallback(
    (newUnlocks: Record<string, number>) => {
      saveUnlocksToStorage(newUnlocks);
      const params = new URLSearchParams(searchParams.toString());
      const encoded = encodeUnlocksParam(newUnlocks);
      if (encoded) {
        params.set("unlocks", encoded);
      } else {
        params.delete("unlocks");
      }
      params.delete("page");
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams]
  );

  function toggleTier(subcategory: string, tier: number) {
    setUnlocks((prev) => {
      const next = { ...prev };
      if (next[subcategory] === tier) {
        delete next[subcategory];
      } else {
        next[subcategory] = tier;
      }
      return next;
    });
  }

  function clearAll() {
    setUnlocks({});
  }

  function handleSave() {
    applyUnlocks(unlocks);
    onClose();
  }

  function toggleCategory(cat: string) {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  if (!open) return null;

  const categories = Object.entries(subcategoriesByCategory).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-albion-darker border border-gray-700 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">My Crafts</h2>
          <div className="flex gap-2">
            <button
              onClick={clearAll}
              className="px-3 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
            >
              Clear All
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Apply
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 space-y-3">
          <p className="text-xs text-gray-400 mb-2">
            Select your unlocked crafting subcategories and max tier. Only
            matching items will appear in the dashboard.
          </p>
          {categories.map(([category, subcategories]) => (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-2 w-full text-left text-sm font-semibold text-gray-200 hover:text-white py-1"
              >
                <span className="text-xs text-gray-500">
                  {collapsed[category] ? "▶" : "▼"}
                </span>
                {formatName(category)}
                <span className="text-xs text-gray-500 font-normal">
                  ({subcategories.length})
                </span>
              </button>
              {!collapsed[category] && (
                <div className="ml-4 space-y-1">
                  {subcategories.map((sub) => (
                    <div key={sub} className="flex items-center gap-2">
                      <span className="text-xs text-gray-300 w-32 truncate">
                        {formatName(sub)}
                      </span>
                      <div className="flex gap-1">
                        {TIERS.map((t) => (
                          <button
                            key={t}
                            onClick={() => toggleTier(sub, t)}
                            className={`px-1.5 py-0.5 text-xs rounded ${
                              unlocks[sub] !== undefined && unlocks[sub] >= t
                                ? unlocks[sub] === t
                                  ? "bg-blue-600 text-white"
                                  : "bg-blue-900 text-blue-300"
                                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                            }`}
                          >
                            T{t}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
