import { openTreeDb, closeTreeDb } from '$/db/connection';
import { createTree, getTreeById, updateTreeStats, markTreeOpened } from '$/db/system/trees';
import { countIndividuals } from '$db-tree/individuals';
import { countFamilies } from '$db-tree/families';
import { useAppStore } from '$/store/app-store';
import { getTreePathForSlug, slugifyTreeName } from '$lib/tree-paths';

interface CreateTreeData {
  name: string;
  description?: string;
}

export class TreeManager {
  /**
   * Create a new tree and open its database.
   * Trees are stored in the app data directory under trees/<slug>/.
   * @returns The ID of the created tree
   */
  static async create(data: CreateTreeData): Promise<string> {
    const slug = slugifyTreeName(data.name) || crypto.randomUUID();
    const treePath = await getTreePathForSlug(slug);

    const treeId = await createTree({
      name: data.name,
      path: treePath,
      description: data.description,
    });

    await openTreeDb(treePath);

    return treeId;
  }

  /**
   * Open an existing tree by its ID.
   * Loads the tree metadata, opens its database, marks it as opened,
   * and sets it as the current tree in the app store.
   */
  static async open(treeId: string): Promise<void> {
    const tree = await getTreeById(treeId);
    if (!tree) {
      throw new Error(`Tree not found: ${treeId}`);
    }

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
   * Update the individual and family counts for a tree in the system database.
   */
  static async updateStats(treeId: string): Promise<void> {
    const individualCount = await countIndividuals();
    const familyCount = await countFamilies();

    await updateTreeStats(treeId, { individualCount, familyCount });
  }
}
