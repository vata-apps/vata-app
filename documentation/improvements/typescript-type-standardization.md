# TypeScript Type Definition Standardization

This document outlines opportunities to improve and standardize TypeScript type definitions across the codebase. These suggestions focus on reducing duplication, creating a more consistent type system, and improving type safety. Each suggestion includes what needs to be done, why it matters, how to implement it, and actionable tasks.

## 1. Create Centralized Type Definitions

### What?

Create a centralized type system with shared type definitions for common entities (Individual, Family, Event, Place).

### Why?

Currently, there are duplicate and inconsistent type definitions for the same entities across different files:

- `IndividualWithNames` is defined in at least four places:

  - `src/components/family/types.ts`
  - `src/api/fetchFamiliesAsSpouse.ts`
  - `src/api/fetchFamilyAsChild.ts`
  - `src/components/individual/FamilyMember.tsx`

- `FamilyWithRelations` is defined in at least five places:

  - `src/components/family/types.ts`
  - `src/api/fetchFamily.ts`
  - `src/api/fetchFamilies.ts`
  - `src/api/fetchFamiliesAsSpouse.ts`
  - `src/components/individual/FamilyTable.tsx`

- Event types (`EventBase`, `IndividualEvent`, `FamilyEvent`) are duplicated in:
  - `src/pages/events/$eventId.tsx`
  - `src/pages/events/index.tsx`
  - `src/components/place/PlaceEvents.tsx`

This duplication makes maintenance difficult and can lead to inconsistencies. When changes are needed, they must be applied in multiple places.

### How?

Create a centralized type definition file for each major entity and have all components import from these files.

### Actionable Tasks

1. Create a new directory: `src/types`

2. Create entity-specific type files:

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
    * Individual with associated names
    */
   export type IndividualWithNames = {
     id: string;
     gender: Enums<"gender">;
     names: Name[] | Name;
   };

   /**
    * Extended individual with more relationships
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
    * Recursive type for place parent hierarchy
    */
   export type ParentPlace = {
     id: string;
     name: string;
     parent: ParentPlace | null;
   };

   /**
    * Place with type information
    */
   export type PlaceWithType = Tables<"places">["Row"] & {
     type: Tables<"place_types">["Row"];
     parent?: ParentPlace | null;
   };
   ```

3. Replace all instances of duplicate types with imports from the centralized type definitions.

## 2. Create Type Utilities

### What?

Create utility types to handle common type transformations and database relationships consistently.

### Why?

The codebase contains many similar type patterns that could be abstracted to improve consistency and maintainability. Many components need to extract specific fields from database types or handle relationships in a consistent way.

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

- Some files use `Tables<"tableName">` directly
- Some use `Database["public"]["Tables"]["tableName"]["Row"]`
- Some define custom types that mirror the database schema

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

2. Update component and API files to use these standardized type patterns.

## 4. Type Guard Functions

### What?

Create type guard functions for discriminated union types like `Event`.

### Why?

The codebase uses discriminated unions (like `Event = IndividualEvent | FamilyEvent`), but lacks proper type guards to safely narrow these types. This can lead to type casting or potential runtime errors.

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

2. Update components that work with union types to use these type guards:

   ```typescript
   import { Event } from "@/types/event";
   import { isIndividualEvent, isFamilyEvent } from "@/types/guards";

   function getEventTitle(event: Event) {
     if (isIndividualEvent(event)) {
       return `${event.individual_event_types.name} - ${getIndividualName(event.individuals)}`;
     } else if (isFamilyEvent(event)) {
       return `${event.family_event_types.name} - ${getFamilyName(event.families)}`;
     }
     return "Unknown Event";
   }
   ```

## 5. API Response Types

### What?

Create standardized types for API responses.

### Why?

The current API functions have inconsistent return types, sometimes using raw database types, sometimes wrapping in custom response objects. This inconsistency makes it harder to work with API responses.

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

2. Update API functions to use these standardized response types.

## Conclusion

Implementing these TypeScript type standardization improvements will enhance code maintainability, reduce duplication, and provide better type safety across the application. These tasks are suitable for developers looking to improve the type system architecture.

By creating a centralized, consistent type system, the codebase will become more robust against errors and easier to maintain as the application grows. Type errors will be caught earlier in the development process, and code that accesses shared entities will be more predictable.
