import { Redis } from "@upstash/redis";

/**
 * Singleton Upstash Redis client. Reads connection details from env via Redis.fromEnv():
 *   1st: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *   fallback: KV_REST_API_URL + KV_REST_API_TOKEN  (legacy Vercel KV naming)
 *
 * Vercel Marketplace's Upstash integration provisions both sets, so either works.
 * For local dev w/o real KV, set KV_TEST_MODE=passthrough (see Task 20).
 */
export const kv = Redis.fromEnv();
