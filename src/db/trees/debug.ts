import { getTreeDb } from '../connection';

// Raw database row types (snake_case as in SQLite)
interface RawIndividual {
  id: number;
  gender: string;
  is_living: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface RawName {
  id: number;
  individual_id: number;
  type: string;
  prefix: string | null;
  given_names: string | null;
  surname: string | null;
  suffix: string | null;
  nickname: string | null;
  is_primary: number;
  created_at: string;
  updated_at: string;
}

interface RawFamily {
  id: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface RawFamilyMember {
  id: number;
  family_id: number;
  individual_id: number;
  role: string;
  pedigree: string | null;
  sort_order: number;
  created_at: string;
}

interface RawEvent {
  id: number;
  event_type_id: number;
  date_original: string | null;
  date_sort: string | null;
  place_id: number | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface RawEventType {
  id: number;
  tag: string | null;
  category: string;
  is_system: number;
  custom_name: string | null;
  sort_order: number;
}

interface RawEventParticipant {
  id: number;
  event_id: number;
  individual_id: number | null;
  family_id: number | null;
  role: string;
  notes: string | null;
  created_at: string;
}

interface RawPlace {
  id: number;
  name: string;
  full_name: string;
  place_type_id: number | null;
  parent_id: number | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface RawTreeMeta {
  key: string;
  value: string;
}

// Debug data types (camelCase for frontend)
export interface DebugIndividual {
  id: number;
  gender: string;
  isLiving: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  names: DebugName[];
}

export interface DebugName {
  id: number;
  individualId: number;
  type: string;
  prefix: string | null;
  givenNames: string | null;
  surname: string | null;
  suffix: string | null;
  nickname: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DebugFamily {
  id: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  members: DebugFamilyMember[];
}

export interface DebugFamilyMember {
  id: number;
  familyId: number;
  individualId: number;
  role: string;
  pedigree: string | null;
  sortOrder: number;
  createdAt: string;
  individualName?: string;
}

export interface DebugEvent {
  id: number;
  eventTypeId: number;
  eventTypeTag: string | null;
  eventTypeName: string | null;
  dateOriginal: string | null;
  dateSort: string | null;
  placeId: number | null;
  placeName: string | null;
  description: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  participants: DebugEventParticipant[];
}

export interface DebugEventParticipant {
  id: number;
  eventId: number;
  individualId: number | null;
  familyId: number | null;
  role: string;
  notes: string | null;
  createdAt: string;
}

export interface DebugPlace {
  id: number;
  name: string;
  fullName: string;
  placeTypeId: number | null;
  parentId: number | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DebugEventType {
  id: number;
  tag: string | null;
  category: string;
  isSystem: boolean;
  customName: string | null;
  sortOrder: number;
}

export interface TreeDebugData {
  meta: Record<string, string>;
  individuals: DebugIndividual[];
  families: DebugFamily[];
  events: DebugEvent[];
  places: DebugPlace[];
  eventTypes: DebugEventType[];
  counts: {
    individuals: number;
    families: number;
    events: number;
    places: number;
    names: number;
    familyMembers: number;
    eventParticipants: number;
  };
}

export async function getTreeDebugData(): Promise<TreeDebugData> {
  const db = await getTreeDb();

  // Fetch all raw data in parallel
  const [
    rawMeta,
    rawIndividuals,
    rawNames,
    rawFamilies,
    rawFamilyMembers,
    rawEvents,
    rawEventTypes,
    rawEventParticipants,
    rawPlaces,
  ] = await Promise.all([
    db.select<RawTreeMeta[]>('SELECT key, value FROM tree_meta'),
    db.select<RawIndividual[]>(
      'SELECT id, gender, is_living, notes, created_at, updated_at FROM individuals ORDER BY id'
    ),
    db.select<RawName[]>(
      'SELECT id, individual_id, type, prefix, given_names, surname, suffix, nickname, is_primary, created_at, updated_at FROM names ORDER BY individual_id, is_primary DESC'
    ),
    db.select<RawFamily[]>('SELECT id, notes, created_at, updated_at FROM families ORDER BY id'),
    db.select<RawFamilyMember[]>(
      'SELECT id, family_id, individual_id, role, pedigree, sort_order, created_at FROM family_members ORDER BY family_id, sort_order'
    ),
    db.select<RawEvent[]>(
      'SELECT id, event_type_id, date_original, date_sort, place_id, description, notes, created_at, updated_at FROM events ORDER BY id'
    ),
    db.select<RawEventType[]>(
      'SELECT id, tag, category, is_system, custom_name, sort_order FROM event_types ORDER BY category, sort_order'
    ),
    db.select<RawEventParticipant[]>(
      'SELECT id, event_id, individual_id, family_id, role, notes, created_at FROM event_participants ORDER BY event_id'
    ),
    db.select<RawPlace[]>(
      'SELECT id, name, full_name, place_type_id, parent_id, latitude, longitude, notes, created_at, updated_at FROM places ORDER BY id'
    ),
  ]);

  // Build meta object
  const meta: Record<string, string> = {};
  for (const row of rawMeta) {
    meta[row.key] = row.value;
  }

  // Build names lookup by individual_id
  const namesByIndividual = new Map<number, DebugName[]>();
  for (const raw of rawNames) {
    const name: DebugName = {
      id: raw.id,
      individualId: raw.individual_id,
      type: raw.type,
      prefix: raw.prefix,
      givenNames: raw.given_names,
      surname: raw.surname,
      suffix: raw.suffix,
      nickname: raw.nickname,
      isPrimary: raw.is_primary === 1,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
    const list = namesByIndividual.get(raw.individual_id) ?? [];
    list.push(name);
    namesByIndividual.set(raw.individual_id, list);
  }

  // Build individual name lookup for family members display
  const individualNameLookup = new Map<number, string>();
  for (const raw of rawIndividuals) {
    const names = namesByIndividual.get(raw.id) ?? [];
    const primary = names.find((n) => n.isPrimary) ?? names[0];
    if (primary) {
      const parts = [primary.givenNames, primary.surname].filter(Boolean);
      individualNameLookup.set(raw.id, parts.join(' ') || `Individual ${raw.id}`);
    } else {
      individualNameLookup.set(raw.id, `Individual ${raw.id}`);
    }
  }

  // Build individuals with names
  const individuals: DebugIndividual[] = rawIndividuals.map((raw) => ({
    id: raw.id,
    gender: raw.gender,
    isLiving: raw.is_living === 1,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    names: namesByIndividual.get(raw.id) ?? [],
  }));

  // Build family members lookup by family_id
  const membersByFamily = new Map<number, DebugFamilyMember[]>();
  for (const raw of rawFamilyMembers) {
    const member: DebugFamilyMember = {
      id: raw.id,
      familyId: raw.family_id,
      individualId: raw.individual_id,
      role: raw.role,
      pedigree: raw.pedigree,
      sortOrder: raw.sort_order,
      createdAt: raw.created_at,
      individualName: individualNameLookup.get(raw.individual_id),
    };
    const list = membersByFamily.get(raw.family_id) ?? [];
    list.push(member);
    membersByFamily.set(raw.family_id, list);
  }

  // Build families with members
  const families: DebugFamily[] = rawFamilies.map((raw) => ({
    id: raw.id,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    members: membersByFamily.get(raw.id) ?? [],
  }));

  // Build event types lookup
  const eventTypeLookup = new Map<number, { tag: string | null; customName: string | null }>();
  for (const raw of rawEventTypes) {
    eventTypeLookup.set(raw.id, { tag: raw.tag, customName: raw.custom_name });
  }

  // Build places lookup
  const placeLookup = new Map<number, string>();
  for (const raw of rawPlaces) {
    placeLookup.set(raw.id, raw.full_name);
  }

  // Build event participants lookup by event_id
  const participantsByEvent = new Map<number, DebugEventParticipant[]>();
  for (const raw of rawEventParticipants) {
    const participant: DebugEventParticipant = {
      id: raw.id,
      eventId: raw.event_id,
      individualId: raw.individual_id,
      familyId: raw.family_id,
      role: raw.role,
      notes: raw.notes,
      createdAt: raw.created_at,
    };
    const list = participantsByEvent.get(raw.event_id) ?? [];
    list.push(participant);
    participantsByEvent.set(raw.event_id, list);
  }

  // Build events with participants
  const events: DebugEvent[] = rawEvents.map((raw) => {
    const eventType = eventTypeLookup.get(raw.event_type_id);
    return {
      id: raw.id,
      eventTypeId: raw.event_type_id,
      eventTypeTag: eventType?.tag ?? null,
      eventTypeName: eventType?.customName ?? eventType?.tag ?? null,
      dateOriginal: raw.date_original,
      dateSort: raw.date_sort,
      placeId: raw.place_id,
      placeName: raw.place_id ? (placeLookup.get(raw.place_id) ?? null) : null,
      description: raw.description,
      notes: raw.notes,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      participants: participantsByEvent.get(raw.id) ?? [],
    };
  });

  // Build places
  const places: DebugPlace[] = rawPlaces.map((raw) => ({
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    placeTypeId: raw.place_type_id,
    parentId: raw.parent_id,
    latitude: raw.latitude,
    longitude: raw.longitude,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }));

  // Build event types
  const eventTypes: DebugEventType[] = rawEventTypes.map((raw) => ({
    id: raw.id,
    tag: raw.tag,
    category: raw.category,
    isSystem: raw.is_system === 1,
    customName: raw.custom_name,
    sortOrder: raw.sort_order,
  }));

  return {
    meta,
    individuals,
    families,
    events,
    places,
    eventTypes,
    counts: {
      individuals: rawIndividuals.length,
      families: rawFamilies.length,
      events: rawEvents.length,
      places: rawPlaces.length,
      names: rawNames.length,
      familyMembers: rawFamilyMembers.length,
      eventParticipants: rawEventParticipants.length,
    },
  };
}
