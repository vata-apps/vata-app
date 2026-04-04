/**
 * GEDCOM Manager
 *
 * Orchestrates GEDCOM import/export operations including file dialogs,
 * tree creation, and database operations.
 */

import { importGedcom, type ImportStats } from '$/lib/gedcom/importer';
import { exportGedcom } from '$/lib/gedcom/exporter';
import { validate } from '@vata-apps/gedcom-parser';
import { createTree, updateTreeStats, markTreeOpened } from '$/db/system/trees';
import { openTreeDb, getTreeDb } from '$/db/connection';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { open, save } from '@tauri-apps/plugin-dialog';
import { appDataDir } from '@tauri-apps/api/path';

export interface ImportResult {
  treeId: string;
  stats: ImportStats;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  stats: {
    individuals: number;
    families: number;
  };
}

/**
 * Manages GEDCOM import/export operations.
 */
export class GedcomManager {
  /**
   * Import a GEDCOM file into a new tree.
   *
   * Opens a file dialog, creates a new tree, and imports the GEDCOM data.
   *
   * @returns Import result with tree ID and stats, or null if cancelled
   */
  static async importFromFile(): Promise<ImportResult | null> {
    // Open file dialog
    const selected = await open({
      multiple: false,
      filters: [{ name: 'GEDCOM', extensions: ['ged', 'gedcom'] }],
    });

    if (!selected) return null;

    // Read file content
    const filePath = selected as string;
    const content = await readTextFile(filePath);

    // Extract tree name from filename
    const filename = filePath.split('/').pop() ?? 'imported';
    const treeName = filename.replace(/\.[^.]+$/, '');

    // Create tree folder in app data directory
    const baseDir = await appDataDir();
    const slug = treeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || crypto.randomUUID();
    const treePath = `${baseDir}trees/${slug}`;

    // Create new tree in system database
    const treeId = await createTree({
      name: treeName,
      path: treePath,
      description: `Imported from ${filename}`,
    });

    // Open the tree database
    await openTreeDb(treePath);

    // Import GEDCOM data
    const stats = await importGedcom(content);

    // Update tree stats
    await updateTreeStats(treeId, {
      individualCount: stats.individuals,
      familyCount: stats.families,
    });

    // Mark as opened
    await markTreeOpened(treeId);

    return { treeId, stats };
  }

  /**
   * Import GEDCOM content directly (without file dialog).
   *
   * Useful for testing or programmatic imports.
   *
   * @param content - GEDCOM text content
   * @param treeName - Name for the new tree
   * @returns Import result with tree ID and stats
   */
  static async importFromContent(content: string, treeName: string): Promise<ImportResult> {
    const baseDir = await appDataDir();
    const slug = treeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || crypto.randomUUID();
    const treePath = `${baseDir}trees/${slug}`;

    const treeId = await createTree({
      name: treeName,
      path: treePath,
      description: 'Imported from GEDCOM',
    });

    await openTreeDb(treePath);

    const stats = await importGedcom(content);

    await updateTreeStats(treeId, {
      individualCount: stats.individuals,
      familyCount: stats.families,
    });

    await markTreeOpened(treeId);

    return { treeId, stats };
  }

  /**
   * Export current tree to a GEDCOM file.
   *
   * Opens a save dialog and writes the GEDCOM content.
   *
   * @param treeName - Name for the exported file
   * @param includePrivate - Include living individuals (default: false)
   * @returns true if exported successfully, false if cancelled
   */
  static async exportToFile(treeName: string, includePrivate: boolean = false): Promise<boolean> {
    // Generate GEDCOM content
    const content = await exportGedcom({
      treeName,
      includePrivate,
    });

    // Open save dialog
    const savePath = await save({
      defaultPath: `${treeName}.ged`,
      filters: [{ name: 'GEDCOM', extensions: ['ged'] }],
    });

    if (!savePath) return false;

    // Write file
    await writeTextFile(savePath, content);

    return true;
  }

  /**
   * Export current tree to GEDCOM string (without file dialog).
   *
   * @param treeName - Tree name for header
   * @param includePrivate - Include living individuals
   * @returns GEDCOM text content
   */
  static async exportToString(treeName: string, includePrivate: boolean = false): Promise<string> {
    return exportGedcom({
      treeName,
      includePrivate,
    });
  }

  /**
   * Validate GEDCOM content without importing.
   *
   * @param content - GEDCOM text content
   * @returns Validation result with errors and stats
   */
  static validate(content: string): ValidationResult {
    const result = validate(content);

    return {
      valid: result.valid,
      errors: result.errors.map((e) => e.message),
      stats: {
        individuals: result.stats.individuals,
        families: result.stats.families,
      },
    };
  }

  /**
   * Get counts from the current tree database.
   *
   * @returns Object with individual and family counts
   */
  static async getTreeCounts(): Promise<{ individuals: number; families: number }> {
    const db = await getTreeDb();

    const indResult = await db.select<{ count: number }[]>(
      'SELECT COUNT(*) as count FROM individuals'
    );
    const famResult = await db.select<{ count: number }[]>(
      'SELECT COUNT(*) as count FROM families'
    );

    return {
      individuals: indResult[0]?.count ?? 0,
      families: famResult[0]?.count ?? 0,
    };
  }
}
