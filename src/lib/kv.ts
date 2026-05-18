import { Redis } from "@upstash/redis";
import type { KvLike } from "./rate-limit";

class NoopKv {
  async incr(): Promise<number> { return 1; }
  async expire(): Promise<void> { return; }
}

/**
 * Lazy Upstash Redis client. Reads connection details from env via Redis.fromEnv():
 *   1st: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *   fallback: KV_REST_API_URL + KV_REST_API_TOKEN  (legacy Vercel KV naming)
 *
 * Vercel Marketplace's Upstash integration provisions both sets, so either works.
 * For local E2E w/o real KV, set KV_TEST_MODE=passthrough — returns a no-op client
 * that always allows (incr returns 1, expire is a no-op).
 *
 * LAZY: Redis.fromEnv() throws if env vars are unset. To prevent module-load
 * failures from breaking pre-existing routes when console env vars aren't yet
 * provisioned, we instantiate on first access via a Proxy. Routes that hit kv
 * will get a clean ReferenceError surface; routes that don't (e.g. /, /log)
 * keep working.
 */

let instance: Redis | KvLike | undefined;

function getInstance(): Redis | KvLike {
  if (instance) return instance;
  if (process.env.KV_TEST_MODE === "passthrough") {
    instance = new NoopKv();
    return instance;
  }
  // Redis.fromEnv() throws synchronously if env is missing — that's now caught
  // by the route handler instead of at module load.
  instance = Redis.fromEnv();
  return instance;
}

export const kv: KvLike = new Proxy({} as KvLike, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getInstance(), prop, receiver);
    return typeof value === "function" ? value.bind(getInstance()) : value;
  },
});
