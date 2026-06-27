/**
 * TanStack Query hooks — all data fetching.
 *
 * Data sources:
 *  - ESPN Public API  → live scores, schedule, match metadata
 *  - EmbedSportex API → per-match embed iframe URLs + additional events
 *  - TheSportsDB      → standings, team/player metadata
 *
 * The two match sources are MERGED: ESPN entries get espEmbeds injected
 * from EmbedSportex when a title match is found. EmbedSportex-only entries
 * (not in ESPN) are appended so we never miss a live event.
 *
 * Cache strategy:
 *  - All matches:   15s stale, 30s refetch
 *  - Standings:     30 minutes
 *  - Teams/Players: 24 hours
 */
import { useQuery } from '@tanstack/react-query';
import { getAllMatches } from '@/lib/api/espn';
import { getAllEspMatches } from '@/lib/api/embedsportex';
import {
  getTeamsByLeague,
  getPlayersByTeam,
  getTeam as tsdbGetTeam,
  getPlayer as tsdbGetPlayer,
  getLeague as tsdbGetLeague,
  getStandings as tsdbGetStandings,
  searchTeams,
  searchPlayers,
  searchLeagues,
} from '@/lib/api/thesportsdb';
import { ALL_ESPN_PATHS } from '@/lib/sports-config';
import type { Match, Team, Player, League, SportSlug } from '@/lib/types';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
  allMatches:      ['matches', 'all'] as const,
  liveMatches:     ['matches', 'live'] as const,
  upcomingMatches: (sport?: string) => ['matches', 'upcoming', sport ?? 'all'] as const,
  finishedMatches: (sport?: string) => ['matches', 'finished', sport ?? 'all'] as const,
  standings:       (leagueId: string, season: string) => ['standings', leagueId, season] as const,
  teams:           (leagueId: string) => ['teams', leagueId] as const,
  team:            (id: string) => ['team', id] as const,
  players:         (teamId: string) => ['players', teamId] as const,
  player:          (id: string) => ['player', id] as const,
  league:          (id: string) => ['league', id] as const,
  search:          (query: string) => ['search', query] as const,
};

// ─── Merge helper ────────────────────────────────────────────────────────────

/**
 * Fuzzy-match EmbedSportex entries into ESPN matches.
 * If an ESPN match shares team names with an EmbedSportex entry,
 * inject espEmbeds. Append remaining EmbedSportex-only entries.
 */
function mergeMatchSources(
  espnMatches: Match[],
  espMatches: Array<Match & { espEmbeds?: { server: string; url: string }[] }>
): Match[] {
  // Build a lookup: normalised "homeVsAway" → espEmbeds
  const espMap = new Map<string, { server: string; url: string }[]>();
  for (const m of espMatches) {
    const key1 = normalizeTeamName(m.homeTeam.name) + '|' + normalizeTeamName(m.awayTeam.name);
    const key2 = normalizeTeamName(m.awayTeam.name) + '|' + normalizeTeamName(m.homeTeam.name);
    if (m.espEmbeds && m.espEmbeds.length > 0) {
      espMap.set(key1, m.espEmbeds);
      espMap.set(key2, m.espEmbeds);
    }
  }

  // Inject embeds into ESPN matches where we find a name match
  const espnWithEmbeds: Match[] = espnMatches.map((m) => {
    const key = normalizeTeamName(m.homeTeam.name) + '|' + normalizeTeamName(m.awayTeam.name);
    const embeds = espMap.get(key);
    if (embeds && embeds.length > 0) {
      return { ...m, espEmbeds: embeds };
    }
    return m;
  });

  // Collect EmbedSportex IDs that were already merged. Build keys in both
  // home/away orderings since the two sources don't always agree on which
  // team is "home" — without this, a successfully-merged match could still
  // get appended a second time as a (spurious) EmbedSportex-only entry.
  const mergedKeys = new Set<string>();
  for (const m of espnWithEmbeds) {
    if (m.espEmbeds && m.espEmbeds.length > 0) {
      const k1 = normalizeTeamName(m.homeTeam.name) + '|' + normalizeTeamName(m.awayTeam.name);
      const k2 = normalizeTeamName(m.awayTeam.name) + '|' + normalizeTeamName(m.homeTeam.name);
      mergedKeys.add(k1);
      mergedKeys.add(k2);
    }
  }

  // Append EmbedSportex-only entries (not in ESPN at all)
  const extras: Match[] = espMatches.filter((m) => {
    const key = normalizeTeamName(m.homeTeam.name) + '|' + normalizeTeamName(m.awayTeam.name);
    return !mergedKeys.has(key);
  });

  return [...espnWithEmbeds, ...extras];
}

function normalizeTeamName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ─── Primary hook: all merged matches ────────────────────────────────────────

