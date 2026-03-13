import itemsMetaData from "../../../data/items-meta.json";
import type { ItemMeta } from "@/types/item";

let itemsCache: ItemMeta[] | null = null;
let nameIndex: Map<string, string> | null = null;
let metaIndex: Map<string, ItemMeta> | null = null;

export function loadItemsMeta(): ItemMeta[] {
  if (itemsCache) return itemsCache;
  itemsCache = itemsMetaData as ItemMeta[];
  return itemsCache;
}

export function getItemNames(): Map<string, string> {
  if (nameIndex) return nameIndex;
  nameIndex = new Map();
  for (const item of loadItemsMeta()) {
    nameIndex.set(item.itemId, item.name);
  }
  return nameIndex;
}

export function getItemMeta(itemId: string): ItemMeta | undefined {
  if (!metaIndex) {
    metaIndex = new Map();
    for (const item of loadItemsMeta()) {
      metaIndex.set(item.itemId, item);
    }
  }
  return metaIndex.get(itemId);
}
