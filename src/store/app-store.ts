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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'vata-app-storage',
    }
  )
);
