# ADR-015: Migration from Anthropic API to OpenCode Go

**Status**: Accepted
**Date**: 2026-07-13

## Context

[ADR-008](./0008-autonomous-agent-execution.md) established autonomous agent execution on GitHub Actions using `@ai-hero/sandcastle` with the `claudeCode()` agent provider and the Anthropic API. The default model was Sonnet 4.6, with Opus 4.7 opt-in via `agent:use-opus`. A dedicated Anthropic API key (`vata-sandcastle-prod`) with a $100/month spend limit covered both issue runs and review runs.

The budgetary reality of maintaining a separate Anthropic API key for CI execution became unsustainable for a solo project. The maintainer already holds:

- A **Claude Pro/Max subscription** — used for local planning (grilling, PRD authoring, architecture review). No marginal cost per token. Cannot be used in CI (Anthropic prohibits subscription credentials in automated environments).
- An **OpenCode Go subscription** — $10/month for $60 of usage value across open-source coding models (GLM, Kimi, DeepSeek, Qwen, MiniMax, MiMo). Accessible via API key from any agent, including CI.

Sandcastle's `claudeCode()` provider shells out to the `claude` CLI and talks to the Anthropic API. Sandcastle also ships an `opencode()` provider that shells out to the `opencode` CLI — which authenticates to OpenCode Go via a simple `auth.json` file and supports every Go model through a single `--model opencode-go/<model-id>` flag.

The architectural shape from ADR-008 (label-triggered workflow, `noSandbox()`, `vata-agent` GitHub App, `pnpm verify` quality gate, `maxIterations: 5`, three-outcome labelling, PR creation by the workflow) is orthogonal to the choice of LLM provider. Only the provider, the models, the auth mechanism, and the cost-tracking surface need to change.

## Decision

Migrate the execution backend from the Anthropic API (via `claudeCode()`) to OpenCode Go (via `opencode()`). ADR-008's architecture is otherwise unchanged; this ADR supersedes only the provider and model sections.

### Agent provider

Replace `claudeCode(model)` with `opencode(model)` in `.sandcastle/run.ts` and `.sandcastle/address-review.ts`. Sandcastle's `opencode()` provider builds the command `opencode run --model <model> <prompt>` and lets the CLI handle auth, endpoint resolution, and streaming.

### Models

| Role       | Model          | Go model ID                  |
| ---------- | -------------- | ---------------------------- |
| Default    | Kimi K2.7 Code | `opencode-go/kimi-k2.7-code` |
| Escalation | Qwen3.7 Max    | `opencode-go/qwen3.7-max`    |

- **Kimi K2.7 Code** is the default, replacing Sonnet 4.6. It is purpose-built for coding agent work (tool calling, multi-file edits) and offers ~9,250 requests/month within the Go plan — roughly 2x the budget GLM-5.2 would allow.
- **Qwen3.7 Max** is the escalation tier, replacing Opus 4.7. It is the most capable model in the Go roster; opt-in is per-run via the `agent:escalate` label (renamed from `agent:use-opus`).
- **Auto-escalation remains rejected** — a failing PRD fails on both tiers. Manual opt-in keeps the cost intentional. This rationale from ADR-008 carries over unchanged.

### Escalation label

Rename `agent:use-opus` to `agent:escalate`. The new name is provider-agnostic: if the escalation model changes in the future (Qwen → another), the label stays valid. The model identity is an implementation detail in `.sandcastle/shared.ts`, not a label decision.

### Authentication in CI

Replace the `ANTHROPIC_API_KEY` secret with `OPENCODE_GO_API_KEY`. The workflow writes `~/.local/share/opencode/auth.json` before the agent step:

```json
{ "opencode-go": { "type": "api", "key": "<secret>" } }
```

The `opencode` CLI reads this file natively — no browser, no `/connect` interactive flow. The step "Install Claude Code CLI" (`npm install -g @anthropic-ai/claude-code`) is replaced by "Install OpenCode CLI" (`npm install -g opencode-ai`).

### Cost tracking

Remove per-run dollar cost estimation. ADR-008's `logCost()` computed a dollar estimate from per-iteration token counts and hardcoded Anthropic rates. With Go's flat $10/month subscription, per-token cost is not financially meaningful — the budget is the Go plan's $60/month usage ceiling, monitored via the OpenCode dashboard, not per-run.

Replace `logCost()` with `logUsage()`, which logs the model and iteration count per run. Iteration count is the actionable metric: an issue that consumes 5 iterations vs 1 signals scoping quality, not cost.

### What stays from ADR-008

- Sandcastle as the execution engine (`@ai-hero/sandcastle`)
- `noSandbox()` on GitHub-hosted runners
- Label-triggered workflow (`agent:ready` → `agent:running` → `agent:success` / `agent:partial` / `agent:failed`)
- `vata-agent` GitHub App for PR authorship (not `GITHUB_TOKEN`, not a PAT)
- `pnpm verify` as the quality gate, run between iterations and post-run
- `maxIterations: 5`, `idleTimeoutSeconds: 600`, `timeout-minutes: 45`
- PR creation by the workflow with `Closes #N` in the body
- ADR-009's review-feedback flow (`agent-address-review.yml`) inherits the same changes

