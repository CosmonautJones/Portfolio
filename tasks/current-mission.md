# Current Mission

## Mission

Clean up release health debt so `main` is quieter, safer, and easier for the
harness to babysit.

## Why This Mission

The last run shipped successfully, but the release surface still has three
known signals: GitHub reports dependency vulnerabilities, GitHub Actions warns
about Node 20 action runtime deprecation, and ESLint reports one existing React
hook dependency warning. These are small enough to handle as one quality pass
without expanding product scope.

## Scope

- Investigate GitHub dependency alerts and update safe dependency ranges.
- Fix or intentionally document the `inputRef` hook dependency warning in
  `src/hooks/use-game-engine.ts`.
- Update CI workflow runtime/action configuration if needed.
- Keep changes limited to release health, dependency metadata, and focused
  tests.

## Out Of Scope

- New portfolio features.
- Visual redesign.
- Auth or Supabase schema behavior changes.
- Broad package upgrades unrelated to the reported alerts.
- Migrating deployment providers.

## Likely Files

- `package.json`
- `package-lock.json`
- `.github/workflows/*`
- `src/hooks/use-game-engine.ts`
- Tests near any dependency-sensitive code path.

## Acceptance Criteria

- `npm run lint` has no project warnings unless an exception is explicitly
  documented.
- `npm run test` passes, using worker limits only if needed.
- `npm run build` passes.
- GitHub CI passes after push.
- Dependency alert count is reduced, or remaining alerts are categorized with a
  reason they cannot be safely fixed in this slice.

## Test Plan

- Run `npm audit` or GitHub/dependabot inspection for the vulnerable packages.
- Run `npm run lint`.
- Run `npm run test`.
- Run `npm run build`.
- Watch GitHub CI after push.

## Done Definition

The release surface is quieter and better explained: local checks pass, CI
passes, and remaining security or tooling warnings are either fixed or captured
as explicit follow-up work.
