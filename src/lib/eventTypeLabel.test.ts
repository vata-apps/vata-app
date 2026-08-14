import { describe, it, expect } from 'vitest';
import { eventTypeLabel } from './eventTypeLabel';
import { SYSTEM_EVENT_TYPES } from '$/db/connection';
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
  'types.IMMI': 'Immigration',
  'types.DEAT': 'Death',
  'types.BURI': 'Burial',
  'types.CREM': 'Cremation',
  'types.ADOP': 'Adoption',
  'types.BARM': 'Bar Mitzvah',
  'types.BASM': 'Bas Mitzvah',
  'types.FCOM': 'First Communion',
  'types.ORDN': 'Ordination',
  'types.NATU': 'Naturalization',
  'types.PROB': 'Probate',
  'types.WILL': 'Will',
  'types.GRAD': 'Graduation',
  'types.RETI': 'Retirement',
  'types.RESI': 'Residence',
  'types.OCCU': 'Occupation',
  'types.EDUC': 'Education',
  'types.RELI': 'Religion',
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

  it('returns the translated label for every individual event tag', () => {
    expect(eventTypeLabel(makeSystemType('IMMI'), t)).toBe('Immigration');
    expect(eventTypeLabel(makeSystemType('CREM'), t)).toBe('Cremation');
    expect(eventTypeLabel(makeSystemType('ADOP'), t)).toBe('Adoption');
    expect(eventTypeLabel(makeSystemType('BARM'), t)).toBe('Bar Mitzvah');
    expect(eventTypeLabel(makeSystemType('BASM'), t)).toBe('Bas Mitzvah');
    expect(eventTypeLabel(makeSystemType('FCOM'), t)).toBe('First Communion');
    expect(eventTypeLabel(makeSystemType('ORDN'), t)).toBe('Ordination');
    expect(eventTypeLabel(makeSystemType('NATU'), t)).toBe('Naturalization');
    expect(eventTypeLabel(makeSystemType('PROB'), t)).toBe('Probate');
    expect(eventTypeLabel(makeSystemType('WILL'), t)).toBe('Will');
    expect(eventTypeLabel(makeSystemType('GRAD'), t)).toBe('Graduation');
    expect(eventTypeLabel(makeSystemType('RETI'), t)).toBe('Retirement');
    expect(eventTypeLabel(makeSystemType('RESI'), t)).toBe('Residence');
    expect(eventTypeLabel(makeSystemType('OCCU'), t)).toBe('Occupation');
    expect(eventTypeLabel(makeSystemType('EDUC'), t)).toBe('Education');
    expect(eventTypeLabel(makeSystemType('RELI'), t)).toBe('Religion');
  });

  it('BAPM and CHR both return the Baptism label', () => {
    expect(eventTypeLabel(makeSystemType('BAPM'), t)).toBe('Baptism');
    expect(eventTypeLabel(makeSystemType('CHR'), t)).toBe('Baptism');
  });

  it('falls back to the tag itself for a system tag without a translation key', () => {
    // A genuinely unrecognized tag — every tag this app actually seeds has a
    // translation key, guarded by the test below.
    expect(eventTypeLabel(makeSystemType('ZZZZ'), t)).toBe('ZZZZ');
  });

  it('has a translation key for every tag SYSTEM_EVENT_TYPES seeds into a new tree', () => {
    for (const [tag] of SYSTEM_EVENT_TYPES) {
      const label = eventTypeLabel(makeSystemType(tag), t);
      expect(
        label,
        `"${tag}" falls back to its raw GEDCOM code — add it to KNOWN_TAG_KEYS`
      ).not.toBe(tag);
    }
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
