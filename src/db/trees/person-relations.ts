import type { FamilyMember, Gender, Pedigree } from '$types/database';
import { getIndividualsByIds } from './individuals';
import { getPrimaryNamesForIndividuals } from './names';
import { getBirthDeathEventsForIndividuals, getFamilyEventByType } from './events';
import {
  getFamiliesOfIndividual,
  getFamilyMembers,
  getParentFamilies,
  getSpouseFamilies,
} from './families';
import { buildYearMaps, extractYear, type RelatedPerson } from './person-overview';

// =============================================================================
// Domain bundle types
//
// `getPersonRelations` returns plain domain data; resolving it into the
// Relations tab's cards (Parents / Fratrie / one per union) is the job of the
// presentation layer (`build-relations.ts`), so this stays a clean data-layer
// aggregate.
//
// Every relation the tab can edit is backed by a real `family_members` row —
// there is no separate "relation" entity. A sibling, spouse, or child row
// carries *that person's own* row (their `id`/`nature`/`certainty`/`note`).
// A father/mother row is different: both point at the *subject's own* row in
// their parent family (`parentMembership`), because that is the one row that
// actually describes how the subject belongs to that family — editing
// "nature" from either the Father or the Mother row changes the same
// underlying fact and is expected to show the same value on both.
// =============================================================================

/** A {@link RelatedPerson} plus the sex needed to resolve a sex-specific label. */
export interface RelatedPersonWithGender extends RelatedPerson {
  gender: Gender;
}

/** The Relations tab's editable per-membership metadata, lifted from a `family_members` row. */
export interface RelationDetails extends Pick<FamilyMember, 'nature' | 'certainty' | 'note'> {
  /** The `family_members.id` this metadata lives on — the target of an edit. */
  memberId: string;
  /** The family this membership belongs to — sources are scoped at this level (see `getCitationsForFamily`). */
  familyId: string;
}

/** A related person (sibling, spouse, or child) together with their own editable membership. */
export interface RelationMember extends RelatedPersonWithGender, RelationDetails {
  /** Which shared parent connects a half-sibling to the subject — `null` for a full sibling, spouse, or child. */
  side: 'paternal' | 'maternal' | null;
}

/** One of the subject's own marriages: the spouse, its children, and the marriage year for ordering. */
export interface SpouseUnion {
  familyId: string;
  spouse: RelationMember | null;
  marriageYear: number | null;
  children: RelationMember[];
}

/**
 * A parent family beyond the individual's primary one (`parentFamilyId`) —
 * only possible from GEDCOM import, where a `PEDI`-tagged second `FAMC`
 * records e.g. an adoption alongside the birth family (see issue #246).
 * Read-only: no write path in the app creates a second parent family, so
 * this tab has nothing to offer beyond surfacing that it exists.
 */
export interface AdditionalParentFamily {
  familyId: string;
  /** How the subject relates to this family, if recorded (e.g. "adopted"). */
  pedigree: Pedigree | null;
  father: RelatedPersonWithGender | null;
  mother: RelatedPersonWithGender | null;
}

/**
 * Everything the Relations tab reads for one individual, pre-joined: parents
 * (plus the subject's own parent-family membership, edited from either
 * parent row), siblings (full and half, flattened — which family a sibling
 * comes from is carried on their own row), and the subject's own spouse
 * unions with their children.
 */
export interface PersonRelationsData {
  parentFamilyId: string | null;
  /** The subject's own row in their parent family — `null` when no parent family exists yet. */
  parentMembership: RelationDetails | null;
  father: RelatedPersonWithGender | null;
  mother: RelatedPersonWithGender | null;
  siblings: RelationMember[];
  spouseUnions: SpouseUnion[];
  /** Parent families beyond `parentFamilyId` — see {@link AdditionalParentFamily}. */
  additionalParentFamilies: AdditionalParentFamily[];
}

function toRelationDetails(member: FamilyMember): RelationDetails {
  return {
    memberId: member.id,
    familyId: member.familyId,
    nature: member.nature,
    certainty: member.certainty,
    note: member.note,
  };
}

/** The husband/wife member of a family who isn't `excludeId` — the "other" spouse. */
function otherSpouseMember(members: FamilyMember[], excludeId: string | null): FamilyMember | null {
  return (
    members.find(
      (member) =>
        (member.role === 'husband' || member.role === 'wife') && member.individualId !== excludeId
    ) ?? null
  );
}

/** The child members of a family. */
function childMembersOf(members: FamilyMember[]): FamilyMember[] {
  return members.filter((member) => member.role === 'child');
}

/** A parent family's father, mother, and the subject's own child-row in it. */
function parentFamilyRoles(
  members: FamilyMember[],
  individualId: string
): { father: FamilyMember | null; mother: FamilyMember | null; subject: FamilyMember | null } {
  return {
    father: members.find((member) => member.role === 'husband') ?? null,
    mother: members.find((member) => member.role === 'wife') ?? null,
    subject:
      members.find((member) => member.role === 'child' && member.individualId === individualId) ??
      null,
  };
}

