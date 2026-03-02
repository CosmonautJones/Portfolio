# Portfolio Documentation

Developer reference for the portfolio site at [travisjohnjones.com](https://travisjohnjones.com).

## Documents

| Document | Description |
|---|---|
| [architecture.md](./architecture.md) | Project structure, route groups, request flow, key libraries |
| [auth.md](./auth.md) | GitHub OAuth, middleware routing rules, Supabase client factories |
| [tool-system.md](./tool-system.md) | Tool types (internal/external/embedded), registry, admin CRUD, GitHub import |
| [progression-system.md](./progression-system.md) | XP awards, levels, achievements, visitor context, optimistic UI |
| [game-engine.md](./game-engine.md) | ClaudeBot's Adventure — engine, renderer, input, audio, particles |
| [terminal-easter-eggs.md](./terminal-easter-eggs.md) | Terminal commands, easter eggs, vault, color schemes |
| [database.md](./database.md) | All 7 tables, migration index, RLS policy summary |
| [server-actions.md](./server-actions.md) | All server actions, signatures, return types, admin guard pattern |
| [components.md](./components.md) | Component inventory by category with descriptions |
| [testing.md](./testing.md) | Vitest setup, test file locations, patterns, mocking |
| [deployment.md](./deployment.md) | Netlify, environment variables, Supabase config, local dev |

## Quick Reference

- **Framework**: Next.js 15 App Router, React 19, TypeScript
- **Deployment**: Netlify at `travisjohnjones.com` (Node 20)
- **Database**: Supabase PostgreSQL (7 tables)
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

## Cross-Reference Guide

### "How do I add a new tool?"
See [tool-system.md — Adding an internal tool](./tool-system.md#internal)

### "How does the game work?"
See [game-engine.md](./game-engine.md)

### "How does auth/middleware routing work?"
See [auth.md](./auth.md)

### "Where is the XP/achievement logic?"
See [progression-system.md](./progression-system.md) and `src/lib/xp.ts`, `src/lib/achievements.ts`

### "What tables are in the database?"
See [database.md](./database.md)

### "Where are all the server actions?"
See [server-actions.md](./server-actions.md)

### "How do I add a terminal command or easter egg?"
See [terminal-easter-eggs.md](./terminal-easter-eggs.md)

### "How do I deploy or set up environment variables?"
See [deployment.md](./deployment.md)

### "Where are the tests and how do I run them?"
See [testing.md](./testing.md)

### "What components exist for X feature?"
See [components.md](./components.md)
