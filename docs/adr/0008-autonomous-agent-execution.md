# ADR-008: Autonomous Agent Execution via Sandcastle on GitHub Actions

**Status**: Accepted
**Date**: 2026-05-20

## Context

PRD authoring in Vata already produces structured, well-scoped specifications (via the `to-prd` / `grill-with-docs` workflow). The mechanical work of translating a verified PRD into code — read the spec, apply the project's patterns, run lint/build/test, open a PR — is high attention-cost for a solo maintainer and adds limited creative value once the spec is locked.

A separation of concerns is available:

- **Planning** happens locally with **Opus 4.7** via the Claude subscription (no marginal API cost).
- **Execution** can be delegated to **Sonnet 4.6** via the Anthropic API on a CI runner, headless, while the maintainer does other work.

The maintainer's QA on the resulting PR remains manual — the Tauri app is not launchable in CI without a display server, and visual / UX validation is precisely where human judgment adds the most value. The automation goal is therefore **a pre-filter** (lint + build + tests green before review), not autonomous merging.

Several mechanisms could host the execution step:

- **`@ai-hero/sandcastle`** — programmable TypeScript library that orchestrates an AI coding agent inside a configurable sandbox, with multi-iteration loops, completion signals, and branch strategies.
- **Claude Code Action (official)** — GitHub Action wrapping Claude Code, simpler to set up but less control over iteration count, completion semantics, and per-step hooks.
- **Hand-rolled script + raw Anthropic SDK calls** — maximum flexibility, but reinvents iteration loops, branch management, completion detection.
- **Do nothing** — keep all execution manual.

## Decision

Adopt **`@ai-hero/sandcastle`** as the execution engine, **invoked exclusively from GitHub Actions** (no local execution path), triggered by a **label on an issue**, with outcome reflected back via a **dedicated label namespace**.

### Execution surface

- **CI only.** Sandcastle runs in a GitHub Actions workflow. Local execution is not supported in v1 — local planning happens in interactive Claude Code with the maintainer's subscription, not via sandcastle.
- **Sandbox provider**: **`noSandbox()`**. The GitHub-hosted runner is itself an ephemeral VM and provides the isolation a Docker sandbox would add — running Docker-in-Docker on the runner provides no security benefit and slows cold start.
- **Default model**: **Sonnet 4.6** via Anthropic API. Opus 4.7 is opt-in per run via a label (`agent:use-opus`); auto-escalation is rejected because a failing PRD will likely fail on Opus too while costing ~5× more.

### Trigger and lifecycle

- **Trigger**: GitHub event `issues: labeled`, filtered on `agent:ready`. The maintainer adds the label manually once the PRD is locked.
- **Concurrency**: at most one run per issue (`concurrency.group: agent-issue-${number}`), `cancel-in-progress: false`. Parallel runs across different issues are allowed.
- **Branch**: sandcastle creates a worktree on `agent/issue-N` with `branchStrategy: { type: "branch" }`.
- **Quality gate**: between iterations, the agent runs the `pnpm verify` suite (lint + format check + build + vitest) so it sees its own failures and self-corrects. The same suite is re-run by `main.ts` in the worktree after sandcastle finishes, as an independent verification.
- **PR creation**: opened by the workflow (not by the agent) once the run completes successfully, with `Closes #N` in the body for auto-close at merge. The PR body itself is written by the agent (a `<pr-description>` block extracted from its output); the workflow only frames it with the `Closes` line and a metadata footer.
- **Token**: the workflow authenticates with a fine-grained PAT (`AGENT_GH_TOKEN`), not the default `GITHUB_TOKEN`. GitHub suppresses downstream workflow triggers for `GITHUB_TOKEN`-authored events, so a PAT is required for the agent's PR to run `ci.yml`.

### Label-based outcome tracking

Five mutually exclusive labels in the `agent:*` namespace:

| Label           | Set by     | Meaning                                                                            |
| --------------- | ---------- | ---------------------------------------------------------------------------------- |
| `agent:ready`   | Maintainer | PRD locked; the workflow may pick this up                                          |
| `agent:running` | Workflow   | A run is currently in progress on the CI                                           |
| `agent:success` | Workflow   | PR opened, CI green, agent emitted the completion signal                           |
| `agent:partial` | Workflow   | PR opened as draft; CI green but agent exhausted `maxIterations` without signaling |
| `agent:failed`  | Workflow   | No PR; sandcastle threw, no commits produced, or CI red — see issue comment        |

Plus one orthogonal modifier:

| Label            | Set by     | Meaning                                                     |
| ---------------- | ---------- | ----------------------------------------------------------- |
| `agent:use-opus` | Maintainer | Use Opus 4.7 for this run instead of the default Sonnet 4.6 |

**Invariant**: at most one of the five outcome labels is present at any time. The workflow performs an atomic remove-then-add at each transition.

### Status pipeline

