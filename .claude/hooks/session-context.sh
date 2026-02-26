#!/bin/bash
# SessionStart hook: injects useful project context at the start of each session
# Provides: current MVP status, recent git activity, and active coding rules

PROJECT_DIR="$CLAUDE_PROJECT_DIR"
cd "$PROJECT_DIR" || exit 0

CONTEXT=""

# --- Current MVP ---
CONTEXT+="## Project: vata-app\n\n"
CONTEXT+="**Active MVP: MVP3 — Primary Entities**\n"
CONTEXT+="Goal: CRUD for Individuals, Names, Families, Events, and Places.\n\n"
CONTEXT+="Phases:\n"
CONTEXT+="- Phase 1: Tree Schema (src/db/trees/ schema)\n"
CONTEXT+="- Phase 2: CRUD Database layer (src/db/trees/**)\n"
CONTEXT+="- Phase 3: Dates (@vata-apps/gedcom-date integration)\n"
CONTEXT+="- Phase 4: Managers & React Query hooks (src/managers/, src/hooks/)\n"
CONTEXT+="- Phase 5: Minimal HTML UI (src/routes/, src/pages/)\n\n"

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
CONTEXT+="- i18n deferred to MVP4; hardcoded English strings are acceptable for now\n"

jq -n --arg ctx "$CONTEXT" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: $ctx
  }
}'
