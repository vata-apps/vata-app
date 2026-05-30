import type { IconName } from '$components/icon';

/**
 * Static sample data for the Person Overview page.
 *
 * This is a design replication (see the "Person Overview — Chronology"
 * mockup), not the live feature: the figures below stand in for what the
 * DB layer will eventually supply, so the page can be styled and reviewed
 * before the data plumbing exists. Person-specific copy (names, places,
 * milestone descriptions) lives here as sample content; reusable UI labels
 * are translated through the `individuals` i18n namespace.
 */

export interface OverviewPerson {
  /** Monogram initials shown in the header. */
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
  icon: IconName;
  /** Marriage title; `born` / `death` render a translated label instead. */
  title?: string;
  place: string;
  detail: string;
  /** A solid timeline node (vital event) vs. a hollow one (secondary). */
  emphasised: boolean;
  children?: OverviewChild[];
}

export interface OverviewPin {
  id: string;
  place: string;
  detail: string;
  /** Position on the map surface, as percentages of width / height. */
  left: number;
  top: number;
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
  icon: IconName;
  caption: string;
}

export interface OverviewSuggestion {
  icon: IconName;
  text: string;
}

export interface PersonOverview {
  person: OverviewPerson;
  figures: OverviewFigures;
  parents: OverviewParent[];
  marriage: OverviewMarriageInfo;
  milestones: OverviewMilestone[];
  places: { region: string; pins: OverviewPin[]; legend: OverviewPlaceLegend[] };
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
      icon: 'sparkles',
      place: 'Rivière-du-Loup',
      detail: 'Born into the Lévesque family.',
      emphasised: true,
    },
    {
      id: 'marriage-bourgoin',
      year: 1922,
      kind: 'marriage',
      icon: 'heart',
      title: 'Married Élzéar Bourgoin',
      place: 'Saint-Antonin',
      detail: 'First marriage · 8 children',
      emphasised: false,
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
      icon: 'heart',
      title: 'Married Jean Dubé',
      place: 'Saint-Antonin',
      detail: 'Second marriage · 1 child',
      emphasised: false,
      children: [{ initials: 'A', name: 'Anna' }],
    },
    {
      id: 'died',
      year: 1955,
      kind: 'death',
      icon: 'flower-2',
      place: 'Québec',
      detail: 'Died at age 65.',
      emphasised: true,
    },
  ],
  places: {
    region: 'Bas-Saint-Laurent',
    pins: [
      { id: 'rdl', place: 'Rivière-du-Loup', detail: '1890 · birth', left: 13, top: 25 },
      { id: 'sa', place: 'Saint-Antonin', detail: '1922 · marriages', left: 40, top: 53 },
      { id: 'qc', place: 'Québec', detail: '1955 · death', left: 68, top: 21 },
    ],
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
    { icon: 'image', caption: 'portrait' },
    { icon: 'users', caption: 'family' },
    { icon: 'file-text', caption: 'document' },
    { icon: 'table', caption: 'census' },
  ],
  suggestions: [
    { icon: 'circle-plus', text: 'Add a death source for 1955' },
    { icon: 'link', text: 'Link Anna Dubé to the 1936 census' },
  ],
};
