---
name: game-review
description: >
  Review game code changes for architecture compliance, performance, and correctness.
  Use when user says /game-review, "review game changes", "check game code",
  "game architecture check", or "verify game refactor".
---

# Game Review — Architecture Compliance Checker

Review game-related code changes against the architecture rules established during the overhaul. This is a code quality gate, not a functional test.

## Process

### 1. Identify Changed Files

Run `git diff --name-only HEAD~1` (or `git diff --staged --name-only` for uncommitted changes) to find modified files in game directories:
- `src/lib/game/`
- `src/components/adventure/`
- `src/hooks/use-game*.ts`
- `src/actions/game-scores.ts`
- `src/actions/challenges.ts`

### 2. Run Architecture Checks

For each changed file, verify these rules:

| Rule | Check | How to Verify |
|---|---|---|
| **Max file size** | No file > 400 LOC | `wc -l` on each file |
| **Max function size** | No function > 80 lines | Grep for function boundaries, count lines |
| **Types centralized** | All shared types in `types.ts` | Grep for `type ` and `interface ` in non-types.ts files |
| **Constants centralized** | All tuning values in `constants.ts` | Grep for magic numbers in engine files |
| **Pure engine** | No React imports in `src/lib/game/` | Grep for `from 'react'` or `from "react"` in game files |
| **RenderPass interface** | New passes implement RenderPass | Read new pass files, check implements/extends |
| **Particle budget** | Respects MAX_ATMOSPHERIC_PARTICLES | Grep for particle spawning, check budget enforcement |
| **No `any` types** | TypeScript strict compliance | `npx tsc --noEmit` |
| **Tests exist** | New modules have corresponding test files | Glob for `*.test.ts` matching new files |

### 3. Run Quality Gates

```bash
npm test          # All tests pass
npm run build     # Production build succeeds
npx tsc --noEmit  # No type errors
```

### 4. Check for Common Issues

- **Circular imports:** Engine modules importing from each other in a cycle
- **State mutation:** Engine functions modifying state directly instead of returning new state
- **Memory leaks:** Event listeners or subscriptions without cleanup
- **Missing cleanup:** useEffect hooks without return cleanup functions
- **Hardcoded URLs:** Check for hardcoded localhost or API URLs

## Output Format

```markdown
## Game Code Review

### Files Reviewed
- `src/lib/game/file.ts` (X lines)
- ...

### Architecture Compliance

| Rule | Status | Details |
|---|---|---|
| Max file size (400 LOC) | ✅/❌ | file.ts is X lines |
| Max function size (80 lines) | ✅/❌ | functionName in file.ts is X lines |
| Types in types.ts | ✅/❌ | Found inline type in file.ts:LINE |
| Constants in constants.ts | ✅/❌ | Magic number at file.ts:LINE |
| Pure engine (no React) | ✅/❌ | React import in file.ts:LINE |
| RenderPass interface | ✅/❌ | new-pass.ts implements RenderPass |
| Particle budget | ✅/❌ | Budget check present/missing |
| No `any` types | ✅/❌ | `any` found at file.ts:LINE |
| Tests exist | ✅/❌ | Missing tests for: file.ts |

### Quality Gates

| Gate | Status |
|---|---|
| `npm test` | ✅ PASS / ❌ FAIL |
| `npm run build` | ✅ PASS / ❌ FAIL |
| `npx tsc --noEmit` | ✅ PASS / ❌ FAIL |

### Issues Found
1. **[Rule] file.ts:LINE** — description of violation
   - Suggested fix: ...

### Summary
**OVERALL: ✅ APPROVED / ❌ CHANGES NEEDED (N issues)**
```

## Rules

- **Be strict on architecture rules** — these exist to prevent monolith regression
- **Be specific** — always include file paths and line numbers
- **Don't nitpick style** — focus on structural and correctness issues
- **Suggest fixes** — don't just report problems, suggest solutions
- **Run all quality gates** — never skip `npm test` or `npm run build`
