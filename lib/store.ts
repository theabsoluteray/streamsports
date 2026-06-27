/**
 * Zustand stores — all app global state.
 *
 * Stores:
 * - useThemeStore    — theme preference (dark/light/system)
 * - useFavoritesStore — saved matches, teams, leagues
 * - useHistoryStore  — watch history with progress tracking
 * - useUIStore       — transient UI state (search open, sidebar, notifications)
 * - useSettingsStore — user settings with persistence
 * - useNotificationsStore — in-app notifications
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Theme,
  FavoriteItem,
  WatchHistoryEntry,
  NotificationItem,
  UserSettings,
  SportSlug,
} from '@/lib/types';

// ─── Theme Store ───────────────────────────────────────────────────────────────

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: (theme) => {
        const resolved: 'dark' | 'light' =
          theme === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            : theme;
        set({ theme, resolvedTheme: resolved });
        document.documentElement.setAttribute('data-theme', resolved);
      },
      toggleTheme: () => {
        const current = get().resolvedTheme;
        get().setTheme(current === 'dark' ? 'light' : 'dark');
      },
    }),
    {
      name: 'ss-theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme }),
    }
  )
);

// ─── Favorites Store ───────────────────────────────────────────────────────────

interface FavoritesState {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (item) =>
        set((s) => ({
          favorites: [item, ...s.favorites.filter((f) => f.id !== item.id)],
        })),
      removeFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'ss-favorites',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── Watch History Store ───────────────────────────────────────────────────────

const MAX_HISTORY = 50;

interface HistoryState {
  history: WatchHistoryEntry[];
  addToHistory: (entry: WatchHistoryEntry) => void;
  updateProgress: (matchId: string, progressSeconds: number) => void;
  removeFromHistory: (matchId: string) => void;
  clearHistory: () => void;
  getEntry: (matchId: string) => WatchHistoryEntry | undefined;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      addToHistory: (entry) =>
        set((s) => ({
          history: [
            entry,
            ...s.history.filter((h) => h.matchId !== entry.matchId),
          ].slice(0, MAX_HISTORY),
        })),
      updateProgress: (matchId, progressSeconds) =>
        set((s) => ({
          history: s.history.map((h) =>
            h.matchId === matchId ? { ...h, progressSeconds, watchedAt: new Date().toISOString() } : h
          ),
        })),
      removeFromHistory: (matchId) =>
        set((s) => ({ history: s.history.filter((h) => h.matchId !== matchId) })),
      clearHistory: () => set({ history: [] }),
      getEntry: (matchId) => get().history.find((h) => h.matchId === matchId),
    }),
    {
      name: 'ss-history',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── Settings Store ─────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  autoplayNext: true,
  preferredProvider: '',
  defaultSport: 'all',
  notificationsEnabled: false,
  reducedMotion: false,
};

interface SettingsState extends UserSettings {
  setSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setSetting: (key, value) => set({ [key]: value }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'ss-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── UI Store (transient — no persistence) ─────────────────────────────────

interface UIState {
  isSearchOpen: boolean;
  isSidebarOpen: boolean;
  isMiniPlayerActive: boolean;
  miniPlayerMatchId: string | null;
  sportFilter: SportSlug | 'all';
  openSearch: () => void;
  closeSearch: () => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setSportFilter: (sport: SportSlug | 'all') => void;
  activateMiniPlayer: (matchId: string) => void;
  deactivateMiniPlayer: () => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSearchOpen: false,
      isSidebarOpen: false,
      isMiniPlayerActive: false,
      miniPlayerMatchId: null,
      sportFilter: 'all',
      openSearch: () => set({ isSearchOpen: true }),
      closeSearch: () => set({ isSearchOpen: false }),
      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),
      setSportFilter: (sport) => set({ sportFilter: sport }),
      activateMiniPlayer: (matchId) => set({ isMiniPlayerActive: true, miniPlayerMatchId: matchId }),
      deactivateMiniPlayer: () => set({ isMiniPlayerActive: false, miniPlayerMatchId: null }),
      recentSearches: [],
      addRecentSearch: (query) =>
        set((s) => ({
          recentSearches: [query, ...s.recentSearches.filter((q) => q !== query)].slice(0, 8),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'ss-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        sportFilter: s.sportFilter,
        recentSearches: s.recentSearches,
      }),
    }
  )
);

// ─── Notifications Store ───────────────────────────────────────────────────────

interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

let notifIdCounter = 0;

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      addNotification: (item) => {
        const notification: NotificationItem = {
          ...item,
          id: `notif-${++notifIdCounter}-${Date.now()}`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        set((s) => ({
          notifications: [notification, ...s.notifications].slice(0, 50),
          unreadCount: s.unreadCount + 1,
        }));
      },
      markRead: (id) =>
        set((s) => {
          const n = s.notifications.find((n) => n.id === id);
          if (!n || n.read) return s;
          return {
            notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
            unreadCount: Math.max(0, s.unreadCount - 1),
          };
        }),
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
      removeNotification: (id) =>
        set((s) => {
          const n = s.notifications.find((n) => n.id === id);
          return {
            notifications: s.notifications.filter((n) => n.id !== id),
            unreadCount: n && !n.read ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
          };
        }),
      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: 'ss-notifications',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ notifications: s.notifications, unreadCount: s.unreadCount }),
    }
  )
);
