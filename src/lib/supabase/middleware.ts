import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use getClaims() instead of getUser() — validates the JWT locally without
  // a network round-trip to Supabase Auth, improving middleware performance.
  // Server actions should still use getUser() for fully verified user data.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const { pathname } = request.nextUrl;
  const isProtectedRoute =
    pathname.startsWith("/tools") || pathname.startsWith("/admin");
  const isAdminRoute = pathname.startsWith("/admin");

  // Unauthenticated → redirect to login
  if (!claims && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Non-admin → redirect away from admin
  if (claims && isAdminRoute && !isAdminEmail(claims.email as string)) {
    const url = request.nextUrl.clone();
    url.pathname = "/adventure";
    return NextResponse.redirect(url);
  }

  // Non-admin → redirect away from tools
  if (claims && pathname.startsWith("/tools") && !isAdminEmail(claims.email as string)) {
    const url = request.nextUrl.clone();
    url.pathname = "/adventure";
    return NextResponse.redirect(url);
  }

  // Authenticated on login page → redirect based on role
  if (claims && pathname === "/login") {
    const isAdmin = isAdminEmail(claims.email as string);
    const defaultRedirect = isAdmin ? "/tools" : "/adventure";
    const rawRedirectTo = request.nextUrl.searchParams.get("redirectTo") || defaultRedirect;
    let redirectTo =
      rawRedirectTo.startsWith("/") && !rawRedirectTo.startsWith("//")
        ? rawRedirectTo
        : defaultRedirect;
    if (!isAdmin && (redirectTo.startsWith("/tools") || redirectTo.startsWith("/admin"))) {
      redirectTo = "/adventure";
    }
    const url = request.nextUrl.clone();
    url.pathname = redirectTo;
    url.searchParams.delete("redirectTo");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
