/**
 * ESPN Public API Provider
 *
 * Handles normalization of ESPN scoreboard and summary endpoints
 * into StreamSport's common Match model.
 *
 * Architecture: ESPN Provider → Repository → Hooks → UI
 */
import type { Match, Team, League, SportSlug, MatchState } from '@/lib/types';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const DEFAULT_TIMEOUT = 10_000; // 10 seconds

// ─── Raw ESPN shapes ──────────────────────────────────────────────────────────

interface EspnTeamRaw {
  id: string;
  displayName: string;
  abbreviation: string;
  logo?: string;
  location?: string;
}

interface EspnCompetitorRaw {
  id: string;
  homeAway: 'home' | 'away';
  score: string;
  team: EspnTeamRaw;
}

interface EspnStatusRaw {
  type: {
    state: MatchState;
    name: string;
    description: string;
    detail: string;
    shortDetail?: string;
  };
  displayClock?: string;
  period?: number;
}

interface EspnEventRaw {
  id: string;
  uid: string;
  date: string;
  name: string;
  shortName: string;
  competitions: {
    competitors: EspnCompetitorRaw[];
    status: EspnStatusRaw;
    venue?: { fullName?: string; city?: string; country?: string };
    headlines?: { shortLinkText?: string; description?: string }[];
  }[];
}

interface EspnScoreboardRaw {
  events?: EspnEventRaw[];
}

// ─── Helper: fetch with timeout ───────────────────────────────────────────────

async function fetchWithTimeout(url: string, ms = DEFAULT_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─── Normalization ────────────────────────────────────────────────────────────

function normalizeTeam(raw: EspnTeamRaw, sport: SportSlug): Team {
  return {
    id: raw.id,
    name: raw.displayName,
    shortName: raw.location ?? raw.displayName,
    abbreviation: raw.abbreviation,
    logo: raw.logo,
    sport,
  };
}

function normalizeMatch(
  event: EspnEventRaw,
  sport: SportSlug,
  leagueId: string,
  leagueName: string
): Match {
  const comp = event.competitions[0];
  const home = comp.competitors.find((c) => c.homeAway === 'home');
  const away = comp.competitors.find((c) => c.homeAway === 'away');
  const status = comp.status;

  const homeTeam: Team = home
    ? normalizeTeam(home.team, sport)
    : { id: 'home', name: 'Home', shortName: 'Home', abbreviation: 'HME', sport };
  const awayTeam: Team = away
    ? normalizeTeam(away.team, sport)
    : { id: 'away', name: 'Away', shortName: 'Away', abbreviation: 'AWY', sport };

  const league: League = {
    id: leagueId,
    name: leagueName,
    sport,
  };

  return {
    id: event.id,
    homeTeam,
    awayTeam,
    homeScore: parseInt(home?.score ?? '0', 10) || 0,
    awayScore: parseInt(away?.score ?? '0', 10) || 0,
    league,
    sport,
    state: status.type.state,
    statusDetail: status.type.detail || status.type.description,
    startTime: event.date,
    venue: comp.venue?.fullName,
    clockMinute: status.period,
    sourceProvider: 'espn',
    espnId: event.id,
  };
}

// ─── ESPN Scoreboard Fetch ────────────────────────────────────────────────────

async function fetchScoreboard(
  espnPath: string,
  sport: SportSlug,
  leagueId: string,
  leagueName: string
): Promise<Match[]> {
  try {
    const res = await fetchWithTimeout(`${ESPN_BASE}/${espnPath}/scoreboard`);
    if (!res.ok) return [];
    const data: EspnScoreboardRaw = await res.json();
    return (data.events ?? []).map((ev) =>
      normalizeMatch(ev, sport, leagueId, leagueName)
    );
  } catch {
    return [];
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fetch matches for a specific ESPN path */
export async function getMatchesByPath(
  espnPath: string,
  sport: SportSlug,
  leagueId: string,
  leagueName: string
): Promise<Match[]> {
  return fetchScoreboard(espnPath, sport, leagueId, leagueName);
}

/** Fetch all matches across all configured ESPN paths */
export async function getAllMatches(
  paths: { path: string; sport: string; leagueId: string; leagueName: string }[]
): Promise<Match[]> {
  const results = await Promise.allSettled(
    paths.map(({ path, sport, leagueId, leagueName }) =>
      fetchScoreboard(path, sport as SportSlug, leagueId, leagueName)
    )
  );
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}

/** Fetch a single match by ESPN event id and path */
export async function getMatchById(id: string, espnPath: string): Promise<Match | null> {
  try {
    const res = await fetchWithTimeout(`${ESPN_BASE}/${espnPath}/summary?event=${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    const header = data.header;
    if (!header?.competitions?.[0]) return null;
    const comp = header.competitions[0];
    const home = comp.competitors?.find((c: EspnCompetitorRaw) => c.homeAway === 'home');
    const away = comp.competitors?.find((c: EspnCompetitorRaw) => c.homeAway === 'away');
    if (!home || !away) return null;

    // Derive sport + league from path
    const sport: SportSlug = espnPath.includes('basketball')
      ? 'basketball'
      : espnPath.includes('mma') || espnPath.includes('ufc')
      ? 'ufc'
      : espnPath.includes('tennis')
      ? 'tennis'
      : espnPath.includes('racing')
      ? 'f1'
      : 'football';

    const leagueId = espnPath.split('/').pop() ?? 'unknown';

    return normalizeMatch(
      {
        id,
        uid: id,
        date: comp.date ?? new Date().toISOString(),
        name: `${home.team?.displayName ?? 'Home'} vs ${away.team?.displayName ?? 'Away'}`,
        shortName: `${home.team?.abbreviation ?? 'HME'} vs ${away.team?.abbreviation ?? 'AWY'}`,
        competitions: [{
          competitors: comp.competitors,
          status: comp.status ?? { type: { state: 'pre', name: 'Pre', description: 'Scheduled', detail: 'Scheduled' } },
          venue: comp.venue,
        }],
      },
      sport,
      leagueId,
      leagueId.toUpperCase()
    );
  } catch {
    return null;
  }
}

/** Search ESPN for matches matching a query term */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function searchEspn(_query: string): Promise<Match[]> {
  // ESPN doesn't have a public search API — we search cached match names client-side
  // This is handled in the repository layer
  return [];
}
