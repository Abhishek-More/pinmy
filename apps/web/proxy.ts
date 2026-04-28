import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth", "/privacy", "/terms"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Skip auth check for client-side navigations (RSC requests)
  // — the cookie may not be available yet after login
  const isRsc =
    request.headers.has("rsc") ||
    request.headers.has("next-router-state-tree");
  if (isRsc) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
