---
name: code-review-baseline
description: Generic correctness, security, and cross-cutting checks for the vata-app PR reviewer. Used by the always-firing `generalist` reviewer as the safety-net pass over every file in the diff. Defers domain-specific findings to the specialized reviewers (frontend, db, gedcom, tauri, design-system, backend-rust).
---

# Code Review — Baseline Pass

This skill is loaded by the **`generalist` reviewer**, which fires on every PR regardless of which files changed. Its job is to catch correctness, security, and cross-cutting concerns that the specialized reviewers might miss — particularly on infrastructure / config / docs PRs that don't trigger any domain reviewer.

## Defer-to-domain rule (critical)

If a finding is clearly within a specialized reviewer's domain, **flag it with a generic ruleId and a brief body** — the orchestrator will dedupe with the specialized reviewer's more specific finding (and prefer the specialized one). Do not skip the finding entirely (the specialized reviewer might miss it), but do not try to out-detail the specialist.

| Domain                            | Defers to           |
| --------------------------------- | ------------------- |
| SQL / database / migrations       | `db` reviewer       |
| GEDCOM tags, XREFs, import/export | `gedcom` reviewer   |
| Rust code in `src-tauri/src/**`   | `backend-rust`      |
| Tauri config + capabilities       | `tauri` reviewer    |
| React + TypeScript conventions    | `frontend` reviewer |
| UI wrappers under `components/ui` | `design-system`     |
| Storybook stories                 | `design-system`     |

## What to check

### Bugs and correctness

- Off-by-one in loops, slices, indexing
- Null / undefined deref where the value is plausibly absent
- Race conditions in async code (unawaited promises, parallel mutations of shared state, missing locks)
- Unhandled promise rejection (top-level `.then()` without `.catch()`, fire-and-forget `await` missing)
- Missing `await` on async calls whose return value is used or whose ordering matters
- Off-spec behavior changes — public API contract change with no callers updated
- Resource leaks: unclosed file handles, unsubscribed listeners, intervals not cleared

### Security basics

- Secrets in code: hardcoded API keys, tokens, credentials (even commented out)
- Unvalidated input crossing trust boundaries (HTTP request body, CLI args, file paths from user, env vars)
- Injection vectors: SQL string concatenation, shell command interpolation, HTML/template injection
- Authn/authz checks missing on a privileged path
- Path traversal: user-controlled string fed into `path.join` without normalization
- Logging of secrets or PII

### Cross-cutting project rules (from CLAUDE.md)

- **English only**: code, comments, docs, commit messages, branch names, PR titles. French only allowed in chat with the user. Flag any French in committed artifacts.
- **No `SELECT *`**: any SQL must list columns explicitly. (Also covered by `db` reviewer — flag anyway, the orchestrator handles dedup.)
- **i18n for user-facing strings**: any string shipped in the desktop app UI must use `useTranslation()` from `react-i18next`. Hardcoded English strings in `src/components/**` or `src/pages/**` (excluding `*.stories.tsx`, `*.test.{ts,tsx}`, dev-only debug UI guarded by `import.meta.env.DEV`) are violations. (Also covered by `frontend` reviewer — flag anyway.)
- **Granular commits hint**: if the diff bundles obviously unrelated concerns into one commit (e.g. unrelated bug fix + new feature + dep upgrade), flag with severity `low` and ruleId `baseline-mixed-commit`. One concern per commit.

### Documentation gaps when behavior changed

- Public API or schema changed but `docs/` not updated
- New env var introduced but not in README / CLAUDE.md
- Command added/removed in `package.json scripts` not reflected in CLAUDE.md commands section

## Hard rules (mirror the reviewer.md system prompt)

- **Stay inside the diff.** Line numbers must be lines that appear in the diff.
- **Cap: 10 inline comments per file.** Prioritize critical/high.
- **Comment body ≤ 500 chars.** Cite the ruleId, don't quote rules verbatim.
- **ruleId prefix `baseline-`** for all generalist findings (e.g. `baseline-unawaited-promise`, `baseline-secret-in-code`, `baseline-french-in-code`, `baseline-missing-i18n`).
- **One concern per comment.** Two issues on one line → two comments.
- **Severity ladder** (same as the system prompt):
  - `critical` — data loss, security, or correctness bug that will manifest in production
  - `high` — direct violation of a documented project rule (English-only, SELECT \*, i18n)
  - `medium` — maintainability / performance concern
  - `low` — minor inefficiency or missing guard
  - `nit` — style or naming polish; deferrable

## What you must NOT do

- Do not flag style preferences (`nit` ladder is generous; use it for "could be cleaner" not "different from how I'd write it")
- Do not propose architectural rewrites
- Do not suggest "consider adding X" unless X is a concrete bug fix or security gap
- Do not reproduce the specialized reviewers' deep checks (e.g. don't enumerate all SQLite PRAGMA rules — `db` reviewer handles that)
- Do not flag missing tests on infrastructure / scripts / config changes (testing-standards covers when tests are required)
