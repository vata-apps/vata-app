---
name: docs-consistency
description: Validates documentation consistency after any doc change. Use when creating, editing, or deleting documentation files (*.md in docs/). Checks if other documentation files need to be updated to stay consistent with the changes made.
---

# Documentation Consistency Validation

## When to Apply

After **every** documentation change (create, edit, or delete) in `docs/`.

## Dependency Map

When a file changes, the files it points to (via `->`) may need updates.

```
docs/README.md
  <- ALL files (navigation index, must list every doc)

docs/architecture/database-schema.md
  -> api/database-layer.md (TypeScript interfaces mirror schema)
  -> references/gedcom-551-mapping.md (GEDCOM <-> schema mapping)
  -> ui/screens/* (screens display schema data)

docs/architecture/overview.md
  -> architecture/data-flow.md (layers referenced)
  -> architecture/tech-stack.md (technologies referenced)
  -> api/database-layer.md (DB layer is a layer in overview)

docs/architecture/data-flow.md
  -> api/database-layer.md (DB operations described)
  -> architecture/overview.md (flow is part of architecture)

docs/architecture/tech-stack.md
  -> architecture/overview.md (tech choices affect architecture)

docs/api/database-layer.md
  -> architecture/database-schema.md (interfaces match schema)
  -> architecture/data-flow.md (API is part of flow)

docs/ui/design-system.md
  -> ui/layouts.md (layout uses design tokens)
  -> ui/screens/* (screens follow design system)

docs/ui/layouts.md
  -> ui/design-system.md (uses design tokens)
  -> ui/screens/* (screens use layouts)

docs/ui/screens/*.md
  -> ui/layouts.md (uses layouts)
  -> architecture/database-schema.md (displays entity data)

docs/references/date-formats.md
  -> ui/screens/individual-view.md (dates displayed)
  -> references/gedcom-551-mapping.md (date fields in mapping)

docs/references/gedcom-551-mapping.md
  -> architecture/database-schema.md (schema <-> GEDCOM)
  -> references/date-formats.md (date fields)
```

The map can become stale — verify each file exists with Glob before reading.

## Workflow

For a single file change, you can validate manually using the quick checklist below.

For larger changes (multiple files, deletions, new sections), **dispatch the `docs-consistency` agent** with a description of what changed. The agent walks the dependency map, reads impacted files, and returns a structured report.

## Quick Checklist

- [ ] No contradictions introduced between changed doc and related docs
- [ ] All cross-reference links are valid (no broken links)
- [ ] `docs/README.md` navigation index is up to date
- [ ] Terminology is consistent across affected docs
- [ ] If schema changed → API interfaces, GEDCOM mapping, and screen docs are aligned
- [ ] If a new doc was added → it appears in `docs/README.md`
- [ ] If a doc was deleted → references to it are removed everywhere
