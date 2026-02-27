/**
 * @vata-apps/gedcom-parser
 *
 * GEDCOM 5.5.1 parsing and serialization library.
 *
 * This is an in-app module designed for extraction as a standalone package.
 * Do not import from other modules outside gedcom-parser (except gedcom-date).
 *
 * @example
 * import { parseDocument, validate } from '@vata-apps/gedcom-parser';
 *
 * const document = parseDocument(gedcomContent);
 * console.log(`Found ${document.individuals.length} individuals`);
 *
 * const validation = validate(gedcomContent);
 * if (!validation.valid) {
 *   console.error(validation.errors);
 * }
 */

// Types
export type {
  GedcomDocument,
  GedcomHeader,
  GedcomIndividual,
  GedcomFamily,
  GedcomName,
  GedcomEvent,
  GedcomSource,
  GedcomRepository,
  GedcomSourceCitation,
  GedcomNote,
  GedcomLine,
  ValidationError,
  ValidationResult,
  SerializeOptions,
} from './types';

// Parser
export { parseDocument } from './parse';

// Validator
export { validate, isGedcom } from './validate';

// Lexer utilities (for advanced use)
export {
  tokenize,
  processContinuations,
  getChildLines,
  getDescendantLines,
  getChildValue,
  getChildValues,
  extractXref,
} from './lexer';
