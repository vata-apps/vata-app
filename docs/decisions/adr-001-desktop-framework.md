# ADR-001: Desktop Framework — Tauri over Electron

**Status**: Accepted  
**Date**: 2025-02-22

## Context

Vata is a desktop application with a web-based UI (React). Two mature frameworks exist for this pattern: Electron (bundles Chromium) and Tauri (uses the OS native WebView with a Rust backend).

The application is local-first with no network features, so performance, bundle size, and resource usage matter more than browser compatibility.

## Decision

Use **Tauri 2.0** as the desktop framework.

## Alternatives Considered

- **Electron**: Proven ecosystem but bundles Chromium (~150+ MB), uses significantly more RAM (~100–300 MB), and has slower startup. The more permissive security model is a downside for a local-data application.

## Consequences

**Positive**:
- Bundle size ~3–10 MB (vs 150+ MB for Electron)
- RAM usage ~30–50 MB (vs 100–300 MB)
- Startup < 1s (vs 2–5s)
- Strict sandbox and permission system improves security
- Rust backend enables future performance-critical features

**Negative / Trade-offs**:
- Smaller ecosystem and community than Electron
- WebView rendering may differ slightly across platforms (WebKit vs WebView2)
- Rust knowledge required for backend plugin development

## References

- [Tech Stack — Tauri 2.0](../architecture/tech-stack.md#tauri-20)
