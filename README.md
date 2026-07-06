# Travis Jones Portfolio

Interactive portfolio and tool hub for [travisjohnjones.com](https://travisjohnjones.com). The site is built around a simple proof path: visitors can inspect working demos, play with interactive tools, and contact Travis directly from the site.

## Technology Map

| Area | Technology | Purpose |
|---|---|---|
| App framework | Next.js 15 App Router | Public pages, protected routes, API routes, middleware, server actions |
| UI runtime | React 19 + TypeScript | Component architecture and type-safe app logic |
| Styling | Tailwind CSS 4 | Global design system and responsive styling |
| UI primitives | shadcn/ui, Radix UI, Lucide React | Accessible controls, dialogs, menus, buttons, and icons |
| Animation/UI polish | Motion, Sonner, next-themes | Motion effects, toast notifications, theme support |
| 3D/game rendering | Three.js + Canvas | Portfolio game and visual demo surfaces |
| Forms/validation | react-hook-form, Zod, shared validation helpers | Admin forms, contact validation, typed payloads |
| Markdown/content | react-markdown, remark-gfm | Rich text rendering where needed |
| Image/build support | Sharp | Next.js image/build optimization |
| Tests | Vitest, React Testing Library, jsdom | Unit and component coverage |
| Linting | ESLint + Next.js config | Code quality and React/Next.js checks |
| CI | GitHub Actions | Lint, test, and build verification on `main` |

## Connected Services

| Service | What It Does | Where It Connects |
|---|---|---|
| Netlify | Hosts and deploys the production site at `travisjohnjones.com` | `netlify.toml`, Netlify dashboard, deploy hooks |
| Netlify DNS / NS1 | Owns DNS for `travisjohnjones.com` | Netlify DNS zone using `dns*.p05.nsone.net` nameservers |
| Resend | Sends contact form email from the site | `src/app/api/contact/route.ts`, `/api/contact` |
| Supabase Auth | Handles login through GitHub OAuth with PKCE | `src/app/(auth)`, `src/lib/supabase/*`, middleware |
| Supabase PostgreSQL | Stores tools, profiles, XP, achievements, scores, easter eggs, and visits | `supabase/migrations`, server actions, RLS policies |
| GitHub OAuth | Identity provider for sign-in | Configured in Supabase Authentication providers |
| GitHub API | Optional import source for embedded/tools metadata | `GITHUB_TOKEN`, tool import server actions |
| GitHub Actions | Runs repository CI after pushes | `.github/workflows/*` |

## Product Surface

- Public portfolio pages: home, about, work, contact, vault.
- Interactive proof points: project cards, demos, Plan'd, Pixel Art Editor, and ClaudeBot's Adventure.
- Authenticated tools hub: `/tools` for signed-in users.
- Admin area: `/admin` and `/admin/tools`, gated by `ADMIN_EMAIL`.
- Contact flow: browser form posts to `/api/contact`; the server sends through Resend. There is no `mailto:` fallback.

## Environment Variables

Copy `.env.example` to `.env.local` for local development and set matching values in Netlify for production.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL exposed to browser clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key exposed to browser clients |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only admin key for trusted operations |
| `ADMIN_EMAIL` | Yes | Email address allowed into admin routes/actions |
| `RESEND_API_KEY` | Yes | Server-only key for contact email sending |
| `RESEND_FROM_EMAIL` | Yes | Verified sender, e.g. `Portfolio <contact@travisjohnjones.com>` |
| `CONTACT_TO_EMAIL` | Yes | Destination inbox for contact submissions |
| `GITHUB_TOKEN` | Optional | Raises GitHub API rate limits for tool imports |

Do not commit real secret values. Keep production secrets in Netlify environment variables.

## Email/DNS Setup

The baked-in contact form depends on Resend domain verification.

In Netlify DNS for `travisjohnjones.com`, the Resend sending records must exist:

- `TXT` at `resend._domainkey`
- `MX` at `send`
- `TXT` at `send`
- Optional `TXT` at `_dmarc`

The active DNS nameservers are Netlify/NS1 nameservers, so Resend records must be added in the Netlify DNS zone, not only at the registrar.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
npm run lint
npm run test
npm run build
npm run test:watch
```

## Deployment

Production deploys through Netlify from `main`.

- Build command: `npm run build`
- Runtime target: Node 20 on Netlify
- Domain: `travisjohnjones.com`
- DNS: Netlify DNS / NS1

Admin tools can also store Netlify build hook URLs and trigger deploys through the `triggerDeploy` server action.

## Repository Guide

High-signal docs live in `docs/`:

- `docs/README.md` - documentation index
- `docs/architecture.md` - route groups, request flow, and key libraries
- `docs/auth.md` - Supabase/GitHub login flow
- `docs/deployment.md` - Netlify, env vars, Supabase, and Resend setup
- `docs/database.md` - Supabase schema, migrations, and RLS
- `docs/tool-system.md` - internal/external/embedded tools
- `docs/testing.md` - Vitest and React Testing Library patterns

Harness workflow files live in:

- `AGENTS.md`
- `docs/vision.md`
- `docs/core-loop.md`
- `docs/taste-bar.md`
- `docs/anti-goals.md`
- `tasks/current-mission.md`
- `tasks/completed.md`
- `evals/product-rubric.md`

## Current Known Warnings

CI currently passes, but two known follow-ups are tracked in the harness mission:

- GitHub reports dependency vulnerabilities on the default branch.
- ESLint reports an existing React hook dependency warning in `src/hooks/use-game-engine.ts`.
