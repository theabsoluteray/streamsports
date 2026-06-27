'use client';

import Link from 'next/link';
import { cn, formatMatchDate } from '@/lib/utils';
import { getSportColor } from '@/lib/sports-config';
import type { Match } from '@/lib/types';
import { TeamLogo } from '@/components/ImageWithFallback';

interface MatchTileProps {
  match: Match;
}

/** Compact score tile for horizontal scroll rows — centered design matching reference */
export function MatchTile({ match }: MatchTileProps) {
  const isLive     = match.state === 'in';
  const isFinished = match.state === 'post';
  const sportColor = getSportColor(match.sport);
  const href = `/match/${match.id}?sport=${match.sport}&league=${match.league.id}`;

  return (
    <Link href={href} className="match-tile block">
      <div className="p-5">
        {/* Top: badge + status */}
        <div className="flex items-center justify-between mb-4">
          {isLive ? (
            <span className="badge-live">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
              LIVE
            </span>
          ) : isFinished ? (
            <span className="badge-ft">FT</span>
          ) : (
            <span className="badge-upcoming">
              {formatMatchDate(match.startTime).replace(/^.+,\s/, '')}
            </span>
          )}
          {isLive && match.statusDetail && (
            <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
              {match.statusDetail}
            </span>
          )}
        </div>

        {/* Center: teams and score */}
        <div className="flex items-center justify-between gap-3">
          {/* Home team */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <TeamLogo logo={match.homeTeam.logo} name={match.homeTeam.name} size={28} className="flex-shrink-0" />
            <span className="text-[12px] font-semibold text-center truncate w-full text-[var(--text-primary)]">
              {match.homeTeam.shortName || match.homeTeam.name}
            </span>
          </div>

          {/* Score / Time */}
          <div className="flex flex-col items-center flex-shrink-0 px-2">
            {(isLive || isFinished) ? (
              <span className="score-num text-[22px] text-[var(--text-primary)] leading-none whitespace-nowrap">
                {match.homeScore} - {match.awayScore}
              </span>
            ) : (
              <span className="text-[13px] font-bold text-[var(--text-muted)]">VS</span>
            )}
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <TeamLogo logo={match.awayTeam.logo} name={match.awayTeam.name} size={28} className="flex-shrink-0" />
            <span className="text-[12px] font-semibold text-center truncate w-full text-[var(--text-secondary)]">
              {match.awayTeam.shortName || match.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Bottom: league + sport */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: sportColor }}
            />
            <span className="text-[11px] font-medium text-[var(--text-muted)] truncate">
              {match.league.shortName || match.league.name}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex-shrink-0">
            {match.sport === 'f1' ? 'F1' : match.sport === 'ufc' ? 'UFC' : ''}
          </span>
        </div>

        {/* Pre-match: full date */}
        {match.state === 'pre' && (
          <div
            className="text-center text-[10px] font-bold text-[var(--text-muted)] mt-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            {formatMatchDate(match.startTime)}
          </div>
        )}
      </div>
    </Link>
  );
}

export function MatchTileSkeleton() {
  return (
    <div className="match-tile" style={{ height: 180 }}>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="skeleton h-3 w-14" />
          <div className="skeleton h-3 w-10" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="skeleton w-10 h-10 rounded-full" />
            <div className="skeleton h-2.5 w-16" />
          </div>
          <div className="skeleton h-6 w-14" />
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="skeleton w-10 h-10 rounded-full" />
            <div className="skeleton h-2.5 w-16" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="skeleton h-2.5 w-20" />
        </div>
      </div>
    </div>
  );
}
