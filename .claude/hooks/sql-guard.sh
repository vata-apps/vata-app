#!/bin/bash
# PostToolUse hook: detects SQL anti-patterns in DB layer files
# SELECT * is a hard block (exit 2 — feeds error to Claude); other patterns warn Claude

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')

# Only process relevant files: src/db/**, *.sql, or TS files containing SQL keywords
is_db_file=0
if [[ "$FILE_PATH" == */src/db/* ]]; then is_db_file=1; fi
if [[ "$FILE_PATH" == *.sql ]]; then is_db_file=1; fi
if [[ "$FILE_PATH" == *.ts || "$FILE_PATH" == *.tsx ]]; then
  if echo "$CONTENT" | grep -qiE "(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|DROP TABLE)\s"; then
    is_db_file=1
  fi
fi

if [ $is_db_file -eq 0 ]; then
  exit 0
fi

ERRORS=""
WARNINGS=""

# --- HARD BLOCK: SELECT * ---
if echo "$CONTENT" | grep -qiP "SELECT\s+\*"; then
  ERRORS="${ERRORS}[VIOLATION] SELECT * detected — CLAUDE.md rule: always list columns explicitly.\n"
  ERRORS="${ERRORS}  Fix: replace SELECT * with explicit column names.\n"
  ERRORS="${ERRORS}  Example: SELECT id, given_name, surname FROM individuals WHERE id = \$1\n\n"
fi

# --- WARNING: SQL string interpolation (template literals with SQL) ---
if echo "$CONTENT" | grep -qP '`[^`]*(SELECT|INSERT|UPDATE|DELETE)[^`]*\$\{'; then
  WARNINGS="${WARNINGS}[WARNING] SQL string interpolation detected — use parameterized queries (\$1, \$2) instead of template literals.\n"
  WARNINGS="${WARNINGS}  Example: db.execute('SELECT id FROM trees WHERE id = \$1', [id])\n\n"
fi

# --- WARNING: list-style SELECT without LIMIT (no single-row lookup pattern) ---
# Match SELECT queries that are not single-row lookups (WHERE col = $n)
while IFS= read -r line; do
  if echo "$line" | grep -qiP "SELECT\s+\S" && ! echo "$line" | grep -qiP "LIMIT\s"; then
    if ! echo "$line" | grep -qiP "WHERE\s+\S+\s*=\s*\\\$[0-9]"; then
      WARNINGS="${WARNINGS}[WARNING] SELECT query without LIMIT — add LIMIT (and OFFSET when paginating) to avoid unbounded results.\n"
      WARNINGS="${WARNINGS}  Line: $(echo "$line" | sed 's/^[[:space:]]*//')\n\n"
      break
    fi
  fi
done < <(echo "$CONTENT")

# Emit hard errors (feeds back to Claude via stderr on exit 2)
if [ -n "$ERRORS" ]; then
  {
    printf "SQL guard violations in %s:\n\n" "$FILE_PATH"
    printf "%b" "$ERRORS"
    if [ -n "$WARNINGS" ]; then
      printf "%b" "$WARNINGS"
    fi
  } >&2
  exit 2
fi

# Emit warnings only (shown to Claude via stdout)
if [ -n "$WARNINGS" ]; then
  printf "SQL guard warnings in %s:\n\n%b" "$FILE_PATH" "$WARNINGS"
  exit 0
fi

exit 0
