/**
 * @vata-apps/gedcom-parser - Validator
 *
 * Validates GEDCOM documents for structural correctness.
 */

import type { ValidationError, ValidationResult } from './types';
import { tokenize, processContinuations } from './lexer';

/**
 * Validate GEDCOM content.
 *
 * @param content - Raw GEDCOM text
 * @returns Validation result with errors and statistics
 */
export function validate(content: string): ValidationResult {
  const errors: ValidationError[] = [];
  let individuals = 0;
  let families = 0;
  let sources = 0;
  let repositories = 0;

  // Tokenize
  const rawLines = tokenize(content);
  const lines = processContinuations(rawLines);

  if (lines.length === 0) {
    errors.push({
      message: 'Empty or invalid GEDCOM file',
      severity: 'error',
    });
    return {
      valid: false,
      errors,
      stats: { individuals: 0, families: 0, sources: 0, repositories: 0 },
    };
  }

  // Check for HEAD
  const hasHead = lines.some((l) => l.level === 0 && l.tag === 'HEAD');
  if (!hasHead) {
    errors.push({
      message: 'Missing HEAD record',
      severity: 'warning',
    });
  }

  // Check for TRLR
  const hasTrlr = lines.some((l) => l.level === 0 && l.tag === 'TRLR');
  if (!hasTrlr) {
    errors.push({
      message: 'Missing TRLR (trailer) record',
      severity: 'warning',
    });
  }

  // Track XREFs for reference validation
  const definedXrefs = new Set<string>();
  const referencedXrefs = new Set<string>();

  // Validate level-0 records and count entities
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.level === 0) {
      switch (line.tag) {
        case 'INDI':
          if (!line.xref) {
            errors.push({
              line: line.lineNumber,
              message: 'INDI record missing XREF',
              severity: 'error',
            });
          } else {
            if (definedXrefs.has(line.xref)) {
              errors.push({
                line: line.lineNumber,
                message: `Duplicate XREF: ${line.xref}`,
                severity: 'error',
              });
            }
            definedXrefs.add(line.xref);
            individuals++;
          }
          break;

        case 'FAM':
          if (!line.xref) {
            errors.push({
              line: line.lineNumber,
              message: 'FAM record missing XREF',
              severity: 'error',
            });
          } else {
            if (definedXrefs.has(line.xref)) {
              errors.push({
                line: line.lineNumber,
                message: `Duplicate XREF: ${line.xref}`,
                severity: 'error',
              });
            }
            definedXrefs.add(line.xref);
            families++;
          }
          break;

        case 'SOUR':
          if (line.xref) {
            definedXrefs.add(line.xref);
            sources++;
          }
          break;

        case 'REPO':
          if (line.xref) {
            definedXrefs.add(line.xref);
            repositories++;
          }
          break;
      }
    }

    // Track references (values like @I1@)
    if (line.value) {
      const refMatch = line.value.match(/^@([^@]+)@$/);
      if (refMatch) {
        referencedXrefs.add(refMatch[1]);
      }
    }

    // Validate level progression
    if (i > 0) {
      const prevLine = lines[i - 1];
      if (line.level > prevLine.level + 1) {
        errors.push({
          line: line.lineNumber,
          message: `Invalid level jump from ${prevLine.level} to ${line.level}`,
          severity: 'error',
        });
      }
    }
  }

  // Check for undefined references (warning only, not error)
  for (const ref of referencedXrefs) {
    if (!definedXrefs.has(ref)) {
      errors.push({
        message: `Reference to undefined XREF: @${ref}@`,
        severity: 'warning',
      });
    }
  }

  // Determine if valid (no errors, warnings are ok)
  const hasErrors = errors.some((e) => e.severity === 'error');

  return {
    valid: !hasErrors,
    errors,
    stats: {
      individuals,
      families,
      sources,
      repositories,
    },
  };
}

/**
 * Quick check if content looks like valid GEDCOM.
 * Does not do full validation.
 *
 * @param content - Content to check
 * @returns true if content appears to be GEDCOM
 */
export function isGedcom(content: string): boolean {
  const trimmed = content.trim();

  // Check for common GEDCOM indicators
  if (trimmed.startsWith('0 HEAD')) return true;
  if (trimmed.match(/^0\s+@\w+@\s+INDI/m)) return true;
  if (trimmed.match(/^0\s+@\w+@\s+FAM/m)) return true;

  return false;
}
