# ADR-008: Autonomous PR Review Agent

**Status**: Accepted
**Date**: 2026-07-15

**Decision**: A second GitHub App (`vata-reviewer`) reviews every open, non-draft PR authored by `vata-agent[bot]`, triggered on `pull_request` (`opened`/`synchronize`/`reopened`/`ready_for_review`). Two sequential stages on the same worktree:

1. **Analyze — Opus, read-only.** Reads the diff against the issue spec and `CLAUDE.md`, produces a list of zero-judgment-required fixes plus anything to flag for the maintainer. Makes no edits.
2. **Fix — Sonnet, execution only, skipped if there's nothing to fix.** Implements each listed fix verbatim (no re-judging), one commit per fix, `pnpm verify` after each; a fix that can't pass verify is reverted and reported, not reinterpreted.

Outcome (`fixed` / `clean` / `flagged` / `failed`) is assembled deterministically in code, not trusted to an agent's transcription, and posted as one PR comment. A `vata-reviewer[bot]`-authored push never re-triggers the review (loop break via sender check).

**Why**: A second, more careful pass catches logic bugs and spec/convention violations `pnpm verify` can't. Splitting judgment (Opus) from mechanical execution (Sonnet) keeps the expensive model only where it earns its keep — the edit/verify loop is the same work the Sonnet author agent already does.

**Alternatives considered**:

- **Single Opus session doing both analysis and fixes** — rejected: pays Opus rates for the token-heavy edit/verify loop, not just the judgment call.
- **Escalation label inherited from the issue** — rejected: the reviewer's job ("look harder at already-written code") is uniformly true for every PR, so a fixed Opus pairing needs no per-issue opt-in.
- **Reviewing draft or human-authored PRs** — rejected: out of scope; drafts are intentionally unfinished, and all code here is agent-authored.

## References

- [ADR-005: Autonomous Agent Execution](./0005-autonomous-agent-execution.md) — the issue → PR flow this reviews
- [Agent Workflow](../dev-tools/agent-workflow.md) — operational guide
