// Centralized type definitions
export type {
  IndividualWithNames,
  IndividualWithNamesVariant,
  IndividualWithRelations,
  Name,
} from "./individual";

export type { FamilyWithRelations } from "./family";

export type { Event, EventBase, FamilyEvent, IndividualEvent } from "./event";

export type { PlaceWithType } from "./place";

// Re-export sorting types
export type {
  EventSortField,
  FamilySortField,
  IndividualSortField,
  PlaceSortField,
  SortConfig,
  SortDirection,
} from "./sort";
