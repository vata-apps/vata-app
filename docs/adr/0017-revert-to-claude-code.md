# ADR-017: Revert to Claude Code with Fixed Author/Reviewer Models

**Status**: Accepted
**Date**: 2026-07-15

## Context

[ADR-015](./0015-migration-to-opencode-go.md) moved Sandcastle's execution backend from the Anthropic API (`claudeCode()`) to OpenCode Go (`opencode()`), trading Sonnet/Opus for Kimi K2.7 Code / Qwen3.7 Max on the premise of a flat $10/month replacing variable Anthropic spend. In practice, that premise did not hold: OpenCode Go's usage allowance resets **weekly**, not monthly, and the maintainer's actual usage across both the author flow (`agent-run.yml`) and the reviewer flow (`agent-review.yml`, [ADR-016](./0016-autonomous-pr-review.md)) hit that weekly cap quickly. Overage beyond the cap is billed at a worse rate, so real monthly spend ended up _higher_ than the Anthropic API spend ADR-015 was trying to avoid — the opposite of the intended outcome.

Separately, the local development tooling had also moved off Claude Code in the same window: PR #189 renamed `CLAUDE.md` to `AGENTS.md` and moved `.claude/{agents,skills,commands}` to `.opencode/{agents,skills,commands}` so OpenCode could read them natively, dropping Claude Code's hooks system (`.claude/settings.json` + `.claude/hooks/*.sh`) along the way. With Sandcastle reverting to Claude Code, running interactive/local development on a different tool than CI reintroduces the exact split ADR-015 and PR #189 were trying to avoid, just inverted. The maintainer decided to revert both moves together: Claude Code becomes the tool everywhere again — interactively and in CI.

## Decision

### Provider

Replace `opencode(model)` with `claudeCode(model)` again in `.sandcastle/run.ts` and `.sandcastle/review.ts`. CI installs `@anthropic-ai/claude-code` instead of `opencode-ai`, and authenticates via the `ANTHROPIC_API_KEY` secret (restored; no more `OPENCODE_GO_API_KEY` / `auth.json` write step).

### Fixed author/reviewer models — no more escalation tier

ADR-008 used a single default-model-plus-opt-in-escalation scheme (Sonnet 4.6 default, Opus 4.7 via `agent:use-opus`), which ADR-015 carried forward as `agent:escalate` (Kimi default, Qwen escalation) and ADR-016 inherited unchanged for the reviewer. This ADR drops that scheme entirely in favor of a fixed pairing by **role**, not by task difficulty:

| Role                 | Entry point             | Model      |
| -------------------- | ----------------------- | ---------- |
| Author (issue → PR)  | `.sandcastle/run.ts`    | **Sonnet** |
| Reviewer (PR review) | `.sandcastle/review.ts` | **Opus**   |

`.sandcastle/shared.ts` now exports `MODEL_SONNET = 'sonnet'` and `MODEL_OPUS = 'opus'` — the bare Claude Code CLI aliases, not dated snapshot IDs, so each always resolves to Anthropic's current default for that tier without a manual bump. `run.ts` always uses `MODEL_SONNET`; `review.ts` always uses `MODEL_OPUS`. Neither reads an `ESCALATE` env var anymore.

This is a deliberate change from both ADR-008 and ADR-016, not just a provider swap: the reviewer already runs a stronger review pass by design (a second, more careful look at code the author already wrote), so pinning it to Opus is a permanent property of the role, not a per-issue opt-in. The `agent:escalate` label (and its ADR-008 predecessor `agent:use-opus`) is retired — there is no remaining axis to escalate along.

### Workflow changes

Both `.github/workflows/agent-run.yml` and `.github/workflows/agent-review.yml`:

- "Install OpenCode CLI" + "Configure OpenCode Go auth" steps → single "Install Claude Code CLI" step (`npm install -g @anthropic-ai/claude-code`).
- "Detect escalation opt-in" step removed (no escalation axis left to detect).
- `ANTHROPIC_API_KEY` passed as an env var directly to the `Run agent` / `Run reviewer` step, matching the pre-ADR-015 pattern — no `auth.json` file written to disk.
- The failure-comment text drops the "Optionally add `agent:escalate` to escalate" suggestion.

Everything else from ADR-008 and ADR-016 — label lifecycle, `noSandbox()`, the `vata-agent`/`vata-reviewer` Apps, `pnpm verify` as the quality gate, `maxIterations: 5`, `idleTimeoutSeconds: 600`, `timeout-minutes: 45`, PR creation by the workflow, the reviewer's fix/flag policy and outcome table — is unchanged.

### Cost tracking stays as iteration counts

