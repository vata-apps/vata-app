---
name: testing-standards
description: What and why to test in vata-app — the test-by-layer policy, the behavior-not-implementation rule, and what to leave untested. Use when writing or reviewing a *.{test,spec}.{ts,tsx} or Rust test, or planning a feature's test coverage.
---

# Testing Standards

This skill says **what to test and why** — not how to write a test.

## Why

A test earns its place by catching a real regression. There are **no coverage thresholds**: 20 tests that catch bugs beat 100 that break on every refactor.

Test **observable behavior, not implementation**. The check: if the implementation is rewritten but the behavior is unchanged, the test must still pass. Asserting on SQL strings, mock call counts, CSS classes, `data-testid`, or rendered HTML fails that check — it tests the wrong thing.

## TDD

Tests are written **before** the implementation and committed with it (red → green). The `test-writer` agent writes the red tests.

## What to test, per layer

| Layer               | What to test                                                                          | Approach                                                         |
| ------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `src/db/**`         | Every public CRUD function — input/output behavior                                    | Integration test against real in-memory SQLite, never mocked SQL |
| `src/managers/**`   | Orchestration and end-to-end workflows                                                | Integration test, in-memory SQLite                               |
| `src/components/**` | **Application organism** behavior — interactions, conditional rendering, error states | Vitest + React Testing Library (jsdom)                           |
| `src/hooks/**`      | Data flow and state transitions                                                       | Vitest + RTL                                                     |
| `src/lib/**`        | Pure logic, edge cases, round-trips                                                   | Unit test, no mocks                                              |
| `src-tauri/src/**`  | Non-trivial command logic, data mapping, Rust-owned DB queries                        | Rust `#[cfg(test)]`, in-memory SQLite via `rusqlite`             |

Co-locate every test with its source. `describe` names the feature; `it` states what the caller observes in plain English (no "should", English only).

## What NOT to test

- **Raw Radix Themes components** — owned and tested upstream. Test only the organisms that compose them.
- Auto-generated files (`routeTree.gen.ts`).
- Trivial wrappers with no logic.
- Internal SQL string structure — assert the data returned, not the query.
- Pure identity (e.g. a `query-keys` test whose assertion is `x === x`).

## Correctness invariant

In-memory test databases do **not** inherit PRAGMAs. Every test DB must run `PRAGMA foreign_keys = ON` before the schema, or constraint violations silently pass in tests and fail in production.

## E2E

Deferred until the app has stable, non-trivial IPC flows worth protecting (`tauri-driver` + WebdriverIO).
