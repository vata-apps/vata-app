import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import {
  getCitationsBySourceId,
  getCitationsForEntity,
  createCitation,
  updateCitation,
  deleteCitation,
  createCitationLink,
  removeCitationLink,
  getCitationLinksForCitation,
  getCitationsForIndividual,
} from './citations';
import { createSource } from './sources';
import { createIndividual } from './individuals';

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
  db._raw.exec('DELETE FROM citation_links');
  db._raw.exec('DELETE FROM source_citations');
  db._raw.exec('DELETE FROM sources');
  db._raw.exec('DELETE FROM individuals');
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function seedSource(title = 'Test Source') {
  return createSource({ title });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('createCitation', () => {
  it('creates a citation with sourceId and stores page/quality/text', async () => {
    const sourceId = await seedSource();
    const citationId = await createCitation({
      sourceId,
      page: 'p. 42',
      quality: 'primary',
      text: 'Exact quote from source',
    });

    expect(citationId).toBeTruthy();

    const citations = await getCitationsBySourceId(sourceId);
    expect(citations).toHaveLength(1);
    expect(citations[0].page).toBe('p. 42');
    expect(citations[0].quality).toBe('primary');
    expect(citations[0].text).toBe('Exact quote from source');
  });
});

describe('getCitationsBySourceId', () => {
  it('returns citations for a source', async () => {
    const sourceId = await seedSource();
    await createCitation({ sourceId, page: 'p. 1' });
    await createCitation({ sourceId, page: 'p. 2' });

    const citations = await getCitationsBySourceId(sourceId);
    expect(citations).toHaveLength(2);
  });

  it('returns empty array when source has no citations', async () => {
    const sourceId = await seedSource();
    const citations = await getCitationsBySourceId(sourceId);
    expect(citations).toEqual([]);
  });
});

describe('updateCitation', () => {
  it('changes the page', async () => {
    const sourceId = await seedSource();
    const citationId = await createCitation({ sourceId, page: 'p. 1' });

    await updateCitation(citationId, { page: 'p. 99' });

    const citations = await getCitationsBySourceId(sourceId);
    expect(citations[0].page).toBe('p. 99');
  });

  it('changes the quality', async () => {
    const sourceId = await seedSource();
    const citationId = await createCitation({ sourceId, quality: 'primary' });

    await updateCitation(citationId, { quality: 'secondary' });

    const citations = await getCitationsBySourceId(sourceId);
    expect(citations[0].quality).toBe('secondary');
  });
});

describe('deleteCitation', () => {
  it('removes the citation', async () => {
    const sourceId = await seedSource();
    const citationId = await createCitation({ sourceId });

    await deleteCitation(citationId);

    const citations = await getCitationsBySourceId(sourceId);
    expect(citations).toHaveLength(0);
  });

  it('cascades to citation_links', async () => {
    const sourceId = await seedSource();
    const citationId = await createCitation({ sourceId });
    const individualId = await createIndividual({ gender: 'M' });

    await createCitationLink({
      citationId,
      entityType: 'individual',
      entityId: individualId,
    });

    // Verify the link exists
    const linksBefore = await getCitationLinksForCitation(citationId);
    expect(linksBefore).toHaveLength(1);

    // Delete the citation — links should cascade
    await deleteCitation(citationId);

    const linksAfter = await getCitationLinksForCitation(citationId);
    expect(linksAfter).toHaveLength(0);
  });
});

describe('createCitationLink', () => {
  it('links a citation to an individual entity', async () => {
    const sourceId = await seedSource();
    const citationId = await createCitation({ sourceId });
    const individualId = await createIndividual({ gender: 'F' });

    const linkId = await createCitationLink({
      citationId,
      entityType: 'individual',
      entityId: individualId,
    });

    expect(linkId).toBeTruthy();

    const links = await getCitationLinksForCitation(citationId);
    expect(links).toHaveLength(1);
    expect(links[0].entityType).toBe('individual');
    expect(links[0].entityId).toBe(individualId);
  });
});

describe('removeCitationLink', () => {
  it('removes the link', async () => {
    const sourceId = await seedSource();
    const citationId = await createCitation({ sourceId });
    const individualId = await createIndividual({ gender: 'M' });

    await createCitationLink({
      citationId,
      entityType: 'individual',
      entityId: individualId,
    });

    await removeCitationLink(citationId, 'individual', individualId);

    const links = await getCitationLinksForCitation(citationId);
    expect(links).toHaveLength(0);
  });
});

describe('getCitationLinksForCitation', () => {
  it('returns all links for a citation', async () => {
    const sourceId = await seedSource();
    const citationId = await createCitation({ sourceId });
    const ind1 = await createIndividual({ gender: 'M' });
    const ind2 = await createIndividual({ gender: 'F' });

    await createCitationLink({
      citationId,
      entityType: 'individual',
      entityId: ind1,
    });
    await createCitationLink({
      citationId,
      entityType: 'individual',
      entityId: ind2,
    });

    const links = await getCitationLinksForCitation(citationId);
    expect(links).toHaveLength(2);
  });
});

describe('getCitationsForIndividual', () => {
  it('returns citations linked to an individual with source data', async () => {
    const sourceId = await seedSource('Birth Certificate');
    const citationId = await createCitation({
      sourceId,
      page: 'Entry 123',
      quality: 'primary',
    });
    const individualId = await createIndividual({ gender: 'M' });

    await createCitationLink({
      citationId,
      entityType: 'individual',
      entityId: individualId,
    });

    const results = await getCitationsForIndividual(individualId);
    expect(results).toHaveLength(1);
    expect(results[0].page).toBe('Entry 123');
    expect(results[0].quality).toBe('primary');
    expect(results[0].source).toBeDefined();
    expect(results[0].source.title).toBe('Birth Certificate');
    expect(results[0].source.id).toBe(sourceId);
  });

  it('returns empty array when individual has no citations', async () => {
    const individualId = await createIndividual({ gender: 'F' });
    const results = await getCitationsForIndividual(individualId);
    expect(results).toEqual([]);
  });
});

describe('getCitationsForEntity', () => {
  it('returns citations for a given entity type and id', async () => {
    const sourceId = await seedSource();
    const citationId = await createCitation({ sourceId, page: 'ch. 5' });
    const individualId = await createIndividual({ gender: 'M' });

    await createCitationLink({
      citationId,
      entityType: 'individual',
      entityId: individualId,
    });

    const results = await getCitationsForEntity('individual', individualId);
    expect(results).toHaveLength(1);
    expect(results[0].page).toBe('ch. 5');
    expect(results[0].source).toBeDefined();
  });
});
