import { getTreeDb } from '../connection';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import type { CreateNoteInput, Note, NoteScope, UpdateNoteInput } from '$types/database';

// =============================================================================
// Raw database row type (snake_case as in SQLite)
// =============================================================================

interface RawNote {
  id: number;
  individual_id: number;
  scope: NoteScope;
  event_id: number | null;
  family_member_id: number | null;
  text: string;
  is_private: number;
  created_at: string;
  updated_at: string;
}

const NOTE_COLUMNS =
  'id, individual_id, scope, event_id, family_member_id, text, is_private, created_at, updated_at';

// =============================================================================
// Mapping function
// =============================================================================

function mapToNote(raw: RawNote): Note {
  return {
    id: String(raw.id),
    individualId: formatEntityId('I', raw.individual_id),
    scope: raw.scope,
    eventId: raw.event_id !== null ? formatEntityId('E', raw.event_id) : null,
    familyMemberId: raw.family_member_id !== null ? String(raw.family_member_id) : null,
    text: raw.text,
    isPrivate: raw.is_private === 1,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Every note surfaced on one person's Notes tab: their own, plus notes on
 * their events and relations — every scope shares this one query since a
 * note always carries the tab's own `individual_id` regardless of what it is
 * actually about (see `Note.eventId`/`familyMemberId`).
 */
export async function getNotesForIndividual(individualId: string): Promise<Note[]> {
  const db = await getTreeDb();
  const dbId = parseEntityId(individualId);
  const rows = await db.select<RawNote[]>(
    `SELECT ${NOTE_COLUMNS} FROM notes WHERE individual_id = $1 ORDER BY id`,
    [dbId]
  );
  return rows.map(mapToNote);
}

/**
 * Create a note.
 * @returns The ID of the created note
 */
export async function createNote(input: CreateNoteInput): Promise<string> {
  const db = await getTreeDb();
  const result = await db.execute(
    `INSERT INTO notes (individual_id, scope, event_id, family_member_id, text, is_private)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      parseEntityId(input.individualId),
      input.scope,
      input.eventId ? parseEntityId(input.eventId) : null,
      input.familyMemberId ? parseInt(input.familyMemberId, 10) : null,
      input.text,
      input.isPrivate ? 1 : 0,
    ]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create note: no lastInsertId returned');
  }

  return String(result.lastInsertId);
}

/**
 * Update a note's content or privacy. Scope and target are fixed at creation —
 * see `note-detail.tsx`'s doc comment.
 */
export async function updateNote(id: string, input: UpdateNoteInput): Promise<void> {
  const db = await getTreeDb();
  const noteId = parseInt(id, 10);

  const sets: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (input.text !== undefined) {
    sets.push(`text = $${paramIndex++}`);
    params.push(input.text);
  }
  if (input.isPrivate !== undefined) {
    sets.push(`is_private = $${paramIndex++}`);
    params.push(input.isPrivate ? 1 : 0);
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = datetime('now')`);
  params.push(noteId);

  await db.execute(`UPDATE notes SET ${sets.join(', ')} WHERE id = $${paramIndex}`, params);
}

/**
 * Delete a note
 */
export async function deleteNote(id: string): Promise<void> {
  const db = await getTreeDb();
  await db.execute('DELETE FROM notes WHERE id = $1', [parseInt(id, 10)]);
}

// =============================================================================
// Counts — for the "this will also delete N notes" cascade-delete warning on
// the Events/Relations tabs (`notes.event_id`/`family_member_id` are
// `ON DELETE CASCADE`).
// =============================================================================

/**
 * How many notes are attached to one event.
 */
export async function countNotesForEvent(eventId: string): Promise<number> {
  const db = await getTreeDb();
  const dbId = parseEntityId(eventId);
  const rows = await db.select<{ count: number }[]>(
    'SELECT COUNT(*) as count FROM notes WHERE event_id = $1',
    [dbId]
  );
  return rows[0]?.count ?? 0;
}

/**
 * How many notes are attached to one relation (a `family_members` row).
 */
export async function countNotesForFamilyMember(familyMemberId: string): Promise<number> {
  const db = await getTreeDb();
  const rows = await db.select<{ count: number }[]>(
    'SELECT COUNT(*) as count FROM notes WHERE family_member_id = $1',
    [parseInt(familyMemberId, 10)]
  );
  return rows[0]?.count ?? 0;
}
