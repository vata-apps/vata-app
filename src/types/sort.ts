export type SortDirection = "asc" | "desc";

export type IndividualSortField = "first_name" | "last_name";
export type PlaceSortField = "name" | "type";
export type EventSortField = "date" | "place";
export type FamilySortField =
  | "husband_first_name"
  | "husband_last_name"
  | "wife_first_name"
  | "wife_last_name";

export type SortConfig<TField extends string = IndividualSortField> = {
  field: TField;
  direction: SortDirection;
} | null;
