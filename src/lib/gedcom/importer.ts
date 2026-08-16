/**
 * GEDCOM Importer
 *
 * Imports GEDCOM data into the current tree database.
 * Uses a two-phase strategy:
 * 1. Import individuals (with names and events)
 * 2. Import families and link members
 *
 * Writes are batched into chunked multi-row `INSERT`s (see `batchInsert` in
 * `$/db/sql-chunk`) instead of one `execute()` per row. A 100k-individual
 * file used to cost on the order of 500k IPC round trips (one per
 * individual/name/event/participant/note); batching brings that down to a
 * few hundred statements (see issue #270).
 */

import {
  parseDocument,
  type GedcomDocument,
  type GedcomEvent,
  type GedcomFamily,
  type GedcomIndividual,
  type GedcomName,
} from '@vata-apps/gedcom-parser';
import { getTreeDb } from '$/db/connection';
import {
  batchInsert,
  buildInClausePlaceholders,
  chunkArray,
  SQLITE_IN_CLAUSE_LIMIT,
} from '$/db/sql-chunk';
import type { Gender, Pedigree } from '$types/database';
import { tryParseSortDate } from '$/lib/dateSort';
import { toErrorMessage } from '$/lib/errors';
import type Database from '@tauri-apps/plugin-sql';

export interface ImportStats {
  /**
   * Count of individual/family base records successfully created. Batching
   * means a record's own row can succeed independently of its names,
   * notes, or events — this counts DB existence, not "imported with zero
   * sub-record errors"; sub-record failures are still captured in `errors`.
   */
  individuals: number;
  families: number;
  places: number;
  events: number;
  errors: string[];
}

interface ImportContext {
  db: Database;
  /**
   * GEDCOM xref → its DB row id. Individuals and families share one map —
   * the parser guarantees xrefs are unique across the whole document, not
   * just within one record type.
   */
  xrefToId: Map<string, number>;
  /** PLAC full_name → its DB row id, resolved once upfront (see resolvePlaces) for every place referenced anywhere in the document. */
  placeIds: Map<string, number>;
  eventTypeCache: Map<string, number>;
  /** `${childXref}:${familyXref}` → this child's pedigree in that family, from the INDI's own FAMC/PEDI. */
  pedigreeByChildFamily: Map<string, Pedigree>;
  stats: ImportStats;
}

/** An individual or family event resolved down to concrete DB ids, ready to batch-insert. */
interface PendingEvent {
  /** individual_id or family_id, depending on `category`. */
  ownerId: number;
  /** Owning record's GEDCOM xref, for error messages. */
  xref: string;
  eventTypeId: number;
  dateOriginal: string | null;
  dateSort: string | null;
  placeId: number | null;
  description: string | null;
  /** Only imported for individual events — see {@link insertEvents}. */
  notes: string[];
}

/** A `notes` table row the importer is about to insert. */
interface PendingNote {
  individualId: number;
  /** Owning individual's GEDCOM xref, for error messages. */
  xref: string;
  eventId?: number;
  text: string;
}

/** Cache key for a system event type — tag alone collides between categories (e.g. CENS is both an individual and a family tag), so category is part of the key. */
function eventTypeCacheKey(tag: string, category: 'individual' | 'family'): string {
  return `${tag}:${category}`;
}

/** The GEDCOM record-type tag an event category's error messages are prefixed with. */
const RECORD_TAG: Record<'individual' | 'family', 'INDI' | 'FAM'> = {
  individual: 'INDI',
  family: 'FAM',
};

const VALID_PEDIGREES: ReadonlySet<string> = new Set([
  'birth',
  'adopted',
  'foster',
  'sealing',
  'step',
]);

/** Normalizes a raw PEDI value to one of the schema's pedigree values, or `undefined` if not recognized — an unrecognized value is dropped rather than failing the import (same policy as an unsupported tag). */
function normalizePedigree(raw: string | undefined): Pedigree | undefined {
  const normalized = raw?.trim().toLowerCase();
  return normalized && VALID_PEDIGREES.has(normalized) ? (normalized as Pedigree) : undefined;
}

