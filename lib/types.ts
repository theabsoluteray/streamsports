/**
 * Normalized data models for Pitchside.
 * All provider responses are transformed into these types
 * before reaching the UI layer.
 */

// ─── Core Enums ───────────────────────────────────────────────────────────────

export type SportSlug =
  | 'football'
  | 'basketball'
  | 'ufc'
  | 'mma'
  | 'boxing'
  | 'f1'
  | 'tennis'
  | 'cricket'
  | 'nfl'
  | 'baseball'
  | 'hockey'
  | 'rugby';

export type MatchState = 'pre' | 'in' | 'post';

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  logo?: string;
  badge?: string;
  country?: string;
  league?: string;
  sport: SportSlug;
}

// ─── Player ───────────────────────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
  position?: string;
  nationality?: string;
  dateOfBirth?: string;
  photo?: string;
  teamId?: string;
  teamName?: string;
  sport: SportSlug;
}

// ─── League / Competition ────────────────────────────────────────────────────

export interface League {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
  country?: string;
  sport: SportSlug;
  currentSeason?: string;
}

// ─── EmbedSportex iframe entry ───────────────────────────────────────────────

export interface EspEmbed {
  server: string;
  url: string;
}

// ─── Match ────────────────────────────────────────────────────────────────────

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  league: League;
  sport: SportSlug;
  state: MatchState;
  statusDetail: string;    // Human-readable: "Q3 - 4:23", "Final", "45+2'"
  startTime: string;       // ISO 8601
  venue?: string;
  thumb?: string;
  /** Clock elapsed in current period (minutes) */
  clockMinute?: number;
  /** e.g. "1st Half", "Halftime", "Q3", "Set 2" */
  period?: string;
  /** Source provider that surfaced this match */
  sourceProvider: 'espn' | 'thesportsdb' | 'manual';
  /** ESPN event id (if applicable) */
  espnId?: string;
  /** TheSportsDB event id (if applicable) */
  tsdbId?: string;
  /** EmbedSportex per-match embed iframes */
  espEmbeds?: EspEmbed[];
}

// ─── Standing ─────────────────────────────────────────────────────────────────

export interface StandingEntry {
  rank: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string;
}

export interface Standing {
  league: League;
  season: string;
  entries: StandingEntry[];
}

// ─── Statistic ────────────────────────────────────────────────────────────────

export interface MatchStatistic {
  name: string;
  home: string | number;
  away: string | number;
}

// ─── Timeline Event ──────────────────────────────────────────────────────────

export type TimelineEventType =
  | 'goal'
  | 'owngoal'
  | 'penalty'
  | 'penaltymiss'
  | 'yellowcard'
  | 'redcard'
  | 'yellowredcard'
  | 'substitution'
  | 'kickoff'
  | 'halftime'
  | 'fulltime'
  | 'extratime'
  | 'shootout';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  minute: number;
  addedTime?: number;
  team: 'home' | 'away';
  playerName?: string;
  playerOutName?: string;
  detail?: string;
}

// ─── Stream ───────────────────────────────────────────────────────────────────

export interface StreamSource {
  id: string;
  name: string;
  url: string;
  quality?: string;
  language?: string;
  isLive: boolean;
}

// ─── Search Result ────────────────────────────────────────────────────────────

export type SearchResultType = 'match' | 'team' | 'player' | 'league' | 'sport';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
  sport?: SportSlug;
}

// ─── Sport Config ─────────────────────────────────────────────────────────────

export interface SportConfig {
  slug: SportSlug;
  name: string;
  icon: string;
  color: string;
  leagues: LeagueConfig[];
}

export interface LeagueConfig {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
  espnPath?: string;
  tsdbId?: string;
  country?: string;
}

// ─── Favorites & History ──────────────────────────────────────────────────────

export interface FavoriteItem {
  id: string;
  type: 'match' | 'team' | 'league';
  name: string;
  subtitle?: string;
  image?: string;
  href: string;
  sport: SportSlug;
  addedAt: string;
}

export interface WatchHistoryEntry {
  matchId: string;
  matchTitle: string;
  sport: SportSlug;
  leagueName: string;
  watchedAt: string;
  progressSeconds: number;
  providerId: string;
  thumb?: string;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light' | 'system';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'match_start' | 'score_update' | 'match_end' | 'info';
  read: boolean;
  createdAt: string;
  href?: string;
  matchId?: string;
}

export interface UserSettings {
  theme: Theme;
  autoplayNext: boolean;
  preferredProvider: string;
  defaultSport: SportSlug | 'all';
  notificationsEnabled: boolean;
  reducedMotion: boolean;
}
