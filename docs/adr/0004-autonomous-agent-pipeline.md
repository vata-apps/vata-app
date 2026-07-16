# ADR-004: Autonomous Agent Pipeline — Sandcastle Execution and Review

**Status**: Accepted
**Date**: 2026-05-20 (reviewer added 2026-07-15; provider fixed to Claude Code 2026-07-15)

**Decision**: A label (`agent:ready`) on a GitHub issue dispatches `@ai-hero/sandcastle` in a GitHub Actions workflow, running **Claude Code (`claudeCode()`) on Sonnet** with `noSandbox()` on the ephemeral runner. The agent iterates against `pnpm verify` (lint + build + test), authenticates via a dedicated `vata-agent` GitHub App (not `GITHUB_TOKEN`, not a PAT), and opens a PR (`Closes #N`). Outcome is one of `agent:running` / `agent:success` / `agent:partial` / `agent:failed`. Caps: `maxIterations: 5`, `idleTimeoutSeconds: 600`, `timeout-minutes: 45`, monthly spend limit on the API key.

Every open, non-draft PR from `vata-agent[bot]` is then reviewed automatically by a second GitHub App, `vata-reviewer`, in two stages on the same worktree: **Analyze** (Opus, read-only — reads the diff against the issue spec and `CLAUDE.md`, lists zero-judgment-required fixes plus anything to flag) then **Fix** (Sonnet, execution only, skipped if there's nothing to fix — implements each listed fix verbatim, one commit per fix, reverting any that fails `pnpm verify`). Outcome (`fixed` / `clean` / `flagged` / `failed`) is assembled deterministically in code and posted as one PR comment; `clean` and `fixed` also auto-approve the PR, since neither leaves anything for the maintainer to judge. A `vata-reviewer[bot]`-authored push never re-triggers the review. A run superseded by a newer commit (concurrency cancellation) posts nothing — the newer run's comment is authoritative.

**Why**: Frees the maintainer's attention for PRD authoring and manual UI QA — the Tauri app isn't launchable headlessly in CI. Splitting the reviewer's judgment (Opus) from mechanical fix execution (Sonnet) keeps the expensive model only where it earns its keep — the edit/verify loop is the same work the Sonnet author agent already does.

**Alternatives considered**:

- **OpenCode Go (Kimi/Qwen models)** — tried, reverted: its weekly usage cap plus overage pricing made real spend higher than a capped Anthropic API key.
- **Claude Code Action (official)** — less control over iteration count and the per-step `pnpm verify` gate.
- **Single Opus session for the whole review** — rejected: pays Opus rates for the token-heavy edit/verify loop, not just the judgment call.
- **Escalation label / auto-escalation on failure** — rejected: a failing PRD fails on any model, and the reviewer's job is uniformly "look harder," so fixed model pairings need no per-issue opt-in.

## References

- [Agent Workflow](../dev-tools/agent-workflow.md) — operational guide
