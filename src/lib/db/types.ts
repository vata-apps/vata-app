// Database result types for raw SQL queries
// These types represent the raw data structure returned from SQLite

// Utility types for cleaner API signatures
export type CreatePlaceInput = Omit<import('./schema').NewPlace, 'id' | 'createdAt'>;
export type CreatePlaceTypeInput = Omit<import('./schema').NewPlaceType, 'id' | 'createdAt'>;
export type UpdatePlaceInput = Partial<Omit<import('./schema').Place, 'id' | 'createdAt'>>;

// Form data types for UI components
export type PlaceFormData = Omit<CreatePlaceInput, 'gedcomId'> & {
  gedcomId?: number | null;
};

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

// Helper function to safely access properties on unknown objects
function hasProperty<T extends PropertyKey>(
  obj: unknown,
  key: T
): obj is Record<T, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}

// Type guards for runtime validation
export function isRawPlaceRow(obj: unknown): obj is RawPlaceRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    hasProperty(obj, 'id') &&
    hasProperty(obj, 'name') &&
    hasProperty(obj, 'type_id') &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.type_id === 'number'
  );
}

export function isRawPlaceTypeRow(obj: unknown): obj is RawPlaceTypeRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    hasProperty(obj, 'id') &&
    hasProperty(obj, 'name') &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string'
  );
}

export function isCountResult(obj: unknown): obj is CountResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    hasProperty(obj, 'count') &&
    typeof obj.count === 'number'
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