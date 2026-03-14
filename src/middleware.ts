import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require auth checks (protected, admin, or login redirect logic)
const AUTH_ROUTES = ["/tools", "/admin", "/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run Supabase session logic on routes that need auth
  const needsAuth = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (!needsAuth) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
