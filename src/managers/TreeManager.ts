import { exists, remove } from '@tauri-apps/plugin-fs';
import { openTreeDb, closeTreeDb } from '$/db/connection';
import {
  createTree,
  deleteTree,
  getTreeById,
  treeExistsAtPath,
  updateTreeStats,
  markTreeOpened,
} from '$/db/system/trees';
import { countIndividuals } from '$db-tree/individuals';
import { countFamilies } from '$db-tree/families';
import { useAppStore } from '$/store/app-store';
import { getTreePathForSlug, slugifyTreeName } from '$lib/tree-paths';
import type { Tree } from '$types/database';

interface CreateTreeData {
  name: string;
  description?: string;
}

export class TreeManager {
  /**
   * Create a new tree and open its database.
   * Trees are stored in the app data directory under trees/<slug>/.
   * Tree names are not unique — when two trees share a slug, a `-2`,
   * `-3`, ... suffix is appended to the path so the underlying paths
   * stay unique while the user-visible name is preserved verbatim.
   * @returns The ID of the created tree
   */
  static async create(data: CreateTreeData): Promise<string> {
    const baseSlug = slugifyTreeName(data.name) || crypto.randomUUID();
    const treePath = await TreeManager.resolveAvailablePath(baseSlug);

    const treeId = await createTree({
      name: data.name,
      path: treePath,
      description: data.description,
    });

    await openTreeDb(treePath);

    return treeId;
  }

  private static async resolveAvailablePath(baseSlug: string): Promise<string> {
    const MAX_ATTEMPTS = 100;
    for (let suffix = 0; suffix < MAX_ATTEMPTS; suffix++) {
      const slug = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
      const candidate = await getTreePathForSlug(slug);
      // Check both system.db and the filesystem: a directory can exist
      // without a row (leftover from a delete) or a row without a
      // directory (not yet created), so neither check alone is enough
      // to call a path free.
      const [dbHasPath, fsHasPath] = await Promise.all([
        treeExistsAtPath(candidate),
        exists(candidate),
      ]);
      if (dbHasPath || fsHasPath) continue;
      return candidate;
    }
    throw new Error(
      `Unable to find an available path for slug "${baseSlug}" after ${MAX_ATTEMPTS} attempts`
    );
  }

  private static async getTreeOrThrow(treeId: string): Promise<Tree> {
    const tree = await getTreeById(treeId);
    if (!tree) {
      throw new Error(`Tree not found: ${treeId}`);
    }
    return tree;
  }

  /**
   * Open an existing tree by its ID.
   * Loads the tree metadata, opens its database, marks it as opened,
   * and sets it as the current tree in the app store.
   */
  static async open(treeId: string): Promise<void> {
    const tree = await TreeManager.getTreeOrThrow(treeId);

    await openTreeDb(tree.path);
    await markTreeOpened(treeId);
    useAppStore.getState().setCurrentTree(treeId);
  }

  /**
   * Close the currently open tree database and clear the current tree.
   */
  static async close(): Promise<void> {
    await closeTreeDb();
    useAppStore.getState().setCurrentTree(null);
  }

  /**
   * Delete a tree: removes its row from system.db, then its directory
   * (database file + media) from disk. The row goes first so a failed
   * directory removal can't leave a row pointing at a wiped path that
   * `open()` would silently recreate as an empty tree. A leftover
   * directory from a failed removal is harmless: `resolveAvailablePath`
   * checks the filesystem directly, so it can never be adopted by a
   * future tree.
   */
  static async delete(treeId: string): Promise<void> {
    const tree = await TreeManager.getTreeOrThrow(treeId);

    await deleteTree(treeId);

    try {
      if (await exists(tree.path)) {
        await remove(tree.path, { recursive: true });
      }
    } catch (err) {
      // The row is already gone — the user-visible delete succeeded.
      // Log rather than throw so a disk-level failure here doesn't
      // surface as an error for an operation that already completed.
      console.error(`Failed to remove tree directory for deleted tree ${treeId}:`, err);
    }
  }

  /**
   * Update the individual and family counts for a tree in the system database.
   */
  static async updateStats(treeId: string): Promise<void> {
    const individualCount = await countIndividuals();
    const familyCount = await countFamilies();

    await updateTreeStats(treeId, { individualCount, familyCount });
  }
}
