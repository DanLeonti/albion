import { Suspense } from "react";
import FilterBar from "@/components/dashboard/FilterBar";
import ProfitTable from "@/components/dashboard/ProfitTable";
import Pagination from "@/components/dashboard/SortControls";
import { TableSkeleton } from "@/components/ui/LoadingState";
import AutoRefresh from "@/components/dashboard/AutoRefresh";
import { rankProfits } from "@/lib/engine/ranker";
import { getSubcategoriesByCategory } from "@/lib/data/recipes";
import type { ProfitQuery, SortField } from "@/types/profit";
import type { Region } from "@/types/market";

interface DashboardProps {
  searchParams: {
    tiers?: string;
    enchantments?: string;
    category?: string;
    city?: string;
    focus?: string;
    fee?: string;
    sort?: string;
    order?: string;
    page?: string;
    region?: string;
    unlocks?: string;
    artifacts?: string;
    maxage?: string;
  };
}

async function DashboardContent({ searchParams }: DashboardProps) {
  const query: ProfitQuery = {
    tiers: searchParams.tiers ? searchParams.tiers.split(",").map(Number) : undefined,
    enchantments: searchParams.enchantments
      ? searchParams.enchantments.split(",").map(Number)
      : undefined,
    categories: searchParams.category ? [searchParams.category] : undefined,
    city: searchParams.city ?? "Caerleon",
    useFocus: searchParams.focus === "true",
    feePercentage: searchParams.fee ? parseInt(searchParams.fee) / 100 : 0.03,
    sortBy: (searchParams.sort as SortField) ?? "profit",
    sortOrder: (searchParams.order as "asc" | "desc") ?? "desc",
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    unlocks: searchParams.unlocks
      ? Object.fromEntries(
          searchParams.unlocks.split(",").map((s) => {
            const [sub, tier] = s.split(":");
            return [sub, parseInt(tier)];
          })
        )
      : undefined,
    hideArtifacts: searchParams.artifacts !== "show",
    maxAge: searchParams.maxage ? parseInt(searchParams.maxage) : undefined,
  };

  const region = (searchParams.region as Region) ?? "europe";

  try {
    const result = await rankProfits(query, region);
    return (
      <>
        <ProfitTable items={result.items} page={result.page} pageSize={result.pageSize} />
        <Suspense>
          <Pagination page={result.page} totalPages={result.totalPages} total={result.total} />
        </Suspense>
      </>
    );
  } catch (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-lg">Failed to load profit data</p>
        <p className="text-gray-500 text-sm mt-2">
          {error instanceof Error ? error.message : "The Albion API may be unavailable. Try again later."}
        </p>
      </div>
    );
  }
}

export default function DashboardPage({ searchParams }: DashboardProps) {
  const subcatMap = getSubcategoriesByCategory();
  const subcategoriesByCategory: Record<string, string[]> = {};
  for (const [cat, subs] of subcatMap) {
    subcategoriesByCategory[cat] = subs;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Crafting Profit Rankings
        <AutoRefresh />
      </h1>
      <Suspense>
        <FilterBar subcategoriesByCategory={subcategoriesByCategory} />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
