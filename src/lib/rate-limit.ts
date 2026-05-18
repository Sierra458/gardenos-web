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
 *
 * Fail-soft: if KV is unavailable (e.g., env vars not yet provisioned
 * after a deploy, or transient Upstash outage), this returns {allowed:true}
 * with a warning log. Reasoning: a deploy-config issue should not break
 * authentication for the entire site. The rate limit returns to enforcing
 * once KV is reachable again.
 */
export async function checkRateLimit(
  kv: KvLike,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  try {
    const count = await kv.incr(key);
    if (count === 1) {
      await kv.expire(key, windowSeconds);
    }
    if (count > limit) {
      return { allowed: false, remaining: 0, retryAfterSeconds: windowSeconds };
    }
    return { allowed: true, remaining: limit - count, retryAfterSeconds: 0 };
  } catch (err) {
    console.warn("[rate-limit] KV unavailable, failing open for key:", key, err);
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }
}
