import type {
  RelationCertainty,
  RelationNature,
  UpdateFamilyMemberDetailsInput,
} from '$types/database';
import type { RelationDetails } from '$db-tree/person-relations';

/**
 * The editable shape of one relation's metadata: nature, certainty, and a
 * free-text note. `''` stands in for "unset" so the Select controls stay
 * controlled — {@link toRelationDetailsPayload} maps it back to `null` at the
 * DB boundary.
 */
export interface RelationDetailsForm {
  nature: RelationNature | '';
  certainty: RelationCertainty | '';
  note: string;
}

export function toRelationDetailsForm(
  details: Pick<RelationDetails, 'nature' | 'certainty' | 'note'>
): RelationDetailsForm {
  return {
    nature: details.nature ?? '',
    certainty: details.certainty ?? '',
    note: details.note ?? '',
  };
}

export function toRelationDetailsPayload(
  form: RelationDetailsForm
): UpdateFamilyMemberDetailsInput {
  return {
    nature: form.nature || null,
    certainty: form.certainty || null,
    note: form.note.trim() || null,
  };
}

/** Whether two states of the same record would persist identically. */
export function isSameRelationDetailsForm(a: RelationDetailsForm, b: RelationDetailsForm): boolean {
  return a.nature === b.nature && a.certainty === b.certainty && a.note.trim() === b.note.trim();
}

/** `nature` values that make sense for a parent/sibling/child (a `child`-role membership) — a spouse can't be "biological". */
export const CHILD_NATURE_OPTIONS: RelationNature[] = [
  'biological',
  'adoption',
  'acknowledgment',
  'step_parent',
  'guardian',
];

/** `nature` values that make sense for a spouse (a `husband`/`wife`-role membership). */
export const SPOUSE_NATURE_OPTIONS: RelationNature[] = ['marriage', 'common_law'];

export const CERTAINTY_OPTIONS: RelationCertainty[] = [
  'confirmed',
  'probable',
  'to_verify',
  'disputed',
];
