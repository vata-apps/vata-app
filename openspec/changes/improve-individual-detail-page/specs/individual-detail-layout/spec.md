## ADDED Requirements

### Requirement: Three-panel master-detail layout

The individuals view SHALL display a three-panel layout: a left panel with the individual list, a center panel with the selected individual's summary, and a right panel with contextual sidebar information.

#### Scenario: Default state with no selection

- **WHEN** the user navigates to the individuals page without a selected individual
- **THEN** the left panel SHALL display the searchable list of individuals
- **THEN** the center and right panels SHALL display an empty state message

#### Scenario: Individual selected

- **WHEN** the user clicks on an individual in the left panel list
- **THEN** the URL SHALL update with the selected individual's ID as a search param
- **THEN** the center panel SHALL display that individual's summary
- **THEN** the right panel SHALL display that individual's sidebar information

### Requirement: Left panel individual list with search

The left panel SHALL display a scrollable, searchable list of all individuals in the tree.

#### Scenario: List display

- **WHEN** the individuals page loads
- **THEN** each list item SHALL show the individual's formatted name, ID, gender, birth/death years, and living status
- **THEN** the currently selected individual SHALL be visually highlighted

#### Scenario: Search filtering

- **WHEN** the user types in the search input
- **THEN** the list SHALL filter individuals whose name matches the search term

### Requirement: Deep-linking to selected individual

The selected individual SHALL be encoded in the URL so it can be bookmarked and shared.

#### Scenario: Direct URL navigation

- **WHEN** the user navigates to `/tree/$treeId/individuals?id=I-0001`
- **THEN** the individual with ID `I-0001` SHALL be selected and displayed in the center and right panels

#### Scenario: Browser history navigation

- **WHEN** the user selects different individuals and uses the browser back button
- **THEN** the previously selected individual SHALL be restored

### Requirement: Independent panel scrolling

Each of the three panels SHALL scroll independently.

#### Scenario: Long list does not affect detail scroll

- **WHEN** the individual list is longer than the viewport
- **THEN** the left panel SHALL scroll independently without affecting the center or right panel scroll positions
