import { describe, it, expect } from "vitest";
import { clientIp } from "./client-ip";

function req(headers: Record<string, string>) {
  return { headers: new Headers(headers) } as { headers: Headers };
}

describe("clientIp", () => {
  it("prefers x-real-ip", () => {
    expect(clientIp(req({ "x-real-ip": "9.9.9.9", "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("9.9.9.9");
  });

  it("falls back to LAST entry of x-forwarded-for when x-real-ip missing", () => {
    expect(clientIp(req({ "x-forwarded-for": "1.1.1.1, 2.2.2.2, 3.3.3.3" }))).toBe("3.3.3.3");
  });

  it("returns 'unknown' when no headers present", () => {
    expect(clientIp(req({}))).toBe("unknown");
  });

  it("trims whitespace from x-forwarded-for entries", () => {
    expect(clientIp(req({ "x-forwarded-for": "1.1.1.1 ,  2.2.2.2  " }))).toBe("2.2.2.2");
  });

  it("does NOT trust the FIRST x-forwarded-for entry (attacker-controlled on Vercel)", () => {
    // This test documents the security property: if an attacker sends XFF=evil,real then
    // Vercel appends the real client IP, so the LAST entry is the trustworthy one.
    expect(clientIp(req({ "x-forwarded-for": "evil-spoofed-ip, real-client-ip" }))).toBe("real-client-ip");
  });
});
