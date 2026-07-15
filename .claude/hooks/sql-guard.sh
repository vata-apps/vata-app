#!/bin/bash
# PostToolUse hook: detects SQL anti-patterns in DB-layer files.
# SELECT * is a hard block (exit 2 — feeds the error back to Claude); interpolation
# only warns. Patterns use POSIX ERE (grep -E), not grep -P: BSD grep on macOS has
# no -P, so -P patterns silently never match.

INPUT=$(cat)
FILE_PATH=$(jq -r '.tool_input.file_path // empty' <<<"$INPUT")
# Write provides .content; Edit provides .new_string — read whichever is present.
CONTENT=$(jq -r '.tool_input.content // .tool_input.new_string // empty' <<<"$INPUT")

[ -z "$CONTENT" ] && exit 0

# Only process relevant files: src/db/**, *.sql, or TS files containing SQL keywords.
is_db_file=0
case "$FILE_PATH" in
  */src/db/*|*.sql) is_db_file=1 ;;
  *.ts|*.tsx)
    if echo "$CONTENT" | grep -qiE "(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|DROP TABLE)[[:space:]]"; then
      is_db_file=1
    fi
    ;;
esac

[ $is_db_file -eq 0 ] && exit 0

ERRORS=""
WARNINGS=""

# --- HARD BLOCK: SELECT * ---
if echo "$CONTENT" | grep -qiE "SELECT[[:space:]]+[*]"; then
  ERRORS="${ERRORS}[VIOLATION] SELECT * detected — always list columns explicitly (see the sqlite-standards skill).\n"
  ERRORS="${ERRORS}  Fix: replace SELECT * with explicit column names.\n"
  ERRORS="${ERRORS}  Example: SELECT id, given_name, surname FROM individuals WHERE id = \$1\n\n"
fi

# --- WARNING: SQL inside a template literal with ${...} interpolation ---
if echo "$CONTENT" | grep -qE '`[^`]*(SELECT|INSERT|UPDATE|DELETE)[^`]*[$][{]'; then
  WARNINGS="${WARNINGS}[WARNING] SQL string interpolation detected — use parameterized queries (\$1, \$2) instead of template literals.\n"
  WARNINGS="${WARNINGS}  Example: db.execute('SELECT id FROM trees WHERE id = \$1', [id])\n\n"
fi

# Emit hard errors (feeds back to Claude via stderr on exit 2).
if [ -n "$ERRORS" ]; then
  {
    printf "SQL guard violations in %s:\n\n" "$FILE_PATH"
    printf "%b" "$ERRORS"
    [ -n "$WARNINGS" ] && printf "%b" "$WARNINGS"
  } >&2
  exit 2
fi

# Emit warnings only (shown to Claude via stdout).
if [ -n "$WARNINGS" ]; then
  printf "SQL guard warnings in %s:\n\n%b" "$FILE_PATH" "$WARNINGS"
fi

exit 0
