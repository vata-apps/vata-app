# Codebase Improvement Suggestions

This document outlines suggested improvements for the Vata app codebase to enhance maintainability, performance, and developer experience.

## API Layer Improvements

### 1. Create Reusable Query Functions

**Issue:** Many API files (`fetchIndividual.ts`, `fetchFamily.ts`, `fetchPlaces.ts`, etc.) contain similar Supabase query patterns with duplicate code.

**Suggestion:** Create reusable query builder functions to reduce duplication:

```typescript
// src/api/utils/queryBuilders.ts
export function buildIndividualQuery(supabase) {
  return supabase.from("individuals").select("*, names (*)");
}

export function buildFamilyQuery(supabase) {
  return supabase.from("families").select(`
      *,
      husband:husband_id (id, gender, names (*)),
      wife:wife_id (id, gender, names (*)),
      children:family_children (individual:individual_id (id))
    `);
}
```

### 2. Implement Error Handling Middleware

**Issue:** Each API function has similar error handling patterns repeated.

**Suggestion:** Create a wrapper function for consistent error handling:

```typescript
// src/api/utils/errorHandling.ts
export async function withErrorHandling<T>(
  promise: Promise<{ data: T; error: any }>,
): Promise<T> {
  const { data, error } = await promise;
  if (error) throw error;
  return data;
}
```

### 3. Create SQL Views for Common Queries

**Issue:** Complex nested queries are performed in the API layer that could be more efficiently handled by the database.

**Suggestion:** Create Supabase SQL views for commonly used data structures:

- `individuals_with_names_view` - Individuals with their names
- `families_with_members_view` - Families with spouse and children data
- `places_hierarchical_view` - Places with their hierarchical structure

## Type Definitions Improvements

### 1. Simplify Type Reuse

**Issue:** Types are often redefined in multiple files with slight variations.

**Suggestion:** Create dedicated type definition files for core entities:

```typescript
// src/types/individuals.ts
import { Database, Tables, Enums } from "@/database.types";

export type Name = Pick<
  Tables<"names">,
  "first_name" | "last_name" | "is_primary"
>;

export type IndividualBasic = {
  id: string;
  gender: Enums<"gender">;
};

export type IndividualWithNames = IndividualBasic & {
  names: Name[];
};

export type IndividualWithFamily = IndividualWithNames & {
  // Family relationship types
};
```

### 2. Use Type Composition Over Type Duplication

**Issue:** Similar types are defined with duplication across components and API functions.

**Suggestion:** Use type composition to create more specific types from base types:

```typescript
// Example: Building more complex types from simpler ones
export type FamilyMemberDisplay = IndividualWithNames & {
  relationship: "husband" | "wife" | "child";
};
```

## Component Reusability

### 1. Create a Unified Data Display Components

**Issue:** Similar UI patterns for displaying genealogical information are implemented in multiple components.

**Suggestion:** Create reusable display components:

- `EventDisplay` - For consistent display of genealogical events
- `DateDisplay` - For formatted date display with standardized parsing
- `LocationDisplay` - For hierarchical place name display

### 2. Consolidate Table Implementations

**Issue:** There are multiple table implementations (`FamilyTable.tsx`, `FamiliesAsSpouseTable.tsx`) with similar patterns.

**Suggestion:** Create a generic table component:

```typescript
// src/components/common/GenealogicalTable.tsx
export function GenealogicalTable<T>({
  data,
  columns,
  renderRow,
  emptyMessage,
}: {
  data: T[];
  columns: { key: string; label: string }[];
  renderRow: (item: T) => React.ReactNode;
  emptyMessage?: string;
}) {
  // Generic table implementation
}
```

### 3. Improve Component Documentation

**Issue:** Some components lack comprehensive JSDoc documentation.

**Suggestion:** Add standardized JSDoc comments to all components explaining:

- Purpose
- Props
- Usage examples

## Database and Query Performance

### 1. Add Database Indexes

**Issue:** Frequently queried fields may not be optimally indexed.

**Suggestion:** Add indexes to these common query fields:

- `individuals.gender`
- `names.first_name` and `names.last_name`
- `family_children.family_id` and `family_children.individual_id`

### 2. Implement Query Pagination and Caching

**Issue:** Some queries might return large result sets.

**Suggestion:** Standardize pagination patterns and implement client-side caching for repeated queries.

### 3. Add Database Functions for Complex Operations

**Issue:** Multi-step operations requiring multiple queries are implemented client-side.

**Suggestion:** Create Supabase database functions for:

- Recursive place hierarchy traversal
- Individual relationship calculations
- Name consolidation and formatting

## Code Organization

### 1. Standardize File and Folder Structure

**Issue:** Some related functionality is spread across multiple locations.

**Suggestion:** Reorganize the codebase with a more consistent structure:

```
src/
├── api/
│   ├── individuals/
│   ├── families/
│   ├── places/
│   └── utils/
├── components/
│   ├── individuals/
│   ├── families/
│   ├── places/
│   ├── common/
│   └── layout/
├── hooks/
│   ├── useIndividual.ts
│   ├── useFamily.ts
│   └── usePlaces.ts
├── types/
│   ├── individuals.ts
│   ├── families.ts
│   └── places.ts
└── utils/
    ├── formatting.ts
    ├── validation.ts
    └── calculations.ts
```

### 2. Implement Consistent Naming Conventions

**Issue:** Naming patterns vary across files.

**Suggestion:** Standardize naming patterns:

- API functions: `fetch[Entity][Action]`
- UI components: PascalCase descriptive names
- Utility functions: camelCase verb-first names

## Testing and Validation

### 1. Add Unit Tests for Core Functionality

**Issue:** Limited test coverage for critical functionality.

**Suggestion:** Add tests for:

- Data formatting utilities
- Complex component logic
- API result transformations

### 2. Data Validation Utilities

**Issue:** Input validation is handled inconsistently.

**Suggestion:** Create validation utilities for common data types:

- Date parsing and validation
- Name formatting rules
- Relationship validation

## Summary

The above suggestions aim to:

1. Reduce code duplication
2. Improve type safety and reusability
3. Enhance component consistency
4. Optimize database operations
5. Improve code organization and maintainability

Implementing these changes incrementally will lead to a more maintainable, efficient, and developer-friendly codebase.
