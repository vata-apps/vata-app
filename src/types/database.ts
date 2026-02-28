// =============================================================================
// Tree (system.db)
// =============================================================================

export interface Tree {
  id: string;
  name: string;
  filename: string;
  description: string | null;
  individualCount: number;
  familyCount: number;
  lastOpenedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTreeInput {
  name: string;
  filename: string;
  description?: string;
}

export interface UpdateTreeInput {
  name?: string;
  description?: string;
}

// =============================================================================
// Individual
// =============================================================================

export type Gender = 'M' | 'F' | 'U';

export interface Individual {
  id: string;
  gender: Gender;
  isLiving: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIndividualInput {
  gender?: Gender;
  isLiving?: boolean;
  notes?: string;
}

export interface UpdateIndividualInput {
  gender?: Gender;
  isLiving?: boolean;
  notes?: string;
}

// =============================================================================
// Name
// =============================================================================

export type NameType =
  | 'birth'
  | 'married'
  | 'adopted'
  | 'aka'
  | 'immigrant'
  | 'religious'
  | 'other';

export interface Name {
  id: string;
  individualId: string;
  type: NameType;
  prefix: string | null;
  givenNames: string | null;
  surname: string | null;
  suffix: string | null;
  nickname: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNameInput {
  individualId: string;
  type?: NameType;
  prefix?: string;
  givenNames?: string;
  surname?: string;
  suffix?: string;
  nickname?: string;
  isPrimary?: boolean;
}

export interface UpdateNameInput {
  type?: NameType;
  prefix?: string;
  givenNames?: string;
  surname?: string;
  suffix?: string;
  nickname?: string;
  isPrimary?: boolean;
}

export interface NameDisplay {
  full: string;
  short: string;
  sortable: string;
}

// =============================================================================
// Family
// =============================================================================

export interface Family {
  id: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFamilyInput {
  notes?: string;
}

export interface UpdateFamilyInput {
  notes?: string;
}

// =============================================================================
// Family Member
// =============================================================================

export type FamilyRole = 'husband' | 'wife' | 'child';
export type Pedigree = 'birth' | 'adopted' | 'foster' | 'sealing' | 'step';

export interface FamilyMember {
  id: string;
  familyId: string;
  individualId: string;
  role: FamilyRole;
  pedigree: Pedigree | null;
  sortOrder: number;
  createdAt: string;
}

export interface CreateFamilyMemberInput {
  familyId: string;
  individualId: string;
  role: FamilyRole;
  pedigree?: Pedigree;
  sortOrder?: number;
}

// =============================================================================
// Place Type
// =============================================================================

export interface PlaceType {
  id: string;
  tag: string | null;
  isSystem: boolean;
  customName: string | null;
  sortOrder: number;
}

export interface CreatePlaceTypeInput {
  customName: string;
  sortOrder?: number;
}

// =============================================================================
// Place
// =============================================================================

export interface Place {
  id: string;
  name: string;
  fullName: string;
  placeTypeId: string | null;
  parentId: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlaceInput {
  name: string;
  fullName?: string;
  placeTypeId?: string;
  parentId?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface UpdatePlaceInput {
  name?: string;
  fullName?: string;
  placeTypeId?: string;
  parentId?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface PlaceWithHierarchy extends Place {
  placeType: PlaceType | null;
  parent: Place | null;
  children: Place[];
  path: Place[];
}

// =============================================================================
// Event Type
// =============================================================================

export type EventCategory = 'individual' | 'family';

export interface EventType {
  id: string;
  tag: string | null;
  category: EventCategory;
  isSystem: boolean;
  customName: string | null;
  sortOrder: number;
}

export interface CreateEventTypeInput {
  category: EventCategory;
  customName: string;
  sortOrder?: number;
}

// =============================================================================
// Event
// =============================================================================

export interface Event {
  id: string;
  eventTypeId: string;
  dateOriginal: string | null;
  dateSort: string | null;
  placeId: string | null;
  description: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  eventTypeId: string;
  dateOriginal?: string;
  dateSort?: string;
  placeId?: string;
  description?: string;
  notes?: string;
}

export interface UpdateEventInput {
  eventTypeId?: string;
  dateOriginal?: string;
  dateSort?: string;
  placeId?: string;
  description?: string;
  notes?: string;
}

// =============================================================================
// Event Participant
// =============================================================================

export type ParticipantRole =
  | 'principal'
  | 'witness'
  | 'officiant'
  | 'godparent'
  | 'informant'
  | 'other';

export interface EventParticipant {
  id: string;
  eventId: string;
  individualId: string | null;
  familyId: string | null;
  role: ParticipantRole;
  notes: string | null;
  createdAt: string;
}

export interface CreateEventParticipantInput {
  eventId: string;
  individualId?: string;
  familyId?: string;
  role?: ParticipantRole;
  notes?: string;
}

// =============================================================================
// Enriched Types (with relationships)
// =============================================================================

export interface EventWithDetails extends Event {
  eventType: EventType;
  place: Place | null;
  participants: EventParticipant[];
}

export interface IndividualWithDetails extends Individual {
  primaryName: Name | null;
  names: Name[];
  birthEvent: EventWithDetails | null;
  deathEvent: EventWithDetails | null;
}

export interface FamilyWithMembers extends Family {
  husband: IndividualWithDetails | null;
  wife: IndividualWithDetails | null;
  children: IndividualWithDetails[];
  marriageEvent: EventWithDetails | null;
}
