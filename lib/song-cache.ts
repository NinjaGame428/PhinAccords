import { Song } from './song-data';

// Cache interface
interface CacheEntry {
  data: Song[];
  timestamp: number;
  expiresAt: number;
}

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Maximum number of cache entries

class SongCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = MAX_CACHE_SIZE;

  // Generate cache key
  private getCacheKey(query: string, category: string, limit: number, offset: number): string {
    return `${query}-${category}-${limit}-${offset}`;
  }

  // Check if cache entry is valid
  private isValid(entry: CacheEntry): boolean {
    return Date.now() < entry.expiresAt;
  }

  // Get data from cache
  get(query: string, category: string, limit: number, offset: number): Song[] | null {
    const key = this.getCacheKey(query, category, limit, offset);
    const entry = this.cache.get(key);
    
    if (entry && this.isValid(entry)) {
      console.log(`🎯 Cache hit for key: ${key}`);
      return entry.data;
    }
    
    if (entry) {
      console.log(`⏰ Cache expired for key: ${key}`);
      this.cache.delete(key);
    }
    
    return null;
  }

  // Set data in cache
  set(query: string, category: string, limit: number, offset: number, data: Song[]): void {
    const key = this.getCacheKey(query, category, limit, offset);
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION
    };
    
    this.cache.set(key, entry);
    console.log(`💾 Cached data for key: ${key}`);
  }

  // Clear cache
  clear(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  // Get cache stats
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // This would need to be tracked separately
    };
  }
}

// Export singleton instance
export const songCache = new SongCache();

// Cache utility functions
export const getCachedSongs = (
  query: string,
  category: string,
  limit: number,
  offset: number
): Song[] | null => {
  return songCache.get(query, category, limit, offset);
};

export const setCachedSongs = (
  query: string,
  category: string,
  limit: number,
  offset: number,
  songs: Song[]
): void => {
  songCache.set(query, category, limit, offset, songs);
};

export const clearSongCache = (): void => {
  songCache.clear();
};
