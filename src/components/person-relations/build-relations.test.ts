import { describe, it, expect, vi } from 'vitest';

// `build-relations` reuses `formatName`, which transitively imports the
// Tauri-backed DB connection. Stub it so the pure mapper can be tested
// without a real database.
vi.mock('$db/connection', () => ({ getTreeDb: vi.fn() }));

import type { Gender, Name } from '$types/database';
import type {
  HalfSiblingUnion,
  PersonRelationsData,
  RelatedPersonWithGender,
  SpouseUnion,
} from '$db-tree/person-relations';
import { buildPersonRelations } from './build-relations';

function makeName(givenNames: string, surname: string): Name {
  return {
    id: `${givenNames}-${surname}`,
    individualId: `I-${givenNames}`,
    type: 'birth',
    prefix: null,
    givenNames,
    surname,
    suffix: null,
    nickname: null,
    isPrimary: true,
    createdAt: '',
    updatedAt: '',
  };
}

function makeRelated(
  id: string,
  givenNames: string,
  surname: string,
  gender: Gender,
  overrides: Partial<RelatedPersonWithGender> = {}
): RelatedPersonWithGender {
  return {
    id,
    primaryName: makeName(givenNames, surname),
    birthYear: null,
    deathYear: null,
    gender,
    ...overrides,
  };
}

function makeData(overrides: Partial<PersonRelationsData> = {}): PersonRelationsData {
  return {
    father: null,
    mother: null,
    fullSiblings: [],
    halfSiblingUnions: [],
    spouseUnions: [],
    ...overrides,
  };
}

/** Every row after the two fixed, always-present Father/Mother slots. */
function afterParents(rows: ReturnType<typeof buildPersonRelations>) {
  return rows.slice(2);
}

describe('buildPersonRelations', () => {
  it('always shows the two fixed Father/Mother slots, unlinkable when not recorded', () => {
    const rows = buildPersonRelations(makeData());

    expect(rows).toEqual([
      expect.objectContaining({ id: null, relation: 'father' }),
      expect.objectContaining({ id: null, relation: 'mother' }),
    ]);
  });

  it('lists father then mother ahead of every other relation', () => {
    const father = makeRelated('I-1', 'Robert', 'Hayes', 'M');
    const mother = makeRelated('I-2', 'Susan', 'Doyle', 'F');
    const rows = buildPersonRelations(makeData({ father, mother }));

    expect(rows.map((row) => row.relation)).toEqual(['father', 'mother']);
    expect(rows.every((row) => typeof row.id === 'string')).toBe(true);
  });

  it('resolves full siblings to a sex-specific relation, falling back when sex is unrecorded', () => {
    const brother = makeRelated('I-3', 'David', 'Hayes', 'M');
    const sister = makeRelated('I-4', 'Helen', 'Hayes', 'F');
    const unknown = makeRelated('I-5', 'Alex', 'Hayes', 'U');
    const rows = afterParents(
      buildPersonRelations(makeData({ fullSiblings: [brother, sister, unknown] }))
    );

    expect(rows.map((row) => row.relation)).toEqual(['brother', 'sister', 'sibling']);
    expect(rows.every((row) => row.side === undefined)).toBe(true);
  });

  it('tags half-siblings with their side and the other parent as `via`, ignoring pedigree entirely', () => {
    const otherParent = makeRelated('I-6', 'Eleanor', 'Finch', 'F');
    const halfBrother = makeRelated('I-7', 'James', 'Hayes', 'M');
    const union: HalfSiblingUnion = {
      side: 'paternal',
      otherParent,
      children: [halfBrother],
    };
    const rows = afterParents(buildPersonRelations(makeData({ halfSiblingUnions: [union] })));

    expect(rows).toEqual([
      expect.objectContaining({
        id: 'I-7',
        relation: 'halfBrother',
        side: 'paternal',
        viaName: 'Eleanor Finch',
      }),
    ]);
  });

  it('lists paternal half-sibling unions before maternal ones', () => {
    const paternal: HalfSiblingUnion = {
      side: 'paternal',
      otherParent: makeRelated('I-8', 'Eleanor', 'Finch', 'F'),
      children: [makeRelated('I-9', 'James', 'Hayes', 'M')],
    };
    const maternal: HalfSiblingUnion = {
      side: 'maternal',
      otherParent: makeRelated('I-10', 'William', 'Cole', 'M'),
      children: [makeRelated('I-11', 'Anne', 'Cole', 'F')],
    };
    const rows = afterParents(
      buildPersonRelations(makeData({ halfSiblingUnions: [paternal, maternal] }))
    );

    expect(rows.map((row) => row.side)).toEqual(['paternal', 'maternal']);
  });

  it('omits `via` for a half-sibling union whose other parent is not recorded', () => {
    const union: HalfSiblingUnion = {
      side: 'maternal',
      otherParent: null,
      children: [makeRelated('I-12', 'Peter', 'Cole', 'M')],
    };
    const rows = afterParents(buildPersonRelations(makeData({ halfSiblingUnions: [union] })));

    expect(rows[0].viaName).toBeUndefined();
    expect(rows[0].side).toBe('maternal');
  });

  it('resolves a spouse to husband/wife by sex, with no `via` on children when there is a single union', () => {
    const spouse = makeRelated('I-13', 'Linda', 'Marsh', 'F');
    const child = makeRelated('I-14', 'Oliver', 'Hayes', 'M');
    const union: SpouseUnion = { spouse, marriageYear: 1988, children: [child] };
    const rows = afterParents(buildPersonRelations(makeData({ spouseUnions: [union] })));

    expect(rows).toEqual([
      expect.objectContaining({ id: 'I-13', relation: 'wife' }),
      expect.objectContaining({ id: 'I-14', relation: 'son' }),
    ]);
    expect(rows.every((row) => row.viaName === undefined)).toBe(true);
  });

  it('orders multiple spouse unions chronologically and tags each child with their parent spouse', () => {
    const firstWife = makeRelated('I-15', 'Linda', 'Marsh', 'F');
    const secondWife = makeRelated('I-16', 'Carol', 'Reyes', 'F');
    const firstUnion: SpouseUnion = {
      spouse: firstWife,
      marriageYear: 2001,
      children: [makeRelated('I-17', 'Ethan', 'Hayes', 'M')],
    };
    const secondUnion: SpouseUnion = {
      spouse: secondWife,
      marriageYear: 1988,
      children: [makeRelated('I-18', 'Grace', 'Hayes', 'F')],
    };
    // Passed out of chronological order to prove the sort, not the input order.
    const rows = afterParents(
      buildPersonRelations(makeData({ spouseUnions: [firstUnion, secondUnion] }))
    );

    expect(rows.map((row) => row.id)).toEqual(['I-16', 'I-15', 'I-18', 'I-17']);
    expect(rows.find((row) => row.id === 'I-18')?.viaName).toBe('Carol Reyes');
    expect(rows.find((row) => row.id === 'I-17')?.viaName).toBe('Linda Marsh');
  });
});
