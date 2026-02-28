import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { createIndividual } from './individuals';
import type { Name } from '$/types/database';
import {
  getNamesByIndividualId,
  getPrimaryName,
  getNameById,
  createName,
  updateName,
  deleteName,
  setPrimaryName,
  countNamesForIndividual,
  formatName,
  formatNameSimple,
} from './names';

const db = createTreeInMemoryDb();

vi.mock('../connection', () => ({
  getTreeDb: vi.fn(),
}));

import('../connection').then(({ getTreeDb }) => {
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
});

beforeEach(async () => {
  const { getTreeDb } = await import('../connection');
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
  db._raw.exec('DELETE FROM names');
  db._raw.exec('DELETE FROM individuals');
});

// ─── Helper ───────────────────────────────────────────────────────────────────

async function createTestIndividual(): Promise<string> {
  return createIndividual({ gender: 'M' });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('createName', () => {
  it('creates a name with default type', async () => {
    const individualId = await createTestIndividual();
    const nameId = await createName({
      individualId,
      givenNames: 'John',
      surname: 'Doe',
    });

    const name = await getNameById(nameId);
    expect(name).not.toBeNull();
    expect(name?.type).toBe('birth');
    expect(name?.givenNames).toBe('John');
    expect(name?.surname).toBe('Doe');
  });

  it('creates a primary name', async () => {
    const individualId = await createTestIndividual();
    await createName({
      individualId,
      givenNames: 'John',
      surname: 'Doe',
      isPrimary: true,
    });

    const primary = await getPrimaryName(individualId);
    expect(primary?.givenNames).toBe('John');
    expect(primary?.isPrimary).toBe(true);
  });

  it('creates a name with all fields', async () => {
    const individualId = await createTestIndividual();
    const nameId = await createName({
      individualId,
      type: 'married',
      prefix: 'Dr.',
      givenNames: 'Jane Marie',
      surname: 'Smith',
      suffix: 'Jr.',
      nickname: 'Janie',
      isPrimary: false,
    });

    const name = await getNameById(nameId);
    expect(name?.type).toBe('married');
    expect(name?.prefix).toBe('Dr.');
    expect(name?.givenNames).toBe('Jane Marie');
    expect(name?.surname).toBe('Smith');
    expect(name?.suffix).toBe('Jr.');
    expect(name?.nickname).toBe('Janie');
  });

  it('unsets other primary names when creating a new primary', async () => {
    const individualId = await createTestIndividual();

    await createName({
      individualId,
      givenNames: 'First',
      isPrimary: true,
    });

    await createName({
      individualId,
      givenNames: 'Second',
      isPrimary: true,
    });

    const names = await getNamesByIndividualId(individualId);
    const primaryNames = names.filter((n) => n.isPrimary);
    expect(primaryNames).toHaveLength(1);
    expect(primaryNames[0].givenNames).toBe('Second');
  });
});

describe('getNamesByIndividualId', () => {
  it('returns empty array when no names exist', async () => {
    const individualId = await createTestIndividual();
    const names = await getNamesByIndividualId(individualId);
    expect(names).toEqual([]);
  });

  it('returns all names for an individual', async () => {
    const individualId = await createTestIndividual();
    await createName({ individualId, givenNames: 'John', isPrimary: true });
    await createName({ individualId, givenNames: 'Johnny', type: 'aka' });

    const names = await getNamesByIndividualId(individualId);
    expect(names).toHaveLength(2);
  });

  it('returns primary name first', async () => {
    const individualId = await createTestIndividual();
    await createName({ individualId, givenNames: 'NonPrimary', isPrimary: false });
    await createName({ individualId, givenNames: 'Primary', isPrimary: true });

    const names = await getNamesByIndividualId(individualId);
    expect(names[0].givenNames).toBe('Primary');
  });
});

describe('getPrimaryName', () => {
  it('returns null when no names exist', async () => {
    const individualId = await createTestIndividual();
    const primary = await getPrimaryName(individualId);
    expect(primary).toBeNull();
  });

  it('returns the primary name', async () => {
    const individualId = await createTestIndividual();
    await createName({ individualId, givenNames: 'NonPrimary', isPrimary: false });
    await createName({ individualId, givenNames: 'Primary', isPrimary: true });

    const primary = await getPrimaryName(individualId);
    expect(primary?.givenNames).toBe('Primary');
  });

  it('falls back to first name when no primary is set', async () => {
    const individualId = await createTestIndividual();
    await createName({ individualId, givenNames: 'First', isPrimary: false });
    await createName({ individualId, givenNames: 'Second', isPrimary: false });

    const primary = await getPrimaryName(individualId);
    expect(primary?.givenNames).toBe('First');
  });
});

describe('updateName', () => {
  it('updates given names', async () => {
    const individualId = await createTestIndividual();
    const nameId = await createName({ individualId, givenNames: 'Old' });

    await updateName(nameId, { givenNames: 'New' });

    const name = await getNameById(nameId);
    expect(name?.givenNames).toBe('New');
  });

  it('updates multiple fields', async () => {
    const individualId = await createTestIndividual();
    const nameId = await createName({ individualId, givenNames: 'Old', surname: 'OldSurname' });

    await updateName(nameId, {
      givenNames: 'New',
      surname: 'NewSurname',
      prefix: 'Dr.',
    });

    const name = await getNameById(nameId);
    expect(name?.givenNames).toBe('New');
    expect(name?.surname).toBe('NewSurname');
    expect(name?.prefix).toBe('Dr.');
  });

  it('setting as primary unsets other primary names', async () => {
    const individualId = await createTestIndividual();
    const name1Id = await createName({ individualId, givenNames: 'First', isPrimary: true });
    const name2Id = await createName({ individualId, givenNames: 'Second', isPrimary: false });

    await updateName(name2Id, { isPrimary: true });

    const name1 = await getNameById(name1Id);
    const name2 = await getNameById(name2Id);
    expect(name1?.isPrimary).toBe(false);
    expect(name2?.isPrimary).toBe(true);
  });
});

describe('deleteName', () => {
  it('removes the name', async () => {
    const individualId = await createTestIndividual();
    const nameId = await createName({ individualId, givenNames: 'ToDelete' });

    await deleteName(nameId);

    const name = await getNameById(nameId);
    expect(name).toBeNull();
  });

  it('does not delete other names', async () => {
    const individualId = await createTestIndividual();
    const name1Id = await createName({ individualId, givenNames: 'Keep' });
    const name2Id = await createName({ individualId, givenNames: 'Delete' });

    await deleteName(name2Id);

    const name1 = await getNameById(name1Id);
    expect(name1).not.toBeNull();
  });
});

describe('setPrimaryName', () => {
  it('sets the specified name as primary', async () => {
    const individualId = await createTestIndividual();
    const name1Id = await createName({ individualId, givenNames: 'First', isPrimary: true });
    const name2Id = await createName({ individualId, givenNames: 'Second', isPrimary: false });

    await setPrimaryName(individualId, name2Id);

    const name1 = await getNameById(name1Id);
    const name2 = await getNameById(name2Id);
    expect(name1?.isPrimary).toBe(false);
    expect(name2?.isPrimary).toBe(true);
  });
});

describe('countNamesForIndividual', () => {
  it('returns 0 when no names exist', async () => {
    const individualId = await createTestIndividual();
    expect(await countNamesForIndividual(individualId)).toBe(0);
  });

  it('returns correct count', async () => {
    const individualId = await createTestIndividual();
    await createName({ individualId, givenNames: 'First' });
    await createName({ individualId, givenNames: 'Second' });
    await createName({ individualId, givenNames: 'Third' });

    expect(await countNamesForIndividual(individualId)).toBe(3);
  });
});

// ─── formatName Tests ─────────────────────────────────────────────────────────

describe('formatName', () => {
  it('returns (Unknown) for null name', () => {
    const result = formatName(null);
    expect(result.full).toBe('(Unknown)');
    expect(result.short).toBe('(Unknown)');
    expect(result.sortable).toBe('');
  });

  it('formats a complete name', () => {
    const name = createMockName({
      prefix: 'Dr.',
      givenNames: 'John Paul',
      surname: 'Dupont',
      suffix: 'Jr.',
    });

    const result = formatName(name);
    expect(result.full).toBe('Dr. John Paul Dupont Jr.');
    expect(result.short).toBe('John Dupont');
    expect(result.sortable).toBe('Dupont, John Paul');
  });

  it('formats name with only given names', () => {
    const name = createMockName({ givenNames: 'John' });
    const result = formatName(name);
    expect(result.full).toBe('John');
    expect(result.short).toBe('John');
    expect(result.sortable).toBe('John');
  });

  it('formats name with only surname', () => {
    const name = createMockName({ surname: 'Smith' });
    const result = formatName(name);
    expect(result.full).toBe('Smith');
    expect(result.short).toBe('Smith');
    expect(result.sortable).toBe('Smith');
  });

  it('formats name with given names and surname', () => {
    const name = createMockName({ givenNames: 'Jean Marie', surname: 'Martin' });
    const result = formatName(name);
    expect(result.full).toBe('Jean Marie Martin');
    expect(result.short).toBe('Jean Martin');
    expect(result.sortable).toBe('Martin, Jean Marie');
  });

  it('uses nickname as fallback when no other name parts', () => {
    const name = createMockName({ nickname: 'Johnny' });
    const result = formatName(name);
    expect(result.full).toBe('Johnny');
    expect(result.short).toBe('Johnny');
  });

  it('uses prefix in full but not short', () => {
    const name = createMockName({ prefix: 'Rev.', givenNames: 'Thomas', surname: 'Clark' });
    const result = formatName(name);
    expect(result.full).toBe('Rev. Thomas Clark');
    expect(result.short).toBe('Thomas Clark');
  });

  it('uses suffix in full but not short', () => {
    const name = createMockName({ givenNames: 'John', surname: 'Smith', suffix: 'III' });
    const result = formatName(name);
    expect(result.full).toBe('John Smith III');
    expect(result.short).toBe('John Smith');
  });
});

describe('formatNameSimple', () => {
  it('returns the short form', () => {
    const name = createMockName({ givenNames: 'John Paul', surname: 'Dupont' });
    expect(formatNameSimple(name)).toBe('John Dupont');
  });

  it('returns (Unknown) for null', () => {
    expect(formatNameSimple(null)).toBe('(Unknown)');
  });
});

// ─── Helper to create mock Name objects ───────────────────────────────────────

function createMockName(partial: {
  prefix?: string | null;
  givenNames?: string | null;
  surname?: string | null;
  suffix?: string | null;
  nickname?: string | null;
}): Name {
  return {
    id: '1',
    individualId: '1',
    type: 'birth',
    prefix: partial.prefix ?? null,
    givenNames: partial.givenNames ?? null,
    surname: partial.surname ?? null,
    suffix: partial.suffix ?? null,
    nickname: partial.nickname ?? null,
    isPrimary: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };
}
