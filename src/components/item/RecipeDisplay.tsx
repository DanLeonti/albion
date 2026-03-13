import ItemIcon from "@/components/ui/ItemIcon";
import type { Recipe } from "@/types/item";

interface RecipeDisplayProps {
  recipe: Recipe;
  itemNames: Map<string, string>;
}

export default function RecipeDisplay({ recipe, itemNames }: RecipeDisplayProps) {
  return (
    <div className="bg-albion-darker rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Recipe</h3>
      <div className="flex items-center gap-4">
        {/* Materials */}
        <div className="flex flex-wrap gap-3">
          {recipe.craftingRequirements.map((mat) => (
            <div key={mat.itemId} className="flex items-center gap-1.5 bg-gray-800 rounded px-2 py-1">
              <ItemIcon itemId={mat.itemId} size={28} />
              <div>
                <div className="text-xs text-gray-300">{itemNames.get(mat.itemId) ?? mat.itemId}</div>
                <div className="text-xs text-gray-500">x{mat.count}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Arrow */}
        <div className="text-2xl text-gray-500 px-2">→</div>

        {/* Result */}
        <div className="flex items-center gap-1.5 bg-gray-800 rounded px-3 py-2 border border-gray-600">
          <ItemIcon itemId={recipe.itemId} size={36} />
          <div>
            <div className="text-sm text-white">{itemNames.get(recipe.itemId) ?? recipe.itemId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
