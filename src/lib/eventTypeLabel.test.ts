import { describe, it, expect } from 'vitest';
import { eventTypeLabel } from './eventTypeLabel';
import type { EventType } from '$types/database';

function makeSystemType(tag: string, id = '1'): EventType {
  return { id, tag, category: 'individual', isSystem: true, customName: null, sortOrder: 0 };
}

function makeCustomType(customName: string, id = '99'): EventType {
  return { id, tag: null, category: 'individual', isSystem: false, customName, sortOrder: 0 };
}

const TRANSLATIONS: Record<string, string> = {
  'types.BIRT': 'Birth',
  'types.BAPM': 'Baptism',
  'types.CONF': 'Confirmation',
  'types.MARR': 'Marriage',
  'types.DIV': 'Divorce',
  'types.CENS': 'Census',
  'types.EMIG': 'Emigration',
  'types.DEAT': 'Death',
  'types.BURI': 'Burial',
};

function t(key: string): string {
  return TRANSLATIONS[key] ?? key;
}

describe('eventTypeLabel', () => {
  it('returns the translated label for a known system tag', () => {
    expect(eventTypeLabel(makeSystemType('BIRT'), t)).toBe('Birth');
    expect(eventTypeLabel(makeSystemType('DEAT'), t)).toBe('Death');
    expect(eventTypeLabel(makeSystemType('MARR'), t)).toBe('Marriage');
    expect(eventTypeLabel(makeSystemType('EMIG'), t)).toBe('Emigration');
    expect(eventTypeLabel(makeSystemType('BURI'), t)).toBe('Burial');
    expect(eventTypeLabel(makeSystemType('CENS'), t)).toBe('Census');
    expect(eventTypeLabel(makeSystemType('DIV'), t)).toBe('Divorce');
    expect(eventTypeLabel(makeSystemType('CONF'), t)).toBe('Confirmation');
  });

  it('BAPM and CHR both return the Baptism label', () => {
    expect(eventTypeLabel(makeSystemType('BAPM'), t)).toBe('Baptism');
    expect(eventTypeLabel(makeSystemType('CHR'), t)).toBe('Baptism');
  });

  it('falls back to the tag itself for a system tag without a translation key', () => {
    expect(eventTypeLabel(makeSystemType('CREM'), t)).toBe('CREM');
    expect(eventTypeLabel(makeSystemType('ADOP'), t)).toBe('ADOP');
  });

  it('returns customName verbatim for a custom (non-system) type', () => {
    expect(eventTypeLabel(makeCustomType('My Custom Event'), t)).toBe('My Custom Event');
    expect(eventTypeLabel(makeCustomType('Voyage en Amérique'), t)).toBe('Voyage en Amérique');
  });

  it('ignores any tag on a custom type and returns customName', () => {
    const customWithTag: EventType = {
      id: '5',
      tag: null,
      category: 'individual',
      isSystem: false,
      customName: 'Custom Label',
      sortOrder: 0,
    };
    expect(eventTypeLabel(customWithTag, t)).toBe('Custom Label');
  });
});
