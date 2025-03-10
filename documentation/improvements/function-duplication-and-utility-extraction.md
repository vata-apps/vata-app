# Function Duplication and Utility Extraction Improvements

This document outlines various areas of the codebase that can be improved, including duplicate functions, functions that can be extracted to utilities, and other optimization opportunities. Each suggestion includes what needs to be done, why it should be improved, how to implement the change, and actionable tasks for implementation.

## 1. Create a `string` Utility Module ✅ ([b06fbdd](https://github.com/stivaugoin/vata-app/commit/b06fbdd))

### What?

Create a centralized string utility module to eliminate duplicate string-related functions across the codebase.

### Why?

Currently, there are multiple implementations of the same `capitalize` function in different files:

- `src/pages/events/$eventId.tsx`
- `src/pages/places/index.tsx`
- `src/components/place/PlaceEvents.tsx`

This results in code duplication and makes maintenance harder. If there's a bug in the implementation or if we want to improve the function, we would need to change it in multiple places.

### How?

Create a new utility file dedicated to string operations that can be imported and used throughout the application.

### Actionable Tasks

1. Create a new file: `src/utils/strings.ts`
2. Add the `capitalize` function to this file:
   ```typescript
   /**
    * Capitalizes the first letter of each word in a string
    * @param str The string to capitalize
    * @returns The capitalized string
    */
   export function capitalize(str: string) {
     if (!str) return "";
     return str
       .split(" ")
       .map(
         (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
       )
       .join(" ");
   }
   ```
3. Replace all occurrences of the inline `capitalize` function in the codebase with imports from this utility file:
   - `src/pages/events/$eventId.tsx`
   - `src/pages/places/index.tsx`
   - `src/components/place/PlaceEvents.tsx`

## 2. Create a Date Formatting Utility ✅ ([d578c3c](https://github.com/stivaugoin/vata-app/commit/d578c3c))

### What?

Create a dedicated date formatting utility to standardize date handling across the application.

### Why?

There are duplicate `formatDate` functions in:

- `src/pages/events/$eventId.tsx`
- `src/pages/events/index.tsx`

Having consistent date formatting across the application improves user experience and simplifies maintenance.

### How?

Create a new utility file for date operations with a flexible `formatDate` function that can be imported and used throughout the application.

### Actionable Tasks

1. Create a new file: `src/utils/dates.ts`
2. Add the `formatDate` function to this file:

   ```typescript
   import { format, parseISO } from "date-fns";

   /**
    * Formats a date string for display
    * @param dateString The date string to format
    * @param formatString The format string to use (default: 'MMMM d, yyyy')
    * @returns The formatted date string or a default message if no date
    */
   export function formatDate(
     dateString: string | null,
     formatString = "MMMM d, yyyy",
   ) {
     if (!dateString) return "No date";
     try {
       return format(parseISO(dateString), formatString);
     } catch (error) {
       return "Invalid date";
     }
   }
   ```

3. Replace all occurrences of inline `formatDate` functions in the codebase with imports from this utility file:
   - `src/pages/events/$eventId.tsx`
   - `src/pages/events/index.tsx`

## 3. Create an Event Utility Module ✅ ([4ef42a0](https://github.com/stivaugoin/vata-app/commit/4ef42a0))

### What?

Create a centralized event utility module for event-related helper functions.

### Why?

There are similar implementations of `getEventTitle` in:

- `src/pages/events/$eventId.tsx`
- `src/pages/events/index.tsx`

Unifying these functions would ensure consistent display and behavior across the application.

### How?

Create a new utility file for event-related operations that handles logic specific to event data.

### Actionable Tasks

