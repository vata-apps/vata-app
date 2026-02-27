/**
 * GEDCOM Importer
 *
 * Imports GEDCOM data into the current tree database.
 * Uses a two-phase strategy:
 * 1. Import individuals (with names and events)
 * 2. Import families and link members
 */

import {
  parseDocument,
  type GedcomIndividual,
  type GedcomFamily,
  type GedcomName,
  type GedcomEvent,
} from '@vata-apps/gedcom-parser';
import { parse, toSortDate } from '@vata-apps/gedcom-date';
import { getTreeDb } from '$/db/connection';
import type { Gender } from '$/types/database';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import type Database from '@tauri-apps/plugin-sql';

export interface ImportStats {
  individuals: number;
  families: number;
  places: number;
  events: number;
  errors: string[];
}

interface ImportContext {
  db: Database;
  xrefToId: Map<string, string>;
  placeCache: Map<string, string>;
  eventTypeCache: Map<string, number>;
}

/**
 * Import GEDCOM content into current tree database.
 *
 * @param content - Raw GEDCOM text content
 * @returns Import statistics including counts and errors
 */
export async function importGedcom(content: string): Promise<ImportStats> {
  const document = parseDocument(content);
  const db = await getTreeDb();

  const stats: ImportStats = {
    individuals: 0,
    families: 0,
    places: 0,
    events: 0,
    errors: [],
  };

  const context: ImportContext = {
    db,
    xrefToId: new Map(),
    placeCache: new Map(),
    eventTypeCache: new Map(),
  };

  // Pre-load event types cache
  await loadEventTypeCache(context);

  await db.execute('BEGIN TRANSACTION');

  try {
    // Phase 1: Import individuals (without family links)
    for (const individual of document.individuals) {
      try {
        const eventCount = await importIndividual(individual, context);
        stats.individuals++;
        stats.events += eventCount;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        stats.errors.push(`INDI ${individual.xref}: ${message}`);
      }
    }

    // Phase 2: Import families and link members
    for (const family of document.families) {
      try {
        const eventCount = await importFamily(family, context);
        stats.families++;
        stats.events += eventCount;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        stats.errors.push(`FAM ${family.xref}: ${message}`);
      }
    }

    stats.places = context.placeCache.size;

    await db.execute('COMMIT');
  } catch (e) {
    await db.execute('ROLLBACK');
    throw e;
  }

  return stats;
}

/**
 * Load event types into cache for fast lookup.
 */
async function loadEventTypeCache(ctx: ImportContext): Promise<void> {
  const { db, eventTypeCache } = ctx;

  const rows = await db.select<{ id: number; tag: string }[]>(
    'SELECT id, tag FROM event_types WHERE tag IS NOT NULL'
  );

  for (const row of rows) {
    eventTypeCache.set(row.tag, row.id);
  }
}

/**
 * Import an individual record.
 */
async function importIndividual(individual: GedcomIndividual, ctx: ImportContext): Promise<number> {
  const { db, xrefToId } = ctx;

  // Parse gender
  const gender: Gender = individual.gender === 'M' ? 'M' : individual.gender === 'F' ? 'F' : 'U';

  // Create individual
  const result = await db.execute('INSERT INTO individuals (gender, is_living) VALUES ($1, $2)', [
    gender,
    1,
  ]);
  if (result.lastInsertId === undefined) {
    throw new Error('Failed to insert individual');
  }
  const individualId = formatEntityId('I', result.lastInsertId);
  xrefToId.set(individual.xref, individualId);

  // Import names
  let isPrimary = true;
  for (const name of individual.names) {
    await importName(name, individualId, isPrimary, ctx);
    isPrimary = false;
  }

  // Import events
  let eventCount = 0;
  for (const event of individual.events) {
    const imported = await importIndividualEvent(event, individualId, ctx);
    if (imported) eventCount++;
  }

  return eventCount;
}

/**
 * Import a name record.
 */
