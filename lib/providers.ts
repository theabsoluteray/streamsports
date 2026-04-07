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
    name: 'StreamEast (Embed)',
    // Exact pure-iframe path for StreamEast
    buildUrl: (m) => `https://v2.gostreameast.link/embed/${slugify(m.homeTeam.name)}-${slugify(m.awayTeam.name)}`,
  },
  {
    id: 'sportsurge',
    name: 'SportSurge (Match)',
    buildUrl: (m) => `https://sportsurge.bz/${sportSlug(m.leagueSlug)}`, // Aggregate only, fallback
  },
  {
    id: 'viprow',
    name: 'VIPRow (Match)',
    // VIPRow uses "home-vs-away-online-stream"
    buildUrl: (m) => `https://www.viprow.co/${slugify(m.homeTeam.name)}-vs-${slugify(m.awayTeam.name)}-online-stream`,
  },
  {
    id: 'totalsportek',
    name: 'TotalSportek (Match)',
    // Total uses "home-vs-away"
    buildUrl: (m) => `https://totalsportek.events/${slugify(m.homeTeam.name)}-vs-${slugify(m.awayTeam.name)}`,
  },
  {
    id: 'streamcorner',
    name: 'StreamCorner (Match)',
    buildUrl: (m) => `https://streamcorner.info/${slugify(m.homeTeam.name)}-vs-${slugify(m.awayTeam.name)}`,
  },
  {
    id: 'daddylive',
    name: 'DaddyLive (Channel 1)',
    // DaddyLive uses channel IDs. We can't know the exact channel, so map to ch1 as fallback
    buildUrl: (m) => `https://daddylive.top/embed/stream-1.php`,
  },
  {
    id: 'sportsembed',
    name: 'SportsEmbed (API)',
    // sportsembed uses arbitrary IDs
    buildUrl: (m) => `https://sportsembed.su/embed?id=1`,
  },
];

export function getProvider(id: string) {
  return providers.find((p) => p.id === id);
}
