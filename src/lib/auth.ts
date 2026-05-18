const enc = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function importHmacKey(secret: string, usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages,
  );
}

export async function signCookie(expiresAt: number, secret: string): Promise<string> {
  const payload = String(expiresAt);
  const key = await importHmacKey(secret, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifyCookie(value: string, secret: string): Promise<{ valid: boolean; expiresAt?: number }> {
  const dot = value.indexOf(".");
  if (dot <= 0 || dot === value.length - 1) return { valid: false };
  const payload = value.slice(0, dot);
  const sigB64 = value.slice(dot + 1);

  let sigBytes: Uint8Array;
  try {
    sigBytes = fromBase64Url(sigB64);
  } catch {
    return { valid: false };
  }

  const key = await importHmacKey(secret, ["verify"]);
  const ok = await crypto.subtle.verify("HMAC", key, sigBytes as BufferSource, enc.encode(payload));
  if (!ok) return { valid: false };

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return { valid: false };
  return { valid: true, expiresAt };
}

export const COOKIE_NAME = "gardenos_auth";
export const COOKIE_TTL_DAYS = 30;

export const ADMIN_COOKIE_NAME = "gardenos_admin";
export const ADMIN_COOKIE_TTL_DAYS = 7;

// Distinct payload prefix prevents share cookies from being accepted as admin cookies.
const ADMIN_PAYLOAD_PREFIX = "adm:";

export async function signAdminCookie(expiresAt: number, secret: string): Promise<string> {
  const payload = `${ADMIN_PAYLOAD_PREFIX}${expiresAt}`;
  const key = await importHmacKey(secret, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifyAdminCookie(value: string, secret: string): Promise<{ valid: boolean; expiresAt?: number }> {
  const dot = value.indexOf(".");
  if (dot <= 0 || dot === value.length - 1) return { valid: false };
  const payload = value.slice(0, dot);
  if (!payload.startsWith(ADMIN_PAYLOAD_PREFIX)) return { valid: false };
  const sigB64 = value.slice(dot + 1);

  let sigBytes: Uint8Array;
  try {
    sigBytes = fromBase64Url(sigB64);
  } catch {
    return { valid: false };
  }

  const key = await importHmacKey(secret, ["verify"]);
  const ok = await crypto.subtle.verify("HMAC", key, sigBytes as BufferSource, enc.encode(payload));
  if (!ok) return { valid: false };

  const expiresAt = Number(payload.slice(ADMIN_PAYLOAD_PREFIX.length));
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return { valid: false };
  return { valid: true, expiresAt };
}
