import { describe, expect, it } from 'vitest';

import type { EventType } from '$/types/database';

import { getEventTypeLabel } from './event-type-labels';

function makeEventType(overrides: Partial<EventType> = {}): EventType {
  return {
    id: 'ET-0001',
    tag: null,
    category: 'individual',
    isSystem: true,
    customName: null,
    sortOrder: 0,
    ...overrides,
  };
}

describe('getEventTypeLabel', () => {
  it('returns readable labels for system GEDCOM tags', () => {
    expect(getEventTypeLabel(makeEventType({ tag: 'BIRT' }))).toBe('Birth');
    expect(getEventTypeLabel(makeEventType({ tag: 'DEAT' }))).toBe('Death');
    expect(getEventTypeLabel(makeEventType({ tag: 'MARR', category: 'family' }))).toBe('Marriage');
    expect(getEventTypeLabel(makeEventType({ tag: 'CREM' }))).toBe('Cremation');
    expect(getEventTypeLabel(makeEventType({ tag: 'ANUL', category: 'family' }))).toBe('Annulment');
  });

  it('returns customName when set', () => {
    const eventType = makeEventType({
      tag: 'BIRT',
      isSystem: false,
      customName: 'Naming Ceremony',
    });
    expect(getEventTypeLabel(eventType)).toBe('Naming Ceremony');
  });

  it('returns customName even when tag is null', () => {
    const eventType = makeEventType({
      tag: null,
      isSystem: false,
      customName: 'DNA Test',
    });
    expect(getEventTypeLabel(eventType)).toBe('DNA Test');
  });

  it('falls back to raw tag for unknown tags', () => {
    const eventType = makeEventType({ tag: 'XTAG' });
    expect(getEventTypeLabel(eventType)).toBe('XTAG');
  });

  it('returns Unknown when both tag and customName are null', () => {
    const eventType = makeEventType({ tag: null, customName: null });
    expect(getEventTypeLabel(eventType)).toBe('Unknown');
  });
});
