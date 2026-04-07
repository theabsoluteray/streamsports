'use client';
import Link from 'next/link';
import Image from 'next/image';
import type { Match } from '@/lib/api';

interface Props { match: Match; index?: number; }

function Badge({ state }: { state: Match['state'] }) {
  if (state === 'in') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase tracking-wider">
      <span className="live-dot w-1.5 h-1.5 rounded-full bg-red-500" />
      Live
    </span>
  );
  if (state === 'post') return (
    <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wide">Final</span>
  );
  return null; // upcoming — time shown from statusDetail
}

export default function MatchCard({ match, index = 0 }: Props) {
  const live = match.state === 'in';
  const finished = match.state === 'post';

  return (
    <Link
      href={`/match/${match.id}?path=${encodeURIComponent(match.sportPath)}`}
      id={`card-${match.id}`}
      className="block slide-up focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-xl"
      style={{ animationDelay: `${Math.min(index * 30, 350)}ms` }}
    >
      <div className={`h-full bg-[#0c1526] border rounded-xl p-4 hover:bg-[#0f1a2e] transition-all duration-200 flex flex-col gap-2.5 ${
        live ? 'border-red-500/20' : 'border-white/6 hover:border-blue-500/20'
      }`}>

        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide truncate">
            {match.sport} · {match.league}
          </span>
          <Badge state={match.state} />
        </div>

        {/* Status detail (time for upcoming, game clock for live) */}
        {!live && !finished && (
          <p className="text-[10px] text-slate-600 -mt-1 truncate">{match.statusDetail}</p>
        )}
        {live && (
          <p className="text-[10px] text-blue-400/70 -mt-1">{match.statusDetail}</p>
        )}

        {/* Teams + Score */}
        <div className="flex flex-col gap-2 flex-1">
          {[
            { team: match.homeTeam, score: match.homeScore },
            { team: match.awayTeam, score: match.awayScore },
          ].map(({ team, score }, ti) => (
            <div key={ti} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {team.logo && (
                  <Image
                    src={team.logo}
                    alt={team.name}
                    width={18}
                    height={18}
                    className="flex-shrink-0 rounded-sm"
                    unoptimized
                  />
                )}
                <span className={`text-sm leading-tight truncate ${ti === 0 ? 'font-semibold text-white' : 'text-slate-400'}`}>
                  {team.name}
                </span>
              </div>
              {(live || finished) && (
                <span className={`font-bold text-sm tabular-nums flex-shrink-0 ${ti === 0 ? 'text-white' : 'text-slate-400'}`}>
                  {score}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Live indicator */}
        {live && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex-1 h-px bg-red-500/15 rounded-full" />
            <span className="text-[9px] text-red-400/50 uppercase tracking-widest">in progress</span>
            <div className="flex-1 h-px bg-red-500/15 rounded-full" />
          </div>
        )}
      </div>
    </Link>
  );
}
