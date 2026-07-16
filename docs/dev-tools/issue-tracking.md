# Issue Tracking

Single backlog for everything — bugs, ideas, tasks. GitHub Issues + one org-level GH Project ("Vata Roadmap"), with zero external service to keep authenticated.

## Issue Types

Three Issue Types are defined at the `vata-apps` org level. Each issue has exactly one.

| Type        | When to use                                                                         |
| ----------- | ----------------------------------------------------------------------------------- |
| **Bug**     | An unexpected problem or behavior — something is broken or wrong                    |
| **Feature** | A new capability, improvement, or insight — anything that's not a defect or a task  |
| **Task**    | A concrete piece of dev work with a clear deliverable (refactor, dep bump, cleanup) |

Issue forms in `.github/ISSUE_TEMPLATE/` preset the type for web-UI submissions; blank issues are disabled.

## Labels

Labels are **product-shaped**, not codebase-shaped. Each names a user-facing concept (an entity, a workflow, a product surface) so triage stays useful as the codebase moves around. Issue Type, Priority, and Status are not labels — they live on the issue or the Project.

| Label              | Group         | Meaning                                                               |
| ------------------ | ------------- | --------------------------------------------------------------------- |
| `individuals`      | data          | People, names, lifespan formatting                                    |
| `families`         | data          | Spouse / parent / child links, pedigree                               |
| `events`           | data          | Life events, dates, witnesses                                         |
| `places`           | data          | Geography, place hierarchy, external place lookup                     |
| `sources`          | data          | Sources, citations, evidence linking, repositories                    |
| `media`            | data          | Photos, scans, documents, image attachments and editing               |
| `gedcom`           | data          | GEDCOM 5.5.1 import / export, interoperability                        |
| `data-quality`     | cross-cutting | Completion tracking, duplicate detection, validation                  |
| `tree-management`  | platform      | Creating / opening / importing trees, storage location                |
| `design-system`    | platform      | Tokens, `ui/` primitives, Base UI + Vanilla Extract                   |
| `infra`            | platform      | CI, scripts, tooling, repo config — non-app changes                   |
| `monetization`     | platform      | Paid-tier ideas; Vata is open source and free, these are aspirational |
| `good-first-issue` | meta          | Good for newcomers / small surface                                    |

An issue can have **0–2 product labels** plus optional meta labels. Combine two only when the issue is genuinely about the intersection (e.g. "tag people on photos" → `media` + `individuals`). Add a new label only when a recurring product surface emerges that none cover — don't multiply speculatively.

## Status pipeline

The Project's built-in **Status** field has a 4-stage pipeline:

- **Icebox** — vague ideas captured for "maybe someday". Not committed to.
- **Todo** — queued work for the near future.
- **In Progress** — actively being worked on.
- **Done** — closed or merged.

The transition from `Icebox` → `Todo` is the explicit promotion moment ("yes, I'm going to do this"). New issues auto-add to the Project; built-in workflows move them to **In Progress** when a linked PR opens and **Done** when it merges or the issue closes.

## Skills

Two Claude Code skills automate the workflow — see their skill files for trigger phrases and behavior:

- **`capture-idea`** — files an idea as an issue, picks 0–2 labels, sets the type, and pins Status to **Icebox**. **Batch captures**: when a session produces multiple ideas at once, invoke the skill once per item — never batch via a direct `gh issue create` loop, which bypasses the type and Icebox mutations.
- **`link-task`** — at the start of a dev task, binds the branch to an existing open issue so the PR auto-closes it on merge. It does not create issues; use `capture-idea` first if none exists. **Habit rule**: for every `feat/` or `fix/` branch, run `link-task` explicitly before writing any code — don't rely on trigger phrases alone. If Phase B detects a `feat/`/`fix/` branch with no stored link, it emits a soft warning before proceeding.
