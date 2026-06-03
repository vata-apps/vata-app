# Family View Screen

## Purpose

Display and manage a family unit — spouses (husband/wife), children, and family events (marriage, divorce, etc.). It renders full-width and owns its own panels.

## Domain rules

- **Pedigree types** — each child is linked with a pedigree: birth, adopted, foster, or step. Defaults to `birth`.
- **Same person as both spouses → validation error** — a family's two spouses must be different people.
- **A family can exist with no spouses initially** — both spouse slots may be empty when the family is created.
- **Two families with the same spouses are distinct records** — a remarriage of the same couple is a separate family, not a duplicate.
- **Delete-family cascade** — deleting a family unlinks its members (spouses and children keep their person records) and CASCADE-deletes the family's own events.

## Implementation

`src/pages/FamilyViewPage.tsx`.