/** Every individual's FAMC/PEDI, keyed by `${childXref}:${familyXref}` for `importFamilies`'s child-linking loop to look up. */
function buildPedigreeMap(individuals: GedcomIndividual[]): Map<string, Pedigree> {
  const map = new Map<string, Pedigree>();
  for (const individual of individuals) {
    for (const famRef of individual.familyChildRefs) {
      const pedigree = normalizePedigree(famRef.pedigree);
      if (pedigree) map.set(`${individual.xref}:${famRef.familyXref}`, pedigree);
    }
  }
  return map;
}

/** Normalizes a GEDCOM gender value to the schema's `Gender` enum. */
function normalizeGender(gender: GedcomIndividual['gender']): Gender {
  return gender === 'M' || gender === 'F' ? gender : 'U';
}

/** An individual is living unless they carry a death-indicating event. A missing DEAT alone is not reliable evidence of life — the normal state in a genealogy file is "not yet found" — but a burial or cremation record is unambiguous. */
function isLivingFromEvents(events: GedcomEvent[]): boolean {
  return !events.some((e) => e.tag === 'DEAT' || e.tag === 'BURI' || e.tag === 'CREM');
}

function errorMessage(error: unknown): string {
  return toErrorMessage(error) ?? String(error);
}

/**
 * Import GEDCOM content into current tree database.
 *
 * Not wrapped in a DB transaction — see the note on
 * {@link IndividualManager.create}. Per-chunk batch failures fall back to
 * inserting that chunk one row at a time (see `batchInsert`), so a single
 * malformed record in an otherwise-good file still can't cost the
 * researcher everything else in it — it's just isolated at the chunk
 * level rather than resumed mid-record. Callers that need "all or
 * nothing" are responsible for cleaning up a partial import themselves
 * (see {@link GedcomManager.importFromFile}, which deletes the tree it
 * just created if this throws).
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
    placeIds: new Map(),
    eventTypeCache: new Map(),
    pedigreeByChildFamily: buildPedigreeMap(document.individuals),
    stats,
  };

  // Independent — populate disjoint parts of the context (eventTypeCache vs
  // placeIds), so there's no reason to serialize them.
  await Promise.all([loadEventTypeCache(context), resolvePlaces(document, context)]);

  // Phase 1: individuals (with names, notes, events) — no family links yet.
  await importIndividuals(document.individuals, context);

  // Phase 2: families and member links, using the xref → id map Phase 1 built.
  await importFamilies(document.families, context);

  return stats;
}

/**
 * Load event types into cache for fast lookup.
 */
async function loadEventTypeCache(ctx: ImportContext): Promise<void> {
  const { db, eventTypeCache } = ctx;

  const rows = await db.select<{ id: number; tag: string; category: 'individual' | 'family' }[]>(
    'SELECT id, tag, category FROM event_types WHERE tag IS NOT NULL'
  );

  for (const row of rows) {
    eventTypeCache.set(eventTypeCacheKey(row.tag, row.category), row.id);
  }
}

/**
 * Resolve every distinct PLAC value referenced anywhere in the document
 * (individual and family events) into a DB place id, in one upfront pass —
 * a handful of chunked queries instead of a SELECT-then-maybe-INSERT per
 * event. Populates `ctx.placeIds`; `stats.places` is its final size.
 *
 * The PLAC value is stored verbatim as both `name` and `full_name` — no
 * hierarchy decomposition happens on import (see the gedcom-standards
 * skill).
 */
