import { NextRequest, NextResponse } from "next/server";
import { verifyCookie, COOKIE_NAME } from "@/lib/auth";

export const config = {
  matcher: ["/((?!api/auth/login(?:/|$)|login(?:/|$)|_next/static|_next/image|favicon\\.ico|robots\\.txt).*)"],
};

export async function middleware(req: NextRequest) {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) {
    // Local dev without secret set — allow through to avoid blocking the dev server.
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return new NextResponse("Server misconfigured: COOKIE_SECRET missing", { status: 500 });
  }
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) return redirectToLogin(req);
  const { valid } = await verifyCookie(cookie, secret);
  if (!valid) return redirectToLogin(req);
  return NextResponse.next();
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  const originalFullPath = req.nextUrl.pathname + req.nextUrl.search;
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("from", originalFullPath);
  return NextResponse.redirect(url);
}
