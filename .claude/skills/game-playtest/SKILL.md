---
name: game-playtest
description: >
  Run the Playwright playtesting pipeline for ClaudeBot's Adventure.
  Dispatches smoke tester for fast validation, then deep playtester for UX review.
  Use when user says /game-playtest, "playtest the game", "test gameplay",
  "play the game", or "check if the game works".
---

# Game Playtest — Playwright Testing Pipeline

Run automated playtesting of ClaudeBot's Adventure using Playwright browser automation agents.

## Pre-flight

Before dispatching any agents:

1. **Check dev server** — verify `http://localhost:3000` is running:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
   ```
   If not running, tell the user: "Start the dev server with `npm run dev` first."

2. **Check for Playwright** — verify Playwright MCP is available by checking if browser tools are accessible.

## Pipeline

### Stage 1: Smoke Test (Fast Gate)

Dispatch the `game-smoke-tester` agent (haiku model, ~30 seconds):

```
Task: Run the smoke test checklist for ClaudeBot's Adventure at http://localhost:3000/adventure.
Check: page loads, no console errors, game starts, score increments, game-over works, mobile responsive.
Report PASS/FAIL with screenshots.
```

**If FAIL:** Stop pipeline. Report the failure to the user with screenshots. Create a task for the failing check.

**If PASS:** Proceed to Stage 2.

### Stage 2: Deep Playtest (UX Review)

Dispatch the `game-playtester` agent (sonnet model, ~2-3 minutes):

```
Task: Play 3-5 games of ClaudeBot's Adventure at http://localhost:3000/adventure.
Test at desktop (1440x900), tablet (768x1024), and mobile (375x812).
Take screenshots at: menu, mid-game, game-over, each viewport.
Check for: visual quality, console errors, UX friction, new feature functionality.
Produce a full Playtest Report.
```

### Stage 3: Report Summary

After both agents complete, compile a summary:

```markdown
## Playtest Pipeline Results

### Smoke Test: ✅ PASS / ❌ FAIL
[Summary of smoke test results]

### Deep Playtest: Complete
- Games played: N
- Scores achieved: [list]
- Bugs found: N
- UX observations: [highlights]

### Screenshots
[List of all screenshots taken]

### Action Items
1. [Bug/issue] — assigned to [agent]
2. ...
```

## Modes

### Quick mode (default or "quick")
Run only Stage 1 (smoke test). Fast, ~30 seconds.

### Full mode ("full" or "deep")
Run Stage 1 + Stage 2. Complete playtest, ~3 minutes.

### Feature mode (feature name as argument)
Run Stage 1, then Stage 2 with focus on a specific feature:
- `/game-playtest power-ups` — focus on power-up encounters and effects
- `/game-playtest weather` — focus on weather transitions and effects
- `/game-playtest ghost` — focus on ghost run recording and replay
- `/game-playtest leaderboard` — focus on real-time leaderboard
- `/game-playtest challenges` — focus on daily/weekly challenges
- `/game-playtest mobile` — focus on mobile viewport testing

When a feature is specified, include it in the playtester's task prompt so they focus their testing there.

## Rules

- **Always run smoke test first** — never skip to deep playtest
- **Stop on smoke failure** — don't waste time deep-testing a broken game
- **Save all screenshots** — they're evidence for bug reports
- **Create tasks for bugs** — every bug found becomes a tracked task
- **Report results clearly** — the user should understand the game's state at a glance
- **Don't modify code** — playtesting is read-only. Bugs get reported, not fixed.
