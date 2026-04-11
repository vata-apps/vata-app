## ADDED Requirements

### Requirement: Pedigree chart on tree landing page

The tree landing page at `/tree/$treeId/` SHALL display a pedigree chart showing the active person and their ancestors.

#### Scenario: Opening a tree with an active person set

- **WHEN** the user navigates to `/tree/$treeId/` and the tree has an active person
- **THEN** the page SHALL render a pedigree chart rooted on that active person
- **THEN** the active person SHALL appear on the left side of the chart
- **THEN** ancestors SHALL be laid out to the right of the active person, one column per generation

#### Scenario: Opening a tree with no active person set

- **WHEN** the user opens a tree that has no active person stored
- **THEN** the app SHALL automatically select the first individual in the tree as the active person
- **THEN** the chart SHALL render rooted on that auto-selected person

#### Scenario: Opening an empty tree

- **WHEN** the user opens a tree that has no individuals
- **THEN** the page SHALL display an empty state instead of the chart
- **THEN** the empty state SHALL guide the user toward adding or importing individuals

### Requirement: Ancestor rendering up to configured depth

The pedigree chart SHALL display ancestors up to a configurable generation depth, with a default of 4 generations (subject + 3 ancestor levels, up to 15 people).

#### Scenario: Default depth

- **WHEN** the chart first renders
- **THEN** it SHALL display 4 generations: the subject, parents, grandparents, and great-grandparents

#### Scenario: Changing depth

- **WHEN** the user changes the generation depth control to a supported value (3, 4, or 5)
- **THEN** the chart SHALL re-render with the selected number of generations

#### Scenario: Maximum depth enforced

- **WHEN** the user attempts to set a depth greater than 5
- **THEN** the chart SHALL cap the depth at 5 generations

### Requirement: Person card content

Each filled pedigree node SHALL display the individual's primary name, birth–death years, and a gender indicator.

#### Scenario: Individual with full data

- **WHEN** an ancestor has a primary name, a birth event with a year, and a death event with a year
- **THEN** the card SHALL show the formatted primary name, the birth year, and the death year separated by an en dash (e.g., `1842–1910`)
- **THEN** the card SHALL show a gender indicator corresponding to the individual's gender

#### Scenario: Living individual

- **WHEN** an ancestor is marked as living
- **THEN** the card SHALL show the birth year followed by an en dash and no death year (e.g., `1960–`)

#### Scenario: Individual with no dates

- **WHEN** an ancestor has no birth or death year
- **THEN** the card SHALL display a placeholder in place of the year range (e.g., `?`)

#### Scenario: Long name truncation

- **WHEN** a primary name is longer than fits in the card
- **THEN** the name SHALL be truncated with an ellipsis and the full name SHALL remain available as the element's accessible name (e.g., `aria-label` or `<title>`)

### Requirement: Empty ancestor slots

Missing ancestors SHALL be rendered as visually distinct empty slots that preserve the binary layout.

#### Scenario: Unknown parent

- **WHEN** an individual at any level has no recorded parent
- **THEN** the corresponding slot SHALL render as an empty placeholder card (e.g., dashed outline)
- **THEN** the slot SHALL occupy the same position it would have if filled

#### Scenario: Empty slot is not clickable

- **WHEN** a slot is an empty placeholder
- **THEN** clicking it SHALL have no effect on the active person

### Requirement: Click to re-root

Clicking a filled ancestor node SHALL re-root the pedigree chart around that person.

#### Scenario: Click on an ancestor

- **WHEN** the user clicks any filled person card in the chart
- **THEN** the clicked person SHALL become the new active person
- **THEN** the chart SHALL re-render showing the clicked person on the left with their ancestors extending to the right

#### Scenario: Active person persists across navigation

- **WHEN** the user re-roots the chart and then navigates away and back to the landing page
- **THEN** the chart SHALL still be rooted on the previously selected active person

#### Scenario: Keyboard activation

- **WHEN** a filled person card is rendered
- **THEN** the card SHALL be keyboard focusable and expose interactive semantics (e.g., `role="button"` or a semantic `<button>`)
- **WHEN** a filled person card is focused and the user presses Enter or Space
- **THEN** the chart SHALL re-root on that person as if it were clicked

### Requirement: Connector lines between generations

Parent–child relationships in the chart SHALL be drawn as connector lines between cards.

#### Scenario: Child connected to both parents

- **WHEN** a child node has both parents recorded
- **THEN** a line SHALL connect the right edge of the child card to the left edges of both parent cards
- **THEN** the line SHALL visually disambiguate the two parents

#### Scenario: Child with one missing parent

- **WHEN** a child node has only one parent recorded and the other is an empty slot
- **THEN** a line SHALL still be drawn to the empty slot so the binary layout stays readable
