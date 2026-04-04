import { copyFile, exists, rename } from '@tauri-apps/plugin-fs';
import { basename, join } from '@tauri-apps/api/path';

/**
 * Get the media directory path for a tree folder.
 */
export function getMediaDir(treeFolderPath: string): string {
  return `${treeFolderPath}/media`;
}

/**
 * Generate a unique filename in a directory.
 * If "photo.jpg" already exists, tries "photo-1.jpg", "photo-2.jpg", etc.
 */
export async function deduplicateFilename(
  filename: string,
  directory: string
): Promise<string> {
  const filePath = await join(directory, filename);
  if (!(await exists(filePath))) return filename;

  const ext = filename.includes('.') ? '.' + filename.split('.').pop()! : '';
  const base = ext ? filename.slice(0, -ext.length) : filename;

  let counter = 1;
  let candidate = `${base}-${counter}${ext}`;
  while (await exists(await join(directory, candidate))) {
    counter++;
    candidate = `${base}-${counter}${ext}`;
  }
  return candidate;
}

/**
 * Copy a file into the tree's media/ directory.
 * Returns the relative path (for DB storage) and the final filename.
 */
export async function copyFileToTree(
  sourcePath: string,
  treeFolderPath: string
): Promise<{ relativePath: string; filename: string }> {
  const mediaDir = getMediaDir(treeFolderPath);
  const originalName = await basename(sourcePath);
  const filename = await deduplicateFilename(originalName, mediaDir);
  const destPath = await join(mediaDir, filename);

  await copyFile(sourcePath, destPath);

  return {
    relativePath: `media/${filename}`,
    filename,
  };
}

/**
 * Move a file into the tree's media/ directory.
 * Returns the relative path (for DB storage) and the final filename.
 */
export async function moveFileToTree(
  sourcePath: string,
  treeFolderPath: string
): Promise<{ relativePath: string; filename: string }> {
  const mediaDir = getMediaDir(treeFolderPath);
  const originalName = await basename(sourcePath);
  const filename = await deduplicateFilename(originalName, mediaDir);
  const destPath = await join(mediaDir, filename);

  await rename(sourcePath, destPath);

  return {
    relativePath: `media/${filename}`,
    filename,
  };
}
