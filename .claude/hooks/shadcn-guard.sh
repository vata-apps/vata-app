#!/bin/bash
# PostToolUse hook: enforces Vata-specific shadcn rules in UI files.
# Hard-blocks (exit 2) on raw color literals in style props, non-lucide icon imports,
# and reintroduction of deprecated vata-ds.css legacy classes.
# See .claude/skills/vata-shadcn-rules/SKILL.md.

if ! command -v jq >/dev/null 2>&1; then
  echo "shadcn-guard: jq not found; skipping checks" >&2
  exit 0
fi

INPUT=$(cat)
eval "$(printf %s "$INPUT" | jq -r '@sh "FILE_PATH=\(.tool_input.file_path // "")", @sh "CONTENT=\(.tool_input.content // "")"')"

[ -z "$FILE_PATH" ] && exit 0

# Edit and MultiEdit don't carry the full file content in tool_input. Since this
# is PostToolUse, the file on disk already reflects the change — read it as the
# fallback so the regex checks see the post-edit state.
if [ -z "$CONTENT" ] && [ -f "$FILE_PATH" ]; then
  CONTENT=$(cat "$FILE_PATH")
fi

[ -z "$CONTENT" ] && exit 0

# Exclude the design layer where raw color literals are legitimately defined,
# and the file owning the deprecated classes during their planned cleanup.
case "$FILE_PATH" in
  */src/components/ui/*) exit 0 ;;
  */src/index.css)       exit 0 ;;
esac

# Only inspect files under src/ with extensions we care about.
[[ "$FILE_PATH" != */src/* ]] && exit 0
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.css) ;;
  *) exit 0 ;;
esac

# Flatten newlines so multi-line style={{ ... }} props are caught by the
# single-line regex below. Limitation: misses cases where the style prop
# contains a closing `}` from a nested object before the offending literal.
FLAT_CONTENT=$(printf %s "$CONTENT" | tr '\n' ' ')

ERRORS=""

# --- HARD BLOCK: color literal inside a style={{...}} prop ---
if printf %s "$FLAT_CONTENT" | grep -qE 'style=\{\{[^}]*(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|oklch\()'; then
  ERRORS="${ERRORS}[VIOLATION] Color literal inside a style={{...}} prop.\n"
  ERRORS="${ERRORS}  Rule: vata-shadcn-rules — colors must use semantic Tailwind utilities (bg-background, text-muted-foreground, text-destructive, etc.).\n"
  ERRORS="${ERRORS}  Fix: replace style={{ color: '#666' }} with className=\"text-muted-foreground\".\n\n"
fi

# --- HARD BLOCK: hardcoded color literal in plain CSS files (excluding src/index.css already handled above) ---
# `oklch(from var(--token) ...)` and `hsl(from var(--token) ...)` are legitimate — they derive shades
# from semantic tokens. Only flag truly hardcoded values: hex, rgb()/rgba(), and `hsl()`/`oklch()`
# whose first argument is a numeric literal. No `:\s*` anchor — colors appear after other tokens
# in shorthand (e.g. `border: 1px solid #fff`).
if [[ "$FILE_PATH" == *.css ]]; then
  if printf %s "$CONTENT" | grep -qE '(#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(\s*[0-9]|\boklch\(\s*[0-9.])'; then
    ERRORS="${ERRORS}[VIOLATION] Hardcoded color literal in CSS file outside src/index.css.\n"
    ERRORS="${ERRORS}  Rule: vata-shadcn-rules — color tokens are defined only in src/index.css; reference semantic tokens (var(--background), etc.) elsewhere.\n\n"
  fi
fi

# --- HARD BLOCK: non-lucide icon library import ---
if printf %s "$CONTENT" | grep -qE "from\s+['\"](react-icons|@heroicons/react|@radix-ui/react-icons|@tabler/icons-react|react-feather|@mui/icons-material)"; then
  ERRORS="${ERRORS}[VIOLATION] Icon library other than lucide-react.\n"
  ERRORS="${ERRORS}  Rule: vata-shadcn-rules — only lucide-react is allowed for icons.\n"
  ERRORS="${ERRORS}  Fix: import the equivalent icon from 'lucide-react'.\n\n"
fi

# --- HARD BLOCK: reintroduction of deprecated vata-ds.css legacy classes ---
# Skip vata-ds.css itself during the planned cleanup of those classes.
case "$FILE_PATH" in
  */src/styles/vata-ds.css) ;;
  *)
    if printf %s "$CONTENT" | grep -qE '\b(btn-[a-zA-Z]+|modal-backdrop|modal-shell|modal-head)\b'; then
      ERRORS="${ERRORS}[VIOLATION] Reintroduction of deprecated vata-ds.css legacy class.\n"
      ERRORS="${ERRORS}  Rule: vata-shadcn-rules — these classes are being removed.\n"
      ERRORS="${ERRORS}  Fix: use <Button variant=\"...\"> or <Dialog> from \$components/ui/ instead.\n\n"
    fi
    ;;
esac

if [ -n "$ERRORS" ]; then
  {
    printf "shadcn guard violations in %s:\n\n" "$FILE_PATH"
    printf "%b" "$ERRORS"
    printf "See .claude/skills/vata-shadcn-rules/SKILL.md for the full rules.\n"
  } >&2
  exit 2
fi

exit 0
