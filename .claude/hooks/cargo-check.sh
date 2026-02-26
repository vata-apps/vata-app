#!/bin/bash
# PostToolUse hook: runs cargo check after editing Rust files
# Informs Claude of any compilation errors so it can fix them

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only process Rust files and Tauri config
if [[ "$FILE_PATH" != *.rs && "$FILE_PATH" != */tauri.conf.json ]]; then
  exit 0
fi

PROJECT_DIR="$CLAUDE_PROJECT_DIR"
TAURI_DIR="$PROJECT_DIR/src-tauri"

if [ ! -d "$TAURI_DIR" ]; then
  exit 0
fi

cd "$TAURI_DIR" || exit 0

RESULT=$(cargo check 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "Cargo check errors:"
  echo "$RESULT"
  exit 0
fi

exit 0
