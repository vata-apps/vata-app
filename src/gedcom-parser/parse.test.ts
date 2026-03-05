import { describe, it, expect } from 'vitest';
import { parseDocument } from './parse';

const SAMPLE_GEDCOM = `0 HEAD
1 SOUR TestApp
2 VERS 1.0
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I1@ INDI
1 NAME Jean Pierre /DUPONT/
2 GIVN Jean Pierre
2 SURN DUPONT
2 NPFX Dr.
1 SEX M
1 BIRT
2 DATE 15 JAN 1845
2 PLAC Montreal, Quebec, Canada
1 DEAT
2 DATE 3 MAR 1920
2 PLAC Quebec, Quebec, Canada
1 OCCU Physician
1 FAMS @F1@
0 @I2@ INDI
1 NAME Marie /TREMBLAY/
1 SEX F
1 FAMS @F1@
0 @I3@ INDI
1 NAME Pierre /DUPONT/
1 SEX M
1 FAMC @F1@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I3@
1 MARR
2 DATE 3 JUN 1870
2 PLAC Montreal, Quebec
0 TRLR`;

describe('parseDocument', () => {
  it('parses header information', () => {
    const doc = parseDocument(SAMPLE_GEDCOM);

    expect(doc.header.sourceApp).toBe('TestApp');
    expect(doc.header.sourceVersion).toBe('1.0');
    expect(doc.header.gedcomVersion).toBe('5.5.1');
    expect(doc.header.encoding).toBe('UTF-8');
  });

  it('parses individuals', () => {
    const doc = parseDocument(SAMPLE_GEDCOM);

    expect(doc.individuals).toHaveLength(3);

    const jean = doc.individuals[0];
    expect(jean.xref).toBe('I1');
    expect(jean.gender).toBe('M');
    expect(jean.names).toHaveLength(1);
    expect(jean.names[0].givenNames).toBe('Jean Pierre');
    expect(jean.names[0].surname).toBe('DUPONT');
    expect(jean.names[0].prefix).toBe('Dr.');
  });

  it('parses individual events', () => {
    const doc = parseDocument(SAMPLE_GEDCOM);

    const jean = doc.individuals[0];
    expect(jean.events).toHaveLength(3); // BIRT, DEAT, OCCU

    const birth = jean.events.find((e) => e.tag === 'BIRT');
    expect(birth).toBeDefined();
    expect(birth?.date).toBe('15 JAN 1845');
    expect(birth?.place).toBe('Montreal, Quebec, Canada');

    const death = jean.events.find((e) => e.tag === 'DEAT');
    expect(death?.date).toBe('3 MAR 1920');

    const occu = jean.events.find((e) => e.tag === 'OCCU');
    expect(occu?.description).toBe('Physician');
  });

  it('parses family references in individuals', () => {
    const doc = parseDocument(SAMPLE_GEDCOM);

    const jean = doc.individuals[0];
    expect(jean.familySpouseRefs).toContain('F1');

    const pierre = doc.individuals[2];
    expect(pierre.familyChildRefs).toContain('F1');
  });

  it('parses families', () => {
    const doc = parseDocument(SAMPLE_GEDCOM);

    expect(doc.families).toHaveLength(1);

    const family = doc.families[0];
    expect(family.xref).toBe('F1');
    expect(family.husbandRef).toBe('I1');
    expect(family.wifeRef).toBe('I2');
    expect(family.childRefs).toContain('I3');
  });

  it('parses family events', () => {
    const doc = parseDocument(SAMPLE_GEDCOM);

    const family = doc.families[0];
    expect(family.events).toHaveLength(1);

    const marriage = family.events[0];
    expect(marriage.tag).toBe('MARR');
    expect(marriage.date).toBe('3 JUN 1870');
    expect(marriage.place).toBe('Montreal, Quebec');
  });
});

describe('parseDocument - name parsing', () => {
  it('parses name from value string', () => {
    const content = `0 HEAD
0 @I1@ INDI
1 NAME John William /SMITH/ Jr.
0 TRLR`;

    const doc = parseDocument(content);
    const name = doc.individuals[0].names[0];

    expect(name.value).toBe('John William /SMITH/ Jr.');
    expect(name.givenNames).toBe('John William');
    expect(name.surname).toBe('SMITH');
    expect(name.suffix).toBe('Jr.');
  });

  it('uses explicit sub-tags over parsed value', () => {
    const content = `0 HEAD
0 @I1@ INDI
1 NAME John /SMITH/
2 GIVN Jonathan
2 SURN SMITHSON
0 TRLR`;

    const doc = parseDocument(content);
    const name = doc.individuals[0].names[0];

    expect(name.givenNames).toBe('Jonathan');
    expect(name.surname).toBe('SMITHSON');
  });

  it('parses multiple names', () => {
    const content = `0 HEAD
0 @I1@ INDI
1 NAME Marie /DUPONT/
1 NAME Marie /TREMBLAY/
2 TYPE married
0 TRLR`;

    const doc = parseDocument(content);

    expect(doc.individuals[0].names).toHaveLength(2);
    expect(doc.individuals[0].names[0].surname).toBe('DUPONT');
    expect(doc.individuals[0].names[1].surname).toBe('TREMBLAY');
    expect(doc.individuals[0].names[1].type).toBe('married');
  });

  it('merges surname prefix into surname', () => {
    const content = `0 HEAD
0 @I1@ INDI
1 NAME Charles /GAULLE/
2 SPFX de
2 SURN GAULLE
0 TRLR`;

    const doc = parseDocument(content);
    const name = doc.individuals[0].names[0];

    expect(name.surname).toBe('de GAULLE');
  });
});

describe('parseDocument - edge cases', () => {
  it('handles empty GEDCOM', () => {
    const doc = parseDocument('');

    expect(doc.individuals).toHaveLength(0);
    expect(doc.families).toHaveLength(0);
  });

  it('handles GEDCOM without trailer', () => {
    const content = `0 HEAD
0 @I1@ INDI
1 NAME Test`;

    const doc = parseDocument(content);

    expect(doc.individuals).toHaveLength(1);
  });

  it('handles unknown gender', () => {
    const content = `0 HEAD
0 @I1@ INDI
1 NAME Test
1 SEX X
0 TRLR`;

    const doc = parseDocument(content);

    expect(doc.individuals[0].gender).toBe('U');
  });

  it('handles missing XREF on INDI', () => {
    const content = `0 HEAD
0 INDI
1 NAME Test
0 TRLR`;

    const doc = parseDocument(content);

    // Should skip individuals without XREF
    expect(doc.individuals).toHaveLength(0);
  });
});
