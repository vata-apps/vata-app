export type SortDirection = "asc" | "desc";

export type IndividualSortField = "first_name" | "last_name";
export type PlaceSortField = "name";

export type SortConfig<TField extends string = IndividualSortField> = {
  field: TField;
  direction: SortDirection;
} | null;
