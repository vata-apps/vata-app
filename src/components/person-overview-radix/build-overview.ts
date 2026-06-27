import type { EventType, EventWithDetails, Gender, Name } from '$types/database';
import { formatName } from '$db-tree/names';
import { extractYear, type PersonOverviewData, type RelatedPerson } from '$db-tree/person-overview';
import type {
  OverviewMediaTile,
  OverviewMilestone,
  OverviewName,
  OverviewParents,
  OverviewPerson,
  PersonRefData,
} from './overview-types';

/** A distinct place tied to the person, with the event types that occurred there. */
export interface OverviewPlaceLived {
  id: string;
  name: string;
  /** Event types recorded at this place — resolved to labels by the component. */
  contexts: EventType[];
}

/** A vital event (birth, death) with its sourcing state. */
export interface OverviewVital {
  kind: 'born' | 'died';
  date: string;
  placeId?: string;
  placeName?: string;
  /** Whether the event carries at least one source citation. */
  sourced: boolean;
}

/**
 * The slice of the Person Overview view-model that the Radix components render
 * from live tree data. Research notes, suggestions and the places map are
 * excluded — they have no data model yet, so the page omits those panels.
 */
export interface PersonOverviewView {
  person: OverviewPerson;
  names: OverviewName[];
  parents: OverviewParents;
  vitals: OverviewVital[];
  milestones: OverviewMilestone[];
  placesLived: OverviewPlaceLived[];
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
  const {
    individual,
    names,
    primaryName,
    birthEvent,
    deathEvent,
    events,
    father,
    mother,
    marriages,
  } = data;

  const birthYear = extractYear(birthEvent);
  const deathYear = extractYear(deathEvent);

  const person: OverviewPerson = {
    initials: initialsOf(primaryName),
    name: formatName(primaryName).full,
    id: individual.id,
    sex: sexGlyph(individual.gender),
    birthDate: birthEvent?.dateOriginal ?? '',
    birthPlace: birthEvent?.place?.name ?? '',
    deathDate: deathEvent?.dateOriginal ?? '',
    deathPlace: deathEvent?.place?.name ?? '',
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

  // Vital events with their sourcing state; only those actually recorded show.
  const vitalSpecs: { kind: OverviewVital['kind']; tag: string }[] = [
    { kind: 'born', tag: 'BIRT' },
    { kind: 'died', tag: 'DEAT' },
  ];
  const vitals: OverviewVital[] = vitalSpecs.flatMap((spec) => {
    const event = events.find((candidate) => candidate.eventType.tag === spec.tag);
    if (!event) return [];
    return [
      {
        kind: spec.kind,
        date: event.dateOriginal ?? '',
        placeId: event.place?.id,
        placeName: event.place?.name,
        sourced: event.hasCitations,
      },
    ];
  });

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

  // Distinct places across the person's own events and their marriages, each
  // annotated with the event types that occurred there.
  const placeSources: EventWithDetails[] = [
    ...events,
    ...marriages
      .map((marriage) => marriage.marriageEvent)
      .filter((e): e is EventWithDetails => e !== null),
  ];
  const placesById = new Map<string, OverviewPlaceLived>();
  for (const event of placeSources) {
    if (!event.place) continue;
    const entry = placesById.get(event.place.id);
    if (entry) {
      if (!entry.contexts.some((context) => context.id === event.eventType.id)) {
        entry.contexts.push(event.eventType);
      }
    } else {
      placesById.set(event.place.id, {
        id: event.place.id,
        name: event.place.name,
        contexts: [event.eventType],
      });
    }
  }
  const placesLived = [...placesById.values()];

  // Media is individual-agnostic in the schema (files attach to sources), so
  // there is nothing to show per person yet.
  return { person, names: viewNames, parents, vitals, milestones, placesLived, media: [] };
}
