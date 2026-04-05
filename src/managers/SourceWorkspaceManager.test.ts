import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { getIndividualById } from '$db-tree/individuals';
import { getPrimaryName } from '$db-tree/names';
import { getEventById, getEventParticipants, getEventTypeByTag } from '$db-tree/events';
import { getFamilyMembers } from '$db-tree/families';
import { getCitationsBySourceId, getCitationLinksForCitation } from '$db-tree/citations';
import { createSource } from '$db-tree/sources';
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

const genericTemplate: TemplateDefinition = {
  id: 'generic',
  label: 'Generic',
  eventTypeTag: '',
  slots: [],
  families: [],
  hasDate: true,
  hasPlace: true,
};

async function seedSource(title = 'Parish Register'): Promise<string> {
  return createSource({ title });
}

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

// =============================================================================
// Task 3: createEventFromTemplate
// =============================================================================

describe('SourceWorkspaceManager.createEventFromTemplate', () => {
  it('creates event with participants for marriage template', async () => {
    const slots: SlotValue[] = [
      { slotKey: 'husband', newName: 'Jean Dupont' },
      { slotKey: 'wife', newName: 'Marie Martin' },
    ];
    const resolvedSlots = await SourceWorkspaceManager.resolveIndividuals(slots, marriageTemplate);

    const eventId = await SourceWorkspaceManager.createEventFromTemplate(
      marriageTemplate,
      resolvedSlots,
      { date: '15 JAN 1850' }
    );

    expect(eventId).toBeDefined();

    // Verify event was created
    const event = await getEventById(eventId!);
    expect(event).not.toBeNull();
    expect(event!.dateOriginal).toBe('15 JAN 1850');

    // Verify event type is MARR
    const marrType = await getEventTypeByTag('MARR');
    expect(event!.eventTypeId).toBe(marrType!.id);

    // Verify participants
    const participants = await getEventParticipants(eventId!);
    expect(participants).toHaveLength(2);
    expect(participants.every((p) => p.role === 'principal')).toBe(true);
  });

  it('skips event creation when template has no event type tag (generic)', async () => {
    const resolvedSlots = await SourceWorkspaceManager.resolveIndividuals([], genericTemplate);

    const eventId = await SourceWorkspaceManager.createEventFromTemplate(
      genericTemplate,
      resolvedSlots,
      {}
    );

    expect(eventId).toBeUndefined();
  });

  it('uses eventTypeTag override for generic template', async () => {
    const slots: SlotValue[] = [{ slotKey: 'person', newName: 'Jean Dupont' }];
    const resolvedSlots = await SourceWorkspaceManager.resolveIndividuals(slots, genericTemplate);

    const eventId = await SourceWorkspaceManager.createEventFromTemplate(
      genericTemplate,
      resolvedSlots,
      { eventTypeTag: 'BIRT' }
    );

    expect(eventId).toBeDefined();

    const event = await getEventById(eventId!);
    const birtType = await getEventTypeByTag('BIRT');
    expect(event!.eventTypeId).toBe(birtType!.id);

    // Free-form slot (not in template.slots) should be added as 'other'
    const participants = await getEventParticipants(eventId!);
    expect(participants).toHaveLength(1);
    expect(participants[0].role).toBe('other');
  });

  it('only adds slots with participantRole as event participants', async () => {
    const slots: SlotValue[] = [
      { slotKey: 'husband', newName: 'Jean Dupont' },
      { slotKey: 'wife', newName: 'Marie Martin' },
      { slotKey: 'husband_father', newName: 'Pierre Dupont' },
      { slotKey: 'witness', newName: 'Paul Thibault' },
    ];
    const resolvedSlots = await SourceWorkspaceManager.resolveIndividuals(slots, marriageTemplate);

    const eventId = await SourceWorkspaceManager.createEventFromTemplate(
      marriageTemplate,
      resolvedSlots,
      {}
    );

    // husband (principal), wife (principal), witness (witness) = 3 participants
    // husband_father has no participantRole so should NOT be added
    const participants = await getEventParticipants(eventId!);
    expect(participants).toHaveLength(3);

    const roles = participants.map((p) => p.role).sort();
    expect(roles).toEqual(['principal', 'principal', 'witness']);
  });
});

// =============================================================================
// Task 4: createFamilies
// =============================================================================

