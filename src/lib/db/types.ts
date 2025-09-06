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

export interface CreatePlaceInput {
  name: string;
  typeId: string;
  parentId: string | null;
  latitude: number | null;
  longitude: number | null;
  gedcomId: number | null;
}

export interface CreatePlaceTypeInput {
  name: string;
  key?: string;
}

export interface UpdatePlaceInput {
  name?: string;
  typeId?: string;
  parentId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PlaceFormData {
  name: string;
  typeId: string;
  parentId: string | null;
  latitude: number | null;
  longitude: number | null;
}
