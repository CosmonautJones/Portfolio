# Authentication

## Overview

Authentication is handled by Supabase Auth using **GitHub OAuth with PKCE flow**. JWT validation in middleware is done locally (no network round-trip). Server actions use full `getUser()` verification.

## Auth Flow

1. User visits `/login`
2. Clicks "Sign in with GitHub"
3. GitHub redirects to `/auth/confirm?code=...`
4. Route handler (`src/app/(auth)/auth/confirm/route.ts`) exchanges code for session
5. User is redirected to `/tools` (admin) or `/adventure` (non-admin)

## Middleware Routing

**Entry point**: `src/middleware.ts` — delegates to `updateSession()` in `src/lib/supabase/middleware.ts`.

**Matcher**: All routes except static files, images, and fonts.

**JWT validation**: Uses `supabase.auth.getClaims()` for fast local JWT validation — no Supabase Auth network call.

### Routing Rules

| Condition | Action |
|---|---|
| Unauthenticated + `/tools` or `/admin` | Redirect to `/login?redirectTo=<path>` |
| Authenticated non-admin + `/admin` | Redirect to `/adventure` |
| Authenticated non-admin + `/tools` | Redirect to `/adventure` |
| Authenticated on `/login` | Redirect to `/tools` (admin) or `/adventure` (non-admin) |
| Authenticated on `/login?redirectTo=...` | Redirect to `redirectTo` if allowed, else default |

**Admin check**: `isAdminEmail()` from `src/lib/utils.ts` compares the user's email against the `ADMIN_EMAIL` environment variable.

**Security**: The `redirectTo` parameter is sanitized — must start with `/` and not `//`. Non-admin users cannot be redirected to `/tools` or `/admin` even if `redirectTo` specifies them.

## Supabase Client Factories

| File | Usage | Context |
|---|---|---|
| `src/lib/supabase/client.ts` | Browser-side client | Client components |
| `src/lib/supabase/server.ts` | Server-side client | Server components, server actions |
| `src/lib/supabase/admin.ts` | Service role client (bypasses RLS) | Admin server actions only |
| `src/lib/supabase/middleware.ts` | Middleware client + routing logic | Next.js middleware |

The admin client (`createAdminClient()`) uses `SUPABASE_SERVICE_ROLE_KEY` and should only be used inside `requireAdmin()`-guarded actions.

## `requireAdmin()` Pattern

All admin server actions call `requireAdmin()` before any database write:

```typescript
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    throw new Error("Unauthorized");
  }
  return user;
}
```

This uses `getUser()` (network call to Supabase Auth) for full verification — not the cached JWT.

## Session Refresh

The middleware calls `setAll()` on cookies to propagate refreshed session tokens on every request that passes through. This ensures the session cookie stays fresh.

## User Menu

`src/components/auth/user-menu.tsx` — Shows avatar/email when authenticated, sign-in button when not. Uses `use-user` hook (`src/hooks/use-user.ts`) which reads the session client-side.

## Sign Out

`src/actions/auth.ts` — `signOut()` server action calls `supabase.auth.signOut()` and redirects to `/`.

## Related Files

- `src/middleware.ts` — Middleware entry
- `src/lib/supabase/middleware.ts` — Core routing logic
- `src/app/(auth)/login/page.tsx` — Login page
- `src/app/(auth)/auth/confirm/route.ts` — PKCE callback
- `src/actions/auth.ts` — Sign-out action
- `src/lib/utils.ts` — `isAdminEmail()`
