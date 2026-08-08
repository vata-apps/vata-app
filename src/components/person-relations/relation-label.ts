import type { Gender } from '$types/database';

/**
 * The i18n key resolved to a sex-specific label by the page (falling back to
 * the neutral term — `sibling`, `spouse`, `child` — when sex is unrecorded).
 * Resolved under the `relations.labels.*` namespace.
 */
export type RelationLabelKey =
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

function bySex<M extends RelationLabelKey, F extends RelationLabelKey, U extends RelationLabelKey>(
  gender: Gender,
  labels: { male: M; female: F; unknown: U }
): M | F | U {
  if (gender === 'M') return labels.male;
  if (gender === 'F') return labels.female;
  return labels.unknown;
}

/** A sibling's label — "half" once their row comes from a family other than the subject's own parent family. */
export function siblingLabel(
  sibling: { gender: Gender; familyId: string },
  parentFamilyId: string | null
): RelationLabelKey {
  if (sibling.familyId !== parentFamilyId) {
    return bySex(sibling.gender, {
      male: 'halfBrother',
      female: 'halfSister',
      unknown: 'halfSibling',
    });
  }
  return bySex(sibling.gender, { male: 'brother', female: 'sister', unknown: 'sibling' });
}

export function spouseLabel(gender: Gender): RelationLabelKey {
  return bySex(gender, { male: 'husband', female: 'wife', unknown: 'spouse' });
}

export function childLabel(gender: Gender): RelationLabelKey {
  return bySex(gender, { male: 'son', female: 'daughter', unknown: 'child' });
}
