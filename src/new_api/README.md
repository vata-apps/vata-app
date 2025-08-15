# New API Functions

This directory contains comprehensive CRUD (Create, Read, Update, Delete) functions for all database tables in the Vata genealogy application.

## Overview

All functions follow a consistent pattern:

- **fetch** - Retrieve data (all records or by ID)
- **insert** - Create new records
- **update** - Modify existing records
- **delete** - Remove records

## Function Naming Convention

- `fetch[TableName]` - Fetch all records for a table (filtered by tree if applicable)
- `fetch[TableName]ById` - Fetch a single record by its ID
- `insert[TableName]` - Insert a new record
- `update[TableName]` - Update an existing record
- `delete[TableName]` - Delete a record

## Available Functions

### Trees

- `fetchTrees()` - Get all trees
- `fetchTreeById(params)` - Get a specific tree
- `insertTree(params)` - Create a new tree
- `updateTree(params)` - Update a tree
- `deleteTree(params)` - Delete a tree

### Individuals

- `fetchIndividuals(params)` - Get all individuals in a tree
- `fetchIndividualById(params)` - Get a specific individual
- `insertIndividual(params)` - Create a new individual
- `updateIndividual(params)` - Update an individual
- `deleteIndividual(params)` - Delete an individual

### Names

- `fetchNames(params)` - Get all names for an individual
- `fetchNameById(params)` - Get a specific name
- `insertName(params)` - Create a single name
- `insertNames(params)` - Create multiple names at once
- `updateName(params)` - Update a name
- `deleteName(params)` - Delete a name

### Families

- `fetchFamilies(params)` - Get all families in a tree
- `fetchFamilyById(params)` - Get a specific family
- `insertFamily(params)` - Create a new family
- `updateFamily(params)` - Update a family
- `deleteFamily(params)` - Delete a family

### Family Children

- `fetchFamilyChildren(params)` - Get all children for a family
- `fetchFamilyChildById(params)` - Get a specific family-child relationship
- `insertFamilyChild(params)` - Create a family-child relationship
- `updateFamilyChild(params)` - Update a family-child relationship
- `deleteFamilyChild(params)` - Delete a family-child relationship

### Place Types

- `fetchPlaceTypes(params)` - Get all place types in a tree
- `fetchPlaceTypeById(params)` - Get a specific place type
- `insertPlaceType(params)` - Create a new place type
- `updatePlaceType(params)` - Update a place type
- `deletePlaceType(params)` - Delete a place type

### Places

- `fetchPlaces(params)` - Get all places in a tree
- `fetchPlaceById(params)` - Get a specific place
- `insertPlace(params)` - Create a new place
- `updatePlace(params)` - Update a place
- `deletePlace(params)` - Delete a place

### Event Types

- `fetchEventTypes(params)` - Get all event types in a tree
- `fetchEventTypeById(params)` - Get a specific event type
- `insertEventType(params)` - Create a new event type
- `updateEventType(params)` - Update an event type
- `deleteEventType(params)` - Delete an event type

### Event Roles

- `fetchEventRoles(params)` - Get all event roles in a tree
- `fetchEventRoleById(params)` - Get a specific event role
- `insertEventRole(params)` - Create a new event role
- `updateEventRole(params)` - Update an event role
- `deleteEventRole(params)` - Delete an event role

### Events

- `fetchEvents(params)` - Get all events in a tree
- `fetchEventById(params)` - Get a specific event
- `insertEvent(params)` - Create a new event
- `updateEvent(params)` - Update an event
- `deleteEvent(params)` - Delete an event

### Event Participants

- `fetchEventParticipantsByEventId(params)` - Get all participants for an event
- `fetchEventParticipantById(params)` - Get a specific event participant
- `insertEventParticipant(params)` - Create a new event participant
- `updateEventParticipant(params)` - Update an event participant
- `deleteEventParticipant(params)` - Delete an event participant

### Event Subjects

- `fetchEventSubjectsByEventId(params)` - Get all subjects for an event
- `fetchEventSubjectById(params)` - Get a specific event subject
- `insertEventSubject(params)` - Create a new event subject
- `updateEventSubject(params)` - Update an event subject
- `deleteEventSubject(params)` - Delete an event subject

## Usage Examples

```typescript
import {
  fetchIndividuals,
  insertIndividual,
  updateIndividual,
  deleteIndividual,
} from "@/new_api";

// Fetch all individuals in a tree
const individuals = await fetchIndividuals({ treeId: "tree-123" });

// Create a new individual
const individualId = await insertIndividual({
  treeId: "tree-123",
  gender: "male",
});

// Update an individual
await updateIndividual({
  individualId: "individual-123",
  gender: "female",
});

// Delete an individual
await deleteIndividual({ individualId: "individual-123" });
```

## Error Handling

All functions throw errors when database operations fail. Use try-catch blocks to handle errors:

```typescript
try {
  const individual = await fetchIndividualById({ individualId: "invalid-id" });
  if (individual === null) {
    console.log("Individual not found");
  }
} catch (error) {
  console.error("Database error:", error);
}
```

## Type Safety

All functions are fully typed using the generated database types from `@/database.types`. This ensures type safety and provides excellent IDE support.

## Importing

You can import individual functions or use the main index file:

```typescript
// Import specific functions
import { fetchIndividuals } from "@/new_api/individuals/fetchIndividuals";

// Import from main index
import { fetchIndividuals } from "@/new_api";
```

## Notes

- **GEDCOM IDs**: The `gedcomId` field is automatically generated by PostgreSQL and should not be manually set in insert or update operations.
- **Tree Scoping**: Most functions are scoped to a specific tree using the `treeId` parameter.
- **Consistent Naming**: All functions use `params` as the parameter name for consistency.
- **Type Safety**: All functions use TypeScript's `satisfies` operator to ensure type safety while maintaining clean code.
