## ADDED Requirements

### Requirement: Parents section

The right sidebar SHALL display a "Parents" section showing the individual's father and mother with summary details.

#### Scenario: Parents with details

- **WHEN** an individual has parents recorded
- **THEN** each parent SHALL be displayed as a card/row showing their name, ID, birth/death years, gender, and living status
- **THEN** a missing birth or death year SHALL be rendered as the literal placeholder `—` (em dash)
- **THEN** clicking a parent card SHALL update the selection by navigating to `/tree/$treeId/individuals?id=<parentId>` (updating the `id` search param) rather than performing a full-page navigation

#### Scenario: No parents recorded

- **WHEN** an individual has no parent family
- **THEN** the Parents section SHALL display an empty state with the literal text "No parents"

### Requirement: Siblings in parents section

The Parents section SHALL also list siblings below the parents, with "Add Brother" and "Add Sister" action buttons.

#### Scenario: Siblings displayed

- **WHEN** the individual has siblings in the parent family
- **THEN** each sibling SHALL be displayed as a card/row with name, ID, birth/death years, gender, and living status
- **THEN** a missing birth or death year SHALL be rendered as the literal placeholder `—` (em dash)
- **THEN** clicking a sibling card SHALL update the selection by navigating to `/tree/$treeId/individuals?id=<siblingId>` (updating the `id` search param) rather than performing a full-page navigation

#### Scenario: Add sibling buttons

- **WHEN** the Parents section is displayed
- **THEN** "Add Brother" and "Add Sister" buttons SHALL be visible
- **THEN** these buttons SHALL be non-functional placeholders initially

### Requirement: Families section

The right sidebar SHALL display a "Families" section showing families where the individual is a spouse.

#### Scenario: Individual with spouse families

- **WHEN** an individual is a husband or wife in one or more families
- **THEN** each family SHALL be displayed showing the spouse's name and children
- **THEN** clicking a spouse or child name SHALL update the selection by navigating to `/tree/$treeId/individuals?id=<personId>` (updating the `id` search param) rather than performing a full-page navigation, preserving browser history for back/forward and deep-linking

#### Scenario: No spouse families

- **WHEN** an individual has no spouse families
- **THEN** the Families section SHALL display an empty state with the literal text "No families"

### Requirement: Events section

The right sidebar SHALL display an "Events" section with the individual's event timeline and an "Add" button.

#### Scenario: Events displayed

- **WHEN** an individual has events
- **THEN** the Events section SHALL display the event timeline (reusing EventTimeline component)
- **THEN** an "Add" button SHALL be visible (non-functional placeholder)

#### Scenario: No events

- **WHEN** an individual has no events
- **THEN** the Events section SHALL display an empty state with the literal text "No events" and the "Add" button still visible
