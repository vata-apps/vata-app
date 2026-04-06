import { invoke } from '@tauri-apps/api/core';
import { mkdir, exists } from '@tauri-apps/plugin-fs';

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/tiff'];
const THUMBNAIL_MAX_WIDTH = 200;
const THUMBNAILS_DIR = 'media/thumbnails';

/**
 * Generate a thumbnail for an image file in the tree's media directory.
 * Returns the relative path to the thumbnail, or null if generation fails or file is not an image.
 */
export async function generateThumbnail(
  treePath: string,
  relativePath: string,
  mimeType: string
): Promise<string | null> {
  if (!IMAGE_MIME_TYPES.includes(mimeType)) {
    return null;
  }

  const sourcePath = `${treePath}/${relativePath}`;
  const filename = relativePath.split('/').pop() ?? '';
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  const thumbFilename = `thumb_${nameWithoutExt}.jpg`;
  const thumbRelativePath = `${THUMBNAILS_DIR}/${thumbFilename}`;
  const thumbAbsolutePath = `${treePath}/${thumbRelativePath}`;
  const thumbDir = `${treePath}/${THUMBNAILS_DIR}`;

  try {
    const dirExists = await exists(thumbDir);
    if (!dirExists) {
      await mkdir(thumbDir, { recursive: true });
    }

    await invoke('generate_thumbnail', {
      sourcePath,
      destPath: thumbAbsolutePath,
      maxWidth: THUMBNAIL_MAX_WIDTH,
    });

    return thumbRelativePath;
  } catch {
    return null;
  }
}
