"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

export function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams]
  );

  return {
    searchParams,
    updateParam,
    tiers: searchParams.get("tiers") ?? "",
    enchantments: searchParams.get("enchantments") ?? "",
    category: searchParams.get("category") ?? "",
    city: searchParams.get("city") ?? "Caerleon",
    useFocus: searchParams.get("focus") === "true",
    feePercent: searchParams.get("fee") ?? "3",
    sortBy: searchParams.get("sort") ?? "profit",
    page: parseInt(searchParams.get("page") ?? "1"),
  };
}
