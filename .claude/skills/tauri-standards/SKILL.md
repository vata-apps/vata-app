---
name: tauri-standards
description: Ensures Tauri v2 and Rust code follows project conventions. Use when writing or reviewing src-tauri/**/*.rs, tauri.conf.json, or src-tauri/capabilities/*.json.
---

# Tauri v2 & Rust Standards

Apply this skill when writing or reviewing any Tauri or Rust code. The app uses Tauri with a thin Rust backend — most logic lives in the TypeScript layer.

## Where to Find Current Plugins

Check these files for the canonical source of truth:

- **Registered plugins**: `src-tauri/src/lib.rs` — shows which plugins are loaded
- **Plugin capabilities**: `src-tauri/capabilities/*.json` — shows which permissions are granted
- **Plugin npm packages**: `package.json` — search for `@tauri-apps/plugin-*`

## When to Apply

- Writing or reviewing `src-tauri/src/**/*.rs`
- Editing `src-tauri/tauri.conf.json`
- Editing `src-tauri/capabilities/*.json`

---

## 1. Architecture Principle

The Rust backend is **intentionally thin**. It serves as a bridge for native capabilities only. Business logic belongs in the TypeScript layer (`src/`), not in Rust.

---

## 2. Tauri v2 Capabilities

Capabilities are defined in `src-tauri/capabilities/`. Each capability file grants specific permissions to specific windows or URLs.

- **Principle of least privilege**: Only grant the permissions actually needed.
- **Format**: JSON files in `src-tauri/capabilities/`. Each file has `identifier`, `windows`, and `permissions` fields.
- **Scoping**: Use `allow-*` permissions for specific operations, not blanket `allow-all`.

```json
// ✅ GOOD — scoped permissions
{
  "identifier": "main-window",
  "windows": ["main"],
  "permissions": [
    "sql:allow-execute",
    "sql:allow-select",
    "fs:allow-read-text-file",
    "dialog:allow-open"
  ]
}
```

---

## 3. Tauri Plugins

Plugins are registered in `src-tauri/src/lib.rs` and permissions defined in capabilities files.

- **Principle**: Use plugins from TypeScript rather than reimplementing native logic in Rust
- **Adding a plugin**: Register in `lib.rs` + add capability permissions + add npm package to `package.json`
- **TypeScript imports**: Use `@tauri-apps/plugin-{name}` packages (check `package.json` for current list)

---

## 4. Tauri Commands

If a new Rust command is needed:

```rust
// ✅ GOOD — returns Result for proper error propagation to TypeScript
#[tauri::command]
async fn my_command(arg: String) -> Result<String, String> {
    // Delegate to a helper, do not put business logic here
    my_helper(arg).map_err(|e| e.to_string())
}
```

- **Return `Result<T, String>`**: Tauri serializes the error to JavaScript as a rejected Promise.
- **Keep commands small**: Delegate to helper functions; no inline business logic.
- **Register in `lib.rs`**: Add to `.invoke_handler(tauri::generate_handler![...])`.

---

## 5. Error Handling

- In Rust: use the `?` operator and propagate errors. Map to `String` at the Tauri command boundary.
- In TypeScript: `invoke()` returns a Promise that rejects with the Rust error string. Always wrap in `try/catch` or `.catch()`.

```typescript
// ✅ GOOD
try {
  const result = await invoke<string>('my_command', { arg: 'value' });
} catch (err) {
  console.error('Command failed:', err);
}
```

---

## 6. Cargo.toml

- Keep dependencies minimal.
- Pin versions with `=` only when necessary for security; otherwise use `^` for patch flexibility.
- Run `cargo check` before committing any Rust changes.
- Run `cargo clippy` to catch common Rust anti-patterns.
