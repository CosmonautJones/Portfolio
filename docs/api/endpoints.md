# API Endpoints

## Overview

This application uses **Next.js server actions** for all mutations — not API routes. The only true HTTP API endpoint is the embedded tool content endpoint.

For server action signatures, see [../server-actions.md](../server-actions.md).

## HTTP API Routes

### `GET /api/embed/[slug]`

**File**: `src/app/api/embed/[slug]/route.ts`

Serves the `html_content` of an embedded tool as raw HTML. Used as the `src` for an `<iframe>` in `EmbeddedToolFrame`.

**Parameters**:
- `slug` (path) — URL-safe tool identifier

**Response**:
- `200 OK` — `Content-Type: text/html` — raw HTML document
- `404 Not Found` — if tool not found or has no `html_content`

**Security**: No auth required — the iframe runs inside an authenticated page, and the HTML content is admin-managed.

**Example**:
```
GET /api/embed/my-tool-slug
Content-Type: text/html

<!DOCTYPE html>
<html>...assembled tool HTML...</html>
```

## SEO / Meta Routes

These are Next.js special routes, not traditional API endpoints:

| Route | File | Purpose |
|---|---|---|
| `/robots.txt` | `src/app/robots.ts` | Robots crawl rules |
| `/sitemap.xml` | `src/app/sitemap.ts` | Sitemap for search engines |
| `/opengraph-image` | `src/app/opengraph-image.tsx` | Dynamic OG image |
| `/auth/confirm` | `src/app/(auth)/auth/confirm/route.ts` | Supabase PKCE OAuth callback |

## Auth Callback

### `GET /auth/confirm`

**File**: `src/app/(auth)/auth/confirm/route.ts`

Handles the Supabase OAuth PKCE exchange. This is not a public API — it's the GitHub OAuth redirect URL.

**Flow**:
1. GitHub redirects here after user authorizes
2. Route exchanges `code` for a session using `supabase.auth.exchangeCodeForSession()`
3. Redirects to `/tools` (admin) or `/adventure` (non-admin)

**Parameters**:
- `code` (query) — OAuth authorization code from GitHub
- `next` (query, optional) — URL to redirect to after login

## Server Actions as "API"

All data mutations use Next.js server actions invoked from client components. They are not HTTP endpoints — they are RPC-style calls over a Next.js internal transport.

See [../server-actions.md](../server-actions.md) for the full action catalog.

## Related Documents

- [../server-actions.md](../server-actions.md) — All server action signatures
- [../auth.md](../auth.md) — Auth flow and PKCE callback
- [../tool-system.md](../tool-system.md) — Embedded tool system
- [../deployment.md](../deployment.md) — Netlify configuration
