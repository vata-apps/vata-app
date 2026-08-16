/**
 * GEDCOM Exporter
 *
 * Exports tree database to GEDCOM 5.5.1 format.
 *
 * Data is pulled with a handful of whole-table selects and grouped in JS by
 * owner id — the same "constant number of queries regardless of tree size"
 * shape as `assembleEventsWithDetails` (`src/db/trees/events.ts`) — instead
 * of three queries per individual and two per family. See issue #270.
 */

import {
  serialize,
  type GedcomDocument,
  type GedcomEvent,
  type GedcomFamily,
  type GedcomFamilyChildRef,
  type GedcomIndividual,
  type GedcomName,
} from '@vata-apps/gedcom-parser';
import { getTreeDb } from '$/db/connection';

export interface ExportOptions {
  /** Tree name for header */
  treeName: string;
  /** Include living individuals (default: false for privacy) */
  includePrivate?: boolean;
}

// Database row types
interface IndividualRow {
  id: number;
  gender: string;
  is_living: number;
}

interface FamilyRow {
  id: number;
}

interface NameRow {
  individual_id: number;
  type: string;
  prefix: string | null;
  given_names: string | null;
  surname: string | null;
  suffix: string | null;
  nickname: string | null;
}

interface FamilyMemberRow {
  individual_id: number;
  family_id: number;
  role: 'husband' | 'wife' | 'child';
  pedigree: string | null;
}

interface EventRow {
  /** Not used beyond the query itself — kept in the SELECT so DISTINCT dedupes by event identity, not by the coincidence of two different events sharing the same tag/date/place/description. */
  id: number;
  tag: string | null;
  custom_name: string | null;
  date_original: string | null;
  place_full_name: string | null;
  description: string | null;
  individual_id: number | null;
  family_id: number | null;
}

/** Group rows by a key, preserving each group's relative row order. */
function groupBy<T, K>(rows: T[], keyOf: (row: T) => K | null): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const row of rows) {
    const key = keyOf(row);
    if (key === null) continue;
    const group = groups.get(key);
    if (group) {
      group.push(row);
    } else {
      groups.set(key, [row]);
    }
  }
  return groups;
}

function toGedcomEvent(row: EventRow): GedcomEvent {
  return {
    tag: row.tag ?? 'EVEN',
    type: row.tag === null ? (row.custom_name ?? undefined) : undefined,
    date: row.date_original || undefined,
    place: row.place_full_name || undefined,
    description: row.description || undefined,
    notes: [],
    sources: [],
  };
}

/**
 * Export current tree to GEDCOM format.
 *
 * @param options - Export options
 * @returns GEDCOM text content
 */
export async function exportGedcom(options: ExportOptions): Promise<string> {
  const db = await getTreeDb();
  const includePrivate = options.includePrivate ?? false;

  // None of these five queries depend on another's result — names,
  // family_members, and events are unconditional (or role-filtered)
  // whole-table selects, joined to their owners only afterward via
  // `groupBy` — so they run concurrently instead of five sequential round
  // trips.
  const [individualRows, familyRows, nameRows, familyMemberRows, eventRows] = await Promise.all([
    db.select<IndividualRow[]>(
      `SELECT id, gender, is_living FROM individuals ${includePrivate ? '' : 'WHERE is_living = 0'} ORDER BY id`
    ),
    db.select<FamilyRow[]>('SELECT id FROM families ORDER BY id'),
    db.select<NameRow[]>(
      `SELECT individual_id, type, prefix, given_names, surname, suffix, nickname
       FROM names ORDER BY individual_id, is_primary DESC, id`
    ),
    db.select<FamilyMemberRow[]>(
      `SELECT individual_id, family_id, role, pedigree
       FROM family_members ORDER BY family_id, sort_order`
    ),
    db.select<EventRow[]>(
      `SELECT DISTINCT e.id, et.tag, et.custom_name, e.date_original, p.full_name AS place_full_name,
              e.description, ep.individual_id, ep.family_id
       FROM events e
       JOIN event_participants ep ON ep.event_id = e.id
       JOIN event_types et ON et.id = e.event_type_id
       LEFT JOIN places p ON p.id = e.place_id
       WHERE ep.role = 'principal'
       ORDER BY e.date_sort, e.id`
    ),
  ]);

  // Fresh sequential XREFs assigned in id order.
  const individualXrefs = new Map<number, string>(
    individualRows.map((row, i) => [row.id, `I${i + 1}`])
  );
  const familyXrefs = new Map<number, string>(familyRows.map((row, i) => [row.id, `F${i + 1}`]));

  // Grouped in JS — a constant number of queries above regardless of how
  // many individuals/families the tree has.
  const namesByIndividual = groupBy(nameRows, (row) => row.individual_id);
  const familyMembersByIndividual = groupBy(familyMemberRows, (row) => row.individual_id);
  const familyMembersByFamily = groupBy(familyMemberRows, (row) => row.family_id);
  const eventsByIndividual = groupBy(eventRows, (row) => row.individual_id);
  const eventsByFamily = groupBy(eventRows, (row) => row.family_id);

  const document: GedcomDocument = {
    header: {
      sourceApp: 'Vata',
      sourceVersion: '0.1.0',
      gedcomVersion: '5.5.1',
      encoding: 'UTF-8',
    },
    individuals: individualRows.map((row) =>
      buildGedcomIndividual({
        row,
        individualXrefs,
        familyXrefs,
        nameRows: namesByIndividual.get(row.id) ?? [],
        memberRows: familyMembersByIndividual.get(row.id) ?? [],
        eventRows: eventsByIndividual.get(row.id) ?? [],
      })
    ),
    families: familyRows
      .map((row) =>
        buildGedcomFamily({
          row,
          familyXrefs,
          individualXrefs,
          memberRows: familyMembersByFamily.get(row.id) ?? [],
          eventRows: eventsByFamily.get(row.id) ?? [],
        })
      )
      .filter((family): family is GedcomFamily => family !== null),
    sources: [], // TODO: not yet supported
    repositories: [], // TODO: not yet supported
    notes: [],
  };

  return serialize(document, {
    sourceApp: 'Vata',
    sourceVersion: '0.1.0',
  });
}

