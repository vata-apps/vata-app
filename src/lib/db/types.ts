// Simple type definitions for the application

export interface PlaceType {
  id: string;
  created_at: string;
  name: string;
  key: string | null;
}

export interface Place {
  id: string;
  created_at: string;
  name: string;
  type_id: string;
  parent_id: string | null;
  latitude: number | null;
  longitude: number | null;
  gedcom_id: number | null;
}

export interface PlaceInput {
  name: string;
  typeId: string;
  parentId: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface CreatePlaceInput extends PlaceInput {
  gedcomId: number | null;
}

export type UpdatePlaceInput = Partial<PlaceInput>;

export interface CreatePlaceTypeInput {
  name: string;
  key?: string;
}

export interface UpdatePlaceTypeInput {
  name?: string;
  key?: string | null;
}

export interface EventType {
  id: string;
  created_at: string;
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
  created_at: string;
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

export type NameType = "birth" | "marriage" | "nickname" | "unknown";

export interface Individual {
  id: string;
  created_at: string;
  gender: GenderType;
  gedcom_id: number | null;
}

export interface Name {
  id: string;
  created_at: string;
  individual_id: string;
  type: NameType;
  first_name: string | null;
  last_name: string | null;
  is_primary: boolean;
}

export interface CreateIndividualInput {
  gender: GenderType;
}

export interface UpdateIndividualInput {
  gender?: GenderType;
}

export interface CreateNameInput {
  individualId: string;
  type: NameType;
  firstName?: string | null;
  lastName?: string | null;
  isPrimary?: boolean;
}

export interface UpdateNameInput {
  type?: NameType;
  firstName?: string | null;
  lastName?: string | null;
  isPrimary?: boolean;
}
