# CI Workflow Design

## Context

The project has no CI/CD infrastructure. All quality checks (lint, format, types, tests) run only locally. A failing check can slip through to `main` if a developer forgets to run them before merging a PR. This workflow adds automated quality gates.

Dependabot is already enabled on GitHub for dependency updates.

## Scope

A single GitHub Actions workflow for frontend quality checks. Backend (Rust/Tauri) build and cross-platform builds are explicitly out of scope — they will be separate workflows later.

## Workflow: `.github/workflows/ci.yml`

### Triggers

- `pull_request` targeting `main`
- `push` to `main`

### Runner

`ubuntu-latest`

### Setup

| Step     | Tool                             | Details                         |
| -------- | -------------------------------- | ------------------------------- |
| Checkout | `actions/checkout@v4`            | Default (shallow clone)         |
| pnpm     | `pnpm/action-setup@v4`           | Version 9                       |
| Node     | `actions/setup-node@v4`          | Version 22, pnpm cache enabled  |
| Install  | `pnpm install --frozen-lockfile` | Fail if lockfile is out of date |

### Quality Steps (sequential)

| Order | Step   | Command             | Purpose                                               |
| ----- | ------ | ------------------- | ----------------------------------------------------- |
| 1     | Lint   | `pnpm lint`         | ESLint check on ts/tsx files                          |
| 2     | Format | `pnpm format:check` | Prettier check on src/\*_/_.{ts,tsx}                  |
| 3     | Build  | `pnpm build`        | TypeScript type-check (`tsc`) + Vite production build |
| 4     | Test   | `pnpm vitest run`   | Vitest single-run (no watch mode)                     |

Steps are sequential — if lint fails, the rest don't run (fail-fast).

### Not Included

- Coverage thresholds or report upload (no baseline defined yet)
- Tauri/Rust build (separate future workflow)
- Artifact upload
- Branch protection rules (manual GitHub setting, not part of this workflow)

## Files to Create

| File                       | Purpose         |
| -------------------------- | --------------- |
| `.github/workflows/ci.yml` | The CI workflow |

## Verification

1. Push the workflow file on a feature branch
2. Open a PR to `main` — confirm the workflow triggers and all 4 steps pass
3. Merge — confirm the workflow triggers on push to `main`
4. Introduce a deliberate lint error on a branch — confirm the workflow fails at the lint step