async function importName(
  name: GedcomName,
  individualId: string,
  isPrimary: boolean,
  ctx: ImportContext
): Promise<void> {
  const { db } = ctx;

  await db.execute(
    `INSERT INTO names (individual_id, type, prefix, given_names, surname, suffix, nickname, is_primary)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      parseEntityId(individualId),
      mapNameType(name.type),
      name.prefix || null,
      name.givenNames || null,
      name.surname || null,
      name.suffix || null,
      name.nickname || null,
      isPrimary ? 1 : 0,
    ]
  );
}

/**
 * Import an individual event.
 */
async function importIndividualEvent(
  event: GedcomEvent,
  individualId: string,
  ctx: ImportContext
): Promise<boolean> {
  const { db, eventTypeCache } = ctx;

  // Get event type ID
  let eventTypeId: number | undefined;

  if (event.tag === 'EVEN' && event.type) {
    // Custom event - create or get custom event type
    eventTypeId = await getOrCreateCustomEventType(event.type, 'individual', ctx);
  } else {
    eventTypeId = eventTypeCache.get(event.tag);
  }

  if (eventTypeId === undefined) {
    // Unknown event type - skip silently
    return false;
  }

  // Parse date
  let dateSort: string | null = null;
  if (event.date) {
    const parsed = parse(event.date);
    if (parsed.success && parsed.date) {
      dateSort = toSortDate(parsed.date);
    }
  }

  // Get or create place
  const placeId = event.place ? await getOrCreatePlace(event.place, ctx) : null;

  // Create event
  const result = await db.execute(
    `INSERT INTO events (event_type_id, date_original, date_sort, place_id, description)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      eventTypeId,
      event.date || null,
      dateSort,
      placeId ? parseEntityId(placeId) : null,
      event.description || null,
    ]
  );
  if (result.lastInsertId === undefined) {
    throw new Error('Failed to insert event');
  }
  const eventId = result.lastInsertId;

  // Link to individual
  await db.execute(
    `INSERT INTO event_participants (event_id, individual_id, role)
     VALUES ($1, $2, 'principal')`,
    [eventId, parseEntityId(individualId)]
  );

  return true;
}

/**
 * Import a family record.
 */
async function importFamily(family: GedcomFamily, ctx: ImportContext): Promise<number> {
  const { db, xrefToId } = ctx;

  // Create family
  const result = await db.execute('INSERT INTO families DEFAULT VALUES');
  if (result.lastInsertId === undefined) {
    throw new Error('Failed to insert family');
  }
  const familyId = formatEntityId('F', result.lastInsertId);
  xrefToId.set(family.xref, familyId);

  // Link husband
  if (family.husbandRef && xrefToId.has(family.husbandRef)) {
    await db.execute(
      `INSERT INTO family_members (family_id, individual_id, role)
       VALUES ($1, $2, 'husband')`,
      [parseEntityId(familyId), parseEntityId(xrefToId.get(family.husbandRef)!)]
    );
  }

  // Link wife
  if (family.wifeRef && xrefToId.has(family.wifeRef)) {
    await db.execute(
      `INSERT INTO family_members (family_id, individual_id, role)
       VALUES ($1, $2, 'wife')`,
      [parseEntityId(familyId), parseEntityId(xrefToId.get(family.wifeRef)!)]
    );
  }

  // Link children
  let sortOrder = 0;
  for (const childXref of family.childRefs) {
    if (xrefToId.has(childXref)) {
      await db.execute(
        `INSERT INTO family_members (family_id, individual_id, role, sort_order)
         VALUES ($1, $2, 'child', $3)`,
        [parseEntityId(familyId), parseEntityId(xrefToId.get(childXref)!), sortOrder++]
      );
    }
  }

  // Import family events
  let eventCount = 0;
  for (const event of family.events) {
    const imported = await importFamilyEvent(event, familyId, ctx);
    if (imported) eventCount++;
  }

  return eventCount;
}

/**
 * Import a family event.
 */