async function resolvePlaces(
  document: Pick<GedcomDocument, 'individuals' | 'families'>,
  ctx: ImportContext
): Promise<void> {
  const { db, placeIds, stats } = ctx;

  const names = new Set<string>();
  for (const individual of document.individuals) {
    for (const event of individual.events) {
      if (event.place) names.add(event.place);
    }
  }
  for (const family of document.families) {
    for (const event of family.events) {
      if (event.place) names.add(event.place);
    }
  }
  if (names.size === 0) return;

  const allNames = Array.from(names);

  // Reuse whatever already exists in this tree. Every call today runs
  // against a tree `GedcomManager.importIntoNewTree` just created, so this
  // is currently always empty — it's here for the "merge duplicates"
  // import option the modal already shows (disabled) as a `Soon` switch,
  // so importing into an existing tree doesn't duplicate every place.
  for (const chunk of chunkArray(allNames, SQLITE_IN_CLAUSE_LIMIT)) {
    const placeholders = buildInClausePlaceholders(chunk.length);
    const rows = await db.select<{ id: number; full_name: string }[]>(
      `SELECT id, full_name FROM places WHERE full_name IN (${placeholders}) ORDER BY id`,
      chunk
    );
    for (const row of rows) {
      if (!placeIds.has(row.full_name)) placeIds.set(row.full_name, row.id);
    }
  }

  // Create everything that wasn't already there.
  const newNames = allNames.filter((name) => !placeIds.has(name));
  const newIds = await batchInsert(
    db,
    newNames,
    2,
    (values) => `INSERT INTO places (name, full_name) VALUES ${values}`,
    (name) => [name, name],
    (name, error) => {
      // Events referencing this place fall back to place_id = null rather
      // than failing the whole import — see resolvePendingEvent.
      stats.errors.push(`PLAC "${name}": ${errorMessage(error)}`);
    }
  );
  newNames.forEach((name, i) => {
    const id = newIds[i];
    if (id !== undefined) placeIds.set(name, id);
  });

  stats.places = placeIds.size;
}

/**
 * Get or create a custom event type. Kept as a per-event cached lookup
 * rather than batched upfront — custom EVEN/TYPE combinations are rare in
 * practice and heavily deduplicated by `eventTypeCache`, so this almost
 * never reaches the database at all.
 */
