# Release Checklist

Use this before calling a harness mission done.

## Local

- Review `git status --short --branch`.
- Run `git diff --check`.
- Run the repo's relevant lint, test, build, or smoke checks.
- Confirm no unrelated files are staged.

## Commit And Push

- Commit to the branch required by `AGENTS.md` or the user's request.
- Push the branch.
- Confirm local and remote branch heads match.

## PR And CI

- Check open PRs.
- Check workflow/check runs for the pushed commit.
- Watch active CI to completion when practical.
- Record pass/fail status, run URL, and unresolved warnings in `docs/agent-review-log.md`.
