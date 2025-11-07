/**
 * Song Cache System
 * In-memory cache with TTL to reduce database queries
 */

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 100

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class SongCache {
  private cache: Map<string, CacheEntry<any>>
  private hitCount: number = 0
  private missCount: number = 0

  constructor() {
    this.cache = new Map()
  }

  /**
   * Get cached data by key
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.missCount++
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      this.cache.delete(key)
      this.missCount++
      return null
    }

    this.hitCount++
    return entry.data as T
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T): void {
    // Enforce max cache size (LRU eviction)
    if (this.cache.size >= MAX_CACHE_SIZE && !this.cache.has(key)) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hitCount + this.missCount
    const hitRate = total > 0 ? (this.hitCount / total) * 100 : 0

    return {
      size: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: hitRate.toFixed(2) + '%',
    }
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_DURATION) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton instance
const songCache = new SongCache()

// Clean expired entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    songCache.cleanExpired()
  }, 60 * 1000)
}

/**
 * Generate cache key from filters
 */
export function generateCacheKey(filters: Record<string, any>): string {
  const sortedKeys = Object.keys(filters).sort()
  const keyParts = sortedKeys.map((key) => `${key}:${filters[key]}`)
  return `songs:${keyParts.join('|')}`
}

/**
 * Get cached songs or fetch and cache
 */
export async function getCachedSongs<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try cache first
  const cached = songCache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Fetch and cache
  const data = await fetchFn()
  songCache.set(key, data)
  return data
}

export default songCache

