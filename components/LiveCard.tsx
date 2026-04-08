'use client';
import Link from 'next/link';
import type { APIMatch } from '@/lib/api';
import { getBadgeUrl, getSportIcon, getSportColor, isLive } from '@/lib/api';
import LiveBadge from './LiveBadge';

interface Props {
  match: APIMatch;
  index?: number;
}

export default function MatchCard({ match, index = 0 }: Props) {
  const live = isLive(match);
  const color = getSportColor(match.category);
  const icon = getSportIcon(match.category);
  const matchDate = new Date(match.date);
  const timeStr = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = matchDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const homeBadge = match.teams?.home?.badge ? getBadgeUrl(match.teams.home.badge) : '';
  const awayBadge = match.teams?.away?.badge ? getBadgeUrl(match.teams.away.badge) : '';

  return (
    <Link
      href={`/match/${match.id}?cat=${match.category}`}
      id={`card-${match.id}`}
      className="block slide-up focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-2xl"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <div className={`glass-card glass-card-hover h-full p-4 flex flex-col gap-3 relative overflow-hidden ${
        live ? 'border-red-500/20' : ''
      }`}>
        {/* Subtle sport color glow */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04] blur-3xl pointer-events-none"
          style={{ background: color.accent }}
        />

        {/* Header: sport + status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide truncate flex items-center gap-1.5">
            <span>{icon}</span>
            {match.category}
          </span>
          {live ? (
            <LiveBadge />
          ) : (
            <span className="text-[10px] text-slate-600 font-medium">{dateStr} · {timeStr}</span>
          )}
        </div>

        {/* Match title */}
        <p className="text-sm font-bold text-white leading-snug line-clamp-2">{match.title}</p>

        {/* Teams with badges */}
        {match.teams && (
          <div className="flex items-center gap-3 mt-auto">
            {match.teams.home && (
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {homeBadge && (
                  <img src={homeBadge} alt={match.teams.home.name} className="badge-img" loading="lazy" />
                )}
                <span className="text-xs font-semibold text-slate-300 truncate">{match.teams.home.name}</span>
              </div>
            )}
            <span className="text-[10px] text-slate-600 font-bold flex-shrink-0">VS</span>
            {match.teams.away && (
              <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                <span className="text-xs font-medium text-slate-400 truncate text-right">{match.teams.away.name}</span>
                {awayBadge && (
                  <img src={awayBadge} alt={match.teams.away.name} className="badge-img" loading="lazy" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Live bar */}
        {live && (
          <div className="flex items-center gap-1.5 pt-1">
            <div className="flex-1 h-px bg-red-500/15 rounded-full" />
            <span className="text-[8px] text-red-400/50 uppercase tracking-[0.2em]">in progress</span>
            <div className="flex-1 h-px bg-red-500/15 rounded-full" />
          </div>
        )}

        {/* Sources count */}
        {match.sources.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-emerald-500/60" />
            <span className="text-[10px] text-slate-600">{match.sources.length} source{match.sources.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
