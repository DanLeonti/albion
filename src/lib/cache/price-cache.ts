import { CACHE_TTL } from "@/lib/data/constants";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Simple in-memory TTL cache using globalThis for Next.js dev compatibility.
 * In dev mode, Next.js re-evaluates modules but globalThis persists.
 */
class PriceCache {
  private cache: Map<string, CacheEntry<unknown>>;

  constructor() {
    // Use globalThis to persist across Next.js hot reloads
    const key = "__albion_price_cache__";
    if (!(globalThis as any)[key]) {
      (globalThis as any)[key] = new Map();
    }
    this.cache = (globalThis as any)[key];
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

export const priceCache = new PriceCache();
