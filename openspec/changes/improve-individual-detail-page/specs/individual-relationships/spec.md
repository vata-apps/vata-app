## ADDED Requirements

### Requirement: Fetch individual relationships

The system SHALL provide a hook that returns an individual's family relationships: father, mother, siblings, and half-siblings.

#### Scenario: Individual with both parents

- **WHEN** an individual belongs to a parent family with a husband and wife
- **THEN** the father SHALL be the family's husband
- **THEN** the mother SHALL be the family's wife

#### Scenario: Individual with siblings

- **WHEN** an individual's parent family has other children
- **THEN** siblings SHALL include all other children in that family (excluding the individual)

#### Scenario: Individual with half-siblings

- **WHEN** either parent belongs to another family with children
- **THEN** half-siblings SHALL include children from those other families who are not already listed as full siblings

#### Scenario: Individual with no parent family

- **WHEN** an individual does not belong to any family as a child
- **THEN** father, mother, siblings, and half-siblings SHALL all be null/empty

### Requirement: Display relationships as navigable links

Family relationship values (father, mother, siblings, half-siblings) SHALL be displayed as clickable links that navigate to that individual's detail view.

#### Scenario: Click on father link

- **WHEN** the user clicks on the father's name in the center summary
- **THEN** the view SHALL navigate to display that father's detail (updating the URL search param)

#### Scenario: No related individual

- **WHEN** a relationship field has no value (e.g., no father recorded)
- **THEN** the field SHALL display "None" or equivalent placeholder text
