import { Redis } from "@upstash/redis";

class NoopKv {
  async incr(): Promise<number> { return 1; }
  async expire(): Promise<void> { return; }
}

/**
 * Singleton Upstash Redis client. Reads connection details from env via Redis.fromEnv():
 *   1st: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *   fallback: KV_REST_API_URL + KV_REST_API_TOKEN  (legacy Vercel KV naming)
 *
 * Vercel Marketplace's Upstash integration provisions both sets, so either works.
 * For local E2E w/o real KV, set KV_TEST_MODE=passthrough — returns a no-op client
 * that always allows (incr returns 1, expire is a no-op).
 */
export const kv = process.env.KV_TEST_MODE === "passthrough"
  ? new NoopKv() as unknown as Redis
  : Redis.fromEnv();
