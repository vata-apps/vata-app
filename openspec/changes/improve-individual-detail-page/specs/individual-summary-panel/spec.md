## ADDED Requirements

### Requirement: Structured key-value summary

The center panel SHALL display the individual's information as a structured key-value table with the following rows: ID, Gender, Alternative names, Birth date, Birth place, Death date, Death place, Father, Mother, Siblings, Half-siblings.

#### Scenario: Full individual data

- **WHEN** an individual has complete data (all fields populated)
- **THEN** each row SHALL display the label on the left and the value on the right
- **THEN** the individual's formatted name SHALL appear as a large heading above the table

#### Scenario: Missing optional fields

- **WHEN** an individual has no birth date, death date, or place recorded
- **THEN** those fields SHALL display a placeholder (empty or dash)

#### Scenario: Living individual

- **WHEN** the individual is marked as living
- **THEN** the Death date and Death place rows SHALL display "Alive"

### Requirement: Alternative names display

The summary SHALL display all non-primary names as alternative names.

#### Scenario: Multiple alternative names

- **WHEN** an individual has names beyond the primary name
- **THEN** the Alternative names row SHALL list them comma-separated
- **THEN** an edit icon SHALL be displayed (non-functional placeholder)

#### Scenario: No alternative names

- **WHEN** an individual has only a primary name
- **THEN** the Alternative names row SHALL display "None" or be omitted

### Requirement: Place links

Place values in the summary SHALL be displayed as styled links.

#### Scenario: Birth place displayed as link

- **WHEN** an individual has a birth event with a place
- **THEN** the Birth place value SHALL be displayed as a colored link with the place's full name

### Requirement: Edit button placeholder

The center panel header SHALL include an "Edit" button that is currently disabled or non-functional.

#### Scenario: Edit button visible

- **WHEN** the individual summary is displayed
- **THEN** an "Edit" button SHALL appear in the header area next to the individual's name
- **THEN** the button SHALL be non-functional (placeholder for future CRUD)
