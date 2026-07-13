# ADR-009: Agent Addresses PR Review Feedback

> **Partially superseded by [ADR-015](./0015-migration-to-opencode-go.md)** for the LLM provider and model choice. The review-feedback architecture — trigger, identification, outcome signalling, concurrency — remains valid.

**Status**: Accepted
**Date**: 2026-05-22

## Context

[ADR-008](./0008-autonomous-agent-execution.md) established autonomous agent execution: a label on an issue dispatches a CI agent that implements the change and opens a PR. The maintainer then reviews that PR.

That review is currently a dead end for the agent — the maintainer either merges, or pushes corrections by hand. Re-dispatching the agent means re-labelling the issue `agent:ready`, which discards the PR and restarts the implementation from scratch. There is no way to say "this PR is close — address my review comments on it."

Closing that loop keeps the maintainer in the role ADR-008 designed for them — author the spec, judge the result — without dropping to hand-editing when the agent's first attempt needs adjustment.

## Decision

Add a second workflow, `agent-address-review.yml`, that runs the agent against an existing agent PR to address the maintainer's review feedback. It builds on the system established in ADR-008 (sandcastle, `noSandbox()`, the `vata-agent` GitHub App, `pnpm verify` as the quality gate) and does not restate it.

### Trigger

`on: pull_request_review` with `types: [submitted]`. The job runs only when all three hold:

```
review.state == 'changes_requested'
&& pull_request.state == 'open'
&& pull_request.user.login == 'vata-agent[bot]'
```

- **`changes_requested` only.** "Request changes" is the unambiguous "there is work to do" signal. "Comment" reviews stay discussion-only; "Approve" means the PR is ready. The review _type_ is the control surface — no command, no label.
- **Agent PRs only.** Scoping by PR author (`vata-agent[bot]`) is unspoofable — only the App can author PRs under that account. A branch name `agent/issue-N` could be spoofed; the author cannot.
- **Open PRs only.** A review on a closed or merged PR is a no-op.

A "Request changes" review with an empty body and no line comments is a misclick: the workflow detects it and posts a comment instead of running the agent.

### Identification

The original issue number is extracted from the PR's head branch name (`agent/issue-N`), which `agent-run.yml` always sets. The agent works on that existing branch — new commits stacked on top, never an amend or force-push (the maintainer's line comments are anchored to commit SHAs; rewriting history would orphan them).

### Agent context

The agent receives the review body, the line comments (each with its API `id`), and the original issue. It does **not** receive the PR diff (it has the branch checked out — `git diff` is free) or the conversation thread (noise; actionable feedback belongs in the review).

### Outcome signalling

Per-thread replies, not labels. The agent emits a `<review-replies>` block mapping each line-comment `id` to either a commit SHA or a skip reason; the workflow posts a reply in each thread (`Addressed in <sha> — …` or `Not addressed — …`). A single summary comment covers the review-body feedback and the overall verdict. Review threads are **not** auto-resolved — the maintainer resolves them on re-review, after verifying. The issue's `agent:*` labels are untouched.

Three outcomes, mirroring ADR-008:

- **success** — commits made (or all feedback legitimately skipped), `pnpm verify` green, completion signal emitted
- **partial** — commits made, `pnpm verify` green, but iterations exhausted before completion
- **failed** — sandcastle threw, `pnpm verify` red, or no commits and no `<review-replies>`

`pnpm verify` red means no push: the PR is live, and pushing red code would break it.

### Model

The model tier is inherited from the original issue's `agent:escalate` label — a task judged escalation-grade stays escalation-grade for its review iterations. There is no new opt-in mechanism; to escalate, add `agent:escalate` to the issue before submitting the review.

### Cost controls

Identical to `agent-run.yml`: `maxIterations: 5`, `idleTimeoutSeconds: 600`, `timeout-minutes: 45`. The OpenCode Go subscription budget is shared — issue runs and review runs draw from one pool.

### Concurrency

`concurrency: { group: agent-review-<pr-number>, cancel-in-progress: false }` serialises review runs on the same PR. There is no coordination with `agent-run.yml`: the collision (re-labelling the issue `agent:ready` while a review run is in flight) is rare and maintainer-induced, and re-labelling already means "start over".

### Code structure

The two flows share genuine utilities (`required`, `writeGithubOutput`, `extractTag`, `verify`) extracted to `.sandcastle/shared.ts`. Two entry points import them: `.sandcastle/run.ts` (renamed from `main.ts`, the issue→PR flow) and `.sandcastle/address-review.ts`. A new prompt template, `.sandcastle/prompts/address-review.md`, covers the review-feedback task and the `<review-replies>` protocol.

## Why

- **Closes the loop without displacing the maintainer's role.** Review feedback becomes actionable for the agent; the maintainer judges, the agent adjusts.
- **The review type is a zero-friction control surface.** "Request changes" already means "go fix this" — reusing it needs no command and no label.
- **Per-thread replies keep the feedback legible.** Each comment gets an explicit `Addressed in <sha>` or `Not addressed — reason`; nothing is silently ignored, and the maintainer still owns thread resolution.
- **Consistency with ADR-008** keeps one mental model: same App, same quality gate, same cost ceilings, same three-outcome vocabulary.

## Alternatives Considered

- **Comment command (`/agent address`)** — rejected: an explicit command is more friction than reusing the review verdict, and `pull_request_review` gives a clean `changes_requested` filter for free.
- **Extending `agent-run.yml`** — rejected: the issue→PR and review→commits flows have different lifecycles (fresh branch vs existing branch, new PR vs push to it). Branching one workflow on `github.event_name` interleaves two logics into an unreadable file.
- **`commented` reviews also trigger** — rejected: it collapses the discuss/dispatch distinction. "Comment" must stay free of cost and side effects.
- **Auto-resolving review threads** — rejected for v1: auto-resolution risks marking poorly-addressed feedback "resolved". Resolution stays the maintainer's verification gesture.
- **Scoping by branch name** — rejected as the _primary_ gate: branch names are spoofable, PR authorship is not. The branch name is still used, but only to extract the issue number.
- **A per-review escalation opt-in** (a label on the PR, a magic string in the review body) — rejected: inheriting the issue's `agent:escalate` needs no extra gesture and ties the model tier to the task's established difficulty.

## Consequences

**Positive**:

- The review→adjust loop no longer requires hand-editing or a from-scratch re-run.
- Every line comment gets an explicit disposition; out-of-scope feedback is answered, not ignored.
- The agent's review-addressing commits trigger `ci.yml` (App-authored push), so re-review starts from a known-green branch.

**Negative / Trade-offs**:

- Every "Request changes" review on an agent PR spends tokens. To request changes without dispatching the agent, the maintainer must use a "Comment" review instead.
- The `agent-run.yml` / `agent-address-review.yml` collision is unhandled — re-labelling an issue `agent:ready` while a review run is in flight can discard that work. Documented, not prevented.
- Setup duplicates ~6 CI steps across the two workflows (and `ci.yml`). Accepted: a composite action was rejected in ADR-008 as over-engineering for a solo project.
- Thread resolution stays manual — the maintainer resolves each addressed thread on re-review.

## References

- [ADR-008: Autonomous Agent Execution](./0008-autonomous-agent-execution.md) — the foundation this builds on
- [Agent Workflow](../dev-tools/agent-workflow.md) — operational guide, both modes
