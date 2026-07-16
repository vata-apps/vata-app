# ADR-001: Desktop Framework — Tauri over Electron

**Status**: Accepted
**Date**: 2025-02-22

**Decision**: Use **Tauri 2.0** — native OS WebView + Rust backend — instead of bundling Chromium.

**Why**: Vata is local-first with no network features, so bundle size, RAM, and startup time matter more than browser compatibility. Tauri: ~3–10 MB bundle, ~30–50 MB RAM, <1s startup, stricter sandbox — vs Electron's ~150+ MB, ~100–300 MB RAM, 2–5s startup.

**Alternatives considered**:

- **Electron** — proven ecosystem, but heavier bundle/RAM/startup and a more permissive security model.

## References

- [Tech Stack](../architecture/tech-stack.md)
