import { getTreeDb } from '../connection';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import type {
  TreeFile,
  CreateFileInput,
  UpdateFileInput,
  CreateSourceFileInput,
} from '$/types/database';

// =============================================================================
// Raw database row types (snake_case as in SQLite)
// =============================================================================

interface RawTreeFile {
  id: number;
  original_filename: string;
  relative_path: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  thumbnail_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Mapping functions
// =============================================================================

function mapToTreeFile(raw: RawTreeFile): TreeFile {
  return {
    id: String(raw.id),
    originalFilename: raw.original_filename,
    relativePath: raw.relative_path,
    mimeType: raw.mime_type,
    fileSize: raw.file_size,
    width: raw.width,
    height: raw.height,
    thumbnailPath: raw.thumbnail_path,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// =============================================================================
// TreeFile CRUD Operations
// =============================================================================

/**
 * Get a file by ID
 */
export async function getFileById(id: string): Promise<TreeFile | null> {
  const db = await getTreeDb();
  const dbId = parseInt(id, 10);
  const rows = await db.select<RawTreeFile[]>(
    `SELECT id, original_filename, relative_path, mime_type, file_size, width, height, thumbnail_path, notes, created_at, updated_at
     FROM files
     WHERE id = $1`,
    [dbId]
  );
  return rows[0] ? mapToTreeFile(rows[0]) : null;
}

/**
 * Create a new file
 * @returns The ID of the created file
 */
export async function createFile(input: CreateFileInput): Promise<string> {
  const db = await getTreeDb();
  const result = await db.execute(
    `INSERT INTO files (original_filename, relative_path, mime_type, file_size, width, height, thumbnail_path, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      input.originalFilename,
      input.relativePath,
      input.mimeType,
      input.fileSize,
      input.width ?? null,
      input.height ?? null,
      input.thumbnailPath ?? null,
      input.notes ?? null,
    ]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create file: no lastInsertId returned');
  }

  return String(result.lastInsertId);
}

/**
 * Update a file
 */
export async function updateFile(id: string, input: UpdateFileInput): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseInt(id, 10);

  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  let paramIndex = 1;

  if (input.notes !== undefined) {
    sets.push(`notes = $${paramIndex++}`);
    params.push(input.notes ?? null);
  }
  if (input.thumbnailPath !== undefined) {
    sets.push(`thumbnail_path = $${paramIndex++}`);
    params.push(input.thumbnailPath ?? null);
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = datetime('now')`);
  params.push(dbId);

  await db.execute(`UPDATE files SET ${sets.join(', ')} WHERE id = $${paramIndex}`, params);
}

/**
 * Delete a file
 */
export async function deleteFile(id: string): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseInt(id, 10);
  await db.execute('DELETE FROM files WHERE id = $1', [dbId]);
}

// =============================================================================
// SourceFile Operations
// =============================================================================

/**
 * Get all files for a source, ordered by sort_order
 */
export async function getFilesBySourceId(sourceId: string): Promise<TreeFile[]> {
  const db = await getTreeDb();
  const dbSourceId = parseEntityId(sourceId);
  const rows = await db.select<RawTreeFile[]>(
    `SELECT f.id, f.original_filename, f.relative_path, f.mime_type, f.file_size, f.width, f.height, f.thumbnail_path, f.notes, f.created_at, f.updated_at
     FROM source_files sf
     JOIN files f ON f.id = sf.file_id
     WHERE sf.source_id = $1
     ORDER BY sf.sort_order`,
    [dbSourceId]
  );
  return rows.map(mapToTreeFile);
}

/**
 * Add a file to a source
 * @returns The ID of the created source_file junction record
 */
export async function addFileToSource(input: CreateSourceFileInput): Promise<string> {
  const db = await getTreeDb();
  const dbSourceId = parseEntityId(input.sourceId);
  const dbFileId = parseInt(input.fileId, 10);
  const result = await db.execute(
    `INSERT INTO source_files (source_id, file_id, sort_order)
     VALUES ($1, $2, $3)`,
    [dbSourceId, dbFileId, input.sortOrder ?? 0]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to add file to source: no lastInsertId returned');
  }

  return String(result.lastInsertId);
}

/**
 * Remove a file from a source
 */
export async function removeFileFromSource(sourceId: string, fileId: string): Promise<void> {
  const db = await getTreeDb();
  const dbSourceId = parseEntityId(sourceId);
  const dbFileId = parseInt(fileId, 10);
  await db.execute('DELETE FROM source_files WHERE source_id = $1 AND file_id = $2', [
    dbSourceId,
    dbFileId,
  ]);
}

/**
 * Get all source IDs that reference a given file
 * @returns Array of formatted source IDs (e.g., "S-0001")
 */
export async function getSourcesByFileId(fileId: string): Promise<string[]> {
  const db = await getTreeDb();
  const dbFileId = parseInt(fileId, 10);
  const rows = await db.select<{ source_id: number }[]>(
    `SELECT source_id
     FROM source_files
     WHERE file_id = $1
     ORDER BY source_id`,
    [dbFileId]
  );
  return rows.map((row) => formatEntityId('S', row.source_id));
}
