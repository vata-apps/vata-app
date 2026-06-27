import type {
  Event,
  EventTimelineEntry,
  EventWithDetails,
  Individual,
  Name,
} from '$types/database';
import { getIndividualById } from './individuals';
import { getNamesByIndividualId, getPrimaryNamesForIndividuals } from './names';
import { getBirthDeathEventsForIndividuals, getFamilyEventByType } from './events';
import { getEventTimelineForIndividual } from './event-timeline';
import { getFamilyMembers, getParentFamilies, getSpouseFamilies } from './families';

// =============================================================================
// Domain bundle types
//
// `getPersonOverview` returns plain domain types (Individual / Name /
// EventWithDetails). Shaping these into the Person Overview view-model is the
// job of the presentation layer (`build-overview.ts`), so this stays a clean
// data-layer aggregate with no UI concerns.
// =============================================================================

/**
 * A related individual (parent, spouse, or child) reduced to what the overview
 * needs: their id, primary name, and birth/death years for the inline dates.
 */
export interface RelatedPerson {
  id: string;
  primaryName: Name | null;
  birthYear: number | null;
  deathYear: number | null;
}

/** One marriage of the subject: the spouse, the marriage event, the children. */
export interface MarriageRecord {
  familyId: string;
  spouse: RelatedPerson | null;
  marriageEvent: EventWithDetails | null;
  children: RelatedPerson[];
}

/**
 * Everything the Person Overview page reads for one individual, pre-joined:
 * the person, their names, birth/death events, parents, and marriages (each
 * with spouse + children). Research notes, suggestions and the places map are
 * deliberately absent — they have no data model yet.
 */
export interface PersonOverviewData {
  individual: Individual;
  names: Name[];
  primaryName: Name | null;
  birthEvent: EventWithDetails | null;
  deathEvent: EventWithDetails | null;
  /**
   * The person's own (principal) events, enriched with citation presence —
   * used for places lived and the sourced vitals.
   */
  events: EventTimelineEntry[];
  father: RelatedPerson | null;
  mother: RelatedPerson | null;
  marriages: MarriageRecord[];
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Extract a 4-digit year from an event for ordering and inline dates. Prefers
 * the sortable date, falling back to the verbatim original date. Genealogical
 * dates are often imprecise, so a missing or year-less date yields `null`.
 */
export function extractYear(event: Pick<Event, 'dateSort' | 'dateOriginal'> | null): number | null {
  for (const value of [event?.dateSort, event?.dateOriginal]) {
    const match = value?.match(/\d{4}/);
    if (match) return Number(match[0]);
  }
  return null;
}

// =============================================================================
// Aggregate query
// =============================================================================

/**
 * Load the full Person Overview data set for one individual in a single call.
 * Returns `null` when the individual does not exist.
 *
 * Relations (parents, spouses, children) are resolved to {@link RelatedPerson}
 * using two batched lookups — primary names and birth/death events — so the
 * number of queries stays bounded regardless of how many children a person has.
 */
export async function getPersonOverview(individualId: string): Promise<PersonOverviewData | null> {
  const individual = await getIndividualById(individualId);
  if (!individual) return null;

  const names = await getNamesByIndividualId(individualId);
  const primaryName = names.find((name) => name.isPrimary) ?? names[0] ?? null;

  // The person's own events — those where they are a `principal` participant.
  const allEvents = await getEventTimelineForIndividual(individualId);
  const events = allEvents.filter((event) =>
    event.participants.some(
      (participant) => participant.role === 'principal' && participant.individualId === individualId
    )
  );
  const birthEvent = events.find((event) => event.eventType.tag === 'BIRT') ?? null;
  const deathEvent = events.find((event) => event.eventType.tag === 'DEAT') ?? null;

  // Parents — the husband/wife of the first family the person is a child of.
  const parentFamilies = await getParentFamilies(individualId);
  let fatherId: string | null = null;
  let motherId: string | null = null;
  if (parentFamilies[0]) {
    const members = await getFamilyMembers(parentFamilies[0].id);
    fatherId = members.find((member) => member.role === 'husband')?.individualId ?? null;
    motherId = members.find((member) => member.role === 'wife')?.individualId ?? null;
  }

  // Marriages — every family where the person is a spouse, with the other
  // spouse and the children.
  const spouseFamilies = await getSpouseFamilies(individualId);
  const marriagesRaw: { familyId: string; spouseId: string | null; childIds: string[] }[] = [];
  const marriageEvents: (EventWithDetails | null)[] = [];
  for (const family of spouseFamilies) {
    const members = await getFamilyMembers(family.id);
    const spouseId =
      members.find(
        (member) =>
          (member.role === 'husband' || member.role === 'wife') &&
          member.individualId !== individualId
      )?.individualId ?? null;
    const childIds = members
      .filter((member) => member.role === 'child')
      .map((member) => member.individualId);
    marriagesRaw.push({ familyId: family.id, spouseId, childIds });
    marriageEvents.push(await getFamilyEventByType(family.id, 'MARR'));
  }

  // Batch-resolve names and birth/death years for every related individual.
  const relatedIds = [
    ...(fatherId ? [fatherId] : []),
    ...(motherId ? [motherId] : []),
    ...marriagesRaw.flatMap((marriage) => [
      ...(marriage.spouseId ? [marriage.spouseId] : []),
      ...marriage.childIds,
    ]),
  ];
  const uniqueRelatedIds = [...new Set(relatedIds)];

  const relatedNames = await getPrimaryNamesForIndividuals(uniqueRelatedIds);
  const relatedBirthDeath = await getBirthDeathEventsForIndividuals(uniqueRelatedIds);

  const nameById = new Map(relatedNames.map((name) => [name.individualId, name]));
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

  const toRelated = (id: string): RelatedPerson => ({
    id,
    primaryName: nameById.get(id) ?? null,
    birthYear: birthYearById.get(id) ?? null,
    deathYear: deathYearById.get(id) ?? null,
  });

  const marriages: MarriageRecord[] = marriagesRaw.map((marriage, index) => ({
    familyId: marriage.familyId,
    spouse: marriage.spouseId ? toRelated(marriage.spouseId) : null,
    marriageEvent: marriageEvents[index],
    children: marriage.childIds.map(toRelated),
  }));

  return {
    individual,
    names,
    primaryName,
    birthEvent,
    deathEvent,
    events,
    father: fatherId ? toRelated(fatherId) : null,
    mother: motherId ? toRelated(motherId) : null,
    marriages,
  };
}
