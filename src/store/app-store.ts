import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  currentTreeId: string | null;
  setCurrentTree: (id: string | null) => void;
  language: string;
  setLanguage: (language: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentTreeId: null,
      setCurrentTree: (id) => set({ currentTreeId: id }),
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'vata-app-storage',
    }
  )
);
