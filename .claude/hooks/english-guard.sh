#!/bin/bash
# PostToolUse hook: detects non-English content in code files
# Checks comments and identifiers for non-ASCII characters
# Ignores string literals (handled by i18n in MVP4)

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')

# Only check relevant file types
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx && "$FILE_PATH" != *.rs && "$FILE_PATH" != *.md ]]; then
  exit 0
fi

if [[ "$FILE_PATH" == */node_modules/* ]]; then
  exit 0
fi

WARNINGS=""

# --- Check comment lines for non-ASCII (// and /* */ style) ---
COMMENT_VIOLATIONS=$(echo "$CONTENT" | grep -nP '(^\s*//|^\s*/\*|^\s*\*)' | grep -P '[^\x00-\x7F]')

if [ -n "$COMMENT_VIOLATIONS" ]; then
  WARNINGS="${WARNINGS}[WARNING] Non-English characters in comments (CLAUDE.md: English only in all code):\n"
  while IFS= read -r line; do
    WARNINGS="${WARNINGS}  ${line}\n"
  done <<< "$COMMENT_VIOLATIONS"
  WARNINGS="${WARNINGS}\n"
fi

# --- Check for non-ASCII outside of string literals ---
# Strip double-quoted strings, single-quoted strings, and template literals, then check
NON_ASCII_CODE=$(echo "$CONTENT" | \
  sed 's/"[^"]*"//g' | \
  sed "s/'[^']*'//g" | \
  grep -nP '[^\x00-\x7F]')

if [ -n "$NON_ASCII_CODE" ]; then
  # Avoid double-reporting lines already caught in comments
  WARNINGS="${WARNINGS}[WARNING] Non-ASCII characters detected outside string literals (CLAUDE.md: English only):\n"
  while IFS= read -r line; do
    WARNINGS="${WARNINGS}  ${line}\n"
  done <<< "$NON_ASCII_CODE"
  WARNINGS="${WARNINGS}\n"
fi

if [ -n "$WARNINGS" ]; then
  printf "English guard warnings in %s:\n\n%b" "$FILE_PATH" "$WARNINGS"
  exit 0
fi

exit 0
