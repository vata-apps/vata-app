import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  currentTreeId: string | null;
  setCurrentTree: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentTreeId: null,
      setCurrentTree: (id) => set({ currentTreeId: id }),
    }),
    {
      name: 'vata-app-storage',
    }
  )
);
