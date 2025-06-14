// Centralized type definitions
export type {
  IndividualWithNames,
  IndividualWithNamesVariant,
  IndividualWithRelations,
  Name,
} from "./individual";

export type { FamilyWithRelations } from "./family";

export type {
  Event,
  EventIndividual,
  EventParticipant,
  EventParticipantRow,
  EventRoleRow,
  EventRow,
  EventSubjectRow,
  EventTypeRow,
} from "./event";

export type { PlaceWithType, PlaceWithTypeSimple } from "./place";

// API response types
export type {
  ErrorResponse,
  PaginatedResponse,
  SingleResponse,
  toPaginatedResponse,
  toSingleResponse,
} from "./api";

// Utility types
export type {
  DatabaseRecord,
  ExtractFields,
  Insert,
  PartialExcept,
  Row,
  Update,
  PaginatedResponse as UtilsPaginatedResponse,
  SingleResponse as UtilsSingleResponse,
  WithPagination,
  WithParent,
  WithRelation,
  WithType,
} from "./utils";

// Type guard functions
export {
  getEventParticipants,
  getEventSubjects,
  isFamilyEvent,
  isIndividualEvent,
} from "./guards";

// Re-export sorting types
export type {
  EventSortField,
  FamilySortField,
  IndividualSortField,
  PlaceSortField,
  SortConfig,
  SortDirection,
} from "./sort";
