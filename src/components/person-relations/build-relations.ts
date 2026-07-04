import { formatName } from '$db-tree/names';
import type { PersonRelationsData, RelatedPersonWithGender } from '$db-tree/person-relations';
import type { RelationRow } from './relations-types';

/** Resolves a sex-specific relation key, falling back to `labels.unknown` when sex is unrecorded. */
function bySex<M extends string, F extends string, U extends string>(
  person: RelatedPersonWithGender,
  labels: { male: M; female: F; unknown: U }
): M | F | U {
  if (person.gender === 'M') return labels.male;
  if (person.gender === 'F') return labels.female;
  return labels.unknown;
}

function toRow(
  related: RelatedPersonWithGender,
  relation: RelationRow['relation'],
  extra: Pick<RelationRow, 'side' | 'viaName'> = {}
): RelationRow {
  return {
    id: related.id,
    name: formatName(related.primaryName).full,
    bornYear: related.birthYear ?? undefined,
    deathYear: related.deathYear ?? undefined,
    relation,
    ...extra,
  };
}

/** The fixed Father/Mother slot when that parent is not recorded — not linkable. */
function missingParentRow(relation: 'father' | 'mother'): RelationRow {
  return { id: null, name: '', relation };
}

/**
 * Shape the pre-joined {@link PersonRelationsData} into the flat, ordered rows
 * the Relations tab's table renders. Pure: no i18n — relation keys are
 * resolved to sex-specific labels by the page.
 *
 * Row order is the table's default order: Parents, then Siblings, then
 * Half-siblings (paternal before maternal), then Spouses (chronological by
 * marriage year), then Children (grouped by spouse union in that same
 * chronological order). Each "Children" row carries a `via` spouse name only
 * when the subject has more than one spouse union — with a single union it
 * would be redundant.
 *
 * Father and Mother are fixed slots and always present, even when that parent
 * is not recorded (as an unlinkable placeholder row) — every other group is
 * variable-count and simply has no rows when empty.
 */
export function buildPersonRelations(data: PersonRelationsData): RelationRow[] {
  const { father, mother, fullSiblings, halfSiblingUnions, spouseUnions } = data;

  const parentRows: RelationRow[] = [
    father ? toRow(father, 'father') : missingParentRow('father'),
    mother ? toRow(mother, 'mother') : missingParentRow('mother'),
  ];

  const siblingRows: RelationRow[] = fullSiblings.map((sibling) =>
    toRow(sibling, bySex(sibling, { male: 'brother', female: 'sister', unknown: 'sibling' }))
  );

  const halfSiblingRows: RelationRow[] = halfSiblingUnions.flatMap((union) =>
    union.children.map((child) =>
      toRow(
        child,
        bySex(child, { male: 'halfBrother', female: 'halfSister', unknown: 'halfSibling' }),
        {
          side: union.side,
          viaName: union.otherParent ? formatName(union.otherParent.primaryName).full : undefined,
        }
      )
    )
  );

  const orderedSpouseUnions = [...spouseUnions].sort(
    (a, b) => (a.marriageYear ?? 0) - (b.marriageYear ?? 0)
  );

  const spouseRows: RelationRow[] = orderedSpouseUnions.flatMap((union) =>
    union.spouse
      ? [
          toRow(
            union.spouse,
            bySex(union.spouse, { male: 'husband', female: 'wife', unknown: 'spouse' })
          ),
        ]
      : []
  );

  const childRows: RelationRow[] = orderedSpouseUnions.flatMap((union) =>
    union.children.map((child) =>
      toRow(child, bySex(child, { male: 'son', female: 'daughter', unknown: 'child' }), {
        viaName:
          orderedSpouseUnions.length > 1 && union.spouse
            ? formatName(union.spouse.primaryName).full
            : undefined,
      })
    )
  );

  return [...parentRows, ...siblingRows, ...halfSiblingRows, ...spouseRows, ...childRows];
}
