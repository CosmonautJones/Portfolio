import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Redirect back to /login with a human-readable error message. */
function loginError(request: NextRequest, message: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const rawRedirectTo = searchParams.get("redirectTo") || "/tools";
  const redirectTo =
    rawRedirectTo.startsWith("/") && !rawRedirectTo.startsWith("//")
      ? rawRedirectTo
      : "/tools";

  // The OAuth provider (or Supabase) reports failures via error params rather
  // than a code. Surface the real reason instead of a generic message.
  const providerError =
    searchParams.get("error_description") || searchParams.get("error");
  if (providerError) {
    return loginError(request, providerError);
  }

  if (!code) {
    return loginError(request, "Missing authorization code");
  }

  const successRedirect = NextResponse.redirect(
    new URL(redirectTo, request.url)
  );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            successRedirect.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error) {
    return successRedirect;
  }

  return loginError(
    request,
    error.message || "Could not verify authentication"
  );
}
