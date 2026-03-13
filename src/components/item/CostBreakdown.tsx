import ItemIcon from "@/components/ui/ItemIcon";
import SilverDisplay from "@/components/ui/SilverDisplay";
import type { MaterialCost } from "@/types/profit";

interface CostBreakdownProps {
  materials: MaterialCost[];
  totalCost: number;
  costAfterReturn: number;
  craftingFee: number;
  marketTax: number;
}

export default function CostBreakdown({
  materials,
  totalCost,
  costAfterReturn,
  craftingFee,
  marketTax,
}: CostBreakdownProps) {
  return (
    <div className="bg-albion-darker rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Cost Breakdown</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500">
            <th className="text-left pb-2">Material</th>
            <th className="text-right pb-2">Qty</th>
            <th className="text-right pb-2">Unit</th>
            <th className="text-right pb-2">Total</th>
            <th className="text-right pb-2">City</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((mat) => (
            <tr key={mat.itemId} className="border-t border-gray-800">
              <td className="py-2 flex items-center gap-2">
                <ItemIcon itemId={mat.itemId} size={24} />
                <span className="text-gray-300">{mat.name}</span>
              </td>
              <td className="py-2 text-right text-gray-400">{mat.quantity}</td>
              <td className="py-2 text-right">
                <SilverDisplay amount={mat.unitPrice} />
              </td>
              <td className="py-2 text-right">
                <SilverDisplay amount={mat.totalPrice} />
              </td>
              <td className="py-2 text-right text-xs text-gray-500">{mat.buyCity}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-gray-600 text-gray-300">
          <tr>
            <td colSpan={3} className="py-2 text-right">Raw Material Cost:</td>
            <td className="py-2 text-right"><SilverDisplay amount={totalCost} /></td>
            <td></td>
          </tr>
          <tr>
            <td colSpan={3} className="py-1 text-right text-xs text-gray-400">After Return Rate:</td>
            <td className="py-1 text-right"><SilverDisplay amount={costAfterReturn} /></td>
            <td></td>
          </tr>
          <tr>
            <td colSpan={3} className="py-1 text-right text-xs text-gray-400">Crafting Fee:</td>
            <td className="py-1 text-right"><SilverDisplay amount={craftingFee} /></td>
            <td></td>
          </tr>
          <tr>
            <td colSpan={3} className="py-1 text-right text-xs text-gray-400">Market Tax:</td>
            <td className="py-1 text-right"><SilverDisplay amount={marketTax} /></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
