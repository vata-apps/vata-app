## ADDED Requirements

### Requirement: Responsive search input

The DataTable search input SHALL reflect each keystroke visually within one frame, regardless of dataset size.

#### Scenario: Typing in search input

- **WHEN** the user types characters into the DataTable search input
- **THEN** each typed character SHALL appear in the input immediately without perceptible delay
- **THEN** the main thread SHALL NOT block long enough to drop keystrokes

#### Scenario: Typing quickly on a large dataset

- **WHEN** the dataset contains at least several hundred rows and the user types a 10-character query without pausing
- **THEN** all 10 characters SHALL appear in the input
- **THEN** the app SHALL remain responsive to other interactions (scrolling, clicking)

### Requirement: Debounced filter computation

The DataTable SHALL debounce the global filter so that row filtering only runs after the user pauses typing.

#### Scenario: Continuous typing

- **WHEN** the user is actively typing characters into the search input
- **THEN** the filtered row model SHALL NOT be recomputed on every keystroke

#### Scenario: Pause after typing

- **WHEN** the user stops typing for the debounce interval
- **THEN** the filtered row model SHALL be recomputed using the current input value
- **THEN** the visible rows SHALL reflect the filter result

#### Scenario: Clearing the input

- **WHEN** the user clears the search input
- **THEN** after the debounce interval, all rows SHALL be shown again

### Requirement: Stable column references

Pages using DataTable SHALL pass a stable `columns` reference that does not change between unrelated re-renders.

#### Scenario: Re-render from unrelated state change

- **WHEN** the parent page re-renders for a reason unrelated to columns (e.g., filter state update, selection change)
- **THEN** the `columns` array passed to DataTable SHALL be the same reference as the previous render
- **THEN** TanStack Table's internal memoization SHALL NOT be invalidated

#### Scenario: Translation language change

- **WHEN** the translation function changes (e.g., language switch)
- **THEN** the `columns` array SHALL be rebuilt with the new translations
- **THEN** the new reference SHALL be passed to DataTable
