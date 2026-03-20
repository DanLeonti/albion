import { Suspense } from "react";
import TradeRouteFilterBar from "@/components/trade-routes/TradeRouteFilterBar";
import TradeRouteTable from "@/components/trade-routes/TradeRouteTable";
import TradeRoutePagination from "@/components/trade-routes/TradeRoutePagination";
import { TableSkeleton } from "@/components/ui/LoadingState";
import AutoRefresh from "@/components/dashboard/AutoRefresh";
import { rankTradeRoutes } from "@/lib/engine/trade-route-ranker";
import type { TradeRouteQuery, TradeRouteSortField } from "@/types/trade-route";
import type { Region } from "@/types/market";

interface TradeRoutesProps {
  searchParams: {
    from?: string;
    to?: string;
    tiers?: string;
    enchantments?: string;
    category?: string;
    minprofit?: string;
    sort?: string;
    order?: string;
    page?: string;
    region?: string;
    maxage?: string;
  };
}

async function TradeRoutesContent({ searchParams }: TradeRoutesProps) {
  const query: TradeRouteQuery = {
    fromCity: searchParams.from ?? "Caerleon",
    toCity: searchParams.to ?? "Black Market",
    tiers: searchParams.tiers ? searchParams.tiers.split(",").map(Number) : undefined,
    enchantments: searchParams.enchantments
      ? searchParams.enchantments.split(",").map(Number)
      : undefined,
    categories: searchParams.category ? [searchParams.category] : undefined,
    minProfit: searchParams.minprofit ? parseInt(searchParams.minprofit) : undefined,
    sortBy: (searchParams.sort as TradeRouteSortField) ?? "profit",
    sortOrder: (searchParams.order as "asc" | "desc") ?? "desc",
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    maxAge: searchParams.maxage ? parseInt(searchParams.maxage) : undefined,
  };

  const region = (searchParams.region as Region) ?? "europe";

  try {
    const result = await rankTradeRoutes(query, region);
    return (
      <>
        <TradeRouteTable
          items={result.items}
          page={result.page}
          pageSize={result.pageSize}
          fromCity={query.fromCity}
          toCity={query.toCity}
        />
        <Suspense>
          <TradeRoutePagination page={result.page} totalPages={result.totalPages} total={result.total} />
        </Suspense>
      </>
    );
  } catch (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-lg">Failed to load trade route data</p>
        <p className="text-gray-500 text-sm mt-2">
          {error instanceof Error ? error.message : "The Albion API may be unavailable. Try again later."}
        </p>
      </div>
    );
  }
}

export default function TradeRoutesPage({ searchParams }: TradeRoutesProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">
        Trade Routes
        <AutoRefresh />
      </h1>
      <p className="text-sm text-gray-400 mb-4">
        Find the most profitable items to transport between two cities. Buy low, sell high.
      </p>
      <Suspense>
        <TradeRouteFilterBar />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <TradeRoutesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
