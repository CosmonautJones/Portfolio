# Deployment

## Platform

Deployed to **Netlify** at [travisjohnjones.com](https://travisjohnjones.com).

- **Node version**: 20
- **Framework**: Next.js 15 App Router
- **Build command**: `npm run build`

## Environment Variables

See `.env.example` for the template. Configure these in the Netlify dashboard (Site settings → Environment variables).

### Required

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) |
| `ADMIN_EMAIL` | Email address of the admin user |

### Optional

| Variable | Description |
|---|---|
| `GITHUB_TOKEN` | GitHub personal access token — raises API rate limit from 60 to 5000 req/hr for GitHub import |

## Build

```bash
npm run build   # Next.js production build
```

Runs TypeScript compilation, ESLint (configured to warn not error on build), and Next.js static/dynamic page generation.

## Netlify Build Hooks

Tools can have a `build_hook_url` field. The admin panel has a `DeployButton` component that calls `triggerDeploy(buildHookUrl)` server action, which POSTs to the Netlify webhook URL to trigger a new build.

This is used for tools that require a new deploy to update (e.g., if `html_content` needs to be refreshed from a GitHub repo).

## Supabase Configuration

### Auth Settings

In the Supabase dashboard (Authentication → URL Configuration):
- **Site URL**: `https://travisjohnjones.com`
- **Redirect URLs**: `https://travisjohnjones.com/auth/confirm`

### GitHub OAuth Provider

In the Supabase dashboard (Authentication → Providers → GitHub):
- Create a GitHub OAuth App at github.com/settings/developers
- Set the callback URL to: `https://<supabase-project-id>.supabase.co/auth/v1/callback`
- Enter the Client ID and Client Secret in Supabase

## Local Development

1. Copy `.env.example` to `.env.local`
2. Fill in Supabase URL, anon key, service role key, and admin email
3. Set Supabase redirect URL to `http://localhost:3000/auth/confirm`

```bash
npm install
npm run dev     # Starts at http://localhost:3000
```

Turbopack is used in development for fast HMR.

## Middleware Matcher

`src/middleware.ts` configures the matcher to run on all routes except:
- `/_next/static/**`
- `/_next/image/**`
- `/favicon.ico`
- Static assets: `.svg`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.ico`, `.woff`, `.woff2`

## SEO

- `src/app/robots.ts` — robots.txt configuration
- `src/app/sitemap.ts` — sitemap.xml generation
- `src/app/opengraph-image.tsx` — Dynamic OG image
- Metadata configured per page using Next.js `metadata` exports

## Related Files

- `.env.example` — Environment variable template
- `next.config.ts` — Next.js configuration
- `src/middleware.ts` — Middleware entry
- `src/actions/deploy.ts` — Netlify webhook trigger
- `src/components/admin/deploy-button.tsx` — Deploy UI
