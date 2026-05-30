/**
 * Static sample data for the pure-Radix Person Overview experiment.
 *
 * This mirrors the Person Overview mock data, but deliberately drops every
 * icon reference: this variant is built from `@radix-ui/themes` components
 * only, with no Lucide `Icon` and no custom CSS. Features that Radix cannot
 * express on its own (the map surface, the milestone glyphs, the timeline
 * rail) are simply omitted rather than faked.
 */

export interface OverviewPerson {
  initials: string;
  name: string;
  /** Sex glyph (♀ / ♂). */
  sex: string;
  generations: number;
  birthYear: number;
  deathYear: number;
  age: number;
  mediaCount: number;
}

export interface OverviewFigures {
  events: number;
  relations: number;
  sources: number;
  media: number;
}

export interface OverviewParent {
  initials: string;
  name: string;
  bornYear: number;
}

export interface OverviewMarriageInfo {
  /** Pre-formatted marriage label, e.g. "m. c. 1881". */
  label: string;
  place: string;
}

export interface OverviewChild {
  initials: string;
  name: string;
}

export type MilestoneKind = 'born' | 'marriage' | 'death';

export interface OverviewMilestone {
  id: string;
  year: number;
  kind: MilestoneKind;
  /** Marriage title; `born` / `death` render a translated label instead. */
  title?: string;
  place: string;
  detail: string;
  children?: OverviewChild[];
}

export interface OverviewPlaceLegend {
  place: string;
  detail: string;
}

export interface OverviewChecklistItem {
  /** Key into `overview.completion.items.*`. */
  key: string;
  done: boolean;
}

export interface OverviewMediaTile {
  caption: string;
}

export interface OverviewSuggestion {
  text: string;
}

export interface PersonOverview {
  person: OverviewPerson;
  figures: OverviewFigures;
  parents: OverviewParent[];
  marriage: OverviewMarriageInfo;
  milestones: OverviewMilestone[];
  places: { region: string; legend: OverviewPlaceLegend[] };
  completion: { percent: number; items: OverviewChecklistItem[] };
  media: OverviewMediaTile[];
  suggestions: OverviewSuggestion[];
}

export const personOverview: PersonOverview = {
  person: {
    initials: 'ML',
    name: 'Marie Lévesque',
    sex: '♀',
    generations: 5,
    birthYear: 1890,
    deathYear: 1955,
    age: 65,
    mediaCount: 12,
  },
  figures: { events: 12, relations: 21, sources: 7, media: 4 },
  parents: [
    { initials: 'Fa', name: 'Henri Lévesque', bornYear: 1855 },
    { initials: 'Mo', name: 'Marie Demure', bornYear: 1858 },
  ],
  marriage: { label: 'm. c. 1881', place: 'Saint-Antonin' },
  milestones: [
    {
      id: 'born',
      year: 1890,
      kind: 'born',
      place: 'Rivière-du-Loup',
      detail: 'Born into the Lévesque family.',
    },
    {
      id: 'marriage-bourgoin',
      year: 1922,
      kind: 'marriage',
      title: 'Married Élzéar Bourgoin',
      place: 'Saint-Antonin',
      detail: 'First marriage · 8 children',
      children: [
        { initials: 'J', name: 'Jean-Louis' },
        { initials: 'M', name: 'Marcelle' },
        { initials: 'J', name: 'Joseph' },
        { initials: 'A', name: 'Adèle' },
        { initials: 'É', name: 'Émile' },
        { initials: 'P', name: 'Pierre' },
        { initials: 'T', name: 'Théodore' },
        { initials: 'A', name: 'Anne-Marie' },
      ],
    },
    {
      id: 'marriage-dube',
      year: 1931,
      kind: 'marriage',
      title: 'Married Jean Dubé',
      place: 'Saint-Antonin',
      detail: 'Second marriage · 1 child',
      children: [{ initials: 'A', name: 'Anna' }],
    },
    {
      id: 'died',
      year: 1955,
      kind: 'death',
      place: 'Québec',
      detail: 'Died at age 65.',
    },
  ],
  places: {
    region: 'Bas-Saint-Laurent',
    legend: [
      { place: 'Rivière-du-Loup', detail: '1890 · birthplace' },
      { place: 'Saint-Antonin', detail: '1922 · marriages' },
      { place: 'Québec', detail: '1955 · place of death' },
    ],
  },
  completion: {
    percent: 72,
    items: [
      { key: 'vitalDates', done: true },
      { key: 'parentsLinked', done: true },
      { key: 'marriagesChildren', done: true },
      { key: 'birthplace', done: true },
      { key: 'deathRecord', done: false },
      { key: 'profilePhoto', done: false },
      { key: 'sourcesCited', done: false },
    ],
  },
  media: [
    { caption: 'portrait' },
    { caption: 'family' },
    { caption: 'document' },
    { caption: 'census' },
  ],
  suggestions: [
    { text: 'Add a death source for 1955' },
    { text: 'Link Anna Dubé to the 1936 census' },
  ],
};
