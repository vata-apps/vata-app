import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface AppState {
  currentTreeId: string | null;
  setCurrentTree: (id: string | null) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentTreeId: null,
      setCurrentTree: (id) => set({ currentTreeId: id }),
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'vata-app-storage',
    }
  )
);
