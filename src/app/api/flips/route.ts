import { NextRequest, NextResponse } from "next/server";
import { rankFlips } from "@/lib/engine/flip-ranker";
import type { FlipQuery, FlipSortField } from "@/types/flip";
import type { Region } from "@/types/market";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query: FlipQuery = {
    tiers: searchParams.get("tiers")
      ? searchParams.get("tiers")!.split(",").map(Number)
      : undefined,
    enchantments: searchParams.get("enchantments")
      ? searchParams.get("enchantments")!.split(",").map(Number)
      : undefined,
    categories: searchParams.get("category")
      ? [searchParams.get("category")!]
      : undefined,
    buyCities: searchParams.get("buyCities")
      ? searchParams.get("buyCities")!.split(",")
      : undefined,
    sellCities: searchParams.get("sellCities")
      ? searchParams.get("sellCities")!.split(",")
      : undefined,
    minProfit: searchParams.get("minProfit")
      ? parseInt(searchParams.get("minProfit")!)
      : undefined,
    minMargin: searchParams.get("minMargin")
      ? parseFloat(searchParams.get("minMargin")!) / 100
      : undefined,
    sortBy: (searchParams.get("sort") as FlipSortField) ?? "profit",
    sortOrder: (searchParams.get("order") as "asc" | "desc") ?? "desc",
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
    maxAge: searchParams.get("maxage") ? parseInt(searchParams.get("maxage")!) : undefined,
    search: searchParams.get("search") ?? undefined,
  };

  const region = (searchParams.get("region") as Region) ?? "europe";

  try {
    const result = await rankFlips(query, region);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Calculation error" },
      { status: 500 }
    );
  }
}
