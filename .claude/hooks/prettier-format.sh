#!/bin/bash
# PostToolUse hook: auto-formats files with Prettier after Edit/Write
# Runs before lint/tsc hooks so they check already-formatted code

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[ -z "$FILE_PATH" ] && exit 0

# Skip node_modules and generated files
case "$FILE_PATH" in
  */node_modules/*) exit 0 ;;
  *.gen.ts|*.gen.tsx) exit 0 ;;
esac

# Only format file types Prettier handles
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md)
    PROJECT_DIR="$CLAUDE_PROJECT_DIR"
    cd "$PROJECT_DIR" || exit 0
    npx prettier --write "$FILE_PATH" 2>/dev/null
    ;;
esac

exit 0
