"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Region } from "@/types/market";

const REGIONS: { value: Region; label: string }[] = [
  { value: "europe", label: "Europe" },
  { value: "americas", label: "Americas" },
  { value: "asia", label: "Asia" },
];

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRegion = (searchParams.get("region") ?? "europe") as Region;

  function handleRegionChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("region", e.target.value);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <nav className="bg-albion-darker border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold text-white hover:text-blue-400 transition">
            Albion Craft Profit
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition">
            Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400">Region:</label>
          <select
            value={currentRegion}
            onChange={handleRegionChange}
            className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}