/**
 * Load every direct relation of one individual in a single call: parents
 * (with the subject's own parent-family membership), full and half siblings,
 * and spouse unions with their children.
 *
 * Full siblings are the parent family's other children. Half-siblings come
 * from each known parent's *other* families (excluding the subject's own
 * parent family) — the family's other spouse is the "other parent" they
 * share. Siblings and every write path (`FamilyManager.setParent`/
 * `removeParent`) key off a single primary parent family
 * (`parentFamilies[0]`); any further ones are surfaced read-only via
 * `additionalParentFamilies` — see its doc comment.
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
      return { familyId: family.id, members, marriageEvent };
    })
  );

  // Any parent family beyond the first — only possible from a GEDCOM import
  // with a second PEDI-tagged FAMC (see `AdditionalParentFamily`'s doc
  // comment). Started immediately alongside the rest of the parent chain.
  const additionalParentFamilyMembersPromise = Promise.all(
    parentFamilies.slice(1).map(async (family) => ({
      familyId: family.id,
      members: await getFamilyMembers(family.id),
    }))
  );

  const parentFamily = parentFamilies[0] ?? null;
  const parentMembers = parentFamily ? await getFamilyMembers(parentFamily.id) : [];

  const {
    father: fatherMember,
    mother: motherMember,
    subject: subjectMember,
  } = parentFamilyRoles(parentMembers, individualId);
  const fullSiblingMembers = parentMembers.filter(
    (member) => member.role === 'child' && member.individualId !== individualId
  );

  // Each known parent's other families (excluding the subject's own parent
  // family) are the source of half-siblings, tagged by which parent is
  // shared — paternal takes precedence in the unlikely case a family shows
  // up under both (father and mother remarried each other elsewhere).
  const [fatherOtherFamilies, motherOtherFamilies] = await Promise.all([
    fatherMember
      ? getFamiliesOfIndividual(fatherMember.individualId, 'husband')
      : Promise.resolve([]),
    motherMember ? getFamiliesOfIndividual(motherMember.individualId, 'wife') : Promise.resolve([]),
  ]);

  const sideByHalfSiblingFamilyId = new Map<string, 'paternal' | 'maternal'>();
  for (const family of fatherOtherFamilies) {
    if (family.id !== parentFamily?.id) sideByHalfSiblingFamilyId.set(family.id, 'paternal');
  }
  for (const family of motherOtherFamilies) {
    if (family.id !== parentFamily?.id && !sideByHalfSiblingFamilyId.has(family.id)) {
      sideByHalfSiblingFamilyId.set(family.id, 'maternal');
    }
  }

  const [halfSiblingFamilyMembers, spouseFamilyDetails, additionalParentFamilyMembers] =
    await Promise.all([
      Promise.all(
        [...sideByHalfSiblingFamilyId].map(async ([familyId, side]) => ({
          side,
          members: await getFamilyMembers(familyId),
        }))
      ),
      spouseFamilyDetailsPromise,
      additionalParentFamilyMembersPromise,
    ]);

  const halfSiblingMembers = halfSiblingFamilyMembers.flatMap(({ members, side }) =>
    childMembersOf(members).map((member) => ({ member, side }))
  );

  const spouseUnionsRaw = spouseFamilyDetails.map(({ familyId, members, marriageEvent }) => ({
    familyId,
    spouseMember: otherSpouseMember(members, individualId),
    childMembers: childMembersOf(members),
    marriageYear: extractYear(marriageEvent),
  }));

  const additionalParentFamilyRoles = additionalParentFamilyMembers.map(({ familyId, members }) => {
    const { father, mother, subject } = parentFamilyRoles(members, individualId);
    return { familyId, father, mother, pedigree: subject?.pedigree ?? null };
  });

  // Batch-resolve names, sex, and birth/death years for every related individual.
  const relatedIds = [
    ...(fatherMember ? [fatherMember.individualId] : []),
    ...(motherMember ? [motherMember.individualId] : []),
    ...fullSiblingMembers.map((m) => m.individualId),
    ...halfSiblingMembers.map(({ member }) => member.individualId),
    ...spouseUnionsRaw.flatMap((union) => [
      ...(union.spouseMember ? [union.spouseMember.individualId] : []),
      ...union.childMembers.map((m) => m.individualId),
    ]),
    ...additionalParentFamilyRoles.flatMap(({ father, mother }) => [
      ...(father ? [father.individualId] : []),
      ...(mother ? [mother.individualId] : []),
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
  const { birthYearById, deathYearById } = buildYearMaps(relatedBirthDeath);

  const toRelated = (id: string): RelatedPersonWithGender => ({
    id,
    primaryName: nameById.get(id) ?? null,
    birthYear: birthYearById.get(id) ?? null,
    deathYear: deathYearById.get(id) ?? null,
    gender: genderById.get(id) ?? 'U',
  });

  const toRelationMember = (
    member: FamilyMember,
    side: 'paternal' | 'maternal' | null = null
  ): RelationMember => ({
    ...toRelated(member.individualId),
    ...toRelationDetails(member),
    side,
  });

  return {
    parentFamilyId: parentFamily?.id ?? null,
    parentMembership: subjectMember ? toRelationDetails(subjectMember) : null,
    father: fatherMember ? toRelated(fatherMember.individualId) : null,
    mother: motherMember ? toRelated(motherMember.individualId) : null,
    siblings: [
      ...fullSiblingMembers.map((member) => toRelationMember(member)),
      ...halfSiblingMembers.map(({ member, side }) => toRelationMember(member, side)),
    ],
    spouseUnions: spouseUnionsRaw.map((union) => ({
      familyId: union.familyId,
      spouse: union.spouseMember ? toRelationMember(union.spouseMember) : null,
      marriageYear: union.marriageYear,
      children: union.childMembers.map((member) => toRelationMember(member)),
    })),
    additionalParentFamilies: additionalParentFamilyRoles.map(
      ({ familyId, father, mother, pedigree }) => ({
        familyId,
        pedigree,
        father: father ? toRelated(father.individualId) : null,
        mother: mother ? toRelated(mother.individualId) : null,
      })
    ),
  };
}
