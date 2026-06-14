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

// Re-exported for backwards compatibility. `hasAuthCookies` now lives in its
// own Supabase-free module so it can be imported without pulling in the
// Supabase client bundle — see ./cookies.
export { hasAuthCookies } from "./cookies";
