/**
 * Sports configuration catalog.
 * Add new sports here — UI auto-adapts.
 */
import type { SportConfig } from '@/lib/types';

export const SPORTS_CONFIG: SportConfig[] = [
  {
    slug: 'football',
    name: 'Football',
    icon: 'CircleDot',
    color: '#22c55e',
    leagues: [
      { id: 'eng.1',           name: 'Premier League',    shortName: 'EPL',  espnPath: 'soccer/eng.1',          tsdbId: '4328', country: 'England'  },
      { id: 'esp.1',           name: 'La Liga',            shortName: 'LL',   espnPath: 'soccer/esp.1',          tsdbId: '4335', country: 'Spain'    },
      { id: 'ger.1',           name: 'Bundesliga',         shortName: 'BL',   espnPath: 'soccer/ger.1',          tsdbId: '4331', country: 'Germany'  },
      { id: 'ita.1',           name: 'Serie A',            shortName: 'SA',   espnPath: 'soccer/ita.1',          tsdbId: '4332', country: 'Italy'    },
      { id: 'fra.1',           name: 'Ligue 1',            shortName: 'L1',   espnPath: 'soccer/fra.1',          tsdbId: '4334', country: 'France'   },
      { id: 'uefa.champions',  name: 'Champions League',   shortName: 'UCL',  espnPath: 'soccer/uefa.champions', tsdbId: '4480', country: 'Europe'   },
      { id: 'uefa.europa',     name: 'Europa League',      shortName: 'UEL',  espnPath: 'soccer/uefa.europa',    tsdbId: '4481', country: 'Europe'   },
    ],
  },
  {
    slug: 'basketball',
    name: 'Basketball',
    icon: 'Circle',
    color: '#f97316',
    leagues: [
      { id: 'nba',   name: 'NBA',         shortName: 'NBA',  espnPath: 'basketball/nba',    tsdbId: '4387', country: 'USA'    },
      { id: 'euroleague', name: 'EuroLeague', shortName: 'EL', espnPath: 'basketball/euroleague', tsdbId: '4399', country: 'Europe' },
    ],
  },
  {
    slug: 'ufc',
    name: 'UFC',
    icon: 'Swords',
    color: '#ef4444',
    leagues: [
      { id: 'ufc',  name: 'UFC',  espnPath: 'mma/ufc',  country: 'Global'  },
    ],
  },
  {
    slug: 'boxing',
    name: 'Boxing',
    icon: 'Target',
    color: '#a855f7',
    leagues: [
      { id: 'boxing', name: 'Boxing', country: 'Global' },
    ],
  },
  {
    slug: 'f1',
    name: 'Formula 1',
    icon: 'Flag',
    color: '#e11d48',
    leagues: [
      { id: 'f1', name: 'Formula 1', shortName: 'F1', espnPath: 'racing/f1', tsdbId: '4370', country: 'Global' },
    ],
  },
  {
    slug: 'tennis',
    name: 'Tennis',
    icon: 'CircleDot',
    color: '#eab308',
    leagues: [
      { id: 'atp', name: 'ATP Tour',     shortName: 'ATP', espnPath: 'tennis/atp', country: 'Global' },
      { id: 'wta', name: 'WTA Tour',     shortName: 'WTA', espnPath: 'tennis/wta', country: 'Global' },
      { id: 'wimbledon', name: 'Wimbledon', shortName: 'WIM', country: 'UK' },
      { id: 'usopen', name: 'US Open',   shortName: 'USO', country: 'USA' },
    ],
  },
];

/** Map from sport slug to sport config */
export const SPORTS_MAP = Object.fromEntries(
  SPORTS_CONFIG.map((s) => [s.slug, s])
) as Record<string, SportConfig>;

/** All ESPN paths we fetch in the live/schedule queries */
export const ALL_ESPN_PATHS = SPORTS_CONFIG.flatMap((sport) =>
  sport.leagues
    .filter((l) => l.espnPath)
    .map((l) => ({ path: l.espnPath!, sport: sport.slug, leagueId: l.id, leagueName: l.name }))
);

/** Sport display color */
export function getSportColor(slug: string): string {
  return SPORTS_MAP[slug]?.color ?? '#6b7280';
}

/** Sport display name */
export function getSportName(slug: string): string {
  return SPORTS_MAP[slug]?.name ?? slug;
}
