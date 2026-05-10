// ═══════════════════════════════════════════════════════════════
//  TASKFLOW — Redis Client (Upstash REST + BullMQ fallback)
// ═══════════════════════════════════════════════════════════════

import { Redis } from "@upstash/redis";

// ── Upstash REST client (serverless-compatible) ───────────────

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// ── Cache helpers ─────────────────────────────────────────────

const DEFAULT_TTL = 300; // 5 minutes

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.error(`[Redis] Cache GET error for key "${key}":`, error);
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttl });
  } catch (error) {
    console.error(`[Redis] Cache SET error for key "${key}":`, error);
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`[Redis] Cache DEL error for key "${key}":`, error);
  }
}

export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map((k) => redis.del(k)));
    }
  } catch (error) {
    console.error(`[Redis] Cache invalidate error for pattern "${pattern}":`, error);
  }
}

// ── Rate limiter ──────────────────────────────────────────────

export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `ratelimit:${identifier}`;
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    const ttl = await redis.ttl(key);
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetAt: Date.now() + ttl * 1000,
    };
  } catch {
    // If Redis is down, allow the request
    return { allowed: true, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 };
  }
}

export default redis;
