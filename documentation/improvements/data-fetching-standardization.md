# Data Fetching Standardization and Optimization

This document outlines simple, practical improvements for data fetching patterns across the application. These suggestions focus on standardizing API functions and creating reusable data fetching hooks. Each suggestion includes what needs to be done, why it matters, how to implement it, and actionable tasks.

## 1. Create Utility Functions for Common API Operations

### What?

Create a set of utility functions that standardize interaction with the Supabase backend and provide consistent error handling and response formatting.

### Why?

Currently, each API function in `src/api/*.ts` directly imports and uses the Supabase client, resulting in:

- Inconsistent error handling approaches
- Duplicated query parameters logic
- Redundant type definitions
- No standardized response format

### How?

Implement a set of utility functions that wrap the Supabase client for common operations.

### Actionable Tasks

1. Create a new file: `src/lib/api-utils.ts`:

   ```typescript
   import { supabase } from "./supabase";
   import { PaginatedResponse } from "@/types/api";
   import { getPageRange } from "@/api/getPageRange";

   /**
    * Performs a paginated query with standardized error handling
    */
   export async function fetchPaginated<T>(
     tableName: string,
     page: number,
     options: {
       select?: string;
       filter?: { column: string; value: string; type?: "eq" | "ilike" };
       orderBy?: { column: string; ascending?: boolean };
     } = {},
   ): Promise<PaginatedResponse<T>> {
     const { start, end } = getPageRange(page);
     const { select, filter, orderBy } = options;

     let query = supabase
       .from(tableName)
       .select(select || "*", { count: "exact" });

     // Apply filter if provided
     if (filter) {
       if (filter.type === "ilike") {
         query = query.ilike(filter.column, `%${filter.value}%`);
       } else {
         query = query.eq(filter.column, filter.value);
       }
     }

     // Apply ordering if provided
     if (orderBy) {
       query = query.order(orderBy.column, { ascending: orderBy.ascending });
     }

     const { data, error, count } = await query.range(start, end);

     if (error) throw error;

     return {
       data: data as T[],
       total: count || 0,
       page,
       pageSize: 10,
       hasMore: (count || 0) > page * 10,
     };
   }

   /**
    * Fetches a single record by ID
    */
   export async function fetchById<T>(
     tableName: string,
     id: string,
     select?: string,
   ): Promise<T | null> {
     const { data, error } = await supabase
       .from(tableName)
       .select(select || "*")
       .eq("id", id)
       .single();

     if (error) {
       if (error.code === "PGRST116") return null; // Not found
       throw error;
     }

     return data as T;
   }
   ```

2. Update API functions to use these utilities (example with `fetchIndividuals`):

   ```typescript
   import { fetchPaginated } from "@/lib/api-utils";
   import { PaginatedResponse } from "@/types/api";
   import { IndividualWithNames } from "@/types/individual";

   /**
    * Fetches a paginated list of individuals from the database
    */
   export async function fetchIndividuals({
     page,
     query,
   }: {
     page: number;
     query: string;
   }): Promise<PaginatedResponse<IndividualWithNames>> {
     if (query) {
       return fetchIndividualsByName({ page, query });
     }

     return fetchPaginated<IndividualWithNames>("individuals", page, {
       select: "id, gender, names(first_name, last_name, is_primary)",
     });
   }
   ```

## 2. Create Simple Data Fetching Hooks

### What?

Create reusable React hooks for common data fetching patterns using TanStack Query.

### Why?

Currently, each component imports and configures `useQuery` directly, leading to:

- Duplicated loading and error handling logic
- Inconsistent configurations for caching and refetching
- Scattered query key definitions

### How?

Implement a set of basic hooks for each entity type.

### Actionable Tasks

1. Create a file for query keys: `src/hooks/query-keys.ts`:

   ```typescript
   /**
    * Simple query keys for caching and invalidation
    */
   export const queryKeys = {
     individuals: {
       all: ["individuals"],
       list: (page?: number, query?: string) => [
         ...queryKeys.individuals.all,
         "list",
         { page, query },
       ],
       detail: (id: string) => [...queryKeys.individuals.all, "detail", id],
     },
     families: {
       all: ["families"],
       list: (page?: number, query?: string) => [
         ...queryKeys.families.all,
         "list",
         { page, query },
       ],
       detail: (id: string) => [...queryKeys.families.all, "detail", id],
     },
     events: {
       all: ["events"],
       list: (page?: number, query?: string) => [
         ...queryKeys.events.all,
         "list",
         { page, query },
       ],
       detail: (id: string, type: string) => [
         ...queryKeys.events.all,
         "detail",
         type,
         id,
       ],
     },
     places: {
       all: ["places"],
       list: (page?: number, query?: string) => [
         ...queryKeys.places.all,
         "list",
         { page, query },
       ],
       detail: (id: string) => [...queryKeys.places.all, "detail", id],
     },
   };
   ```

