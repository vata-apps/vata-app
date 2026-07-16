# ADR-002: Frontend Stack — React, TypeScript, Vite, TanStack, Zustand

**Status**: Accepted
**Date**: 2025-02-22

**Decision**: **React 18 + TypeScript 5** on **Vite**. **TanStack Query** for DB-backed state (cache + invalidation). **TanStack Router** for type-safe, file-based routing. **Zustand** for lightweight client state (current tree, preferences).

**Alternatives considered**:

- **Vue / Svelte** — viable, but React has the larger ecosystem and better Tauri documentation.
- **Redux / MobX** — heavier than Zustand for our needs.
- **React Router** — lacks TanStack Router's end-to-end type-safe params.
- **Webpack** — slower builds/HMR than Vite.

## References

- [Tech Stack](../architecture/tech-stack.md)
