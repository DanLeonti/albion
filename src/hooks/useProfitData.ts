"use client";

import useSWR from "swr";
import type { RankerResult } from "@/lib/engine/ranker";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useProfitData(params: URLSearchParams) {
  const url = `/api/profits?${params.toString()}`;
  return useSWR<RankerResult>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
}
