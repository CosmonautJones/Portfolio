import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Fast synchronous check for Supabase auth cookies.
 * Returns true if any sb-*-auth-token cookies exist, meaning the user
 * likely has an active session worth verifying.
 */
export function hasAuthCookies(): boolean {
  return document.cookie.split(";").some((c) => c.trim().startsWith("sb-") && c.includes("auth-token"));
}
