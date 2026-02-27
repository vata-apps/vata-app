/**
 * @vata-apps/gedcom-parser - Serializer
 *
 * Serializes a GedcomDocument back to GEDCOM 5.5.1 text format.
 */

import type {
  GedcomDocument,
  GedcomHeader,
  GedcomIndividual,
  GedcomFamily,
  GedcomName,
  GedcomEvent,
  SerializeOptions,
} from './types';

/** Default maximum line length per GEDCOM 5.5.1 spec */
const DEFAULT_MAX_LINE_LENGTH = 255;

/**
 * Serialize a GedcomDocument to GEDCOM 5.5.1 text format.
 *
 * @param document - The document to serialize
 * @param options - Serialization options
 * @returns GEDCOM text content
 */
export function serialize(document: GedcomDocument, options: SerializeOptions = {}): string {
  const maxLineLength = options.maxLineLength ?? DEFAULT_MAX_LINE_LENGTH;
  const lines: string[] = [];

  // Header
  lines.push(...serializeHeader(document.header, options));

  // Individuals
  for (const individual of document.individuals) {
    lines.push(...serializeIndividual(individual, maxLineLength));
  }

  // Families
  for (const family of document.families) {
    lines.push(...serializeFamily(family, maxLineLength));
  }

  // Sources (MVP5 - placeholder)
  // for (const source of document.sources) { ... }

  // Repositories (MVP5 - placeholder)
  // for (const repository of document.repositories) { ... }

  // Notes (record-level)
  for (const note of document.notes) {
    if (note.xref) {
      lines.push(`0 @${note.xref}@ NOTE ${note.text.split('\n')[0]}`);
      // Handle multiline notes
      const noteLines = note.text.split('\n');
      for (let i = 1; i < noteLines.length; i++) {
        lines.push(...wrapLongValue(1, 'CONT', noteLines[i], maxLineLength));
      }
    }
  }

  // Trailer
  lines.push('0 TRLR');

  return lines.join('\n') + '\n';
}

/**
 * Serialize the GEDCOM header.
 */
function serializeHeader(header: GedcomHeader, options: SerializeOptions): string[] {
  const lines: string[] = [];

  lines.push('0 HEAD');

  // Source application
  const sourceApp = options.sourceApp || header.sourceApp || 'VATA';
  lines.push(`1 SOUR ${sourceApp}`);
  const sourceVersion = options.sourceVersion || header.sourceVersion;
  if (sourceVersion) {
    lines.push(`2 VERS ${sourceVersion}`);
  }

  // GEDCOM version
  lines.push('1 GEDC');
  lines.push(`2 VERS ${header.gedcomVersion || '5.5.1'}`);
  lines.push('2 FORM LINEAGE-LINKED');

  // Character set - always UTF-8
  lines.push('1 CHAR UTF-8');

  // File name
  if (header.fileName) {
    lines.push(`1 FILE ${header.fileName}`);
  }

  // Copyright
  if (header.copyright) {
    lines.push(`1 COPR ${header.copyright}`);
  }

  return lines;
}

/**
 * Serialize an individual record.
 */
function serializeIndividual(individual: GedcomIndividual, maxLineLength: number): string[] {
  const lines: string[] = [];

  // Record header
  lines.push(`0 @${individual.xref}@ INDI`);

  // Names
  for (const name of individual.names) {
    lines.push(...serializeName(name, maxLineLength));
  }

  // Gender
  lines.push(`1 SEX ${individual.gender}`);

  // Events
  for (const event of individual.events) {
    lines.push(...serializeEvent(event, maxLineLength));
  }

  // Family references as child
  for (const famRef of individual.familyChildRefs) {
    lines.push(`1 FAMC @${famRef}@`);
  }

  // Family references as spouse
  for (const famRef of individual.familySpouseRefs) {
    lines.push(`1 FAMS @${famRef}@`);
  }

  // Notes
  for (const note of individual.notes) {
    lines.push(...wrapLongValue(1, 'NOTE', note, maxLineLength));
  }

  return lines;
}

/**
 * Serialize a name structure.
 */
function serializeName(name: GedcomName, maxLineLength: number): string[] {
  const lines: string[] = [];

  // Build the name value in GEDCOM format: Given /Surname/ Suffix
  let nameValue = name.value;
  if (!nameValue) {
    const givenPart = name.givenNames || '';
    const surnamePart = name.surname ? `/${name.surname}/` : '';
    nameValue = `${givenPart} ${surnamePart}`.trim();
  }

  lines.push(...wrapLongValue(1, 'NAME', nameValue, maxLineLength));

  // Sub-tags for detailed name parts
  if (name.givenNames) {
    lines.push(`2 GIVN ${name.givenNames}`);
  }
  if (name.surname) {
    lines.push(`2 SURN ${name.surname}`);
  }
  if (name.prefix) {
    lines.push(`2 NPFX ${name.prefix}`);
  }
  if (name.suffix) {
    lines.push(`2 NSFX ${name.suffix}`);
  }
  if (name.surnamePrefix) {
    lines.push(`2 SPFX ${name.surnamePrefix}`);
  }
  if (name.nickname) {
    lines.push(`2 NICK ${name.nickname}`);
  }
  if (name.type) {
    lines.push(`2 TYPE ${name.type}`);
  }

  return lines;
}

