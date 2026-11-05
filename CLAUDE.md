# Life Center: project guide

A private personal app with four modules on one data layer and one design system:
Calendar, To-do, Budget, and Blood work. The owner is Ali. The bar is "state of the art,
right the first time".

## Priorities (in order, for every decision)

1. Privacy and security. Health and money data never leak and never get lost.
2. Data correctness. Money, dates, units and reference ranges are exactly right.
3. Reliability. The daily flows never break.
4. Speed. It feels instant on a mid-range phone on a slow network.
5. Craft. It looks like a world-class product, not a template.

## Locked decisions (do not re-ask)

| Topic     | Decision                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| Stack     | Next.js + React, strict TypeScript, Supabase (Postgres, auth, RLS), Zod, Tailwind, Vitest, Playwright, pnpm, Vercel |
| Devices   | Desktop first. Phone must work well, but is second.                                                                 |
| Languages | English only, left to right. No i18n layer.                                                                         |
| Currency  | Multi-currency accounts, one home currency (IQD) for totals, converted with stored dated rates.                     |
| App type  | Installable web app (PWA) now. Native maybe later, so domain logic lives in framework-free packages.                |
| Users     | Just Ali. Still built multi-user safe: every row has an owner and RLS.                                              |

## How to work with Ali

- Short, plain words. Lead with the answer or the decision needed.
- One question at a time: 2 to 4 numbered options, one line of consequence each, a recommended pick and why.
- Say which mode you are in: **Brainstorm** (no code), **Audit** (scored, code only if asked),
  **Build** (only after an explicit "go", "build it" or "ship"). Silence is not approval.
- Never claim "done" or "should work". Say what you ran and what you could not check.
- Reviews open with a score table: axis | score | source. Keep going in waves until every axis is 9+.

## Feature workflow (every feature)

Look first, brainstorm, research 3+ leading products, grill-me pass, critic pass, mockups of every
state (empty, normal, bad data, error, loading, success) approved before code, measure before
choosing numbers, build in small tested pieces, scored waves to 9+.

## Code rules

- TypeScript strict everywhere (see `tsconfig.base.json`). No `any`, no casts (`as const` is fine).
- Validate every boundary with Zod: forms, API input, uploads, env vars, third-party data. Infer types from schemas.
- Database types are generated from the database, never hand-written.
- Domain rules (money, dates, recurrence, units, reference-range flags) are pure functions in
  `packages/*`, with no UI or database inside, and full unit tests.
- One component per file, small files, clear names. Reuse before writing new. Delete dead code.
- Banned: empty catch, swallowed errors, `console.*`, inline lint disables, `// TODO` / "fix later",
  sleep/retry hacks, hardcoded stand-ins for logic, commented-out code. ESLint enforces most of these
  and inline `eslint-disable` comments are switched off.
- Every new dependency needs a stated reason. Each workspace package declares its own dependencies.
- Scratch work goes in the ignored `.tmp/` folder and is cleaned up.

## Data rules

- **RLS on every table from the day it is created.** Owner comes from the session on the server,
  never from the client.
- **Money:** integer minor units plus currency code on every amount. One rounding function, one place
  for every total. Transfers and splits balance to zero by test. IQD is shown as whole dinars; ISO 4217
  lists 3 minor digits, so the money package states its minor-unit rule explicitly and tests it.
- **Time:** instants in UTC plus the IANA time zone name. "All day" is a date, not a time. Recurrence
  is stored as rules and tested across DST, month ends, leap days and time zone moves.
- **Units:** lab values are stored with their unit and the reference range that applied at the time.
  Never show a value without its unit. Conversion is one tested function.
- **Health data:** private bucket, owner-only, short-lived links. Never sent to logs, analytics or
  error tracking (see `apps/web/src/lib/observability/scrub-event.ts`). Never diagnose; say so in the UI.
- No silent data loss. Soft delete with undo where it fits. Every retryable write is idempotent.
- Audit trail for money and health changes (who, when, old, new).
- Error messages must not contain user data. They reach error tracking.

## Database and migrations

- Every schema change is a timestamped migration file in the repo, one purpose per file.
- Anything applied through a database tool is also saved as a migration file in the same turn.
- Never edit an applied migration. Add a new one.
- Grant permissions on new functions explicitly. Index every foreign key and every screen filter/sort.
- Show Ali exactly what a destructive change touches before running it.

## Tests and CI

- Unit tests for all domain logic. For bug fixes, write the failing test first.
- Integration tests prove user A cannot read user B's rows.
- End-to-end tests for daily flows on desktop and phone sizes.
- Never skip, disable or quarantine a test. Never assert nothing.
- CI (`.github/workflows/ci.yml`) is the gate: format, type-check, lint, unit tests, build, e2e,
  dependency audit, secret scan. Main is always deployable. No merging red. Confirm CI actually ran.

## Deploy and verify

Merged is not deployed, deployed is not working. After merge, check the deployment is ready, then use
the feature in production with a test account and report what you saw. Read production errors after
every release. Performance claims need 10+ runs with median and spread.

## Commands

```bash
pnpm install          # install everything
pnpm dev              # run the web app locally
pnpm format:check     # prettier
pnpm typecheck        # route types + tsc
pnpm lint             # eslint, zero warnings allowed
pnpm test             # unit tests (vitest)
pnpm build            # production build
pnpm e2e              # playwright on desktop and phone (run after build)
```

## Layout

```
apps/web/            Next.js app (App Router, src/ layout)
  src/env/           Zod-validated environment values (public and build-time)
  src/lib/           app-level helpers (observability, ...)
  e2e/               Playwright tests
packages/            shared framework-free packages (money, dates, units, ui) as they arrive
```

## Traps (read before every session)

Check the outcome, not the telemetry. A fix that agrees with its own forecast is unverified. A search
that finds nothing has not proved absence. Re-read any file you quote. "Fixed" usually means one call
site: check the whole class. Probe list queries against the real database before merging. Workspace
packages must declare their own dependencies. A tool timeout is not a cancel. Never overwrite another
session's uncommitted files. Money totals computed in two places will disagree. Dates break at DST,
month ends and time zone changes. A secret pasted once is leaked: rotate it.
