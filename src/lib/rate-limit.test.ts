import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit } from "./rate-limit";

// Inline mock: a Map-backed fake KV
function makeFakeKv() {
  const store = new Map<string, { value: number; expiresAt: number }>();
  const now = () => Date.now();
  return {
    incr: async (key: string) => {
      const cur = store.get(key);
      if (cur && cur.expiresAt > now()) {
        cur.value += 1; return cur.value;
      }
      store.set(key, { value: 1, expiresAt: Infinity });
      return 1;
    },
    expire: async (key: string, seconds: number) => {
      const cur = store.get(key);
      if (cur) cur.expiresAt = now() + seconds * 1000;
    },
    _store: store,
  };
}

describe("checkRateLimit", () => {
  it("allows up to limit and rejects past it", async () => {
    const kv = makeFakeKv();
    for (let i = 0; i < 5; i++) {
      const r = await checkRateLimit(kv as any, "test:ip:1.2.3.4", 5, 600);
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(5 - i - 1);
    }
    const blocked = await checkRateLimit(kv as any, "test:ip:1.2.3.4", 5, 600);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("isolates different keys", async () => {
    const kv = makeFakeKv();
    for (let i = 0; i < 5; i++) await checkRateLimit(kv as any, "a", 5, 600);
    const otherKey = await checkRateLimit(kv as any, "b", 5, 600);
    expect(otherKey.allowed).toBe(true);
  });

  it("sets expiry only on first increment per window", async () => {
    const kv = makeFakeKv();
    await checkRateLimit(kv as any, "x", 10, 600);
    const first = kv._store.get("x")!.expiresAt;
    await new Promise(r => setTimeout(r, 5));
    await checkRateLimit(kv as any, "x", 10, 600);
    const second = kv._store.get("x")!.expiresAt;
    expect(second).toBe(first); // expiry unchanged on subsequent calls
  });

  it("fails open when KV throws (deploy-config / outage safety net)", async () => {
    const brokenKv = {
      incr: async () => { throw new Error("KV unreachable"); },
      expire: async () => { throw new Error("KV unreachable"); },
    };
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const r = await checkRateLimit(brokenKv as any, "k", 5, 600);
    expect(r.allowed).toBe(true);          // does NOT block users on KV failure
    expect(r.remaining).toBe(5);            // full bucket reported back
    expect(r.retryAfterSeconds).toBe(0);
    expect(warn).toHaveBeenCalled();        // warning surfaces in logs
    warn.mockRestore();
  });
});
