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
      ['husband_father', 'husband_mother', 'wife_father', 'wife_mother'].includes(s.key),
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
