import type { Gender } from '$types/database';
import { getIndividualsByIds } from './individuals';
import { getPrimaryNamesForIndividuals } from './names';
import { getBirthDeathEventsForIndividuals } from './events';
import { getFamilyMembers, getParentFamilies } from './families';
import { buildYearMaps, type RelatedPerson } from './person-overview';

/** A {@link RelatedPerson} plus the sex the chart uses for its neutral fallback avatar. */
export interface AncestorPerson extends RelatedPerson {
  gender: Gender;
}

/** One slot in the ancestors skeleton — `null` when that ancestor isn't recorded. */
export type AncestorSlot = AncestorPerson | null;

/**
 * A fixed-depth, single-lineage ancestor tree: `generations[0]` is the subject
 * (one slot), `generations[1]` their father/mother, `generations[2]` their
 * four grandparents, and so on — each generation is twice as wide as the last.
 * The skeleton is always the full `2^depth` width; a `null` slot marks an
 * ancestor that isn't recorded.
 */
export interface AncestorTree {
  generations: AncestorSlot[][];
}

/**
 * The father/mother ids of one individual's first parent Family — matching the
 * single lineage the Overview's own "Parents" section follows. `null` for a
 * parent that isn't recorded, or for both when there's no parent Family at all.
 */
async function parentIdsOf(individualId: string): Promise<[string | null, string | null]> {
  const parentFamilies = await getParentFamilies(individualId);
  const parentFamily = parentFamilies[0];
  if (!parentFamily) return [null, null];

  const members = await getFamilyMembers(parentFamily.id);
  const fatherId = members.find((member) => member.role === 'husband')?.individualId ?? null;
  const motherId = members.find((member) => member.role === 'wife')?.individualId ?? null;
  return [fatherId, motherId];
}

/**
 * Load a fixed-depth ancestor tree for one individual, walking the first
 * parent Family at each step. Defaults to 4 generations (the subject plus 3
 * levels of ancestors, 15 slots). A `null` slot's own parents are never
 * fetched — there's nothing to walk from an ancestor that isn't recorded, so
 * each generation only ever queries as many families as the previous
 * generation resolved.
 */
export async function getAncestors(individualId: string, generations = 4): Promise<AncestorTree> {
  const idGenerations: (string | null)[][] = [[individualId]];

  for (let depth = 1; depth < generations; depth++) {
    const previous = idGenerations[depth - 1];
    const pairs = await Promise.all(
      previous.map((id) => (id ? parentIdsOf(id) : Promise.resolve([null, null] as const)))
    );
    idGenerations.push(pairs.flat());
  }

  const uniqueIds = [...new Set(idGenerations.flat().filter((id): id is string => id !== null))];

  const [names, individuals, birthDeath] = await Promise.all([
    getPrimaryNamesForIndividuals(uniqueIds),
    getIndividualsByIds(uniqueIds),
    getBirthDeathEventsForIndividuals(uniqueIds),
  ]);

  const nameById = new Map(names.map((name) => [name.individualId, name]));
  const genderById = new Map(individuals.map((individual) => [individual.id, individual.gender]));
  const { birthYearById, deathYearById } = buildYearMaps(birthDeath);

  const toAncestor = (id: string): AncestorPerson => ({
    id,
    primaryName: nameById.get(id) ?? null,
    birthYear: birthYearById.get(id) ?? null,
    deathYear: deathYearById.get(id) ?? null,
    gender: genderById.get(id) ?? 'U',
  });

  return {
    generations: idGenerations.map((level) => level.map((id) => (id ? toAncestor(id) : null))),
  };
}
