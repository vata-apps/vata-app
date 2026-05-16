# Data Flow

## General Principle

The app follows a unidirectional flow with clear separation of responsibilities. Every read and write travels the same path:

```mermaid
graph LR
    UIEvent["UI<br/>(Event)"] --> Hook["Hook<br/>(Query / Mutation)"]
    Hook --> Manager["Manager<br/>(Logic)"]
    Manager --> DB["DB<br/>(SQL)"]
    Hook --> Cache["Cache<br/>(TanStack Query)"]
    DB --> Cache
    Cache --> UIRender["UI<br/>(Render)"]
```

- **UI** renders cache state and dispatches events; it never calls a Manager or the DB directly.
- **Hooks** wrap Managers in TanStack Query (`useQuery` / `useMutation`), own the cache, and expose loading/error state.
- **Managers** hold business logic — validation, multi-entity orchestration, transactions. No React dependency. Code in `src/managers/`.
- **DB layer** is the only code that runs SQL. Code in `src/db/`.

Hooks live in `src/hooks/`.

## Read Flow (Query)

A read checks the TanStack Query cache first; only a cache miss or stale entry reaches the Manager and DB.

```mermaid
sequenceDiagram
    participant User
    participant UI as UI Component
    participant Hook
    participant Manager
    participant Database

    User->>UI: view
    UI->>Hook: useIndividual()
    Note over Hook: Check cache (queryKey)<br/>queryKeys.individual('123')
    alt CACHE HIT
        Hook-->>UI: {data, isLoading: false}
    else CACHE MISS or STALE
        Hook->>Manager: getById('123')
        Manager->>Database: SELECT...
        Database-->>Manager: {row}
        Manager-->>Hook: {individual}
        Hook-->>UI: {data}
    end
    UI-->>User: render
```

## Write Flow (Mutation)

A write goes through Manager validation, runs inside a DB transaction, then invalidates the affected cache keys so dependent views re-render automatically.

```mermaid
sequenceDiagram
    participant User
    participant UI as UI Component
    participant Hook
    participant Manager
    participant Database

    User->>UI: submit
    UI->>Hook: mutation.mutate(data)
    Hook->>Manager: create(data)
    Note over Manager: Validate data<br/>• Required fields<br/>• Format validation
    Manager->>Database: BEGIN TX
    Manager->>Database: INSERT...
    Database-->>Manager: {lastInsertId}
    Note over Manager: formatEntityId('I', lastInsertId)
    Manager->>Database: INSERT name...
    Manager->>Database: COMMIT
    Manager-->>Hook: {newId}
    Note over Hook: onSuccess:<br/>• invalidateQueries(...)<br/>• Show success notification
    Hook-->>UI: {success}
    UI-->>User: toast
    Note over UI: Auto re-render with<br/>new data from cache
```

## Cache Keys

All TanStack Query keys are centralized in the `queryKeys` object (`src/lib/query-keys.ts`) — **never hardcode a key** in a hook or an `invalidateQueries` call. Invalidation is targeted: a mutation invalidates the specific entity key plus any list/related keys it can affect (e.g. deleting a person also invalidates families).

## Global State

Client-only UI state (current tree, theme, locale, recent trees) lives in the Zustand store, persisted to localStorage. It is distinct from server state, which TanStack Query owns. Components should select narrow slices of the store to avoid needless re-renders.

## Error Handling

Errors are handled at the layer that can act on them:

- **Validation errors** are raised by the Manager and surfaced as inline form-field feedback.
- **Database errors** are surfaced as a toast notification.
- **Render errors** are caught by a React error boundary, which shows a fallback with a retry.

This keeps each failure mode visible where the user can respond to it.
