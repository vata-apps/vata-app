import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { getCitationDetailsForSource } from './citations-with-details';
import { createSource } from './sources';
import { SourceWorkspaceManager } from '$/managers/SourceWorkspaceManager';

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
  db._raw.exec('DELETE FROM citation_links');
  db._raw.exec('DELETE FROM source_citations');
  db._raw.exec('DELETE FROM event_participants');
  db._raw.exec('DELETE FROM events');
  db._raw.exec('DELETE FROM family_members');
  db._raw.exec('DELETE FROM families');
  db._raw.exec('DELETE FROM names');
  db._raw.exec('DELETE FROM individuals');
  db._raw.exec('DELETE FROM sources');
  db._raw.exec('DELETE FROM places');
});

describe('getCitationDetailsForSource', () => {
  it('returns empty array for source with no citations', async () => {
    const sourceId = await createSource({ title: 'Empty Source' });
    const details = await getCitationDetailsForSource(sourceId);
    expect(details).toHaveLength(0);
  });

  it('returns citation details with event and individuals', async () => {
    const sourceId = await createSource({ title: 'Marriage Certificate' });
    await SourceWorkspaceManager.createFromTemplate({
      sourceId,
      templateId: 'marriage',
      slots: [
        { slotKey: 'husband', newName: 'Joseph Dupont', newGender: 'M' },
        { slotKey: 'wife', newName: 'Marie Tremblay', newGender: 'F' },
      ],
      date: '15 Jun 1892',
      citationPage: 'p. 42',
    });

    const details = await getCitationDetailsForSource(sourceId);
    expect(details).toHaveLength(1);
    expect(details[0].page).toBe('p. 42');
    expect(details[0].eventTypeName).toBeTruthy();
    expect(details[0].eventDate).toBe('15 Jun 1892');
    expect(details[0].linkedIndividuals).toHaveLength(2);
  });

  it('includes the formatted event ID', async () => {
    const sourceId = await createSource({ title: 'Birth Record' });
    await SourceWorkspaceManager.createFromTemplate({
      sourceId,
      templateId: 'birth',
      slots: [{ slotKey: 'individual', newName: 'Jean Martin', newGender: 'M' }],
      date: '3 Mar 1870',
      citationPage: 'folio 7',
    });

    const details = await getCitationDetailsForSource(sourceId);
    expect(details).toHaveLength(1);
    expect(details[0].eventId).toMatch(/^E-\d{4}$/);
    expect(details[0].citationId).toBeTruthy();
  });

  it('returns correct individual names', async () => {
    const sourceId = await createSource({ title: 'Marriage Certificate' });
    await SourceWorkspaceManager.createFromTemplate({
      sourceId,
      templateId: 'marriage',
      slots: [
        { slotKey: 'husband', newName: 'Joseph Dupont', newGender: 'M' },
        { slotKey: 'wife', newName: 'Marie Tremblay', newGender: 'F' },
      ],
      date: '15 Jun 1892',
    });

    const details = await getCitationDetailsForSource(sourceId);
    const names = details[0].linkedIndividuals.map((i) => i.name).sort();
    expect(names).toContain('Joseph Dupont');
    expect(names).toContain('Marie Tremblay');
  });

  it('returns null event fields for citations with no event link', async () => {
    const sourceId = await createSource({ title: 'Standalone Source' });
    // Create a citation manually (no event link)
    const { createCitation } = await import('./citations');
    await createCitation({ sourceId, page: 'p. 1' });

    const details = await getCitationDetailsForSource(sourceId);
    expect(details).toHaveLength(1);
    expect(details[0].eventId).toBeNull();
    expect(details[0].eventTypeName).toBeNull();
    expect(details[0].eventDate).toBeNull();
    expect(details[0].linkedIndividuals).toHaveLength(0);
  });

  it('handles multiple citations for the same source independently', async () => {
    const sourceId = await createSource({ title: 'Parish Register' });

    await SourceWorkspaceManager.createFromTemplate({
      sourceId,
      templateId: 'marriage',
      slots: [
        { slotKey: 'husband', newName: 'Pierre Lefebvre', newGender: 'M' },
        { slotKey: 'wife', newName: 'Anne Bouchard', newGender: 'F' },
      ],
      date: '12 Apr 1880',
      citationPage: 'p. 10',
    });

    await SourceWorkspaceManager.createFromTemplate({
      sourceId,
      templateId: 'marriage',
      slots: [
        { slotKey: 'husband', newName: 'Louis Bernard', newGender: 'M' },
        { slotKey: 'wife', newName: 'Claire Morin', newGender: 'F' },
      ],
      date: '5 May 1882',
      citationPage: 'p. 15',
    });

    const details = await getCitationDetailsForSource(sourceId);
    expect(details).toHaveLength(2);

    const pages = details.map((d) => d.page).sort();
    expect(pages).toEqual(['p. 10', 'p. 15']);

    for (const detail of details) {
      expect(detail.linkedIndividuals).toHaveLength(2);
    }
  });
});
