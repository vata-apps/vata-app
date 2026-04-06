import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface AppState {
  currentTreeId: string | null;
  setCurrentTree: (id: string | null) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: string;
  setLanguage: (language: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentTreeId: null,
      setCurrentTree: (id) => set({ currentTreeId: id }),
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'vata-app-storage',
    }
  )
);
