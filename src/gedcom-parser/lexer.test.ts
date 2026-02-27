import { describe, it, expect } from 'vitest';
import { tokenize, processContinuations, getChildLines, getChildValue, extractXref } from './lexer';

describe('tokenize', () => {
  it('parses simple GEDCOM lines', () => {
    const content = `0 HEAD
1 SOUR MyApp
0 @I1@ INDI
1 NAME John /DOE/
0 TRLR`;

    const lines = tokenize(content);

    expect(lines).toHaveLength(5);
    expect(lines[0]).toEqual({
      level: 0,
      tag: 'HEAD',
      xref: undefined,
      value: undefined,
      lineNumber: 1,
    });
    expect(lines[2]).toEqual({
      level: 0,
      tag: 'INDI',
      xref: 'I1',
      value: undefined,
      lineNumber: 3,
    });
    expect(lines[3]).toEqual({
      level: 1,
      tag: 'NAME',
      xref: undefined,
      value: 'John /DOE/',
      lineNumber: 4,
    });
  });

  it('handles Windows line endings', () => {
    const content = '0 HEAD\r\n1 SOUR Test\r\n0 TRLR';
    const lines = tokenize(content);
    expect(lines).toHaveLength(3);
  });

  it('handles Mac line endings', () => {
    const content = '0 HEAD\r1 SOUR Test\r0 TRLR';
    const lines = tokenize(content);
    expect(lines).toHaveLength(3);
  });

  it('skips empty lines', () => {
    const content = `0 HEAD

1 SOUR Test

0 TRLR`;
    const lines = tokenize(content);
    expect(lines).toHaveLength(3);
  });

  it('handles BOM at start of file', () => {
    const content = '\uFEFF0 HEAD\n0 TRLR';
    const lines = tokenize(content);
    expect(lines[0].tag).toBe('HEAD');
  });

  it('converts tags to uppercase', () => {
    const content = '0 head\n1 sour Test';
    const lines = tokenize(content);
    expect(lines[0].tag).toBe('HEAD');
    expect(lines[1].tag).toBe('SOUR');
  });
});

describe('processContinuations', () => {
  it('merges CONC directly without adding space', () => {
    // CONC concatenates directly - no space added between parts
    // This is standard GEDCOM behavior for line continuation
    const lines = tokenize(`0 HEAD
1 NOTE FirstPart
2 CONC SecondPart`);

    const processed = processContinuations(lines);

    expect(processed).toHaveLength(2);
    expect(processed[1].value).toBe('FirstPartSecondPart');
  });

  it('merges CONT with newline', () => {
    const lines = tokenize(`0 HEAD
1 NOTE First line
2 CONT Second line`);

    const processed = processContinuations(lines);

    expect(processed).toHaveLength(2);
    expect(processed[1].value).toBe('First line\nSecond line');
  });

  it('handles multiple continuations', () => {
    const lines = tokenize(`0 HEAD
1 NOTE Line1
2 CONT Line2
2 CONC -continued
2 CONT Line3`);

    const processed = processContinuations(lines);

    expect(processed[1].value).toBe('Line1\nLine2-continued\nLine3');
  });
});

describe('getChildLines', () => {
  it('returns immediate children', () => {
    const lines = tokenize(`0 @I1@ INDI
1 NAME John /DOE/
2 GIVN John
2 SURN DOE
1 SEX M
0 TRLR`);

    const children = getChildLines(lines, 0);

    expect(children).toHaveLength(2);
    expect(children[0].tag).toBe('NAME');
    expect(children[1].tag).toBe('SEX');
  });

  it('stops at same level', () => {
    const lines = tokenize(`0 @I1@ INDI
1 NAME John
0 @I2@ INDI
1 NAME Jane`);

    const children = getChildLines(lines, 0);

    expect(children).toHaveLength(1);
    expect(children[0].value).toBe('John');
  });
});

describe('getChildValue', () => {
  it('returns value of child tag', () => {
    const lines = tokenize(`0 @I1@ INDI
1 NAME John /DOE/
1 SEX M`);

    expect(getChildValue(lines, 0, 'SEX')).toBe('M');
    expect(getChildValue(lines, 0, 'NAME')).toBe('John /DOE/');
  });

  it('returns undefined for missing tag', () => {
    const lines = tokenize(`0 @I1@ INDI
1 NAME John`);

    expect(getChildValue(lines, 0, 'SEX')).toBeUndefined();
  });
});

describe('extractXref', () => {
  it('extracts XREF from value', () => {
    expect(extractXref('@I1@')).toBe('I1');
    expect(extractXref('@F123@')).toBe('F123');
  });

  it('returns undefined for non-XREF values', () => {
    expect(extractXref('John')).toBeUndefined();
    expect(extractXref('@incomplete')).toBeUndefined();
    expect(extractXref(undefined)).toBeUndefined();
  });
});
