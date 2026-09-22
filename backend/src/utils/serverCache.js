/**
 * Simple in-memory server-side cache for Railway.
 * Stores responses in memory for a configurable TTL.
 * Cache is automatically cleared when admin creates/updates/deletes content.
 *
 * Usage:
 *   import { getCached, setCached, invalidateCache } from "../utils/serverCache.js";
 */

const store = new Map();

/**
 * Get a cached value by key.
 * Returns null if not found or expired.
 */
export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Store a value in the cache.
 * @param {string} key
 * @param {*} value
 * @param {number} ttlMs - Time to live in milliseconds (default: 5 minutes)
 */
export function setCached(key, value, ttlMs = 300000) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Invalidate all cache entries that start with the given prefix.
 * Call this whenever content is created, updated, or deleted.
 * Example: invalidateCache("journals") clears all journal-related cache.
 */
export function invalidateCache(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

/**
 * Clear the entire cache (useful for debugging).
 */
export function clearAllCache() {
  store.clear();
}