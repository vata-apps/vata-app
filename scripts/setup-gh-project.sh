#!/usr/bin/env bash
#
# Bootstraps the Vata GitHub Issues + Project structure.
# Idempotent: safe to rerun. Prints manual UI steps that are not scriptable.
#
# Requires: gh CLI authenticated with scopes `repo`, `project`, `read:org`.
# Run from anywhere — the script does not depend on cwd.

set -euo pipefail

ORG="vata-apps"
REPO="vata-app"
PROJECT_TITLE="Vata Roadmap"

# ---------------------------------------------------------------- helpers ---

info()  { printf "\033[1;34mℹ\033[0m  %s\n" "$*"; }
ok()    { printf "\033[1;32m✓\033[0m  %s\n" "$*"; }
warn()  { printf "\033[1;33m!\033[0m  %s\n" "$*"; }
fatal() { printf "\033[1;31m✗\033[0m  %s\n" "$*" >&2; exit 1; }

# Wrap a command that may legitimately fail (already done) and ignore the error.
soft() { "$@" 2>/dev/null || true; }

# --------------------------------------------------------------- preflight ---

command -v gh >/dev/null 2>&1 || fatal "gh CLI not found. Install: https://cli.github.com/"

if ! gh auth status >/dev/null 2>&1; then
  fatal "gh not authenticated. Run: gh auth login"
fi

# Verify required scopes
SCOPES=$(gh auth status 2>&1 | grep -oE "Token scopes:.*" || echo "")
for scope in repo project read:org; do
  if ! echo "$SCOPES" | grep -q "$scope"; then
    warn "Missing scope: $scope"
    info "Refresh with: gh auth refresh -s repo,project,read:org"
    fatal "Re-run this script after refreshing scopes."
  fi
done

ok "gh authenticated with required scopes"

# ----------------------------------------------------------------- labels ---

info "Reconciling labels in $ORG/$REPO..."

# Delete labels that are no longer part of the taxonomy
for label in "area:ui" "shadcn-cleanup" "tech-debt"; do
  if gh label list --repo "$ORG/$REPO" --json name --jq '.[].name' | grep -qx "$label"; then
    soft gh label delete "$label" --repo "$ORG/$REPO" --yes
    ok "deleted label '$label'"
  fi
done

# Ensure new labels exist
ensure_label() {
  local name="$1" color="$2" desc="$3"
  if gh label list --repo "$ORG/$REPO" --json name --jq '.[].name' | grep -qx "$name"; then
    return 0
  fi
  gh label create "$name" --repo "$ORG/$REPO" --color "$color" --description "$desc"
  ok "created label '$name'"
}

ensure_label "docs" "0075CA" "Documentation work"
ensure_label "good-first-issue" "7057FF" "Good for newcomers / small surface"

ok "Labels reconciled"

# ---------------------------------------------------------------- project ---

info "Checking org Project '$PROJECT_TITLE'..."

PROJECT_NUM=$(gh project list --owner "$ORG" --format json \
  | jq -r --arg t "$PROJECT_TITLE" '.projects[] | select(.title == $t) | .number' \
  | head -n1 || true)

if [[ -z "$PROJECT_NUM" ]]; then
  info "Creating Project '$PROJECT_TITLE' in org $ORG..."
  CREATE_OUT=$(gh project create --owner "$ORG" --title "$PROJECT_TITLE" --format json)
  PROJECT_NUM=$(echo "$CREATE_OUT" | jq -r '.number')
  ok "Project created (number: $PROJECT_NUM)"
else
  ok "Project '$PROJECT_TITLE' already exists (number: $PROJECT_NUM)"
fi

# ---------------------------------------------------------- custom fields ---

info "Reconciling custom fields..."

# Get existing fields
EXISTING_FIELDS=$(gh project field-list "$PROJECT_NUM" --owner "$ORG" --format json \
  | jq -r '.fields[].name' || echo "")

ensure_field() {
  local name="$1" options="$2"
  if echo "$EXISTING_FIELDS" | grep -qx "$name"; then
    ok "field '$name' already exists"
    return 0
  fi
  if gh project field-create "$PROJECT_NUM" \
       --owner "$ORG" \
       --name "$name" \
       --data-type SINGLE_SELECT \
       --single-select-options "$options" >/dev/null; then
    ok "created field '$name'"
  else
    warn "field-create failed for '$name'. Create manually in the Project UI:"
    warn "  Field: $name (single-select)"
    warn "  Options: $options"
  fi
}

ensure_field "Status" "Backlog,Todo,In Progress,In Review,Done"
ensure_field "Priority" "P0,P1,P2"

# -------------------------------------------------------------- next steps ---

PROJECT_URL="https://github.com/orgs/$ORG/projects/$PROJECT_NUM"

cat <<EOF

---------------------------------------------------------------------
Project ready: $PROJECT_URL

Manual UI steps still required (not scriptable):

1. Auto-add workflow
   $PROJECT_URL/workflows
   → Enable "Auto-add to project"
   → Repository: $ORG/$REPO
   → Filter: is:issue,open

2. Auto-status workflow
   Same workflows page → enable built-in:
   - "Item added to project"     → set Status: Backlog
   - "Pull request opened"       → set Status: In Review
   - "Pull request merged"       → set Status: Done
   - "Issue closed"              → set Status: Done

3. Views (recommended)
   - Board grouped by Status
   - Table grouped by Type (built-in field, maps to org Issue Types)
   - Roadmap if you start using dates / iterations

4. Verify the Issue Types are visible
   $PROJECT_URL → check that the "Type" column shows Task/Bug/Feature
   on existing items. If empty, the items predate Issue Types and
   types must be set on each issue.
---------------------------------------------------------------------
EOF
