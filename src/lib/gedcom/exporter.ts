/**
 * GEDCOM Exporter
 *
 * Exports tree database to GEDCOM 5.5.1 format.
 */

import {
  serialize,
  type GedcomDocument,
  type GedcomIndividual,
  type GedcomFamily,
  type GedcomName,
  type GedcomEvent,
} from '@vata-apps/gedcom-parser';
import { getTreeDb } from '$/db/connection';
import { formatEntityId } from '$/lib/entityId';
import type Database from '@tauri-apps/plugin-sql';

export interface ExportOptions {
  /** Tree name for header */
  treeName: string;
  /** Include living individuals (default: false for privacy) */
  includePrivate?: boolean;
}

interface ExportContext {
  db: Database;
  individualXrefs: Map<string, string>;
  familyXrefs: Map<string, string>;
  includePrivate: boolean;
}

// Database row types
interface IndividualRow {
  id: number;
  gender: string;
  is_living: number;
}

interface NameRow {
  id: number;
  type: string;
  prefix: string | null;
  given_names: string | null;
  surname: string | null;
  suffix: string | null;
  nickname: string | null;
}

interface EventRow {
  id: number;
  tag: string | null;
  custom_name: string | null;
  date_original: string | null;
  place_full_name: string | null;
  description: string | null;
}

interface FamilyRow {
  id: number;
}

interface FamilyMemberRow {
  individual_id: number;
  role: string;
}

/**
 * Export current tree to GEDCOM format.
 *
 * @param options - Export options
 * @returns GEDCOM text content
 */
export async function exportGedcom(options: ExportOptions): Promise<string> {
  const db = await getTreeDb();

  const context: ExportContext = {
    db,
    individualXrefs: new Map(),
    familyXrefs: new Map(),
    includePrivate: options.includePrivate ?? false,
  };

  const document: GedcomDocument = {
    header: {
      sourceApp: 'Vata',
      sourceVersion: '0.1.0',
      gedcomVersion: '5.5.1',
      encoding: 'UTF-8',
    },
    individuals: [],
    families: [],
    sources: [], // MVP5
    repositories: [], // MVP5
    notes: [],
  };

  // First pass: assign XREFs to all individuals and families
  await assignXrefs(context);

  // Export individuals
  document.individuals = await exportIndividuals(context);

  // Export families
  document.families = await exportFamilies(context);

  return serialize(document, {
    sourceApp: 'Vata',
    sourceVersion: '0.1.0',
  });
}

/**
 * Assign XREFs to all individuals and families for export.
 */
async function assignXrefs(ctx: ExportContext): Promise<void> {
  const { db, individualXrefs, familyXrefs, includePrivate } = ctx;

  // Assign individual XREFs
  const whereClause = includePrivate ? '' : 'WHERE is_living = 0';
  const individuals = await db.select<{ id: number }[]>(
    `SELECT id FROM individuals ${whereClause} ORDER BY id`
  );

  let xrefCounter = 1;
  for (const row of individuals) {
    const entityId = formatEntityId('I', row.id);
    individualXrefs.set(entityId, `I${xrefCounter++}`);
  }

  // Assign family XREFs
  const families = await db.select<{ id: number }[]>('SELECT id FROM families ORDER BY id');

  xrefCounter = 1;
  for (const row of families) {
    const entityId = formatEntityId('F', row.id);
    familyXrefs.set(entityId, `F${xrefCounter++}`);
  }
}

/**
 * Export all individuals.
 */
async function exportIndividuals(ctx: ExportContext): Promise<GedcomIndividual[]> {
  const { db, individualXrefs, familyXrefs, includePrivate } = ctx;
  const result: GedcomIndividual[] = [];

  const whereClause = includePrivate ? '' : 'WHERE is_living = 0';
  const individuals = await db.select<IndividualRow[]>(
    `SELECT id, gender, is_living FROM individuals ${whereClause} ORDER BY id`
  );

  for (const row of individuals) {
    const entityId = formatEntityId('I', row.id);
    const xref = individualXrefs.get(entityId);
    if (!xref) continue;

    // Get names
    const names = await exportNames(row.id, ctx);

    // Get events
    const events = await exportIndividualEvents(row.id, ctx);

    // Get family references
    const familyRefs = await db.select<{ family_id: number; role: string }[]>(
      `SELECT family_id, role FROM family_members WHERE individual_id = $1`,
      [row.id]
    );

    const familySpouseRefs: string[] = [];
    const familyChildRefs: string[] = [];

    for (const ref of familyRefs) {
      const famEntityId = formatEntityId('F', ref.family_id);
      const famXref = familyXrefs.get(famEntityId);
      if (famXref) {
        if (ref.role === 'husband' || ref.role === 'wife') {
          familySpouseRefs.push(famXref);
        } else if (ref.role === 'child') {
          familyChildRefs.push(famXref);
        }
      }
    }

    result.push({
      xref,
      names,
      gender: row.gender as 'M' | 'F' | 'U',
      events,
      familySpouseRefs,
      familyChildRefs,
      notes: [],
      sources: [],
    });
  }

  return result;
}

