import type { EventCategory } from '$types/database';
import type { IndividualsPageFilters, IndividualsSortColumn } from '$db-tree/individuals';
import type { FamiliesPageFilters, FamiliesSortColumn } from '$db-tree/families';
import type { EventsPageFilters } from '$db-tree/events';

export const queryKeys = {
  trees: ['trees'] as const,
  tree: (id: string) => ['trees', id] as const,
  treeDebugData: (treeId: string) => ['trees', treeId, 'debug'] as const,
  systemDebugData: ['debug', 'system'] as const,
  treeFiles: ['debug', 'treeFiles'] as const,
  individuals: ['individuals'] as const,
  individual: (id: string) => ['individuals', id] as const,
  individualSearch: (query: string) => ['individuals', 'search', query] as const,
  /** One cache entry per distinct filter/sort combination — pagination itself lives inside the infinite query, not the key. */
  individualsPage: (query: {
    filters: IndividualsPageFilters;
    sortColumn: IndividualsSortColumn;
    sortDirection: 'asc' | 'desc';
  }) => ['individuals', 'page', query] as const,
  families: ['families'] as const,
  family: (id: string) => ['families', id] as const,
  familiesPage: (query: {
    filters: FamiliesPageFilters;
    sortColumn: FamiliesSortColumn;
    sortDirection: 'asc' | 'desc';
  }) => ['families', 'page', query] as const,
  events: ['events'] as const,
  event: (id: string) => ['events', id] as const,
  eventsPage: (query: { filters: EventsPageFilters }) => ['events', 'page', query] as const,
  eventFilterOptions: ['events', 'filterOptions'] as const,
  /** Category-keyed — `undefined` (all types) and `'individual'`/`'family'` are distinct cache entries, since callers deliberately ask for different subsets. `['eventTypes']` alone still prefix-invalidates every variant. */
  eventTypes: (category?: EventCategory) => ['eventTypes', category ?? 'all'] as const,
  places: ['places'] as const,
  place: (id: string) => ['places', id] as const,
  placeTypes: ['placeTypes'] as const,
  sources: ['sources'] as const,
  source: (id: string) => ['sources', id] as const,
  repositories: ['repositories'] as const,
  repository: (id: string) => ['repositories', id] as const,
  citations: (sourceId: string) => ['citations', sourceId] as const,
  citationsWithDetails: (sourceId: string) => ['citationsWithDetails', sourceId] as const,
  files: (sourceId: string) => ['files', sourceId] as const,
  eventTimeline: (individualId: string) => ['eventTimeline', individualId] as const,
  personOverview: (individualId: string) => ['personOverview', individualId] as const,
  personEvents: (individualId: string) => ['personEvents', individualId] as const,
  personNames: (individualId: string) => ['personNames', individualId] as const,
  nameCitations: (nameId: string) => ['nameCitations', nameId] as const,
  eventCitations: (eventId: string) => ['eventCitations', eventId] as const,
  eventParticipants: (eventId: string) => ['eventParticipants', eventId] as const,
  personRelations: (individualId: string) => ['personRelations', individualId] as const,
  relationCitations: (familyId: string) => ['relationCitations', familyId] as const,
  personNotes: (individualId: string) => ['personNotes', individualId] as const,
  eventNoteCounts: ['eventNoteCount'] as const,
  eventNoteCount: (eventId: string) => ['eventNoteCount', eventId] as const,
  relationNoteCounts: ['relationNoteCount'] as const,
  relationNoteCount: (familyMemberId: string) => ['relationNoteCount', familyMemberId] as const,
  ancestors: (individualId: string) => ['ancestors', individualId] as const,
  parentFamily: (individualId: string) => ['parentFamily', individualId] as const,
  spouseFamilies: (individualId: string) => ['spouseFamilies', individualId] as const,
  livingCount: (treeId: string) => ['gedcom', 'livingCount', treeId] as const,
};
