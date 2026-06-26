import type { Gender, Name } from '$types/database';
import { formatName } from '$db-tree/names';
import { extractYear, type PersonOverviewData, type RelatedPerson } from '$db-tree/person-overview';
import type {
  OverviewMediaTile,
  OverviewMilestone,
  OverviewName,
  OverviewParents,
  OverviewPerson,
  PersonRefData,
} from './overview-mock';

/**
 * The slice of the Person Overview view-model that the Radix components render
 * from live tree data. Research notes, suggestions and the places map are
 * excluded — they have no data model yet, so the page omits those panels.
 */
export interface PersonOverviewView {
  person: OverviewPerson;
  names: OverviewName[];
  parents: OverviewParents;
  milestones: OverviewMilestone[];
  media: OverviewMediaTile[];
}

/** Map a database gender to the sex glyph the identity header expects. */
function sexGlyph(gender: Gender): string {
  if (gender === 'F') return '♀';
  if (gender === 'M') return '♂';
  return '';
}

/** Two-letter monogram from a primary name, falling back to `?`. */
function initialsOf(name: Name | null): string {
  const first = name?.givenNames?.trim()?.[0] ?? '';
  const last = name?.surname?.trim()?.[0] ?? '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || '?';
}

/** A related person (parent, spouse, child) reduced to a `PersonRef` shape. */
function toPersonRef(related: RelatedPerson): PersonRefData {
  return {
    id: related.id,
    initials: initialsOf(related.primaryName),
    name: formatName(related.primaryName).full,
    bornYear: related.birthYear ?? undefined,
    deathYear: related.deathYear ?? undefined,
  };
}

/**
 * Shape the pre-joined {@link PersonOverviewData} into the view-model consumed
 * by the Radix Person Overview components. Pure: no i18n, no fetching — name
 * types and milestone titles are emitted as keys for the components to resolve.
 */
export function buildPersonOverview(data: PersonOverviewData): PersonOverviewView {
  const { individual, names, primaryName, birthEvent, deathEvent, father, mother, marriages } =
    data;

  const birthYear = extractYear(birthEvent);
  const deathYear = extractYear(deathEvent);

  const person: OverviewPerson = {
    initials: initialsOf(primaryName),
    name: formatName(primaryName).full,
    sex: sexGlyph(individual.gender),
    birthDate: birthEvent?.dateOriginal ?? '',
    birthPlace: birthEvent?.place?.name ?? '',
    deathDate: deathEvent?.dateOriginal ?? '',
    deathPlace: deathEvent?.place?.name ?? '',
    birthYear: birthYear ?? 0,
    deathYear: deathYear ?? 0,
    age: birthYear !== null && deathYear !== null ? deathYear - birthYear : 0,
    // Not derived here — the Radix identity header does not render it.
    generations: 0,
    mediaCount: 0,
    otherNamesCount: Math.max(names.length - 1, 0),
  };

  const viewNames: OverviewName[] = names.map((name) => ({
    id: name.id,
    type: name.type,
    text: formatName(name).full,
    isPrimary: name.isPrimary,
  }));

  const parents: OverviewParents = {
    father: father ? toPersonRef(father) : undefined,
    mother: mother ? toPersonRef(mother) : undefined,
  };

  const bornMilestone: OverviewMilestone | null = birthEvent
    ? {
        id: birthEvent.id,
        kind: 'born',
        date: birthEvent.dateOriginal ?? '',
        sortYear: birthYear ?? 0,
        place: birthEvent.place?.name ?? '',
        detail: '',
      }
    : null;

  const deathMilestone: OverviewMilestone | null = deathEvent
    ? {
        id: deathEvent.id,
        kind: 'death',
        date: deathEvent.dateOriginal ?? '',
        sortYear: deathYear ?? 0,
        place: deathEvent.place?.name ?? '',
        detail: '',
      }
    : null;

  const marriageMilestones: OverviewMilestone[] = marriages
    .map((marriage): OverviewMilestone => {
      const event = marriage.marriageEvent;
      return {
        id: marriage.familyId,
        kind: 'marriage',
        date: event?.dateOriginal ?? '',
        sortYear: extractYear(event) ?? 0,
        place: event?.place?.name ?? '',
        detail: '',
        spouse: marriage.spouse ? toPersonRef(marriage.spouse) : undefined,
        children: marriage.children.map(toPersonRef),
      };
    })
    .sort((a, b) => a.sortYear - b.sortYear);

  const milestones: OverviewMilestone[] = [
    ...(bornMilestone ? [bornMilestone] : []),
    ...marriageMilestones,
    ...(deathMilestone ? [deathMilestone] : []),
  ];

  // Media is individual-agnostic in the schema (files attach to sources), so
  // there is nothing to show per person yet.
  return { person, names: viewNames, parents, milestones, media: [] };
}
