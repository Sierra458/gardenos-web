import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

beforeEach(() => vi.resetModules());

describe("/api/console/upload", () => {
  beforeEach(() => {
    vi.doMock("@/lib/console/blob", () => ({
      uploadBlob: vi.fn().mockResolvedValue({ url: "https://blob/x.jpg", pathname: "console-uploads/x.jpg" }),
    }));
  });

  it("returns 200 + url for a valid JPEG", async () => {
    const fixture = await readFile(path.resolve(__dirname, "../../../../../tests/fixtures/console/sample.jpg"));
    const form = new FormData();
    form.append("file", new Blob([fixture], { type: "image/jpeg" }), "sample.jpg");

    const { POST } = await import("./route");
    const res = await POST(new Request("http://x", { method: "POST", body: form }) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe("https://blob/x.jpg");
  });

  it("rejects non-image with 400", async () => {
    const form = new FormData();
    form.append("file", new Blob([Buffer.from("hello")], { type: "text/plain" }), "x.txt");
    const { POST } = await import("./route");
    const res = await POST(new Request("http://x", { method: "POST", body: form }) as any);
    expect(res.status).toBe(400);
  });

  it("rejects file > 25MB", async () => {
    const big = Buffer.alloc(26 * 1024 * 1024, 0xff);
    const form = new FormData();
    form.append("file", new Blob([big], { type: "image/jpeg" }), "big.jpg");
    const { POST } = await import("./route");
    const res = await POST(new Request("http://x", { method: "POST", body: form }) as any);
    expect(res.status).toBe(413);
  });
});