function buildGedcomIndividual(options: {
  row: IndividualRow;
  individualXrefs: Map<number, string>;
  familyXrefs: Map<number, string>;
  nameRows: NameRow[];
  memberRows: FamilyMemberRow[];
  eventRows: EventRow[];
}): GedcomIndividual {
  const { row, individualXrefs, familyXrefs, nameRows, memberRows, eventRows } = options;
  const xref = individualXrefs.get(row.id);
  // Every row.id here came from the query that built individualXrefs, so
  // this is always set — the non-null assertion just documents that.
  if (!xref) throw new Error(`Missing XREF for individual ${row.id}`);

  const names: GedcomName[] = nameRows.map((name) => ({
    givenNames: name.given_names || undefined,
    surname: name.surname || undefined,
    prefix: name.prefix || undefined,
    suffix: name.suffix || undefined,
    nickname: name.nickname || undefined,
    type: name.type !== 'birth' ? name.type : undefined,
  }));

  const familySpouseRefs: string[] = [];
  const familyChildRefs: GedcomFamilyChildRef[] = [];
  for (const member of memberRows) {
    const famXref = familyXrefs.get(member.family_id);
    if (!famXref) continue;
    if (member.role === 'husband' || member.role === 'wife') {
      familySpouseRefs.push(famXref);
    } else {
      familyChildRefs.push({ familyXref: famXref, pedigree: member.pedigree ?? undefined });
    }
  }

  return {
    xref,
    names,
    gender: row.gender as 'M' | 'F' | 'U',
    events: eventRows.map(toGedcomEvent),
    familySpouseRefs,
    familyChildRefs,
    notes: [],
    sources: [],
  };
}

/** Returns `null` when privacy filtering excluded every member — the caller skips these entirely. */
function buildGedcomFamily(options: {
  row: FamilyRow;
  familyXrefs: Map<number, string>;
  individualXrefs: Map<number, string>;
  memberRows: FamilyMemberRow[];
  eventRows: EventRow[];
}): GedcomFamily | null {
  const { row, familyXrefs, individualXrefs, memberRows, eventRows } = options;
  const xref = familyXrefs.get(row.id);
  if (!xref) throw new Error(`Missing XREF for family ${row.id}`);

  let husbandRef: string | undefined;
  let wifeRef: string | undefined;
  const childRefs: string[] = [];

  for (const member of memberRows) {
    const indXref = individualXrefs.get(member.individual_id);
    if (!indXref) continue; // Individual excluded (privacy)

    if (member.role === 'husband') {
      husbandRef = indXref;
    } else if (member.role === 'wife') {
      wifeRef = indXref;
    } else {
      childRefs.push(indXref);
    }
  }

  // Privacy filtering removed every linked member.
  if (!husbandRef && !wifeRef && childRefs.length === 0) return null;

  return {
    xref,
    husbandRef,
    wifeRef,
    childRefs,
    events: eventRows.map(toGedcomEvent),
    notes: [],
    sources: [],
  };
}
