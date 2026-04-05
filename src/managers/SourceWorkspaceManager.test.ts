import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { getIndividualById } from '$db-tree/individuals';
import { getPrimaryName } from '$db-tree/names';
import { SourceWorkspaceManager, parseName, type SlotValue } from './SourceWorkspaceManager';
import type { TemplateDefinition } from '$lib/templates';

// A single in-memory DB shared across all tests in this file.
const db = createTreeInMemoryDb();

vi.mock('$/db/connection', () => ({
  getTreeDb: vi.fn(),
}));

// Lazily resolve the mock after the module is loaded
import('$/db/connection').then(({ getTreeDb }) => {
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
});

beforeEach(async () => {
  const { getTreeDb } = await import('$/db/connection');
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
  db._raw.exec('DELETE FROM names');
  db._raw.exec('DELETE FROM individuals');
});

// =============================================================================
// Helpers
// =============================================================================

/** Marriage template for testing -- mirrors the real template structure */
const marriageTemplate: TemplateDefinition = {
  id: 'marriage',
  label: 'Marriage',
  eventTypeTag: 'MARR',
  slots: [
    {
      key: 'husband',
      label: 'Husband',
      participantRole: 'principal',
      gender: 'M',
      required: true,
      multiple: false,
    },
    {
      key: 'wife',
      label: 'Wife',
      participantRole: 'principal',
      gender: 'F',
      required: true,
      multiple: false,
    },
    {
      key: 'husband_father',
      label: "Husband's Father",
      gender: 'M',
      required: false,
      multiple: false,
    },
    {
      key: 'husband_mother',
      label: "Husband's Mother",
      gender: 'F',
      required: false,
      multiple: false,
    },
    {
      key: 'wife_father',
      label: "Wife's Father",
      gender: 'M',
      required: false,
      multiple: false,
    },
    {
      key: 'wife_mother',
      label: "Wife's Mother",
      gender: 'F',
      required: false,
      multiple: false,
    },
    {
      key: 'witness',
      label: 'Witness',
      participantRole: 'witness',
      required: false,
      multiple: true,
    },
  ],
  families: [
    {
      type: 'couple',
      members: [
        { slot: 'husband', role: 'husband' },
        { slot: 'wife', role: 'wife' },
      ],
    },
    {
      type: 'parent-child',
      members: [
        { slot: 'husband_father', role: 'husband' },
        { slot: 'husband_mother', role: 'wife' },
        { slot: 'husband', role: 'child' },
      ],
    },
    {
      type: 'parent-child',
      members: [
        { slot: 'wife_father', role: 'husband' },
        { slot: 'wife_mother', role: 'wife' },
        { slot: 'wife', role: 'child' },
      ],
    },
  ],
  hasDate: true,
  hasPlace: true,
};

// =============================================================================
// Task 2: parseName
// =============================================================================

describe('parseName', () => {
  it('parses a two-part name into givenNames and surname', () => {
    expect(parseName('Jean Dupont')).toEqual({
      givenNames: 'Jean',
      surname: 'Dupont',
    });
  });

  it('parses multiple given names correctly', () => {
    expect(parseName('Jean Pierre Marie Dupont')).toEqual({
      givenNames: 'Jean Pierre Marie',
      surname: 'Dupont',
    });
  });

  it('treats a single name as surname only', () => {
    expect(parseName('Dupont')).toEqual({
      surname: 'Dupont',
    });
  });

  it('returns empty object for empty string', () => {
    expect(parseName('')).toEqual({});
  });

  it('returns empty object for whitespace-only string', () => {
    expect(parseName('   ')).toEqual({});
  });

  it('trims leading and trailing whitespace', () => {
    expect(parseName('  Jean Dupont  ')).toEqual({
      givenNames: 'Jean',
      surname: 'Dupont',
    });
  });

  it('handles multiple spaces between names', () => {
    expect(parseName('Jean   Pierre   Dupont')).toEqual({
      givenNames: 'Jean Pierre',
      surname: 'Dupont',
    });
  });
});

// =============================================================================
// Task 2: resolveIndividuals
// =============================================================================

describe('SourceWorkspaceManager.resolveIndividuals', () => {
  it('creates new individuals with names from slot values', async () => {
    const slots: SlotValue[] = [
      { slotKey: 'husband', newName: 'Jean Dupont' },
      { slotKey: 'wife', newName: 'Marie Martin' },
    ];

    const resolved = await SourceWorkspaceManager.resolveIndividuals(slots, marriageTemplate);

    expect(resolved).toHaveLength(2);
    expect(resolved[0].slotKey).toBe('husband');
    expect(resolved[0].created).toBe(true);
    expect(resolved[1].slotKey).toBe('wife');
    expect(resolved[1].created).toBe(true);

    // Verify the individuals were created with correct gender
    const husband = await getIndividualById(resolved[0].individualId);
    expect(husband).not.toBeNull();
    expect(husband!.gender).toBe('M');

    const wife = await getIndividualById(resolved[1].individualId);
    expect(wife).not.toBeNull();
    expect(wife!.gender).toBe('F');

    // Verify names were created
    const husbandName = await getPrimaryName(resolved[0].individualId);
    expect(husbandName).not.toBeNull();
    expect(husbandName!.givenNames).toBe('Jean');
    expect(husbandName!.surname).toBe('Dupont');

    const wifeName = await getPrimaryName(resolved[1].individualId);
    expect(wifeName).not.toBeNull();
    expect(wifeName!.givenNames).toBe('Marie');
    expect(wifeName!.surname).toBe('Martin');
  });

  it('uses existing individual when existingId provided', async () => {
    const { createIndividual } = await import('$db-tree/individuals');
    const existingId = await createIndividual({ gender: 'M' });

    const slots: SlotValue[] = [
      { slotKey: 'husband', existingId },
      { slotKey: 'wife', newName: 'Marie Martin' },
    ];

    const resolved = await SourceWorkspaceManager.resolveIndividuals(slots, marriageTemplate);

    expect(resolved).toHaveLength(2);
    expect(resolved[0].slotKey).toBe('husband');
    expect(resolved[0].individualId).toBe(existingId);
    expect(resolved[0].created).toBe(false);
    expect(resolved[1].created).toBe(true);
  });

  it('skips empty slots (no existingId and no newName)', async () => {
    const slots: SlotValue[] = [
      { slotKey: 'husband', newName: 'Jean Dupont' },
      { slotKey: 'wife' },
      { slotKey: 'witness', newName: '  ' },
    ];

    const resolved = await SourceWorkspaceManager.resolveIndividuals(slots, marriageTemplate);

    expect(resolved).toHaveLength(1);
    expect(resolved[0].slotKey).toBe('husband');
  });

  it('uses explicit newGender over template default', async () => {
    const slots: SlotValue[] = [{ slotKey: 'witness', newName: 'Alex Smith', newGender: 'F' }];

    const resolved = await SourceWorkspaceManager.resolveIndividuals(slots, marriageTemplate);

    expect(resolved).toHaveLength(1);
    const individual = await getIndividualById(resolved[0].individualId);
    expect(individual!.gender).toBe('F');
  });
});
