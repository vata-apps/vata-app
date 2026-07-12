#!/bin/bash
# pre-commit SQL guard: detects SQL anti-patterns in DB-layer files.
# SELECT * is a hard block (exit non-zero); interpolation only warns.
# Patterns use POSIX ERE (grep -E), not grep -P: BSD grep on macOS has
# no -P, so -P patterns silently never match.
#
# Usage: sql-guard.sh <file> [<file> ...]
# Reads each file path from disk (staged content can be fetched via
# `git show :<file>` when called from pre-commit for staged versions).

ERRORS=""
WARNINGS=""

for FILE_PATH in "$@"; do
  [ -z "$FILE_PATH" ] && continue
  [ -f "$FILE_PATH" ] || continue

  # Only process relevant files: src/db/**, *.sql, or TS files containing SQL keywords.
  is_db_file=0
  case "$FILE_PATH" in
    */src/db/*|*.sql) is_db_file=1 ;;
    *.ts|*.tsx)
      if grep -qiE "(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|DROP TABLE)[[:space:]]" "$FILE_PATH" 2>/dev/null; then
        is_db_file=1
      fi
      ;;
  esac
  [ $is_db_file -eq 0 ] && continue

  CONTENT=$(git show :"$FILE_PATH" 2>/dev/null || cat "$FILE_PATH" 2>/dev/null)
  [ -z "$CONTENT" ] && continue

  # --- HARD BLOCK: SELECT * ---
  if echo "$CONTENT" | grep -qiE "SELECT[[:space:]]+[*]"; then
    ERRORS="${ERRORS}[VIOLATION] SELECT * detected in ${FILE_PATH} — always list columns explicitly (see the sqlite-standards skill).\n"
    ERRORS="${ERRORS}  Fix: replace SELECT * with explicit column names.\n"
    ERRORS="${ERRORS}  Example: SELECT id, given_name, surname FROM individuals WHERE id = \$1\n\n"
  fi

  # --- WARNING: SQL inside a template literal with ${...} interpolation ---
  if echo "$CONTENT" | grep -qiE '`[^`]*(SELECT|INSERT|UPDATE|DELETE)[^`]*[$][{]'; then
    WARNINGS="${WARNINGS}[WARNING] SQL string interpolation detected in ${FILE_PATH} — use parameterized queries (\$1, \$2) instead of template literals.\n"
    WARNINGS="${WARNINGS}  Example: db.execute('SELECT id FROM trees WHERE id = \$1', [id])\n\n"
  fi
done

# Emit hard errors (blocks commit).
if [ -n "$ERRORS" ]; then
  {
    printf "SQL guard violations:\n\n"
    printf "%b" "$ERRORS"
    [ -n "$WARNINGS" ] && printf "%b" "$WARNINGS"
  } >&2
  exit 1
fi

# Emit warnings only (commit proceeds).
if [ -n "$WARNINGS" ]; then
  printf "SQL guard warnings:\n\n%b" "$WARNINGS"
fi

exit 0