async function getOrCreateCustomEventType(
  customName: string,
  category: 'individual' | 'family',
  ctx: ImportContext
): Promise<number> {
  const { db, eventTypeCache } = ctx;

  const cacheKey = `CUSTOM:${category}:${customName}`;
  const cached = eventTypeCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const existing = await db.select<{ id: number }[]>(
    'SELECT id FROM event_types WHERE custom_name = $1 AND category = $2',
    [customName, category]
  );
  if (existing[0]) {
    eventTypeCache.set(cacheKey, existing[0].id);
    return existing[0].id;
  }

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
 * Resolve one GEDCOM event down to concrete DB ids, ready to batch-insert.
 * Returns `undefined` for an unsupported tag (not one of the tags
 * `event_types` is seeded with) — surfaced in `stats.errors` instead of
 * dropped silently, so a documented-but-unseeded tag doesn't vanish
 * without a trace (see issue #243).
 */
async function resolvePendingEvent(
  event: GedcomEvent,
  ownerId: number,
  xref: string,
  category: 'individual' | 'family',
  ctx: ImportContext
): Promise<PendingEvent | undefined> {
  const { eventTypeCache, placeIds, stats } = ctx;

  const eventTypeId =
    event.tag === 'EVEN' && event.type
      ? await getOrCreateCustomEventType(event.type, category, ctx)
      : eventTypeCache.get(eventTypeCacheKey(event.tag, category));

  if (eventTypeId === undefined) {
    stats.errors.push(`${RECORD_TAG[category]} ${xref}: unsupported event tag ${event.tag}`);
    return undefined;
  }

  return {
    ownerId,
    xref,
    eventTypeId,
    dateOriginal: event.date || null,
    dateSort: tryParseSortDate(event.date) ?? null,
    placeId: event.place ? (placeIds.get(event.place) ?? null) : null,
    description: event.description || null,
    notes: event.notes,
  };
}

/**
 * Batch-insert pending events, their `event_participants` link, and — for
 * individual events only — their notes (family/family-event notes have no
 * individual to anchor to and are left unimported, see the
 * gedcom-standards skill). Increments `stats.events` per event actually
 * inserted.
 */
async function insertEvents(
  pending: PendingEvent[],
  category: 'individual' | 'family',
  ctx: ImportContext
): Promise<void> {
  const { db, stats } = ctx;
  if (pending.length === 0) return;

  const recordTag = RECORD_TAG[category];
  const ids = await batchInsert(
    db,
    pending,
    5,
    (values) =>
      `INSERT INTO events (event_type_id, date_original, date_sort, place_id, description) VALUES ${values}`,
    (row) => [row.eventTypeId, row.dateOriginal, row.dateSort, row.placeId, row.description],
    (row, error) => {
      stats.errors.push(`${recordTag} ${row.xref}: failed to import event: ${errorMessage(error)}`);
    }
  );

  const ownerColumn = category === 'individual' ? 'individual_id' : 'family_id';
  const participantRows: { eventId: number; ownerId: number; xref: string }[] = [];
  const noteRows: PendingNote[] = [];

  for (let i = 0; i < pending.length; i++) {
    const eventId = ids[i];
    if (eventId === undefined) continue;
    stats.events++;
    participantRows.push({ eventId, ownerId: pending[i].ownerId, xref: pending[i].xref });
    if (category === 'individual') {
      for (const text of pending[i].notes) {
        noteRows.push({ individualId: pending[i].ownerId, xref: pending[i].xref, eventId, text });
      }
    }
  }

  // Only binds the owner column that applies (individual_id or family_id),
  // unlike events.ts's addEventParticipant which always lists both and
  // nulls the unused one — deliberate here, to keep columnsPerRow at 3
  // instead of 4 and fit more rows in each chunk.
  await batchInsert(
    db,
    participantRows,
    3,
    (values) => `INSERT INTO event_participants (event_id, ${ownerColumn}, role) VALUES ${values}`,
    (row) => [row.eventId, row.ownerId, 'principal'],
    (row, error) => {
      stats.errors.push(
        `${recordTag} ${row.xref}: failed to link event ${row.eventId}: ${errorMessage(error)}`
      );
    }
  );

  if (category === 'individual') {
    await insertNotes(noteRows, 'event', ctx);
  }
}

/** Batch-insert `notes` rows for a single scope — the importer only ever creates individual-owned notes. */
async function insertNotes(
  rows: PendingNote[],
  scope: 'person' | 'event',
  ctx: ImportContext
): Promise<void> {
  const { db, stats } = ctx;
  if (rows.length === 0) return;

  await batchInsert(
    db,
    rows,
    4,
    (values) => `INSERT INTO notes (individual_id, scope, event_id, text) VALUES ${values}`,
    (row) => [row.individualId, scope, row.eventId ?? null, row.text],
    (row, error) => {
      stats.errors.push(`INDI ${row.xref}: failed to import a note: ${errorMessage(error)}`);
    }
  );
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

/**
 * Phase 1: batch-import every individual — base record, names, notes, and
 * events — populating `ctx.xrefToId` for Phase 2's family linking.
 */
async function importIndividuals(
  individuals: GedcomIndividual[],
  ctx: ImportContext
): Promise<void> {
  const { db, xrefToId, stats } = ctx;
  if (individuals.length === 0) return;

  const rows = individuals.map((individual) => ({
    individual,
    gender: normalizeGender(individual.gender),
    isLiving: isLivingFromEvents(individual.events),
  }));

  const ids = await batchInsert(
    db,
    rows,
    2,
    (values) => `INSERT INTO individuals (gender, is_living) VALUES ${values}`,
    (row) => [row.gender, row.isLiving ? 1 : 0],
    (row, error) => {
      stats.errors.push(`INDI ${row.individual.xref}: ${errorMessage(error)}`);
    }
  );

  const nameRows: { individualId: number; xref: string; name: GedcomName; isPrimary: boolean }[] =
    [];
  const noteRows: PendingNote[] = [];
  const pendingEvents: PendingEvent[] = [];

  for (let i = 0; i < rows.length; i++) {
    const id = ids[i];
    if (id === undefined) continue;
    const { individual } = rows[i];
    xrefToId.set(individual.xref, id);
    stats.individuals++;

    individual.names.forEach((name, index) => {
      nameRows.push({ individualId: id, xref: individual.xref, name, isPrimary: index === 0 });
    });

    for (const text of individual.notes) {
      noteRows.push({ individualId: id, xref: individual.xref, text });
    }

    for (const event of individual.events) {
      const pending = await resolvePendingEvent(event, id, individual.xref, 'individual', ctx);
      if (pending) pendingEvents.push(pending);
    }
  }

  await batchInsert(
    db,
    nameRows,
    8,
    (values) =>
      `INSERT INTO names (individual_id, type, prefix, given_names, surname, suffix, nickname, is_primary) VALUES ${values}`,
    (row) => [
      row.individualId,
      mapNameType(row.name.type),
      row.name.prefix || null,
      row.name.givenNames || null,
      row.name.surname || null,
      row.name.suffix || null,
      row.name.nickname || null,
      row.isPrimary ? 1 : 0,
    ],
    (row, error) => {
      stats.errors.push(`INDI ${row.xref}: failed to import a name: ${errorMessage(error)}`);
    }
  );

  await insertNotes(noteRows, 'person', ctx);
  await insertEvents(pendingEvents, 'individual', ctx);
}

/**
 * Phase 2: batch-import every family — base record, husband/wife/child
 * links (using Phase 1's `xrefToId`), and family events.
 */
async function importFamilies(families: GedcomFamily[], ctx: ImportContext): Promise<void> {
  const { db, xrefToId, pedigreeByChildFamily, stats } = ctx;
  if (families.length === 0) return;

  const ids = await batchInsert(
    db,
    families,
    1,
    (values) => `INSERT INTO families (id) VALUES ${values}`,
    () => [null],
    (family, error) => {
      stats.errors.push(`FAM ${family.xref}: ${errorMessage(error)}`);
    }
  );

  const memberRows: {
    familyId: number;
    individualId: number;
    xref: string;
    role: 'husband' | 'wife' | 'child';
    pedigree: Pedigree | null;
    sortOrder: number;
  }[] = [];
  const pendingEvents: PendingEvent[] = [];

  for (let i = 0; i < families.length; i++) {
    const familyId = ids[i];
    if (familyId === undefined) continue;
    const family = families[i];
    xrefToId.set(family.xref, familyId);
    stats.families++;

    if (family.husbandRef && xrefToId.has(family.husbandRef)) {
      memberRows.push({
        familyId,
        individualId: xrefToId.get(family.husbandRef)!,
        xref: family.xref,
        role: 'husband',
        pedigree: null,
        sortOrder: 0,
      });
    }
    if (family.wifeRef && xrefToId.has(family.wifeRef)) {
      memberRows.push({
        familyId,
        individualId: xrefToId.get(family.wifeRef)!,
        xref: family.xref,
        role: 'wife',
        pedigree: null,
        sortOrder: 0,
      });
    }

    let sortOrder = 0;
    for (const childXref of family.childRefs) {
      if (!xrefToId.has(childXref)) continue;
      const pedigree = pedigreeByChildFamily.get(`${childXref}:${family.xref}`) ?? null;
      memberRows.push({
        familyId,
        individualId: xrefToId.get(childXref)!,
        xref: family.xref,
        role: 'child',
        pedigree,
        sortOrder: sortOrder++,
      });
    }

    for (const event of family.events) {
      const pending = await resolvePendingEvent(event, familyId, family.xref, 'family', ctx);
      if (pending) pendingEvents.push(pending);
    }
  }

  await batchInsert(
    db,
    memberRows,
    5,
    (values) =>
      `INSERT INTO family_members (family_id, individual_id, role, pedigree, sort_order) VALUES ${values}`,
    (row) => [row.familyId, row.individualId, row.role, row.pedigree, row.sortOrder],
    (row, error) => {
      stats.errors.push(`FAM ${row.xref}: failed to link a member: ${errorMessage(error)}`);
    }
  );

  await insertEvents(pendingEvents, 'family', ctx);
}
