import TopItemsRow from "./TopItemsRow";
import type { TopItemEntry } from "@/lib/engine/top-items-ranker";

interface TopItemsTableProps {
  items: TopItemEntry[];
  page: number;
  pageSize: number;
}

export default function TopItemsTable({
  items,
  page,
  pageSize,
}: TopItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">No items found</p>
        <p className="text-sm mt-2">
          Try adjusting your filters
        </p>
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
            <th className="py-2 px-3 text-right">Best Price</th>
            <th className="py-2 px-3 text-right">City</th>
            <th className="py-2 px-3 text-right">Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <TopItemsRow
              key={item.itemId}
              item={item}
              rank={startRank + i}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
