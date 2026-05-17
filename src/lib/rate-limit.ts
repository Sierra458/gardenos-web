export interface KvLike {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void | unknown>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Fixed-window counter via Upstash INCR. First INCR in the window
 * also sets EXPIRE so the counter naturally resets. Race-safe.
 */
export async function checkRateLimit(
  kv: KvLike,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, windowSeconds);
  }
  if (count > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds: windowSeconds };
  }
  return { allowed: true, remaining: limit - count, retryAfterSeconds: 0 };
}