describe('SourceWorkspaceManager.createFamilies', () => {
  it('creates couple family from marriage template', async () => {
    const slots: SlotValue[] = [
      { slotKey: 'husband', newName: 'Jean Dupont' },
      { slotKey: 'wife', newName: 'Marie Martin' },
    ];
    const resolvedSlots = await SourceWorkspaceManager.resolveIndividuals(slots, marriageTemplate);

    const familyIds = await SourceWorkspaceManager.createFamilies(marriageTemplate, resolvedSlots);

    // Only the couple family should be created (parent-child families need child + parent)
    expect(familyIds).toHaveLength(1);

    const members = await getFamilyMembers(familyIds[0]);
    expect(members).toHaveLength(2);
    expect(members.find((m) => m.role === 'husband')).toBeDefined();
    expect(members.find((m) => m.role === 'wife')).toBeDefined();
  });

  it('creates parent-child family when parents are filled', async () => {
    const slots: SlotValue[] = [
      { slotKey: 'husband', newName: 'Jean Dupont' },
      { slotKey: 'wife', newName: 'Marie Martin' },
      { slotKey: 'husband_father', newName: 'Pierre Dupont' },
      { slotKey: 'husband_mother', newName: 'Anne Leclerc' },
    ];
    const resolvedSlots = await SourceWorkspaceManager.resolveIndividuals(slots, marriageTemplate);

    const familyIds = await SourceWorkspaceManager.createFamilies(marriageTemplate, resolvedSlots);

    // couple family + husband's parent-child family = 2
    expect(familyIds).toHaveLength(2);

    // Second family should be the parent-child family
    const parentChildMembers = await getFamilyMembers(familyIds[1]);
    expect(parentChildMembers).toHaveLength(3);
    expect(parentChildMembers.find((m) => m.role === 'child')).toBeDefined();
  });

  it('skips parent-child family when child slot is missing', async () => {
    // Only fill parents, skip the husband (child in parent-child rule)
    const slots: SlotValue[] = [
      { slotKey: 'husband_father', newName: 'Pierre Dupont' },
      { slotKey: 'husband_mother', newName: 'Anne Leclerc' },
    ];
    const resolvedSlots = await SourceWorkspaceManager.resolveIndividuals(slots, marriageTemplate);

    const familyIds = await SourceWorkspaceManager.createFamilies(marriageTemplate, resolvedSlots);

    // No families should be created (couple needs both, parent-child needs child)
    expect(familyIds).toHaveLength(0);
  });

  it('skips couple family when both spouses are missing', async () => {
    const slots: SlotValue[] = [{ slotKey: 'witness', newName: 'Paul Thibault' }];
    const resolvedSlots = await SourceWorkspaceManager.resolveIndividuals(slots, marriageTemplate);

    const familyIds = await SourceWorkspaceManager.createFamilies(marriageTemplate, resolvedSlots);

    expect(familyIds).toHaveLength(0);
  });

  it('creates parent-child family with only one parent', async () => {
    const slots: SlotValue[] = [
      { slotKey: 'husband', newName: 'Jean Dupont' },
      { slotKey: 'wife', newName: 'Marie Martin' },
      { slotKey: 'husband_father', newName: 'Pierre Dupont' },
      // husband_mother not filled
    ];
    const resolvedSlots = await SourceWorkspaceManager.resolveIndividuals(slots, marriageTemplate);

    const familyIds = await SourceWorkspaceManager.createFamilies(marriageTemplate, resolvedSlots);

    // couple + parent-child (with one parent) = 2
    expect(familyIds).toHaveLength(2);

    const parentChildMembers = await getFamilyMembers(familyIds[1]);
    // Only father + child (mother missing)
    expect(parentChildMembers).toHaveLength(2);
  });
});

// =============================================================================
// Task 5: createFromTemplate (full orchestration)
// =============================================================================

