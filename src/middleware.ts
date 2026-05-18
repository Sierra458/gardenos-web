import { NextRequest, NextResponse } from "next/server";
import { verifyCookie, COOKIE_NAME, verifyAdminCookie, ADMIN_COOKIE_NAME } from "@/lib/auth";

export const config = {
  matcher: [
    "/((?!api/auth/login(?:/|$)|api/auth/admin-login(?:/|$)|login(?:/|$)|console/login(?:/|$)|_next/static|_next/image|favicon\\.ico|robots\\.txt).*)",
  ],
};

function isAdminPath(pathname: string): boolean {
  return pathname === "/console" || pathname.startsWith("/console/") ||
         pathname === "/api/console" || pathname.startsWith("/api/console/");
}

function isSafePath(p: string): boolean {
  return p.startsWith("/") && !p.startsWith("//") && !p.startsWith("/\\");
}

export async function middleware(req: NextRequest) {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return new NextResponse("Server misconfigured: COOKIE_SECRET missing", { status: 500 });
  }

  const pathname = req.nextUrl.pathname;

  // Admin paths require the admin cookie (NOT the share cookie).
  if (isAdminPath(pathname)) {
    const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!adminCookie) return redirectToAdminLogin(req);
    const { valid } = await verifyAdminCookie(adminCookie, secret);
    if (!valid) return redirectToAdminLogin(req);
    return NextResponse.next();
  }

  // Public/share paths: keep existing share-cookie gate.
  const shareCookie = req.cookies.get(COOKIE_NAME)?.value;
  if (!shareCookie) return redirectToShareLogin(req);
  const { valid } = await verifyCookie(shareCookie, secret);
  if (!valid) return redirectToShareLogin(req);
  return NextResponse.next();
}

function redirectToShareLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  const originalFullPath = req.nextUrl.pathname + req.nextUrl.search;
  const safeOriginal = isSafePath(originalFullPath) ? originalFullPath : "/";
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("from", safeOriginal);
  return NextResponse.redirect(url);
}

function redirectToAdminLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/console/login";
  url.search = "";
  return NextResponse.redirect(url);
}
