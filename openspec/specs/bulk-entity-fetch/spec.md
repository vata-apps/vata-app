### Requirement: Constant-query individual list fetch

`IndividualManager.getAll()` SHALL load all enriched individuals using a fixed number of SQL queries, independent of the number of individuals.

#### Scenario: Loading a tree with many individuals

- **WHEN** `IndividualManager.getAll()` is called on a tree with N individuals
- **THEN** the total number of SQL queries executed SHALL be a small constant (not proportional to N)
- **THEN** the returned array SHALL contain one `IndividualWithDetails` entry per individual in the tree

#### Scenario: Each row still exposes list-view fields

- **WHEN** `IndividualManager.getAll()` returns
- **THEN** each entry SHALL expose `primaryName`, `names`, `birthEvent`, and `deathEvent` as previously
- **THEN** existing consumers of the list (columns in `IndividualsPage`) SHALL continue to work without code changes

#### Scenario: Individual with no primary name

- **WHEN** an individual has no name marked `is_primary`
- **THEN** `primaryName` SHALL be `null` in the returned entry

#### Scenario: Individual with no birth or death event

- **WHEN** an individual has no birth or death event recorded
- **THEN** `birthEvent` and/or `deathEvent` SHALL be `null` in the returned entry

### Requirement: Constant-query family list fetch

`FamilyManager.getAll()` SHALL load all enriched families using a fixed number of SQL queries, independent of the number of families.

#### Scenario: Loading a tree with many families

- **WHEN** `FamilyManager.getAll()` is called on a tree with N families
- **THEN** the total number of SQL queries executed SHALL be a small constant (not proportional to N)
- **THEN** the returned array SHALL contain one `FamilyWithMembers` entry per family in the tree

#### Scenario: Each family exposes member summaries

- **WHEN** `FamilyManager.getAll()` returns
- **THEN** each entry SHALL expose `husband`, `wife`, `children`, and `marriageEvent` as previously
- **THEN** existing consumers of the list (columns in `FamiliesPage`) SHALL continue to work without code changes
