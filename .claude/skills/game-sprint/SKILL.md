---
name: game-sprint
description: >
  Plan and execute a game system sprint. Orchestrates the full agent pipeline for
  ClaudeBot's Adventure overhaul. Use when user says /game-sprint, "run game sprint",
  "start sprint N", "game overhaul", or "next game phase".
---

# Game Sprint — Agent Pipeline Orchestrator

Orchestrate a sprint for the ClaudeBot's Adventure game overhaul. This skill coordinates the full agent team through a phased pipeline.

**Pre-load:** Read the plan at `.claude/plans/misty-marinating-parnas.md` for full context.

## Modes

### Show mode (default — no arguments or "status")

Check the current state of the game overhaul:

1. Run `TaskList` to see all game-related tasks
2. Group tasks by sprint and agent
3. Show:
   - Which sprints are complete, in-progress, or pending
   - Which agents have active tasks
   - Any blockers or failed tasks
4. Recommend the next action

Output format:
```
## Game Overhaul Status

### Sprint Progress
| Sprint | Status | Tasks Done | Tasks Remaining |
|---|---|---|---|
| 1: Architecture Refactor | ✅/🔄/⏳ | X/Y | list... |
| 2: Progression Unification | ... | ... | ... |
| 3: Social & Competitive | ... | ... | ... |
| 4: Enhanced Gameplay | ... | ... | ... |
| 5: Polish & Balance | ... | ... | ... |

### Active Agents
- agent-name: working on "task subject"

### Blockers
- (any failed or blocked tasks)

### Recommended Next Action
> description of what to do next
```

### Execute mode (argument contains a sprint number or feature name)

Run a sprint through the full pipeline:

1. **Validate prerequisites**
   - Check that the previous sprint is complete (all tasks marked completed)
   - If not: report what's remaining and stop
   - Exception: Sprint 1 has no prerequisites

2. **Create task tree**
   - Create a parent task for the sprint
   - Create child tasks for each agent's work items (see sprint details below)
   - Set up blockedBy dependencies between tasks

3. **Dispatch to game-lead**
   - Send the sprint plan to the `game-lead` agent via `Agent` tool
   - Include: sprint number, task IDs, agent assignments, dependency order
   - `game-lead` will coordinate the specialized agents

4. **Quality gates** (after game-lead reports completion)
   - Run `npm test` — must pass
   - Run `npm run build` — must pass
   - Dispatch `game-smoke-tester` for fast validation
   - If all pass: mark sprint complete
   - If any fail: report failures, keep sprint in-progress

## Sprint Details

### Sprint 1: Architecture Refactor
**Lead:** game-architect
**Support:** game-qa
**Tasks:**
1. [game-architect] Split engine.ts into 8 focused modules
2. [game-architect] Split GameCanvas.tsx into hooks + components
3. [game-architect] Resolve EngineBridge (wire or remove)
4. [game-qa] Write tests for refactored modules
5. [game-smoke-tester] Verify game still works after refactor

### Sprint 2: Progression Unification
**Lead:** progression-unifier
**Support:** game-qa
**Tasks:**
1. [progression-unifier] Wire awardXPRef/unlockAchievementRef in GameCanvas
2. [progression-unifier] Merge site + game achievement registries
3. [progression-unifier] Consolidate toast systems
4. [game-qa] Test unified progression flow
5. [game-smoke-tester] Verify game + XP awards work

### Sprint 3: Social & Competitive
**Lead:** social-engineer
**Support:** progression-unifier, game-qa, game-playtester
**Tasks:**
1. [social-engineer] Real-time leaderboard (Supabase Realtime)
2. [social-engineer] Ghost run system (record + replay)
3. [social-engineer] Daily/weekly challenges
4. [social-engineer] Personal bests tracking
5. [social-engineer] Shareable run summaries
6. [progression-unifier] Add challenge completion achievements
7. [game-qa] Test social features
8. [game-playtester] UX review of social features

### Sprint 4: Enhanced Gameplay
**Lead:** gameplay-mechanic
**Support:** visual-polish, game-balance, game-qa, game-playtester
**Tasks:**
1. [gameplay-mechanic] Power-up system
2. [gameplay-mechanic] Boss lanes
3. [gameplay-mechanic] Weather effects
4. [gameplay-mechanic] Unlockable skins
5. [visual-polish] Power-up visuals + audio
6. [visual-polish] Weather rendering + ambient audio
7. [visual-polish] Boss lane visuals + warning audio
8. [game-balance] Tune difficulty with new features
9. [game-qa] Test all new mechanics
10. [game-playtester] Full playtest with new features

### Sprint 5: Polish & Balance
**Lead:** game-balance
**Support:** visual-polish, game-qa, game-playtester
**Tasks:**
1. [game-balance] Run simulations, produce balance report
2. [game-balance] Apply constant adjustments
3. [visual-polish] Polish effects based on playtest feedback
4. [visual-polish] Audio enhancement pass
5. [game-qa] Full regression test suite
6. [game-playtester] Final comprehensive playtest
7. [game-smoke-tester] Final smoke test at all viewports

## Rules

- **Never skip a sprint** — they must run in order (1 → 2 → 3 → 4 → 5)
- **Never skip QA** — every sprint ends with testing
- **Quality gates are mandatory** — `npm test` + `npm run build` must pass
- **One sprint at a time** — don't start the next sprint until the current one passes all gates
- **Report blockers immediately** — if an agent is stuck, surface it to the user
