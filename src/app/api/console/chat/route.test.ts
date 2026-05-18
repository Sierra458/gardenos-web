import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => vi.resetModules());

describe("/api/console/chat", () => {
  beforeEach(() => {
    process.env.AI_GATEWAY_API_KEY = "test-key";
    vi.doMock("@/lib/kv", () => ({
      kv: { incr: async () => 1, expire: async () => {} },
    }));
    vi.doMock("@/lib/console/history", () => ({
      appendChatMessage: vi.fn(),
    }));
    vi.doMock("ai", () => ({
      streamText: vi.fn(() => ({ toUIMessageStreamResponse: () => new Response("stream") })),
      convertToModelMessages: vi.fn((m: any) => m),
      tool: (x: any) => x,
    }));
  });

  it("429s when burst rate limit exceeded", async () => {
    vi.doMock("@/lib/kv", () => ({
      kv: {
        incr: vi.fn().mockImplementation(async (key: string) => key.includes("burst") ? 11 : 1),
        expire: async () => {},
      },
    }));
    const { POST } = await import("./route");
    const req = new Request("http://x/api/console/chat", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": "1.2.3.4" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(429);
  });

  it("429s when daily cap exceeded", async () => {
    vi.doMock("@/lib/kv", () => ({
      kv: {
        incr: vi.fn().mockImplementation(async (key: string) => key.includes("daily") ? 201 : 1),
        expire: async () => {},
      },
    }));
    const { POST } = await import("./route");
    const req = new Request("http://x/api/console/chat", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": "1.2.3.4" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(429);
  });
});
