# Source Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the source workspace — a side-by-side editing environment where users view source documents and extract genealogical data via event-type templates with auto-citation.

**Architecture:** Templates are pure data objects defining slots and family rules. A thin SourceWorkspaceManager reads the template and executes DB operations (create individuals, families, events, citations). The workspace page is a split layout: left panel (citations summary + image viewer), right panel (template-driven data entry).

**Tech Stack:** React 18, TypeScript, TanStack Router v1 (file-based), TanStack Query v5, Zustand, SQLite via @tauri-apps/plugin-sql, Tauri 2 file dialog + asset protocol, Vitest + jsdom.

**Spec:** `docs/superpowers/specs/2026-04-04-source-workspace-design.md`

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `src/lib/templates.ts` | Template type definitions + all 7 template data objects |
| `src/lib/templates.test.ts` | Snapshot tests for template definitions |
| `src/managers/SourceWorkspaceManager.ts` | Orchestrate multi-entity creation from filled template |
| `src/managers/SourceWorkspaceManager.test.ts` | TDD tests with in-memory SQLite |
| `src/db/trees/citations-with-details.ts` | Joined query: citations + links + entity names for a source |
| `src/db/trees/citations-with-details.test.ts` | Tests for the joined query |
| `src/hooks/useCitationsWithDetails.ts` | React Query hook wrapping the joined query |
| `src/routes/tree/$treeId/source/$sourceId/index.tsx` | Route index (renders SourceViewPage, moved from parent) |
| `src/routes/tree/$treeId/source/$sourceId/edit.tsx` | Route for workspace page |
| `src/pages/SourceWorkspacePage.tsx` | Main workspace page component |
| `src/components/workspace/WorkspaceLayout.tsx` | Split panel container (left/right) |
| `src/components/workspace/WorkspaceHeader.tsx` | Source title, back button, metadata |
| `src/components/workspace/CitationsSummary.tsx` | List of existing citations for this source |
| `src/components/workspace/ImageViewer.tsx` | Zoom/pan image display + file nav + attach button |
| `src/components/workspace/LeftPanel.tsx` | Composes CitationsSummary + ImageViewer |
| `src/components/workspace/PersonSlot.tsx` | Autocomplete search/create individual |
| `src/components/workspace/PersonSlot.test.tsx` | Tests for autocomplete behavior |
| `src/components/workspace/PlaceAutocomplete.tsx` | Autocomplete search/create place |
| `src/components/workspace/EventTypeSelector.tsx` | Template dropdown |
| `src/components/workspace/EventDetails.tsx` | Date + place fields |
| `src/components/workspace/TemplateSlots.tsx` | Dynamic slot renderer |
| `src/components/workspace/CreateEventButton.tsx` | Action button + creation summary |
| `src/components/workspace/FreeFormAdd.tsx` | Free-form person addition |
| `src/components/workspace/RightPanel.tsx` | Composes all right-side components |

### Modified Files

| File | Change |
|------|--------|
| `src/routes/tree/$treeId/source/$sourceId.tsx` | Convert from leaf route to layout route (add `<Outlet />`) |
| `src/pages/SourceViewPage.tsx` | Add "Edit" button linking to workspace |
| `src/lib/query-keys.ts` | Add `citationsWithDetails` key |
| `src/types/database.ts` | Add `CitationWithDetails` type |

---

## Task 1: Template Definitions

**Files:**
- Create: `src/lib/templates.ts`
- Create: `src/lib/templates.test.ts`

- [ ] **Step 1: Write snapshot tests for template definitions**

```typescript
// src/lib/templates.test.ts
import { describe, expect, it } from 'vitest';
import { TEMPLATES, getTemplateById } from './templates';

describe('templates', () => {
  it('exports 7 templates', () => {
    expect(TEMPLATES).toHaveLength(7);
  });

  it('each template has a unique id', () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('marriage template has correct slots', () => {
    const marriage = getTemplateById('marriage');
    expect(marriage).toBeDefined();
    expect(marriage!.slots.map((s) => s.key)).toEqual([
      'husband',
      'wife',
      'husband_father',
      'husband_mother',
      'wife_father',
      'wife_mother',
      'witness',
    ]);
  });

  it('marriage template has 3 family rules', () => {
    const marriage = getTemplateById('marriage');
    expect(marriage!.families).toHaveLength(3);
    expect(marriage!.families[0].type).toBe('couple');
    expect(marriage!.families[1].type).toBe('parent-child');
    expect(marriage!.families[2].type).toBe('parent-child');
  });

  it('family-only slots have no participantRole', () => {
    const marriage = getTemplateById('marriage');
    const familyOnly = marriage!.slots.filter((s) =>
      ['husband_father', 'husband_mother', 'wife_father', 'wife_mother'].includes(s.key)
    );
    for (const slot of familyOnly) {
      expect(slot.participantRole).toBeUndefined();
    }
  });

  it('principal slots have participantRole "principal"', () => {
    const marriage = getTemplateById('marriage');
    const principals = marriage!.slots.filter((s) => ['husband', 'wife'].includes(s.key));
    for (const slot of principals) {
      expect(slot.participantRole).toBe('principal');
    }
  });

  it('generic template has empty slots and families', () => {
    const generic = getTemplateById('generic');
    expect(generic!.slots).toHaveLength(0);
    expect(generic!.families).toHaveLength(0);
    expect(generic!.eventTypeTag).toBe('');
  });

  it('baptism template has godparent roles', () => {
    const baptism = getTemplateById('baptism');
    const godfather = baptism!.slots.find((s) => s.key === 'godfather');
    const godmother = baptism!.slots.find((s) => s.key === 'godmother');
    expect(godfather!.participantRole).toBe('godparent');
    expect(godmother!.participantRole).toBe('godparent');
  });

  it('getTemplateById returns undefined for unknown id', () => {
    expect(getTemplateById('nonexistent')).toBeUndefined();
  });

  it('all templates match snapshot', () => {
    expect(TEMPLATES).toMatchSnapshot();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/lib/templates.test.ts`
Expected: FAIL — module `./templates` not found

- [ ] **Step 3: Implement template definitions**

```typescript
// src/lib/templates.ts
import type { ParticipantRole } from '$/types/database';

export interface TemplateSlot {
  key: string;
  label: string;
  participantRole?: ParticipantRole;
  gender?: 'M' | 'F';
  required: boolean;
  multiple: boolean;
}

export interface FamilyRule {
  type: 'couple' | 'parent-child';
  members: { slot: string; role: 'husband' | 'wife' | 'child' }[];
}

export interface TemplateDefinition {
  id: string;
  label: string;
  eventTypeTag: string;
  slots: TemplateSlot[];
  families: FamilyRule[];
  hasDate: boolean;
  hasPlace: boolean;
}

const marriage: TemplateDefinition = {
  id: 'marriage',
  label: 'Marriage',
  eventTypeTag: 'MARR',
  slots: [
    { key: 'husband', label: 'Husband', participantRole: 'principal', gender: 'M', required: true, multiple: false },
    { key: 'wife', label: 'Wife', participantRole: 'principal', gender: 'F', required: true, multiple: false },
    { key: 'husband_father', label: "Husband's Father", gender: 'M', required: false, multiple: false },
    { key: 'husband_mother', label: "Husband's Mother", gender: 'F', required: false, multiple: false },
    { key: 'wife_father', label: "Wife's Father", gender: 'M', required: false, multiple: false },
    { key: 'wife_mother', label: "Wife's Mother", gender: 'F', required: false, multiple: false },
    { key: 'witness', label: 'Witness', participantRole: 'witness', required: false, multiple: true },
  ],
  families: [
    { type: 'couple', members: [{ slot: 'husband', role: 'husband' }, { slot: 'wife', role: 'wife' }] },
    { type: 'parent-child', members: [{ slot: 'husband_father', role: 'husband' }, { slot: 'husband_mother', role: 'wife' }, { slot: 'husband', role: 'child' }] },
    { type: 'parent-child', members: [{ slot: 'wife_father', role: 'husband' }, { slot: 'wife_mother', role: 'wife' }, { slot: 'wife', role: 'child' }] },
  ],
  hasDate: true,
  hasPlace: true,
};

const baptism: TemplateDefinition = {
  id: 'baptism',
  label: 'Baptism',
  eventTypeTag: 'BAPM',
  slots: [
    { key: 'child', label: 'Child', participantRole: 'principal', required: true, multiple: false },
    { key: 'father', label: 'Father', gender: 'M', required: false, multiple: false },
    { key: 'mother', label: 'Mother', gender: 'F', required: false, multiple: false },
    { key: 'godfather', label: 'Godfather', participantRole: 'godparent', gender: 'M', required: false, multiple: false },
    { key: 'godmother', label: 'Godmother', participantRole: 'godparent', gender: 'F', required: false, multiple: false },
  ],
  families: [
    { type: 'parent-child', members: [{ slot: 'father', role: 'husband' }, { slot: 'mother', role: 'wife' }, { slot: 'child', role: 'child' }] },
  ],
  hasDate: true,
  hasPlace: true,
};

const birth: TemplateDefinition = {
  id: 'birth',
  label: 'Birth',
  eventTypeTag: 'BIRT',
  slots: [
    { key: 'child', label: 'Child', participantRole: 'principal', required: true, multiple: false },
    { key: 'father', label: 'Father', gender: 'M', required: false, multiple: false },
    { key: 'mother', label: 'Mother', gender: 'F', required: false, multiple: false },
  ],
  families: [
    { type: 'parent-child', members: [{ slot: 'father', role: 'husband' }, { slot: 'mother', role: 'wife' }, { slot: 'child', role: 'child' }] },
  ],
  hasDate: true,
  hasPlace: true,
};

const death: TemplateDefinition = {
  id: 'death',
  label: 'Death',
  eventTypeTag: 'DEAT',
  slots: [
    { key: 'deceased', label: 'Deceased', participantRole: 'principal', required: true, multiple: false },
    { key: 'informant', label: 'Informant', participantRole: 'informant', required: false, multiple: false },
  ],
  families: [],
  hasDate: true,
  hasPlace: true,
};

const burial: TemplateDefinition = {
  id: 'burial',
  label: 'Burial',
  eventTypeTag: 'BURI',
  slots: [
    { key: 'deceased', label: 'Deceased', participantRole: 'principal', required: true, multiple: false },
  ],
  families: [],
  hasDate: true,
  hasPlace: true,
};

const census: TemplateDefinition = {
  id: 'census',
  label: 'Census',
  eventTypeTag: 'CENS',
  slots: [
    { key: 'head', label: 'Head of Household', participantRole: 'principal', required: true, multiple: false },
    { key: 'member', label: 'Member', participantRole: 'other', required: false, multiple: true },
  ],
  families: [],
  hasDate: true,
  hasPlace: true,
};

const generic: TemplateDefinition = {
  id: 'generic',
  label: 'Generic',
  eventTypeTag: '',
  slots: [],
  families: [],
  hasDate: true,
  hasPlace: true,
};

export const TEMPLATES: TemplateDefinition[] = [
  marriage,
  baptism,
  birth,
  death,
  burial,
  census,
  generic,
];

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/lib/templates.test.ts`
Expected: PASS (snapshot auto-created on first run)

