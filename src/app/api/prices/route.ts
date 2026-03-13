import { NextRequest, NextResponse } from "next/server";
import { fetchPrices, fetchHistory } from "@/lib/api/albion-client";
import { priceCache } from "@/lib/cache/price-cache";
import type { Region } from "@/types/market";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") ?? "prices";
  const region = (searchParams.get("region") ?? "europe") as Region;

  try {
    if (type === "history") {
      const itemId = searchParams.get("itemId");
      if (!itemId) {
        return NextResponse.json({ error: "itemId required" }, { status: 400 });
      }
      const locations = searchParams.get("locations")?.split(",") ?? ["Caerleon"];
      const cacheKey = `history:${itemId}:${locations.join(",")}:${region}`;
      const cached = priceCache.get(cacheKey);
      if (cached) return NextResponse.json(cached);

      const data = await fetchHistory(itemId, locations, region);
      priceCache.set(cacheKey, data);
      return NextResponse.json(data);
    }

    // Prices
    const itemIds = searchParams.get("items")?.split(",");
    if (!itemIds?.length) {
      return NextResponse.json({ error: "items required" }, { status: 400 });
    }
    const locations = searchParams.get("locations")?.split(",") ?? ["Caerleon"];
    const cacheKey = `prices:${itemIds.join(",")}:${locations.join(",")}:${region}`;
    const cached = priceCache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const data = await fetchPrices(itemIds, locations, region);
    priceCache.set(cacheKey, data);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "API error" },
      { status: 500 }
    );
  }
}