export function useAllMatches() {
  return useQuery({
    queryKey: queryKeys.allMatches,
    queryFn: async () => {
      const [espnResult, espResult] = await Promise.allSettled([
        getAllMatches(ALL_ESPN_PATHS),
        getAllEspMatches(),
      ]);
      const espnMatches = espnResult.status === 'fulfilled' ? espnResult.value : [];
      const espMatches  = espResult.status  === 'fulfilled' ? espResult.value  : [];
      return mergeMatchSources(espnMatches, espMatches);
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

// ─── Derived hooks ────────────────────────────────────────────────────────────

export function useLiveMatches(sport?: SportSlug | 'all') {
  const { data, ...rest } = useAllMatches();
  const live = (data ?? []).filter(
    (m) => m.state === 'in' && (sport && sport !== 'all' ? m.sport === sport : true)
  );
  return { data: live, ...rest };
}

export function useUpcomingMatches(sport?: SportSlug | 'all', limit?: number) {
  const { data, ...rest } = useAllMatches();
  let upcoming = (data ?? [])
    .filter((m) => m.state === 'pre' && (sport && sport !== 'all' ? m.sport === sport : true))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  if (limit) upcoming = upcoming.slice(0, limit);
  return { data: upcoming, ...rest };
}

export function useFinishedMatches(sport?: SportSlug | 'all', limit?: number) {
  const { data, ...rest } = useAllMatches();
  let finished = (data ?? [])
    .filter((m) => m.state === 'post' && (sport && sport !== 'all' ? m.sport === sport : true))
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  if (limit) finished = finished.slice(0, limit);
  return { data: finished, ...rest };
}

export function useTodaysMatches(sport?: SportSlug | 'all') {
  const { data, ...rest } = useAllMatches();
  const todayStr = new Date().toDateString();
  const todays = (data ?? []).filter((m) => {
    const matchDate = new Date(m.startTime).toDateString();
    return matchDate === todayStr && (sport && sport !== 'all' ? m.sport === sport : true);
  });
  return { data: todays, ...rest };
}

export function useSportMatches(sport: SportSlug) {
  const { data, ...rest } = useAllMatches();
  return { data: (data ?? []).filter((m) => m.sport === sport), ...rest };
}

export function useMatchSearch(query: string) {
  const { data, ...rest } = useAllMatches();
  if (!query.trim()) return { data: [] as Match[], ...rest };
  const q = query.toLowerCase();
  const results = (data ?? []).filter(
    (m) =>
      m.homeTeam.name.toLowerCase().includes(q) ||
      m.awayTeam.name.toLowerCase().includes(q) ||
      m.league.name.toLowerCase().includes(q) ||
      m.sport.toLowerCase().includes(q)
  );
  return { data: results, ...rest };
}

// ─── Standings ────────────────────────────────────────────────────────────────

export function useStandings(leagueId: string, season: string) {
  return useQuery({
    queryKey: queryKeys.standings(leagueId, season),
    queryFn: () => tsdbGetStandings(leagueId, season),
    staleTime: 30 * 60 * 1000,
    enabled: !!(leagueId && season),
  });
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export function useTeams(leagueId: string) {
  return useQuery({
    queryKey: queryKeys.teams(leagueId),
    queryFn: () => getTeamsByLeague(leagueId),
    staleTime: 24 * 60 * 60 * 1000,
    enabled: !!leagueId,
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: queryKeys.team(teamId),
    queryFn: () => tsdbGetTeam(teamId),
    staleTime: 24 * 60 * 60 * 1000,
    enabled: !!teamId,
  });
}

// ─── Players ──────────────────────────────────────────────────────────────────

export function usePlayers(teamId: string) {
  return useQuery({
    queryKey: queryKeys.players(teamId),
    queryFn: () => getPlayersByTeam(teamId),
    staleTime: 24 * 60 * 60 * 1000,
    enabled: !!teamId,
  });
}

export function usePlayer(playerId: string) {
  return useQuery({
    queryKey: queryKeys.player(playerId),
    queryFn: () => tsdbGetPlayer(playerId),
    staleTime: 24 * 60 * 60 * 1000,
    enabled: !!playerId,
  });
}

// ─── League ───────────────────────────────────────────────────────────────────

export function useLeague(leagueId: string) {
  return useQuery({
    queryKey: queryKeys.league(leagueId),
    queryFn: () => tsdbGetLeague(leagueId),
    staleTime: 24 * 60 * 60 * 1000,
    enabled: !!leagueId,
  });
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: async () => {
      if (!query.trim()) return { teams: [], players: [], leagues: [] };
      const [teams, players, leagues] = await Promise.allSettled([
        searchTeams(query),
        searchPlayers(query),
        searchLeagues(query),
      ]);
      return {
        teams:   teams.status   === 'fulfilled' ? teams.value   : ([] as Team[]),
        players: players.status === 'fulfilled' ? players.value : ([] as Player[]),
        leagues: leagues.status === 'fulfilled' ? leagues.value : ([] as League[]),
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: query.trim().length >= 2,
  });
}
