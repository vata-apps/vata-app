import type { FamilyMember, Gender } from '$types/database';
import { getIndividualsByIds } from './individuals';
import { getPrimaryNamesForIndividuals } from './names';
import { getBirthDeathEventsForIndividuals, getFamilyEventByType } from './events';
import {
  getFamiliesOfIndividual,
  getFamilyMembers,
  getParentFamilies,
  getSpouseFamilies,
} from './families';
import { extractYear, type RelatedPerson } from './person-overview';

// =============================================================================
// Domain bundle types
//
// `getPersonRelations` returns plain domain data; resolving it to sex-specific
// relation labels and a display order is the job of the presentation layer
// (`build-relations.ts`), so this stays a clean data-layer aggregate.
// =============================================================================

/** A {@link RelatedPerson} plus the sex needed to resolve a sex-specific label. */
export interface RelatedPersonWithGender extends RelatedPerson {
  gender: Gender;
}

/**
 * One of a parent's other unions: the children they had with someone other
 * than the subject's other parent. `otherParent` is the person the shared
 * parent had these children with — `null` when that parent is not recorded.
 */
export interface HalfSiblingUnion {
  side: 'paternal' | 'maternal';
  otherParent: RelatedPersonWithGender | null;
  children: RelatedPersonWithGender[];
}

/** One of the subject's own marriages: the spouse, its children, and the marriage year for ordering. */
export interface SpouseUnion {
  spouse: RelatedPersonWithGender | null;
  marriageYear: number | null;
  children: RelatedPersonWithGender[];
}

/**
 * Everything the Relations tab reads for one individual, pre-joined: parents,
 * full siblings (same parent family), half-siblings (grouped by the parent's
 * other unions), and the subject's own spouse unions with their children.
 */
export interface PersonRelationsData {
  father: RelatedPersonWithGender | null;
  mother: RelatedPersonWithGender | null;
  fullSiblings: RelatedPersonWithGender[];
  halfSiblingUnions: HalfSiblingUnion[];
  spouseUnions: SpouseUnion[];
}

/** The husband/wife of a family who isn't `excludeId` — the "other" spouse. */
function otherSpouseId(members: FamilyMember[], excludeId: string | null): string | null {
  return (
    members.find(
      (member) =>
        (member.role === 'husband' || member.role === 'wife') && member.individualId !== excludeId
    )?.individualId ?? null
  );
}

/** The children of a family. */
function childIdsOf(members: FamilyMember[]): string[] {
  return members.filter((member) => member.role === 'child').map((member) => member.individualId);
}

/**
 * Load every direct relation of one individual in a single call: parents,
 * full siblings, half-siblings (paternal and maternal), and spouses with
 * their children.
 *
 * Full siblings are the parent family's other children. Half-siblings come
 * from each known parent's *other* families (excluding the subject's own
 * parent family) — the family's other spouse is the "other parent" the
 * half-siblings are had with. Pedigree (biological/adopted/…) does not affect
 * this classification: any child of the parent family counts as a sibling.
 */
