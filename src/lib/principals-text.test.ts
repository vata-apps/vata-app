import { describe, it, expect } from 'vitest';
import { nameText, principalsText } from './principals-text';
import type { EventPrincipal, Name } from '$types/database';

const UNKNOWN = 'Unknown';

function makeName(givenNames: string, surname: string): Name {
  return {
    id: '1',
    individualId: '1',
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

describe('nameText', () => {
  it('returns the formatted full name', () => {
    expect(nameText(makeName('Ron', 'Weasley'), UNKNOWN)).toBe('Ron Weasley');
  });

  it('falls back to the unknown label when the name is null', () => {
    expect(nameText(null, UNKNOWN)).toBe(UNKNOWN);
  });
});

describe('principalsText', () => {
  it('returns the unknown label when there are no principals', () => {
    expect(principalsText([], UNKNOWN)).toBe(UNKNOWN);
  });

  it('formats a single individual principal by name', () => {
    const principals: EventPrincipal[] = [{ kind: 'individual', name: makeName('Lily', 'Potter') }];
    expect(principalsText(principals, UNKNOWN)).toBe('Lily Potter');
  });

  it('joins a family principal as husband & wife', () => {
    const principals: EventPrincipal[] = [
      {
        kind: 'family',
        husband: makeName('Ron', 'Weasley'),
        wife: makeName('Hermione', 'Granger'),
      },
    ];
    expect(principalsText(principals, UNKNOWN)).toBe('Ron Weasley & Hermione Granger');
  });

  it('falls back to the unknown label for a missing spouse name', () => {
    const principals: EventPrincipal[] = [
      { kind: 'family', husband: makeName('Ron', 'Weasley'), wife: null },
    ];
    expect(principalsText(principals, UNKNOWN)).toBe('Ron Weasley & Unknown');
  });

  it('comma-joins multiple principals', () => {
    const principals: EventPrincipal[] = [
      { kind: 'individual', name: makeName('Lily', 'Potter') },
      { kind: 'individual', name: makeName('James', 'Potter') },
    ];
    expect(principalsText(principals, UNKNOWN)).toBe('Lily Potter, James Potter');
  });
});
