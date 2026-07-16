---
name: testing-standards
description: Vata's minimal-tests-by-default policy — when a test is actually worth writing, and the behavior-not-implementation rule for the rare cases that qualify. Use when writing or reviewing a *.{test,spec}.{ts,tsx} or Rust test, or deciding whether a change needs a test at all.
---

# Testing Standards

## Default: no tests

Most changes ship with **zero new tests**. Writing tests for their own sake burns a disproportionate amount of tokens and context relative to the value they add here. Do not write a test unless one of these applies:

- The user explicitly asks for tests.
- A subagent's own checklist requires one (e.g. `test-writer` was invoked on purpose).
- It is genuinely the fastest way to pin down a real, non-obvious regression — and even then, prefer one narrow test over a suite.

When in doubt, don't write it. Manual verification (reading the code, running the app, using the Tauri MCP tools) is the default way to confirm a change works — see the `verify` skill.

## If a test is written

Test **observable behavior, not implementation**. The check: if the implementation is rewritten but the behavior is unchanged, the test must still pass. Asserting on SQL strings, CSS classes, `data-testid`, or rendered HTML fails that check.

Co-locate with the source. `describe` names the feature; `it` states what the caller observes in plain English (no "should", English only).

| Layer               | Approach                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/db/**`         | Integration test via `createInMemoryDb` / `createTreeInMemoryDb` (`$/test/sqlite-memory`), never mocked SQL |
| `src/managers/**`   | Integration test, in-memory SQLite                                                                          |
| `src/components/**` | Vitest + React Testing Library (jsdom)                                                                      |
| `src/hooks/**`      | Vitest + RTL; mock the DB-access boundary and assert the hook calls it correctly                            |
| `src/lib/**`        | Unit test, no mocks                                                                                         |
| `src-tauri/src/**`  | Rust `#[cfg(test)]` unit test — rare, the backend is thin                                                   |

Test DBs must enforce foreign keys, or constraint violations silently pass in tests and fail in production. Go through `createInMemoryDb` / `createTreeInMemoryDb` (`src/test/sqlite-memory.ts`), which apply `PRAGMA foreign_keys = ON` — never instantiate a raw in-memory DB yourself.

## What NOT to test

- **Raw Radix Themes / Base UI components** — owned and tested upstream.
- Auto-generated files (`routeTree.gen.ts`).
- Trivial wrappers with no logic.
- Internal SQL string structure — assert the data returned, not the query.
- Pure identity (e.g. a `query-keys` test whose assertion is `x === x`).
- Anything already covered by manual verification — don't duplicate it as a test just for the sake of having one.

## E2E

Deferred until the app has stable, non-trivial IPC flows worth protecting (`tauri-driver` + WebdriverIO).
