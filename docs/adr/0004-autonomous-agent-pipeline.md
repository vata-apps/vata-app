# ADR-004: Autonomous Agent Pipeline — Sandcastle Execution and Review

**Status**: Accepted
**Date**: 2026-05-20 (reviewer added 2026-07-15; provider fixed to Claude Code 2026-07-15)

**Decision**: A label (`agent:ready`) on a GitHub issue dispatches `@ai-hero/sandcastle` in a GitHub Actions workflow, running **Claude Code (`claudeCode()`) on Sonnet** with `noSandbox()` on the ephemeral runner. The agent iterates against `pnpm verify` (lint + build + test), authenticates via a dedicated `vata-agent` GitHub App (not `GITHUB_TOKEN`, not a PAT), and opens a PR (`Closes #N`). Outcome is one of `agent:running` / `agent:success` / `agent:partial` / `agent:failed`. Caps: `maxIterations: 5`, `idleTimeoutSeconds: 600`, `timeout-minutes: 45`, monthly spend limit on the API key.

Every open, non-draft, same-repo PR is then reviewed automatically by a second GitHub App, `vata-reviewer`, in two stages on the same worktree: **Analyze** (read-only — reads the full `main...HEAD` diff against the issue spec and `CLAUDE.md`, lists the fixes to apply plus anything to flag) then **Fix** (Sonnet, execution only, skipped if there's nothing to fix — implements each listed fix verbatim, one commit per fix, `lint` + `build` after each and a full `pnpm verify` once at the end, reverting whatever fails). Outcome (`fixed` / `clean` / `noted` / `flagged` / `failed`) is assembled deterministically in code into one message.

**Analysis runs Opus on a PR's first round and Sonnet on every round after it.** The first round is the expensive and decisive one — a cold read of the whole diff with nothing yet ruled out. Later rounds check an increment against findings the first round already made, which is far lighter work at a fraction of the per-token cost. Each run logs a lower-bound cost estimate from the reported token usage.

**The reviewer owns the codebase; the maintainer owns the product.** Anything the reviewer can decide on its own — structure, naming, dead code, convention drift, half-applied sweeps, stale comments, either side of an internal tradeoff — it fixes rather than reports. Escalation is capped at 3 items per round and reserved for what changes user-visible behavior _and_ cannot be settled without the maintainer: a spec that is silent or self-contradictory, or a regression that needs the running app (the Tauri UI can't launch in CI). "This is a design call" is not grounds to escalate — the reviewer makes the call.

**Each round is additive.** The reviewer's own previous comments on the PR are fed back into the analysis prompt, so a finding is reported once: already-reported items stay reported, an item the maintainer left standing is a settled decision, and no round reverses an earlier round's fix/flag split. Without this the reviewer re-derives the whole diff from scratch on every push and reports the same items indefinitely.

For `fixed`/`clean` — nothing left for the maintainer to judge — that message is the body of a PR approval (`gh pr review --approve`); other outcomes post it as a plain PR comment instead. A `vata-reviewer[bot]`-authored push never re-triggers the review. A run superseded by a newer commit (concurrency cancellation) posts nothing — the newer run's comment is authoritative. Reviewer caps: `maxIterations` 5 analyzing / 10 fixing (a fix-everything round is routinely a dozen commits), `timeout-minutes: 60`.

**Why**: Frees the maintainer's attention for PRD authoring and manual UI QA — the Tauri app isn't launchable headlessly in CI. Splitting the reviewer's judgment (Opus) from mechanical fix execution (Sonnet) keeps the expensive model only where it earns its keep — the edit/verify loop is the same work the Sonnet author agent already does.

**Alternatives considered**:

- **OpenCode Go (Kimi/Qwen models)** — tried, reverted: its weekly usage cap plus overage pricing made real spend higher than a capped Anthropic API key.
- **Claude Code Action (official)** — less control over iteration count and the per-step `pnpm verify` gate.
- **Single Opus session for the whole review** — rejected: pays Opus rates for the token-heavy edit/verify loop, not just the judgment call.
- **Narrowing each round to the newest commit** — rejected: the full diff stays the review scope. Round memory removes the repetition without narrowing what gets looked at.
- **Leaving code-quality findings to the maintainer** — rejected after PRs #216 and #226, where three consecutive rounds each produced ~13 findings, mostly repeats, and most of them internal to the code rather than about whether the feature worked.
- **Escalation label / auto-escalation on failure** — rejected: a failing PRD fails on any model, and the reviewer's job is uniformly "look harder," so fixed model pairings need no per-issue opt-in.
- **Opus on every analysis round** — rejected on cost: a day of review across two PRs reached ~$20, dominated by re-reading the same diffs at Opus rates round after round.

## References

- [Agent Workflow](../dev-tools/agent-workflow.md) — operational guide
