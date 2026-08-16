import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Gender } from '$types/database';

export type Theme = 'light' | 'dark' | 'system';

export type PeopleRailSortField = 'surname' | 'firstName' | 'birthYear' | 'deathYear';
export type PeopleRailSortDirection = 'asc' | 'desc';

export interface PeopleRailFilters {
  sex: Gender[];
  status: ('living' | 'deceased')[];
}

export interface PeopleRailSort {
  field: PeopleRailSortField;
  direction: PeopleRailSortDirection;
}

export const DEFAULT_PEOPLE_RAIL_FILTERS: PeopleRailFilters = { sex: [], status: [] };
export const DEFAULT_PEOPLE_RAIL_SORT: PeopleRailSort = { field: 'surname', direction: 'asc' };

/** How many recently-picked individuals a picker's "Récents" tab keeps. */
const MAX_RECENT_EVENT_PARTICIPANTS = 5;

interface AppState {
  currentTreeId: string | null;
  setCurrentTree: (id: string | null) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** Explicit user override of the people rail's collapsed state; `null` follows the responsive default. */
  peopleRailCollapsed: boolean | null;
  setPeopleRailCollapsed: (collapsed: boolean | null) => void;
  peopleRailFilters: PeopleRailFilters;
  setPeopleRailFilters: (filters: PeopleRailFilters) => void;
  peopleRailSort: PeopleRailSort;
  setPeopleRailSort: (sort: PeopleRailSort) => void;
  /**
   * Individual ids recently picked as event participants, most recent
   * first, keyed by tree id — feeds the entity picker's "Récents" tab.
   * Individual ids are only unique within their own tree's database, so a
   * flat cross-tree list would risk resolving a stale id to an unrelated
   * person after switching trees.
   */
  recentEventParticipantIdsByTree: Record<string, string[]>;
  addRecentEventParticipant: (individualId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentTreeId: null,
      setCurrentTree: (id) => set({ currentTreeId: id }),
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      peopleRailCollapsed: null,
      setPeopleRailCollapsed: (collapsed) => set({ peopleRailCollapsed: collapsed }),
      peopleRailFilters: DEFAULT_PEOPLE_RAIL_FILTERS,
      setPeopleRailFilters: (filters) => set({ peopleRailFilters: filters }),
      peopleRailSort: DEFAULT_PEOPLE_RAIL_SORT,
      setPeopleRailSort: (sort) => set({ peopleRailSort: sort }),
      recentEventParticipantIdsByTree: {},
      addRecentEventParticipant: (individualId) => {
        const treeId = get().currentTreeId;
        if (!treeId) return;
        set((state) => {
          const existing = state.recentEventParticipantIdsByTree[treeId] ?? [];
          return {
            recentEventParticipantIdsByTree: {
              ...state.recentEventParticipantIdsByTree,
              [treeId]: [individualId, ...existing.filter((id) => id !== individualId)].slice(
                0,
                MAX_RECENT_EVENT_PARTICIPANTS
              ),
            },
          };
        });
      },
    }),
    {
      name: 'vata-app-storage',
    }
  )
);

// Stable reference so callers memoizing on this value (e.g. EventParticipantPicker's
// useMemo, see issue #269) don't see a new array on every render before any pick exists.
const EMPTY_RECENT_IDS: string[] = [];

/** This tree's recently-picked event participants — `[]` outside a tree or before any pick. */
export function useRecentEventParticipantIds(): string[] {
  return useAppStore((state) =>
    state.currentTreeId
      ? (state.recentEventParticipantIdsByTree[state.currentTreeId] ?? EMPTY_RECENT_IDS)
      : EMPTY_RECENT_IDS
  );
}
