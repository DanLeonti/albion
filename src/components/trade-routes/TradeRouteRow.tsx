import Link from "next/link";
import ItemIcon from "@/components/ui/ItemIcon";
import SilverDisplay from "@/components/ui/SilverDisplay";
import { tierDisplay, tierColor } from "@/lib/utils/item-ids";
import { formatPercent, formatRelativeTime } from "@/lib/utils/formatting";
import type { TradeRouteResult } from "@/types/trade-route";

function getAgeColor(dateStr: string): string {
  const ageMs = Date.now() - new Date(dateStr).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  if (ageHours < 1) return "text-green-400";
  if (ageHours < 24) return "text-yellow-400";
  return "text-red-400";
}

interface TradeRouteRowProps {
  item: TradeRouteResult;
  rank: number;
}

export default function TradeRouteRow({ item, rank }: TradeRouteRowProps) {
  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition">
      <td className="py-2 px-3 text-gray-500 text-sm">{rank}</td>
      <td className="py-2 px-3">
        <Link href={`/item/${encodeURIComponent(item.itemId)}`} className="flex items-center gap-2 hover:text-blue-400 transition">
          <ItemIcon itemId={item.itemId} size={32} />
          <div>
            <div className="text-sm text-white">{item.name}</div>
            <div className="text-xs" style={{ color: tierColor(item.tier) }}>
              {tierDisplay(item.tier, item.enchantment)} · {item.subcategory}
            </div>
          </div>
        </Link>
      </td>
      <td className="py-2 px-3 text-right">
        <SilverDisplay amount={item.buyPrice} />
      </td>
      <td className="py-2 px-3 text-right">
        <SilverDisplay amount={item.sellPrice} />
      </td>
      <td className="py-2 px-3 text-right font-bold">
        <SilverDisplay amount={item.profit} showSign />
      </td>
      <td className="py-2 px-3 text-right">
        <span className={item.profitMargin > 0 ? "text-green-400" : "text-red-400"}>
          {formatPercent(item.profitMargin)}
        </span>
      </td>
      <td className={`py-2 px-3 text-right text-xs ${getAgeColor(item.lastUpdated)}`}>
        {formatRelativeTime(item.lastUpdated)}
      </td>
    </tr>
  );
}
