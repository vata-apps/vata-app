# User Stories

Stories are organized by MVP and reference [Personas](./personas.md). Each story follows the format: _As a [persona], I want [action], so that [benefit]._

---

## MVP1 — Foundation

### US-1.1: Create a tree

As **Marie** (beginner), I want to create a new genealogical tree, so that I can start organizing my family data.

Acceptance criteria:
- [ ] User can create a tree with a name
- [ ] The tree appears in the home page list
- [ ] A new database file is created for the tree

### US-1.2: Open and close a tree

As **Robert** (enthusiast), I want to open an existing tree and close it when I'm done, so that I can work on one tree at a time.

Acceptance criteria:
- [ ] User can open a tree from the home page
- [ ] The application loads the tree's data
- [ ] User can close the tree and return to the home page

### US-1.3: Rename a tree

As **Marie** (beginner), I want to rename a tree, so that I can fix a typo or give it a better name.

Acceptance criteria:
- [ ] User can rename an existing tree
- [ ] The new name is reflected in the home page list

### US-1.4: Delete a tree

As **Robert** (enthusiast), I want to delete a tree I no longer need, so that I can keep my workspace clean.

Acceptance criteria:
- [ ] User is asked to confirm before deletion
- [ ] The tree and its database file are removed
- [ ] The tree disappears from the home page list

---

## MVP2 — GEDCOM

### US-2.1: Import a GEDCOM file

As **Marie** (beginner), I want to import a GEDCOM file I received, so that I can explore and build on existing family data.

Acceptance criteria:
- [ ] User can select a .ged file from the file system
- [ ] A new tree is created with all imported data (individuals, families, events, places)
- [ ] Import progress is visible
- [ ] Errors and warnings are reported clearly

### US-2.2: Export a tree to GEDCOM

As **Robert** (enthusiast), I want to export my tree as a GEDCOM file, so that I can share it with other researchers or import it into another tool.

Acceptance criteria:
- [ ] User can export the current tree to a .ged file
- [ ] The exported file is valid GEDCOM 5.5.1
- [ ] The exported file can be re-imported without data loss (round-trip)
- [ ] Option to exclude living individuals for privacy

### US-2.3: Handle import errors gracefully

As **Robert** (enthusiast), I want to see clear error messages when a GEDCOM import fails or has issues, so that I can understand what went wrong and fix the source file.

Acceptance criteria:
- [ ] Parsing errors are displayed with line numbers when possible
- [ ] Partial imports don't leave the database in a corrupted state (transactions)
- [ ] Warnings for unsupported tags or data that couldn't be mapped

---

## MVP3 — Primary Entities

### US-3.1: Add an individual

As **Marie** (beginner), I want to add a person to my tree with their name and gender, so that I can build my family history.

Acceptance criteria:
- [ ] User can create an individual with at least one name
- [ ] Individual appears in the individuals list
- [ ] Individual can have multiple names (birth name, married name, etc.)

### US-3.2: Create a family

As **Robert** (enthusiast), I want to create a family linking two spouses and their children, so that I can represent family relationships.

Acceptance criteria:
- [ ] User can create a family with optional husband, wife, and children
- [ ] Family members are linked correctly
- [ ] Family appears in the families list

### US-3.3: Add an event

As **Claire** (researcher), I want to add events (birth, death, marriage, etc.) to an individual or family with a date and place, so that I can record life milestones.

Acceptance criteria:
- [ ] User can add an event with a type, optional date, and optional place
- [ ] Genealogical date formats are supported (ABT 1850, BET 1840 AND 1845, etc.)
- [ ] Events are displayed on the individual or family view

### US-3.4: Manage places

As **Claire** (researcher), I want to record places with their full hierarchical name, so that I can accurately document where events occurred.

Acceptance criteria:
- [ ] User can create a place with a full name (e.g., "Montreal, Quebec, Canada")
- [ ] Existing places can be reused across events
- [ ] Places are browsable in a list

### US-3.5: Navigate between entities

As **Robert** (enthusiast), I want to navigate from an individual to their family, events, and related people, so that I can explore my tree efficiently.

Acceptance criteria:
- [ ] Individual view links to their families and events
- [ ] Family view links to spouse and children individuals
- [ ] Navigation is fast and intuitive

---

## MVP4 — Sources

> _Stories to be detailed during MVP implementation._

### US-4.1: Complete UI

As **Marie** (beginner), I want a clean, modern interface, so that the application is pleasant and easy to use.

### US-4.2: Internationalization

As **Marie** (beginner), I want the application in my language, so that I can use it without language barriers.

---

## MVP5 — Files

> _Stories to be detailed during MVP implementation._

### US-5.1: Add a source

As **Claire** (researcher), I want to create sources and attach citations to events and individuals, so that every fact in my tree is documented.

### US-5.2: Browse sources

As **Claire** (researcher), I want to browse all my sources in one place, so that I can manage my research references.

---

## MVP6 — UI

> _Stories to be detailed during MVP implementation._

### US-6.1: Attach a file

As **Claire** (researcher), I want to link scanned documents and photos to individuals and events, so that I can keep evidence alongside my data.
