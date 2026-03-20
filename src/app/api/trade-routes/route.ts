import { NextRequest, NextResponse } from "next/server";
import { rankTradeRoutes } from "@/lib/engine/trade-route-ranker";
import type { TradeRouteQuery, TradeRouteSortField } from "@/types/trade-route";
import type { Region } from "@/types/market";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const fromCity = searchParams.get("from") ?? "Caerleon";
  const toCity = searchParams.get("to") ?? "Black Market";

  if (fromCity === toCity) {
    return NextResponse.json(
      { error: "From and To cities must be different" },
      { status: 400 }
    );
  }

  const query: TradeRouteQuery = {
    fromCity,
    toCity,
    tiers: searchParams.get("tiers")
      ? searchParams.get("tiers")!.split(",").map(Number)
      : undefined,
    enchantments: searchParams.get("enchantments")
      ? searchParams.get("enchantments")!.split(",").map(Number)
      : undefined,
    categories: searchParams.get("category")
      ? [searchParams.get("category")!]
      : undefined,
    minProfit: searchParams.get("minprofit")
      ? parseInt(searchParams.get("minprofit")!)
      : undefined,
    sortBy: (searchParams.get("sort") as TradeRouteSortField) ?? "profit",
    sortOrder: (searchParams.get("order") as "asc" | "desc") ?? "desc",
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
    maxAge: searchParams.get("maxage") ? parseInt(searchParams.get("maxage")!) : undefined,
  };

  const region = (searchParams.get("region") as Region) ?? "europe";

  try {
    const result = await rankTradeRoutes(query, region);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Calculation error" },
      { status: 500 }
    );
  }
}
