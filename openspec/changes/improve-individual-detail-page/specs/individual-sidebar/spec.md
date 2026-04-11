## ADDED Requirements

### Requirement: Parents section

The right sidebar SHALL display a "Parents" section showing the individual's father and mother with summary details.

#### Scenario: Parents with details

- **WHEN** an individual has parents recorded
- **THEN** each parent SHALL be displayed as a card/row showing their name, ID, birth/death years, gender, and living status
- **THEN** each parent card SHALL be clickable to navigate to that parent's detail

#### Scenario: No parents recorded

- **WHEN** an individual has no parent family
- **THEN** the Parents section SHALL display an empty state

### Requirement: Siblings in parents section

The Parents section SHALL also list siblings below the parents, with "Add Brother" and "Add Sister" action buttons.

#### Scenario: Siblings displayed

- **WHEN** the individual has siblings in the parent family
- **THEN** each sibling SHALL be displayed as a card/row with name, ID, birth/death years, gender, and living status
- **THEN** each sibling card SHALL be clickable to navigate to that sibling's detail

#### Scenario: Add sibling buttons

- **WHEN** the Parents section is displayed
- **THEN** "Add Brother" and "Add Sister" buttons SHALL be visible
- **THEN** these buttons SHALL be non-functional placeholders initially

### Requirement: Families section

The right sidebar SHALL display a "Families" section showing families where the individual is a spouse.

#### Scenario: Individual with spouse families

- **WHEN** an individual is a husband or wife in one or more families
- **THEN** each family SHALL be displayed showing the spouse's name and children
- **THEN** spouse and children names SHALL be clickable links

#### Scenario: No spouse families

- **WHEN** an individual has no spouse families
- **THEN** the Families section SHALL be collapsed or show an empty state

### Requirement: Events section

The right sidebar SHALL display an "Events" section with the individual's event timeline and an "Add" button.

#### Scenario: Events displayed

- **WHEN** an individual has events
- **THEN** the Events section SHALL display the event timeline (reusing EventTimeline component)
- **THEN** an "Add" button SHALL be visible (non-functional placeholder)

#### Scenario: No events

- **WHEN** an individual has no events
- **THEN** the Events section SHALL display an empty state with the "Add" button still visible
