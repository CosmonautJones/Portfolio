---
name: progress
description: >
  Show Halliday Protocol roadmap progress and update the to-do tracker.
  Use when user says /progress, "show progress", "what's next", or "update roadmap".
---

# Progress

Show or update Halliday Protocol roadmap status.

**Pre-load:** Always read `ROADMAP.md` from the project root before doing anything else.

## Modes

### Show mode (default — no arguments)

Read `ROADMAP.md` and output a concise progress report:

1. **Waves complete** — count waves marked COMPLETE in the Progress Overview table vs total (e.g. "1 / 7 waves complete")
2. **Checkbox tally** — count all `- [x]` vs total `- [ ]` + `- [x]` lines, show as fraction and percentage (e.g. "20 / 127 items — 16%")
3. **Current wave** — the first wave in the overview table that is NOT marked COMPLETE. Show its name and its own checkbox count (e.g. "Wave 2: THE MAGIC — 0 / 30 items")
4. **Next up** — the first unchecked `- [ ]` item in the current wave

Format the output as a clean summary the user can scan at a glance.

### Update mode (argument contains "update", or user just shipped a wave)

Check off completed items and keep the roadmap in sync:

1. **Identify completed items** — infer from the conversation context which checklist items were just completed. If ambiguous, ask the user which items to check off.
2. **Check off items** — change `- [ ]` to `- [x]` for each completed item in `ROADMAP.md`.
3. **Sync the overview table** — if every checkbox in a wave section is now checked:
   - Update that wave's status to `COMPLETE` in the Progress Overview table
   - Update the "Completed: X / 7 waves" summary line
4. **Append changelog entry** — add a new entry under the Changelog section:
   ```
   ### Wave N: NAME — YYYY-MM-DD

   **Commit:** `<hash>`

   <Brief summary of what was delivered>
   ```
   Get the commit hash from `git log --oneline -1`. Use today's date.
5. **Show updated progress** — after making changes, run Show mode to display the new status.

## Rules

- **Never uncheck boxes** — items only move from `[ ]` to `[x]`, never backwards
- **Never remove items** — the checklist is append-only; items can be added but not deleted
- **Keep overview table in sync** — the table must always reflect the actual checkbox state
- **Ask when unsure** — if you can't determine which items were completed from context, ask the user rather than guessing
- **Preserve formatting** — keep the existing markdown structure, indentation, and section ordering intact
