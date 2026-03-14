"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CITIES } from "@/types/market";

export default function ItemCitySelector({ currentCity }: { currentCity: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("city", e.target.value);
    router.push(`?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-gray-300">
      City
      <select
        value={currentCity}
        onChange={handleChange}
        className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none"
      >
        {CITIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </label>
  );
}