Project Status (Icebox / Todo / In Progress / Done) is **not piloted by the workflow**. The Project's built-in workflows already flip Status when the PR opens (→ In Progress) and when it merges or the issue closes (→ Done). The `agent:running` label covers the gap between label-applied and PR-opened.

### Cost controls

- `maxIterations: 5` (sandcastle cap)
- `idleTimeoutSeconds: 600` (10 min, sandcastle cap)
- `timeout-minutes: 45` (GitHub Actions job-level cap)
- A **dedicated Anthropic API key** (`vata-sandcastle-prod`) with a **mensual spend limit** set in the Anthropic Console — initially **$100/month**, adjustable up. Keeping it separate from the maintainer's Claude Code API key makes the spend attributable and revocable without disrupting interactive work.

### Repository layout

```
.github/
  workflows/
    agent-run.yml             # new, triggered by agent:ready
    ci.yml                    # unchanged
.sandcastle/
  main.ts                     # entry: reads env, calls sandcastle.run()
  prompts/
    default.md                # v1 generic template, issue body inlined
  .gitignore                  # ignores .env and logs/
```

Label cleanup before each run is performed inline in `agent-run.yml` via a batched `gh issue edit --remove-label … --remove-label …` call — no separate script.

In CI, `ANTHROPIC_API_KEY` and `AGENT_GH_TOKEN` are supplied from repo secrets — no `.env` file is created. `.sandcastle/.env` and `.sandcastle/logs/` are gitignored for any future local-debug use.

## Why

- **Quality gate that scales attention.** Lint + build + tests must be green before review — the maintainer no longer spends time on PRs that fail trivial checks.
- **Cost asymmetry exploited.** Opus is essentially free for planning (covered by the subscription); Sonnet is the right price/quality point for execution. The two-tier flow respects each tier's strengths.
- **Programmatic control over iterations.** Sandcastle's `maxIterations` + completion signal + hooks give explicit handles on stopping criteria — critical for bounding cost.
- **Label-based UX has zero infrastructure.** `agent:ready` triggers the workflow instantly; outcome labels turn the issues list into a real-time dashboard. No webhook, no polling, no PAT for Projects v2.
- **QA remains manual where it matters.** The Tauri app cannot run headlessly in CI; UI/UX validation is precisely the maintainer's strongest signal. The automation does not pretend to replace it.

## Alternatives Considered

- **Claude Code Action (official)** — rejected: less programmatic control over iteration count and completion signal; harder to wire the per-iteration `lint/build/test` quality gate; opinionated about how it commits and pushes.
- **Hand-rolled script + raw Anthropic SDK** — rejected: reinvents iteration loops, branch lifecycle, completion-signal detection, and abort handling. No payoff for a solo project.
- **Local-first execution** — rejected: the value proposition is _the agent works while the maintainer does something else_; running it locally serializes attention.
- **Auto-escalation Sonnet → Opus on failure** — rejected: a failing PRD fails on both models; auto-burning Opus tokens is a false shortcut. Manual opt-in via `agent:use-opus` keeps cost intentional.
- **Sub-typed failure labels (`agent:failed:tests`, `agent:failed:timeout`)** — rejected for v1: failure details belong in the issue comment (richer than any label), and a 4-color label palette is easier to read than 8 colors.
- **Workflow-piloted Project Status** — rejected: built-in Projects v2 workflows already cover Todo → In Progress (on PR open) and → Done (on merge). The `agent:running` label fills the only remaining gap.
- **Docker-in-Docker sandbox in CI** — rejected: the runner is already ephemeral, so the second isolation layer adds no security and ~30–60s per run.

## Consequences

**Positive**:

- Mechanical execution work is offloaded; the maintainer's attention is reserved for PRD authoring and QA.
- Pre-validation (lint + build + test) is enforced before review, removing trivial-failure PRs from the queue.
- Cost is double-bounded: per-run (`maxIterations`, `timeout-minutes`) and per-month (Anthropic spend limit on a dedicated key).
- Outcomes are visible on the issues list itself — no external dashboard.

**Negative / Trade-offs**:

- Dependency on a young library (`@ai-hero/sandcastle`). API may evolve; a future major version could require non-trivial migration of `.sandcastle/main.ts`.
- No visual / UI verification in CI — agent successes can still produce visually-wrong code, caught only at manual QA.
- Token cost is real and recurrent. A poorly-scoped PRD can burn a few dollars per retry; spend limit caps the bleeding but does not prevent waste case-by-case.
- The `agent:*` label namespace adds 6 labels to the repo — minor cognitive overhead in the labels list.

## References

- [`@ai-hero/sandcastle`](https://github.com/mattpocock/sandcastle) — execution engine
- [Issue Tracking](../dev-tools/issue-tracking.md) — backlog conventions and existing Status pipeline
- [Agent Workflow](../dev-tools/agent-workflow.md) — operational guide for using the workflow
