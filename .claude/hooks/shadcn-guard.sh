#!/bin/bash
# PostToolUse hook: enforces Vata-specific shadcn rules in UI files.
# Hard-blocks (exit 2) on raw color literals in style props, non-lucide icon imports,
# and reintroduction of deprecated vata-ds.css legacy classes.
# See .claude/skills/vata-shadcn-rules/SKILL.md.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')

# Only inspect UI files: TS/TSX/JSX/CSS under src/, excluding the design layer
# where raw color literals are legitimately defined.
case "$FILE_PATH" in
  */src/components/ui/*) exit 0 ;;
  */src/index.css)       exit 0 ;;
esac

case "$FILE_PATH" in
  */src/*.ts|*/src/*.tsx|*/src/*.jsx|*/src/*.css|*/src/**/*.ts|*/src/**/*.tsx|*/src/**/*.jsx|*/src/**/*.css) ;;
  *) exit 0 ;;
esac

[ -z "$CONTENT" ] && exit 0

ERRORS=""

# --- HARD BLOCK: color literal inside a style={{...}} prop ---
# Captures style={{ ... #abc ... }} or style={{ ... rgb(...) ... }} on the same line.
if echo "$CONTENT" | grep -qE 'style=\{\{[^}]*(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|oklch\()'; then
  ERRORS="${ERRORS}[VIOLATION] Color literal inside a style={{...}} prop.\n"
  ERRORS="${ERRORS}  Rule: vata-shadcn-rules §1 + §2 — colors must use semantic Tailwind utilities (bg-background, text-muted-foreground, text-destructive, etc.).\n"
  ERRORS="${ERRORS}  Fix: replace style={{ color: '#666' }} with className=\"text-muted-foreground\".\n\n"
fi

# --- HARD BLOCK: standalone color literal in plain CSS files (excluding src/index.css handled above) ---
if [[ "$FILE_PATH" == *.css ]]; then
  if echo "$CONTENT" | grep -qE ':\s*(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|oklch\()'; then
    ERRORS="${ERRORS}[VIOLATION] Color literal in CSS file outside src/index.css.\n"
    ERRORS="${ERRORS}  Rule: vata-shadcn-rules §1 — color tokens are defined only in src/index.css; use semantic tokens (var(--background), etc.) elsewhere.\n\n"
  fi
fi

# --- HARD BLOCK: non-lucide icon library import ---
if echo "$CONTENT" | grep -qE "from\s+['\"](react-icons|@heroicons/react|@radix-ui/react-icons|@tabler/icons-react|react-feather|@mui/icons-material)"; then
  ERRORS="${ERRORS}[VIOLATION] Icon library other than lucide-react.\n"
  ERRORS="${ERRORS}  Rule: vata-shadcn-rules — only lucide-react is allowed for icons.\n"
  ERRORS="${ERRORS}  Fix: import the equivalent icon from 'lucide-react'.\n\n"
fi

# --- HARD BLOCK: reintroduction of deprecated vata-ds.css legacy classes ---
# Skip the file that owns those classes during the planned cleanup (issue #56).
case "$FILE_PATH" in
  */src/styles/vata-ds.css) ;;
  *)
    if echo "$CONTENT" | grep -qE '\b(btn-(primary|ghost|danger)|modal-backdrop|modal-shell|modal-head)\b'; then
      ERRORS="${ERRORS}[VIOLATION] Reintroduction of deprecated vata-ds.css legacy class.\n"
      ERRORS="${ERRORS}  Rule: vata-shadcn-rules §4 — these classes are being removed (see GitHub issue #56).\n"
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
