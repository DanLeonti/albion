import { loadItemsMeta } from "@/lib/data/items";
import PriceChartViewer from "@/components/charts/PriceChartViewer";
import type { ItemMeta } from "@/types/item";

export const metadata = {
  title: "Price Charts - Albion Crafting Profit Calculator",
  description: "View price history charts for any Albion Online item across all cities",
};

export default function ChartsPage() {
  const items = loadItemsMeta();

  // Send a lightweight list for the search autocomplete
  const itemList: Pick<ItemMeta, "itemId" | "name" | "tier" | "enchantment" | "category" | "subcategory">[] =
    items.map((item) => ({
      itemId: item.itemId,
      name: item.name,
      tier: item.tier,
      enchantment: item.enchantment,
      category: item.category,
      subcategory: item.subcategory,
    }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Price Charts</h1>
      <PriceChartViewer items={itemList} />
    </div>
  );
}