/**
 * Export names for an individual.
 */
async function exportNames(individualId: number, ctx: ExportContext): Promise<GedcomName[]> {
  const { db } = ctx;

  const rows = await db.select<NameRow[]>(
    `SELECT id, type, prefix, given_names, surname, suffix, nickname
     FROM names WHERE individual_id = $1 ORDER BY is_primary DESC, id`,
    [individualId]
  );

  return rows.map((row) => ({
    givenNames: row.given_names || undefined,
    surname: row.surname || undefined,
    prefix: row.prefix || undefined,
    suffix: row.suffix || undefined,
    nickname: row.nickname || undefined,
    type: row.type !== 'birth' ? row.type : undefined,
  }));
}

/**
 * Export events for an individual.
 */
async function exportIndividualEvents(
  individualId: number,
  ctx: ExportContext
): Promise<GedcomEvent[]> {
  const { db } = ctx;

  const rows = await db.select<EventRow[]>(
    `SELECT e.id, et.tag, et.custom_name, e.date_original, p.full_name AS place_full_name, e.description
     FROM events e
     JOIN event_participants ep ON ep.event_id = e.id
     JOIN event_types et ON et.id = e.event_type_id
     LEFT JOIN places p ON p.id = e.place_id
     WHERE ep.individual_id = $1
     ORDER BY e.date_sort, e.id`,
    [individualId]
  );

  return rows.map((row) => ({
    tag: row.tag ?? 'EVEN',
    type: row.tag === null ? (row.custom_name ?? undefined) : undefined,
    date: row.date_original || undefined,
    place: row.place_full_name || undefined,
    description: row.description || undefined,
    notes: [],
    sources: [],
  }));
}

/**
 * Export all families.
 */
async function exportFamilies(ctx: ExportContext): Promise<GedcomFamily[]> {
  const { db, individualXrefs, familyXrefs } = ctx;
  const result: GedcomFamily[] = [];

  const families = await db.select<FamilyRow[]>('SELECT id FROM families ORDER BY id');

  for (const row of families) {
    const entityId = formatEntityId('F', row.id);
    const xref = familyXrefs.get(entityId);
    if (!xref) continue;

    // Get members
    const members = await db.select<FamilyMemberRow[]>(
      `SELECT individual_id, role FROM family_members WHERE family_id = $1 ORDER BY sort_order`,
      [row.id]
    );

    let husbandRef: string | undefined;
    let wifeRef: string | undefined;
    const childRefs: string[] = [];

    for (const member of members) {
      const indEntityId = formatEntityId('I', member.individual_id);
      const indXref = individualXrefs.get(indEntityId);
      if (!indXref) continue; // Individual excluded (privacy)

      if (member.role === 'husband') {
        husbandRef = indXref;
      } else if (member.role === 'wife') {
        wifeRef = indXref;
      } else if (member.role === 'child') {
        childRefs.push(indXref);
      }
    }

    // Get family events
    const events = await exportFamilyEvents(row.id, ctx);

    result.push({
      xref,
      husbandRef,
      wifeRef,
      childRefs,
      events,
      notes: [],
      sources: [],
    });
  }

  return result;
}

/**
 * Export events for a family.
 */
async function exportFamilyEvents(familyId: number, ctx: ExportContext): Promise<GedcomEvent[]> {
  const { db } = ctx;

  const rows = await db.select<EventRow[]>(
    `SELECT e.id, et.tag, et.custom_name, e.date_original, p.full_name AS place_full_name, e.description
     FROM events e
     JOIN event_participants ep ON ep.event_id = e.id
     JOIN event_types et ON et.id = e.event_type_id
     LEFT JOIN places p ON p.id = e.place_id
     WHERE ep.family_id = $1
     ORDER BY e.date_sort, e.id`,
    [familyId]
  );

  return rows.map((row) => ({
    tag: row.tag ?? 'EVEN',
    type: row.tag === null ? (row.custom_name ?? undefined) : undefined,
    date: row.date_original || undefined,
    place: row.place_full_name || undefined,
    description: row.description || undefined,
    notes: [],
    sources: [],
  }));
}
