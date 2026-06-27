/**
 * View-model types for the pure-Radix Person Overview. These shapes are what
 * {@link buildPersonOverview} produces from live tree data and what the Radix
 * components (identity header, record rail, life spine, …) consume.
 */

export interface OverviewPerson {
  initials: string;
  name: string;
  /** Formatted entity id (e.g. "I-0003"), shown in the metadata strip. */
  id?: string;
  /** Profile photo URL; falls back to {@link initials} when absent. */
  imageUrl?: string;
  /** Sex glyph (♀ / ♂). */
  sex: string;
  /** Display-ready birth date, possibly imprecise (e.g. "14 Aug 1890"). */
  birthDate: string;
  /** Birthplace shown in the header summary. */
  birthPlace: string;
  /** Display-ready death date, possibly imprecise (e.g. "before 1955"). */
  deathDate: string;
  /** Place of death shown in the header summary. */
  deathPlace: string;
  /** Count of additional recorded names beyond the primary one. */
  otherNamesCount: number;
}

/** A recorded name for the person, e.g. a birth name or a married name. */
export interface OverviewName {
  id: string;
  /** Name-type key resolved through i18n (`birth`, `married`, `nickname`, …). */
  type: string;
  /** The full name text as recorded. */
  text: string;
  /** Marks the canonical name displayed across the app. */
  isPrimary?: boolean;
}

/**
 * The two parental slots shown in the Parents panel. Either may be absent when
 * that parent is not yet recorded in the tree.
 */
export interface OverviewParents {
  father?: PersonRefData;
  mother?: PersonRefData;
}

/**
 * A reference to a person shown elsewhere in the app (parents, children,
 * spouses, …). The shared shape consumed by the `PersonRef` component.
 */
export interface PersonRefData {
  /** Stable id of the referenced individual (e.g. `I-0001`). */
  id: string;
  initials: string;
  name: string;
  /** Profile photo URL; falls back to {@link initials} when absent. */
  imageUrl?: string;
  bornYear?: number;
  deathYear?: number;
}

type MilestoneKind = 'born' | 'marriage' | 'death';

export interface OverviewMilestone {
  id: string;
  /**
   * Display-ready date, which may be imprecise: a full date (`12 Mar 1890`), a
   * partial one (`Mar 1890`, `1890`), approximate (`c. 1890`), or qualified
   * (`before 1955`). Rendered verbatim — genealogical dates are rarely exact.
   */
  date: string;
  /** Numeric year used only for ordering the milestones. */
  sortYear: number;
  kind: MilestoneKind;
  place: string;
  detail: string;
  /** The spouse, for `marriage` milestones. */
  spouse?: PersonRefData;
  children?: PersonRefData[];
}

export interface OverviewMediaTile {
  id: string;
  /** Thumbnail image URL. */
  imageUrl: string;
  /** Caption key resolved through `overview.media.captions.*`. */
  caption: string;
}