async function importFamilyEvent(
  event: GedcomEvent,
  familyId: string,
  ctx: ImportContext
): Promise<boolean> {
  const { db, eventTypeCache } = ctx;

  // Get event type ID
  let eventTypeId: number | undefined;

  if (event.tag === 'EVEN' && event.type) {
    // Custom event
    eventTypeId = await getOrCreateCustomEventType(event.type, 'family', ctx);
  } else {
    eventTypeId = eventTypeCache.get(event.tag);
  }

  if (eventTypeId === undefined) {
    return false;
  }

  // Parse date
  let dateSort: string | null = null;
  if (event.date) {
    const parsed = parse(event.date);
    if (parsed.success && parsed.date) {
      dateSort = toSortDate(parsed.date);
    }
  }

  // Get or create place
  const placeId = event.place ? await getOrCreatePlace(event.place, ctx) : null;

  // Create event
  const result = await db.execute(
    `INSERT INTO events (event_type_id, date_original, date_sort, place_id, description)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      eventTypeId,
      event.date || null,
      dateSort,
      placeId ? parseEntityId(placeId) : null,
      event.description || null,
    ]
  );
  if (result.lastInsertId === undefined) {
    throw new Error('Failed to insert family event');
  }
  const eventId = result.lastInsertId;

  // Link to family
  await db.execute(
    `INSERT INTO event_participants (event_id, family_id, role)
     VALUES ($1, $2, 'principal')`,
    [eventId, parseEntityId(familyId)]
  );

  return true;
}

/**
 * Get or create a place by full name.
 */
async function getOrCreatePlace(fullName: string, ctx: ImportContext): Promise<string> {
  const { db, placeCache } = ctx;

  // Check cache
  if (placeCache.has(fullName)) {
    return placeCache.get(fullName)!;
  }

  // Check database
  const existing = await db.select<{ id: number }[]>('SELECT id FROM places WHERE full_name = $1', [
    fullName,
  ]);
  if (existing[0]) {
    const id = formatEntityId('P', existing[0].id);
    placeCache.set(fullName, id);
    return id;
  }

  // Create new place
  const parts = fullName.split(',').map((p) => p.trim());
  const name = parts[0] || fullName;

  const result = await db.execute('INSERT INTO places (name, full_name) VALUES ($1, $2)', [
    name,
    fullName,
  ]);
  if (result.lastInsertId === undefined) {
    throw new Error('Failed to insert place');
  }
  const id = formatEntityId('P', result.lastInsertId);
  placeCache.set(fullName, id);
  return id;
}

/**
 * Get or create a custom event type.
 */
async function getOrCreateCustomEventType(
  customName: string,
  category: 'individual' | 'family',
  ctx: ImportContext
): Promise<number> {
  const { db, eventTypeCache } = ctx;

  // Check cache with custom key
  const cacheKey = `CUSTOM:${category}:${customName}`;
  const cached = eventTypeCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Check database
  const existing = await db.select<{ id: number }[]>(
    'SELECT id FROM event_types WHERE custom_name = $1 AND category = $2',
    [customName, category]
  );
  if (existing[0]) {
    eventTypeCache.set(cacheKey, existing[0].id);
    return existing[0].id;
  }

  // Create new custom event type
  const result = await db.execute(
    'INSERT INTO event_types (category, is_system, custom_name) VALUES ($1, 0, $2)',
    [category, customName]
  );
  if (result.lastInsertId === undefined) {
    throw new Error('Failed to insert custom event type');
  }
  const id = result.lastInsertId;
  eventTypeCache.set(cacheKey, id);
  return id;
}

/**
 * Map GEDCOM name type to database name type.
 */
function mapNameType(type?: string): string {
  if (!type) return 'birth';
  const lower = type.toLowerCase();
  if (lower.includes('married') || lower.includes('marriage')) return 'married';
  if (lower.includes('aka') || lower.includes('alias')) return 'aka';
  if (lower.includes('immigrant')) return 'immigrant';
  if (lower.includes('adopted')) return 'adopted';
  if (lower.includes('religious')) return 'religious';
  return 'birth';
}
