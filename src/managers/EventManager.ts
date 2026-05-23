import { getAllEventsWithDetails } from '$db-tree/events';
import { getSpousesForFamilies } from '$db-tree/families';
import { getPrimaryNamesForIndividuals } from '$db-tree/names';
import type { EventListEntry, EventPrincipal, Name } from '$types/database';

export class EventManager {
  /**
   * Get every event in the tree as EventListEntry[], ordered date ascending
   * (NULL dateSort last), with a deterministic id tiebreaker.
   *
   * Constant number of queries regardless of event count:
   * 1. All events + event types + places + participants (via getAllEventsWithDetails).
   * 2. Primary names for every distinct individual_id that is a principal participant.
   * 3. Husband/wife individual_ids for every distinct family_id that is a principal
   *    participant (one query per chunk).
   * 4. Primary names for those spouse individuals.
   */
  static async getAll(): Promise<EventListEntry[]> {
    const events = await getAllEventsWithDetails();
    if (events.length === 0) return [];

    // Collect all distinct individual and family principal participant IDs.
    const principalIndividualIds = new Set<string>();
    const principalFamilyIds = new Set<string>();
    for (const event of events) {
      for (const p of event.participants) {
        if (p.role !== 'principal') continue;
        if (p.individualId !== null) principalIndividualIds.add(p.individualId);
        if (p.familyId !== null) principalFamilyIds.add(p.familyId);
      }
    }

    // Fetch primary names for individual principals.
    const individualNames = await getPrimaryNamesForIndividuals(Array.from(principalIndividualIds));
    const nameByIndividualId = new Map<string, Name>();
    for (const name of individualNames) {
      nameByIndividualId.set(name.individualId, name);
    }

    // Fetch husband/wife individual IDs for family principals.
    const spouseRows = await getSpousesForFamilies(Array.from(principalFamilyIds));
    const spousesByFamilyId = new Map<
      string,
      { husbandId: string | null; wifeId: string | null }
    >();
    for (const row of spouseRows) {
      spousesByFamilyId.set(row.familyId, { husbandId: row.husbandId, wifeId: row.wifeId });
    }

    // Collect spouse individual IDs and fetch their primary names.
    const spouseIndividualIds = new Set<string>();
    for (const { husbandId, wifeId } of spousesByFamilyId.values()) {
      if (husbandId) spouseIndividualIds.add(husbandId);
      if (wifeId) spouseIndividualIds.add(wifeId);
    }
    if (spouseIndividualIds.size > 0) {
      const spouseNames = await getPrimaryNamesForIndividuals(Array.from(spouseIndividualIds));
      for (const name of spouseNames) {
        nameByIndividualId.set(name.individualId, name);
      }
    }

    // Assemble EventListEntry from the pre-fetched maps.
    return events.map((event) => {
      const principals: EventPrincipal[] = [];
      for (const p of event.participants) {
        if (p.role !== 'principal') continue;

        if (p.individualId !== null) {
          principals.push({
            kind: 'individual',
            name: nameByIndividualId.get(p.individualId) ?? null,
          });
        } else if (p.familyId !== null) {
          const spouses = spousesByFamilyId.get(p.familyId);
          principals.push({
            kind: 'family',
            husband: spouses?.husbandId
              ? (nameByIndividualId.get(spouses.husbandId) ?? null)
              : null,
            wife: spouses?.wifeId ? (nameByIndividualId.get(spouses.wifeId) ?? null) : null,
          });
        }
      }

      return { ...event, principals };
    });
  }
}