- [ ] **Step 5: Commit**

```bash
git add src/lib/templates.ts src/lib/templates.test.ts
git commit -m "feat: add event-type template definitions"
```

---

## Task 2: SourceWorkspaceManager — Individual & Place Resolution

**Files:**
- Create: `src/managers/SourceWorkspaceManager.ts`
- Create: `src/managers/SourceWorkspaceManager.test.ts`

**Context:** The manager is a static class. We build it in TDD increments. This task covers steps 1-2 of the execution order (resolve individuals, resolve place).

- [ ] **Step 1: Write test for individual resolution**

```typescript
// src/managers/SourceWorkspaceManager.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { SourceWorkspaceManager } from './SourceWorkspaceManager';
import { createIndividual } from '$db-tree/individuals';
import { createName } from '$db-tree/names';
import { getIndividualById } from '$db-tree/individuals';
import { getPrimaryName } from '$db-tree/names';

let cleanup: () => Promise<void>;

beforeEach(async () => {
  const result = await createTreeInMemoryDb();
  cleanup = result.cleanup;
});

afterEach(async () => {
  await cleanup();
});

describe('SourceWorkspaceManager.resolveIndividuals', () => {
  it('creates new individuals with names from slot values', async () => {
    const resolved = await SourceWorkspaceManager.resolveIndividuals([
      { slotKey: 'husband', newName: 'Joseph Dupont', newGender: 'M' },
      { slotKey: 'wife', newName: 'Marie Tremblay', newGender: 'F' },
    ]);

    expect(resolved).toHaveLength(2);
    expect(resolved[0].slotKey).toBe('husband');
    expect(resolved[0].created).toBe(true);

    // Verify individual was created
    const individual = await getIndividualById(resolved[0].id);
    expect(individual).not.toBeNull();
    expect(individual!.gender).toBe('M');

    // Verify name was created
    const name = await getPrimaryName(resolved[0].id);
    expect(name).not.toBeNull();
    expect(name!.surname).toBe('Dupont');
    expect(name!.givenNames).toBe('Joseph');
  });

  it('uses existing individual when existingId is provided', async () => {
    const existingId = await createIndividual({ gender: 'M' });
    await createName({ individualId: existingId, givenNames: 'Pierre', surname: 'Gagnon', isPrimary: true });

    const resolved = await SourceWorkspaceManager.resolveIndividuals([
      { slotKey: 'husband', existingId },
    ]);

    expect(resolved).toHaveLength(1);
    expect(resolved[0].id).toBe(existingId);
    expect(resolved[0].created).toBe(false);
  });

  it('skips empty slots', async () => {
    const resolved = await SourceWorkspaceManager.resolveIndividuals([]);
    expect(resolved).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/managers/SourceWorkspaceManager.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement resolveIndividuals**

```typescript
// src/managers/SourceWorkspaceManager.ts
import { createIndividual } from '$db-tree/individuals';
import { createName } from '$db-tree/names';
import type { Gender } from '$/types/database';

export interface SlotValue {
  slotKey: string;
  existingId?: string;
  newName?: string;
  newGender?: Gender;
}

interface ResolvedIndividual {
  slotKey: string;
  id: string;
  created: boolean;
}

/**
 * Parse a full name string into given names and surname.
 * Assumes the last word is the surname, everything before is given names.
 */
function parseName(fullName: string): { givenNames: string; surname: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { givenNames: '', surname: parts[0] ?? '' };
  }
  const surname = parts[parts.length - 1];
  const givenNames = parts.slice(0, -1).join(' ');
  return { givenNames, surname };
}

