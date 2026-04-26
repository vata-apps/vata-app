# Documentation Consistency Validation

## When to Apply

After **every** documentation change (create, edit, or delete) in `docs/`, perform a consistency check before finishing the task.

## Consistency Check Workflow

### Step 1: Identify the scope of the change

Determine what was changed:
- **Schema or data model** → check API docs, GEDCOM mapping, screen docs
- **UI screen or layout** → check layouts doc, design system
- **Tech stack or architecture** → check overview, data flow, API docs
- **API or database layer** → check architecture docs, screen docs that reference data
- **Reference doc** → check architecture docs that may cite it
- **New file added or file deleted** → check `README.md` navigation index

### Step 2: Consult the dependency map

Use the dependency map below to find which files are potentially impacted.

### Step 3: Scan impacted files

For each potentially impacted file:
1. Read the file (or relevant sections)
2. Check if any content contradicts or is now outdated given the change
3. Check if cross-references (links) are still valid

### Step 4: Report and fix

- List all files that need updates and explain why
- Apply the fixes (or propose them if the user prefers review first)
- If `README.md` navigation needs updating, update it

## Dependency Map

```
docs/README.md
  ← ALL files (navigation index, must list every doc)

docs/architecture/database-schema.md
  → api/database-layer.md (TypeScript interfaces mirror schema)
  → references/gedcom-551-mapping.md (GEDCOM ↔ schema mapping)
  → ui/screens/* (screens display schema data)

docs/architecture/overview.md
  → architecture/data-flow.md (layers referenced)
  → architecture/tech-stack.md (technologies referenced)
  → api/database-layer.md (DB layer is a layer in overview)

docs/architecture/data-flow.md
  → api/database-layer.md (DB operations described)
  → architecture/overview.md (flow is part of architecture)

docs/architecture/tech-stack.md
  → architecture/overview.md (tech choices affect architecture)

docs/api/database-layer.md
  → architecture/database-schema.md (interfaces match schema)
  → architecture/data-flow.md (API is part of flow)

docs/ui/design-system.md
  → ui/layouts.md (layout uses design tokens)
  → ui/screens/* (screens follow design system)

docs/ui/layouts.md
  → ui/design-system.md (uses design tokens)
  → ui/screens/* (screens use layouts)

docs/ui/screens/home.md
  → ui/layouts.md (uses app layout)
  → architecture/database-schema.md (displays tree data)

docs/ui/screens/tree-view.md
  → ui/layouts.md (uses three-panel layout)
  → architecture/database-schema.md (displays tree data)

docs/ui/screens/individual-view.md
  → ui/layouts.md (uses three-panel layout)
  → architecture/database-schema.md (individual, names, events)
  → references/date-formats.md (displays dates)

docs/ui/screens/family-view.md
  → ui/layouts.md (uses three-panel layout)
  → architecture/database-schema.md (family, children, events)

docs/ui/screens/sources.md (V2)
  → ui/layouts.md (uses three-panel layout)
  → architecture/database-schema.md (sources, citations, repositories)

docs/references/date-formats.md
  → ui/screens/individual-view.md (dates displayed)
  → references/gedcom-551-mapping.md (date fields in mapping)

docs/references/gedcom-551-mapping.md
  → architecture/database-schema.md (schema ↔ GEDCOM)
  → references/date-formats.md (date fields)
```

## Quick Checklist

Before completing any documentation task, confirm:

- [ ] No contradictions introduced between changed doc and related docs
- [ ] All cross-reference links are valid (no broken links)
- [ ] `README.md` navigation index is up to date
- [ ] Terminology is consistent across affected docs
- [ ] If schema changed → API interfaces, GEDCOM mapping, and screen docs are aligned
- [ ] If a new doc was added → it appears in `README.md`
- [ ] If a doc was deleted → references to it are removed everywhere
