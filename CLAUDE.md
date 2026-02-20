# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Always commit to main.

## Commands

- `npm run dev` — Start dev server (Next.js + Turbopack)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run test` — Run all tests (Vitest)
- `npm run test:watch` — Interactive test watcher
- Run a single test: `npx vitest run src/path/to/file.test.tsx`

## Architecture

Next.js 15 App Router application — a portfolio site with an authenticated tools hub. Deployed to Netlify. Uses Supabase for PostgreSQL database and authentication (GitHub OAuth with PKCE).

### Route Groups

- `src/app/(public)/` — Public portfolio pages (home, about, work, contact)
- `src/app/(auth)/` — Auth flow (login, confirmation callback)
- `src/app/(protected)/` — Requires authentication (tools browser, admin panel, adventure)
- `src/app/api/embed/[slug]/` — Serves embedded tool HTML content

### Tool System (core domain)

Tools have three types, defined in `src/lib/types.ts`:
- **external** — Links to an external URL
- **internal** — React components registered in `src/lib/tools-registry.ts` via `React.lazy()`. To add a new internal tool, create the component and add a lazy import entry to the registry.
- **embedded** — Self-contained HTML/CSS/JS stored in the `html_content` database column, served via the `/api/embed/[slug]` route in an iframe

Admin can import tools directly from GitHub repos. `importFromGitHub()` fetches repo metadata; `fetchRepoHtml()` assembles a single-file HTML document by inlining CSS/JS from the repo tree.

### Server Actions (`src/actions/`)

All mutations go through server actions, not API routes. Each action calls `requireAdmin()` which checks the authenticated user's email against `ADMIN_EMAIL`. The admin Supabase client (`src/lib/supabase/admin.ts`) bypasses RLS for these operations.

- `tools.ts` — Tool CRUD, GitHub import, repo HTML fetching
- `notes.ts` — Note CRUD (per-user via RLS)
- `projects.ts` — Project CRUD
- `auth.ts` — Sign out
- `deploy.ts` — Trigger Netlify build webhooks

### Key Libraries

- **UI**: shadcn/ui (new-york style) + Tailwind CSS 4 + Lucide icons + next-themes
- **Forms**: React Hook Form + Zod validation (`src/lib/validations.ts`)
- **Auth**: Supabase Auth with GitHub OAuth; session refreshed via middleware (`src/middleware.ts`)
- **Testing**: Vitest + React Testing Library + jsdom

### Database

Supabase PostgreSQL with migrations in `supabase/migrations/`. Four tables: `tools`, `notes`, `projects`, and `tasks`. RLS policies defined in migration 003. The `notes` table has a `user_id` foreign key and an auto-updating `updated_at` trigger.

### Environment Variables

See `.env.example`. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`. Optional: `GITHUB_TOKEN` (for higher API rate limits during GitHub import).
