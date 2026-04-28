import { describe, it, expect } from "vitest";
import { signCookie, verifyCookie } from "./auth";

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