ADR-015 replaced `logCost()` (a per-run dollar estimate from Anthropic's rate card) with `logUsage()` (model + iteration count only), since OpenCode Go's flat rate made per-token cost tracking meaningless. Reverting the provider does not restore `logCost()`: the old rate table was pinned to Sonnet 4.6 / Opus 4.7 pricing and would need re-verifying against current Anthropic list prices to be trustworthy, which is out of scope for this revert. `logUsage()` stays; a dollar estimate can come back later as its own change if per-run cost attribution is needed again.

### Local tooling

Alongside the Sandcastle changes, `.opencode/{agents,skills,commands}` moved back to `.claude/{agents,skills,commands}`, `AGENTS.md` reverted to `CLAUDE.md`, and the Claude Code hooks (`.claude/settings.json`, `.claude/hooks/{protect-files,sql-guard,end-of-run}.sh`) were restored. The `execute-issue` agent and command (added after PR #189, while already on OpenCode) were ported to Claude Code's subagent format rather than dropped. The git-hook quality gate added alongside the original migration (`.githooks/sql-guard.sh`, the extended `.husky/pre-commit` running `tsc`/`cargo check`/`sql-guard` on every commit) is tool-agnostic and stays — it was never really an OpenCode-vs-Claude-Code decision, and it protects commits regardless of which tool authored them. This part of the revert is treated as a plain chore, consistent with how PR #189 itself was never ADR-tracked.

## Why

- **The $10/month premise was wrong in practice.** OpenCode Go's weekly-reset cap plus overage pricing made real spend higher than the Anthropic API cost it was meant to replace. A dedicated Anthropic API key with a hard Console spend limit has no overage — it stops instead of billing extra — which is the more cost-predictable option, not less.
- **One tool, not two.** Planning and interactive development already happen in Claude Code (Claude Pro/Max subscription). Running CI on a second tool (OpenCode) meant conventions, subagents, and skills had to be maintained in two formats or drift apart. Reverting both halves together removes that split.
- **Role-based models are simpler than task-based escalation.** The reviewer's job is inherently "look harder at what the author already wrote" — that is true for every PR, not just hard ones. A fixed Sonnet-writes/Opus-reviews split needs no per-issue judgment call and cannot be forgotten (unlike an opt-in label).
- **Keep the tool-agnostic wins.** The git pre-commit quality gate added during the OpenCode migration protects against human-authored regressions too, not just agent ones — reverting it would be a pure loss with no connection to which AI wrote the code.

## Alternatives Considered

- **Keep OpenCode Go, stay under the weekly cap by running less** — rejected: it would mean throttling legitimate agent/review runs to fit a cap that resets weekly, not the usage pattern this workflow actually has.
- **Keep the default/escalate tier system, just change the models back to Sonnet/Opus** — rejected: with only two single-purpose roles (write once, review once) and no evidence that "escalating" the author to Opus would help more than always having Opus review, a fixed pairing is simpler and removes a label most issues never touched anyway.
- **Revert Sandcastle only, leave local tooling on OpenCode** — rejected: it would leave the exact two-tool split this ADR is trying to eliminate, just with the imbalance reversed (CI on Claude Code, local dev on OpenCode).
- **Restore `logCost()` with updated Anthropic pricing** — deferred, not rejected: worth doing if per-run cost attribution becomes a real need again, but requires verifying current rates rather than reusing the stale ADR-008 table.

## Consequences

**Positive**:

- No more weekly-cap overage risk — a hard Console spend limit on the Anthropic API key stops usage instead of billing extra, making real cost predictable again.
- Local development and CI execution use the same tool again — one set of conventions, one agent/skill format.
- The model policy is simpler: two roles, two fixed models, no label to remember.

**Negative / Trade-offs**:

- Anthropic API spend is pay-per-token again, not a flat subscription — a dedicated API key with a monthly spend limit (as in ADR-008) needs to be provisioned again, and actual monthly cost now depends on usage volume rather than being fixed.
- No per-run dollar cost estimate (see "Cost tracking" above) until `logCost()` is deliberately restored with current rates — without it, spend is only visible via the Anthropic Console, not per-run in CI logs.
- The `agent:escalate` GitHub label is now dead and should be deleted from the repo (or repurposed) — it is no longer read by either workflow.

## References

- [ADR-008: Autonomous Agent Execution](./0008-autonomous-agent-execution.md) — the flow this reverts to
- [ADR-015: Migration to OpenCode Go](./0015-migration-to-opencode-go.md) — superseded by this ADR
- [ADR-016: Autonomous PR Review Agent](./0016-autonomous-pr-review.md) — model/cost sections superseded by this ADR
- [Agent Workflow](../dev-tools/agent-workflow.md) — operational guide, updated alongside this ADR
