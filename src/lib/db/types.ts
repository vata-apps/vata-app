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
