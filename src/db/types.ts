// Database types with string IDs for public API
// Internally converted to numbers for SQLite operations

// System database types
export interface Tree {
  id: string;
  name: string;
  file_path: string;
  created_at: Date;
  description?: string;
}

export interface CreateTreeInput {
  name: string;
  description?: string;
}

export interface UpdateTreeInput {
  name?: string;
  description?: string;
  file_path?: string;
}

export interface AppSetting {
  key: string;
  value: string;
  updated_at: Date;
}

// Tree database types (for individual genealogy databases)
export interface PlaceType {
  id: string;
  created_at: Date;
  name: string;
  key: string | null;
}

export interface CreatePlaceTypeInput {
  name: string;
  key?: string;
}

export interface UpdatePlaceTypeInput {
  name?: string;
  key?: string | null;
}

export interface Place {
  id: string;
  created_at: Date;
  name: string;
  type_id: string;
  parent_id: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface CreatePlaceInput {
  name: string;
  type_id: string;
  parent_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdatePlaceInput {
  name?: string;
  type_id?: string;
  parent_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface EventType {
  id: string;
  created_at: Date;
  name: string;
  key: string | null;
}

export interface CreateEventTypeInput {
  name: string;
  key?: string;
}

export interface UpdateEventTypeInput {
  name?: string;
  key?: string | null;
}

export interface EventRole {
  id: string;
  created_at: Date;
  name: string;
  key: string | null;
}

export interface CreateEventRoleInput {
  name: string;
  key?: string;
}

export interface UpdateEventRoleInput {
  name?: string;
  key?: string | null;
}

export type GenderType = "male" | "female" | "unknown";

export interface Individual {
  id: string;
  created_at: Date;
  gender: GenderType;
}

export interface CreateIndividualInput {
  gender: GenderType;
}

export interface UpdateIndividualInput {
  gender?: GenderType;
}

export type NameType = "birth" | "marriage" | "nickname" | "unknown";

export interface Name {
  id: string;
  created_at: Date;
  individual_id: string;
  type: NameType;
  first_name: string | null;
  last_name: string | null;
  is_primary: boolean;
}

export interface CreateNameInput {
  individual_id: string;
  type: NameType;
  first_name?: string | null;
  last_name?: string | null;
  is_primary?: boolean;
}

export interface UpdateNameInput {
  type?: NameType;
  first_name?: string | null;
  last_name?: string | null;
  is_primary?: boolean;
}

export interface Event {
  id: string;
  created_at: Date;
  type_id: string;
  date: string | null;
  description: string | null;
  place_id: string | null;
}

export interface CreateEventInput {
  type_id: string;
  date?: string | null;
  description?: string | null;
  place_id?: string | null;
}

export interface UpdateEventInput {
  type_id?: string;
  date?: string | null;
  description?: string | null;
  place_id?: string | null;
}

export interface EventParticipant {
  id: string;
  created_at: Date;
  event_id: string;
  individual_id: string;
  role_id: string;
}

export interface CreateEventParticipantInput {
  event_id: string;
  individual_id: string;
  role_id: string;
}

export interface UpdateEventParticipantInput {
  individual_id?: string;
  role_id?: string;
}
