/**
 * Streamed API Client
 *
 * Base: https://streamed.pk/api
 *
 * Endpoints:
 *  GET /api/sports                     — All sport categories
 *  GET /api/matches/[sport]            — Matches for a sport
 *  GET /api/matches/all                — All matches
 *  GET /api/matches/live               — Currently live
 *  GET /api/matches/all-today          — Today's matches
 *  GET /api/stream/[source]/[id]       — Streams for a match source
 *  GET /api/images/badge/[id].webp     — Team badge
 *  GET /api/images/poster/[b1]/[b2].webp — Match poster
 *  GET /api/images/proxy/[poster].webp — Proxied poster image
 */

const BASE = 'https://streamed.pk/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Sport {
  id: string;
  name: string;
}

export interface MatchSource {
  source: string;
  id: string;
}

export interface MatchTeam {
  name: string;
  badge: string;
}

export interface APIMatch {
  id: string;
  title: string;
  category: string;
  date: number;        // unix ms
  poster?: string;
  popular: boolean;
  teams?: {
    home?: MatchTeam;
    away?: MatchTeam;
  };
  sources: MatchSource[];
}

export interface Stream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
}

// ─── Image helpers ───────────────────────────────────────────────────────────

export function getBadgeUrl(badgeId: string): string {
  if (!badgeId) return '';
  return `${BASE}/images/badge/${badgeId}.webp`;
}

export function getPosterUrl(homeBadge: string, awayBadge: string): string {
  if (!homeBadge || !awayBadge) return '';
  return `${BASE}/images/poster/${homeBadge}/${awayBadge}.webp`;
}

export function getProxyImageUrl(posterId: string): string {
  if (!posterId) return '';
  return `${BASE}/images/proxy/${posterId}.webp`;
}

// ─── Fetch helpers ───────────────────────────────────────────────────────────

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 30 },
  } as RequestInit);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// ─── Sports ──────────────────────────────────────────────────────────────────

export async function getSports(): Promise<Sport[]> {
  try {
    return await fetchJSON<Sport[]>('/sports');
  } catch {
    return [];
  }
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export async function getMatchesBySport(sportId: string): Promise<APIMatch[]> {
  try {
    return await fetchJSON<APIMatch[]>(`/matches/${sportId}`);
  } catch {
    return [];
  }
}

export async function getAllMatches(): Promise<APIMatch[]> {
  try {
    return await fetchJSON<APIMatch[]>('/matches/all');
  } catch {
    return [];
  }
}

export async function getLiveMatches(): Promise<APIMatch[]> {
  try {
    return await fetchJSON<APIMatch[]>('/matches/live');
  } catch {
    return [];
  }
}

export async function getTodayMatches(): Promise<APIMatch[]> {
  try {
    return await fetchJSON<APIMatch[]>('/matches/all-today');
  } catch {
    return [];
  }
}

export async function getPopularMatches(): Promise<APIMatch[]> {
  try {
    return await fetchJSON<APIMatch[]>('/matches/all/popular');
  } catch {
    return [];
  }
}

// ─── Streams ─────────────────────────────────────────────────────────────────

export async function getStreams(source: string, id: string): Promise<Stream[]> {
  try {
    return await fetchJSON<Stream[]>(`/stream/${source}/${id}`);
  } catch {
    return [];
  }
}

// ─── Client-side helpers ─────────────────────────────────────────────────────

/** Check if a match is currently live (date within ±3h window) */
export function isLive(match: APIMatch): boolean {
  const now = Date.now();
  const matchTime = match.date;
  // If match started in the past 3 hours, consider it potentially live
  return matchTime <= now && (now - matchTime) < 3 * 60 * 60 * 1000;
}

/** Check if a match is upcoming */
export function isUpcoming(match: APIMatch): boolean {
  return match.date > Date.now();
}

/** Sort matches by date (nearest first) */
export function sortByDate(matches: APIMatch[]): APIMatch[] {
  return [...matches].sort((a, b) => a.date - b.date);
}

/** Search matches by query */
export function searchMatches(matches: APIMatch[], query: string): APIMatch[] {
  const q = query.toLowerCase().trim();
  if (!q) return matches;
  return matches.filter((m) =>
    m.title.toLowerCase().includes(q) ||
    m.category.toLowerCase().includes(q) ||
    m.teams?.home?.name.toLowerCase().includes(q) ||
    m.teams?.away?.name.toLowerCase().includes(q)
  );
}

// ─── Sport icon map (for UI) ─────────────────────────────────────────────────

export const SPORT_ICONS: Record<string, string> = {
  football: '⚽',
  basketball: '🏀',
  tennis: '🎾',
  hockey: '🏒',
  baseball: '⚾',
  mma: '🥊',
  boxing: '🥊',
  cricket: '🏏',
  afl: '🏉',
  darts: '🎯',
  handball: '🤾',
  rugby: '🏉',
  volleyball: '🏐',
  golf: '⛳',
  f1: '🏎️',
  motorsport: '🏎️',
  default: '🏆',
};

export function getSportIcon(sportId: string): string {
  return SPORT_ICONS[sportId.toLowerCase()] ?? SPORT_ICONS.default;
}

// ─── Sport gradient colors (for premium UI) ──────────────────────────────────

export const SPORT_COLORS: Record<string, { from: string; to: string; accent: string }> = {
  football:   { from: '#10b981', to: '#059669', accent: '#34d399' },
  basketball: { from: '#f97316', to: '#ea580c', accent: '#fb923c' },
  tennis:     { from: '#eab308', to: '#ca8a04', accent: '#facc15' },
  hockey:     { from: '#3b82f6', to: '#2563eb', accent: '#60a5fa' },
  baseball:   { from: '#ef4444', to: '#dc2626', accent: '#f87171' },
  mma:        { from: '#a855f7', to: '#9333ea', accent: '#c084fc' },
  boxing:     { from: '#ec4899', to: '#db2777', accent: '#f472b6' },
  cricket:    { from: '#14b8a6', to: '#0d9488', accent: '#2dd4bf' },
  rugby:      { from: '#78716c', to: '#57534e', accent: '#a8a29e' },
  default:    { from: '#6366f1', to: '#4f46e5', accent: '#818cf8' },
};

export function getSportColor(sportId: string) {
  return SPORT_COLORS[sportId.toLowerCase()] ?? SPORT_COLORS.default;
}
