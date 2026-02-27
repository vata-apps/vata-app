/**
 * @vata-apps/gedcom-parser - Lexer
 *
 * Tokenizes GEDCOM text into structured lines.
 * Handles line parsing, XREF extraction, and continuation lines (CONC/CONT).
 */

import type { GedcomLine } from './types';

/**
 * Regular expression for parsing a GEDCOM line.
 * Format: LEVEL [XREF] TAG [VALUE]
 *
 * Groups:
 * 1. Level (0-99)
 * 2. XREF (optional, with @...@)
 * 3. Tag
 * 4. Value (optional, rest of line)
 */
const LINE_REGEX = /^(\d{1,2})\s+(?:@([^@]+)@\s+)?(\S+)(?:\s+(.*))?$/;

/**
 * Tokenize GEDCOM text into an array of GedcomLine objects.
 *
 * @param content - Raw GEDCOM text
 * @returns Array of parsed lines
 */
export function tokenize(content: string): GedcomLine[] {
  const lines: GedcomLine[] = [];
  const rawLines = normalizeLineEndings(content).split('\n');

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i].trim();

    // Skip empty lines
    if (!rawLine) continue;

    // Skip BOM if present at start
    const cleanLine = i === 0 ? rawLine.replace(/^\uFEFF/, '') : rawLine;

    const parsed = parseLine(cleanLine, i + 1);
    if (parsed) {
      lines.push(parsed);
    }
  }

  return lines;
}

/**
 * Parse a single GEDCOM line.
 *
 * @param line - Raw line text
 * @param lineNumber - Line number for error reporting
 * @returns Parsed GedcomLine or null if invalid
 */
function parseLine(line: string, lineNumber: number): GedcomLine | null {
  const match = line.match(LINE_REGEX);
  if (!match) {
    // Invalid line format - skip silently for robustness
    return null;
  }

  const [, levelStr, xref, tag, value] = match;
  const level = parseInt(levelStr, 10);

  return {
    level,
    xref: xref || undefined,
    tag: tag.toUpperCase(),
    value: value || undefined,
    lineNumber,
  };
}

/**
 * Normalize line endings to \n.
 */
function normalizeLineEndings(content: string): string {
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Process continuation lines (CONC and CONT) in tokenized output.
 * CONC continues on the same line (no space).
 * CONT continues on a new line (with newline character).
 *
 * @param lines - Array of tokenized lines
 * @returns Array with continuation lines merged
 */
export function processContinuations(lines: GedcomLine[]): GedcomLine[] {
  const result: GedcomLine[] = [];

  for (const line of lines) {
    if (line.tag === 'CONC' && result.length > 0) {
      // Concatenate without space
      const prev = result[result.length - 1];
      prev.value = (prev.value || '') + (line.value || '');
    } else if (line.tag === 'CONT' && result.length > 0) {
      // Concatenate with newline
      const prev = result[result.length - 1];
      prev.value = (prev.value || '') + '\n' + (line.value || '');
    } else {
      result.push({ ...line });
    }
  }

  return result;
}

/**
 * Find all child lines of a given line (based on level).
 *
 * @param lines - Array of lines to search
 * @param startIndex - Index of the parent line
 * @returns Array of child lines
 */
export function getChildLines(lines: GedcomLine[], startIndex: number): GedcomLine[] {
  const parent = lines[startIndex];
  if (!parent) return [];

  const children: GedcomLine[] = [];
  const childLevel = parent.level + 1;

  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.level <= parent.level) {
      // Back to same or higher level - end of children
      break;
    }
    if (line.level === childLevel) {
      children.push(line);
    }
  }

  return children;
}

/**
 * Find all descendant lines of a given line (all levels below).
 *
 * @param lines - Array of lines to search
 * @param startIndex - Index of the parent line
 * @returns Array of descendant lines
 */
export function getDescendantLines(lines: GedcomLine[], startIndex: number): GedcomLine[] {
  const parent = lines[startIndex];
  if (!parent) return [];

  const descendants: GedcomLine[] = [];

  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.level <= parent.level) {
      // Back to same or higher level - end of descendants
      break;
    }
    descendants.push(line);
  }

  return descendants;
}

/**
 * Get the value of a child tag.
 *
 * @param lines - Array of lines
 * @param startIndex - Index of parent line
 * @param tag - Tag to find
 * @returns Value of the tag or undefined
 */
export function getChildValue(
  lines: GedcomLine[],
  startIndex: number,
  tag: string
): string | undefined {
  const children = getChildLines(lines, startIndex);
  const child = children.find((c) => c.tag === tag);
  return child?.value;
}

/**
 * Get all values of a child tag (for repeating tags).
 *
 * @param lines - Array of lines
 * @param startIndex - Index of parent line
 * @param tag - Tag to find
 * @returns Array of values
 */
export function getChildValues(lines: GedcomLine[], startIndex: number, tag: string): string[] {
  const children = getChildLines(lines, startIndex);
  return children
    .filter((c) => c.tag === tag)
    .map((c) => c.value)
    .filter((v): v is string => v !== undefined);
}

/**
 * Extract XREF from a value like "@I1@".
 *
 * @param value - Value string
 * @returns XREF without @ symbols or undefined
 */
export function extractXref(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const match = value.match(/^@([^@]+)@$/);
  return match ? match[1] : undefined;
}
