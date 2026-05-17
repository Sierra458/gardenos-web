import { NextRequest, NextResponse } from "next/server";
import { signAdminCookie, ADMIN_COOKIE_NAME, ADMIN_COOKIE_TTL_DAYS } from "@/lib/auth";
import { kv } from "@/lib/kv";
import { checkRateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/client-ip";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const cookieSecret = process.env.COOKIE_SECRET;
  if (!adminPassword || !cookieSecret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const ip = clientIp(req);
  const rl = await checkRateLimit(kv, `auth:admin-login:${ip}`, 5, 600);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfterSeconds) },
    });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { password } = (body ?? {}) as { password?: string };
  if (typeof password !== "string" || !safeEqual(password, adminPassword)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const expiresAt = Date.now() + ADMIN_COOKIE_TTL_DAYS * 24 * 60 * 60 * 1000;
  const cookieValue = await signAdminCookie(expiresAt, cookieSecret);
  const res = NextResponse.json({ redirect: "/console" });
  res.cookies.set({
    name: ADMIN_COOKIE_NAME, value: cookieValue,
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", // Path=/ so middleware can read it for /api/console/* too
    maxAge: ADMIN_COOKIE_TTL_DAYS * 24 * 60 * 60,
  });
  return res;
}
