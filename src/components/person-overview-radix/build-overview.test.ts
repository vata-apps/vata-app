import { describe, it, expect, vi } from 'vitest';

// `build-overview` reuses `formatName` (and the person-overview types), which
// transitively import the Tauri-backed DB connection. Stub it so the pure
// mapper can be tested without a real database.
vi.mock('$db/connection', () => ({ getTreeDb: vi.fn() }));

import type { EventTimelineEntry, Gender, Individual, Name, Place } from '$types/database';
import type { PersonOverviewData, RelatedPerson } from '$db-tree/person-overview';
import { buildPersonOverview } from './build-overview';

function makeIndividual(gender: Gender): Individual {
  return {
    id: 'I-0001',
    gender,
    isLiving: false,
    notes: null,
    createdAt: '',
    updatedAt: '',
  };
}

function makeName(overrides: Partial<Name> = {}): Name {
  return {
    id: '1',
    individualId: 'I-0001',
    type: 'birth',
    prefix: null,
    givenNames: 'Marie',
    surname: 'Garneau',
    suffix: null,
    nickname: null,
    isPrimary: true,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function makePlace(name: string): Place {
  return {
    id: `P-${name}`,
    name,
    fullName: name,
    placeTypeId: null,
    parentId: null,
    latitude: null,
    longitude: null,
    notes: null,
    createdAt: '',
    updatedAt: '',
  };
}

function makeEvent(
  tag: string,
  dateOriginal: string,
  dateSort: string,
  placeName: string | null,
  hasCitations = false
): EventTimelineEntry {
  return {
    id: `E-${tag}`,
    eventTypeId: tag,
    dateOriginal,
    dateSort,
    placeId: placeName ? `P-${placeName}` : null,
    description: null,
    notes: null,
    createdAt: '',
    updatedAt: '',
    eventType: {
      id: tag,
      tag,
      category: tag === 'MARR' ? 'family' : 'individual',
      isSystem: true,
      customName: null,
      sortOrder: 0,
    },
    place: placeName ? makePlace(placeName) : null,
    participants: [],
    thumbnails: [],
    hasCitations,
  };
}

function makeRelated(id: string, given: string, surname: string, born?: number): RelatedPerson {
  return {
    id,
    primaryName: makeName({ id, individualId: id, givenNames: given, surname }),
    birthYear: born ?? null,
    deathYear: null,
  };
}

function baseData(): PersonOverviewData {
  return {
    individual: makeIndividual('F'),
    names: [makeName()],
    primaryName: makeName(),
    birthEvent: null,
    deathEvent: null,
    events: [],
    father: null,
    mother: null,
    marriages: [],
  };
}

describe('buildPersonOverview', () => {
  it('maps identity from the primary name, gender, and birth/death events', () => {
    const { person } = buildPersonOverview({
      ...baseData(),
      birthEvent: makeEvent('BIRT', '14 Aug 1890', '1890-08-14', 'Longueuil'),
      deathEvent: makeEvent('DEAT', 'before 1955', '1955-01-01', 'Montréal'),
    });

    expect(person.name).toBe('Marie Garneau');
    expect(person.initials).toBe('MG');
    expect(person.sex).toBe('♀');
    expect(person.birthDate).toBe('14 Aug 1890');
    expect(person.birthPlace).toBe('Longueuil');
    expect(person.deathDate).toBe('before 1955');
    expect(person.deathPlace).toBe('Montréal');
    expect(person.birthYear).toBe(1890);
    expect(person.deathYear).toBe(1955);
    expect(person.age).toBe(65);
  });

  it('maps the gender glyph for male and unknown', () => {
    expect(buildPersonOverview({ ...baseData(), individual: makeIndividual('M') }).person.sex).toBe(
      '♂'
    );
    expect(buildPersonOverview({ ...baseData(), individual: makeIndividual('U') }).person.sex).toBe(
      ''
    );
  });

  it('maps every recorded name with its type and primary flag', () => {
    const { names } = buildPersonOverview({
      ...baseData(),
      names: [
        makeName(),
        makeName({
          id: '2',
          type: 'married',
          givenNames: 'Marie',
          surname: 'Tremblay',
          isPrimary: false,
        }),
      ],
    });

    expect(names).toEqual([
      { id: '1', type: 'birth', text: 'Marie Garneau', isPrimary: true },
      { id: '2', type: 'married', text: 'Marie Tremblay', isPrimary: false },
    ]);
  });

  it('maps present parents and leaves absent ones undefined', () => {
    const { parents } = buildPersonOverview({
      ...baseData(),
      father: makeRelated('I-0002', 'Henri', 'Garneau', 1855),
      mother: null,
    });

    expect(parents.father).toEqual({
      id: 'I-0002',
      initials: 'HG',
      name: 'Henri Garneau',
      bornYear: 1855,
      deathYear: undefined,
    });
    expect(parents.mother).toBeUndefined();
  });

  it('orders milestones born → marriages (by year) → death, with spouse and children', () => {
    const { milestones } = buildPersonOverview({
      ...baseData(),
      birthEvent: makeEvent('BIRT', '1890', '1890', 'Longueuil'),
      deathEvent: makeEvent('DEAT', '1955', '1955', 'Montréal'),
      marriages: [
        {
          familyId: 'F-0002',
          spouse: makeRelated('I-0003', 'Robert', 'Fortier'),
          marriageEvent: makeEvent('MARR', '1931', '1931', 'Saint-Lambert'),
          children: [makeRelated('I-0004', 'Anna', 'Fortier', 1932)],
        },
        {
          familyId: 'F-0001',
          spouse: makeRelated('I-0005', 'Édouard', 'Tremblay'),
          marriageEvent: makeEvent('MARR', '1922', '1922', 'Saint-Lambert'),
          children: [],
        },
      ],
    });

    expect(milestones.map((m) => m.kind)).toEqual(['born', 'marriage', 'marriage', 'death']);
    // Marriages sorted ascending by year: 1922 before 1931.
    expect(milestones[1].date).toBe('1922');
    expect(milestones[2].date).toBe('1931');
    expect(milestones[1].spouse?.name).toBe('Édouard Tremblay');
    expect(milestones[2].children?.[0]).toMatchObject({ name: 'Anna Fortier', bornYear: 1932 });
  });

  it('omits the born/death milestones when those events are missing', () => {
    const { milestones } = buildPersonOverview(baseData());
    expect(milestones).toEqual([]);
  });

  it('returns empty media — files are not individual-scoped yet', () => {
    expect(buildPersonOverview(baseData()).media).toEqual([]);
  });

  it('collects distinct places from events and marriages, deduping contexts per place', () => {
    const { placesLived } = buildPersonOverview({
      ...baseData(),
      events: [
        makeEvent('BIRT', '1890', '1890', 'Longueuil'),
        makeEvent('RESI', '1920', '1920', 'Longueuil'),
        makeEvent('DEAT', '1955', '1955', 'Montréal'),
      ],
      marriages: [
        {
          familyId: 'F-0001',
          spouse: null,
          marriageEvent: makeEvent('MARR', '1910', '1910', 'Saint-Lambert'),
          children: [],
        },
      ],
    });

    expect(placesLived.map((place) => place.name).sort()).toEqual([
      'Longueuil',
      'Montréal',
      'Saint-Lambert',
    ]);
    const longueuil = placesLived.find((place) => place.name === 'Longueuil')!;
    expect(longueuil.contexts.map((context) => context.tag)).toEqual(['BIRT', 'RESI']);
  });

  it('returns no places when there are no placed events', () => {
    expect(buildPersonOverview(baseData()).placesLived).toEqual([]);
  });

  it('derives vitals for birth, baptism, death and burial with their sourcing', () => {
    const { vitals } = buildPersonOverview({
      ...baseData(),
      events: [
        makeEvent('BIRT', '1890', '1890', 'Longueuil', true),
        makeEvent('BAPM', '1890', '1890', 'Longueuil', false),
        makeEvent('DEAT', '1955', '1955', 'Montréal', false),
        makeEvent('BURI', '1955', '1955', 'Montréal', true),
      ],
    });

    expect(vitals.map((vital) => vital.kind)).toEqual(['born', 'baptism', 'died', 'buried']);
    expect(vitals.find((vital) => vital.kind === 'born')).toMatchObject({
      date: '1890',
      placeName: 'Longueuil',
      sourced: true,
    });
    expect(vitals.find((vital) => vital.kind === 'died')?.sourced).toBe(false);
    expect(vitals.find((vital) => vital.kind === 'buried')?.sourced).toBe(true);
  });

  it('omits vitals for events that are not recorded', () => {
    expect(buildPersonOverview(baseData()).vitals).toEqual([]);
  });
});
