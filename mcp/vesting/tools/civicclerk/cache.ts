// Ported verbatim from finance-mcp-server-ts's tools/civicclerk/cache.ts.
type CacheEntry<T> = {
  data: T
  timestamp: number
  bytes: number
}

interface CacheConfig {
  maxSize: number
  ttlMs: number
  maxBytes: number
}

// Rough size estimate (chars ~ bytes for our JSON payloads) -- good enough for eviction
// accounting, not a precise memory measurement.
const estimateBytes = (value: unknown): number => {
  try {
    return JSON.stringify(value).length
  } catch {
    return 0
  }
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>
  private accessOrder: string[] = []
  private config: CacheConfig
  private totalBytes = 0

  constructor(maxSize: number = 50, ttlMs: number = 3_600_000, maxBytes: number = 100 * 1024 * 1024) {
    this.cache = new Map()
    this.config = { maxSize, ttlMs, maxBytes }
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if(!entry) return null

    const age = Date.now() - entry.timestamp
    if(age > this.config.ttlMs) {
      this.evict(key)
      return null
    }

    // Move to end (most recently accessed)
    this.accessOrder = this.accessOrder.filter((k) => k !== key)
    this.accessOrder.push(key)

    return entry.data
  }

  set(key: string, value: T): void {
    if(this.cache.has(key)) {
      this.evict(key)
    }

    const bytes = estimateBytes(value)

    // A single entry larger than the whole budget isn't worth caching at all.
    if(bytes > this.config.maxBytes) return

    this.cache.set(key, { data: value, timestamp: Date.now(), bytes })
    this.accessOrder.push(key)
    this.totalBytes += bytes

    // Evict oldest while over the entry-count cap or the total byte budget
    while(
      this.accessOrder.length > this.config.maxSize ||
      this.totalBytes > this.config.maxBytes
    ) {
      const oldest = this.accessOrder[0]
      if(!oldest) break
      this.evict(oldest)
    }
  }

  private evict(key: string): void {
    const entry = this.cache.get(key)
    if(entry) this.totalBytes -= entry.bytes
    this.cache.delete(key)
    this.accessOrder = this.accessOrder.filter((k) => k !== key)
  }

  clear(): void {
    this.cache.clear()
    this.accessOrder = []
    this.totalBytes = 0
  }

  size(): number {
    return this.cache.size
  }

  stats(): { size: number; maxSize: number; ttlMs: number; totalBytes: number; maxBytes: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttlMs: this.config.ttlMs,
      totalBytes: this.totalBytes,
      maxBytes: this.config.maxBytes,
    }
  }
}

// Global caches for CivicClerk data. maxBytes bounds total memory regardless of entry count --
// meeting/event payloads can run 10-15MB per full-year range, so the count cap alone isn't enough.
export const meetingCache = new LRUCache<any[]>(50, 3_600_000, 150 * 1024 * 1024)
export const searchResultsCache = new LRUCache<any>(50, 3_600_000, 20 * 1024 * 1024)

export const createDateRangeCacheKey = (prefix: string, startDate: string, endDate: string, filter?: string): string => {
  const filterStr = filter ? `:${ filter }` : ""
  return `${ prefix }:${ startDate }:${ endDate }${ filterStr }`
}

export const createSearchCacheKey = (query: string, startDate: string, endDate: string, nameFilter?: string): string => {
  const filterStr = nameFilter ? `:${ nameFilter }` : ""
  return `search:${ query }:${ startDate }:${ endDate }${ filterStr }`
}
