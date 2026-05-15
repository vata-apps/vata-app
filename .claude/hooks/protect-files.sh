#!/bin/bash
# PreToolUse hook: blocks editing generated and sensitive files
# Exit 2 = hard block (prevents the edit)

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

[ -z "$FILE_PATH" ] && exit 0

BASENAME=$(basename "$FILE_PATH")

# Hard block: shadcn drift. shadcn was removed; this project uses $components/ui not @/components/ui.
# Only check .ts/.tsx source under src/ to avoid false positives in docs/configs.
case "$FILE_PATH" in
  *src/*.ts|*src/*.tsx)
    if [ "$TOOL_NAME" = "Write" ]; then
      CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
    else
      CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')
    fi
    if echo "$CONTENT" | grep -qE 'from "@/components/ui|from '"'"'@/components/ui|@shadcn/ui|shadcn-ui'; then
      echo "BLOCKED: shadcn-style imports (@/components/ui or @shadcn/ui) are not allowed. Use \$components/ui/*." >&2
      echo "If you're convinced this is wrong, remove the hook entry in .claude/settings.json and explain why in CLAUDE.md." >&2
      exit 2
    fi
    ;;
esac

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
