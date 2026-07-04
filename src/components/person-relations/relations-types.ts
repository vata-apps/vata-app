/**
 * The i18n key resolved to a sex-specific label by the page (falling back to
 * the neutral term — `sibling`, `spouse`, `child` — when sex is unrecorded).
 */
export type RelationKey =
  | 'father'
  | 'mother'
  | 'brother'
  | 'sister'
  | 'sibling'
  | 'halfBrother'
  | 'halfSister'
  | 'halfSibling'
  | 'husband'
  | 'wife'
  | 'spouse'
  | 'son'
  | 'daughter'
  | 'child';

/** One row of the Relations table: a related person plus how they relate. */
export interface RelationRow {
  /** `null` for the fixed Father/Mother slot when that parent is not recorded — not linkable. */
  id: string | null;
  name: string;
  bornYear?: number;
  deathYear?: number;
  relation: RelationKey;
  /** Which parent is shared — set only for half-sibling rows. */
  side?: 'paternal' | 'maternal';
  /** The other parent (half-siblings) or spouse (children, when there is more than one) this row is "via". */
  viaName?: string;
}
