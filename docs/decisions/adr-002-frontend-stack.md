# ADR-002: Frontend Stack — React, TypeScript, Vite, TanStack, Zustand

**Status**: Accepted  
**Date**: 2025-02-22

## Context

The frontend needs a modern, type-safe UI framework with efficient state management. The app reads/writes to a local SQLite database, so "server state" is actually database state that benefits from caching and invalidation.

## Decision

Use **React 18 + TypeScript 5** with **Vite** as bundler, **TanStack Query** for database state (cache + invalidation), **TanStack Router** for type-safe routing, and **Zustand** for lightweight client state (current tree, preferences).

## Alternatives Considered

- **Vue / Svelte**: Viable but React has the largest ecosystem and best Tauri compatibility documentation.
- **Redux / MobX**: Heavier state management solutions. Zustand covers our needs with minimal boilerplate.
- **React Router**: Lacks type-safe params. TanStack Router provides end-to-end type safety.
- **Webpack**: Slower builds. Vite provides instant startup and fast HMR.

## Consequences

**Positive**:
- Type safety end-to-end (TypeScript + TanStack Router typed params)
- Intelligent caching for database reads (TanStack Query)
- Fast development experience (Vite HMR)
- Minimal boilerplate for global state (Zustand)

**Negative / Trade-offs**:
- TanStack Router is newer and has a smaller community than React Router
- Multiple TanStack dependencies to keep in sync

## References

- [Tech Stack — React 18](../architecture/tech-stack.md#react-18)
- [Tech Stack — TanStack Query 5](../architecture/tech-stack.md#tanstack-query-5)
- [Tech Stack — TanStack Router](../architecture/tech-stack.md#tanstack-router)
- [Tech Stack — Zustand 4](../architecture/tech-stack.md#zustand-4)
