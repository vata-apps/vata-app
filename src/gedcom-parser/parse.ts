/**
 * @vata-apps/gedcom-parser - Parser
 *
 * Parses tokenized GEDCOM lines into a structured GedcomDocument.
 */

import type {
  GedcomDocument,
  GedcomHeader,
  GedcomIndividual,
  GedcomFamily,
  GedcomName,
  GedcomEvent,
  GedcomLine,
} from './types';
import { tokenize, processContinuations, getChildLines, getChildValue, extractXref } from './lexer';

/**
 * Parse GEDCOM text content into a GedcomDocument.
 *
 * @param content - Raw GEDCOM text
 * @returns Parsed GedcomDocument
 */
export function parseDocument(content: string): GedcomDocument {
  // Tokenize and process continuations
  const rawLines = tokenize(content);
  const lines = processContinuations(rawLines);

  // Initialize document
  const document: GedcomDocument = {
    header: {},
    individuals: [],
    families: [],
    sources: [],
    repositories: [],
    notes: [],
  };

  // Process level-0 records
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.level !== 0) continue;

    switch (line.tag) {
      case 'HEAD':
        document.header = parseHeader(lines, i);
        break;
      case 'INDI':
        if (line.xref) {
          document.individuals.push(parseIndividual(lines, i, line.xref));
        }
        break;
      case 'FAM':
        if (line.xref) {
          document.families.push(parseFamily(lines, i, line.xref));
        }
        break;
      // SOUR and REPO parsing deferred to MVP5
      case 'TRLR':
        // End of file marker - stop processing
        break;
    }
  }

  return document;
}

/**
 * Parse GEDCOM header.
 */
function parseHeader(lines: GedcomLine[], startIndex: number): GedcomHeader {
  const header: GedcomHeader = {};

  const children = getChildLines(lines, startIndex);
  for (const child of children) {
    switch (child.tag) {
      case 'SOUR': {
        header.sourceApp = child.value;
        // Look for VERSION sub-tag
        const childIdx = lines.indexOf(child);
        const vers = getChildValue(lines, childIdx, 'VERS');
        if (vers) header.sourceVersion = vers;
        break;
      }
      case 'GEDC': {
        const childIdx = lines.indexOf(child);
        const vers = getChildValue(lines, childIdx, 'VERS');
        if (vers) header.gedcomVersion = vers;
        break;
      }
      case 'CHAR':
        header.encoding = child.value;
        break;
      case 'FILE':
        header.fileName = child.value;
        break;
      case 'COPR':
        header.copyright = child.value;
        break;
      case 'SUBM': {
        // Get submitter name from referenced SUBM record
        const submRef = extractXref(child.value);
        if (submRef) {
          // Find SUBM record and get NAME
          const submLine = lines.find(
            (l) => l.level === 0 && l.xref === submRef && l.tag === 'SUBM'
          );
          if (submLine) {
            const submIdx = lines.indexOf(submLine);
            const name = getChildValue(lines, submIdx, 'NAME');
            if (name) header.submitterName = name;
          }
        }
        break;
      }
    }
  }

  return header;
}

/**
 * Parse an individual record (INDI).
 */
function parseIndividual(lines: GedcomLine[], startIndex: number, xref: string): GedcomIndividual {
  const individual: GedcomIndividual = {
    xref,
    names: [],
    gender: 'U',
    events: [],
    familyChildRefs: [],
    familySpouseRefs: [],
    notes: [],
    sources: [],
  };

  const children = getChildLines(lines, startIndex);

  for (const child of children) {
    const childIdx = lines.indexOf(child);

    switch (child.tag) {
      case 'NAME':
        individual.names.push(parseName(lines, childIdx, child.value));
        break;
      case 'SEX':
        if (child.value === 'M' || child.value === 'F') {
          individual.gender = child.value;
        }
        break;
      case 'FAMC': {
        const ref = extractXref(child.value);
        if (ref) individual.familyChildRefs.push(ref);
        break;
      }
      case 'FAMS': {
        const ref = extractXref(child.value);
        if (ref) individual.familySpouseRefs.push(ref);
        break;
      }
      case 'NOTE': {
        const noteText = child.value || '';
        if (noteText) individual.notes.push(noteText);
        break;
      }
      // Individual events
      case 'BIRT':
      case 'CHR':
      case 'DEAT':
      case 'BURI':
      case 'CREM':
      case 'ADOP':
      case 'BAPM':
      case 'BARM':
      case 'BASM':
      case 'CONF':
      case 'FCOM':
      case 'ORDN':
      case 'NATU':
      case 'EMIG':
      case 'IMMI':
      case 'CENS':
      case 'PROB':
      case 'WILL':
      case 'GRAD':
      case 'RETI':
      case 'EVEN':
      case 'OCCU':
      case 'RESI':
      case 'EDUC':
      case 'RELI':
      case 'CAST':
      case 'DSCR':
      case 'IDNO':
      case 'NATI':
      case 'NCHI':
      case 'NMR':
      case 'PROP':
      case 'SSN':
      case 'TITL':
        individual.events.push(parseEvent(lines, childIdx, child.tag, child.value));
        break;
    }
  }

  return individual;
}

