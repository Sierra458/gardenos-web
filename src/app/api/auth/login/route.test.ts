import { describe, it, expect, beforeEach, vi } from "vitest";

// Force module isolation between tests
beforeEach(() => vi.resetModules());

describe("/api/auth/login rate limit", () => {
  it("returns 429 after 5 failed attempts from the same IP", async () => {
    process.env.SITE_PASSWORD = "correct";
    process.env.COOKIE_SECRET = "test-secret-for-rate-limit-test";

    // Stub the KV import
    const kvStore = new Map<string, number>();
    vi.doMock("@/lib/kv", () => ({
      kv: {
        incr: async (k: string) => { const n = (kvStore.get(k) ?? 0) + 1; kvStore.set(k, n); return n; },
        expire: async () => {},
      },
    }));

    const { POST } = await import("./route");
    const ip = "1.2.3.4";
    for (let i = 0; i < 5; i++) {
      const res = await POST(makeReq({ password: "wrong" }, ip));
      expect(res.status).toBe(401);
    }
    const blocked = await POST(makeReq({ password: "wrong" }, ip));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBeTruthy();
  });
});

function makeReq(body: object, ip: string): any {
  return {
    json: async () => body,
    headers: new Headers({ "x-forwarded-for": ip }),
  };
}
