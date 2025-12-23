/**
 * API Response Caching Utility
 * Caches API responses in localStorage with TTL-based expiration
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const CACHE_PREFIX = 'showbook_api_cache_';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a cache key from a URL and parameters
 */
function generateCacheKey(url: string, params?: Record<string, any>): string {
  const paramString = params ? JSON.stringify(params) : '';
  return `${CACHE_PREFIX}${btoa(url + paramString).replace(/[^a-zA-Z0-9]/g, '_')}`;
}

/**
 * Check if a cache entry is still valid
 */
function isCacheValid(entry: CacheEntry<any>): boolean {
  const now = Date.now();
  return (now - entry.timestamp) < entry.ttl;
}

/**
 * Get cached data if available and valid
 */
export function getCached<T>(url: string, params?: Record<string, any>): T | null {
  try {
    const key = generateCacheKey(url, params);
    const cached = localStorage.getItem(key);
    
    if (!cached) return null;
    
    const entry: CacheEntry<T> = JSON.parse(cached);
    
    if (!isCacheValid(entry)) {
      // Remove expired entry
      localStorage.removeItem(key);
      return null;
    }
    
    return entry.data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

/**
 * Store data in cache
 */
export function setCached<T>(
  url: string,
  data: T,
  params?: Record<string, any>,
  ttl: number = DEFAULT_TTL
): void {
  try {
    const key = generateCacheKey(url, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('Cache storage quota exceeded. Clearing old entries...');
      clearOldCacheEntries();
      
      // Try again
      try {
        const key = generateCacheKey(url, params);
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          ttl,
        };
        localStorage.setItem(key, JSON.stringify(entry));
      } catch (retryError) {
        console.error('Failed to cache after cleanup:', retryError);
      }
    } else {
      console.error('Error writing to cache:', error);
    }
  }
}

/**
 * Clear expired cache entries
 */
function clearOldCacheEntries(): void {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    let cleared = 0;
    for (const key of cacheKeys) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry<any> = JSON.parse(cached);
          if (!isCacheValid(entry)) {
            localStorage.removeItem(key);
            cleared++;
          }
        }
      } catch (error) {
        // Remove invalid entries
        localStorage.removeItem(key);
        cleared++;
      }
    }
    
    // If still too many entries, remove oldest 50%
    if (cacheKeys.length - cleared > 100) {
      const remainingKeys = cacheKeys.filter(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry<any> = JSON.parse(cached);
            return isCacheValid(entry);
          }
        } catch {
          return false;
        }
        return false;
      });
      
      // Sort by timestamp and remove oldest
      const sorted = remainingKeys
        .map(key => {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const entry: CacheEntry<any> = JSON.parse(cached);
              return { key, timestamp: entry.timestamp };
            }
          } catch {
            return null;
          }
          return null;
        })
        .filter((item): item is { key: string; timestamp: number } => item !== null)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove oldest 50%
      const toRemove = Math.floor(sorted.length / 2);
      for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(sorted[i].key);
      }
    }
  } catch (error) {
    console.error('Error clearing old cache entries:', error);
  }
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    cacheKeys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { entries: number; size: number } {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    let totalSize = 0;
    for (const key of cacheKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    }
    
    return {
      entries: cacheKeys.length,
      size: totalSize, // Size in characters
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { entries: 0, size: 0 };
  }
}

