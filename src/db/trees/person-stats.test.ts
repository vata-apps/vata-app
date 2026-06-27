import { describe, it, expect, vi } from 'vitest';

// `computeRelationStats` is pure, but the module imports sibling DB files that
// pull in the Tauri-backed connection. Stub it so the test needs no database.
vi.mock('../connection', () => ({ getTreeDb: vi.fn() }));

import type { FamilyMember, FamilyRole } from '$types/database';
import { computeRelationStats } from './person-stats';

let nextId = 1;
function fm(familyId: string, individualId: string, role: FamilyRole): FamilyMember {
  return {
    id: String(nextId++),
    familyId,
    individualId,
    role,
    pedigree: null,
    sortOrder: 0,
    createdAt: '',
  };
}

// A four-generation line around I-SELF:
//   F1: GF + GM            -> DAD
//   F2: DAD + MOM          -> SELF, SIB
//   F3: SELF + SPOUSE      -> KID
//   F4: KID + KIDSPOUSE    -> GRANDKID
const members: FamilyMember[] = [
  fm('F1', 'I-GF', 'husband'),
  fm('F1', 'I-GM', 'wife'),
  fm('F1', 'I-DAD', 'child'),
  fm('F2', 'I-DAD', 'husband'),
  fm('F2', 'I-MOM', 'wife'),
  fm('F2', 'I-SELF', 'child'),
  fm('F2', 'I-SIB', 'child'),
  fm('F3', 'I-SELF', 'husband'),
  fm('F3', 'I-SPOUSE', 'wife'),
  fm('F3', 'I-KID', 'child'),
  fm('F4', 'I-KID', 'husband'),
  fm('F4', 'I-KIDSPOUSE', 'wife'),
  fm('F4', 'I-GRANDKID', 'child'),
];

describe('computeRelationStats', () => {
  it('counts distinct parents, siblings, spouses, and children as relations', () => {
    // DAD, MOM, SIB, SPOUSE, KID — the focal person is excluded.
    expect(computeRelationStats('I-SELF', members).relations).toBe(5);
  });

  it('measures ancestral and descendant depth', () => {
    const stats = computeRelationStats('I-SELF', members);
    expect(stats.generationsUp).toBe(2); // parents → grandparents
    expect(stats.generationsDown).toBe(2); // children → grandchildren
  });

  it('returns zeros for a person with no family ties', () => {
    expect(computeRelationStats('I-LONE', members)).toEqual({
      relations: 0,
      generationsUp: 0,
      generationsDown: 0,
    });
  });

  it('is cycle-safe and does not loop forever on a malformed graph', () => {
    // A self-referential family (a person as both spouse and child) must not hang.
    const cyclic: FamilyMember[] = [fm('FX', 'I-A', 'husband'), fm('FX', 'I-A', 'child')];
    const stats = computeRelationStats('I-A', cyclic);
    expect(stats.generationsUp).toBe(0);
    expect(stats.generationsDown).toBe(0);
  });
});
