import { describe, it, expect } from "vitest";
import { signCookie, verifyCookie, signAdminCookie, verifyAdminCookie, ADMIN_COOKIE_NAME, ADMIN_COOKIE_TTL_DAYS } from "./auth";

const SECRET = "test-secret-do-not-use-in-prod";

describe("auth cookie", () => {
  it("round-trips a valid signed cookie", async () => {
    const expiresAt = Date.now() + 1000 * 60 * 60;
    const value = await signCookie(expiresAt, SECRET);
    const result = await verifyCookie(value, SECRET);
    expect(result.valid).toBe(true);
  });

  it("rejects a tampered cookie", async () => {
    const value = await signCookie(Date.now() + 60_000, SECRET);
    const tampered = value.replace(/.$/, c => (c === "a" ? "b" : "a"));
    const result = await verifyCookie(tampered, SECRET);
    expect(result.valid).toBe(false);
  });

  it("rejects an expired cookie", async () => {
    const value = await signCookie(Date.now() - 1000, SECRET);
    const result = await verifyCookie(value, SECRET);
    expect(result.valid).toBe(false);
  });

  it("rejects a cookie signed with a different secret", async () => {
    const value = await signCookie(Date.now() + 60_000, SECRET);
    const result = await verifyCookie(value, "different-secret");
    expect(result.valid).toBe(false);
  });
});

describe("admin cookie", () => {
  it("uses a distinct cookie name from the share cookie", () => {
    expect(ADMIN_COOKIE_NAME).toBe("gardenos_admin");
    expect(ADMIN_COOKIE_NAME).not.toBe("gardenos_auth");
  });

  it("has a 7-day TTL", () => {
    expect(ADMIN_COOKIE_TTL_DAYS).toBe(7);
  });

  it("round-trips a valid signed admin cookie", async () => {
    const expiresAt = Date.now() + 1000 * 60 * 60;
    const value = await signAdminCookie(expiresAt, SECRET);
    const result = await verifyAdminCookie(value, SECRET);
    expect(result.valid).toBe(true);
  });

  it("rejects a share cookie signed with the same secret", async () => {
    // Same crypto, but admin verifier must namespace its payload
    const expiresAt = Date.now() + 1000 * 60 * 60;
    const shareValue = await signCookie(expiresAt, SECRET);
    const result = await verifyAdminCookie(shareValue, SECRET);
    expect(result.valid).toBe(false);
  });
});