### Iteration and completion semantics

Sandcastle's `opencode()` provider does not parse the agent's streaming output (`parseStreamLine` returns `[]`). This affects two concerns, both resolved without code changes to sandcastle:

- **Iteration counting** is process-level in sandcastle's Orchestrator — a `for` loop that invokes the agent process N times. It does not depend on stream parsing. `maxIterations: 5` works identically with `opencode()`.
- **Completion signal** is detected by string-matching the agent's stdout (`agentOutput.includes(signal)`). The `<promise>COMPLETE</promise>` marker in the prompt template is written to stdout by the agent, and sandcastle finds it. No stream parsing required.

What is lost: live streaming display (cosmetic) and per-iteration token usage (cosmetic, since Go is flat-rate). Neither affects the run's outcome or the maintainer's visibility into it.

## Why

- **Budget sustainability.** $10/month for $60 of execution value replaces a variable Anthropic spend that was capped at $100/month but unpredictable per run. The Go plan's ceiling is hard and known.
- **Leverages an existing subscription.** The maintainer already pays for OpenCode Go for local work. Routing CI execution through the same plan consolidates spend.
- **Preserves the architecture.** Every architectural decision from ADR-008 — label lifecycle, sandbox choice, quality gate, App-authored PRs, iteration caps — is provider-orthogonal. Only the provider and models change.
- **Kimi K2.7 Code is a credible Sonnet substitute.** It is designed for coding agent workloads and benefits from the Go plan's higher request budget at lower per-token cost.
- **Iteration and completion semantics survive.** Sandcastle's loop is process-level; the completion signal is string-based. The `opencode()` provider loses only cosmetic features.

## Alternatives Considered

- **`claudeCode()` with baseURL override to Go's Anthropic-compatible endpoint** — rejected: limits the model choice to the 6 Go models that expose an Anthropic-compatible endpoint (MiniMax M3, Qwen3.7 Max/Plus), excluding GLM, Kimi, and DeepSeek. Also requires hacking the Anthropic SDK configuration in the runner, adding fragility for no gain.
- **Keep Anthropic API, reduce spend** — rejected: the spend limit was already at $100/month; lowering it further would throttle useful runs. The underlying issue is variable cost, not the limit level.
- **Local execution via `opencode` instead of CI** — rejected for the same reason ADR-008 rejected local-first: the value proposition is the agent works while the maintainer does something else. Local execution serializes attention.
- **Multiple escalation labels (`agent:use-glm`, `agent:use-kimi`, etc.)** — rejected: one default + one escalation is sufficient for a solo project. A label matrix adds cognitive overhead without value.
- **Revert to manual execution** — rejected: the automation pre-filter (lint + build + test green before review) remains valuable regardless of provider.

## Consequences

**Positive**:

- Variable Anthropic spend eliminated; execution cost is a known $10/month.
- Single subscription covers both local planning (Claude Pro/Max) and CI execution (OpenCode Go).
- Kimi K2.7 Code's higher request budget (~9,250/month vs Sonnet's pay-per-token) gives more headroom for iteration-heavy tasks.
- The `agent:escalate` label is provider-agnostic, surviving future model changes.

**Negative / Trade-offs**:

- **Quality risk.** Kimi K2.7 Code is not a drop-in replacement for Sonnet 4.6 in all cases. PRD scoping quality becomes more important — a tight PRD compensates for model capability gaps. The escalation tier (Qwen3.7 Max) is the safety valve, at ~2x the per-token cost.
- **No per-run cost attribution.** With Anthropic, each run's dollar cost was logged. With Go's flat rate, per-run financial attribution is lost — only iteration count is logged. The Go dashboard provides aggregate usage, not per-issue.
- **Streaming display is flat.** The `opencode()` provider does not parse streaming events, so sandcastle's live iteration display is less detailed. The run still completes and signals correctly; this is cosmetic.
- **Dependency on OpenCode Go availability.** The Go plan is operated by OpenCode (Anomaly). An outage or plan change affects CI execution. Mitigation: the `agent:escalate` label and `shared.ts` constants make switching models or providers a one-file change.

## References

- [ADR-008: Autonomous Agent Execution via Sandcastle on GitHub Actions](./0008-autonomous-agent-execution.md) — the foundation this migrates
- [ADR-009: Agent Addresses PR Review Feedback](./0009-agent-review-feedback.md) — inherits the same migration
- [OpenCode Go documentation](https://opencode.ai/docs/go/) — models, limits, endpoints
- [`@ai-hero/sandcastle`](https://github.com/mattpocock/sandcastle) — `opencode()` and `claudeCode()` agent providers
