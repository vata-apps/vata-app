#!/bin/bash
# PostToolUse hook: runs ESLint on edited TypeScript/TSX files
# Informs Claude of any lint errors so it can fix them

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

RESULT=$(pnpm eslint "$FILE_PATH" --max-warnings 0 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "ESLint errors in $FILE_PATH:"
  echo "$RESULT"
  exit 0
fi

exit 0
