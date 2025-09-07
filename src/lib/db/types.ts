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
