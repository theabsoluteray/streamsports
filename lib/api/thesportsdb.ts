/**
 * TheSportsDB API Provider
 *
 * Free API tier — uses the shared public test key '123'.
 * Docs: https://www.thesportsdb.com/documentation
 *
 * IMPORTANT — free tier limitations (as of the current docs):
 * - searchteams.php / searchplayers.php are hard-limited to their single
 *   documented example ('Arsenal' / 'Danny_Welbeck'). Arbitrary real-world
 *   queries return an EMPTY result, not partial data — there's no team/player
 *   object at all, so there's nothing to render (incl. no badge/photo).
 * - lookuptable.php (standings) only works for "featured soccer leagues";
 *   non-soccer leagues (e.g. NBA) will return null.
 * - lookup_all_teams.php / lookup_all_players.php (by numeric ID) are legacy
 *   endpoints no longer listed in the official docs — they may still work
 *   for some leagues but aren't guaranteed.
 * UI code consuming this provider should treat "no data" as an expected,
 * common outcome on the free tier — not as an error condition.
 *
 * Used for:
 * - Enriched team/player metadata
 * - League standings
 * - Competition info & logos
 * - Next/last events per team
 */
import type { Team, League, Player, Standing, StandingEntry, SportSlug } from '@/lib/types';

const TSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/123'; // Current free/test key
const DEFAULT_TIMEOUT = 10_000;

// ─── Raw TSDB shapes ──────────────────────────────────────────────────────────

interface TsdbTeam {
  idTeam: string;
  strTeam: string;
  strTeamShort?: string;
  strAlternate?: string;
  strBadge?: string;
  strLogo?: string;
  strThumb?: string;
  strCountry?: string;
  idLeague?: string;
  strLeague?: string;
  strSport?: string;
}

interface TsdbPlayer {
  idPlayer: string;
  strPlayer: string;
  strPosition?: string;
  strNationality?: string;
  dateBorn?: string;
  strThumb?: string;
  idTeam?: string;
  strTeam?: string;
  strSport?: string;
}

interface TsdbLeague {
  idLeague: string;
  strLeague: string;
  strLeagueAlternate?: string;
  strSport?: string;
  strBadge?: string;
  strLogo?: string;
  strCountry?: string;
  strCurrentSeason?: string;
}

