import type { IconName } from '$components/icon';
import { formatName, nameMatchesQuery } from '$db-tree/names';
import { formatLifeYearsCompact } from '$lib/personSummary';
import type { PeopleRailFilters, PeopleRailSort } from '$/store/app-store';
import type { Gender, IndividualWithDetails } from '$types/database';

/** Sex glyph shown next to a person's lifespan in the rail (rows, hover preview). */
export const SEX_ICON: Record<Gender, IconName> = {
  M: 'mars',
  F: 'venus',
  U: 'circle-help',
};

/** Year extracted from an event's sort date, or `null` when the event/date is absent. */
function eventYear(event: IndividualWithDetails['birthEvent']): number | null {
  const year = event?.dateSort?.slice(0, 4);
  return year ? Number(year) : null;
}

/** Compact "1959–2020" / "1959–" (living) / "?–2020" lifespan string for the rail. */
export function lifespanYears(person: IndividualWithDetails): string {
  return formatLifeYearsCompact(
    {
      bornYear: eventYear(person.birthEvent) ?? undefined,
      deathYear: eventYear(person.deathEvent) ?? undefined,
    },
    person.isLiving
  );
}

/**
 * Display name for a rail row — "Surname, Given" when sorted by surname (per
 * the mockup: the display switches to "Surname, Given name" when the sort is
 * on the surname), otherwise "Given Surname".
 */
export function rowDisplayName(
  person: IndividualWithDetails,
  sortField: PeopleRailSort['field']
): string {
  const formatted = formatName(person.primaryName);
  return sortField === 'surname' ? formatted.surnameFirst : formatted.full;
}

/** Whether a person matches every active filter (AND across fields, OR within a field's values). */
export function matchesPeopleRailFilters(
  person: IndividualWithDetails,
  filters: PeopleRailFilters
): boolean {
  if (filters.sex.length > 0 && !filters.sex.includes(person.gender)) return false;
  if (filters.status.length > 0) {
    const status = person.isLiving ? 'living' : 'deceased';
    if (!filters.status.includes(status)) return false;
  }
  return true;
}

/** Per-value counts for the filter panel's checkboxes — how many people hold each sex/status. */
export interface PeopleRailFilterCounts {
  sex: Record<Gender, number>;
  status: Record<'living' | 'deceased', number>;
}

/**
 * Tallies every sex/status value in one pass. Each value's count reflects the
 * whole list on its own (not narrowed by the draft's other selections) — the
 * mockup's "OR within field" counter — so this depends only on `people`, safe
 * to memoize independently of the filter draft.
 */
export function countPeopleRailFilterValues(
  people: IndividualWithDetails[]
): PeopleRailFilterCounts {
  const counts: PeopleRailFilterCounts = {
    sex: { M: 0, F: 0, U: 0 },
    status: { living: 0, deceased: 0 },
  };
  for (const person of people) {
    counts.sex[person.gender] += 1;
    counts.status[person.isLiving ? 'living' : 'deceased'] += 1;
  }
  return counts;
}

const SORT_KEY: Record<
  PeopleRailSort['field'],
  (person: IndividualWithDetails) => string | number
> = {
  surname: (person) => formatName(person.primaryName).sortable,
  firstName: (person) => person.primaryName?.givenNames?.trim() ?? '',
  birthYear: (person) => eventYear(person.birthEvent) ?? Number.POSITIVE_INFINITY,
  deathYear: (person) => eventYear(person.deathEvent) ?? Number.POSITIVE_INFINITY,
};

/**
 * Sorts the people rail: accent-insensitive on text fields (`Intl.Collator`),
 * numeric on the year fields, direction-aware, with a stable "surname +
 * given" tie-break so equal keys don't reorder on every render.
 *
 * Every person's sort key and tie-break key are computed once up front
 * (a decorate-sort-undecorate pass) rather than inside the comparator, which
 * `Array.prototype.sort` calls O(n log n) times — recomputing `formatName()`
 * per comparison instead of per person is what turned the rail's first mount
 * into ~1.7M `formatName` calls at 100k people.
 */
export function sortPeopleRail(
  people: IndividualWithDetails[],
  sort: PeopleRailSort,
  locale: string
): IndividualWithDetails[] {
  const collator = new Intl.Collator(locale, { sensitivity: 'base' });
  const keyOf = SORT_KEY[sort.field];
  const direction = sort.direction === 'asc' ? 1 : -1;

  const decorated = people.map((person) => {
    const tieBreakKey = formatName(person.primaryName).sortable;
    return {
      person,
      // Sorting by surname already computes this exact value — reuse it
      // instead of calling `formatName()` a second time per person.
      primaryKey: sort.field === 'surname' ? tieBreakKey : keyOf(person),
      tieBreakKey,
    };
  });

  decorated.sort((a, b) => {
    let primary: number;
    if (typeof a.primaryKey === 'number' || typeof b.primaryKey === 'number') {
      const numA = Number(a.primaryKey);
      const numB = Number(b.primaryKey);
      // `Infinity - Infinity` is NaN — compare for equality first so two
      // people with no year fall through to the name tie-break below.
      primary = numA === numB ? 0 : numA - numB;
    } else {
      primary = collator.compare(String(a.primaryKey), String(b.primaryKey));
    }
    if (primary !== 0) return primary * direction;
    return collator.compare(a.tieBreakKey, b.tieBreakKey) * direction;
  });

  return decorated.map((decoratedPerson) => decoratedPerson.person);
}

/** Display date for an event: the original (as-entered) date, else the sort year, else an em dash. */
export function formatEventDate(event: IndividualWithDetails['birthEvent']): string {
  return event?.dateOriginal ?? (event?.dateSort ? event.dateSort.slice(0, 4) : '—');
}

/** Free-text + filter pass for the rail's people list. */
export function filterPeopleRail(
  people: IndividualWithDetails[],
  filters: PeopleRailFilters,
  query: string
): IndividualWithDetails[] {
  const trimmed = query.trim().toLowerCase();
  return people.filter((person) => {
    if (!matchesPeopleRailFilters(person, filters)) return false;
    if (trimmed && !nameMatchesQuery(person.names, trimmed)) return false;
    return true;
  });
}
