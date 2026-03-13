import { NextRequest, NextResponse } from "next/server";
import { rankProfits } from "@/lib/engine/ranker";
import type { ProfitQuery, SortField } from "@/types/profit";
import type { Region } from "@/types/market";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query: ProfitQuery = {
    tiers: searchParams.get("tiers")
      ? searchParams.get("tiers")!.split(",").map(Number)
      : undefined,
    enchantments: searchParams.get("enchantments")
      ? searchParams.get("enchantments")!.split(",").map(Number)
      : undefined,
    categories: searchParams.get("category")
      ? [searchParams.get("category")!]
      : undefined,
    city: searchParams.get("city") ?? "Caerleon",
    useFocus: searchParams.get("focus") === "true",
    feePercentage: searchParams.get("fee")
      ? parseInt(searchParams.get("fee")!) / 100
      : 0.03,
    sortBy: (searchParams.get("sort") as SortField) ?? "profit",
    sortOrder: (searchParams.get("order") as "asc" | "desc") ?? "desc",
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
  };

  const region = (searchParams.get("region") as Region) ?? "europe";

  try {
    const result = await rankProfits(query, region);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Calculation error" },
      { status: 500 }
    );
  }
}
