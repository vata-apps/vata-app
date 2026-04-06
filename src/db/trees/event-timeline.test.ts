import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { getEventTimelineForIndividual } from './event-timeline';
import { createIndividual } from './individuals';
import { createEvent, addEventParticipant, getEventTypes } from './events';
import { createSource } from './sources';
import { createCitation, createCitationLink } from './citations';
import { createFile, addFileToSource } from './files';

// A single in-memory DB shared across all tests in this file.
const db = createTreeInMemoryDb();

vi.mock('../connection', () => ({
  getTreeDb: vi.fn(),
}));

// Lazily resolve the mock after the module is loaded
import('../connection').then(({ getTreeDb }) => {
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
});

beforeEach(async () => {
  const { getTreeDb } = await import('../connection');
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
  db._raw.exec('DELETE FROM source_files');
  db._raw.exec('DELETE FROM files');
  db._raw.exec('DELETE FROM citation_links');
  db._raw.exec('DELETE FROM source_citations');
  db._raw.exec('DELETE FROM sources');
  db._raw.exec('DELETE FROM event_participants');
  db._raw.exec('DELETE FROM events');
  db._raw.exec('DELETE FROM names');
  db._raw.exec('DELETE FROM individuals');
});

describe('getEventTimelineForIndividual', () => {
  it('returns empty array for individual with no events', async () => {
    const individualId = await createIndividual({ gender: 'M' });
    const result = await getEventTimelineForIndividual(individualId);
    expect(result).toEqual([]);
  });

  it('returns entries with hasCitations false and empty thumbnails when events have no citations', async () => {
    const individualId = await createIndividual({ gender: 'M' });
    const types = await getEventTypes();
    const eventId = await createEvent({ eventTypeId: types[0].id });
    await addEventParticipant({ eventId, individualId, role: 'principal' });

    const result = await getEventTimelineForIndividual(individualId);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(eventId);
    expect(result[0].hasCitations).toBe(false);
    expect(result[0].thumbnails).toEqual([]);
  });

  it('returns hasCitations true with empty thumbnails when citations exist but source has no files', async () => {
    const individualId = await createIndividual({ gender: 'F' });
    const types = await getEventTypes();
    const eventId = await createEvent({ eventTypeId: types[0].id, dateOriginal: '1 Jan 1900' });
    await addEventParticipant({ eventId, individualId, role: 'principal' });

    // Create source + citation + link to event
    const sourceId = await createSource({ title: 'Birth Certificate' });
    const citationId = await createCitation({ sourceId, page: 'p. 1' });
    await createCitationLink({ citationId, entityType: 'event', entityId: eventId });

    const result = await getEventTimelineForIndividual(individualId);

    expect(result).toHaveLength(1);
    expect(result[0].hasCitations).toBe(true);
    expect(result[0].thumbnails).toEqual([]);
  });

  it('returns hasCitations true with empty thumbnails when source has files without thumbnails', async () => {
    const individualId = await createIndividual({ gender: 'M' });
    const types = await getEventTypes();
    const eventId = await createEvent({ eventTypeId: types[0].id });
    await addEventParticipant({ eventId, individualId, role: 'principal' });

    const sourceId = await createSource({ title: 'Marriage Record' });
    const citationId = await createCitation({ sourceId });
    await createCitationLink({ citationId, entityType: 'event', entityId: eventId });

    // File without thumbnail
    const fileId = await createFile({
      originalFilename: 'scan.pdf',
      relativePath: 'files/scan.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
    });
    await addFileToSource({ sourceId, fileId });

    const result = await getEventTimelineForIndividual(individualId);

    expect(result).toHaveLength(1);
    expect(result[0].hasCitations).toBe(true);
    expect(result[0].thumbnails).toEqual([]);
  });

  it('returns populated thumbnails for full chain: event -> citation -> source -> file with thumbnail', async () => {
    const individualId = await createIndividual({ gender: 'F' });
    const types = await getEventTypes();
    const eventId = await createEvent({
      eventTypeId: types[0].id,
      dateOriginal: '15 Jun 1892',
    });
    await addEventParticipant({ eventId, individualId, role: 'principal' });

    const sourceId = await createSource({ title: 'Parish Register' });
    const citationId = await createCitation({ sourceId, page: 'folio 42' });
    await createCitationLink({ citationId, entityType: 'event', entityId: eventId });

    const fileId = await createFile({
      originalFilename: 'baptism_record.jpg',
      relativePath: 'files/baptism_record.jpg',
      mimeType: 'image/jpeg',
      fileSize: 204800,
      width: 1200,
      height: 800,
      thumbnailPath: 'thumbs/baptism_record_thumb.jpg',
    });
    await addFileToSource({ sourceId, fileId });

    const result = await getEventTimelineForIndividual(individualId);

    expect(result).toHaveLength(1);
    expect(result[0].hasCitations).toBe(true);
    expect(result[0].thumbnails).toHaveLength(1);
    expect(result[0].thumbnails[0]).toEqual({
      fileId,
      thumbnailPath: 'thumbs/baptism_record_thumb.jpg',
      originalFilename: 'baptism_record.jpg',
      sourceId,
      sourceTitle: 'Parish Register',
    });
  });

  it('aggregates thumbnails from multiple sources on the same event', async () => {
    const individualId = await createIndividual({ gender: 'M' });
    const types = await getEventTypes();
    const eventId = await createEvent({ eventTypeId: types[0].id });
    await addEventParticipant({ eventId, individualId, role: 'principal' });

    // Source 1 with a thumbnail
    const sourceId1 = await createSource({ title: 'Source A' });
    const citationId1 = await createCitation({ sourceId: sourceId1, page: 'p. 1' });
    await createCitationLink({ citationId: citationId1, entityType: 'event', entityId: eventId });
    const fileId1 = await createFile({
      originalFilename: 'doc1.jpg',
      relativePath: 'files/doc1.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1024,
      thumbnailPath: 'thumbs/doc1_thumb.jpg',
    });
    await addFileToSource({ sourceId: sourceId1, fileId: fileId1 });

    // Source 2 with a thumbnail
    const sourceId2 = await createSource({ title: 'Source B' });
    const citationId2 = await createCitation({ sourceId: sourceId2, page: 'p. 5' });
    await createCitationLink({ citationId: citationId2, entityType: 'event', entityId: eventId });
    const fileId2 = await createFile({
      originalFilename: 'doc2.png',
      relativePath: 'files/doc2.png',
      mimeType: 'image/png',
      fileSize: 2048,
      thumbnailPath: 'thumbs/doc2_thumb.png',
    });
    await addFileToSource({ sourceId: sourceId2, fileId: fileId2 });

    const result = await getEventTimelineForIndividual(individualId);

    expect(result).toHaveLength(1);
    expect(result[0].thumbnails).toHaveLength(2);

    const filenames = result[0].thumbnails.map((t) => t.originalFilename).sort();
    expect(filenames).toEqual(['doc1.jpg', 'doc2.png']);

    const sourceTitles = result[0].thumbnails.map((t) => t.sourceTitle).sort();
    expect(sourceTitles).toEqual(['Source A', 'Source B']);
  });

  it('returns multiple timeline entries for an individual with multiple events', async () => {
    const individualId = await createIndividual({ gender: 'F' });
    const types = await getEventTypes();

    const eventId1 = await createEvent({
      eventTypeId: types[0].id,
      dateOriginal: '1870',
    });
    await addEventParticipant({ eventId: eventId1, individualId, role: 'principal' });

    const eventId2 = await createEvent({
      eventTypeId: types[1].id,
      dateOriginal: '1950',
    });
    await addEventParticipant({ eventId: eventId2, individualId, role: 'principal' });

    const result = await getEventTimelineForIndividual(individualId);

    expect(result).toHaveLength(2);
    const ids = result.map((e) => e.id);
    expect(ids).toContain(eventId1);
    expect(ids).toContain(eventId2);

    // Both should have no citations
    for (const entry of result) {
      expect(entry.hasCitations).toBe(false);
      expect(entry.thumbnails).toEqual([]);
    }
  });
});
