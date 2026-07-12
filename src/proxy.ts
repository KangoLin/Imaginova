import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? (() => { throw new Error("AUTH_SECRET environment variable is required"); })()
);

const protectedPaths = [
  "/create",
  "/dashboard",
  "/credits",
  "/settings",
  "/image/",
  "/video/",
  "/admin",
];

const authPaths = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get("token")?.value;

  let userId: number | null = null;
  if (cookie) {
    try {
      const { payload } = await jwtVerify(cookie, secret);
      userId = (payload as { userId: number }).userId;
    } catch {}
  }

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuthPage = authPaths.some((p) => pathname === p);

  if (isProtected && !userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};