export class SourceWorkspaceManager {
  static async resolveIndividuals(slots: SlotValue[]): Promise<ResolvedIndividual[]> {
    const resolved: ResolvedIndividual[] = [];

    for (const slot of slots) {
      if (slot.existingId) {
        resolved.push({ slotKey: slot.slotKey, id: slot.existingId, created: false });
      } else if (slot.newName) {
        const id = await createIndividual({ gender: slot.newGender ?? 'U' });
        const { givenNames, surname } = parseName(slot.newName);
        await createName({ individualId: id, givenNames, surname, isPrimary: true });
        resolved.push({ slotKey: slot.slotKey, id, created: true });
      }
    }

    return resolved;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/managers/SourceWorkspaceManager.test.ts`
Expected: PASS

- [ ] **Step 5: Write test for parseName edge cases**

Add to the test file:

```typescript
import { parseName } from './SourceWorkspaceManager';

describe('parseName', () => {
  it('splits "Joseph Dupont" into given + surname', () => {
    expect(parseName('Joseph Dupont')).toEqual({ givenNames: 'Joseph', surname: 'Dupont' });
  });

  it('handles multiple given names', () => {
    expect(parseName('Joseph Arthur Dupont')).toEqual({ givenNames: 'Joseph Arthur', surname: 'Dupont' });
  });

  it('handles single name as surname', () => {
    expect(parseName('Dupont')).toEqual({ givenNames: '', surname: 'Dupont' });
  });

  it('trims whitespace', () => {
    expect(parseName('  Joseph  Dupont  ')).toEqual({ givenNames: 'Joseph', surname: 'Dupont' });
  });
});
```

Note: export `parseName` from SourceWorkspaceManager.ts for testing.

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm vitest run src/managers/SourceWorkspaceManager.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/managers/SourceWorkspaceManager.ts src/managers/SourceWorkspaceManager.test.ts
git commit -m "feat: add SourceWorkspaceManager with individual resolution"
```

---

## Task 3: SourceWorkspaceManager — Event & Participant Creation

**Files:**
- Modify: `src/managers/SourceWorkspaceManager.ts`
- Modify: `src/managers/SourceWorkspaceManager.test.ts`

- [ ] **Step 1: Write test for event creation with participants**

Add to test file:

```typescript
import { getTemplateById } from '$/lib/templates';
import { getEventById } from '$db-tree/events';
import { getEventParticipants } from '$db-tree/events';

describe('SourceWorkspaceManager.createEventFromTemplate', () => {
  it('creates event with participants for marriage template', async () => {
    // Create two individuals first
    const husbandId = await createIndividual({ gender: 'M' });
    await createName({ individualId: husbandId, givenNames: 'Joseph', surname: 'Dupont', isPrimary: true });
    const wifeId = await createIndividual({ gender: 'F' });
    await createName({ individualId: wifeId, givenNames: 'Marie', surname: 'Tremblay', isPrimary: true });

    const template = getTemplateById('marriage')!;
    const resolvedSlots = [
      { slotKey: 'husband', id: husbandId, created: false },
      { slotKey: 'wife', id: wifeId, created: false },
    ];

    const result = await SourceWorkspaceManager.createEventFromTemplate(
      template,
      resolvedSlots,
      { date: '15 Jun 1892' }
    );

    expect(result.eventId).toBeDefined();

    // Verify event exists
    const event = await getEventById(result.eventId!);
    expect(event).not.toBeNull();
    expect(event!.dateOriginal).toBe('15 Jun 1892');

    // Verify participants
    const participants = await getEventParticipants(result.eventId!);
    expect(participants).toHaveLength(2);
    expect(participants.find((p) => p.individualId === husbandId)?.role).toBe('principal');
    expect(participants.find((p) => p.individualId === wifeId)?.role).toBe('principal');
  });

  it('skips event creation when template has no event type tag', async () => {
    const template = getTemplateById('generic')!;
    const result = await SourceWorkspaceManager.createEventFromTemplate(
      template,
      [],
      {}
    );

    expect(result.eventId).toBeUndefined();
  });

  it('uses eventTypeTag override for generic template', async () => {
    const template = getTemplateById('generic')!;
    const individualId = await createIndividual({ gender: 'M' });
    await createName({ individualId, givenNames: 'Joseph', surname: 'Dupont', isPrimary: true });

    const result = await SourceWorkspaceManager.createEventFromTemplate(
      template,
      [{ slotKey: 'person', id: individualId, created: false }],
      { eventTypeTagOverride: 'BIRT' }
    );

    expect(result.eventId).toBeDefined();
  });

  it('only adds slots with participantRole as event participants', async () => {
    const template = getTemplateById('marriage')!;
    const husbandId = await createIndividual({ gender: 'M' });
    await createName({ individualId: husbandId, givenNames: 'Joseph', surname: 'Dupont', isPrimary: true });
    const fatherId = await createIndividual({ gender: 'M' });
    await createName({ individualId: fatherId, givenNames: 'Pierre', surname: 'Dupont', isPrimary: true });

    const resolvedSlots = [
      { slotKey: 'husband', id: husbandId, created: false },
      { slotKey: 'husband_father', id: fatherId, created: false },
    ];

    const result = await SourceWorkspaceManager.createEventFromTemplate(
      template,
      resolvedSlots,
      {}
    );

    const participants = await getEventParticipants(result.eventId!);
    // Only husband should be a participant (principal), not father (family-only)
    expect(participants).toHaveLength(1);
    expect(participants[0].individualId).toBe(husbandId);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/managers/SourceWorkspaceManager.test.ts`
Expected: FAIL — `createEventFromTemplate` not defined

- [ ] **Step 3: Implement createEventFromTemplate**

Add to `SourceWorkspaceManager`:

```typescript
import { getEventTypeByTag, createEvent, addEventParticipant } from '$db-tree/events';
import { createPlace } from '$db-tree/places';
import { getTemplateById, type TemplateDefinition } from '$/lib/templates';

interface EventOptions {
  date?: string;
  placeId?: string;
  placeName?: string;
  eventTypeTagOverride?: string;
}

interface EventResult {
  eventId?: string;
  placeId?: string;
}

// Inside the class:
static async createEventFromTemplate(
  template: TemplateDefinition,
  resolvedSlots: ResolvedIndividual[],
  options: EventOptions
): Promise<EventResult> {
  const tag = options.eventTypeTagOverride || template.eventTypeTag;

  if (!tag) {
    return {};
  }

  const eventType = await getEventTypeByTag(tag);
  if (!eventType) {
    throw new Error(`Unknown event type tag: ${tag}`);
  }

  // Resolve place
  let placeId = options.placeId;
  if (!placeId && options.placeName) {
    placeId = await createPlace({ name: options.placeName });
  }

  // Create event
  const eventId = await createEvent({
    eventTypeId: eventType.id,
    dateOriginal: options.date,
    placeId,
  });

  // Add participants (only slots with participantRole)
  const slotMap = new Map(resolvedSlots.map((s) => [s.slotKey, s]));
  for (const slot of template.slots) {
    if (!slot.participantRole) continue;
    const resolved = slotMap.get(slot.key);
    if (!resolved) continue;
    await addEventParticipant({
      eventId,
      individualId: resolved.id,
      role: slot.participantRole,
    });
  }

  // For free-form slots (not in template.slots), add them too
  for (const resolved of resolvedSlots) {
    const inTemplate = template.slots.some((s) => s.key === resolved.slotKey);
    if (!inTemplate) {
      // Free-form additions — default to 'other' role
      await addEventParticipant({
        eventId,
        individualId: resolved.id,
        role: 'other',
      });
    }
  }

  return { eventId, placeId };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/managers/SourceWorkspaceManager.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/managers/SourceWorkspaceManager.ts src/managers/SourceWorkspaceManager.test.ts
git commit -m "feat: add event and participant creation to SourceWorkspaceManager"
```

---

## Task 4: SourceWorkspaceManager — Family Creation

**Files:**
- Modify: `src/managers/SourceWorkspaceManager.ts`
- Modify: `src/managers/SourceWorkspaceManager.test.ts`

- [ ] **Step 1: Write tests for family creation**

Add to test file:

```typescript
import { getFamilyMembers } from '$db-tree/families';

describe('SourceWorkspaceManager.createFamilies', () => {
  it('creates couple family from marriage template', async () => {
    const husbandId = await createIndividual({ gender: 'M' });
    await createName({ individualId: husbandId, givenNames: 'Joseph', surname: 'Dupont', isPrimary: true });
    const wifeId = await createIndividual({ gender: 'F' });
    await createName({ individualId: wifeId, givenNames: 'Marie', surname: 'Tremblay', isPrimary: true });

    const template = getTemplateById('marriage')!;
    const resolvedSlots = [
      { slotKey: 'husband', id: husbandId, created: false },
      { slotKey: 'wife', id: wifeId, created: false },
    ];

    const familyIds = await SourceWorkspaceManager.createFamilies(template, resolvedSlots);
    expect(familyIds).toHaveLength(1); // Only couple family — no parents filled

    const members = await getFamilyMembers(familyIds[0]);
    expect(members).toHaveLength(2);
    expect(members.find((m) => m.individualId === husbandId)?.role).toBe('husband');
    expect(members.find((m) => m.individualId === wifeId)?.role).toBe('wife');
  });

  it('creates parent-child family when parents are filled', async () => {
    const childId = await createIndividual({ gender: 'M' });
    await createName({ individualId: childId, givenNames: 'Joseph', surname: 'Dupont', isPrimary: true });
    const fatherId = await createIndividual({ gender: 'M' });
    await createName({ individualId: fatherId, givenNames: 'Pierre', surname: 'Dupont', isPrimary: true });

    const template = getTemplateById('marriage')!;
    const resolvedSlots = [
      { slotKey: 'husband', id: childId, created: false },
      { slotKey: 'husband_father', id: fatherId, created: false },
    ];

    const familyIds = await SourceWorkspaceManager.createFamilies(template, resolvedSlots);
    // Should create parent-child family (child + one parent), skip couple (no wife)
    expect(familyIds).toHaveLength(1);

    const members = await getFamilyMembers(familyIds[0]);
    expect(members.find((m) => m.individualId === fatherId)?.role).toBe('husband');
    expect(members.find((m) => m.individualId === childId)?.role).toBe('child');
  });

  it('skips parent-child family when child slot is missing', async () => {
    const fatherId = await createIndividual({ gender: 'M' });
    await createName({ individualId: fatherId, givenNames: 'Pierre', surname: 'Dupont', isPrimary: true });
    const motherId = await createIndividual({ gender: 'F' });
    await createName({ individualId: motherId, givenNames: 'Anne', surname: 'Gagnon', isPrimary: true });

    const template = getTemplateById('birth')!;
    const resolvedSlots = [
      { slotKey: 'father', id: fatherId, created: false },
      { slotKey: 'mother', id: motherId, created: false },
    ];

    const familyIds = await SourceWorkspaceManager.createFamilies(template, resolvedSlots);
    expect(familyIds).toHaveLength(0);
  });

  it('skips couple family when both spouses are missing', async () => {
    const template = getTemplateById('marriage')!;
    const familyIds = await SourceWorkspaceManager.createFamilies(template, []);
    expect(familyIds).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/managers/SourceWorkspaceManager.test.ts`
Expected: FAIL — `createFamilies` not defined

- [ ] **Step 3: Implement createFamilies**

Add to `SourceWorkspaceManager`:

```typescript
import { createFamily, addFamilyMember } from '$db-tree/families';
import type { FamilyRule } from '$/lib/templates';

static async createFamilies(
  template: TemplateDefinition,
  resolvedSlots: ResolvedIndividual[]
): Promise<string[]> {
  const slotMap = new Map(resolvedSlots.map((s) => [s.slotKey, s]));
  const familyIds: string[] = [];

  for (const rule of template.families) {
    const membersToAdd: { id: string; role: 'husband' | 'wife' | 'child' }[] = [];

    for (const member of rule.members) {
      const resolved = slotMap.get(member.slot);
      if (resolved) {
        membersToAdd.push({ id: resolved.id, role: member.role });
      }
    }

    // Skip if not enough members
    if (rule.type === 'couple' && membersToAdd.length < 2) continue;
    if (rule.type === 'parent-child') {
      const hasChild = membersToAdd.some((m) => m.role === 'child');
      const hasParent = membersToAdd.some((m) => m.role !== 'child');
      if (!hasChild || !hasParent) continue;
    }

    const familyId = await createFamily({});
    for (const member of membersToAdd) {
      await addFamilyMember({
        familyId,
        individualId: member.id,
        role: member.role,
      });
    }
    familyIds.push(familyId);
  }

  return familyIds;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/managers/SourceWorkspaceManager.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/managers/SourceWorkspaceManager.ts src/managers/SourceWorkspaceManager.test.ts
git commit -m "feat: add family creation to SourceWorkspaceManager"
```

---

## Task 5: SourceWorkspaceManager — Citation & Full Orchestration

**Files:**
- Modify: `src/managers/SourceWorkspaceManager.ts`
- Modify: `src/managers/SourceWorkspaceManager.test.ts`

- [ ] **Step 1: Write test for full createFromTemplate flow**

```typescript
import { getCitationsBySourceId } from '$db-tree/citations';
import { getCitationLinksForCitation } from '$db-tree/citations';
import { createSource } from '$db-tree/sources';

describe('SourceWorkspaceManager.createFromTemplate', () => {
  it('creates full marriage record from template', async () => {
    // Setup: create source
    const sourceId = await createSource({ title: 'Marriage Certificate 1892' });

    const result = await SourceWorkspaceManager.createFromTemplate({
      sourceId,
      templateId: 'marriage',
      slots: [
        { slotKey: 'husband', newName: 'Joseph Dupont', newGender: 'M' },
        { slotKey: 'wife', newName: 'Marie Tremblay', newGender: 'F' },
      ],
      date: '15 Jun 1892',
      citationPage: 'p. 42',
    });

    // Should have created event
    expect(result.eventId).toBeDefined();

    // Should have created 2 individuals
    expect(result.createdIndividuals).toHaveLength(2);

    // Should have created 1 family (couple)
    expect(result.createdFamilies).toHaveLength(1);

    // Should have created citation
    expect(result.citationId).toBeDefined();
    const citations = await getCitationsBySourceId(sourceId);
    expect(citations).toHaveLength(1);
    expect(citations[0].page).toBe('p. 42');

    // Should have citation links to event + 2 individuals + 1 family = 4
    expect(result.citationLinkIds).toHaveLength(4);
  });

  it('creates record with no event for generic template without event type', async () => {
    const sourceId = await createSource({ title: 'Family Bible' });

    const result = await SourceWorkspaceManager.createFromTemplate({
      sourceId,
      templateId: 'generic',
      slots: [
        { slotKey: 'person_1', newName: 'Joseph Dupont', newGender: 'M' },
      ],
    });

    expect(result.eventId).toBeUndefined();
    expect(result.createdIndividuals).toHaveLength(1);
    expect(result.citationId).toBeDefined();
    // Citation links: 1 individual only (no event, no family)
    expect(result.citationLinkIds).toHaveLength(1);
  });

  it('creates marriage with parents and witnesses', async () => {
    const sourceId = await createSource({ title: 'Parish Record' });

    const result = await SourceWorkspaceManager.createFromTemplate({
      sourceId,
      templateId: 'marriage',
      slots: [
        { slotKey: 'husband', newName: 'Joseph Dupont', newGender: 'M' },
        { slotKey: 'wife', newName: 'Marie Tremblay', newGender: 'F' },
        { slotKey: 'husband_father', newName: 'Pierre Dupont', newGender: 'M' },
        { slotKey: 'husband_mother', newName: 'Anne Gagnon', newGender: 'F' },
        { slotKey: 'witness', newName: 'Henri Dupont', newGender: 'M' },
      ],
      date: '15 Jun 1892',
    });

    // 5 individuals created
    expect(result.createdIndividuals).toHaveLength(5);
    // 2 families: couple + parent-child (husband's parents)
    expect(result.createdFamilies).toHaveLength(2);
    // Citation links: 1 event + 5 individuals + 2 families = 8
    expect(result.citationLinkIds).toHaveLength(8);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/managers/SourceWorkspaceManager.test.ts`
Expected: FAIL — `createFromTemplate` not defined

- [ ] **Step 3: Implement createFromTemplate**

Add to `SourceWorkspaceManager`:

```typescript
import { createCitation, createCitationLink } from '$db-tree/citations';

export interface CreateFromTemplateInput {
  sourceId: string;
  templateId: string;
  slots: SlotValue[];
  eventTypeTag?: string;
  date?: string;
  place?: string;
  existingPlaceId?: string;
  citationPage?: string;
}

export interface CreateFromTemplateResult {
  eventId?: string;
  createdIndividuals: { slotKey: string; id: string }[];
  createdFamilies: string[];
  citationId: string;
  citationLinkIds: string[];
}

static async createFromTemplate(input: CreateFromTemplateInput): Promise<CreateFromTemplateResult> {
  const template = getTemplateById(input.templateId);
  if (!template) {
    throw new Error(`Unknown template: ${input.templateId}`);
  }

  // Step 1: Resolve individuals
  const resolvedIndividuals = await SourceWorkspaceManager.resolveIndividuals(input.slots);

  // Steps 3-5: Create event + participants
  const eventResult = await SourceWorkspaceManager.createEventFromTemplate(
    template,
    resolvedIndividuals,
    {
      date: input.date,
      placeId: input.existingPlaceId,
      placeName: input.place,
      eventTypeTagOverride: input.eventTypeTag,
    }
  );

  // Step 6: Create families
  const familyIds = await SourceWorkspaceManager.createFamilies(template, resolvedIndividuals);

  // Step 7: Create citation
  const citationId = await createCitation({
    sourceId: input.sourceId,
    page: input.citationPage,
  });

  // Step 8: Create citation links
  const citationLinkIds: string[] = [];

  // Link to event
  if (eventResult.eventId) {
    const linkId = await createCitationLink({
      citationId,
      entityType: 'event',
      entityId: eventResult.eventId,
    });
    citationLinkIds.push(linkId);
  }

  // Link to individuals
  for (const resolved of resolvedIndividuals) {
    const linkId = await createCitationLink({
      citationId,
      entityType: 'individual',
      entityId: resolved.id,
    });
    citationLinkIds.push(linkId);
  }

  // Link to families
  for (const familyId of familyIds) {
    const linkId = await createCitationLink({
      citationId,
      entityType: 'family',
      entityId: familyId,
    });
    citationLinkIds.push(linkId);
  }

  return {
    eventId: eventResult.eventId,
    createdIndividuals: resolvedIndividuals
      .filter((r) => r.created)
      .map((r) => ({ slotKey: r.slotKey, id: r.id })),
    createdFamilies: familyIds,
    citationId,
    citationLinkIds,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/managers/SourceWorkspaceManager.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/managers/SourceWorkspaceManager.ts src/managers/SourceWorkspaceManager.test.ts
git commit -m "feat: add full createFromTemplate orchestration to SourceWorkspaceManager"
```

---

## Task 6: Citations With Details Query

**Files:**
- Create: `src/db/trees/citations-with-details.ts`
- Create: `src/db/trees/citations-with-details.test.ts`
- Modify: `src/types/database.ts` (add `CitationWithDetails` type)
- Modify: `src/lib/query-keys.ts` (add key)

**Context:** The left panel's CitationsSummary needs a joined query that returns citations for a source, along with linked entity names and event types. This is a read-only query, not CRUD.

- [ ] **Step 1: Add CitationWithDetails type to database.ts**

Add to `src/types/database.ts`:

```typescript
export interface CitationDetail {
  citationId: string;
  page: string | null;
  eventId: string | null;
  eventTypeName: string | null;
  eventDate: string | null;
  linkedIndividuals: { id: string; name: string }[];
}
```

- [ ] **Step 2: Add query key**

Add to `src/lib/query-keys.ts`:

```typescript
citationsWithDetails: (sourceId: string) => ['citationsWithDetails', sourceId] as const,
```

- [ ] **Step 3: Write test for the query**

```typescript
// src/db/trees/citations-with-details.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { getCitationDetailsForSource } from './citations-with-details';
import { createSource } from './sources';
import { SourceWorkspaceManager } from '$/managers/SourceWorkspaceManager';

let cleanup: () => Promise<void>;

beforeEach(async () => {
  const result = await createTreeInMemoryDb();
  cleanup = result.cleanup;
});

afterEach(async () => {
  await cleanup();
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
    expect(details[0].eventTypeName).toBe('Marriage');
    expect(details[0].eventDate).toBe('15 Jun 1892');
    expect(details[0].linkedIndividuals).toHaveLength(2);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm vitest run src/db/trees/citations-with-details.test.ts`
Expected: FAIL

- [ ] **Step 5: Implement the query**

```typescript
// src/db/trees/citations-with-details.ts
import { getTreeDb } from '../connection';
import { parseEntityId, formatEntityId } from '$/lib/entityId';
import type { CitationDetail } from '$/types/database';

interface RawCitationRow {
  citation_id: number;
  page: string | null;
  event_id: number | null;
  event_type_name: string | null;
  event_date: string | null;
}

interface RawCitationLinkRow {
  citation_id: number;
  entity_type: string;
  entity_id: number;
  individual_given_names: string | null;
  individual_surname: string | null;
}

export async function getCitationDetailsForSource(sourceId: string): Promise<CitationDetail[]> {
  const db = await getTreeDb();
  const dbSourceId = parseEntityId(sourceId);

  // Get citations with event info
  const citationRows = await db.select<RawCitationRow[]>(
    `SELECT
       sc.id AS citation_id,
       sc.page,
       e.id AS event_id,
       COALESCE(et.custom_name, et.tag) AS event_type_name,
       e.date_original AS event_date
     FROM source_citations sc
     LEFT JOIN citation_links cl_event ON cl_event.citation_id = sc.id AND cl_event.entity_type = 'event'
     LEFT JOIN events e ON e.id = cl_event.entity_id
     LEFT JOIN event_types et ON et.id = e.event_type_id
     WHERE sc.source_id = $1
     ORDER BY sc.id`,
    [dbSourceId]
  );

  // Get linked individuals for each citation
  const citationIds = citationRows.map((r) => r.citation_id);
  if (citationIds.length === 0) return [];

  const placeholders = citationIds.map((_, i) => `$${i + 1}`).join(', ');
  const individualRows = await db.select<RawCitationLinkRow[]>(
    `SELECT
       cl.citation_id,
       cl.entity_type,
       cl.entity_id,
       n.given_names AS individual_given_names,
       n.surname AS individual_surname
     FROM citation_links cl
     LEFT JOIN names n ON cl.entity_type = 'individual' AND n.individual_id = cl.entity_id AND n.is_primary = 1
     WHERE cl.citation_id IN (${placeholders}) AND cl.entity_type = 'individual'
     ORDER BY cl.citation_id, cl.id`,
    citationIds
  );

  // Group individuals by citation
  const individualsByCitation = new Map<number, { id: string; name: string }[]>();
  for (const row of individualRows) {
    const list = individualsByCitation.get(row.citation_id) ?? [];
    const name = [row.individual_given_names, row.individual_surname].filter(Boolean).join(' ');
    list.push({ id: formatEntityId('I', row.entity_id), name: name || 'Unknown' });
    individualsByCitation.set(row.citation_id, list);
  }

  return citationRows.map((row) => ({
    citationId: String(row.citation_id),
    page: row.page,
    eventId: row.event_id ? formatEntityId('E', row.event_id) : null,
    eventTypeName: row.event_type_name,
    eventDate: row.event_date,
    linkedIndividuals: individualsByCitation.get(row.citation_id) ?? [],
  }));
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm vitest run src/db/trees/citations-with-details.test.ts`
Expected: PASS

- [ ] **Step 7: Create React Query hook**

```typescript
// src/hooks/useCitationsWithDetails.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { getCitationDetailsForSource } from '$db-tree/citations-with-details';

export function useCitationsWithDetails(sourceId: string) {
  return useQuery({
    queryKey: queryKeys.citationsWithDetails(sourceId),
    queryFn: () => getCitationDetailsForSource(sourceId),
  });
}
```

- [ ] **Step 8: Commit**

```bash
git add src/types/database.ts src/lib/query-keys.ts src/db/trees/citations-with-details.ts src/db/trees/citations-with-details.test.ts src/hooks/useCitationsWithDetails.ts
git commit -m "feat: add citations-with-details query and hook for workspace left panel"
```

---

## Task 7: Route Restructure — Leaf to Layout

**Files:**
- Modify: `src/routes/tree/$treeId/source/$sourceId.tsx` (convert to layout)
- Create: `src/routes/tree/$treeId/source/$sourceId/index.tsx`
- Create: `src/routes/tree/$treeId/source/$sourceId/edit.tsx`

**Context:** TanStack Router file-based routing. The current `$sourceId.tsx` is a leaf route. To add `/edit` as a child, we convert it to a layout with `<Outlet />` and move the current view into an `index.tsx`.

- [ ] **Step 1: Convert $sourceId.tsx to layout route**

Replace `src/routes/tree/$treeId/source/$sourceId.tsx` contents:

```typescript
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/tree/$treeId/source/$sourceId')({
  component: function SourceLayout() {
    return <Outlet />;
  },
});
```

- [ ] **Step 2: Create index route with current SourceViewPage**

```typescript
// src/routes/tree/$treeId/source/$sourceId/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { SourceViewPage } from '$/pages/SourceViewPage';

export const Route = createFileRoute('/tree/$treeId/source/$sourceId/')({
  component: function SourceViewRoute() {
    const { treeId, sourceId } = Route.useParams();
    return <SourceViewPage treeId={treeId} sourceId={sourceId} />;
  },
});
```

- [ ] **Step 3: Create edit route (placeholder for now)**

```typescript
// src/routes/tree/$treeId/source/$sourceId/edit.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tree/$treeId/source/$sourceId/edit')({
  component: function SourceWorkspaceRoute() {
    const { treeId, sourceId } = Route.useParams();
    return (
      <div>
        <p>Source Workspace — {sourceId}</p>
        <p>Coming soon...</p>
      </div>
    );
  },
});
```

- [ ] **Step 4: Run dev server to verify routes work**

Run: `pnpm dev`
Verify: navigate to `/tree/1/source/S-0001` still shows the detail page, and `/tree/1/source/S-0001/edit` shows the placeholder.

- [ ] **Step 5: Commit**

```bash
git add src/routes/tree/\$treeId/source/\$sourceId.tsx src/routes/tree/\$treeId/source/\$sourceId/index.tsx src/routes/tree/\$treeId/source/\$sourceId/edit.tsx
git commit -m "refactor: convert source route to layout with index and edit children"
```

---

## Task 8: Add "Edit" Button to SourceViewPage

**Files:**
- Modify: `src/pages/SourceViewPage.tsx`

- [ ] **Step 1: Add Edit (workspace) link to the source detail page**

In `SourceViewPage.tsx`, add a Link to the edit route next to the existing Edit/Delete buttons. The existing "Edit" button triggers inline editing — rename it to something like "Edit Details" and add a new prominent "Edit" button that navigates to the workspace:

Replace the button section (around line 386-415) — add a Link to `/tree/$treeId/source/$sourceId/edit`:

```typescript
import { Link } from '@tanstack/react-router';

// In the button area, replace the existing Edit button:
<Link
  to="/tree/$treeId/source/$sourceId/edit"
  params={{ treeId, sourceId }}
  style={{
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    background: '#333',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '0.9rem',
    textDecoration: 'none',
  }}
>
  Edit
</Link>
<button onClick={openEdit} style={/* existing style but secondary */}>
  Edit Details
</button>
```

- [ ] **Step 2: Verify navigation works**

Run: `pnpm dev`
Click "Edit" on a source detail page → should navigate to `/tree/$treeId/source/$sourceId/edit`

- [ ] **Step 3: Commit**

```bash
git add src/pages/SourceViewPage.tsx
git commit -m "feat(ui): add Edit button to source detail page linking to workspace"
```

---

## Task 9: Workspace Shell — Header + Layout

**Files:**
- Create: `src/pages/SourceWorkspacePage.tsx`
- Create: `src/components/workspace/WorkspaceHeader.tsx`
- Create: `src/components/workspace/WorkspaceLayout.tsx`
- Modify: `src/routes/tree/$treeId/source/$sourceId/edit.tsx` (wire up real page)

- [ ] **Step 1: Create WorkspaceHeader**

```typescript
// src/components/workspace/WorkspaceHeader.tsx
import { Link } from '@tanstack/react-router';
import type { Source } from '$/types/database';

interface WorkspaceHeaderProps {
  treeId: string;
  sourceId: string;
  source: Source;
}

export function WorkspaceHeader({ treeId, sourceId, source }: WorkspaceHeaderProps): JSX.Element {
  return (
    <div style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{source.title}</div>
        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
          {sourceId}
          {source.author && <> &middot; {source.author}</>}
        </div>
      </div>
      <Link
        to="/tree/$treeId/source/$sourceId"
        params={{ treeId, sourceId }}
        style={{ padding: '0.3rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.85rem', textDecoration: 'none', color: '#333' }}
      >
        &larr; Back
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Create WorkspaceLayout**

```typescript
// src/components/workspace/WorkspaceLayout.tsx
import type { ReactNode } from 'react';

interface WorkspaceLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export function WorkspaceLayout({ left, right }: WorkspaceLayoutProps): JSX.Element {
  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <div style={{ flex: 1, overflow: 'auto', borderRight: '2px solid #ddd' }}>
        {left}
      </div>
      <div style={{ width: '400px', overflow: 'auto', background: '#fafafa' }}>
        {right}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create SourceWorkspacePage**

```typescript
// src/pages/SourceWorkspacePage.tsx
import { useSource } from '$/hooks/useSources';
import { WorkspaceHeader } from '$/components/workspace/WorkspaceHeader';
import { WorkspaceLayout } from '$/components/workspace/WorkspaceLayout';

interface SourceWorkspacePageProps {
  treeId: string;
  sourceId: string;
}

export function SourceWorkspacePage({ treeId, sourceId }: SourceWorkspacePageProps): JSX.Element {
  const { data: source, isLoading, isError } = useSource(sourceId);

  if (isLoading) {
    return <p style={{ padding: '1rem', color: '#666' }}>Loading...</p>;
  }

  if (isError || !source) {
    return <p style={{ padding: '1rem', color: '#c00' }}>Source not found.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <WorkspaceHeader treeId={treeId} sourceId={sourceId} source={source} />
      <WorkspaceLayout
        left={<div style={{ padding: '1rem', color: '#888' }}>Left panel (citations + images)</div>}
        right={<div style={{ padding: '1rem', color: '#888' }}>Right panel (templates)</div>}
      />
    </div>
  );
}
```

- [ ] **Step 4: Wire up the route**

Update `src/routes/tree/$treeId/source/$sourceId/edit.tsx`:

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { SourceWorkspacePage } from '$/pages/SourceWorkspacePage';

export const Route = createFileRoute('/tree/$treeId/source/$sourceId/edit')({
  component: function SourceWorkspaceRoute() {
    const { treeId, sourceId } = Route.useParams();
    return <SourceWorkspacePage treeId={treeId} sourceId={sourceId} />;
  },
});
```

- [ ] **Step 5: Verify shell renders**

Run: `pnpm dev`
Navigate to a source → click Edit → should see header + split layout with placeholder text.

- [ ] **Step 6: Commit**

```bash
git add src/pages/SourceWorkspacePage.tsx src/components/workspace/WorkspaceHeader.tsx src/components/workspace/WorkspaceLayout.tsx src/routes/tree/\$treeId/source/\$sourceId/edit.tsx
git commit -m "feat(ui): add workspace shell with header and split layout"
```

---

## Task 10: Left Panel — Citations Summary

**Files:**
- Create: `src/components/workspace/CitationsSummary.tsx`
- Create: `src/components/workspace/LeftPanel.tsx`
- Modify: `src/pages/SourceWorkspacePage.tsx` (wire up left panel)

- [ ] **Step 1: Create CitationsSummary component**

```typescript
// src/components/workspace/CitationsSummary.tsx
import { Link } from '@tanstack/react-router';
import { useCitationsWithDetails } from '$/hooks/useCitationsWithDetails';

interface CitationsSummaryProps {
  treeId: string;
  sourceId: string;
}

export function CitationsSummary({ treeId, sourceId }: CitationsSummaryProps): JSX.Element {
  const { data: citations, isLoading } = useCitationsWithDetails(sourceId);

  if (isLoading) {
    return <p style={{ padding: '0.75rem', color: '#888', fontSize: '0.85rem' }}>Loading citations...</p>;
  }

  if (!citations || citations.length === 0) {
    return (
      <p style={{ padding: '0.75rem', color: '#888', fontSize: '0.85rem' }}>
        No citations yet — use the panel on the right to start extracting data from this source.
      </p>
    );
  }

  return (
    <div>
      <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e0e0e0' }}>
        Citations ({citations.length})
      </div>
      {citations.map((citation) => (
        <div key={citation.citationId} style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {citation.eventTypeName ?? 'No event'}
            {citation.eventDate && <span style={{ fontWeight: 400, color: '#666' }}> — {citation.eventDate}</span>}
          </div>
          {citation.page && (
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.15rem' }}>{citation.page}</div>
          )}
          {citation.linkedIndividuals.length > 0 && (
            <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.25rem' }}>
              {citation.linkedIndividuals.map((ind) => (
                <Link
                  key={ind.id}
                  to="/tree/$treeId/individual/$individualId"
                  params={{ treeId, individualId: ind.id }}
                  style={{ color: '#06c', textDecoration: 'none', marginRight: '0.5rem' }}
                >
                  {ind.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create LeftPanel**

```typescript
// src/components/workspace/LeftPanel.tsx
import { CitationsSummary } from './CitationsSummary';

interface LeftPanelProps {
  treeId: string;
  sourceId: string;
}

export function LeftPanel({ treeId, sourceId }: LeftPanelProps): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CitationsSummary treeId={treeId} sourceId={sourceId} />
    </div>
  );
}
```

- [ ] **Step 3: Wire up in SourceWorkspacePage**

Replace the left placeholder in `SourceWorkspacePage.tsx`:

```typescript
import { LeftPanel } from '$/components/workspace/LeftPanel';

// In the JSX:
<WorkspaceLayout
  left={<LeftPanel treeId={treeId} sourceId={sourceId} />}
  right={<div style={{ padding: '1rem', color: '#888' }}>Right panel (templates)</div>}
/>
```

- [ ] **Step 4: Verify it renders**

Run: `pnpm dev`
Navigate to workspace → left panel should show "No citations yet" empty state.

- [ ] **Step 5: Commit**

```bash
git add src/components/workspace/CitationsSummary.tsx src/components/workspace/LeftPanel.tsx src/pages/SourceWorkspacePage.tsx
git commit -m "feat(ui): add citations summary to workspace left panel"
```

---

## Task 11: PersonSlot Component

**Files:**
- Create: `src/components/workspace/PersonSlot.tsx`
- Create: `src/components/workspace/PersonSlot.test.tsx`

**Context:** The core interactive component. Autocomplete with debounce, search results dropdown, "Create new" option, filled state display.

- [ ] **Step 1: Write tests for PersonSlot**

```typescript
// src/components/workspace/PersonSlot.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PersonSlot, type PersonSlotValue } from './PersonSlot';

// Mock the search function
vi.mock('$db-tree/individuals', () => ({
  searchIndividuals: vi.fn().mockResolvedValue([
    { id: 'I-0001', gender: 'M' },
    { id: 'I-0002', gender: 'F' },
  ]),
}));

vi.mock('$db-tree/names', () => ({
  getPrimaryName: vi.fn().mockImplementation((id: string) => {
    if (id === 'I-0001') return Promise.resolve({ givenNames: 'Joseph', surname: 'Dupont' });
    if (id === 'I-0002') return Promise.resolve({ givenNames: 'Marie', surname: 'Dupont' });
    return Promise.resolve(null);
  }),
  formatName: vi.fn().mockImplementation((name) => {
    if (!name) return { full: 'Unknown' };
    return { full: `${name.givenNames} ${name.surname}` };
  }),
}));

describe('PersonSlot', () => {
  it('renders with label', () => {
    render(<PersonSlot label="Husband" onChange={vi.fn()} />);
    expect(screen.getByText('Husband')).toBeDefined();
  });

  it('shows search input when empty', () => {
    render(<PersonSlot label="Husband" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search or type name...')).toBeDefined();
  });

  it('shows filled state when value is provided', () => {
    const value: PersonSlotValue = { type: 'existing', id: 'I-0001', displayName: 'Joseph Dupont' };
    render(<PersonSlot label="Husband" value={value} onChange={vi.fn()} />);
    expect(screen.getByText('Joseph Dupont')).toBeDefined();
  });

  it('calls onChange with null when X is clicked on filled slot', () => {
    const onChange = vi.fn();
    const value: PersonSlotValue = { type: 'existing', id: 'I-0001', displayName: 'Joseph Dupont' };
    render(<PersonSlot label="Husband" value={value} onChange={onChange} />);
    fireEvent.click(screen.getByText('\u2715'));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/components/workspace/PersonSlot.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement PersonSlot**

```typescript
// src/components/workspace/PersonSlot.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchIndividuals } from '$db-tree/individuals';
import { getPrimaryName, formatName } from '$db-tree/names';
import type { Gender, Individual } from '$/types/database';

export interface PersonSlotValue {
  type: 'existing' | 'new';
  id?: string;            // for existing
  displayName: string;
  newName?: string;       // for new
  newGender?: Gender;     // for new
}

interface PersonSlotProps {
  label: string;
  value?: PersonSlotValue | null;
  defaultGender?: 'M' | 'F';
  required?: boolean;
  onChange: (value: PersonSlotValue | null) => void;
}

interface SearchResult {
  id: string;
  name: string;
  gender: string;
}

export function PersonSlot({ label, value, defaultGender, required, onChange }: PersonSlotProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const individuals = await searchIndividuals(q);
      const searchResults: SearchResult[] = [];
      for (const ind of individuals.slice(0, 8)) {
        const name = await getPrimaryName(ind.id);
        const formatted = formatName(name);
        searchResults.push({ id: ind.id, name: formatted.full, gender: ind.gender });
      }
      setResults(searchResults);
      setShowDropdown(true);
    } finally {
      setIsSearching(false);
    }
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  }

  function handleSelectExisting(result: SearchResult) {
    onChange({ type: 'existing', id: result.id, displayName: result.name });
    setQuery('');
    setShowDropdown(false);
  }

  function handleCreateNew() {
    onChange({
      type: 'new',
      displayName: query.trim(),
      newName: query.trim(),
      newGender: defaultGender ?? 'U',
    });
    setQuery('');
    setShowDropdown(false);
  }

  function handleClear() {
    onChange(null);
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filled state
  if (value) {
    return (
      <div style={{ marginBottom: '0.75rem', padding: '0.6rem', border: '1px solid #c0dcc0', borderRadius: '6px', background: '#f0f8f0' }}>
        <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
          {label}{required && <span style={{ color: '#c00' }}> *</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{value.displayName}</div>
            <div style={{ fontSize: '0.7rem', color: '#666' }}>
              {value.type === 'existing' ? value.id : 'will be created'}
            </div>
          </div>
          <span onClick={handleClear} style={{ fontSize: '0.7rem', color: '#c00', cursor: 'pointer' }}>{'\u2715'}</span>
        </div>
      </div>
    );
  }

  // Empty state
  return (
    <div ref={containerRef} style={{ marginBottom: '0.75rem', padding: '0.6rem', border: '1px dashed #ccc', borderRadius: '6px', background: '#fff', position: 'relative' }}>
      <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
        {label}{required && <span style={{ color: '#c00' }}> *</span>}
      </div>
      <input
        type="text"
        placeholder="Search or type name..."
        value={query}
        onChange={handleInputChange}
        onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
        style={{ width: '100%', padding: '0.35rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.8rem', boxSizing: 'border-box' }}
      />
      {showDropdown && (
        <div style={{ position: 'absolute', left: '0.6rem', right: '0.6rem', top: '100%', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflow: 'auto' }}>
          {results.map((r) => (
            <div
              key={r.id}
              onClick={() => handleSelectExisting(r)}
              style={{ padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', borderBottom: '1px solid #f0f0f0' }}
            >
              <span style={{ fontWeight: 500 }}>{r.name}</span>
              <span style={{ color: '#888', marginLeft: '0.5rem' }}>{r.gender} — {r.id}</span>
            </div>
          ))}
          {query.trim() && (
            <div
              onClick={handleCreateNew}
              style={{ padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', color: '#4a90d9', fontWeight: 500 }}
            >
              Create &quot;{query.trim()}&quot;
            </div>
          )}
          {isSearching && <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', color: '#888' }}>Searching...</div>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/components/workspace/PersonSlot.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/workspace/PersonSlot.tsx src/components/workspace/PersonSlot.test.tsx
git commit -m "feat(ui): add PersonSlot autocomplete component"
```

---

## Task 12: PlaceAutocomplete, EventTypeSelector, EventDetails

**Files:**
- Create: `src/components/workspace/PlaceAutocomplete.tsx`
- Create: `src/components/workspace/EventTypeSelector.tsx`
- Create: `src/components/workspace/EventDetails.tsx`

**Context:** These are simpler form components. PlaceAutocomplete follows the same pattern as PersonSlot but for places. EventTypeSelector is a select dropdown. EventDetails combines date input + PlaceAutocomplete.

- [ ] **Step 1: Create PlaceAutocomplete**

Similar pattern to PersonSlot but simpler — searches places, offers "Create new".

```typescript
// src/components/workspace/PlaceAutocomplete.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchPlaces } from '$db-tree/places';

export interface PlaceValue {
  type: 'existing' | 'new';
  id?: string;
  name: string;
}

interface PlaceAutocompleteProps {
  value?: PlaceValue | null;
  onChange: (value: PlaceValue | null) => void;
}

export function PlaceAutocomplete({ value, onChange }: PlaceAutocompleteProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    const places = await searchPlaces(q);
    setResults(places.slice(0, 8).map((p) => ({ id: p.id, name: p.name })));
    setShowDropdown(true);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowDropdown(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (value) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem' }}>{value.name}</span>
        <span onClick={() => onChange(null)} style={{ fontSize: '0.7rem', color: '#c00', cursor: 'pointer' }}>{'\u2715'}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Search or type place..."
        value={query}
        onChange={handleInputChange}
        onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
        style={{ width: '100%', padding: '0.3rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.8rem', boxSizing: 'border-box' }}
      />
      {showDropdown && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '150px', overflow: 'auto' }}>
          {results.map((r) => (
            <div key={r.id} onClick={() => { onChange({ type: 'existing', id: r.id, name: r.name }); setQuery(''); setShowDropdown(false); }}
              style={{ padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', borderBottom: '1px solid #f0f0f0' }}>
              {r.name}
            </div>
          ))}
          {query.trim() && (
            <div onClick={() => { onChange({ type: 'new', name: query.trim() }); setQuery(''); setShowDropdown(false); }}
              style={{ padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', color: '#4a90d9', fontWeight: 500 }}>
              Create &quot;{query.trim()}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create EventTypeSelector**

```typescript
// src/components/workspace/EventTypeSelector.tsx
import { TEMPLATES, type TemplateDefinition } from '$/lib/templates';

interface EventTypeSelectorProps {
  value: string;
  onChange: (templateId: string) => void;
}

export function EventTypeSelector({ value, onChange }: EventTypeSelectorProps): JSX.Element {
  return (
    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e0e0e0', background: '#fff' }}>
      <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
        Document Type
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
      >
        <option value="">Select document type...</option>
        {TEMPLATES.map((t) => (
          <option key={t.id} value={t.id}>{t.label}</option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 3: Create EventDetails**

```typescript
// src/components/workspace/EventDetails.tsx
import { PlaceAutocomplete, type PlaceValue } from './PlaceAutocomplete';

interface EventDetailsProps {
  date: string;
  place: PlaceValue | null;
  onDateChange: (date: string) => void;
  onPlaceChange: (place: PlaceValue | null) => void;
}

export function EventDetails({ date, place, onDateChange, onPlaceChange }: EventDetailsProps): JSX.Element {
  return (
    <div style={{ marginBottom: '0.75rem', padding: '0.6rem', border: '1px solid #e0e0e0', borderRadius: '6px', background: '#fff' }}>
      <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
        Event Details
      </div>
      <div style={{ marginBottom: '0.4rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.15rem' }}>Date</div>
        <input
          type="text"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          placeholder="e.g., 15 Jun 1892"
          style={{ width: '100%', padding: '0.3rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.8rem', boxSizing: 'border-box' }}
        />
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.15rem' }}>Place</div>
        <PlaceAutocomplete value={place} onChange={onPlaceChange} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/workspace/PlaceAutocomplete.tsx src/components/workspace/EventTypeSelector.tsx src/components/workspace/EventDetails.tsx
git commit -m "feat(ui): add PlaceAutocomplete, EventTypeSelector, and EventDetails components"
```

---

## Task 13: TemplateSlots, CreateEventButton, FreeFormAdd

**Files:**
- Create: `src/components/workspace/TemplateSlots.tsx`
- Create: `src/components/workspace/CreateEventButton.tsx`
- Create: `src/components/workspace/FreeFormAdd.tsx`

- [ ] **Step 1: Create TemplateSlots**

Renders PersonSlot for each slot in the selected template. Manages slot values as state.

```typescript
// src/components/workspace/TemplateSlots.tsx
import { PersonSlot, type PersonSlotValue } from './PersonSlot';
import type { TemplateDefinition } from '$/lib/templates';

interface TemplateSlotsProps {
  template: TemplateDefinition;
  values: Record<string, PersonSlotValue | PersonSlotValue[] | null>;
  onChange: (slotKey: string, value: PersonSlotValue | null, index?: number) => void;
  onAddMultiple: (slotKey: string) => void;
}

export function TemplateSlots({ template, values, onChange, onAddMultiple }: TemplateSlotsProps): JSX.Element {
  return (
    <div style={{ padding: '0.75rem 1rem' }}>
      {template.slots.map((slot) => {
        if (slot.multiple) {
          const entries = (values[slot.key] as PersonSlotValue[] | null) ?? [];
          return (
            <div key={slot.key}>
              {entries.map((entry, index) => (
                <PersonSlot
                  key={`${slot.key}-${index}`}
                  label={`${slot.label} ${index + 1}`}
                  value={entry}
                  defaultGender={slot.gender}
                  onChange={(val) => onChange(slot.key, val, index)}
                />
              ))}
              <PersonSlot
                key={`${slot.key}-new`}
                label={entries.length === 0 ? slot.label : `${slot.label} ${entries.length + 1}`}
                defaultGender={slot.gender}
                onChange={(val) => {
                  if (val) onAddMultiple(slot.key);
                  onChange(slot.key, val, entries.length);
                }}
              />
            </div>
          );
        }

        return (
          <PersonSlot
            key={slot.key}
            label={slot.label}
            value={values[slot.key] as PersonSlotValue | null}
            defaultGender={slot.gender}
            required={slot.required}
            onChange={(val) => onChange(slot.key, val)}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create CreateEventButton**

```typescript
// src/components/workspace/CreateEventButton.tsx
import type { TemplateDefinition } from '$/lib/templates';
import type { PersonSlotValue } from './PersonSlot';

interface CreateEventButtonProps {
  template: TemplateDefinition;
  slotValues: Record<string, PersonSlotValue | PersonSlotValue[] | null>;
  freeFormValues: PersonSlotValue[];
  isPending: boolean;
  onSubmit: () => void;
}

function countCreations(
  template: TemplateDefinition,
  slotValues: Record<string, PersonSlotValue | PersonSlotValue[] | null>,
  freeFormValues: PersonSlotValue[]
): { individuals: number; families: number; events: number; citations: number } {
  let individuals = 0;
  const filledSlotKeys: string[] = [];

  // Count from template slots
  for (const slot of template.slots) {
    const val = slotValues[slot.key];
    if (slot.multiple && Array.isArray(val)) {
      for (const v of val) {
        if (v.type === 'new') individuals++;
        filledSlotKeys.push(slot.key);
      }
    } else if (val && !Array.isArray(val)) {
      if (val.type === 'new') individuals++;
      filledSlotKeys.push(slot.key);
    }
  }

  // Count free-form
  individuals += freeFormValues.filter((v) => v.type === 'new').length;

  const events = template.eventTypeTag ? 1 : 0;
  const families = template.families.filter((rule) => {
    const childSlot = rule.members.find((m) => m.role === 'child')?.slot;
    const parentSlot = rule.members.find((m) => m.role !== 'child')?.slot;
    if (rule.type === 'couple') {
      return rule.members.every((m) => filledSlotKeys.includes(m.slot));
    }
    return childSlot && filledSlotKeys.includes(childSlot) && parentSlot && filledSlotKeys.includes(parentSlot);
  }).length;

  return { individuals, families, events, citations: 1 };
}

export function CreateEventButton({ template, slotValues, freeFormValues, isPending, onSubmit }: CreateEventButtonProps): JSX.Element {
  // Check if required slots are filled
  const hasRequired = template.slots
    .filter((s) => s.required)
    .every((s) => {
      const val = slotValues[s.key];
      return val && (!Array.isArray(val) || val.length > 0);
    });

  const isGenericEmpty = template.id === 'generic' && freeFormValues.length === 0;
  const disabled = isPending || (!hasRequired && template.slots.length > 0) || isGenericEmpty;

  const counts = countCreations(template, slotValues, freeFormValues);
  const label = template.eventTypeTag
    ? `Create ${template.label} Event`
    : 'Create Citation';

  const summaryParts: string[] = [];
  if (counts.events > 0) summaryParts.push(`${counts.events} event`);
  if (counts.individuals > 0) summaryParts.push(`${counts.individuals} individual${counts.individuals > 1 ? 's' : ''}`);
  if (counts.families > 0) summaryParts.push(`${counts.families} famil${counts.families > 1 ? 'ies' : 'y'}`);
  summaryParts.push('1 citation');

  return (
    <div style={{ margin: '0.75rem 1rem', padding: '0.75rem', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px' }}>
      <button
        onClick={onSubmit}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.6rem',
          background: disabled ? '#999' : '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {isPending ? 'Creating...' : label}
      </button>
      <div style={{ fontSize: '0.7rem', color: '#888', textAlign: 'center', marginTop: '0.4rem' }}>
        Will create: {summaryParts.join(', ')}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create FreeFormAdd**

```typescript
// src/components/workspace/FreeFormAdd.tsx
import { useState } from 'react';
import { PersonSlot, type PersonSlotValue } from './PersonSlot';

interface FreeFormAddProps {
  values: PersonSlotValue[];
  onChange: (values: PersonSlotValue[]) => void;
}

export function FreeFormAdd({ values, onChange }: FreeFormAddProps): JSX.Element {
  const [showNew, setShowNew] = useState(false);

  function handleAdd(val: PersonSlotValue | null) {
    if (val) {
      onChange([...values, val]);
    }
    setShowNew(false);
  }

  function handleRemove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div style={{ padding: '0 1rem 0.75rem' }}>
      {values.map((val, index) => (
        <PersonSlot
          key={`freeform-${index}`}
          label={`Person ${index + 1}`}
          value={val}
          onChange={(v) => { if (!v) handleRemove(index); }}
        />
      ))}
      {showNew ? (
        <PersonSlot
          label="New Person"
          onChange={handleAdd}
        />
      ) : (
        <div
          onClick={() => setShowNew(true)}
          style={{ textAlign: 'center', fontSize: '0.8rem', color: '#4a90d9', cursor: 'pointer', padding: '0.5rem' }}
        >
          + Add person
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/workspace/TemplateSlots.tsx src/components/workspace/CreateEventButton.tsx src/components/workspace/FreeFormAdd.tsx
git commit -m "feat(ui): add TemplateSlots, CreateEventButton, and FreeFormAdd components"
```

---

## Task 14: Right Panel Assembly + Full Integration

**Files:**
- Create: `src/components/workspace/RightPanel.tsx`
- Modify: `src/pages/SourceWorkspacePage.tsx` (wire up right panel)

**Context:** The RightPanel manages all workspace state (selected template, slot values, event details, free-form additions) and orchestrates the submission flow via SourceWorkspaceManager.

- [ ] **Step 1: Create RightPanel**

```typescript
// src/components/workspace/RightPanel.tsx
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EventTypeSelector } from './EventTypeSelector';
import { TemplateSlots } from './TemplateSlots';
import { EventDetails } from './EventDetails';
import { CreateEventButton } from './CreateEventButton';
import { FreeFormAdd } from './FreeFormAdd';
import { getTemplateById } from '$/lib/templates';
import { SourceWorkspaceManager } from '$/managers/SourceWorkspaceManager';
import { queryKeys } from '$/lib/query-keys';
import type { PersonSlotValue } from './PersonSlot';
import type { PlaceValue } from './PlaceAutocomplete';
import type { SlotValue } from '$/managers/SourceWorkspaceManager';

interface RightPanelProps {
  sourceId: string;
}

export function RightPanel({ sourceId }: RightPanelProps): JSX.Element {
  const queryClient = useQueryClient();
  const [templateId, setTemplateId] = useState('');
  const [slotValues, setSlotValues] = useState<Record<string, PersonSlotValue | PersonSlotValue[] | null>>({});
  const [date, setDate] = useState('');
  const [place, setPlace] = useState<PlaceValue | null>(null);
  const [freeFormValues, setFreeFormValues] = useState<PersonSlotValue[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const template = templateId ? getTemplateById(templateId) : null;

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async () => {
      if (!template) throw new Error('No template selected');

      // Build slot values for manager
      const slots: SlotValue[] = [];

      for (const slot of template.slots) {
        const val = slotValues[slot.key];
        if (slot.multiple && Array.isArray(val)) {
          for (const v of val) {
            slots.push(personSlotToSlotValue(slot.key, v));
          }
        } else if (val && !Array.isArray(val)) {
          slots.push(personSlotToSlotValue(slot.key, val));
        }
      }

      // Free-form
      for (let i = 0; i < freeFormValues.length; i++) {
        slots.push(personSlotToSlotValue(`freeform_${i}`, freeFormValues[i]));
      }

      return SourceWorkspaceManager.createFromTemplate({
        sourceId,
        templateId: template.id,
        slots,
        date: date || undefined,
        place: place?.type === 'new' ? place.name : undefined,
        existingPlaceId: place?.type === 'existing' ? place.id : undefined,
      });
    },
    onSuccess: (result) => {
      // Clear form
      setSlotValues({});
      setDate('');
      setPlace(null);
      setFreeFormValues([]);
      setSuccessMessage(
        `Created${result.eventId ? ' event' : ''}: ${result.createdIndividuals.length} individual(s), ${result.createdFamilies.length} family(ies), 1 citation`
      );
      setTimeout(() => setSuccessMessage(null), 4000);

      // Invalidate queries
      void queryClient.invalidateQueries({ queryKey: queryKeys.citationsWithDetails(sourceId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.citations(sourceId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
      void queryClient.invalidateQueries({ queryKey: queryKeys.families });
      void queryClient.invalidateQueries({ queryKey: queryKeys.events });
    },
  });

  function handleTemplateChange(newId: string) {
    const hasFilled = Object.values(slotValues).some((v) => v !== null && (!Array.isArray(v) || v.length > 0));
    if (hasFilled && !window.confirm('Changing the template will clear all filled slots. Continue?')) {
      return;
    }
    setTemplateId(newId);
    setSlotValues({});
  }

  const handleSlotChange = useCallback((slotKey: string, value: PersonSlotValue | null, index?: number) => {
    setSlotValues((prev) => {
      const slot = template?.slots.find((s) => s.key === slotKey);
      if (slot?.multiple) {
        const arr = (prev[slotKey] as PersonSlotValue[] | null) ?? [];
        const newArr = [...arr];
        if (value) {
          newArr[index ?? arr.length] = value;
        } else if (index !== undefined) {
          newArr.splice(index, 1);
        }
        return { ...prev, [slotKey]: newArr };
      }
      return { ...prev, [slotKey]: value };
    });
  }, [template]);

  const handleAddMultiple = useCallback((_slotKey: string) => {
    // No-op — adding is handled by handleSlotChange with index
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <EventTypeSelector value={templateId} onChange={handleTemplateChange} />

      {template && (
        <>
          <TemplateSlots
            template={template}
            values={slotValues}
            onChange={handleSlotChange}
            onAddMultiple={handleAddMultiple}
          />
          <EventDetails
            date={date}
            place={place}
            onDateChange={setDate}
            onPlaceChange={setPlace}
          />
          <FreeFormAdd values={freeFormValues} onChange={setFreeFormValues} />
          <CreateEventButton
            template={template}
            slotValues={slotValues}
            freeFormValues={freeFormValues}
            isPending={isPending}
            onSubmit={() => submit()}
          />
        </>
      )}

      {successMessage && (
        <div style={{ margin: '0 1rem', padding: '0.5rem', background: '#e8f5e9', borderRadius: '4px', fontSize: '0.8rem', color: '#2e7d32', textAlign: 'center' }}>
          {successMessage}
        </div>
      )}

      {!template && (
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
          Select a document type above to begin.
        </div>
      )}
    </div>
  );
}

function personSlotToSlotValue(slotKey: string, psv: PersonSlotValue): SlotValue {
  if (psv.type === 'existing') {
    return { slotKey, existingId: psv.id };
  }
  return { slotKey, newName: psv.newName, newGender: psv.newGender };
}
```

- [ ] **Step 2: Wire up RightPanel in SourceWorkspacePage**

Update `src/pages/SourceWorkspacePage.tsx`:

```typescript
import { RightPanel } from '$/components/workspace/RightPanel';

// Replace the right placeholder:
<WorkspaceLayout
  left={<LeftPanel treeId={treeId} sourceId={sourceId} />}
  right={<RightPanel sourceId={sourceId} />}
/>
```

- [ ] **Step 3: Verify full flow**

Run: `pnpm dev`
1. Navigate to a source → click Edit
2. Select "Marriage" template
3. Fill husband + wife slots (create new)
4. Enter a date
5. Click "Create Marriage Event"
6. Verify: success message, left panel refreshes with new citation

- [ ] **Step 4: Commit**

```bash
git add src/components/workspace/RightPanel.tsx src/pages/SourceWorkspacePage.tsx
git commit -m "feat(ui): add RightPanel with template interaction and full workspace integration"
```

---

## Task 15: Image Viewer + File Attachment

**Files:**
- Create: `src/components/workspace/ImageViewer.tsx`
- Modify: `src/components/workspace/LeftPanel.tsx` (add ImageViewer)

**Context:** The image viewer shows source file images with zoom/pan. File attachment via Tauri file dialog. This is the last major UI piece.

- [ ] **Step 1: Create ImageViewer**

```typescript
// src/components/workspace/ImageViewer.tsx
import React, { useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFilesBySource } from '$/hooks/useFiles';
import { convertFileSrc } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { copyFileToTree } from '$/lib/file-utils';
import { createFile, addFileToSource } from '$db-tree/files';
import { queryKeys } from '$/lib/query-keys';
import { getCurrentTreePath } from '$/db/connection';

interface ImageViewerProps {
  sourceId: string;
}

export function ImageViewer({ sourceId }: ImageViewerProps): JSX.Element {
  const { data: files, isLoading } = useFilesBySource(sourceId);
  const queryClient = useQueryClient();
  const treePath = getCurrentTreePath();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const { mutate: attachFiles, isPending: isAttaching } = useMutation({
    mutationFn: async () => {
      if (!treePath) throw new Error('No tree path');
      const selected = await open({
        multiple: true,
        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'tiff', 'tif', 'pdf'] }],
      });
      if (!selected) return;
      const paths = Array.isArray(selected) ? selected : [selected];
      for (const filePath of paths) {
        const { relativePath, filename } = await copyFileToTree(filePath, treePath);
        // Get basic file info — mime type from extension
        const ext = filename.split('.').pop()?.toLowerCase() ?? '';
        const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', tiff: 'image/tiff', tif: 'image/tiff', pdf: 'application/pdf' };
        const fileId = await createFile({
          originalFilename: filename,
          relativePath,
          mimeType: mimeMap[ext] ?? 'application/octet-stream',
          fileSize: 0, // TODO: get real file size in future
        });
        await addFileToSource({ sourceId, fileId });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.files(sourceId) });
    },
  });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.1, Math.min(5, z - e.deltaY * 0.001)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  }, []);

  const handleMouseUp = useCallback(() => { isDragging.current = false; }, []);

  const currentFile = files?.[currentIndex];

  // Empty state
  if (!isLoading && (!files || files.length === 0)) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: '2rem' }}>
        <p style={{ color: '#888', marginBottom: '1rem' }}>No files attached to this source.</p>
        <button
          onClick={() => attachFiles()}
          disabled={isAttaching}
          style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          {isAttaching ? 'Attaching...' : 'Attach Files'}
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Loading files...</div>;
  }

  const imageSrc = currentFile && treePath ? convertFileSrc(`${treePath}/${currentFile.relativePath}`) : '';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1a1a1a' }}>
      {/* Toolbar */}
      <div style={{ padding: '0.5rem', background: '#2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={() => setZoom((z) => Math.max(0.1, z - 0.25))} style={{ color: '#fff', background: '#444', border: 'none', borderRadius: '3px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>-</button>
          <span style={{ color: '#aaa', fontSize: '0.75rem' }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(5, z + 0.25))} style={{ color: '#fff', background: '#444', border: 'none', borderRadius: '3px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>+</button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} style={{ color: '#fff', background: '#444', border: 'none', borderRadius: '3px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>Fit</button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0} style={{ color: currentIndex === 0 ? '#666' : '#fff', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>&laquo;</button>
          <span style={{ color: '#fff', fontSize: '0.75rem' }}>{currentIndex + 1} / {files!.length}</span>
          <button onClick={() => setCurrentIndex((i) => Math.min(files!.length - 1, i + 1))} disabled={currentIndex === files!.length - 1} style={{ color: currentIndex === files!.length - 1 ? '#666' : '#fff', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>&raquo;</button>
        </div>
        <button
          onClick={() => attachFiles()}
          disabled={isAttaching}
          style={{ color: '#fff', background: '#444', border: 'none', borderRadius: '3px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}
        >
          + Add
        </button>
      </div>

      {/* Image */}
      <div
        style={{ flex: 1, overflow: 'hidden', cursor: isDragging.current ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageSrc}
          alt={currentFile?.originalFilename ?? ''}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            maxWidth: 'none',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire ImageViewer into LeftPanel**

Update `src/components/workspace/LeftPanel.tsx`:

```typescript
import { CitationsSummary } from './CitationsSummary';
import { ImageViewer } from './ImageViewer';

interface LeftPanelProps {
  treeId: string;
  sourceId: string;
}

export function LeftPanel({ treeId, sourceId }: LeftPanelProps): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CitationsSummary treeId={treeId} sourceId={sourceId} />
      <ImageViewer sourceId={sourceId} />
    </div>
  );
}
```

- [ ] **Step 3: Verify image viewer works**

Run: `pnpm tauri:dev`
Navigate to workspace for a source → attach an image → verify zoom/pan/navigation.

Note: `convertFileSrc` requires the real Tauri runtime, not just `pnpm dev`. Use `pnpm tauri:dev` for this test. Check that `src-tauri/capabilities/default.json` allows `asset:default` scope — may need to add the asset protocol permission.

- [ ] **Step 4: Commit**

```bash
git add src/components/workspace/ImageViewer.tsx src/components/workspace/LeftPanel.tsx
git commit -m "feat(ui): add image viewer with zoom/pan and file attachment to workspace"
```

---

## Task 16: Verify All Tests Pass + Lint

**Files:** none (verification only)

- [ ] **Step 1: Run full test suite**

Run: `pnpm vitest run`
Expected: all tests pass

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: no errors

- [ ] **Step 3: Run format check**

Run: `pnpm format:check`
If failures: `pnpm format` then commit.

- [ ] **Step 4: Run TypeScript check**

Run: `pnpm build`
Expected: no type errors

- [ ] **Step 5: Fix any issues and commit**

```bash
git add -A
git commit -m "fix: resolve lint and type errors from workspace implementation"
```

---

## Task 17: Update Phase 3 Checklist

**Files:**
- Modify: `docs/mvps/mvp-4-sources-media/README.md`

- [ ] **Step 1: Mark Phase 3 items as complete**

Update the Phase 3 checklist in the README, marking all implemented items as `[x]`.

- [ ] **Step 2: Commit**

```bash
git add docs/mvps/mvp-4-sources-media/README.md
git commit -m "docs(mvp4): mark Phase 3 deliverables as complete"
```
