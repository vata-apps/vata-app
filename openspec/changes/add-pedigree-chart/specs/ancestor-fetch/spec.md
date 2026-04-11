## ADDED Requirements

### Requirement: Load ancestors up to N generations in bounded queries

The system SHALL provide a DB function `getAncestors(rootId, generations)` that loads an individual and their ancestors up to the specified number of generations using a bounded number of SQL queries (independent of total tree size).

#### Scenario: Loading a full pedigree

- **WHEN** `getAncestors(rootId, 4)` is called and all 15 ancestor slots are filled in the DB
- **THEN** the function SHALL return 15 individuals (the root plus 14 ancestors)
- **THEN** the total number of SQL queries SHALL be bounded by a constant multiple of the number of generations, not the number of individuals in the tree

#### Scenario: Partial pedigree

- **WHEN** `getAncestors(rootId, 4)` is called and some ancestors are unknown
- **THEN** the function SHALL return only the known individuals
- **THEN** the caller SHALL be able to identify which ancestor slots are missing from the result

#### Scenario: Root with no parents

- **WHEN** `getAncestors(rootId, 4)` is called on an individual with no parent family
- **THEN** the function SHALL return only the root individual
- **THEN** no error SHALL be thrown

#### Scenario: Generations parameter bounds

- **WHEN** `getAncestors(rootId, N)` is called
- **THEN** the function SHALL reject or clamp values where N is less than 1 or greater than 5

### Requirement: Ancestor results structured as Ahnentafel numbering

The ancestor fetch result SHALL be indexed by Ahnentafel (Sosa–Stradonitz) numbers so that each slot has a stable, well-known position.

#### Scenario: Root position

- **WHEN** ancestors are returned
- **THEN** the root individual SHALL be at slot 1

#### Scenario: Parents' positions

- **WHEN** a child is at slot `n`
- **THEN** their father SHALL be at slot `2n` and their mother at slot `2n + 1`

#### Scenario: Missing ancestor slots

- **WHEN** an ancestor at slot `n` is unknown
- **THEN** the result SHALL have no entry (or a null entry) at slot `n`
- **THEN** descendants of that missing slot SHALL also be absent from the result

### Requirement: Each ancestor node exposes display fields

Each individual returned from `getAncestors` SHALL include the fields needed to render a pedigree person card without additional queries.

#### Scenario: Display fields available

- **WHEN** `getAncestors` returns a slot's individual
- **THEN** that individual SHALL expose the formatted primary name, birth year (if known), death year (if known), living status, and gender

#### Scenario: Missing primary name

- **WHEN** an individual has no primary name
- **THEN** the primary name field SHALL be `null`
- **THEN** the card SHALL still be renderable (the component handles the null)
