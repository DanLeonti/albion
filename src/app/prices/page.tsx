import { Suspense } from "react";
import { loadItemsMeta } from "@/lib/data/items";
import PriceChecker from "@/components/prices/PriceChecker";
import type { ItemMeta } from "@/types/item";

export default function PricesPage() {
  const items: ItemMeta[] = loadItemsMeta();

  return (
    <Suspense>
      <PriceChecker items={items} />
    </Suspense>
  );
}
