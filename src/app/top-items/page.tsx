import { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/LoadingState";
import AutoRefresh from "@/components/dashboard/AutoRefresh";
import TopItemsFilterBar from "@/components/top-items/TopItemsFilterBar";
import TopItemsTable from "@/components/top-items/TopItemsTable";
import TopItemsPagination from "@/components/top-items/TopItemsPagination";
import { rankTopItems, type TopItemsQuery } from "@/lib/engine/top-items-ranker";
import type { Region } from "@/types/market";

export const metadata = {
  title: "Top Items - Albion Crafting Profit Calculator",
  description: "Most expensive items in Albion Online",
};

interface TopItemsPageProps {
  searchParams: {
    tiers?: string;
    enchantments?: string;
    category?: string;
    sort?: string;
    order?: string;
    page?: string;
    region?: string;
  };
}

async function TopItemsContent({ searchParams }: TopItemsPageProps) {
  const query: TopItemsQuery = {
    tiers: searchParams.tiers
      ? searchParams.tiers.split(",").map(Number)
      : undefined,
    enchantments: searchParams.enchantments
      ? searchParams.enchantments.split(",").map(Number)
      : undefined,
    category: searchParams.category || undefined,
    sortBy: (searchParams.sort as "price" | "name") ?? "price",
    sortOrder: (searchParams.order as "asc" | "desc") ?? "desc",
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  };

  const region = (searchParams.region as Region) ?? "europe";

  try {
    const result = await rankTopItems(query, region);
    return (
      <>
        <TopItemsTable
          items={result.items}
          page={result.page}
          pageSize={result.pageSize}
        />
        <Suspense>
          <TopItemsPagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
          />
        </Suspense>
      </>
    );
  } catch (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-lg">Failed to load top items</p>
        <p className="text-gray-500 text-sm mt-2">
          {error instanceof Error
            ? error.message
            : "The Albion API may be unavailable. Try again later."}
        </p>
      </div>
    );
  }
}

export default function TopItemsPage({ searchParams }: TopItemsPageProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Top Items
        <AutoRefresh />
      </h1>
      <Suspense>
        <TopItemsFilterBar />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <TopItemsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
