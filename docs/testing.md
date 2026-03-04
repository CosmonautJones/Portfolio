# Testing

## Setup

**Framework**: Vitest + React Testing Library + jsdom

**Config**: `vitest.config.ts` (at project root)

**Global setup**: `src/test/setup.ts` — imports `@testing-library/jest-dom` for DOM matchers.

## Running Tests

```bash
npm run test           # Run all tests once (vitest run)
npm run test:watch     # Interactive watch mode
npx vitest run src/path/to/file.test.tsx   # Single test file
```

## Test File Locations

Tests are co-located with their source files using `__tests__/` subdirectories or `.test.ts/tsx` suffixes.

### Library Unit Tests

| Test File | Tests For |
|---|---|
| `src/lib/__tests__/constants.test.ts` | `src/lib/constants.ts` static data |
| `src/lib/utils.test.ts` | `src/lib/utils.ts` utility functions |
| `src/lib/validations.test.ts` | Zod validation schemas |

### Game Engine Tests

| Test File | Tests For |
|---|---|
| `src/lib/game/__tests__/engine.test.ts` | Game engine logic (tick, collisions, movement) |
| `src/lib/game/__tests__/renderer.test.ts` | Canvas renderer |
| `src/lib/game/__tests__/achievement-tracker.test.ts` | In-game achievement tracker |
| `src/lib/game/__tests__/coins.test.ts` | Coin spawning, collection, movement (gold/silver/ruby/diamond) |
| `src/lib/game/__tests__/effects.test.ts` | Screen shake (directional bias, micro-shake) and combo system |
| `src/lib/game/__tests__/lobster.test.ts` | Player sprite data — all 9 frames including UP_LAND and DOWN_BLINK |
| `src/lib/game/__tests__/particles.test.ts` | Particle system |
| `src/lib/game/__tests__/scaling.test.ts` | Responsive scaling logic |

**Total: 158 tests across 12 test files** (35 tests added in the graphics enhancement release).

### Middleware Tests

| Test File | Tests For |
|---|---|
| `src/lib/supabase/__tests__/middleware-adventure.test.ts` | Middleware routing rules |

## Test Patterns

### Pure Logic (Game Engine)

The game engine is pure TypeScript (no React), making it straightforward to unit test. Tests call `createInitialState()`, `tick()`, etc. directly with mock configs and callbacks.

```typescript
import { createInitialState, tick } from "@/lib/game/engine";

const config = { /* minimal test config */ };
const state = createInitialState(config, 600);
// Assert initial state properties
expect(state.phase).toBe("menu");
```

### Middleware Tests

Test the routing logic in `updateSession()` with mocked `NextRequest` and Supabase client.

```typescript
// Test: unauthenticated user visiting /tools should redirect to /login
```

### Validation Tests

Test Zod schemas with valid and invalid inputs.

```typescript
import { toolSchema } from "@/lib/validations";

const result = toolSchema.safeParse({ slug: "my-tool", ... });
expect(result.success).toBe(true);
```

## Mocking

### Supabase

Supabase clients are mocked for tests that involve auth or database calls. The test setup uses `vi.mock()` to replace client factory functions.

### Canvas

`OffscreenCanvas` and `CanvasRenderingContext2D` may need mocking in jsdom environment for renderer tests.

## Key Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `vitest` | 4.x | Test runner |
| `@testing-library/react` | 16.x | React component testing |
| `@testing-library/jest-dom` | 6.x | DOM assertion matchers |
| `@testing-library/user-event` | 14.x | User interaction simulation |
| `jsdom` | 28.x | DOM environment for tests |
| `@vitejs/plugin-react` | 5.x | React support in Vite/Vitest |

## Related Files

- `vitest.config.ts` — Test configuration
- `src/test/setup.ts` — Global test setup
- `src/lib/game/__tests__/` — Game engine tests
- `src/lib/supabase/__tests__/` — Middleware tests
- `src/lib/__tests__/` — Utility tests
