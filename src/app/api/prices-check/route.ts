import { NextRequest, NextResponse } from "next/server";
import { fetchPrices } from "@/lib/api/albion-client";
import { priceCache } from "@/lib/cache/price-cache";
import { CITIES, type Region } from "@/types/market";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const itemId = searchParams.get("itemId");
  const region = (searchParams.get("region") ?? "europe") as Region;

  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }

  const locations = [...CITIES];
  const cacheKey = `price-check:${itemId}:${locations.join(",")}:${region}`;
  const cached = priceCache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const data = await fetchPrices([itemId], locations, region);
    priceCache.set(cacheKey, data);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "API error" },
      { status: 500 }
    );
  }
}
