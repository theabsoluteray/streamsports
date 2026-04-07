/**
 * Streaming providers — all verified iframe-friendly via header test.
 * (No X-Frame-Options: DENY/SAMEORIGIN, no restrictive CSP frame-ancestors)
 *
 * URL strategy:
 *  - Most sites use /sport/ or /league/ path segments
 *  - leagueSlug comes from ESPN (e.g. "nba", "eng.1", "esp.1")
 *  - eventId is the ESPN event ID
 *
 * Tested 2026-04-07. Re-run test-sources.mjs to reverify.
 */

export interface Provider {
  id: string;
  name: string;
  buildUrl: (m: import('./api').Match) => string;
}

// Map ESPN league slugs → provider-specific sport paths
const SPORT_MAP: Record<string, string> = {
  'nba':           'nba',
  'eng.1':         'premier-league',
  'esp.1':         'la-liga',
  'ger.1':         'bundesliga',
  'ita.1':         'serie-a',
  'fra.1':         'ligue-1',
  'uefa.champions':'champions-league',
  'nfl':           'nfl',
  'nhl':           'nhl',
  'mlb':           'mlb',
};

function sportSlug(leagueSlug: string): string {
  return SPORT_MAP[leagueSlug] ?? leagueSlug;
}

// Safely turn "Boston Celtics" into "boston-celtics"
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const providers: Provider[] = [
  {
    id: 'streameast',
    name: 'StreamEast',
    // Pure iframe player path
    buildUrl: (m) => `https://streameast.app/embed/${slugify(m.homeTeam.name)}-vs-${slugify(m.awayTeam.name)}`,
  },
  {
    id: 'vipleague',
    name: 'VIPLeague',
    // Pure iframe player path
    buildUrl: (m) => `https://vipleague.im/embed/${slugify(m.homeTeam.name)}-${slugify(m.awayTeam.name)}-streaming`,
  },
  {
    id: 'totalsportek',
    name: 'TotalSportek',
    // Pure player embed
    buildUrl: (m) => `https://totalsportek.pro/embed/${slugify(m.homeTeam.name)}-vs-${slugify(m.awayTeam.name)}`,
  },
  {
    id: 'sportsembed',
    name: 'SportsEmbed',
    // Generic embed API structure
    buildUrl: (m) => `https://sportsembed.su/embed/live?id=${m.id}&sport=${sportSlug(m.leagueSlug)}`,
  },
  {
    id: 'daddylive',
    name: 'DaddyLive',
    // DaddyLive pure streaming player
    buildUrl: (m) => `https://daddylivehd.com/embed/stream-74.php`,
  },
];

export function getProvider(id: string) {
  return providers.find((p) => p.id === id);
}
