import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Store {
  /** Currently selected sport filter on homepage ('all' = show all) */
  sportFilter: string;
  setSportFilter: (s: string) => void;

  /** Active stream source index for the player */
  activeSourceIdx: number;
  setActiveSourceIdx: (i: number) => void;

  /** Active stream index within a source */
  activeStreamIdx: number;
  setActiveStreamIdx: (i: number) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      sportFilter: 'all',
      setSportFilter: (s) => set({ sportFilter: s }),

      activeSourceIdx: 0,
      setActiveSourceIdx: (i) => set({ activeSourceIdx: i }),

      activeStreamIdx: 0,
      setActiveStreamIdx: (i) => set({ activeStreamIdx: i }),
    }),
    {
      name: 'ss-prefs',
      partialize: (s) => ({ sportFilter: s.sportFilter }),
    }
  )
);
