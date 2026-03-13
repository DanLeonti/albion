import recipesData from "../../../data/recipes.json";
import type { Recipe } from "@/types/item";

let recipesCache: Recipe[] | null = null;
let recipeIndex: Map<string, Recipe> | null = null;

export function loadRecipes(): Recipe[] {
  if (recipesCache) return recipesCache;
  recipesCache = recipesData as Recipe[];
  return recipesCache;
}

export function getRecipeById(itemId: string): Recipe | undefined {
  if (!recipeIndex) {
    recipeIndex = new Map();
    for (const recipe of loadRecipes()) {
      recipeIndex.set(recipe.itemId, recipe);
    }
  }
  return recipeIndex.get(itemId);
}

export function getRecipesByCategory(category: string): Recipe[] {
  return loadRecipes().filter((r) => r.category === category);
}

export function getAllCategories(): string[] {
  const cats = new Set<string>();
  for (const r of loadRecipes()) {
    cats.add(r.category);
  }
  return [...cats].sort();
}

export function getAllSubcategories(category?: string): string[] {
  const subs = new Set<string>();
  for (const r of loadRecipes()) {
    if (!category || r.category === category) {
      subs.add(r.subcategory);
    }
  }
  return [...subs].sort();
}

export function getSubcategoriesByCategory(): Map<string, string[]> {
  const map = new Map<string, Set<string>>();
  for (const r of loadRecipes()) {
    let set = map.get(r.category);
    if (!set) {
      set = new Set<string>();
      map.set(r.category, set);
    }
    set.add(r.subcategory);
  }
  const result = new Map<string, string[]>();
  for (const [cat, subs] of map) {
    result.set(cat, [...subs].sort());
  }
  return result;
}
