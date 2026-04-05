import { appDataDir } from '@tauri-apps/api/path';

/**
 * Convert a tree name to a URL-safe slug.
 * Returns empty string if the name contains no alphanumeric characters.
 */
export function slugifyTreeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Build the absolute path to a tree's directory inside the app data dir.
 * The path does NOT include the .db file — callers should append `/<slug>.db`
 * when loading the database.
 */
export async function getTreePathForSlug(slug: string): Promise<string> {
  const baseDir = await appDataDir();
  return `${baseDir}/trees/${slug}`;
}
