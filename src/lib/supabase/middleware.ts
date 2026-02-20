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

  // CRITICAL: use getUser(), NOT getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtectedRoute =
    pathname.startsWith("/tools") || pathname.startsWith("/admin") || pathname.startsWith("/adventure");
  const isAdminRoute = pathname.startsWith("/admin");

  // Unauthenticated → redirect to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Non-admin → redirect away from admin
  if (user && isAdminRoute && !isAdminEmail(user.email)) {
    const url = request.nextUrl.clone();
    url.pathname = "/adventure";
    return NextResponse.redirect(url);
  }

  // Non-admin → redirect away from tools
  if (user && pathname.startsWith("/tools") && !isAdminEmail(user.email)) {
    const url = request.nextUrl.clone();
    url.pathname = "/adventure";
    return NextResponse.redirect(url);
  }

  // Authenticated on login page → redirect based on role
  if (user && pathname === "/login") {
    const isAdmin = isAdminEmail(user.email);
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
