# TypeScript Type Definition Standardization

This document outlines opportunities to improve and standardize TypeScript type definitions across the codebase. These suggestions focus on reducing duplication, creating a more consistent type system, and improving type safety. Each suggestion includes what needs to be done, why it matters, how to implement it, and actionable tasks.

## Progress Status

- ✅ **Partially Complete**: Basic types directory exists with sorting utilities
- ❌ **Still Needed**: Centralized entity type definitions
- ❌ **Still Needed**: Type utilities and database type standardization
- ❌ **Still Needed**: Type guard functions
- ✅ **Partially Complete**: Some API response patterns exist but need standardization

## 1. Create Centralized Type Definitions

### What?

Create a centralized type system with shared type definitions for common entities (Individual, Family, Event, Place).

### Why?

Currently, there are duplicate and inconsistent type definitions for the same entities across different files:

- `IndividualWithNames` is defined in **at least 8 places**:

  - `src/components/family/types.ts`
  - `src/api/fetchEvents.ts`
  - `src/pages/individuals/index.tsx`
  - `src/api/fetchFamilyAsChild.ts`
  - `src/api/fetchFamiliesAsSpouse.ts`
  - `src/components/individual/FamilyMember.tsx`
  - `src/components/individual/IndividualHeader.tsx`
  - `src/components/individual/Names.tsx`

- `FamilyWithRelations` is defined in **at least 7 places**:

  - `src/components/family/types.ts`
  - `src/api/fetchFamily.ts`
  - `src/api/fetchFamilies.ts`
  - `src/api/fetchFamiliesAsSpouse.ts`
  - `src/api/fetchFamilyAsChild.ts`
  - `src/components/individual/FamilyAsChildTable.tsx`
  - `src/components/individual/FamilyAsSpouseTable.tsx`

- Event types (`EventBase`, `IndividualEvent`, `FamilyEvent`) are duplicated in **at least 4 places**:
  - `src/pages/events/$eventId.tsx`
  - `src/components/event/EventHeader.tsx`
  - `src/components/place/PlaceEvents.tsx`
  - `src/utils/events.ts`

This duplication makes maintenance difficult and can lead to inconsistencies. When changes are needed, they must be applied in multiple places.

### How?

Create a centralized type definition file for each major entity and have all components import from these files.

### Current State

Currently, only `src/types/sort.ts` exists with basic sorting types. No centralized entity types are implemented.

### Actionable Tasks

1. **Create entity-specific type files:**

   - `src/types/individual.ts`:

   ```typescript
   import { Enums, Tables } from "@/database.types";

   /**
    * Base type for name information
    */
   export type Name = Pick<
     Tables<"names">,
     "first_name" | "last_name" | "is_primary"
   >;

   /**
    * Individual with associated names (most common pattern)
    */
   export type IndividualWithNames = {
     id: string;
     gender: Enums<"gender">;
     names: Name[];
   };

   /**
    * Extended individual with full family relationships
    */
   export type IndividualWithRelations = {
     id: string;
     gender: Tables<"individuals">["gender"];
     names: Tables<"names">[];
     family_as_child: {
       family: {
         husband: IndividualWithNames | null;
         wife: IndividualWithNames | null;
         children: {
           individual: {
             id: string;
           };
         }[];
       } | null;
     }[];
     families_as_spouse: {
       children: {
         individual: {
           id: string;
         };
       }[];
     }[];
   };
   ```

   - `src/types/family.ts`:

   ```typescript
   import { Tables } from "@/database.types";
   import { IndividualWithNames } from "./individual";

   /**
    * Family with relationships to individuals
    */
   export type FamilyWithRelations = {
     id: string;
     husband: IndividualWithNames | null;
     wife: IndividualWithNames | null;
     children: {
       individual: IndividualWithNames;
     }[];
     type: Tables<"families">["type"];
   };
   ```

   - `src/types/event.ts`:

   ```typescript
   import { Enums } from "@/database.types";

   /**
    * Base properties for all event types
    */
   export type EventBase = {
     id: string;
     date: string | null;
     description: string | null;
     place_id: string | null;
     places?: {
       id: string;
       name: string;
       latitude?: number | null;
       longitude?: number | null;
     } | null;
     eventType: "individual" | "family";
   };

   /**
    * Event related to an individual
    */
   export type IndividualEvent = EventBase & {
     eventType: "individual";
     individual_id: string;
     individuals: {
       id: string;
       gender: Enums<"gender">;
       names: Array<{
         first_name: string | null;
         last_name: string | null;
         is_primary: boolean;
       }>;
     };
     individual_event_types: { id: string; name: string };
   };

   /**
    * Event related to a family
    */
   export type FamilyEvent = EventBase & {
     eventType: "family";
     family_id: string;
     families: {
       id: string;
       husband_id: string | null;
       wife_id: string | null;
       husband?: {
         id: string;
         gender: Enums<"gender">;
         names: Array<{
           first_name: string | null;
           last_name: string | null;
           is_primary: boolean;
         }>;
       } | null;
       wife?: {
         id: string;
         gender: Enums<"gender">;
         names: Array<{
           first_name: string | null;
           last_name: string | null;
           is_primary: boolean;
         }>;
       } | null;
     };
     family_event_types: { id: string; name: string };
   };

   /**
    * Union type for all event types
    */
   export type Event = IndividualEvent | FamilyEvent;
   ```

   - `src/types/place.ts`:

   ```typescript
   import { Tables } from "@/database.types";

   /**
    * Place with type information - matches current API usage
    */
   export type PlaceWithType = Tables<"places"> & {
     place_type: Pick<Tables<"place_types">, "name">;
     parent?: Pick<Tables<"places">, "name"> | null;
   };
   ```

