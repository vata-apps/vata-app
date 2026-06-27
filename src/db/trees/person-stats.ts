import type { FamilyMember } from '$types/database';
import { getAllFamilyMembers } from './families';
import { getEventsByIndividualId } from './events';

/**
 * Headline counts shown in the Person Overview stats row. Each is a jump-off
 * point into the relevant detail. `media` and `sources` are intentionally
 * absent for now — files attach to sources (not individuals) and the citation
 * roll-up is not wired yet.
 */
export interface PersonStats {
  events: number;
  /** Distinct directly-tied people: parents, siblings, spouses, children. */
  relations: number;
  /** Ancestral depth — recorded generations above the person. */
  generationsUp: number;
  /** Descendant depth — recorded generations below the person. */
  generationsDown: number;
}

// =============================================================================
// Pure family-graph computation (no DB) — unit-tested directly.
// =============================================================================

interface FamilyGraph {
  /** Family id → its spouse (husband/wife) individual ids. */
  spousesByFamily: Map<string, string[]>;
  /** Family id → its child individual ids. */
  childrenByFamily: Map<string, string[]>;
  /** Individual id → families they are a child of. */
  childFamilies: Map<string, string[]>;
  /** Individual id → families they are a spouse in. */
  spouseFamilies: Map<string, string[]>;
}

function pushTo(map: Map<string, string[]>, key: string, value: string): void {
  const list = map.get(key) ?? [];
  list.push(value);
  map.set(key, list);
}

function buildGraph(members: FamilyMember[]): FamilyGraph {
  const graph: FamilyGraph = {
    spousesByFamily: new Map(),
    childrenByFamily: new Map(),
    childFamilies: new Map(),
    spouseFamilies: new Map(),
  };
  for (const member of members) {
    if (member.role === 'child') {
      pushTo(graph.childrenByFamily, member.familyId, member.individualId);
      pushTo(graph.childFamilies, member.individualId, member.familyId);
    } else {
      pushTo(graph.spousesByFamily, member.familyId, member.individualId);
      pushTo(graph.spouseFamilies, member.individualId, member.familyId);
    }
  }
  return graph;
}

function parentsOf(id: string, graph: FamilyGraph): string[] {
  return (graph.childFamilies.get(id) ?? []).flatMap(
    (family) => graph.spousesByFamily.get(family) ?? []
  );
}

function childrenOf(id: string, graph: FamilyGraph): string[] {
  return (graph.spouseFamilies.get(id) ?? []).flatMap(
    (family) => graph.childrenByFamily.get(family) ?? []
  );
}

/** Number of levels reachable from `rootId` by repeatedly applying `step`. */
function reachableDepth(rootId: string, step: (id: string) => string[]): number {
  let level = 0;
  let frontier = [rootId];
  const visited = new Set([rootId]);
  for (;;) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const neighbour of step(id)) {
        if (!visited.has(neighbour)) {
          visited.add(neighbour);
          next.push(neighbour);
        }
      }
    }
    if (next.length === 0) return level;
    level += 1;
    frontier = next;
  }
}

/**
 * Compute the relation count and ancestral/descendant depths for one person
 * from the full set of family-member rows. Pure — the cycle-safe traversal
 * relies only on the in-memory graph.
 */
export function computeRelationStats(
  individualId: string,
  members: FamilyMember[]
): Omit<PersonStats, 'events'> {
  const graph = buildGraph(members);

  const parents = parentsOf(individualId, graph);
  const children = childrenOf(individualId, graph);
  const siblings = (graph.childFamilies.get(individualId) ?? []).flatMap(
    (family) => graph.childrenByFamily.get(family) ?? []
  );
  const spouses = (graph.spouseFamilies.get(individualId) ?? []).flatMap(
    (family) => graph.spousesByFamily.get(family) ?? []
  );

  const relations = new Set([...parents, ...children, ...siblings, ...spouses]);
  relations.delete(individualId);

  return {
    relations: relations.size,
    generationsUp: reachableDepth(individualId, (id) => parentsOf(id, graph)),
    generationsDown: reachableDepth(individualId, (id) => childrenOf(id, graph)),
  };
}

// =============================================================================
// Aggregate query
// =============================================================================

/**
 * Load the Person Overview stats for one individual. Pulls every family-member
 * row once and computes the relation/generation stats in memory, so the cost
 * is a single query plus the event lookup regardless of tree depth.
 */
export async function getPersonStats(individualId: string): Promise<PersonStats> {
  const members = await getAllFamilyMembers();
  const events = await getEventsByIndividualId(individualId);
  return { events: events.length, ...computeRelationStats(individualId, members) };
}
