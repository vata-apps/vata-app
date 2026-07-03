import type { EventWithDetails, Family, ParticipantRole } from '$types/database';
import { getEventsByIndividualIdWithDetails, getEventsByFamilyIdWithDetails } from './events';
import { getSpouseFamilies, getSpousesForFamilies } from './families';
import { getPrimaryNamesForIndividuals, formatNameSimple } from './names';

// =============================================================================
// Person events view-model
//
// The Events tab of a person shows every event connected to that individual,
// across the two ways an event attaches to a person (see CONTEXT.md): events
// where they are a direct participant (`individual_id`), and events attached to
// a Family they are a spouse of (`family_id`, e.g. a marriage). Each entry is
// tagged with a `scope` so the tab can offer a graduated filter.
// =============================================================================

/**
 * How a person relates to one of their events, driving the tab's scope filter:
 * - `principal` — their own vital events (birth, death, census, …).
 * - `union` — events of a Family they are a spouse of (marriage, divorce, …).
 * - `secondary` — events where they play a non-principal role in someone else's
 *   record (witness, officiant, godparent, …).
 */
export type PersonEventScope = 'principal' | 'union' | 'secondary';

/**
 * An event as shown on a person's Events tab: the full event details plus how
 * the person relates to it. `role` carries the participant role for `secondary`
 * events; `counterpartyName` carries the spouse's display name for `union`
 * events. Both are `null` when not applicable.
 */
export interface PersonEventEntry extends EventWithDetails {
  scope: PersonEventScope;
  role: ParticipantRole | null;
  counterpartyName: string | null;
}

/**
 * Sort entries chronologically ascending by their sortable date, pushing
 * undated events to the end. Genealogical dates are often imprecise, so entries
 * without a `dateSort` cannot be ordered and trail the dated ones.
 */
function byDateAscUndatedLast(a: PersonEventEntry, b: PersonEventEntry): number {
  const aKey = a.dateSort ?? '';
  const bKey = b.dateSort ?? '';
  if (aKey === bKey) return 0;
  if (aKey === '') return 1;
  if (bKey === '') return -1;
  return aKey < bKey ? -1 : 1;
}

/**
 * Resolve each spouse-family's events and the other spouse's id in a bounded
 * number of queries: one batched spouse lookup for all families plus one event
 * fetch per family (run concurrently).
 */
async function resolveFamilyEvents(
  spouseFamilies: Family[],
  individualId: string
): Promise<{ events: EventWithDetails[]; spouseId: string | null }[]> {
  if (spouseFamilies.length === 0) return [];
  const familyIds = spouseFamilies.map((family) => family.id);
  const [spouses, eventsPerFamily] = await Promise.all([
    getSpousesForFamilies(familyIds),
    Promise.all(familyIds.map((familyId) => getEventsByFamilyIdWithDetails(familyId))),
  ]);
  const spouseIdByFamily = new Map(
    spouses.map((spouse) => [
      spouse.familyId,
      spouse.husbandId === individualId ? spouse.wifeId : spouse.husbandId,
    ])
  );
  return familyIds.map((familyId, index) => ({
    events: eventsPerFamily[index],
    spouseId: spouseIdByFamily.get(familyId) ?? null,
  }));
}

/**
 * Get every event connected to one individual for their Events tab, tagged by
 * {@link PersonEventScope}. Direct-participant events are classified `principal`
 * (they are the principal) or `secondary` (any other role); each spouse-family's
 * events are added as `union`, carrying the other spouse's name. Entries are
 * deduplicated by event id and returned chronologically, undated events last.
 */
export async function getPersonEvents(individualId: string): Promise<PersonEventEntry[]> {
  // Own events and spouse-family events are independent apart from needing the
  // spouse-family ids, so resolve both expensive phases concurrently.
  const spouseFamiliesPromise = getSpouseFamilies(individualId);
  const [ownEvents, families] = await Promise.all([
    getEventsByIndividualIdWithDetails(individualId),
    spouseFamiliesPromise.then((spouseFamilies) =>
      resolveFamilyEvents(spouseFamilies, individualId)
    ),
  ]);

  // Index entries by event id so a spouse-family event can reconcile with one
  // that direct participation already added (an event can be both).
  const entriesById = new Map<string, PersonEventEntry>();

  // Direct-participant events: principal role → `principal`, any other → `secondary`.
  for (const event of ownEvents) {
    const roles = event.participants
      .filter((participant) => participant.individualId === individualId)
      .map((participant) => participant.role);
    if (roles.length === 0) continue; // defensive: the join guarantees a match
    const isPrincipal = roles.includes('principal');
    entriesById.set(event.id, {
      ...event,
      scope: isPrincipal ? 'principal' : 'secondary',
      role: isPrincipal ? 'principal' : roles[0],
      counterpartyName: null,
    });
  }

  // Batch-resolve every spouse's primary name in one lookup.
  const spouseIds = [
    ...new Set(families.map((family) => family.spouseId).filter((id): id is string => id !== null)),
  ];
  const spouseNames = spouseIds.length > 0 ? await getPrimaryNamesForIndividuals(spouseIds) : [];
  const nameById = new Map(spouseNames.map((name) => [name.individualId, formatNameSimple(name)]));

  for (const { events, spouseId } of families) {
    const counterpartyName = spouseId ? (nameById.get(spouseId) ?? null) : null;
    for (const event of events) {
      const existing = entriesById.get(event.id);
      if (existing) {
        // A family-linked event is a union for this person regardless of any
        // incidental participant role, so promote a `secondary` classification
        // (and carry the spouse). A `principal` classification is left as-is.
        if (existing.scope === 'secondary') {
          existing.scope = 'union';
          existing.role = null;
          existing.counterpartyName = counterpartyName;
        }
        continue;
      }
      entriesById.set(event.id, { ...event, scope: 'union', role: null, counterpartyName });
    }
  }

  const entries = [...entriesById.values()];
  entries.sort(byDateAscUndatedLast);
  return entries;
}
