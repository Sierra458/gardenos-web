import { describe, it, expect, beforeEach, vi } from "vitest";

beforeEach(() => vi.resetModules());

describe("/api/auth/admin-login", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "admin-secret";
    process.env.COOKIE_SECRET = "test-cookie-secret";
    vi.doMock("@/lib/kv", () => ({
      kv: { incr: async () => 1, expire: async () => {} },
    }));
  });

  it("400s on missing JSON body", async () => {
    const { POST } = await import("./route");
    const res = await POST({ json: async () => { throw new Error("bad"); }, headers: new Headers() } as any);
    expect(res.status).toBe(400);
  });

  it("401s on wrong password", async () => {
    const { POST } = await import("./route");
    const res = await POST({ json: async () => ({ password: "nope" }), headers: new Headers() } as any);
    expect(res.status).toBe(401);
  });

  it("sets gardenos_admin cookie on correct password", async () => {
    const { POST } = await import("./route");
    const res = await POST({ json: async () => ({ password: "admin-secret" }), headers: new Headers() } as any);
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("gardenos_admin=");
  });

  it("rate-limits by IP", async () => {
    vi.doMock("@/lib/kv", () => ({
      kv: { incr: async () => 6, expire: async () => {} }, // already over limit
    }));
    const { POST } = await import("./route");
    const res = await POST({ json: async () => ({ password: "nope" }), headers: new Headers({ "x-real-ip": "1.2.3.4" }) } as any);
    expect(res.status).toBe(429);
  });
});
