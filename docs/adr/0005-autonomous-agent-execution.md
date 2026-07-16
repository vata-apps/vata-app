# ADR-005: Autonomous Agent Execution via Sandcastle on GitHub Actions

**Status**: Accepted
**Date**: 2026-05-20 (provider fixed to Claude Code, 2026-07-15)

**Decision**: A label (`agent:ready`) on a GitHub issue dispatches `@ai-hero/sandcastle` in a GitHub Actions workflow, running **Claude Code (`claudeCode()`) on Sonnet** with `noSandbox()` on the ephemeral runner. The agent iterates against `pnpm verify` (lint + build + test) as its quality gate, authenticates via a dedicated `vata-agent` GitHub App (not `GITHUB_TOKEN`, not a PAT), and opens a PR (`Closes #N`) once it completes. Outcome is one of `agent:running` / `agent:success` / `agent:partial` / `agent:failed`, mutually exclusive. Caps: `maxIterations: 5`, `idleTimeoutSeconds: 600`, `timeout-minutes: 45`, monthly spend limit on the API key.

**Why**: Frees the maintainer's attention for PRD authoring and manual UI QA — the Tauri app isn't launchable headlessly in CI — instead of mechanical implementation.

**Alternatives considered**:

- **OpenCode Go (Kimi/Qwen models)** — tried, reverted: its weekly usage cap plus overage pricing made real spend higher than a capped Anthropic API key.
- **Claude Code Action (official)** — less control over iteration count and the per-step `pnpm verify` gate.
- **Hand-rolled script + raw Anthropic SDK** — reinvents iteration loops and branch/completion handling for no payoff.
- **Auto-escalation to a stronger model on failure** — rejected; a failing PRD fails on any model, so a fixed author model is simpler than a per-issue opt-in.

## References

- [Agent Workflow](../dev-tools/agent-workflow.md) — operational guide