1. Create a new file: `src/utils/events.ts`
2. Add the `getEventTitle` function to this file:

   ```typescript
   import { displayName } from "./displayName";
   import { capitalize } from "./strings";

   type Event = {
     // Add the minimum required properties for this function to work
     // based on both implementations in the codebase
     eventType: "individual" | "family";
     individual_event_types?: { name: string };
     family_event_types?: { name: string };
     individuals?: {
       names: Array<{
         first_name: string | null;
         last_name: string | null;
         is_primary: boolean;
       }>;
     };
     families?: {
       husband?: {
         names: Array<{
           first_name: string | null;
           last_name: string | null;
           is_primary: boolean;
         }>;
       } | null;
       wife?: {
         names: Array<{
           first_name: string | null;
           last_name: string | null;
           is_primary: boolean;
         }>;
       } | null;
     };
   };

   /**
    * Gets a formatted title for an event
    * @param event The event object
    * @returns A formatted event title including the event type and individual/family names
    */
   export function getEventTitle(event: Event) {
     if (event.eventType === "individual") {
       const eventType = capitalize(
         event.individual_event_types?.name || "Event",
       );
       const personName = displayName(event.individuals?.names || []);
       return `${eventType} - ${personName}`;
     }

     const eventType = capitalize(event.family_event_types?.name || "Event");
     let familyName = "";

     if (event.families?.husband && event.families?.wife) {
       const husbandName = displayName(event.families.husband.names || []);
       const wifeName = displayName(event.families.wife.names || []);
       familyName = `${husbandName} & ${wifeName}`;
     } else if (event.families?.husband) {
       familyName = displayName(event.families.husband.names || []);
     } else if (event.families?.wife) {
       familyName = displayName(event.families.wife.names || []);
     }

     return `${eventType} - ${familyName}`;
   }
   ```

3. Replace all occurrences of inline `getEventTitle` functions in the codebase with imports from this utility file:
   - `src/pages/events/$eventId.tsx`
   - `src/pages/events/index.tsx`

## 4. Improve Error Handling in Utilities ✅ ([d6d6c92](https://github.com/stivaugoin/vata-app/commit/d6d6c92))

### What?

Add consistent error handling to utility functions.

### Why?

The current implementations of utility functions like `displayName` lack proper error handling for edge cases like nullish or undefined values, which could lead to runtime errors.

### How?

Update the existing utility functions to handle edge cases gracefully.

### Actionable Tasks

1. Update `src/utils/displayName.ts` with improved error handling:

   ```typescript
   import { Tables } from "@/database.types";

   /**
    * Generates a display name from either a single name record or an array of name records
    * @param names Single name record or array of name records from the names table
    * @param options Configuration options
    * @param options.part Specifies which part of the name to return: "first" for first name only, "last" for last name only, or "full" (default) for full name
    * @returns For array input: The specified part of the primary record's name (or first record if no primary exists)
    *          For single record: The specified part of the record's name
    *          Returns trimmed full name by default, or just first/last name if specified in options
    */
   export default function displayName(
     names:
       | Partial<Tables<"names">>[]
       | Partial<Tables<"names">>
       | null
       | undefined,
     options?: {
       part?: "first" | "last" | "full";
     },
   ) {
     // Handle null/undefined names
     if (!names) return "";

     if (Array.isArray(names)) {
       // Handle empty array
       if (names.length === 0) return "";

       const primaryName = names.find((name) => name.is_primary);
       const namesToUse = primaryName || names[0] || {};

       if (options?.part === "first") return namesToUse.first_name || "";
       if (options?.part === "last") return namesToUse.last_name || "";
       return `${namesToUse.first_name || ""} ${namesToUse.last_name || ""}`.trim();
     }

     if (options?.part === "first") return names.first_name || "";
     if (options?.part === "last") return names.last_name || "";
     return `${names.first_name || ""} ${names.last_name || ""}`.trim();
   }
   ```

## 5. Create a Navigation Utility

### What?

Create a utility for common pagination actions.

### Why?

There are several places in the codebase where pagination logic is duplicated, such as in `families/index.tsx`, `individuals/index.tsx`, `places/index.tsx`, and `events/index.tsx`.

### How?

Create a pagination utility with a reusable pagination component or hook.

### Actionable Tasks

1. Create a new file: `src/utils/navigation.ts`
2. Add a pagination helper function:

   ```typescript
   /**
    * Creates pagination parameters with validation
    * @param page The current page number
    * @param totalPages The total number of pages
    * @returns An object with pagination details and navigation functions
    */
   export function usePagination(page: number, totalPages: number) {
     // Ensure page is within bounds
     const currentPage = Math.max(1, Math.min(page, Math.max(1, totalPages)));

     return {
       currentPage,
       totalPages,
       hasPreviousPage: currentPage > 1,
       hasNextPage: currentPage < totalPages,
       firstPage: () => 1,
       previousPage: () => Math.max(1, currentPage - 1),
       nextPage: () => Math.min(totalPages, currentPage + 1),
       lastPage: () => totalPages,
     };
   }
   ```

