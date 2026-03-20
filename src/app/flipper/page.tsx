import { Suspense } from "react";
import FlipFilterBar from "@/components/flipper/FlipFilterBar";
import FlipTable from "@/components/flipper/FlipTable";
import FlipPagination from "@/components/flipper/FlipPagination";
import { TableSkeleton } from "@/components/ui/LoadingState";
import AutoRefresh from "@/components/dashboard/AutoRefresh";
import { rankFlips } from "@/lib/engine/flip-ranker";
import type { FlipQuery, FlipSortField } from "@/types/flip";
import type { Region } from "@/types/market";

interface FlipperProps {
  searchParams: {
    tiers?: string;
    enchantments?: string;
    category?: string;
    buyCities?: string;
    sellCities?: string;
    minProfit?: string;
    minMargin?: string;
    sort?: string;
    order?: string;
    page?: string;
    region?: string;
    maxage?: string;
    search?: string;
  };
}

async function FlipperContent({ searchParams }: FlipperProps) {
  const query: FlipQuery = {
    tiers: searchParams.tiers ? searchParams.tiers.split(",").map(Number) : undefined,
    enchantments: searchParams.enchantments
      ? searchParams.enchantments.split(",").map(Number)
      : undefined,
    categories: searchParams.category ? [searchParams.category] : undefined,
    buyCities: searchParams.buyCities ? searchParams.buyCities.split(",") : undefined,
    sellCities: searchParams.sellCities ? searchParams.sellCities.split(",") : undefined,
    minProfit: searchParams.minProfit ? parseInt(searchParams.minProfit) : undefined,
    minMargin: searchParams.minMargin ? parseFloat(searchParams.minMargin) / 100 : undefined,
    sortBy: (searchParams.sort as FlipSortField) ?? "profit",
    sortOrder: (searchParams.order as "asc" | "desc") ?? "desc",
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    maxAge: searchParams.maxage ? parseInt(searchParams.maxage) : undefined,
    search: searchParams.search ?? undefined,
  };

  const region = (searchParams.region as Region) ?? "europe";

  try {
    const result = await rankFlips(query, region);
    return (
      <>
        <FlipTable items={result.items} page={result.page} pageSize={result.pageSize} />
        <Suspense>
          <FlipPagination page={result.page} totalPages={result.totalPages} total={result.total} />
        </Suspense>
      </>
    );
  } catch (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-lg">Failed to load flip data</p>
        <p className="text-gray-500 text-sm mt-2">
          {error instanceof Error ? error.message : "The Albion API may be unavailable. Try again later."}
        </p>
      </div>
    );
  }
}

export default function FlipperPage({ searchParams }: FlipperProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Market Flipper
        <AutoRefresh />
      </h1>
      <p className="text-gray-400 text-sm mb-4">
        Find items to buy cheap in one city and sell for profit in another. Prices include the {(0.065 * 100).toFixed(1)}% market tax.
      </p>
      <Suspense>
        <FlipFilterBar />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <FlipperContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