/**
 * Serialize an event structure.
 */
function serializeEvent(event: GedcomEvent, maxLineLength: number): string[] {
  const lines: string[] = [];

  // Event tag with optional description
  if (event.description) {
    lines.push(...wrapLongValue(1, event.tag, event.description, maxLineLength));
  } else {
    lines.push(`1 ${event.tag}`);
  }

  // TYPE sub-tag for custom events (EVEN)
  if (event.type) {
    lines.push(`2 TYPE ${event.type}`);
  }

  // Date
  if (event.date) {
    lines.push(`2 DATE ${event.date}`);
  }

  // Place
  if (event.place) {
    lines.push(...wrapLongValue(2, 'PLAC', event.place, maxLineLength));
  }

  // Notes
  for (const note of event.notes) {
    lines.push(...wrapLongValue(2, 'NOTE', note, maxLineLength));
  }

  return lines;
}

/**
 * Serialize a family record.
 */
function serializeFamily(family: GedcomFamily, maxLineLength: number): string[] {
  const lines: string[] = [];

  // Record header
  lines.push(`0 @${family.xref}@ FAM`);

  // Husband
  if (family.husbandRef) {
    lines.push(`1 HUSB @${family.husbandRef}@`);
  }

  // Wife
  if (family.wifeRef) {
    lines.push(`1 WIFE @${family.wifeRef}@`);
  }

  // Children
  for (const childRef of family.childRefs) {
    lines.push(`1 CHIL @${childRef}@`);
  }

  // Events
  for (const event of family.events) {
    lines.push(...serializeEvent(event, maxLineLength));
  }

  // Notes
  for (const note of family.notes) {
    lines.push(...wrapLongValue(1, 'NOTE', note, maxLineLength));
  }

  return lines;
}

/**
 * Wrap a long value using CONC/CONT line continuations.
 *
 * - CONT is used for newlines in the original value
 * - CONC is used to continue a line that exceeds maxLineLength
 *
 * @param level - The GEDCOM level for the primary tag
 * @param tag - The GEDCOM tag
 * @param value - The value to wrap
 * @param maxLineLength - Maximum characters per line
 * @returns Array of GEDCOM lines
 */
function wrapLongValue(level: number, tag: string, value: string, maxLineLength: number): string[] {
  const lines: string[] = [];

  // Split by newlines first - each newline becomes a CONT
  const textLines = value.split('\n');

  for (let lineIndex = 0; lineIndex < textLines.length; lineIndex++) {
    const text = textLines[lineIndex];
    const isFirst = lineIndex === 0;
    const continuationLevel = level + 1;

    if (isFirst) {
      // First line uses the original tag
      const prefix = `${level} ${tag} `;
      const firstLine = prefix + text;

      if (firstLine.length <= maxLineLength) {
        lines.push(firstLine);
      } else {
        // Need to split with CONC
        const availableForValue = maxLineLength - prefix.length;
        lines.push(prefix + text.slice(0, availableForValue));

        // Remaining text goes to CONC lines
        let remaining = text.slice(availableForValue);
        const concPrefix = `${continuationLevel} CONC `;
        const availableForConc = maxLineLength - concPrefix.length;

        while (remaining.length > 0) {
          const chunk = remaining.slice(0, availableForConc);
          lines.push(concPrefix + chunk);
          remaining = remaining.slice(availableForConc);
        }
      }
    } else {
      // Subsequent lines use CONT
      const contPrefix = `${continuationLevel} CONT `;
      const contLine = contPrefix + text;

      if (contLine.length <= maxLineLength) {
        lines.push(contLine);
      } else {
        // Need to split with CONC after CONT
        const availableForValue = maxLineLength - contPrefix.length;
        lines.push(contPrefix + text.slice(0, availableForValue));

        // Remaining text goes to CONC lines
        let remaining = text.slice(availableForValue);
        const concPrefix = `${continuationLevel} CONC `;
        const availableForConc = maxLineLength - concPrefix.length;

        while (remaining.length > 0) {
          const chunk = remaining.slice(0, availableForConc);
          lines.push(concPrefix + chunk);
          remaining = remaining.slice(availableForConc);
        }
      }
    }
  }

  return lines;
}
