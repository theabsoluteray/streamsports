import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Store {
  sportFilter: string;
  setSportFilter: (s: string) => void;
  selectedProvider: string;
  setSelectedProvider: (id: string) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      sportFilter: 'All',
      setSportFilter: (s) => set({ sportFilter: s }),
      selectedProvider: 'sportsembed',
      setSelectedProvider: (id) => set({ selectedProvider: id }),
    }),
    {
      name: 'ss-prefs',
      partialize: (s) => ({ selectedProvider: s.selectedProvider }),
    }
  )
);
