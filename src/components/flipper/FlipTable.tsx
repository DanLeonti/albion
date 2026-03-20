import FlipRow from "./FlipRow";
import type { FlipResult } from "@/types/flip";

interface FlipTableProps {
  items: FlipResult[];
  page: number;
  pageSize: number;
}

export default function FlipTable({ items, page, pageSize }: FlipTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">No flip opportunities found</p>
        <p className="text-sm mt-2">Try adjusting your filters or city selection</p>
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
            <th className="py-2 px-3 text-right">Buy Price</th>
            <th className="py-2 px-3 text-right">Sell Price</th>
            <th className="py-2 px-3 text-right">Profit</th>
            <th className="py-2 px-3 text-right">Margin</th>
            <th className="py-2 px-3 text-right">Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <FlipRow key={`${item.itemId}-${item.buyCity}-${item.sellCity}`} item={item} rank={startRank + i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
