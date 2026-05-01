#!/usr/bin/env bash
#
# Bootstraps the Vata GitHub Issues + Project structure.
# Idempotent: safe to rerun. Prints manual UI steps that are not scriptable.
#
# Requires: gh CLI authenticated with scopes `repo`, `project`, `read:org`.
# Run from anywhere — the script does not depend on cwd.

set -euo pipefail

ORG="${VATA_ORG:-vata-apps}"
REPO="${VATA_REPO:-vata-app}"
PROJECT_TITLE="${VATA_PROJECT_TITLE:-Vata Roadmap}"

# ---------------------------------------------------------------- helpers ---

info()  { printf "[INFO]  %s\n" "$*"; }
ok()    { printf "[OK]    %s\n" "$*"; }
warn()  { printf "[WARN]  %s\n" "$*" >&2; }
fatal() { printf "[FATAL] %s\n" "$*" >&2; exit 1; }

# --------------------------------------------------------------- preflight ---

command -v gh >/dev/null 2>&1 || fatal "gh CLI not found. Install: https://cli.github.com/"
command -v jq >/dev/null 2>&1 || fatal "jq not found. Install: https://stedolan.github.io/jq/"

if ! gh auth status >/dev/null 2>&1; then
  fatal "gh not authenticated. Run: gh auth login"
fi

# Verify required scopes by parsing 'gh auth status'. The text format is stable
# enough for current versions; if a future gh changes it, the loop below will
# tell the user which scope it failed to detect.
SCOPES=$(gh auth status 2>&1 | grep -oE "Token scopes:.*" || true)
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

EXISTING_LABELS=$(gh label list --repo "$ORG/$REPO" --limit 2000 --json name --jq '.[].name')

# Delete labels that are no longer part of the taxonomy
for label in "area:ui" "shadcn-cleanup" "tech-debt"; do
  if echo "$EXISTING_LABELS" | grep -qx "$label"; then
    if gh label delete "$label" --repo "$ORG/$REPO" --yes; then
      ok "deleted label '$label'"
    else
      warn "could not delete label '$label' — investigate manually"
    fi
  fi
done

# Ensure new labels exist
ensure_label() {
  local name="$1" color="$2" desc="$3"
  if echo "$EXISTING_LABELS" | grep -qx "$name"; then
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
  | jq -r --arg t "$PROJECT_TITLE" '[.projects[] | select(.title == $t) | .number] | first // empty')

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

EXISTING_FIELDS=$(gh project field-list "$PROJECT_NUM" --owner "$ORG" --format json \
  | jq -r '.fields[].name')

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

# Status is a built-in single-select field with default options
# (Todo / In Progress / Done). We keep the defaults — no need to recreate.
ensure_field "Priority" "P0,P1,P2"

# -------------------------------------------------------------- next steps ---

PROJECT_URL="https://github.com/orgs/$ORG/projects/$PROJECT_NUM"

cat <<EOF

---------------------------------------------------------------------
Project ready: $PROJECT_URL

Manual UI steps still required (not scriptable):

1. Add 'Icebox' to the Status field
   $PROJECT_URL/settings → Fields → Status → "Add option" → Icebox
   Drag Icebox to FIRST position so the pipeline reads:
     Icebox → Todo → In Progress → Done

2. Auto-add workflow
   $PROJECT_URL/workflows
   → Enable "Auto-add to project"
   → Repository: $ORG/$REPO
   → Filter: is:issue,open

3. Auto-status workflows (built-ins, same Workflows page):
   - "Item added to project"     → set Status: Todo
     (the capture-idea skill overrides to Icebox after creation)
   - "Pull request opened"       → set Status: In Progress
   - "Pull request merged"       → set Status: Done
   - "Issue closed"              → set Status: Done

4. Recommended views
   - Now: Board, group by Status, filter "is:open -status:Icebox -status:Done"
   - Icebox: Table, group by Type, filter "is:open status:Icebox"
   - Bugs: Board, group by Status, filter "is:open type:Bug"
   - Backlog by Priority: Table, group by Priority, filter "is:open -status:Icebox -status:Done"

5. Verify Issue Types render
   $PROJECT_URL → confirm the "Type" column shows Task/Bug/Feature
   on existing items. Items that predate Issue Types need their
   type set manually.
---------------------------------------------------------------------
EOF
