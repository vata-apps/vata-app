import { getSpousesForFamilies } from './families';
import { getPrimaryNamesForIndividuals } from './names';
import type { EventPrincipal, EventWithDetails, Name } from '$types/database';

/**
 * Resolve the principal participant(s) of each event to their display names, in a
 * bounded number of queries regardless of event count: one batched name lookup for
 * every individual principal, one batched spouse lookup for every family principal,
 * then one more batched name lookup for those spouses.
 */
export async function resolvePrincipalsForEvents(
  events: EventWithDetails[]
): Promise<Map<string, EventPrincipal[]>> {
  const principalIndividualIds = new Set<string>();
  const principalFamilyIds = new Set<string>();
  for (const event of events) {
    for (const p of event.participants) {
      if (p.role !== 'principal') continue;
      if (p.individualId !== null) principalIndividualIds.add(p.individualId);
      if (p.familyId !== null) principalFamilyIds.add(p.familyId);
    }
  }

  const [individualNames, spouseRows] = await Promise.all([
    getPrimaryNamesForIndividuals(Array.from(principalIndividualIds)),
    getSpousesForFamilies(Array.from(principalFamilyIds)),
  ]);
  const nameByIndividualId = new Map<string, Name>();
  for (const name of individualNames) {
    nameByIndividualId.set(name.individualId, name);
  }

  const spousesByFamilyId = new Map<string, { husbandId: string | null; wifeId: string | null }>();
  for (const row of spouseRows) {
    spousesByFamilyId.set(row.familyId, { husbandId: row.husbandId, wifeId: row.wifeId });
  }

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

  const principalsByEventId = new Map<string, EventPrincipal[]>();
  for (const event of events) {
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
          husband: spouses?.husbandId ? (nameByIndividualId.get(spouses.husbandId) ?? null) : null,
          wife: spouses?.wifeId ? (nameByIndividualId.get(spouses.wifeId) ?? null) : null,
        });
      }
    }
    principalsByEventId.set(event.id, principals);
  }

  return principalsByEventId;
}
