import { NextRequest, NextResponse } from "next/server";
import { signCookie, COOKIE_NAME, COOKIE_TTL_DAYS } from "@/lib/auth";
import { kv } from "@/lib/kv";
import { checkRateLimit } from "@/lib/rate-limit";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function isSafePath(p: unknown): p is string {
  return typeof p === "string" && p.startsWith("/") && !p.startsWith("//") && !p.startsWith("/\\");
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

export async function POST(req: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;
  const cookieSecret = process.env.COOKIE_SECRET;
  if (!sitePassword || !cookieSecret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Rate limit FIRST so a bad guess can't bypass the gate by being malformed.
  const ip = clientIp(req);
  const rl = await checkRateLimit(kv, `auth:login:${ip}`, 5, 600);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfterSeconds) },
    });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { password, from } = (body ?? {}) as { password?: string; from?: string };
  if (typeof password !== "string" || !safeEqual(password, sitePassword)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const expiresAt = Date.now() + COOKIE_TTL_DAYS * 24 * 60 * 60 * 1000;
  const cookieValue = await signCookie(expiresAt, cookieSecret);

  const safeFrom = isSafePath(from) ? from : "/";
  const res = NextResponse.json({ redirect: safeFrom });
  res.cookies.set({
    name: COOKIE_NAME, value: cookieValue,
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/",
    maxAge: COOKIE_TTL_DAYS * 24 * 60 * 60,
  });
  return res;
}
