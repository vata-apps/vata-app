import type Database from '@tauri-apps/plugin-sql';
import { getSystemDb } from '../connection';
import type { Tree } from '$/types/database';

interface RawTree {
  id: number;
  name: string;
  path: string;
  description: string | null;
  individual_count: number;
  family_count: number;
  last_opened_at: string | null;
  created_at: string;
  updated_at: string;
}

const TREE_COLUMNS =
  'id, name, path, description, individual_count, family_count, last_opened_at, created_at, updated_at';

function mapToTree(raw: RawTree): Tree {
  return {
    id: String(raw.id),
    name: raw.name,
    path: raw.path,
    description: raw.description,
    individualCount: raw.individual_count,
    familyCount: raw.family_count,
    lastOpenedAt: raw.last_opened_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export async function getAllTrees(): Promise<Tree[]> {
  const db = await getSystemDb();
  const rows = await db.select<RawTree[]>(
    `SELECT ${TREE_COLUMNS} FROM trees ORDER BY last_opened_at DESC NULLS LAST, created_at DESC`
  );
  return rows.map(mapToTree);
}

export async function getTreeById(id: string): Promise<Tree | null> {
  const db = await getSystemDb();
  const rows = await db.select<RawTree[]>(`SELECT ${TREE_COLUMNS} FROM trees WHERE id = $1`, [
    parseInt(id, 10),
  ]);
  return rows[0] ? mapToTree(rows[0]) : null;
}

export async function treeExistsAtPath(path: string): Promise<boolean> {
  const db = await getSystemDb();
  const rows = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) AS count FROM trees WHERE path = $1`,
    [path]
  );
  return (rows[0]?.count ?? 0) > 0;
}

export async function createTree(
  data: { name: string; path: string; description?: string },
  dbOverride?: Database
): Promise<string> {
  const db = dbOverride ?? (await getSystemDb());
  const result = await db.execute(
    `INSERT INTO trees (name, path, description) VALUES ($1, $2, $3)`,
    [data.name, data.path, data.description ?? null]
  );
  return String(result.lastInsertId);
}

export async function updateTree(
  id: string,
  data: { name?: string; description?: string }
): Promise<void> {
  const db = await getSystemDb();
  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    sets.push(`name = $${paramIndex++}`);
    params.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push(`description = $${paramIndex++}`);
    params.push(data.description);
  }

  sets.push(`updated_at = datetime('now')`);
  params.push(parseInt(id, 10));

  await db.execute(`UPDATE trees SET ${sets.join(', ')} WHERE id = $${paramIndex}`, params);
}

export async function deleteTree(id: string): Promise<void> {
  const db = await getSystemDb();
  await db.execute('DELETE FROM trees WHERE id = $1', [parseInt(id, 10)]);
}

export async function updateTreeStats(
  id: string,
  stats: { individualCount?: number; familyCount?: number },
  dbOverride?: Database
): Promise<void> {
  const db = dbOverride ?? (await getSystemDb());
  const sets: string[] = [];
  const params: number[] = [];
  let paramIndex = 1;

  if (stats.individualCount !== undefined) {
    sets.push(`individual_count = $${paramIndex++}`);
    params.push(stats.individualCount);
  }
  if (stats.familyCount !== undefined) {
    sets.push(`family_count = $${paramIndex++}`);
    params.push(stats.familyCount);
  }

  sets.push(`updated_at = datetime('now')`);
  params.push(parseInt(id, 10));

  await db.execute(`UPDATE trees SET ${sets.join(', ')} WHERE id = $${paramIndex}`, params);
}

export async function markTreeOpened(id: string): Promise<void> {
  const db = await getSystemDb();
  await db.execute(
    `UPDATE trees SET last_opened_at = datetime('now'), updated_at = datetime('now') WHERE id = $1`,
    [parseInt(id, 10)]
  );
}
