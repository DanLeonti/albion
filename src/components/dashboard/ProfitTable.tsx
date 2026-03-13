import ProfitRow from "./ProfitRow";
import type { ProfitResult } from "@/types/profit";

interface ProfitTableProps {
  items: ProfitResult[];
  page: number;
  pageSize: number;
}

export default function ProfitTable({ items, page, pageSize }: ProfitTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">No profitable items found</p>
        <p className="text-sm mt-2">Try adjusting your filters or changing the crafting city</p>
      </div>
    );
  }

  const startRank = (page - 1) * pageSize + 1;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-xs text-gray-400 border-b border-gray-700">
            <th className="py-2 px-3 text-left w-10">#</th>
            <th className="py-2 px-3 text-left">Item</th>
            <th className="py-2 px-3 text-right">Sell Price</th>
            <th className="py-2 px-3 text-right">Mat Cost</th>
            <th className="py-2 px-3 text-right">Fee</th>
            <th className="py-2 px-3 text-right">Profit</th>
            <th className="py-2 px-3 text-right">Margin</th>
            <th className="py-2 px-3 text-right">Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <ProfitRow key={item.itemId} item={item} rank={startRank + i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
