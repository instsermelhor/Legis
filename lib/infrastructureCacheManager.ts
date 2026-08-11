/**
 * lib/infrastructureCacheManager.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — INFRASTRUCTURE CACHE & RATE LIMITER MANAGER
 *
 * Gerenciamento de cache em memória (LRU + TTL configurável),
 * rate limiter local client-side para chamadas de API/IA e sanitização de payloads.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface CacheOptions {
  ttlMs?: number; // Tempo de vida em ms (padrão: 5 minutos)
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class InfrastructureCacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxEntries: number;

  constructor(maxEntries = 200) {
    this.maxEntries = maxEntries;
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh position for LRU
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value as T;
  }

  public set<T>(key: string, value: T, options?: CacheOptions): void {
    const ttlMs = options?.ttlMs ?? 5 * 60 * 1000; // 5 minutos
    const expiresAt = Date.now() + ttlMs;

    if (this.cache.size >= this.maxEntries) {
      // Remove oldest entry (first item in Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, { value, expiresAt });
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

class ClientRateLimiter {
  private trackers: Map<string, RateLimitTracker> = new Map();

  public isAllowed(key: string, maxRequests = 10, windowMs = 60_000): boolean {
    const now = Date.now();
    let tracker = this.trackers.get(key);

    if (!tracker || now > tracker.resetAt) {
      tracker = { count: 1, resetAt: now + windowMs };
      this.trackers.set(key, tracker);
      return true;
    }

    if (tracker.count >= maxRequests) {
      return false;
    }

    tracker.count++;
    return true;
  }

  public reset(key: string): void {
    this.trackers.delete(key);
  }
}

// ─── Sanitizer Payload ────────────────────────────────────────────────────────

export function sanitizePayload<T extends Record<string, any>>(payload: T): T {
  const sanitized = { ...payload };
  const sensitiveKeys = ['password', 'token', 'secret', 'creditCard', 'cvv', 'apiKey'];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key as keyof T] = '***REDACTED***' as any;
    }
  }

  return sanitized;
}

export const infrastructureCacheManager = new InfrastructureCacheManager();
export const clientRateLimiter = new ClientRateLimiter();
