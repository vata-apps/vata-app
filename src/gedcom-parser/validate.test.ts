import { describe, it, expect } from 'vitest';
import { validate, isGedcom } from './validate';

describe('validate', () => {
  it('validates correct GEDCOM', () => {
    const content = `0 HEAD
1 SOUR Test
0 @I1@ INDI
1 NAME John /DOE/
0 @F1@ FAM
1 HUSB @I1@
0 TRLR`;

    const result = validate(content);

    expect(result.valid).toBe(true);
    expect(result.stats.individuals).toBe(1);
    expect(result.stats.families).toBe(1);
  });

  it('warns about missing HEAD', () => {
    const content = `0 @I1@ INDI
1 NAME John
0 TRLR`;

    const result = validate(content);

    expect(result.valid).toBe(true); // Warnings don't make it invalid
    expect(result.errors.some((e) => e.message.includes('HEAD'))).toBe(true);
  });

  it('warns about missing TRLR', () => {
    const content = `0 HEAD
0 @I1@ INDI
1 NAME John`;

    const result = validate(content);

    expect(result.valid).toBe(true);
    expect(result.errors.some((e) => e.message.includes('TRLR'))).toBe(true);
  });

  it('errors on INDI without XREF', () => {
    const content = `0 HEAD
0 INDI
1 NAME John
0 TRLR`;

    const result = validate(content);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.severity === 'error' && e.message.includes('XREF'))).toBe(
      true
    );
  });

  it('errors on duplicate XREF', () => {
    const content = `0 HEAD
0 @I1@ INDI
1 NAME John
0 @I1@ INDI
1 NAME Jane
0 TRLR`;

    const result = validate(content);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('Duplicate'))).toBe(true);
  });

  it('errors on invalid level jump', () => {
    const content = `0 HEAD
1 SOUR Test
3 VERS 1.0
0 TRLR`;

    const result = validate(content);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('level jump'))).toBe(true);
  });

  it('warns about undefined references', () => {
    const content = `0 HEAD
0 @F1@ FAM
1 HUSB @I999@
0 TRLR`;

    const result = validate(content);

    expect(result.valid).toBe(true); // Warnings don't make it invalid
    expect(result.errors.some((e) => e.message.includes('I999'))).toBe(true);
  });

  it('counts entities correctly', () => {
    const content = `0 HEAD
0 @I1@ INDI
0 @I2@ INDI
0 @I3@ INDI
0 @F1@ FAM
0 @F2@ FAM
0 TRLR`;

    const result = validate(content);

    expect(result.stats.individuals).toBe(3);
    expect(result.stats.families).toBe(2);
  });

  it('errors on empty content', () => {
    const result = validate('');

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('Empty'))).toBe(true);
  });
});

describe('isGedcom', () => {
  it('detects GEDCOM by HEAD', () => {
    expect(isGedcom('0 HEAD\n1 SOUR Test')).toBe(true);
  });

  it('detects GEDCOM by INDI record', () => {
    expect(isGedcom('0 @I1@ INDI\n1 NAME Test')).toBe(true);
  });

  it('detects GEDCOM by FAM record', () => {
    expect(isGedcom('0 @F1@ FAM\n1 HUSB @I1@')).toBe(true);
  });

  it('returns false for non-GEDCOM content', () => {
    expect(isGedcom('Hello World')).toBe(false);
    expect(isGedcom('<xml>data</xml>')).toBe(false);
    expect(isGedcom('')).toBe(false);
  });
});
