## ADDED Requirements

### Requirement: Per-tree active person stored in tree_meta

Each tree SHALL have an optional "active person" (home person) stored in the `tree_meta` key-value table under the key `home_person_id`.

#### Scenario: Setting the active person

- **WHEN** the system calls `setHomePersonId(individualId)` for an open tree
- **THEN** the value SHALL be written to `tree_meta` under the key `home_person_id`
- **THEN** subsequent reads SHALL return the newly set ID

#### Scenario: Reading an unset active person

- **WHEN** the system calls `getHomePersonId()` on a tree that has no `home_person_id` row
- **THEN** the function SHALL return `null`

#### Scenario: Persistence across sessions

- **WHEN** the user sets an active person, closes the tree, and reopens it later
- **THEN** reading `home_person_id` SHALL return the same value that was set

### Requirement: Active person query with auto-fallback

The system SHALL provide a hook that returns the effective active person, falling back to the first individual in the tree if none is explicitly set.

#### Scenario: Explicit active person

- **WHEN** the tree has a `home_person_id` set and the hook is called
- **THEN** the hook SHALL return the individual with that ID

#### Scenario: Unset with individuals available

- **WHEN** the tree has no `home_person_id` but has at least one individual
- **THEN** the hook SHALL return the first individual in the tree (ordered by ID)

#### Scenario: Unset with no individuals

- **WHEN** the tree has no `home_person_id` and no individuals at all
- **THEN** the hook SHALL return `null`

### Requirement: Mutation invalidates pedigree queries

Setting a new active person SHALL invalidate any cached pedigree data for the affected tree.

#### Scenario: Switching active person refreshes the chart

- **WHEN** the user sets a new active person via the mutation hook
- **THEN** the mutation SHALL invalidate the active-person query and the ancestor-fetch query
- **THEN** the pedigree chart component SHALL re-render with the new data without a manual refresh
