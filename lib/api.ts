/**
 * ESPN Public Scoreboard API
 *
 * Base: https://site.api.espn.com/apis/site/v2/sports
 *
 * Leagues used:
 *  Football (soccer) — eng.1, esp.1, ger.1, ita.1, fra.1, uefa.champions
 *  Basketball (NBA)  — basketball/nba
 */

export type Sport = 'Football' | 'Basketball';

export interface Team {
  name: string;
  abbreviation: string;
  logo?: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: string;
  awayScore: string;
  league: string;
  leagueSlug: string;   // e.g. "nba", "eng.1"
  sport: Sport;
  sportPath: string;    // e.g. "basketball/nba", "soccer/eng.1"
  /** 'pre' | 'in' | 'post' — ESPN status state */
  state: 'pre' | 'in' | 'post';
  statusDetail: string; // human-readable e.g. "Q3 - 4:23", "Final", "Sat, April 12th at 7:00 PM"
  startTime: string;    // ISO
  thumb?: string;
}

// ─── League catalog ──────────────────────────────────────────────────────────
const FOOTBALL_LEAGUES = [
  { slug: 'eng.1',          name: 'Premier League'     },
  { slug: 'esp.1',          name: 'La Liga'             },
  { slug: 'ger.1',          name: 'Bundesliga'          },
  { slug: 'ita.1',          name: 'Serie A'             },
  { slug: 'fra.1',          name: 'Ligue 1'             },
  { slug: 'uefa.champions', name: 'Champions League'   },
];

const ESPN = 'https://site.api.espn.com/apis/site/v2/sports';

// ─── Raw ESPN types ───────────────────────────────────────────────────────────
interface EspnCompetitor {
  homeAway: 'home' | 'away';
  score: string;
  team: { displayName: string; abbreviation: string; logo?: string };
}

interface EspnEvent {
  id: string;
  name: string;
  date: string;
  competitions: [{
    competitors: EspnCompetitor[];
    status: {
      type: {
        state: 'pre' | 'in' | 'post';
        description: string;
        detail: string;
      };
    };
  }];
}

interface EspnScoreboard { events?: EspnEvent[] }

function normalise(ev: EspnEvent, sport: Sport, sportPath: string, league: string, leagueSlug: string): Match {
  const comp = ev.competitions[0];
  const home = comp.competitors.find((c) => c.homeAway === 'home')!;
  const away = comp.competitors.find((c) => c.homeAway === 'away')!;
  const st = comp.status.type;
  return {
    id: ev.id,
    homeTeam: { name: home.team.displayName, abbreviation: home.team.abbreviation, logo: home.team.logo },
    awayTeam: { name: away.team.displayName, abbreviation: away.team.abbreviation, logo: away.team.logo },
    homeScore: home.score ?? '0',
    awayScore: away.score ?? '0',
    league,
    leagueSlug,
    sport,
    sportPath,
    state: st.state,
    statusDetail: st.detail || st.description,
    startTime: ev.date,
  };
}

async function fetchScoreboard(path: string): Promise<EspnEvent[]> {
  try {
    const r = await fetch(`${ESPN}/${path}/scoreboard`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 }, // Next.js cache hint
    });
    if (!r.ok) return [];
    const d: EspnScoreboard = await r.json();
    return d.events ?? [];
  } catch {
    return [];
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fetch all NBA + football scoreboard events in parallel */
export async function fetchAllMatches(): Promise<Match[]> {
  const [nbaEvents, ...soccerResults] = await Promise.all([
    fetchScoreboard('basketball/nba'),
    ...FOOTBALL_LEAGUES.map((l) => fetchScoreboard(`soccer/${l.slug}`)),
  ]);

  const matches: Match[] = [];

  // NBA
  for (const ev of nbaEvents) {
    matches.push(normalise(ev, 'Basketball', 'basketball/nba', 'NBA', 'nba'));
  }

  // Football (soccer)
  for (let i = 0; i < FOOTBALL_LEAGUES.length; i++) {
    const { slug, name } = FOOTBALL_LEAGUES[i];
    for (const ev of soccerResults[i]) {
      matches.push(normalise(ev, 'Football', `soccer/${slug}`, name, slug));
    }
  }

  return matches;
}

/** Fetch a single event by ESPN id + sport path (e.g. "basketball/nba") */
export async function fetchMatchById(id: string, sportPath?: string): Promise<Match | null> {
  // Try to figure out sportPath from the id prefix if not given
  const paths = sportPath
    ? [sportPath]
    : ['basketball/nba', ...FOOTBALL_LEAGUES.map((l) => `soccer/${l.slug}`)];

  for (const path of paths) {
    try {
      const r = await fetch(`${ESPN}/${path}/summary?event=${id}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (!r.ok) continue;
      const d = await r.json();
      // summary returns game header
      const header = d.header;
      if (!header) continue;
      const comp = header.competitions?.[0];
      if (!comp) continue;
      const home = comp.competitors?.find((c: EspnCompetitor) => c.homeAway === 'home');
      const away = comp.competitors?.find((c: EspnCompetitor) => c.homeAway === 'away');
      if (!home || !away) continue;
      const league = FOOTBALL_LEAGUES.find((l) => path.includes(l.slug))?.name ?? 'NBA';
      const leagueSlug = FOOTBALL_LEAGUES.find((l) => path.includes(l.slug))?.slug ?? 'nba';
      const sport: Sport = path.includes('basketball') ? 'Basketball' : 'Football';
      const st = comp.status?.type ?? {};
      return {
        id,
        homeTeam: { name: home.team?.displayName ?? '', abbreviation: home.team?.abbreviation ?? '' },
        awayTeam: { name: away.team?.displayName ?? '', abbreviation: away.team?.abbreviation ?? '' },
        homeScore: home.score ?? '0',
        awayScore: away.score ?? '0',
        league,
        leagueSlug,
        sport,
        sportPath: path,
        state: st.state ?? 'pre',
        statusDetail: st.detail ?? st.description ?? '',
        startTime: comp.date ?? '',
      };
    } catch {
      continue;
    }
  }
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLive(matches: Match[]) {
  return matches.filter((m) => m.state === 'in');
}

export function getUpcoming(matches: Match[]) {
  return matches
    .filter((m) => m.state === 'pre')
    .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
}

export function filterBySport(matches: Match[], sport: string) {
  if (sport === 'All') return matches;
  return matches.filter((m) => m.sport === sport);
}

export function searchMatches(matches: Match[], q: string) {
  const lq = q.toLowerCase();
  return matches.filter(
    (m) =>
      m.homeTeam.name.toLowerCase().includes(lq) ||
      m.awayTeam.name.toLowerCase().includes(lq) ||
      m.league.toLowerCase().includes(lq) ||
      m.sport.toLowerCase().includes(lq)
  );
}

export const SPORTS: string[] = ['All', 'Football', 'Basketball'];
