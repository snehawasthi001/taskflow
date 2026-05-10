import { Redis as UpstashRedis } from "@upstash/redis";
import IORedis from "ioredis";

type RedisClient = {
  get: <T = unknown>(key: string) => Promise<T | string | null>;
  set: (...args: unknown[]) => Promise<unknown>;
  del: (...keys: string[]) => Promise<unknown>;
  keys: (pattern: string) => Promise<string[]>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<unknown>;
  ttl: (key: string) => Promise<number>;
  ping: () => Promise<unknown>;
};

const DEFAULT_TTL = 300;

const globalForRedis = globalThis as unknown as {
  redis: RedisClient | undefined;
};

const hasUpstashConfig =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

function createRedisClient(): RedisClient {
  if (hasUpstashConfig) {
    return new UpstashRedis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }) as RedisClient;
  }

  return new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
  }) as RedisClient;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

function decodeCacheValue<T>(data: T | string | null): T | null {
  if (data === null) return null;
  if (typeof data !== "string") return data;

  try {
    return JSON.parse(data) as T;
  } catch {
    return data as T;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key);
    return decodeCacheValue<T>(data);
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
    if (hasUpstashConfig) {
      await redis.set(key, value, { ex: ttl });
      return;
    }

    await redis.set(key, JSON.stringify(value), "EX", ttl);
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
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`[Redis] Cache invalidate error for pattern "${pattern}":`, error);
  }
}

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
      resetAt: Date.now() + Math.max(ttl, 0) * 1000,
    };
  } catch {
    return {
      allowed: true,
      remaining: limit,
      resetAt: Date.now() + windowSeconds * 1000,
    };
  }
}

export default redis;
