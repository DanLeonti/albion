import Link from "next/link";
import ItemIcon from "@/components/ui/ItemIcon";
import { formatSilver, formatPercent } from "@/lib/utils/formatting";
import type { RecipeTreeNode } from "@/types/item";

interface RecipeTreeProps {
  tree: RecipeTreeNode;
}

export default function RecipeTree({ tree }: RecipeTreeProps) {
  if (tree.children.length === 0) return null;

  return (
    <div className="bg-albion-darker rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Full Crafting Tree</h3>
      <div className="overflow-x-auto">
        <TreeNode node={tree} isLast={true} prefix="" isRoot />
      </div>
    </div>
  );
}

function TreeNode({
  node,
  isLast,
  prefix,
  isRoot,
}: {
  node: RecipeTreeNode;
  isLast: boolean;
  prefix: string;
  isRoot: boolean;
}) {
  const connector = isRoot ? "" : isLast ? "└─ " : "├─ ";
  const childPrefix = isRoot ? "" : prefix + (isLast ? "   " : "│  ");

  return (
    <div>
      <div className="flex items-center gap-2 py-1 whitespace-nowrap">
        <span className="text-gray-600 font-mono text-xs select-none">
          {prefix}{connector}
        </span>
        <ItemIcon itemId={node.itemId} size={24} />
        <NodeLabel node={node} isRoot={isRoot} />
        <NodeCosts node={node} />
      </div>
      {node.children.map((child, i) => (
        <TreeNode
          key={child.itemId}
          node={child}
          isLast={i === node.children.length - 1}
          prefix={childPrefix}
          isRoot={false}
        />
      ))}
    </div>
  );
}

function NodeLabel({ node, isRoot }: { node: RecipeTreeNode; isRoot: boolean }) {
  const label = (
    <span className="text-sm text-gray-200">
      {node.name}
      {!isRoot && <span className="text-gray-500 ml-1">x{node.quantity}</span>}
    </span>
  );

  if (!node.isRaw && !isRoot) {
    return (
      <Link href={`/item/${encodeURIComponent(node.itemId)}`} className="hover:underline text-blue-300">
        {label}
      </Link>
    );
  }

  return label;
}

function NodeCosts({ node }: { node: RecipeTreeNode }) {
  if (node.isRaw) {
    return (
      <span className="ml-auto flex items-center gap-3 text-xs">
        {node.marketPrice != null && (
          <span className="text-gray-400">
            Buy: <span className="font-mono text-gray-200">{formatSilver(node.marketPrice)}</span>
          </span>
        )}
        <span className="text-gray-600 bg-gray-800 rounded px-1.5 py-0.5">Raw</span>
      </span>
    );
  }

  const margin = node.profit?.profitMargin ?? null;

  return (
    <span className="ml-auto flex items-center gap-3 text-xs">
      {node.craftCost != null && (
        <span className="text-gray-400">
          Craft: <span className="font-mono text-gray-200">{formatSilver(Math.round(node.craftCost))}</span>
        </span>
      )}
      {node.marketPrice != null && (
        <span className="text-gray-400">
          Buy: <span className="font-mono text-gray-200">{formatSilver(node.marketPrice)}</span>
        </span>
      )}
      {margin != null && (
        <span
          className={`font-mono rounded px-1.5 py-0.5 ${
            margin > 0 ? "text-green-400 bg-green-900/30" : "text-red-400 bg-red-900/30"
          }`}
        >
          {margin > 0 ? "+" : ""}
          {formatPercent(margin)}
        </span>
      )}
      {node.craftCost == null && node.marketPrice == null && (
        <span className="text-gray-600">No data</span>
      )}
    </span>
  );
}
