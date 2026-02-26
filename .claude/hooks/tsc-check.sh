#!/bin/bash
# PostToolUse hook: runs TypeScript compiler check on the entire project
# Informs Claude of any type errors so it can fix them

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only process TypeScript/TSX files
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

# Skip node_modules and generated files
if [[ "$FILE_PATH" == */node_modules/* ]]; then
  exit 0
fi
if [[ "$FILE_PATH" == */routeTree.gen.ts ]]; then
  exit 0
fi

PROJECT_DIR="$CLAUDE_PROJECT_DIR"
cd "$PROJECT_DIR" || exit 0

RESULT=$(pnpm tsc --noEmit 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "TypeScript errors:"
  echo "$RESULT"
  exit 0
fi

exit 0
