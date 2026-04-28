import { NextRequest, NextResponse } from "next/server";
import { signCookie, COOKIE_NAME, COOKIE_TTL_DAYS } from "@/lib/auth";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;
  const cookieSecret = process.env.COOKIE_SECRET;
  if (!sitePassword || !cookieSecret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const { password, from } = body as { password?: string; from?: string };
  if (typeof password !== "string" || !safeEqual(password, sitePassword)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const expiresAt = Date.now() + COOKIE_TTL_DAYS * 24 * 60 * 60 * 1000;
  const cookieValue = await signCookie(expiresAt, cookieSecret);

  const safeFrom = typeof from === "string" && from.startsWith("/") ? from : "/";
  const res = NextResponse.json({ redirect: safeFrom });
  res.cookies.set({
    name: COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_TTL_DAYS * 24 * 60 * 60,
  });
  return res;
}
