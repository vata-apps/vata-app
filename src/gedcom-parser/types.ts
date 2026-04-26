/**
 * @vata-apps/gedcom-parser - Types
 *
 * Type definitions for GEDCOM document parsing and serialization.
 * Supports GEDCOM 5.5.1 structures.
 */

/**
 * A parsed GEDCOM document containing all records.
 */
export interface GedcomDocument {
  /** Header information */
  header: GedcomHeader;
  /** Individual records (INDI) */
  individuals: GedcomIndividual[];
  /** Family records (FAM) */
  families: GedcomFamily[];
  /** Source records (SOUR) - TODO: not yet supported, empty for now */
  sources: GedcomSource[];
  /** Repository records (REPO) - TODO: not yet supported, empty for now */
  repositories: GedcomRepository[];
  /** Note records (NOTE) */
  notes: GedcomNote[];
}

/**
 * GEDCOM header information.
 */
export interface GedcomHeader {
  /** Source application name */
  sourceApp?: string;
  /** Source application version */
  sourceVersion?: string;
  /** GEDCOM version (e.g., "5.5.1") */
  gedcomVersion?: string;
  /** Character encoding */
  encoding?: string;
  /** Submitter name */
  submitterName?: string;
  /** File name */
  fileName?: string;
  /** Copyright notice */
  copyright?: string;
}

/**
 * Individual record (INDI).
 */
export interface GedcomIndividual {
  /** XREF identifier (e.g., "I1" without @) */
  xref: string;
  /** Names */
  names: GedcomName[];
  /** Gender: M, F, or U (unknown) */
  gender: 'M' | 'F' | 'U';
  /** Life events (BIRT, DEAT, etc.) */
  events: GedcomEvent[];
  /** Family references where this individual is a child (FAMC) */
  familyChildRefs: string[];
  /** Family references where this individual is a spouse (FAMS) */
  familySpouseRefs: string[];
  /** Notes attached to this individual */
  notes: string[];
  /** Source citations - TODO: not yet supported, empty for now */
  sources: GedcomSourceCitation[];
}

/**
 * Name structure.
 */
export interface GedcomName {
  /** Full name value (e.g., "Jean /DUPONT/") */
  value?: string;
  /** Given names (GIVN) */
  givenNames?: string;
  /** Surname (SURN) */
  surname?: string;
  /** Name prefix (NPFX, e.g., "Dr.") */
  prefix?: string;
  /** Name suffix (NSFX, e.g., "Jr.") */
  suffix?: string;
  /** Surname prefix (SPFX, e.g., "de") */
  surnamePrefix?: string;
  /** Nickname (NICK) */
  nickname?: string;
  /** Name type (TYPE, e.g., "married", "birth") */
  type?: string;
}

/**
 * Event structure (for both individual and family events).
 */
export interface GedcomEvent {
  /** GEDCOM tag (BIRT, DEAT, MARR, etc.) */
  tag: string;
  /** Event type for generic events (EVEN + TYPE) */
  type?: string;
  /** Date string */
  date?: string;
  /** Place name */
  place?: string;
  /** Description/value */
  description?: string;
  /** Notes */
  notes: string[];
  /** Source citations - TODO: not yet supported, empty for now */
  sources: GedcomSourceCitation[];
}

/**
 * Family record (FAM).
 */
export interface GedcomFamily {
  /** XREF identifier (e.g., "F1" without @) */
  xref: string;
  /** Husband reference (HUSB) */
  husbandRef?: string;
  /** Wife reference (WIFE) */
  wifeRef?: string;
  /** Children references (CHIL) */
  childRefs: string[];
  /** Family events (MARR, DIV, etc.) */
  events: GedcomEvent[];
  /** Notes */
  notes: string[];
  /** Source citations - TODO: not yet supported, empty for now */
  sources: GedcomSourceCitation[];
}

/**
 * Source record (SOUR) - TODO: placeholder, not yet supported.
 */
export interface GedcomSource {
  /** XREF identifier */
  xref: string;
  /** Title */
  title?: string;
  /** Author */
  author?: string;
  /** Publisher */
  publisher?: string;
  /** Repository reference */
  repositoryRef?: string;
  /** Call number */
  callNumber?: string;
}

/**
 * Repository record (REPO) - TODO: placeholder, not yet supported.
 */
export interface GedcomRepository {
  /** XREF identifier */
  xref: string;
  /** Name */
  name?: string;
  /** Address */
  address?: string;
}

/**
 * Source citation (attached to records) - TODO: placeholder, not yet supported.
 */
export interface GedcomSourceCitation {
  /** Source reference (XREF) */
  sourceRef?: string;
  /** Page/location */
  page?: string;
  /** Quality */
  quality?: string;
}

/**
 * Note record (NOTE).
 */
export interface GedcomNote {
  /** XREF identifier (if record-level note) */
  xref?: string;
  /** Note text */
  text: string;
}

/**
 * A single line in a GEDCOM file.
 */
export interface GedcomLine {
  /** Level (0-99) */
  level: number;
  /** XREF (e.g., "I1" without @) */
  xref?: string;
  /** Tag (e.g., "INDI", "NAME", "BIRT") */
  tag: string;
  /** Value (rest of the line) */
  value?: string;
  /** Line number in original file (for error reporting) */
  lineNumber: number;
}

/**
 * Validation error.
 */
export interface ValidationError {
  /** Line number (if applicable) */
  line?: number;
  /** Error message */
  message: string;
  /** Severity */
  severity: 'error' | 'warning';
}

/**
 * Validation result.
 */
export interface ValidationResult {
  /** Whether the document is valid */
  valid: boolean;
  /** List of errors/warnings */
  errors: ValidationError[];
  /** Statistics */
  stats: {
    individuals: number;
    families: number;
    sources: number;
    repositories: number;
  };
}

/**
 * Serialization options.
 */
export interface SerializeOptions {
  /** Source application name for header */
  sourceApp?: string;
  /** Source application version for header */
  sourceVersion?: string;
  /** Maximum line length (default 255) */
  maxLineLength?: number;
}
