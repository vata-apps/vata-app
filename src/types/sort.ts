export type SortDirection = "asc" | "desc";

export type SortField = "first_name" | "last_name";

export type SortConfig = {
  field: SortField;
  direction: SortDirection;
} | null;
