const enc = new TextEncoder();

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Buffer.from(new Uint8Array(sig)).toString("base64url");
}

export async function signCookie(expiresAt: number, secret: string): Promise<string> {
  const payload = String(expiresAt);
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifyCookie(value: string, secret: string): Promise<{ valid: boolean; expiresAt?: number }> {
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return { valid: false };
  const expected = await hmac(secret, payload);
  if (sig !== expected) return { valid: false };
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return { valid: false };
  return { valid: true, expiresAt };
}

export const COOKIE_NAME = "gardenos_auth";
export const COOKIE_TTL_DAYS = 30;
