import { describe, it, expect } from "vitest";
import { resizeForBlob, detectMimeType, isAllowedImageMime } from "./image-prep";
import { readFile } from "node:fs/promises";
import path from "node:path";

const FIXTURE = path.resolve(__dirname, "../../../tests/fixtures/console/sample.jpg");

describe("resizeForBlob", () => {
  it("produces a JPEG no wider than 1600px", async () => {
    const input = await readFile(FIXTURE);
    const out = await resizeForBlob(input);
    expect(out.mime).toBe("image/jpeg");
    expect(out.width).toBeLessThanOrEqual(1600);
    expect(out.bytes.length).toBeLessThan(input.length + 50_000); // shouldn't grow much
  });
});

describe("detectMimeType", () => {
  it("detects JPEG from magic bytes", async () => {
    const input = await readFile(FIXTURE);
    const mime = await detectMimeType(input);
    expect(mime).toBe("image/jpeg");
  });

  it("returns undefined for non-image bytes", async () => {
    const mime = await detectMimeType(Buffer.from("this is not an image"));
    expect(mime).toBeUndefined();
  });
});

describe("isAllowedImageMime", () => {
  it("allows the four image types", () => {
    expect(isAllowedImageMime("image/jpeg")).toBe(true);
    expect(isAllowedImageMime("image/png")).toBe(true);
    expect(isAllowedImageMime("image/heic")).toBe(true);
    expect(isAllowedImageMime("image/webp")).toBe(true);
  });
  it("rejects others", () => {
    expect(isAllowedImageMime("application/pdf")).toBe(false);
    expect(isAllowedImageMime("text/html")).toBe(false);
    expect(isAllowedImageMime(undefined)).toBe(false);
  });
});