2. **Replace duplicate type definitions** - Update these files to import from centralized types:
   - All files listed in the "Why?" section above
   - Start with the most frequently used types (`IndividualWithNames`, `FamilyWithRelations`)

## 2. Create Type Utilities

### What?

Create utility types to handle common type transformations and database relationships consistently.

### Why?

The codebase contains many similar type patterns that could be abstracted to improve consistency and maintainability. Many components need to extract specific fields from database types or handle relationships in a consistent way.

### Current State

No utility types exist beyond the basic sorting types in `src/types/sort.ts`.

### How?

Create a set of utility types that can be used to derive specific type shapes from the base database types.

### Actionable Tasks

1. Create a new file: `src/types/utils.ts`:

   ```typescript
   import { Tables, Enums } from "@/database.types";

   /**
    * Creates a type with only the specified keys from T
    */
   export type ExtractFields<T, K extends keyof T> = Pick<T, K>;

   /**
    * Converts a database table type to a more specific shape
    * with customized nested fields
    */
   export type WithRelation<T, K extends string, R> = T & {
     [P in K]: R;
   };

   /**
    * Utility for working with database response types
    */
   export type DatabaseRecord<TableName extends keyof Tables> =
     Tables<TableName>["Row"];

   /**
    * Utility for common response patterns
    */
   export type WithPagination<T> = {
     data: T[];
     total: number;
     page: number;
     itemsPerPage: number;
   };
   ```

2. Use these utility types in place of repetitive type patterns.

## 3. Standardize Database Type Usage

### What?

Create a consistent approach to using database types from the generated `database.types.ts` file.

### Why?

The codebase uses different patterns to access database types:

- Most files use `Tables<"tableName">` (✅ **Good**)
- Some still use `Database["public"]["Tables"]["tableName"]["Row"]` (❌ **Inconsistent**)

**Files still using old pattern:**

- `src/api/fetchNames.ts`
- `src/api/fetchIndividual.ts`
- `src/api/fetchPlaces.ts`
- `src/api/fetchPlaceById.ts`

This inconsistency makes it harder to understand and maintain the type system.

### How?

Standardize on a consistent pattern for database type access and augmentation.

### Actionable Tasks

1. Update the utility types file with standardized database type patterns:

   ```typescript
   import { Database, Tables, Enums } from "@/database.types";

   /**
    * Type alias for database table row
    */
   export type Row<T extends keyof Tables> = Tables<T>["Row"];

   /**
    * Type alias for database table insert
    */
   export type Insert<T extends keyof Tables> = Tables<T>["Insert"];

   /**
    * Type alias for database table update
    */
   export type Update<T extends keyof Tables> = Tables<T>["Update"];
   ```

2. **Update these specific files** to use `Tables<"tableName">` instead of the old pattern:
   - `src/api/fetchNames.ts` - Replace `Database["public"]["Tables"]["names"]["Row"]` with `Tables<"names">`
   - `src/api/fetchIndividual.ts` - Replace all `Database["public"]["Tables"]["x"]["Row"]` patterns
   - `src/api/fetchPlaces.ts` - Replace `Database["public"]["Tables"]["places"]["Row"]`
   - `src/api/fetchPlaceById.ts` - Replace database type patterns

