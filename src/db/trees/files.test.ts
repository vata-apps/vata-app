import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import {
  getFileById,
  createFile,
  updateFile,
  deleteFile,
  getFilesBySourceId,
  addFileToSource,
  removeFileFromSource,
  getSourcesByFileId,
} from './files';
import { createSource } from './sources';

// A single in-memory DB shared across all tests in this file.
// getTreeDb is mocked to always return this instance.
// Each test clears the data in beforeEach.
const db = createTreeInMemoryDb();

vi.mock('../connection', () => ({
  getTreeDb: vi.fn(),
}));

// Lazily resolve the mock after the module is loaded
import('../connection').then(({ getTreeDb }) => {
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
});

beforeEach(async () => {
  // Re-apply the mock value in case it was reset
  const { getTreeDb } = await import('../connection');
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
  db._raw.exec('DELETE FROM source_files');
  db._raw.exec('DELETE FROM files');
  db._raw.exec('DELETE FROM sources');
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function seedFile(overrides: Partial<Parameters<typeof createFile>[0]> = {}) {
  return createFile({
    originalFilename: 'photo.jpg',
    relativePath: `files/${Date.now()}-${Math.random()}.jpg`,
    mimeType: 'image/jpeg',
    fileSize: 1024,
    ...overrides,
  });
}

async function seedSource(title = 'Test Source') {
  return createSource({ title });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('createFile', () => {
  it('creates a file with all fields and returns a string id', async () => {
    const id = await createFile({
      originalFilename: 'document.pdf',
      relativePath: 'files/document.pdf',
      mimeType: 'application/pdf',
      fileSize: 2048,
      width: 800,
      height: 600,
      thumbnailPath: 'thumbs/document.png',
      notes: 'Important document',
    });

    expect(typeof id).toBe('string');
    expect(id).toBeTruthy();

    const file = await getFileById(id);
    expect(file).not.toBeNull();
    expect(file?.originalFilename).toBe('document.pdf');
    expect(file?.relativePath).toBe('files/document.pdf');
    expect(file?.mimeType).toBe('application/pdf');
    expect(file?.fileSize).toBe(2048);
    expect(file?.width).toBe(800);
    expect(file?.height).toBe(600);
    expect(file?.thumbnailPath).toBe('thumbs/document.png');
    expect(file?.notes).toBe('Important document');
  });
});

describe('getFileById', () => {
  it('returns the matching file', async () => {
    const id = await seedFile({ originalFilename: 'test.jpg' });
    const file = await getFileById(id);
    expect(file).not.toBeNull();
    expect(file?.originalFilename).toBe('test.jpg');
  });

  it('returns null for non-existent id', async () => {
    expect(await getFileById('9999')).toBeNull();
  });
});

describe('updateFile', () => {
  it('changes the notes', async () => {
    const id = await seedFile();
    await updateFile(id, { notes: 'Updated notes' });
    const file = await getFileById(id);
    expect(file?.notes).toBe('Updated notes');
  });

  it('changes the thumbnailPath', async () => {
    const id = await seedFile();
    await updateFile(id, { thumbnailPath: 'thumbs/new.png' });
    const file = await getFileById(id);
    expect(file?.thumbnailPath).toBe('thumbs/new.png');
  });
});

describe('deleteFile', () => {
  it('removes the file', async () => {
    const id = await seedFile();
    await deleteFile(id);
    expect(await getFileById(id)).toBeNull();
  });
});

describe('addFileToSource', () => {
  it('links a file to a source', async () => {
    const sourceId = await seedSource();
    const fileId = await seedFile();

    const linkId = await addFileToSource({ sourceId, fileId });
    expect(linkId).toBeTruthy();

    const files = await getFilesBySourceId(sourceId);
    expect(files).toHaveLength(1);
    expect(files[0].id).toBe(fileId);
  });
});

describe('getFilesBySourceId', () => {
  it('returns files ordered by sort_order', async () => {
    const sourceId = await seedSource();
    const fileId1 = await seedFile({ originalFilename: 'second.jpg' });
    const fileId2 = await seedFile({ originalFilename: 'first.jpg' });

    await addFileToSource({ sourceId, fileId: fileId1, sortOrder: 2 });
    await addFileToSource({ sourceId, fileId: fileId2, sortOrder: 1 });

    const files = await getFilesBySourceId(sourceId);
    expect(files).toHaveLength(2);
    expect(files[0].originalFilename).toBe('first.jpg');
    expect(files[1].originalFilename).toBe('second.jpg');
  });

  it('returns empty array when source has no files', async () => {
    const sourceId = await seedSource();
    const files = await getFilesBySourceId(sourceId);
    expect(files).toEqual([]);
  });
});

describe('removeFileFromSource', () => {
  it('unlinks a file from a source', async () => {
    const sourceId = await seedSource();
    const fileId = await seedFile();

    await addFileToSource({ sourceId, fileId });

    await removeFileFromSource(sourceId, fileId);

    const files = await getFilesBySourceId(sourceId);
    expect(files).toHaveLength(0);
  });
});

describe('getSourcesByFileId', () => {
  it('returns source IDs for a file', async () => {
    const sourceId1 = await seedSource('Source A');
    const sourceId2 = await seedSource('Source B');
    const fileId = await seedFile();

    await addFileToSource({ sourceId: sourceId1, fileId });
    await addFileToSource({ sourceId: sourceId2, fileId });

    const sourceIds = await getSourcesByFileId(fileId);
    expect(sourceIds).toHaveLength(2);
    expect(sourceIds).toContain(sourceId1);
    expect(sourceIds).toContain(sourceId2);
  });
});
