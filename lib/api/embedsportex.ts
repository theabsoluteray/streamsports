/**
 * EmbedSportex API Provider
 *
 * Free, no-auth, CORS-enabled public API that returns live/upcoming matches
 * across all major sports WITH ready-to-embed iframe URLs per match.
 *
 * Docs: https://api.esportex.site/api
 * Endpoint: GET https://api.esportex.site/api/streams
 * Poll: max once every 30 seconds
 * Auth: none required
 */
import type { Match, SportSlug } from '@/lib/types';

const BASE = 'https://api.esportex.site/api/streams';
const TIMEOUT = 12_000;

// ─── Raw EmbedSportex shapes ─────────────────────────────────────────────────

export interface EspIframe {
  server: string;  // e.g. "HD/iOS", "AUTO", "FHD/iOS", "VIP"
  url: string;     // full embeddable player URL
}

export interface EspMatch {
  slugkey: string;   // URL-safe unique id, e.g. "man-city-liverpool"
  tag: string;       // display name, e.g. "Man City vs Liverpool"
  kickoff: string;   // "YYYY-MM-DD HH:mm" in WIB (UTC+7)
  endTime: string;   // "YYYY-MM-DD HH:mm" in WIB (UTC+7)
  league: string;    // "Premier League", "NBA", "Formula 1" …
  poster: string | null;
  iframes: EspIframe[];
}

interface EspResponse {
  success: boolean;
  timestamp: number;
  football?: EspMatch[];
  basketball?: EspMatch[];
  amfootball?: EspMatch[];
  baseball?: EspMatch[];
  badminton?: EspMatch[];
  volleyball?: EspMatch[];
  tennis?: EspMatch[];
  race?: EspMatch[];
  fight?: EspMatch[];
  hockey?: EspMatch[];
  rugby?: EspMatch[];
  cricket?: EspMatch[];
  other?: EspMatch[];
}

// ─── Category → SportSlug mapping ───────────────────────────────────────────

const CATEGORY_SPORT_MAP: Record<string, SportSlug> = {
  football:    'football',
  basketball:  'basketball',
  amfootball:  'nfl',
  baseball:    'baseball',
  badminton:   'tennis',
  volleyball:  'football',   // closest fallback
  tennis:      'tennis',
  race:        'f1',
  fight:       'ufc',
  hockey:      'hockey',
  rugby:       'rugby',
  cricket:     'cricket',
  other:       'football',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Parse WIB (UTC+7) kickoff string to ISO */
function wibToISO(wib: string): string {
  return new Date(wib.replace(' ', 'T') + '+07:00').toISOString();
}

function determineState(kickoff: string, endTime: string): 'pre' | 'in' | 'post' {
  const now = Date.now();
  const start = new Date(wibToISO(kickoff)).getTime();
  const end   = new Date(wibToISO(endTime)).getTime();
  if (now < start)  return 'pre';
  if (now >= end)   return 'post';
  return 'in';
}

function normalizeEspMatch(raw: EspMatch, sport: SportSlug, categoryKey: string): Match & { espEmbeds: EspIframe[] } {
  const isoStart = wibToISO(raw.kickoff);
  const state    = determineState(raw.kickoff, raw.endTime);

  // Parse "Team A vs Team B" tag
  const parts  = raw.tag.split(/\s+vs\.?\s+/i);
  const homeName = (parts[0] ?? raw.tag).trim();
  const awayName = (parts[1] ?? '???').trim();

  const abbrev = (n: string) => n.replace(/[^A-Z]/g, '').slice(0, 3) || n.slice(0, 3).toUpperCase();

  const homeTeam = {
    id: `${raw.slugkey}-home`,
    name: homeName,
    shortName: homeName,
    abbreviation: abbrev(homeName),
    sport,
  };
  const awayTeam = {
    id: `${raw.slugkey}-away`,
    name: awayName,
    shortName: awayName,
    abbreviation: abbrev(awayName),
    sport,
  };

  return {
    id:        `esp-${raw.slugkey}`,
    homeTeam,
    awayTeam,
    homeScore: 0,
    awayScore: 0,
    league: {
      id:    `${categoryKey}-${raw.league.toLowerCase().replace(/\s+/g, '-')}`,
      name:  raw.league,
      sport,
    },
    sport,
    state,
    statusDetail: state === 'in' ? 'Live' : state === 'post' ? 'Ended' : '',
    startTime: isoStart,
    thumb: raw.poster ?? undefined,
    sourceProvider: 'thesportsdb', // closest type match — means "external"
    espnId: undefined,
    // Extension fields attached for the stream layer
    espEmbeds: raw.iframes,
  };
}

// ─── Cache ──────────────────────────────────────────────────────────────────

let _cache: {
  ts: number;
  matches: Array<Match & { espEmbeds: EspIframe[] }>;
} | null = null;

const CACHE_MS = 30_000;

async function fetchRaw(): Promise<EspResponse> {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(`${BASE}?cache=${Math.floor(Date.now() / 1000)}`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as EspResponse;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** Fetch all live/upcoming matches from EmbedSportex. Results cached 30s. */
export async function getAllEspMatches(): Promise<Array<Match & { espEmbeds: EspIframe[] }>> {
  if (_cache && Date.now() - _cache.ts < CACHE_MS) return _cache.matches;

  let data: EspResponse;
  try {
    data = await fetchRaw();
  } catch {
    return _cache?.matches ?? [];
  }

  const matches: Array<Match & { espEmbeds: EspIframe[] }> = [];
  for (const [category, sport] of Object.entries(CATEGORY_SPORT_MAP)) {
    const arr = (data as unknown as Record<string, EspMatch[] | undefined>)[category] ?? [];
    for (const raw of arr) {
      try {
        matches.push(normalizeEspMatch(raw, sport, category));
      } catch { /* skip malformed entries */ }
    }
  }

  _cache = { ts: Date.now(), matches };
  return matches;
}

/** Get embed iframes for a specific match by its slugkey or combined id */
export function getEspEmbeds(match: Match & { espEmbeds?: EspIframe[] }): EspIframe[] {
  return match.espEmbeds ?? [];
}