## 4. Type Guard Functions

### What?

Create type guard functions for discriminated union types like `Event`.

### Why?

The codebase uses discriminated unions (like `Event = IndividualEvent | FamilyEvent`), but lacks proper type guards to safely narrow these types. Current code uses direct property checking like `event.eventType === "individual"` which works but could be centralized for consistency.

### Current State

No type guard functions exist. Direct property checking is used in multiple places.

### How?

Create type guard functions for union types to improve type safety.

### Actionable Tasks

1. Create a new file: `src/types/guards.ts`:

   ```typescript
   import { Event, IndividualEvent, FamilyEvent } from "./event";

   /**
    * Type guard to check if an event is an individual event
    */
   export function isIndividualEvent(event: Event): event is IndividualEvent {
     return event.eventType === "individual";
   }

   /**
    * Type guard to check if an event is a family event
    */
   export function isFamilyEvent(event: Event): event is FamilyEvent {
     return event.eventType === "family";
   }
   ```

2. **Update these components** to use type guards instead of direct property checking:
   - `src/pages/events/$eventId.tsx` - Replace `event.eventType === "individual"` checks
   - `src/components/event/EventHeader.tsx` - Replace property checks
   - `src/components/place/PlaceEvents.tsx` - Replace property checks
   - `src/utils/events.ts` - Update `getEventTitle` function

## 5. API Response Types

### What?

Create standardized types for API responses.

### Why?

The current API functions have inconsistent return types. Some patterns exist but aren't standardized:

**Current patterns:**

- `{ data: T[], total: number }` (used in `fetchFamilies`, `fetchIndividuals`)
- `{ data: T[], totalCount: number }` (used in `fetchEvents`)
- Direct return of data (used in some fetch functions)

### Current State

✅ **Partially implemented**: Some APIs use pagination patterns
❌ **Still needed**: Standardized response types and utilities

### How?

Create standardized response types for API calls.

### Actionable Tasks

1. Create a new file: `src/types/api.ts`:

   ```typescript
   import {
     PostgrestSingleResponse,
     PostgrestResponse,
   } from "@supabase/supabase-js";

   /**
    * Standard paginated response type
    */
   export interface PaginatedResponse<T> {
     data: T[];
     total: number;
     page: number;
     pageSize: number;
     hasMore: boolean;
   }

   /**
    * Standard response for single items
    */
   export interface SingleResponse<T> {
     data: T;
   }

   /**
    * Converter for Postgrest responses to our standard format
    */
   export function toPaginatedResponse<T>(
     response: PostgrestResponse<T>,
     page: number,
     pageSize: number,
   ): PaginatedResponse<T> {
     return {
       data: response.data || [],
       total: response.count || 0,
       page,
       pageSize,
       hasMore: (response.count || 0) > page * pageSize,
     };
   }
   ```

2. **Update these API functions** to use standardized response types:
   - `src/api/fetchEvents.ts` - Change `totalCount` to `total` to match other APIs
   - Create wrapper functions for single-item APIs to return standardized responses
   - Update any remaining APIs to use consistent pagination patterns

## Implementation Priority

### High Priority (Immediate Impact)

1. **Create centralized `IndividualWithNames` and `FamilyWithRelations` types** - These are used most frequently
2. **Fix database type inconsistencies** - Update the 4 files still using old patterns
3. **Standardize API response property names** - Fix `totalCount` vs `total` inconsistency

### Medium Priority (Consistency)

1. **Create event types and type guards** - Improve event handling consistency
2. **Create utility types** - Reduce repetitive patterns

### Low Priority (Enhancement)

1. **Create place types** - Less frequently used
2. **Add API response utilities** - Nice to have but not critical

## Conclusion

While some progress has been made with basic type organization, the majority of the TypeScript type standardization improvements are still needed. The highest impact will come from centralizing the most frequently duplicated types (`IndividualWithNames`, `FamilyWithRelations`) and fixing the database type access inconsistencies.

These improvements will enhance code maintainability, reduce duplication, and provide better type safety across the application. Type errors will be caught earlier in the development process, and code that accesses shared entities will be more predictable.
