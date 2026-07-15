# ADR-018: Two-Stage PR Review — Opus Analyzes, Sonnet Fixes

**Status**: Accepted
**Date**: 2026-07-15

## Context

[ADR-017](./0017-revert-to-claude-code.md) fixed the autonomous reviewer (`.sandcastle/review.ts`) to a single Opus session that both analyzes the PR diff and applies high-confidence fixes itself. That decision was cost-motivated (see ADR-017's corrected rationale: OpenCode Go's weekly-cap overage, not model quality, drove the revert to the Anthropic API), but running the _entire_ reviewer session on Opus does not minimize Anthropic API spend either — Opus costs several times more per token than Sonnet, on both input and output.

Within a single review run, the token-heavy work is not the initial analysis (read the diff, form a judgment) — it is the edit/verify iteration loop: making a change, running `pnpm verify`, reading the failure output, retrying. The author flow (`run.ts`) already does exactly this kind of work on Sonnet. There is no reason the reviewer's _execution_ of an already-decided fix needs Opus at all — only the _judgment_ of what counts as a high-confidence fix benefits from the stronger model.

## Decision

Split `.sandcastle/review.ts` into two sequential `wt.run()` calls on the same worktree (confirmed via the sandcastle types: a `Worktree` handle is reusable across multiple `run()` calls, so no second `createWorktree()` is needed):

1. **Analyze (Opus, read-only).** `claudeCode(MODEL_OPUS)` runs `.sandcastle/prompts/review-analyze.md`: reads the diff against the issue spec and `CLAUDE.md`, and produces two blocks — `<fixes-to-apply>` (each entry precise enough to implement with zero further judgment: file, location, problem, exact fix) and `<review-findings>` (Summary + Flagged for maintainer only — nothing has been fixed yet). It does not edit files, commit, or run `pnpm verify` — and correspondingly carries no `pnpm install` sandbox hook, since it has no use for `node_modules`.
2. **Fix (Sonnet, execution only) — skipped when there is nothing to fix.** If `<fixes-to-apply>` is non-empty (checked via the new `hasFixesToApply()` helper, mirroring `hasFlaggedFindings()`), `claudeCode(MODEL_SONNET)` runs `.sandcastle/prompts/review-fix.md` with the fix list injected via `promptArgs`. This is the only stage carrying the `pnpm install --frozen-lockfile` sandbox hook — a clean or flag-only review never pays that install cost at all. It implements each fix **exactly as described — explicitly instructed not to re-review, re-judge, or challenge them**, one commit per fix, running `pnpm verify` after each. A fix that cannot be made to pass verify by following its own instructions (no creative alternatives) is reverted and reported as not applied rather than flagged for re-interpretation. It does **not** reproduce the review's Summary or Flagged content — it reports a compact `<fixes-applied>` block, one entry per fix (`Status: applied` + commit SHA, or `Status: not applied` + reason).

`review.ts` never trusts an agent to faithfully retranscribe another agent's output — the fix stage's job is narrowed to reporting per-fix status, and the final `<review-findings>` sent to the PR comment is assembled deterministically in TypeScript: `extractSection()` (a new, more general helper factored out of the old `hasFlaggedFindings()` regex) pulls the analysis's Summary and Flagged sections verbatim, `parseFixOutcomes()` parses the fix stage's `<fixes-applied>` block into structured `{ title, applied, detail }` entries, and `buildFinalFindings()` combines them: Summary from analysis, Fixed rendered from the applied outcomes, Flagged = analysis's original Flagged content plus any outcome marked not-applied. If stage 2 is skipped (nothing to fix), the same builder runs with an empty outcomes list, so the assembly logic doesn't fork on whether stage 2 ran.

`review.ts` also merges the two stages' `IterationResult[]` for logging, uses stage 2's commit count when it ran (0 otherwise), and takes `completed` from stage 2 when it ran, falling back to stage 1 otherwise. `decideReviewOutcome()` is unchanged — it only consumes `commits`, `completed`, `verifyPassed`, and `hasFlaggedFindings`, all of which stay well-defined regardless of how many stages actually ran.

## Why

