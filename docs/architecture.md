# Architecture

## Overview

Next.js 15 App Router application deployed to Netlify. Uses Supabase for PostgreSQL database and GitHub OAuth authentication. The site is a portfolio with a public face, an authenticated tools hub restricted to admin, and a game (ClaudeBot's Adventure) open to all authenticated users.

**Live site**: [travisjohnjones.com](https://travisjohnjones.com)

## Directory Structure

```
src/
  actions/           # Server actions (all mutations)
  app/               # Next.js App Router pages and routes
    (adventure)/     # Game pages
    (auth)/          # Auth flow
    (protected)/     # Authenticated pages
    (public)/        # Public portfolio pages
    api/embed/[slug] # Embedded tool HTML endpoint
  components/
    admin/           # Admin-only UI components
    adventure/       # Game UI panels
    auth/            # Login form, user menu
    demos/           # Interactive demo components
    easter-eggs/     # Easter egg UI triggers
    layout/          # Navbar, footer, mobile nav
    portfolio/       # Public portfolio sections
    progression/     # XP bar, achievement toasts, level-up overlay
    terminal/        # Terminal shell UI
    tools/           # Tool cards, renderer, notes, project tracker
    ui/              # shadcn/ui primitives + animation wrappers
    vault/           # Vault puzzle components
  hooks/             # Custom React hooks
  lib/
    __tests__/       # Lib unit tests
    easter-eggs/     # Easter egg registry and Konami code logic
    game/            # Game engine (pure TypeScript, no React)
    supabase/        # Supabase client factories + middleware
    terminal/        # Terminal command parser and registry
  middleware.ts      # Next.js middleware entry point
  test/setup.ts      # Vitest global setup
supabase/
  migrations/        # SQL migration files (13 files)
```

## Route Groups

### `(public)` — `src/app/(public)/`

Public pages visible to all visitors. Uses a shared layout with Navbar and Footer.

| Route | Page |
|---|---|
| `/` | Home (hero, featured projects, about preview) |
| `/work` | All projects |
| `/work/[slug]` | Individual project detail + interactive demo |
| `/about` | About page |
| `/contact` | Contact form |
| `/vault` | Secret puzzle page (no nav link) |

### `(auth)` — `src/app/(auth)/`

| Route | Purpose |
|---|---|
| `/login` | GitHub OAuth login form |
| `/auth/confirm` | PKCE callback route handler |

### `(protected)` — `src/app/(protected)/`

Requires authentication. Non-admin users are redirected to `/adventure` by middleware.

| Route | Purpose |
|---|---|
| `/tools` | Tool browser with search and filter |
| `/tools/[slug]` | Individual tool page with renderer |
| `/admin/tools` | Admin panel for CRUD management |

### `(adventure)` — `src/app/(adventure)/`

| Route | Purpose |
|---|---|
| `/adventure` | Full-screen ClaudeBot's Adventure game |

### `api/`

| Route | Purpose |
|---|---|
| `/api/embed/[slug]` | Serves `html_content` for embedded tools as raw HTML (used in iframe) |

## Root Layout

`src/app/layout.tsx` wraps the entire application with:

1. `ThemeProvider` (next-themes) — dark/light + color scheme
2. `VisitorProvider` — XP/progression context
3. `TerminalProvider` — terminal sheet state
4. `TerminalSheet` — slide-out terminal (always mounted)
5. `KonamiEffects` — global keyboard listener for Konami code
6. `LevelUpOverlay` — full-screen level-up animation
7. `Toaster` (sonner) — toast notifications

A small inline script in `<head>` reads `localStorage` key `color-scheme` and applies a CSS class (`theme-ocean`, `theme-ember`, `theme-emerald`) before hydration to prevent flash.

## Request Flow

```
Browser Request
  → Next.js Middleware (src/middleware.ts)
      → updateSession() (src/lib/supabase/middleware.ts)
          → JWT validated locally via getClaims() (no network)
          → Routing rules applied (redirect unauthenticated, non-admin)
  → Route Handler / Server Component
      → Server actions called for mutations
          → requireAdmin() verifies user via getUser() (network call)
          → Admin Supabase client bypasses RLS
  → Client Components hydrate
      → VisitorProvider loads profile, listens to auth state
```

## Key Libraries

| Library | Version | Purpose |
|---|---|---|
| `next` | 15.5.x | Framework |
| `react` / `react-dom` | 19.1.0 | UI runtime |
| `@supabase/ssr` | 0.8.x | Supabase SSR client |
| `@supabase/supabase-js` | 2.96.x | Supabase JS client |
| `motion` | 12.x | Animations (`motion/react`) |
| `next-themes` | 0.4.x | Dark/light theme |
| `react-hook-form` | 7.x | Forms |
| `zod` | 4.x | Schema validation |
| `sonner` | 2.x | Toast notifications |
| `lucide-react` | 0.574.x | Icons |
| `react-markdown` + `remark-gfm` | — | Markdown rendering |
| `tailwindcss` | 4.x | Styling |

See [deployment.md](./deployment.md) for environment setup.
