import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => vi.resetModules());

describe("history lib", () => {
  it("appends a message to today's blob", async () => {
    const writes: { path: string; body: string }[] = [];
    vi.doMock("@vercel/blob", () => ({
      put: vi.fn(async (path: string, body: any) => { writes.push({ path, body: typeof body === "string" ? body : body.toString() }); return { url: "u", pathname: path }; }),
      list: vi.fn().mockResolvedValue({ blobs: [] }),
    }));
    vi.doMock("./blob-fetch", () => ({ fetchBlobBody: vi.fn().mockResolvedValue(null) }));

    const { appendChatMessage } = await import("./history");
    await appendChatMessage({ role: "user", content: "hi", ts: 1700000000000 });
    expect(writes).toHaveLength(1);
    const stored = JSON.parse(writes[0].body);
    expect(stored).toEqual([{ role: "user", content: "hi", ts: 1700000000000 }]);
  });

  it("appends to an existing blob", async () => {
    const writes: { path: string; body: string }[] = [];
    vi.doMock("@vercel/blob", () => ({
      put: vi.fn(async (path: string, body: any) => { writes.push({ path, body: typeof body === "string" ? body : body.toString() }); return { url: "u", pathname: path }; }),
      list: vi.fn().mockResolvedValue({ blobs: [{ pathname: "chat-history/2026-05-17.json", url: "https://blob/x" }] }),
    }));
    vi.doMock("./blob-fetch", () => ({
      fetchBlobBody: vi.fn().mockResolvedValue(JSON.stringify([{ role: "user", content: "first", ts: 1 }])),
    }));

    const { appendChatMessage } = await import("./history");
    await appendChatMessage({ role: "assistant", content: "second", ts: 2 });
    const stored = JSON.parse(writes[0].body);
    expect(stored).toHaveLength(2);
  });
});
