import { describe, it, expect } from 'vitest';
import { serialize } from './serialize';
import { parseDocument } from './parse';
import type { GedcomDocument } from './types';

describe('serialize', () => {
  describe('header', () => {
    it('serializes header with source application', () => {
      const doc: GedcomDocument = {
        header: {
          sourceApp: 'TestApp',
          sourceVersion: '1.0',
          gedcomVersion: '5.5.1',
        },
        individuals: [],
        families: [],
        sources: [],
        repositories: [],
        notes: [],
      };

      const result = serialize(doc);

      expect(result).toContain('0 HEAD');
      expect(result).toContain('1 SOUR TestApp');
      expect(result).toContain('2 VERS 1.0');
      expect(result).toContain('1 GEDC');
      expect(result).toContain('2 VERS 5.5.1');
      expect(result).toContain('2 FORM LINEAGE-LINKED');
      expect(result).toContain('1 CHAR UTF-8');
      expect(result).toContain('0 TRLR');
    });

    it('uses options to override source app', () => {
      const doc: GedcomDocument = {
        header: { sourceApp: 'OldApp' },
        individuals: [],
        families: [],
        sources: [],
        repositories: [],
        notes: [],
      };

      const result = serialize(doc, { sourceApp: 'Vata', sourceVersion: '0.1.0' });

      expect(result).toContain('1 SOUR Vata');
      expect(result).toContain('2 VERS 0.1.0');
    });
  });

  describe('individuals', () => {
    it('serializes an individual with name and gender', () => {
      const doc: GedcomDocument = {
        header: {},
        individuals: [
          {
            xref: 'I1',
            names: [{ givenNames: 'Jean Pierre', surname: 'DUPONT' }],
            gender: 'M',
            events: [],
            familyChildRefs: [],
            familySpouseRefs: [],
            notes: [],
            sources: [],
          },
        ],
        families: [],
        sources: [],
        repositories: [],
        notes: [],
      };

      const result = serialize(doc);

      expect(result).toContain('0 @I1@ INDI');
      expect(result).toContain('1 NAME Jean Pierre /DUPONT/');
      expect(result).toContain('2 GIVN Jean Pierre');
      expect(result).toContain('2 SURN DUPONT');
      expect(result).toContain('1 SEX M');
    });

    it('serializes name parts including prefix, suffix, and nickname', () => {
      const doc: GedcomDocument = {
        header: {},
        individuals: [
          {
            xref: 'I1',
            names: [
              {
                givenNames: 'Jean',
                surname: 'DUPONT',
                prefix: 'Dr.',
                suffix: 'Jr.',
                nickname: 'Johnny',
                type: 'birth',
              },
            ],
            gender: 'M',
            events: [],
            familyChildRefs: [],
            familySpouseRefs: [],
            notes: [],
            sources: [],
          },
        ],
        families: [],
        sources: [],
        repositories: [],
        notes: [],
      };

      const result = serialize(doc);

      expect(result).toContain('2 NPFX Dr.');
      expect(result).toContain('2 NSFX Jr.');
      expect(result).toContain('2 NICK Johnny');
      expect(result).toContain('2 TYPE birth');
    });

    it('serializes individual events', () => {
      const doc: GedcomDocument = {
        header: {},
        individuals: [
          {
            xref: 'I1',
            names: [{ givenNames: 'Jean', surname: 'DUPONT' }],
            gender: 'M',
            events: [
              {
                tag: 'BIRT',
                date: '15 JAN 1845',
                place: 'Montreal, Quebec, Canada',
                notes: [],
                sources: [],
              },
              {
                tag: 'DEAT',
                date: '3 MAR 1920',
                notes: [],
                sources: [],
              },
              {
                tag: 'OCCU',
                description: 'Physician',
                notes: [],
                sources: [],
              },
            ],
            familyChildRefs: [],
            familySpouseRefs: [],
            notes: [],
            sources: [],
          },
        ],
        families: [],
        sources: [],
        repositories: [],
        notes: [],
      };

      const result = serialize(doc);

      expect(result).toContain('1 BIRT');
      expect(result).toContain('2 DATE 15 JAN 1845');
      expect(result).toContain('2 PLAC Montreal, Quebec, Canada');
      expect(result).toContain('1 DEAT');
      expect(result).toContain('2 DATE 3 MAR 1920');
      expect(result).toContain('1 OCCU Physician');
    });

    it('serializes family references', () => {
      const doc: GedcomDocument = {
        header: {},
        individuals: [
          {
            xref: 'I1',
            names: [{ surname: 'Test' }],
            gender: 'M',
            events: [],
            familyChildRefs: ['F2'],
            familySpouseRefs: ['F1'],
            notes: [],
            sources: [],
          },
        ],
        families: [],
        sources: [],
        repositories: [],
        notes: [],
      };

      const result = serialize(doc);

      expect(result).toContain('1 FAMC @F2@');
      expect(result).toContain('1 FAMS @F1@');
    });

    it('serializes custom events with TYPE', () => {
      const doc: GedcomDocument = {
        header: {},
        individuals: [
          {
            xref: 'I1',
            names: [{ surname: 'Test' }],
            gender: 'U',
            events: [
              {
                tag: 'EVEN',
                type: 'Baptism by Fire',
                date: '1 JAN 1900',
                notes: [],
                sources: [],
              },
            ],
            familyChildRefs: [],
            familySpouseRefs: [],
            notes: [],
            sources: [],
          },
        ],
        families: [],
        sources: [],
        repositories: [],
        notes: [],
      };

      const result = serialize(doc);

      expect(result).toContain('1 EVEN');
      expect(result).toContain('2 TYPE Baptism by Fire');
      expect(result).toContain('2 DATE 1 JAN 1900');
    });
  });

  describe('families', () => {
    it('serializes a family with husband, wife, and children', () => {
      const doc: GedcomDocument = {
        header: {},
        individuals: [],
        families: [
          {
            xref: 'F1',
            husbandRef: 'I1',
            wifeRef: 'I2',
            childRefs: ['I3', 'I4'],
            events: [],
            notes: [],
            sources: [],
          },
        ],
        sources: [],
        repositories: [],
        notes: [],
      };

      const result = serialize(doc);

      expect(result).toContain('0 @F1@ FAM');
      expect(result).toContain('1 HUSB @I1@');
      expect(result).toContain('1 WIFE @I2@');
      expect(result).toContain('1 CHIL @I3@');
      expect(result).toContain('1 CHIL @I4@');
    });

    it('serializes family events', () => {
      const doc: GedcomDocument = {
        header: {},
        individuals: [],
        families: [
          {
            xref: 'F1',
            childRefs: [],
            events: [
              {
                tag: 'MARR',
                date: '3 JUN 1870',
                place: 'Montreal, Quebec',
                notes: [],
                sources: [],
              },
              {
                tag: 'DIV',
                date: '1 JAN 1890',
                notes: [],
                sources: [],
              },
            ],
            notes: [],
            sources: [],
          },
        ],
        sources: [],
        repositories: [],
        notes: [],
      };

      const result = serialize(doc);

      expect(result).toContain('1 MARR');
      expect(result).toContain('2 DATE 3 JUN 1870');
      expect(result).toContain('2 PLAC Montreal, Quebec');
      expect(result).toContain('1 DIV');
      expect(result).toContain('2 DATE 1 JAN 1890');
    });
  });

  describe('line continuation', () => {
    it('wraps long values with CONC', () => {
      const longPlace = 'A'.repeat(300);
      const doc: GedcomDocument = {
        header: {},
        individuals: [
          {
            xref: 'I1',
            names: [{ surname: 'Test' }],
            gender: 'M',
            events: [
              {
                tag: 'BIRT',
                place: longPlace,
                notes: [],
                sources: [],
              },
            ],
            familyChildRefs: [],
            familySpouseRefs: [],
            notes: [],
            sources: [],
          },
        ],
        families: [],
        sources: [],
        repositories: [],
        notes: [],
      };

      const result = serialize(doc);
      const lines = result.split('\n');

      // Find the PLAC line and CONC line
      const placIndex = lines.findIndex((l) => l.includes('PLAC'));
      expect(placIndex).toBeGreaterThan(-1);
      expect(lines[placIndex].length).toBeLessThanOrEqual(255);

      const concIndex = lines.findIndex((l) => l.includes('CONC'));
      expect(concIndex).toBeGreaterThan(-1);
    });

    it('handles newlines with CONT', () => {
      const doc: GedcomDocument = {
        header: {},
        individuals: [
          {
            xref: 'I1',
            names: [{ surname: 'Test' }],
            gender: 'M',
            events: [],
            familyChildRefs: [],
            familySpouseRefs: [],
            notes: ['Line one\nLine two\nLine three'],
            sources: [],
          },
        ],
        families: [],
        sources: [],
        repositories: [],
        notes: [],
      };

      const result = serialize(doc);

      expect(result).toContain('1 NOTE Line one');
      expect(result).toContain('2 CONT Line two');
      expect(result).toContain('2 CONT Line three');
    });
  });

  describe('roundtrip', () => {
    it('parse then serialize produces valid GEDCOM', () => {
      const original = `0 HEAD
1 SOUR TestApp
2 VERS 1.0
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I1@ INDI
1 NAME Jean Pierre /DUPONT/
2 GIVN Jean Pierre
2 SURN DUPONT
1 SEX M
1 BIRT
2 DATE 15 JAN 1845
2 PLAC Montreal, Quebec, Canada
1 FAMS @F1@
0 @I2@ INDI
1 NAME Marie /TREMBLAY/
1 SEX F
1 FAMS @F1@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 MARR
2 DATE 3 JUN 1870
0 TRLR`;

      const doc = parseDocument(original);
      const serialized = serialize(doc);

      // Re-parse the serialized output
      const reparsed = parseDocument(serialized);

      // Verify structure is preserved
      expect(reparsed.individuals).toHaveLength(2);
      expect(reparsed.families).toHaveLength(1);

      const jean = reparsed.individuals.find((i) => i.xref === 'I1');
      expect(jean?.names[0].givenNames).toBe('Jean Pierre');
      expect(jean?.names[0].surname).toBe('DUPONT');
      expect(jean?.gender).toBe('M');

      const birth = jean?.events.find((e) => e.tag === 'BIRT');
      expect(birth?.date).toBe('15 JAN 1845');
      expect(birth?.place).toBe('Montreal, Quebec, Canada');

      const family = reparsed.families[0];
      expect(family.husbandRef).toBe('I1');
      expect(family.wifeRef).toBe('I2');
    });
  });
});
