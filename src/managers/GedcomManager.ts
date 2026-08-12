/**
 * GEDCOM Manager
 *
 * Orchestrates GEDCOM import/export operations including file dialogs,
 * tree creation, and database operations.
 */

import { importGedcom, type ImportStats } from '$/lib/gedcom/importer';
import { exportGedcom } from '$/lib/gedcom/exporter';
import { validate } from '@vata-apps/gedcom-parser';
import { updateTreeStats, markTreeOpened } from '$/db/system/trees';
import { countLivingIndividuals } from '$db-tree/individuals';
import { getTreeDb } from '$/db/connection';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { open, save } from '@tauri-apps/plugin-dialog';
import { TreeManager } from '$managers/TreeManager';

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
 * Pre-import scan summary surfaced by the Import GEDCOM modal.
 *
 * `places` is exposed for the UI but always 0 today — the local parser
 * counts top-level records (INDI, FAM, SOUR, REPO) and does not yet
 * dedupe PLAC sub-tags inside events.
 */
export interface ScanResult {
  individuals: number;
  families: number;
  places: number;
  sources: number;
  repositories: number;
  errors: string[];
  warnings: string[];
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

    return GedcomManager.importIntoNewTree(treeName, `Imported from ${filename}`, content);
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
    return GedcomManager.importIntoNewTree(treeName, 'Imported from GEDCOM', content);
  }

  /**
   * Create a tree and import GEDCOM content into it.
   *
   * `importGedcom` isn't wrapped in a DB transaction (see its own doc
   * comment) so a failure partway through can leave a partially-populated
   * tree. Since this always creates a brand-new tree for the import,
   * "partial" here means "worthless" — clean it up with
   * `TreeManager.delete` rather than leaving a broken half-imported tree
   * sitting in the picker.
   */
  private static async importIntoNewTree(
    treeName: string,
    description: string,
    content: string
  ): Promise<ImportResult> {
    const treeId = await TreeManager.create({ name: treeName, description });

    let stats: ImportStats;
    try {
      stats = await importGedcom(content);
    } catch (err) {
      try {
        await TreeManager.delete(treeId);
      } catch (cleanupErr) {
        console.error(`Failed to clean up tree ${treeId} after a failed import:`, cleanupErr);
      }
      throw err;
    }

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
   * Scan GEDCOM content for the import preview.
   *
   * Counts top-level records and splits errors from warnings so the
   * modal can render two distinct lists. `places` is always 0 — see
   * {@link ScanResult.places}.
   *
   * @param content - GEDCOM text content
   * @returns Scan result with counts and split error/warning lists
   */
  static scan(content: string): ScanResult {
    const result = validate(content);

    const errors: string[] = [];
    const warnings: string[] = [];
    for (const err of result.errors) {
      if (err.severity === 'warning') {
        warnings.push(err.message);
      } else {
        errors.push(err.message);
      }
    }

    return {
      individuals: result.stats.individuals,
      families: result.stats.families,
      places: 0,
      sources: result.stats.sources,
      repositories: result.stats.repositories,
      errors,
      warnings,
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

  /**
   * Count individuals the export's privacy filter would exclude when
   * `includePrivate` is false — surfaced by the export UI so hiding living
   * individuals doesn't silently drop most of the tree with no warning.
   */
  static async getLivingCount(): Promise<number> {
    return countLivingIndividuals();
  }
}
