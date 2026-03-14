export interface ProfitResult {
  itemId: string;
  name: string;
  tier: number;
  enchantment: number;
  category: string;
  subcategory: string;
  sellPrice: number;
  sellCity: string;
  materialCost: number;
  materialCostAfterReturn: number;
  craftingFee: number;
  marketTax: number;
  profit: number;
  profitMargin: number;
  dailyVolume: number;
  /** Estimated silver per hour based on crafting speed */
  silverPerHour: number | null;
  isArtifact: boolean;
  materials: MaterialCost[];
  lastUpdated: string;
}

export interface MaterialCost {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  buyCity: string;
}

export interface ProfitQuery {
  tiers?: number[];
  enchantments?: number[];
  categories?: string[];
  city?: string;
  useFocus?: boolean;
  feePercentage?: number;
  sortBy?: SortField;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  unlocks?: Record<string, number>;  // subcategory → max tier
  hideArtifacts?: boolean;
  maxAge?: number; // max data age in hours
}

export type SortField =
  | "profit"
  | "profitMargin"
  | "sellPrice"
  | "materialCost"
  | "dailyVolume"
  | "silverPerHour"
  | "name";