- **The judgment call and the execution work have different cost profiles.** Deciding what is a high-confidence fix benefits from Opus. Applying an already-fully-specified fix and iterating on `pnpm verify` is exactly the kind of task Sonnet already does as the author agent (ADR-017) — there is no reason to pay Opus rates for it.
- **Skipping stage 2 when clean is a real saving, not just a rebalancing.** A meaningful fraction of reviews find nothing to fix (or only things to flag) — those now cost one Opus analysis run and zero Sonnet runs, instead of one full Opus run either way.
- **"Don't re-judge" is the safety condition, not an afterthought.** The whole approach only holds together if Sonnet treats Opus's fix list as ground truth rather than a suggestion — otherwise a cheaper model is quietly making the same judgment calls anyway, just without being told to. The `review-fix.md` prompt says this explicitly and repeatedly, and the fallback for an ambiguous fix is "implement the narrowest literal reading," not "use your own judgment."
- **`pnpm verify` is still the safety net.** Even if a fix description is imperfect, a fix that fails verify gets reverted and reported, not silently forced through — the existing conservative fix/flag policy from ADR-016 carries over unchanged to stage 2.
- **The report that gates a push decision shouldn't depend on an LLM transcribing faithfully.** `hasFlaggedFindings()` on the final report feeds `decideReviewOutcome()` directly. Asking the fix stage for a narrow, structured "did you apply fix N or not" is a task suited to an LLM; asking it to reproduce a whole document byte-for-byte is not, and there's no reason to accept that risk when `review.ts` already holds both halves of the content.

## Alternatives Considered

- **Keep the single Opus session (ADR-017's original shape)** — rejected: simplest, but pays Opus rates for the entire edit/verify loop, which is the actual cost driver, not just the analysis.
- **Single Sonnet session for everything (drop Opus from review entirely)** — rejected: loses the stronger judgment on _what_ to fix, which is the one place a second, more careful pass earns its keep (per ADR-016's original premise for the reviewer).
- **`resumeSession` to hand off context between stages** — rejected: sandcastle's session resumption is scoped to a single provider/model; there is no supported way to resume a Claude session started under one model with a different one. Plain text hand-off via `promptArgs` works across models and is simpler to reason about.
- **Have Sonnet re-emit the whole `<review-findings>` block, reusing Opus's Summary/Flagged "unchanged"** — this was the first draft of this ADR, and was reversed during implementation review. Trusting a second agent to faithfully retranscribe a document it didn't write, with no verification step, is exactly the kind of fragile hand-off this workflow shouldn't depend on — `hasFlaggedFindings()` on the result directly drives the push/flag/clean decision, so a paraphrased or dropped Flagged item would silently change the outcome. Deterministic assembly in `review.ts` (see Decision) removes that failure mode at the cost of one more small helper function.

## Consequences

**Positive**:

- Meaningfully lower Anthropic API spend per review run when there are fixes to apply (execution moves to the cheaper model), and zero second-stage cost at all when the review is clean or flag-only.
- The fix/flag policy, the outcome table, and `decideReviewOutcome()` are all unchanged — this is purely an internal execution-strategy change to `review.ts`.
- The outcome-gating report (`hasFlaggedFindings()`'s input) is assembled deterministically in TypeScript, not trusted to an agent's transcription — a paraphrased or dropped item can't silently change the `fixed`/`clean`/`flagged` decision.

**Negative / Trade-offs**:

- One more moving part: a text hand-off between two agent sessions instead of one continuous session (though now narrower — only the fix list crosses the boundary, not the findings too). A vague fix description from Opus could be implemented differently than intended — mitigated by requiring zero-judgment-call precision in the analysis prompt, and by the per-fix `pnpm verify` gate with revert-on-failure.
- Two agent processes to invoke instead of one when there are fixes to apply, adding a small amount of fixed overhead (worktree already exists, so this is mostly the second `claude` CLI startup, not a second checkout).
- `parseFixOutcomes()` depends on the fix stage following the `<fixes-applied>` format exactly (one `### Fix N: <title>` entry per listed fix). A malformed or missing entry is treated as "nothing to report" for that fix rather than erroring — conservative, but it means a genuinely-applied fix with a malformed status line could be silently absent from the "Fixed" section of the comment (the commit itself is still real and visible in the PR diff either way).

## References

- [ADR-016: Autonomous PR Review Agent](./0016-autonomous-pr-review.md) — the reviewer this restructures
- [ADR-017: Revert to Claude Code with Fixed Author/Reviewer Models](./0017-revert-to-claude-code.md) — established the Opus-reviews/Sonnet-authors split this ADR refines further
- [Agent Workflow](../dev-tools/agent-workflow.md) — operational guide, updated alongside this ADR
