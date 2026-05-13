import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const pathname = request.nextUrl.pathname;

  // Define public and protected routes
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/setup");

  // 1. Root redirect logic
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. Protect dashboard & setup routes
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    // You can also add a ?callbackUrl query parameter here if you want to redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  // 3. Prevent logged-in users from seeing login/signup pages
  if (isAuthPage && token) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/setup/:path*",
    "/login",
    "/signup",
  ],
};
