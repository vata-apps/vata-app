---
name: docs-consistency
description: Validates documentation consistency after any doc change. Use when creating, editing, or deleting documentation files (*.md in docs/). Checks if other documentation files need to be updated to stay consistent with the changes made.
---

# Documentation Consistency Validation

## When to Apply

After **every** documentation change (create, edit, or delete) in `docs/`.

## How to Use

**Dispatch the `docs-consistency` agent** to perform the consistency check. Provide it with a description of what changed.

Example dispatch prompt:
> "I edited `docs/architecture/database-schema.md` to add the sources table. Check which other docs need updating."

The agent will:
1. Identify impacted files using its built-in dependency map
2. Read and scan each potentially affected file
3. Return a structured report of inconsistencies found

## Quick Checklist (for manual spot-checks)

- [ ] No contradictions introduced between changed doc and related docs
- [ ] All cross-reference links are valid (no broken links)
- [ ] `docs/README.md` navigation index is up to date
- [ ] Terminology is consistent across affected docs
- [ ] If schema changed → API interfaces, GEDCOM mapping, and screen docs are aligned
- [ ] If a new doc was added → it appears in `docs/README.md`
- [ ] If a doc was deleted → references to it are removed everywhere
