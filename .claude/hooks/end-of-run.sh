#!/bin/bash
# Stop hook: batch quality checks at the END of a run (not per-edit).
# Formats changed files with Prettier, then lints (ESLint) and type-checks (tsc);
# runs cargo check only when Rust changed. Running these once here — instead of on
# every Edit/Write — keeps editing fast.

INPUT=$(cat)
STOP_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')

PROJECT_DIR="$CLAUDE_PROJECT_DIR"
cd "$PROJECT_DIR" || exit 0

# Files changed in the working tree (tracked vs HEAD + untracked), repo-relative.
CHANGED=$( { git diff --name-only HEAD 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null; } | sort -u )
[ -z "$CHANGED" ] && exit 0

FMT_FILES=()
TS_FILES=()
RS_CHANGED=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  [ -f "$f" ] || continue                       # skip deletions
  case "$f" in
    */node_modules/*|*.gen.ts|*.gen.tsx|*.gen.js) continue ;;
  esac
  case "$f" in
    *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md) FMT_FILES+=("$f") ;;
  esac
  case "$f" in
    *.ts|*.tsx) TS_FILES+=("$f") ;;
  esac
  case "$f" in
    *.rs|*/tauri.conf.json) RS_CHANGED=1 ;;
  esac
done <<< "$CHANGED"

# 1) Format (silent, mutates files).
if [ ${#FMT_FILES[@]} -gt 0 ]; then
  npx prettier --write "${FMT_FILES[@]}" >/dev/null 2>&1
fi

REPORT=""

# 2) Lint the changed TS/TSX, then type-check the whole project.
if [ ${#TS_FILES[@]} -gt 0 ]; then
  LINT=$(pnpm eslint "${TS_FILES[@]}" --max-warnings 0 2>&1)
  [ $? -ne 0 ] && REPORT="${REPORT}ESLint errors:\n${LINT}\n\n"

  TSC=$(pnpm tsc --noEmit 2>&1)
  [ $? -ne 0 ] && REPORT="${REPORT}TypeScript errors:\n${TSC}\n\n"
fi

# 4) Rust compile check only when Rust changed.
if [ $RS_CHANGED -eq 1 ] && [ -d "$PROJECT_DIR/src-tauri" ]; then
  CARGO=$( ( cd "$PROJECT_DIR/src-tauri" && cargo check 2>&1 ) )
  [ $? -ne 0 ] && REPORT="${REPORT}Cargo check errors:\n${CARGO}\n\n"
fi

[ -z "$REPORT" ] && exit 0

# Errors found. Block the stop once so Claude fixes them; if we already looped
# (stop_hook_active), just report to avoid an infinite fix loop.
if [ "$STOP_ACTIVE" = "true" ]; then
  printf "End-of-run checks still failing:\n\n%b" "$REPORT"
  exit 0
fi

printf "End-of-run checks failed — fix these before finishing:\n\n%b" "$REPORT" >&2
exit 2
