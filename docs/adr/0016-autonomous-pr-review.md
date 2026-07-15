# ADR-016: Autonomous PR Review Agent

> **Provider and model choice superseded by [ADR-017](./0017-revert-to-claude-code.md)**: the reviewer uses `claudeCode()` again — not inherited from the issue's `agent:escalate` label, which is retired. **Execution strategy further superseded by [ADR-018](./0018-two-stage-review.md)**: analysis runs on Opus, but applying the fixes runs as a separate Sonnet stage, not the same Opus session. Everything else below (trigger/triage, reviewer identity, concurrency, review scope and fix policy, outcome table) remains valid.

**Status**: Accepted
**Date**: 2026-07-15

## Context

[ADR-008](./0008-autonomous-agent-execution.md) established autonomous agent execution: a label on an issue dispatches `vata-agent[bot]`, which implements the change and opens a PR. The maintainer then does manual QA and merges.

In that flow, every code change is written by one agent. `pnpm verify` catches mechanical failures, but it does not catch logic bugs that compile, silent divergences from the issue spec, or binary convention violations that lint clean. External AI review tools (CodeRabbit, Cubic) previously provided a second set of eyes, and [ADR-009](./0009-agent-review-feedback.md) wired the agent to act on their `changes_requested` reviews. Those tools have been removed, and the maintainer no longer submits formal `changes_requested` reviews — so the old trigger is dead. The maintainer now starts QA from a first draft.

We need a dedicated reviewer that automatically looks at every agent PR the moment it opens, re-reviews on every new commit, fixes the high-confidence defects itself, and flags anything uncertain for the maintainer.

## Decision

Add a second GitHub App, `vata-reviewer`, and a workflow `agent-review.yml` that runs an autonomous reviewer on every open, non-draft agent PR. The reviewer uses the same sandcastle stack as the author agent (`noSandbox()`, `opencode()`, `pnpm verify` as the quality gate) and the same cost ceilings.

### Trigger and triage

`on: pull_request` with types `[opened, synchronize, reopened, ready_for_review]`, scoped to `main`.

The workflow is two jobs: a `triage` job carrying only the gate below, and a `review` job (`needs: triage`) that does the work. GitHub skips a `needs:` job by default when its dependency is skipped, so no extra condition is needed on `review` — but the split matters for concurrency (see below). The `triage` gate proceeds only when all hold:

```
github.event.sender.login != 'vata-reviewer[bot]'
&& github.event.pull_request.user.login == 'vata-agent[bot]'
&& github.event.pull_request.draft == false
&& github.event.pull_request.state == 'open'
```

- **Not the reviewer's own push.** The `vata-reviewer` App identity is the loop break: its own pushes are sent by `vata-reviewer[bot]`, so the sender check skips them. This is deliberate and preferred over a git-author check on a shared App because it is unspoofable and free at the `if:` level.
- **Agent PRs only.** Scoping by PR author (`vata-agent[bot]`) is unspoofable — only the App can author PRs under that account.
- **No drafts.** Draft PRs are skipped until marked ready for review.
- **Open only.** Closed or merged PRs are ignored.

The original issue number is extracted from the PR head branch (`agent/issue-N`), reusing the existing convention.

### Reviewer identity

The reviewer authenticates and pushes under the **`vata-reviewer`** GitHub App, distinct from `vata-agent`. This gives clean attribution: code by `vata-agent`, review fixes by `vata-reviewer`. Because the App's own pushes carry the `vata-reviewer[bot]` sender, the triage gate naturally skips them, preventing infinite review loops and preventing a reviewer push from cancelling a legitimate in-flight review.

### Concurrency and cancellation

Concurrency (`cancel-in-progress: true`, grouped per PR) is declared on the **`review` job only**, never on `triage` and never at workflow level. This is deliberate: workflow- or triage-level concurrency would enter the cancelling group before the loop-break `if:` is evaluated, so a reviewer push (destined to be skipped) could cancel a legitimate review mid-comment. Because `review` only starts once `triage` has already passed, a reviewer's own push — which fails `triage` — never reaches the concurrency group at all; only genuine new commits (which pass `triage`) can cancel an in-flight review.

### Review scope and fix policy

Conservative, correctness-first:

- **In scope**: correctness bugs, clear violations of the issue spec, and binary `AGENTS.md` rule violations (`SELECT *`, missing i18n, forbidden placeholders, etc.).
- **Out of scope**: subjective refactors, simplification-for-taste, style changes that lint clean.

Two dispositions:

- **Auto-fix** high-confidence, objectively-wrong defects, stacked as new commits. Never amend or force-push.
- **Flag** anything subjective, uncertain, or unsafe to fix. The maintainer keeps the final say.

If a fix cannot get `pnpm verify` green, the reviewer reverts it and flags it.

### Model and cost

