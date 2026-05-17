import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => vi.resetModules());

describe("blob lib", () => {
  it("uploads via put() and returns url + pathname", async () => {
    vi.doMock("@vercel/blob", () => ({
      put: vi.fn().mockResolvedValue({ url: "https://blob.vercel/x", pathname: "console-uploads/abc.jpg" }),
      del: vi.fn(),
    }));
    const { uploadBlob } = await import("./blob");
    const r = await uploadBlob(Buffer.from("data"), "img.jpg", "image/jpeg");
    expect(r.url).toBe("https://blob.vercel/x");
    expect(r.pathname).toContain("console-uploads/");
  });

  it("deleteBlob calls del with pathname", async () => {
    const del = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@vercel/blob", () => ({ put: vi.fn(), del }));
    const { deleteBlob } = await import("./blob");
    await deleteBlob("console-uploads/abc.jpg");
    expect(del).toHaveBeenCalledWith("console-uploads/abc.jpg");
  });
});
