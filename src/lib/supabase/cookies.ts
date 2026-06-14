/**
 * Fast synchronous check for Supabase auth cookies.
 * Returns true if any sb-*-auth-token cookies exist, meaning the user
 * likely has an active session worth verifying.
 *
 * Lives in its own module (no `@supabase/ssr` import) so callers can run the
 * cheap cookie check without pulling the Supabase client bundle into their
 * critical path. The heavy `createClient` is then imported lazily only when
 * cookies indicate a session actually exists.
 */
export function hasAuthCookies(): boolean {
  return document.cookie.split(";").some((c) => c.trim().startsWith("sb-") && c.includes("auth-token"));
}