describe('SourceWorkspaceManager.createFromTemplate', () => {
  it('creates full marriage record (event + 2 individuals + 1 family + citation + 4 citation links)', async () => {
    const sourceId = await seedSource();

    const result = await SourceWorkspaceManager.createFromTemplate({
      sourceId,
      templateId: 'marriage',
      slots: [
        { slotKey: 'husband', newName: 'Jean Dupont' },
        { slotKey: 'wife', newName: 'Marie Martin' },
      ],
      date: '15 JAN 1850',
      citationPage: 'folio 12',
    });

    expect(result.eventId).toBeDefined();
    expect(result.createdIndividuals).toHaveLength(2);
    expect(result.createdFamilies).toHaveLength(1);
    expect(result.citationId).toBeDefined();
    // Links: 1 event + 2 individuals + 1 family = 4
    expect(result.citationLinkIds).toHaveLength(4);

    // Verify citation was created with correct page
    const citations = await getCitationsBySourceId(sourceId);
    expect(citations).toHaveLength(1);
    expect(citations[0].page).toBe('folio 12');

    // Verify citation links
    const links = await getCitationLinksForCitation(result.citationId);
    expect(links).toHaveLength(4);
    const entityTypes = links.map((l) => l.entityType).sort();
    expect(entityTypes).toEqual(['event', 'family', 'individual', 'individual']);
  });

  it('creates record with no event for generic template', async () => {
    const sourceId = await seedSource();
    const { createIndividual } = await import('$db-tree/individuals');
    const existingId = await createIndividual({ gender: 'M' });

    const result = await SourceWorkspaceManager.createFromTemplate({
      sourceId,
      templateId: 'generic',
      slots: [{ slotKey: 'person', existingId }],
    });

    expect(result.eventId).toBeUndefined();
    expect(result.createdIndividuals).toHaveLength(0); // existing, not created
    expect(result.createdFamilies).toHaveLength(0);
    expect(result.citationId).toBeDefined();
    // Links: 1 individual (no event, no family)
    expect(result.citationLinkIds).toHaveLength(1);
  });

  it('creates marriage with parents and witnesses (5 individuals + 2 families + 8 citation links)', async () => {
    const sourceId = await seedSource();

    const result = await SourceWorkspaceManager.createFromTemplate({
      sourceId,
      templateId: 'marriage',
      slots: [
        { slotKey: 'husband', newName: 'Jean Dupont' },
        { slotKey: 'wife', newName: 'Marie Martin' },
        { slotKey: 'husband_father', newName: 'Pierre Dupont' },
        { slotKey: 'husband_mother', newName: 'Anne Leclerc' },
        { slotKey: 'witness', newName: 'Paul Thibault' },
      ],
      date: '15 JAN 1850',
      place: 'Paris',
    });

    // 5 individuals created
    expect(result.createdIndividuals).toHaveLength(5);

    // 2 families: couple + husband's parent-child
    expect(result.createdFamilies).toHaveLength(2);

    // Event should exist
    expect(result.eventId).toBeDefined();

    // Citation links: 1 event + 5 individuals + 2 families = 8
    expect(result.citationLinkIds).toHaveLength(8);
  });

  it('resolves an existing place when existingPlaceId is provided', async () => {
    const sourceId = await seedSource();
    const { createPlace } = await import('$db-tree/places');
    const placeId = await createPlace({ name: 'Paris' });

    const result = await SourceWorkspaceManager.createFromTemplate({
      sourceId,
      templateId: 'marriage',
      slots: [
        { slotKey: 'husband', newName: 'Jean Dupont' },
        { slotKey: 'wife', newName: 'Marie Martin' },
      ],
      existingPlaceId: placeId,
    });

    // Verify the event uses the existing place
    const event = await getEventById(result.eventId!);
    expect(event!.placeId).toBe(placeId);
  });

  it('creates a new place when place string is provided', async () => {
    const sourceId = await seedSource();

    const result = await SourceWorkspaceManager.createFromTemplate({
      sourceId,
      templateId: 'marriage',
      slots: [
        { slotKey: 'husband', newName: 'Jean Dupont' },
        { slotKey: 'wife', newName: 'Marie Martin' },
      ],
      place: 'Lyon',
    });

    const event = await getEventById(result.eventId!);
    expect(event!.placeId).toBeDefined();
    expect(event!.placeId).not.toBeNull();
  });

  it('throws when template ID is invalid', async () => {
    const sourceId = await seedSource();

    await expect(
      SourceWorkspaceManager.createFromTemplate({
        sourceId,
        templateId: 'nonexistent',
        slots: [],
      })
    ).rejects.toThrow('Template not found: nonexistent');
  });
});