export async function getPersonRelations(individualId: string): Promise<PersonRelationsData> {
  const [parentFamilies, spouseFamilies] = await Promise.all([
    getParentFamilies(individualId),
    getSpouseFamilies(individualId),
  ]);

  // Started immediately: it only depends on `spouseFamilies`, so it runs
  // concurrently with the parent/half-sibling chain below instead of trailing it.
  const spouseFamilyDetailsPromise = Promise.all(
    spouseFamilies.map(async (family) => {
      const [members, marriageEvent] = await Promise.all([
        getFamilyMembers(family.id),
        getFamilyEventByType(family.id, 'MARR'),
      ]);
      return { members, marriageEvent };
    })
  );

  const parentFamily = parentFamilies[0] ?? null;
  const parentMembers = parentFamily ? await getFamilyMembers(parentFamily.id) : [];

  const fatherId = parentMembers.find((member) => member.role === 'husband')?.individualId ?? null;
  const motherId = parentMembers.find((member) => member.role === 'wife')?.individualId ?? null;
  const fullSiblingIds = parentMembers
    .filter((member) => member.role === 'child' && member.individualId !== individualId)
    .map((member) => member.individualId);

  // Each known parent's other families (excluding the subject's own parent
  // family) are the source of half-siblings, tagged by which parent is shared.
  const [fatherOtherFamilies, motherOtherFamilies] = await Promise.all([
    fatherId ? getFamiliesOfIndividual(fatherId, 'husband') : Promise.resolve([]),
    motherId ? getFamiliesOfIndividual(motherId, 'wife') : Promise.resolve([]),
  ]);

  const halfSiblingSources = [
    ...fatherOtherFamilies
      .filter((family) => family.id !== parentFamily?.id)
      .map((family) => ({ side: 'paternal' as const, sharedParentId: fatherId, family })),
    ...motherOtherFamilies
      .filter((family) => family.id !== parentFamily?.id)
      .map((family) => ({ side: 'maternal' as const, sharedParentId: motherId, family })),
  ];

  const [halfSiblingFamilyMembers, spouseFamilyDetails] = await Promise.all([
    Promise.all(
      halfSiblingSources.map(async (source) => ({
        ...source,
        members: await getFamilyMembers(source.family.id),
      }))
    ),
    spouseFamilyDetailsPromise,
  ]);

  const halfSiblingUnionsRaw = halfSiblingFamilyMembers.map(
    ({ side, sharedParentId, members }) => ({
      side,
      otherParentId: otherSpouseId(members, sharedParentId),
      childIds: childIdsOf(members),
    })
  );

  const spouseUnionsRaw = spouseFamilyDetails.map(({ members, marriageEvent }) => ({
    spouseId: otherSpouseId(members, individualId),
    childIds: childIdsOf(members),
    marriageYear: extractYear(marriageEvent),
  }));

  // Batch-resolve names, sex, and birth/death years for every related individual.
  const relatedIds = [
    ...(fatherId ? [fatherId] : []),
    ...(motherId ? [motherId] : []),
    ...fullSiblingIds,
    ...halfSiblingUnionsRaw.flatMap((union) => [
      ...(union.otherParentId ? [union.otherParentId] : []),
      ...union.childIds,
    ]),
    ...spouseUnionsRaw.flatMap((union) => [
      ...(union.spouseId ? [union.spouseId] : []),
      ...union.childIds,
    ]),
  ];
  const uniqueRelatedIds = [...new Set(relatedIds)];

  const [relatedNames, relatedBirthDeath, relatedIndividuals] = await Promise.all([
    getPrimaryNamesForIndividuals(uniqueRelatedIds),
    getBirthDeathEventsForIndividuals(uniqueRelatedIds),
    getIndividualsByIds(uniqueRelatedIds),
  ]);

  const nameById = new Map(relatedNames.map((name) => [name.individualId, name]));
  const genderById = new Map(
    relatedIndividuals.map((individual) => [individual.id, individual.gender])
  );
  const birthYearById = new Map<string, number>();
  const deathYearById = new Map<string, number>();
  for (const event of relatedBirthDeath) {
    const principal = event.participants.find(
      (participant) => participant.role === 'principal' && participant.individualId !== null
    );
    if (!principal?.individualId) continue;
    const year = extractYear(event);
    if (year === null) continue;
    const target = event.eventType.tag === 'DEAT' ? deathYearById : birthYearById;
    if (!target.has(principal.individualId)) target.set(principal.individualId, year);
  }

  const toRelated = (id: string): RelatedPersonWithGender => ({
    id,
    primaryName: nameById.get(id) ?? null,
    birthYear: birthYearById.get(id) ?? null,
    deathYear: deathYearById.get(id) ?? null,
    gender: genderById.get(id) ?? 'U',
  });

  return {
    father: fatherId ? toRelated(fatherId) : null,
    mother: motherId ? toRelated(motherId) : null,
    fullSiblings: fullSiblingIds.map(toRelated),
    halfSiblingUnions: halfSiblingUnionsRaw.map((union) => ({
      side: union.side,
      otherParent: union.otherParentId ? toRelated(union.otherParentId) : null,
      children: union.childIds.map(toRelated),
    })),
    spouseUnions: spouseUnionsRaw.map((union) => ({
      spouse: union.spouseId ? toRelated(union.spouseId) : null,
      marriageYear: union.marriageYear,
      children: union.childIds.map(toRelated),
    })),
  };
}
