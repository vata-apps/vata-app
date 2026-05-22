# Agent Workflow

Operational guide for the autonomous-execution workflows. For the design rationale, label schema, cost bounds, and trade-offs, read [ADR-008](../adr/0008-autonomous-agent-execution.md) (issue → PR) and [ADR-009](../adr/0009-agent-review-feedback.md) (addressing review feedback) first — this page does not restate them.

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

## Addressing review feedback

When the agent's PR is close but needs adjustments, you don't have to hand-edit or re-run from scratch. Submit a **"Request changes"** review and the agent addresses your feedback on the same branch.

How it works:

1. Review the agent's PR — leave line comments, write a review summary.
2. Submit the review as **Request changes** (not "Comment", not "Approve").
3. `agent-address-review.yml` fires. The agent gets your review body, your line comments, and the original issue, then works on the PR's branch.
4. It pushes new commits and reports back:
   - **Per-thread replies** — every line comment gets `Addressed in <sha> — …` or `Not addressed — <reason>`.
   - **A summary comment** — the overall verdict plus the review-body feedback.
5. Re-review. Resolve the threads you're satisfied with yourself — the agent never auto-resolves.

Notes:

- Only **"Request changes"** triggers it. "Comment" reviews are discussion only — use them to leave notes without dispatching the agent. "Approve" does nothing (the PR is ready).
- An empty "Request changes" review (no body, no line comments) is treated as a misclick — the workflow posts a comment and runs nothing.
- The model follows the original issue: if the issue carries `agent:use-opus`, the review run uses Opus too.
- A review the agent disagrees with entirely is a valid outcome — it makes no commits and explains each skip in the thread replies.
- Each review run spends tokens, like an issue run. The monthly spend limit covers both.

## What stays manual

- Writing the PRD (Opus / `to-prd` / `grill-with-docs`)
- Setting the initial label `agent:ready`
- Reviewing the PR — code _and_ UI in `pnpm tauri:dev`
- Resolving review threads after the agent addresses them
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
3. Create a GitHub App (`vata-agent`) on the org with **Contents: Read and write**, **Pull requests: Read and write**, **Issues: Read and write** (webhook disabled). Install it on this repo. The workflow mints a token from it instead of `GITHUB_TOKEN` so the agent's PR triggers `ci.yml`, and instead of a PAT so all activity is attributed to `vata-agent[bot]` rather than a person. Store as repo secrets:
   - `AGENT_APP_CLIENT_ID` — the App's Client ID (App settings → General → About)
   - `AGENT_APP_PRIVATE_KEY` — the full contents of the App's generated `.pem` private key
4. Confirm `.sandcastle/run.ts` and `.sandcastle/prompts/default.md` are present (scaffolded during installation).
5. Confirm `.github/workflows/agent-run.yml` is present (added during configuration).
6. Dry-test on a small `Task`-type issue (rename, doc fix) before pointing it at anything substantive.

## Limits and known issues

- **No UI verification in CI.** A green pipeline does not mean the feature works visually. Manual QA in `pnpm tauri:dev` is non-optional.
- **Out-of-scope edits.** The agent may touch files outside the PRD's scope. Review the diff for unexpected churn before merging.
- **Stuck `agent:running`.** If a job dies without cleanup (rare), the label may stay on. Remove it manually and re-label `agent:ready` to restart.
- **Vendor lock on `@ai-hero/sandcastle`.** A future major version could require migrating the `.sandcastle/` scripts. Pin the version in `package.json` until a deliberate upgrade.
- **`agent:ready` vs an in-flight review run.** Re-labelling an issue `agent:ready` while a review run is addressing its PR can discard that work — re-labelling means "start over from scratch". Don't do both at once.
