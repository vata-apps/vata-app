#!/bin/bash
# PreToolUse hook: blocks editing generated and sensitive files
# Exit 2 = hard block (prevents the edit)

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[ -z "$FILE_PATH" ] && exit 0

BASENAME=$(basename "$FILE_PATH")

# Hard block: generated files
case "$BASENAME" in
  *.gen.ts|*.gen.tsx|*.gen.js)
    echo "BLOCKED: $BASENAME is auto-generated. Do not edit manually." >&2
    exit 2
    ;;
esac

# Hard block: lock files
case "$BASENAME" in
  pnpm-lock.yaml|package-lock.json|yarn.lock)
    echo "BLOCKED: $BASENAME is managed by the package manager." >&2
    exit 2
    ;;
esac

# Hard block: env files
case "$BASENAME" in
  .env|.env.*)
    echo "BLOCKED: Environment files should not be edited by Claude." >&2
    exit 2
    ;;
esac

exit 0
