#!/bin/bash
# SessionStart hook: injects useful project context at the start of each session
# Provides: recent git activity and active coding rules

PROJECT_DIR="$CLAUDE_PROJECT_DIR"
cd "$PROJECT_DIR" || exit 0

CONTEXT=""

CONTEXT+="## Project: vata-app\n\n"

# --- Git status ---
GIT_STATUS=$(git status --short 2>/dev/null | head -20)
if [ -n "$GIT_STATUS" ]; then
  CONTEXT+="**Uncommitted changes:**\n\`\`\`\n${GIT_STATUS}\n\`\`\`\n\n"
else
  CONTEXT+="**Working tree:** clean\n\n"
fi

# --- Recent commits ---
RECENT_COMMITS=$(git log --oneline -5 2>/dev/null)
if [ -n "$RECENT_COMMITS" ]; then
  CONTEXT+="**Last 5 commits:**\n\`\`\`\n${RECENT_COMMITS}\n\`\`\`\n\n"
fi

# --- Active coding rules reminder ---
CONTEXT+="**Active coding rules (CLAUDE.md):**\n"
CONTEXT+="- English only: code, comments, docs, git messages\n"
CONTEXT+="- Never use SELECT * — always list columns explicitly\n"
CONTEXT+="- All user-facing strings must use i18n (react-i18next), never hardcode\n"

jq -n --arg ctx "$CONTEXT" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: $ctx
  }
}'
