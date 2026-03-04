# Portfolio Documentation

Developer reference for the portfolio site at [travisjohnjones.com](https://travisjohnjones.com).

## Quick Reference

- **Framework**: Next.js 15 App Router, React 19, TypeScript
- **Deployment**: Netlify at `travisjohnjones.com` (Node 20)
- **Database**: Supabase PostgreSQL (7 tables, 13 migrations)
- **Auth**: GitHub OAuth via Supabase, PKCE flow
- **UI**: shadcn/ui (new-york) + Tailwind CSS 4 + Lucide icons
- **Testing**: Vitest + React Testing Library
- **Path alias**: `@/*` → `./src/*`

## Common Commands

```bash
npm run dev          # Start dev server (Next.js + Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all tests (Vitest)
npm run test:watch   # Interactive test watcher
npx vitest run src/path/to/file.test.tsx  # Single test file
```

---

## Core Documentation

| Document | Description |
|---|---|
| [architecture.md](./architecture.md) | Project structure, route groups, request flow, key libraries |
| [auth.md](./auth.md) | GitHub OAuth, middleware routing rules, Supabase client factories |
| [tool-system.md](./tool-system.md) | Tool types (internal/external/embedded), registry, admin CRUD, GitHub import |
| [progression-system.md](./progression-system.md) | XP awards, levels, achievements, visitor context, optimistic UI |
| [game-engine.md](./game-engine.md) | ClaudeBot's Adventure — engine, renderer, input, audio, coins, particles, screen shake, combo system, ambient effects, isometric 2.5D |
| [terminal-easter-eggs.md](./terminal-easter-eggs.md) | Terminal commands, easter eggs, vault, color schemes |
| [database.md](./database.md) | All 7 tables, migration index, RLS policy summary |
| [server-actions.md](./server-actions.md) | All server actions, signatures, return types, admin guard pattern |
| [components.md](./components.md) | Component inventory by category with descriptions |
| [testing.md](./testing.md) | Vitest setup, test file locations, patterns, mocking |
| [deployment.md](./deployment.md) | Netlify, environment variables, Supabase config, local dev |

---

## Architecture Docs

| Document | Description |
|---|---|
| [architecture/overview.md](./architecture/overview.md) | System diagram, technology stack, domain breakdown, data flow |

---

## API Reference

| Document | Description |
|---|---|
| [api/endpoints.md](./api/endpoints.md) | HTTP endpoints (`/api/embed/[slug]`, `/auth/confirm`), SEO routes |

---

## Guides

| Document | Description |
|---|---|
| [guides/local-setup.md](./guides/local-setup.md) | Clone, configure, and run locally step by step |
| [guides/adding-a-tool.md](./guides/adding-a-tool.md) | Add internal, external, or embedded tools |
| [guides/adding-easter-eggs.md](./guides/adding-easter-eggs.md) | Add terminal commands and easter eggs |

---

## Reference

| Document | Description |
|---|---|
| [reference/configuration.md](./reference/configuration.md) | All config constants, env vars, game tuning, localStorage keys |
| [reference/type-definitions.md](./reference/type-definitions.md) | Consolidated TypeScript type reference |

---

## Cross-Reference Guide

### "How do I add a new tool?"
See [guides/adding-a-tool.md](./guides/adding-a-tool.md) and [tool-system.md](./tool-system.md#internal)

### "How does the game work?"
See [game-engine.md](./game-engine.md)

### "How does the coin system work?"
See [game-engine.md — Coin System](./game-engine.md#coin-system-srclibgamecoints)

### "How does auth/middleware routing work?"
See [auth.md](./auth.md)

### "Where is the XP/achievement logic?"
See [progression-system.md](./progression-system.md) and `src/lib/xp.ts`, `src/lib/achievements.ts`

### "What tables are in the database?"
See [database.md](./database.md)

### "Where are all the server actions?"
See [server-actions.md](./server-actions.md)

### "How do I add a terminal command or easter egg?"
See [guides/adding-easter-eggs.md](./guides/adding-easter-eggs.md) and [terminal-easter-eggs.md](./terminal-easter-eggs.md)

### "How do I deploy or set up environment variables?"
See [deployment.md](./deployment.md) or [guides/local-setup.md](./guides/local-setup.md)

### "Where are the tests and how do I run them?"
See [testing.md](./testing.md)

### "What components exist for X feature?"
See [components.md](./components.md)

### "What TypeScript types are available?"
See [reference/type-definitions.md](./reference/type-definitions.md)

### "What are all the config constants?"
See [reference/configuration.md](./reference/configuration.md)

### "How does the overall system fit together?"
See [architecture/overview.md](./architecture/overview.md)

### "What HTTP endpoints exist?"
See [api/endpoints.md](./api/endpoints.md)

### "How does easter egg discovery work?"
See [terminal-easter-eggs.md](./terminal-easter-eggs.md), [guides/adding-easter-eggs.md](./guides/adding-easter-eggs.md), and `src/hooks/use-easter-egg.ts`

### "What are the in-game achievement conditions?"
See [game-engine.md — In-Game Achievement System](./game-engine.md#in-game-achievement-system-srclibgameachievement-trackerts)

### "How does screen shake work?"
See [game-engine.md — Screen Shake](./game-engine.md#screen-shake-srclibgameeffectsts) and [reference/configuration.md](./reference/configuration.md#screen-shake)

### "How does the combo system work?"
See [game-engine.md — Combo System](./game-engine.md#combo-system-srclibgameeffectsts) and [reference/configuration.md](./reference/configuration.md#combo-system)