interface TsdbStanding {
  idStanding: string;
  intRank: string;
  idTeam: string;
  strTeam: string;
  strBadge?: string;
  intPlayed: string;
  intWin: string;
  intDraw: string;
  intLoss: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
  strForm?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function tsdbFetch<T>(endpoint: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  try {
    const res = await fetch(`${TSDB_BASE}/${endpoint}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

function sportFromString(str?: string): SportSlug {
  const s = (str ?? '').toLowerCase();
  if (s.includes('soccer') || s.includes('football')) return 'football';
  if (s.includes('basketball')) return 'basketball';
  if (s.includes('tennis')) return 'tennis';
  if (s.includes('boxing')) return 'boxing';
  if (s.includes('formula') || s.includes('f1') || s.includes('motor')) return 'f1';
  if (s.includes('rugby')) return 'rugby';
  if (s.includes('cricket')) return 'cricket';
  if (s.includes('mma') || s.includes('ufc')) return 'ufc';
  return 'football';
}

function normalizeTeam(raw: TsdbTeam): Team {
  return {
    id: raw.idTeam,
    name: raw.strTeam,
    shortName: raw.strTeamShort ?? raw.strTeam,
    abbreviation: (raw.strTeamShort ?? raw.strTeam).slice(0, 3).toUpperCase(),
    logo: raw.strLogo ?? raw.strBadge,
    badge: raw.strBadge,
    country: raw.strCountry,
    league: raw.strLeague,
    sport: sportFromString(raw.strSport),
  };
}

function normalizePlayer(raw: TsdbPlayer): Player {
  return {
    id: raw.idPlayer,
    name: raw.strPlayer,
    position: raw.strPosition,
    nationality: raw.strNationality,
    dateOfBirth: raw.dateBorn,
    photo: raw.strThumb,
    teamId: raw.idTeam,
    teamName: raw.strTeam,
    sport: sportFromString(raw.strSport),
  };
}

function normalizeLeague(raw: TsdbLeague): League {
  return {
    id: raw.idLeague,
    name: raw.strLeague,
    shortName: raw.strLeagueAlternate,
    logo: raw.strLogo ?? raw.strBadge,
    country: raw.strCountry,
    sport: sportFromString(raw.strSport),
    currentSeason: raw.strCurrentSeason,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Get teams for a league by TSDB league id */
export async function getTeamsByLeague(leagueId: string): Promise<Team[]> {
  const data = await tsdbFetch<{ teams: TsdbTeam[] | null }>(`lookup_all_teams.php?id=${leagueId}`);
  return (data?.teams ?? []).map(normalizeTeam);
}

/** Get players for a team by TSDB team id */
export async function getPlayersByTeam(teamId: string): Promise<Player[]> {
  const data = await tsdbFetch<{ player: TsdbPlayer[] | null }>(`lookup_all_players.php?id=${teamId}`);
  return (data?.player ?? []).map(normalizePlayer);
}

/** Look up a single team by TSDB team id */
export async function getTeam(teamId: string): Promise<Team | null> {
  const data = await tsdbFetch<{ teams: TsdbTeam[] | null }>(`lookupteam.php?id=${teamId}`);
  const raw = data?.teams?.[0];
  return raw ? normalizeTeam(raw) : null;
}

/** Look up a single player by TSDB player id */
export async function getPlayer(playerId: string): Promise<Player | null> {
  const data = await tsdbFetch<{ players: TsdbPlayer[] | null }>(`lookupplayer.php?id=${playerId}`);
  const raw = data?.players?.[0];
  return raw ? normalizePlayer(raw) : null;
}

/** Get league info by TSDB league id */
export async function getLeague(leagueId: string): Promise<League | null> {
  const data = await tsdbFetch<{ leagues: TsdbLeague[] | null }>(`lookupleague.php?id=${leagueId}`);
  const raw = data?.leagues?.[0];
  return raw ? normalizeLeague(raw) : null;
}

/** Get league table (standings) by TSDB league id + season string */
export async function getStandings(leagueId: string, season: string): Promise<Standing | null> {
  const data = await tsdbFetch<{ table: TsdbStanding[] | null }>(
    `lookuptable.php?l=${leagueId}&s=${season}`
  );
  if (!data?.table) return null;

  const league = await getLeague(leagueId);
  if (!league) return null;

  const entries: StandingEntry[] = data.table.map((row) => ({
    rank: parseInt(row.intRank, 10),
    team: {
      id: row.idTeam,
      name: row.strTeam,
      shortName: row.strTeam,
      abbreviation: row.strTeam.slice(0, 3).toUpperCase(),
      logo: row.strBadge,
      sport: league.sport,
    },
    played: parseInt(row.intPlayed, 10),
    won: parseInt(row.intWin, 10),
    drawn: parseInt(row.intDraw, 10),
    lost: parseInt(row.intLoss, 10),
    goalsFor: parseInt(row.intGoalsFor, 10),
    goalsAgainst: parseInt(row.intGoalsAgainst, 10),
    goalDifference: parseInt(row.intGoalDifference, 10),
    points: parseInt(row.intPoints, 10),
    form: row.strForm,
  }));

  return { league, season, entries };
}

/** Search for teams by name */
export async function searchTeams(query: string): Promise<Team[]> {
  const data = await tsdbFetch<{ teams: TsdbTeam[] | null }>(`searchteams.php?t=${encodeURIComponent(query)}`);
  return (data?.teams ?? []).map(normalizeTeam);
}

/** Search for players by name */
export async function searchPlayers(query: string): Promise<Player[]> {
  const data = await tsdbFetch<{ player: TsdbPlayer[] | null }>(`searchplayers.php?p=${encodeURIComponent(query)}`);
  return (data?.player ?? []).map(normalizePlayer);
}

/** Search leagues by name */
export async function searchLeagues(query: string): Promise<League[]> {
  const data = await tsdbFetch<{ countrys: TsdbLeague[] | null }>(`search_all_leagues.php?s=${encodeURIComponent(query)}`);
  return (data?.countrys ?? []).map(normalizeLeague);
}