2. Create hooks for individuals: `src/hooks/use-individuals.ts`:

   ```typescript
   import { useQuery } from "@tanstack/react-query";
   import { fetchIndividual, fetchIndividuals } from "@/api";
   import { queryKeys } from "./query-keys";

   /**
    * Hook for fetching a paginated list of individuals
    */
   export function useIndividualsList(page = 1, query = "") {
     return useQuery({
       queryKey: queryKeys.individuals.list(page, query),
       queryFn: () => fetchIndividuals({ page, query }),
       keepPreviousData: true,
     });
   }

   /**
    * Hook for fetching a single individual by ID
    */
   export function useIndividual(id) {
     return useQuery({
       queryKey: queryKeys.individuals.detail(id),
       queryFn: () => fetchIndividual(id),
       enabled: !!id,
     });
   }
   ```

3. Similarly create hooks for families, events, and places as needed.

4. Update components to use these hooks:

   ```tsx
   import { useIndividualsList } from "@/hooks/use-individuals";

   function IndividualsPage() {
     const [page, setPage] = useState(1);
     const [query, setQuery] = useState("");

     const { data, isLoading, error } = useIndividualsList(page, query);

     // Rest of component...
   }
   ```

## 3. Create Reusable Loading and Error Components

### What?

Create simple, reusable components for handling loading states and errors.

### Why?

Currently, loading and error states are handled inconsistently across components:

- Some components show loading indicators, others don't
- Error handling is inconsistent
- These patterns are duplicated in many components

### How?

Create a few simple components that can be reused across the application.

### Actionable Tasks

1. Create a simple loading component: `src/components/common/LoadingSpinner.tsx`:

   ```tsx
   import { Loader } from "lucide-react";

   export function LoadingSpinner({ className = "h-6 w-6" }) {
     return (
       <div className="flex justify-center items-center p-4">
         <Loader
           className={`animate-spin text-muted-foreground ${className}`}
         />
       </div>
     );
   }
   ```

2. Create a simple error component: `src/components/common/ErrorMessage.tsx`:

   ```tsx
   import { AlertCircle } from "lucide-react";

   export function ErrorMessage({
     message = "An error occurred. Please try again.",
     className = "",
   }) {
     return (
       <div
         className={`p-4 text-destructive flex items-center gap-2 ${className}`}
       >
         <AlertCircle className="h-4 w-4" />
         <span>{message}</span>
       </div>
     );
   }
   ```

3. Create a wrapper component for query results: `src/components/common/QueryResult.tsx`:

   ```tsx
   import { LoadingSpinner } from "./LoadingSpinner";
   import { ErrorMessage } from "./ErrorMessage";

   export function QueryResult({ data, isLoading, error, children }) {
     if (isLoading) return <LoadingSpinner />;

     if (error) return <ErrorMessage message={error.message} />;

     if (!data) return <div>No data available</div>;

     return children(data);
   }
   ```

4. Use these components in your pages:

   ```tsx
   import { QueryResult } from "@/components/common/QueryResult";
   import { useIndividualsList } from "@/hooks/use-individuals";

   function IndividualsPage() {
     const [page, setPage] = useState(1);
     const [query, setQuery] = useState("");

     const result = useIndividualsList(page, query);

     return (
       <QueryResult {...result}>
         {(data) => <div>{/* Your data display code here */}</div>}
       </QueryResult>
     );
   }
   ```

## Conclusion

These simplified improvements focus on the most important aspects of data fetching standardization without overengineering. By implementing these changes:

1. API functions will be more consistent and easier to maintain
2. Components will be cleaner, with data fetching logic extracted to hooks
3. Loading and error states will be handled consistently across the application

These changes provide a good foundation for the application without introducing unnecessary complexity or speculating on future needs. You can extend these patterns as needed when your application grows.
