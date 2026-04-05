#!/bin/bash
# SessionStart hook: injects useful project context at the start of each session
# Provides: current MVP status, recent git activity, and active coding rules

PROJECT_DIR="$CLAUDE_PROJECT_DIR"
cd "$PROJECT_DIR" || exit 0

CONTEXT=""

# --- Current MVP (dynamic detection) ---
CONTEXT+="## Project: vata-app\n\n"

LATEST_MVP_DIR=$(ls -1d "$PROJECT_DIR/docs/mvps/"mvp-* 2>/dev/null | sort -V | tail -1)
if [ -n "$LATEST_MVP_DIR" ] && [ -f "$LATEST_MVP_DIR/README.md" ]; then
  MVP_TITLE=$(head -1 "$LATEST_MVP_DIR/README.md" | sed 's/^# //')
  MVP_GOAL=$(sed -n '/^## Job to be Done/{n;n;s/^\*\*//;s/\*\*$//;p;}' "$LATEST_MVP_DIR/README.md")
  CONTEXT+="**Active MVP:** ${MVP_TITLE}\n"
  [ -n "$MVP_GOAL" ] && CONTEXT+="**Goal:** ${MVP_GOAL}\n\n"

  # Extract phase checklist status using awk for reliable section parsing
  PHASE_STATS=$(awk '
    /^### Phase/ {
      if (name != "") printf "%s|%d|%d\n", name, done, total
      name = $0; sub(/^### /, "", name)
      done = 0; total = 0; next
    }
    /^##/ && name != "" {
      printf "%s|%d|%d\n", name, done, total
      name = ""; next
    }
    name != "" && /^\s*- \[x\]/ { done++; total++; next }
    name != "" && /^\s*- \[.\]/ { total++; next }
    END { if (name != "") printf "%s|%d|%d\n", name, done, total }
  ' "$LATEST_MVP_DIR/README.md")

  if [ -n "$PHASE_STATS" ]; then
    CONTEXT+="**Phases:**\n"
    while IFS='|' read -r pname pdone ptotal; do
      if [ "$pdone" -eq "$ptotal" ] && [ "$ptotal" -gt 0 ]; then
        CONTEXT+="- ✅ ${pname} (${pdone}/${ptotal})\n"
      else
        CONTEXT+="- ➡ ${pname} (${pdone}/${ptotal})\n"
      fi
    done <<< "$PHASE_STATS"
    CONTEXT+="\n"
  fi
else
  CONTEXT+="**Active MVP:** unknown (no docs/mvps/ found)\n\n"
fi

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
CONTEXT+="- i18n deferred to MVP6; hardcoded English strings are acceptable for now\n"

jq -n --arg ctx "$CONTEXT" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: $ctx
  }
}'
