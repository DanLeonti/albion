import { NextRequest, NextResponse } from "next/server";
import { rankTopItems, type TopItemsQuery } from "@/lib/engine/top-items-ranker";
import type { Region } from "@/types/market";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query: TopItemsQuery = {
    tiers: searchParams.get("tiers")
      ? searchParams.get("tiers")!.split(",").map(Number)
      : undefined,
    enchantments: searchParams.get("enchantments")
      ? searchParams.get("enchantments")!.split(",").map(Number)
      : undefined,
    category: searchParams.get("category") || undefined,
    sortBy: (searchParams.get("sort") as "price" | "name") ?? "price",
    sortOrder: (searchParams.get("order") as "asc" | "desc") ?? "desc",
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
  };

  const region = (searchParams.get("region") as Region) ?? "europe";

  try {
    const result = await rankTopItems(query, region);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "API error" },
      { status: 500 }
    );
  }
}
