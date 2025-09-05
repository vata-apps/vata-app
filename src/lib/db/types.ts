// Database result types for raw SQL queries
// These types represent the raw data structure returned from SQLite

export interface RawPlaceRow {
  readonly id: number;
  readonly created_at: number; // SQLite timestamp
  readonly name: string;
  readonly type_id: number;
  readonly parent_id: number | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly gedcom_id: number | null;
}

export interface RawPlaceTypeRow {
  readonly id: number;
  readonly created_at: number; // SQLite timestamp
  readonly name: string;
  readonly key: string | null;
  readonly is_system: number; // SQLite boolean (0 or 1)
}

export interface CountResult {
  readonly count: number;
}

// Type guards for runtime validation
export function isRawPlaceRow(obj: unknown): obj is RawPlaceRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'type_id' in obj &&
    typeof (obj as any).id === 'number' &&
    typeof (obj as any).name === 'string' &&
    typeof (obj as any).type_id === 'number'
  );
}

export function isRawPlaceTypeRow(obj: unknown): obj is RawPlaceTypeRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    typeof (obj as any).id === 'number' &&
    typeof (obj as any).name === 'string'
  );
}

export function isCountResult(obj: unknown): obj is CountResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'count' in obj &&
    typeof (obj as any).count === 'number'
  );
}

// Utility functions to convert raw rows to typed objects
export function rawPlaceToPlace(raw: RawPlaceRow): import('./schema').Place {
  return {
    id: raw.id,
    createdAt: new Date(raw.created_at * 1000), // Convert SQLite timestamp
    name: raw.name,
    typeId: raw.type_id,
    parentId: raw.parent_id,
    latitude: raw.latitude,
    longitude: raw.longitude,
    gedcomId: raw.gedcom_id
  };
}

export function rawPlaceTypeToPlaceType(raw: RawPlaceTypeRow): import('./schema').PlaceType {
  return {
    id: raw.id,
    createdAt: new Date(raw.created_at * 1000), // Convert SQLite timestamp
    name: raw.name,
    key: raw.key,
    isSystem: Boolean(raw.is_system) // Convert SQLite boolean
  };
}