3. Create a reusable pagination component in `src/components/Pagination.tsx`:

   ```typescript
   import { Button } from "@/components/ui/button";
   import {
     ChevronLeft,
     ChevronRight,
     ChevronsLeft,
     ChevronsRight
   } from "lucide-react";

   interface PaginationProps {
     currentPage: number;
     totalPages: number;
     onPageChange: (page: number) => void;
   }

   export function Pagination({
     currentPage,
     totalPages,
     onPageChange,
   }: PaginationProps) {
     if (totalPages <= 1) return null;

     return (
       <div className="flex items-center justify-between">
         <div className="text-sm text-muted-foreground">
           Page {currentPage} of {totalPages}
         </div>
         <div className="flex items-center gap-1">
           <Button
             variant="outline"
             size="sm"
             onClick={() => onPageChange(1)}
             disabled={currentPage === 1}
           >
             <ChevronsLeft className="h-4 w-4" />
           </Button>
           <Button
             variant="outline"
             size="sm"
             onClick={() => onPageChange(currentPage - 1)}
             disabled={currentPage === 1}
           >
             <ChevronLeft className="h-4 w-4" />
           </Button>
           <Button
             variant="outline"
             size="sm"
             onClick={() => onPageChange(currentPage + 1)}
             disabled={currentPage === totalPages}
           >
             <ChevronRight className="h-4 w-4" />
           </Button>
           <Button
             variant="outline"
             size="sm"
             onClick={() => onPageChange(totalPages)}
             disabled={currentPage === totalPages}
           >
             <ChevronsRight className="h-4 w-4" />
           </Button>
         </div>
       </div>
     );
   }
   ```

4. Update all pages with pagination to use this new component.

## 6. Create a Search Utility

### What?

Create a reusable search component to standardize search functionality.

### Why?

Search functionality is duplicated across several index pages, with similar `handleSearch` functions in:

- `families/index.tsx`
- `individuals/index.tsx`
- `places/index.tsx`
- `events/index.tsx`

### How?

Create a reusable search component and custom hook for search functionality.

### Actionable Tasks

1. Create a new file: `src/utils/search.ts`
2. Add a search hook:

   ```typescript
   import { useState, useEffect, ChangeEvent } from "react";

   /**
    * Custom hook for handling search functionality with debounce
    * @param initialValue The initial search value
    * @param delay The debounce delay in milliseconds
    * @returns An object with search state and handlers
    */
   export function useSearch(initialValue = "", delay = 300) {
     const [inputValue, setInputValue] = useState(initialValue);
     const [searchValue, setSearchValue] = useState(initialValue);

     useEffect(() => {
       const handler = setTimeout(() => {
         setSearchValue(inputValue);
       }, delay);

       return () => {
         clearTimeout(handler);
       };
     }, [inputValue, delay]);

     const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
       setInputValue(e.target.value);
     };

     const clearSearch = () => {
       setInputValue("");
       setSearchValue("");
     };

     return {
       inputValue,
       searchValue,
       handleInputChange,
       clearSearch,
     };
   }
   ```

3. Create a reusable search component in `src/components/ui/SearchInput.tsx`:

   ```typescript
   import { Input } from "@/components/ui/input";
   import { Button } from "@/components/ui/button";
   import { Search, X } from "lucide-react";
   import { ChangeEvent } from "react";

   interface SearchInputProps {
     value: string;
     onChange: (e: ChangeEvent<HTMLInputElement>) => void;
     onClear: () => void;
     placeholder?: string;
   }

   export function SearchInput({
     value,
     onChange,
     onClear,
     placeholder = "Search...",
   }: SearchInputProps) {
     return (
       <div className="relative">
         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
         <Input
           type="search"
           placeholder={placeholder}
           value={value}
           onChange={onChange}
           className="w-full bg-background pl-8 pr-10"
         />
         {value && (
           <Button
             variant="ghost"
             size="sm"
             className="absolute right-0 top-0 h-9 w-9 p-0"
             onClick={onClear}
           >
             <X className="h-4 w-4" />
           </Button>
         )}
       </div>
     );
   }
   ```

4. Update all pages with search functionality to use these new components.

## Conclusion

Implementing these suggestions will improve code maintainability, reduce duplication, and provide a more consistent user experience. These tasks are well-suited for a junior developer as they focus on clear patterns for refactoring and centralization of common functionality.

Each task has a specific scope and purpose, making it easy to track progress and validate improvements. After implementing these changes, the codebase will be more robust, easier to maintain, and better structured for future development.