/**
 * Parse a name structure.
 */
function parseName(lines: GedcomLine[], startIndex: number, value?: string): GedcomName {
  const name: GedcomName = {};

  // Parse name value (e.g., "Jean /DUPONT/ Jr.")
  let parsedSuffix: string | undefined;
  if (value) {
    name.value = value;
    const parsed = parseNameValue(value);
    if (parsed.givenNames) name.givenNames = parsed.givenNames;
    if (parsed.surname) name.surname = parsed.surname;
    parsedSuffix = parsed.suffix;
  }

  // Parse sub-tags
  const children = getChildLines(lines, startIndex);
  for (const child of children) {
    switch (child.tag) {
      case 'GIVN':
        name.givenNames = child.value;
        break;
      case 'SURN':
        name.surname = child.value;
        break;
      case 'NPFX':
        name.prefix = child.value;
        break;
      case 'NSFX':
        name.suffix = child.value;
        break;
      case 'SPFX':
        name.surnamePrefix = child.value;
        break;
      case 'NICK':
        name.nickname = child.value;
        break;
      case 'TYPE':
        name.type = child.value;
        break;
    }
  }

  // Use suffix from name value as fallback when no explicit NSFX sub-tag
  if (!name.suffix && parsedSuffix) {
    name.suffix = parsedSuffix;
  }

  // Merge surname prefix into surname
  if (name.surnamePrefix && name.surname) {
    name.surname = `${name.surnamePrefix} ${name.surname}`;
  }

  return name;
}

/**
 * Parse a name value string (e.g., "Jean Pierre /DUPONT/ Jr.").
 */
function parseNameValue(value: string): {
  givenNames?: string;
  surname?: string;
  suffix?: string;
} {
  // Format: Given Names /Surname/ Suffix
  const match = value.match(/^([^/]*)?(?:\/([^/]*)\/)?(.*)$/);
  if (!match) return {};

  const [, givenPart, surname, suffixPart] = match;

  return {
    givenNames: givenPart?.trim() || undefined,
    surname: surname?.trim() || undefined,
    suffix: suffixPart?.trim() || undefined,
  };
}

/**
 * Parse an event structure.
 */
function parseEvent(
  lines: GedcomLine[],
  startIndex: number,
  tag: string,
  value?: string
): GedcomEvent {
  const event: GedcomEvent = {
    tag,
    notes: [],
    sources: [],
  };

  // Some events have a value (e.g., OCCU has the occupation)
  if (value) {
    event.description = value;
  }

  // Parse sub-tags
  const children = getChildLines(lines, startIndex);
  for (const child of children) {
    switch (child.tag) {
      case 'DATE':
        event.date = child.value;
        break;
      case 'PLAC':
        event.place = child.value;
        break;
      case 'TYPE':
        event.type = child.value;
        break;
      case 'NOTE':
        if (child.value) event.notes.push(child.value);
        break;
    }
  }

  return event;
}

/**
 * Parse a family record (FAM).
 */
function parseFamily(lines: GedcomLine[], startIndex: number, xref: string): GedcomFamily {
  const family: GedcomFamily = {
    xref,
    childRefs: [],
    events: [],
    notes: [],
    sources: [],
  };

  const children = getChildLines(lines, startIndex);

  for (const child of children) {
    const childIdx = lines.indexOf(child);

    switch (child.tag) {
      case 'HUSB': {
        const ref = extractXref(child.value);
        if (ref) family.husbandRef = ref;
        break;
      }
      case 'WIFE': {
        const ref = extractXref(child.value);
        if (ref) family.wifeRef = ref;
        break;
      }
      case 'CHIL': {
        const ref = extractXref(child.value);
        if (ref) family.childRefs.push(ref);
        break;
      }
      case 'NOTE': {
        const noteText = child.value || '';
        if (noteText) family.notes.push(noteText);
        break;
      }
      // Family events
      case 'MARR':
      case 'MARB':
      case 'MARC':
      case 'MARL':
      case 'MARS':
      case 'ENGA':
      case 'DIV':
      case 'DIVF':
      case 'ANUL':
      case 'CENS':
      case 'EVEN':
        family.events.push(parseEvent(lines, childIdx, child.tag, child.value));
        break;
    }
  }

  return family;
}