The default model tier is the same as the author agent (`opencode-go/kimi-k2.7-code`). Escalation is inherited from the issue's `agent:escalate` label — no new opt-in mechanism. Iteration, idle, and job timeouts match the existing flows:

- `maxIterations: 5`
- `idleTimeoutSeconds: 600`
- `timeout-minutes: 45`

### Outcome, push gate, and comment

One comment per run, always posted, anchored to the reviewed state. The workflow computes the header; the agent supplies the findings body as a single `<review-findings>` block. Posting the comment is a separate step from pushing, so a push failure (rejected, non-fast-forward) cannot swallow the comment — the maintainer is told what happened either way.

The outcome is derived from a single pure function, the one testable seam. It takes the run facts **and** whether the findings' "Flagged for maintainer" section is non-empty — `commits === 0` alone does not mean nothing was found; the reviewer may flag issues without fixing any of them, and that must not be reported as clean:

| Case                                                            | Outcome   | Push                                         |
| --------------------------------------------------------------- | --------- | -------------------------------------------- |
| Defects found + fixed, verify green, nothing flagged, completed | `fixed`   | Yes                                          |
| Nothing found and nothing flagged                               | `clean`   | No                                           |
| Anything flagged, or verify red, or iterations exhausted        | `flagged` | Yes if commits and verify are green, else no |
| Run errored                                                     | `failed`  | No                                           |

A `flagged` outcome still pushes when there are green, high-confidence fixes alongside the flagged items — withholding a correct fix just because something _else_ needed judgment would waste real work. The comment header distinguishes "pushed fixes, other issues flagged" from "found issues, pushed nothing."

### Code structure

- `.github/workflows/agent-review.yml` — the new workflow.
- `.sandcastle/review.ts` — sandcastle entry point for the reviewer.
- `.sandcastle/prompts/review.md` — reviewer prompt template.
- `.sandcastle/shared.ts` — shared utilities plus the pure `decideReviewOutcome` function.
- `.sandcastle/shared.test.ts` — unit tests for the outcome function.

The old review-feedback workflow (`agent-address-review.yml`), its entry point (`.sandcastle/address-review.ts`), and its prompt (`.sandcastle/prompts/address-review.md`) are deleted. [ADR-009](./0009-agent-review-feedback.md) is marked superseded.

## Why

- **A second set of eyes for every agent PR.** The maintainer starts QA from a reviewed branch rather than a first draft.
- **Self-correcting trivial defects.** High-confidence fixes are applied before the maintainer looks, reducing manual QA churn.
- **Maintainer keeps judgment on uncertain items.** Subjective or risky issues are surfaced, not silently edited.
- **Clean attribution.** A distinct GitHub App separates code authorship from review activity.
- **No infinite loops.** The App identity makes the loop break a free sender check.
- **One testable seam.** The outcome decision is a pure function, verifiable in CI without mocking GitHub or the LLM.

## Alternatives Considered

- **Shared `vata-agent` App with git-author loop break** — rejected: a git-author check is more complex and fragile than a free sender check, and attribution is less clean.
- **Workflow-level concurrency** — rejected: it would cancel legitimate in-flight reviews when the reviewer pushes its own fixes.
- **Reviewing draft PRs** — rejected: drafts are intentionally unfinished; review on `ready_for_review` is the right moment.
- **Reviewing human-authored PRs** — rejected: out of scope; all code is agent-authored.
- **A sticky comment updated in place** — rejected: a new comment per run preserves the audit trail and matches the SHA-anchored nature of the review.
- **A separate escalation opt-in for review** — rejected: inheriting the issue's `agent:escalate` keeps one model-tier policy across the whole system.

## Consequences

**Positive**:

- Every agent PR gets an automatic correctness and convention review before manual QA.
- Trivially-fixable bugs are fixed before the maintainer sees the PR.
- The maintainer's final QA starts from a reviewed, self-corrected branch.
- Reviewer fix pushes trigger `ci.yml` (App-authored push), so re-review starts from a known-green state.

**Negative / Trade-offs**:

- Adds one paid reviewer run per agent PR, drawn from the shared OpenCode Go budget.
- The reviewer shares the same model family as the author, so it has overlapping blind spots. It is a net add over no review, not a guarantee; manual QA remains the final gate.
- The `vata-reviewer` GitHub App must be created and its secrets stored before the flow can run.
- Trigger gating, the loop break, job-level cancellation, and review quality cannot be tested headlessly; they are validated by manual smoke tests on throwaway PRs.

## References

- [ADR-008: Autonomous Agent Execution](./0008-autonomous-agent-execution.md) — the issue → PR flow this reviews
- [ADR-009: Agent Addresses PR Review Feedback](./0009-agent-review-feedback.md) — superseded by this ADR
- [ADR-015: Migration to OpenCode Go](./0015-migration-to-opencode-go.md) — provider/model migration
- [Agent Workflow](../dev-tools/agent-workflow.md) — operational guide
