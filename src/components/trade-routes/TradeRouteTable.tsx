import TradeRouteRow from "./TradeRouteRow";
import type { TradeRouteResult } from "@/types/trade-route";

interface TradeRouteTableProps {
  items: TradeRouteResult[];
  page: number;
  pageSize: number;
  fromCity: string;
  toCity: string;
}

export default function TradeRouteTable({ items, page, pageSize, fromCity, toCity }: TradeRouteTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">No profitable trade routes found</p>
        <p className="text-sm mt-2">Try adjusting your filters or changing the cities</p>
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
            <th className="py-2 px-3 text-right">
              <div>Buy Price</div>
              <div className="text-[10px] text-gray-500 font-normal">{fromCity}</div>
            </th>
            <th className="py-2 px-3 text-right">
              <div>Sell Price</div>
              <div className="text-[10px] text-gray-500 font-normal">{toCity}</div>
            </th>
            <th className="py-2 px-3 text-right">Profit</th>
            <th className="py-2 px-3 text-right">Margin</th>
            <th className="py-2 px-3 text-right">Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <TradeRouteRow key={item.itemId} item={item} rank={startRank + i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
