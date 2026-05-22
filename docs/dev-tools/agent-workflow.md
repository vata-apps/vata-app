# Agent Workflow

Operational guide for the autonomous-execution workflow. For the design rationale, label schema, cost bounds, and trade-offs, read [ADR-008](../adr/0008-autonomous-agent-execution.md) first — this page does not restate them.

## When to use it

Use the agent flow when **all** of these are true:

- The PRD is locked — scope, acceptance criteria, file paths, anti-scope are explicit
- The change is at least one of: multi-file, repetitive, mechanical, or boring
- You can verify the result by reading the PR + a brief manual UI check (no novel UX decisions left to make)

Do **not** use it for:

- Exploratory work where the design is still moving
- Any change that needs you to feel the UX in `pnpm tauri:dev` while iterating
- Quick one-line fixes — faster to do yourself than label-and-wait

## Labels at a glance

Full schema and transition rules are in [ADR-008 → Label-based outcome tracking](../adr/0008-autonomous-agent-execution.md#label-based-outcome-tracking). Day-to-day usage:

- You add **`agent:ready`** to trigger a run.
- Optionally add **`agent:use-opus`** alongside to escalate to Opus 4.7 for this run.
- The workflow swaps labels to reflect outcome: **`agent:running`** → **`agent:success`** / **`agent:partial`** / **`agent:failed`**.

## End-to-end flow

```
[you write PRD with Opus]
        │
        ▼
[you label agent:ready (+ agent:use-opus if needed)]
        │
        ▼  (GitHub Actions: issues.labeled)
[workflow runs sandcastle; agent iterates with `pnpm verify` as quality gate]
        │
        ├─ success → PR opened, label agent:success
        ├─ partial → PR opened as draft, label agent:partial
        └─ failed  → no PR, comment on issue with log excerpt, label agent:failed
        │
        ▼
[you review the PR, manually verify UI in pnpm tauri:dev, merge]
```

## Retrying after a failure or partial

1. Open the issue. Read the comment the workflow posted.
2. Decide:
   - **Bad PRD** — edit the issue body to clarify scope, acceptance criteria, or anti-scope. Save.
   - **Sonnet too weak for this task** — add `agent:use-opus`.
   - **Both** — do both.
3. Remove the previous outcome label (`agent:failed` / `agent:partial`).
4. Add `agent:ready`. The workflow re-runs.

The workflow does not auto-retry. Every run is intentional and paid for.

## What stays manual

- Writing the PRD (Opus / `to-prd` / `grill-with-docs`)
- Setting the initial label `agent:ready`
- Reviewing the PR — code _and_ UI in `pnpm tauri:dev`
- Merging
- Amending the PRD on retry

The workflow's job is the boring middle: read, execute, check, package as a PR. Your job is the ends.

## Setup checklist (one-time)

1. Create the 6 labels in the repo:

   ```bash
   gh label create "agent:ready"     --color "0E8A16" --description "PRD ready, agent will pick up"
   gh label create "agent:running"   --color "FBCA04" --description "Agent currently running in CI"
   gh label create "agent:success"   --color "0E8A16" --description "Agent succeeded, PR opened"
   gh label create "agent:partial"   --color "D93F0B" --description "Agent ran out of iterations but CI green — review needed"
   gh label create "agent:failed"    --color "B60205" --description "Agent failed, see issue comment for details"
   gh label create "agent:use-opus"  --color "5319E7" --description "Use Opus 4.7 instead of Sonnet for this run"
   ```

2. Create a dedicated Anthropic API key (`vata-sandcastle-prod`) with a $100/month spend limit in the Anthropic Console. Store as repo secret `ANTHROPIC_API_KEY`.
3. Create a fine-grained PAT scoped to this repo with **Contents: Read and write**, **Pull requests: Read and write**, **Issues: Read and write**. Store as repo secret `AGENT_GH_TOKEN`. The workflow uses it instead of `GITHUB_TOKEN` so the agent's PR triggers `ci.yml`.
4. Enable **Allow GitHub Actions to create and approve pull requests** at the org level (`github.com/organizations/vata-apps/settings/actions`) — a repo-level toggle cannot override an org that disallows it.
5. Confirm `.sandcastle/main.ts` and `.sandcastle/prompts/default.md` are present (scaffolded during installation).
6. Confirm `.github/workflows/agent-run.yml` is present (added during configuration).
7. Dry-test on a small `Task`-type issue (rename, doc fix) before pointing it at anything substantive.

## Limits and known issues

- **No UI verification in CI.** A green pipeline does not mean the feature works visually. Manual QA in `pnpm tauri:dev` is non-optional.
- **Out-of-scope edits.** The agent may touch files outside the PRD's scope. Review the diff for unexpected churn before merging.
- **Stuck `agent:running`.** If a job dies without cleanup (rare), the label may stay on. Remove it manually and re-label `agent:ready` to restart.
- **Vendor lock on `@ai-hero/sandcastle`.** A future major version could require migrating `.sandcastle/main.ts`. Pin the version in `package.json` until a deliberate upgrade.
