'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn, formatMatchDate } from '@/lib/utils';
import { getSportColor } from '@/lib/sports-config';
import { Play, MapPin } from 'lucide-react';
import type { Match } from '@/lib/types';
import { TeamLogo } from '@/components/ImageWithFallback';

interface MatchCardProps {
  match: Match;
  index?: number;
  compact?: boolean;
  /** Show as 16:9 streaming card instead of score card */
  streaming?: boolean;
  /** Fixed width for horizontal scroll rows */
  fixedWidth?: number;
}

// ─── Streaming Card (Netflix 16:9 style) ─────────────────────────────────────

export function StreamingCard({ match, index = 0, fixedWidth = 280 }: { match: Match; index?: number; fixedWidth?: number }) {
  const isLive     = match.state === 'in';
  const isFinished = match.state === 'post';
  const sportColor = getSportColor(match.sport);
  const href = `/match/${match.id}?sport=${match.sport}&league=${match.league.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.24), ease: [0.16, 1, 0.3, 1] }}
      style={{ width: fixedWidth, flexShrink: 0 }}
    >
      <Link href={href} aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name}`}>
        <article className="match-card-stream">
          {/* Thumbnail 16:9 */}
          <div className="stream-thumb relative" style={{ background: 'var(--bg-elevated)' }}>
            {/* Background gradient (fallback when no poster) */}
            <div
              className="absolute inset-0"
              style={{
                background: match.thumb
                  ? `url(${match.thumb}) center/cover no-repeat`
                  : `linear-gradient(135deg, ${sportColor}22 0%, #0a0a0a 100%)`,
              }}
            />

            {/* Gradient overlay for text readability */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.3) 55%, transparent 100%)',
              }}
            />

            {/* Live sport badge top-left */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {isLive ? (
                <span className="badge-live">
                  <span className="live-dot w-1.5 h-1.5 rounded-full bg-white" />
                  Live
                </span>
              ) : isFinished ? (
                <span className="badge-ft">Full time</span>
              ) : (
                <span className="badge-upcoming">
                  {formatMatchDate(match.startTime).replace(/^.+,\s/, '')}
                </span>
              )}
            </div>

            {/* Sport color strip top-right */}
            <div
              className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{ background: `${sportColor}28`, color: sportColor, border: `1px solid ${sportColor}40` }}
            >
              {match.sport === 'f1' ? 'F1' : match.sport.charAt(0).toUpperCase() + match.sport.slice(1)}
            </div>

            {/* Center play icon (fades in on hover) */}
            <div className="stream-play-icon">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(0,0,0,0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Play size={18} fill="white" className="text-white ml-0.5" />
              </div>
            </div>

            {/* Score overlay bottom (for live/finished) */}
            {(isLive || isFinished) && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="score-num text-[22px] text-white leading-none">
                  {match.homeScore}
                  <span className="text-white/40 mx-1.5">–</span>
                  {match.awayScore}
                </span>
                {isLive && match.statusDetail && (
                  <span className="text-[10px] font-bold" style={{ color: 'var(--live-red)' }}>
                    {match.statusDetail}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Card footer */}
          <div className="p-3.5">
            {/* League */}
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: sportColor }}>
              {match.league.name}
            </p>

            {/* Teams */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <TeamLogo logo={match.homeTeam.logo} name={match.homeTeam.name} size={18} className="flex-shrink-0" />
                <span className="text-[13px] font-semibold truncate text-[var(--text-primary)]">
                  {match.homeTeam.shortName || match.homeTeam.name}
                </span>
              </div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] flex-shrink-0">vs</span>
              <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                <span className="text-[13px] font-semibold truncate text-[var(--text-secondary)] text-right">
                  {match.awayTeam.shortName || match.awayTeam.name}
                </span>
                <TeamLogo logo={match.awayTeam.logo} name={match.awayTeam.name} size={18} className="flex-shrink-0" />
              </div>
            </div>

            {/* Pre-match: kickoff time */}
            {match.state === 'pre' && (
              <p className="text-[11px] font-medium text-[var(--text-muted)] mt-2">
                {formatMatchDate(match.startTime)}
              </p>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

// ─── Classic Score Card (grid / list layouts) ─────────────────────────────────

export function MatchCard({ match, index = 0, compact = false }: MatchCardProps) {
  const isLive     = match.state === 'in';
  const isFinished = match.state === 'post';
  const sportColor = getSportColor(match.sport);
  const href = `/match/${match.id}?sport=${match.sport}&league=${match.league.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.24), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={href} className="block h-full" aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name}`}>
        <article className="score-card h-full flex flex-col">
          {/* League header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sportColor }} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] truncate">
                {match.league.name}
              </span>
            </div>
            {isLive ? (
              <span className="badge-live flex-shrink-0">
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-white" />
                {match.statusDetail || 'Live'}
              </span>
            ) : isFinished ? (
              <span className="badge-ft flex-shrink-0">Full time</span>
            ) : (
              <span className="badge-upcoming flex-shrink-0">{formatMatchDate(match.startTime)}</span>
            )}
          </div>

          {/* Scoreboard */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <TeamLogo logo={match.homeTeam.logo} name={match.homeTeam.name} size={22} />
              <span className={cn('flex-1 text-[14px] font-semibold truncate',
                isLive && match.homeScore > match.awayScore
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)]'
              )}>
                {match.homeTeam.shortName || match.homeTeam.name}
              </span>
              {(isLive || isFinished) && (
                <span className={cn('score-num text-[17px] flex-shrink-0',
                  isLive && match.homeScore > match.awayScore
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)]'
                )}>
                  {match.homeScore}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <TeamLogo logo={match.awayTeam.logo} name={match.awayTeam.name} size={22} />
              <span className={cn('flex-1 text-[14px] font-semibold truncate',
                isLive && match.awayScore > match.homeScore
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)]'
              )}>
                {match.awayTeam.shortName || match.awayTeam.name}
              </span>
              {(isLive || isFinished) && (
                <span className={cn('score-num text-[17px] flex-shrink-0',
                  isLive && match.awayScore > match.homeScore
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)]'
                )}>
                  {match.awayScore}
                </span>
              )}
            </div>

            {match.state === 'pre' && (
              <div className="pt-1 flex items-center gap-1.5">
                <Play size={11} style={{ color: 'var(--primary)' }} />
                <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                  {formatMatchDate(match.startTime)}
                </span>
              </div>
            )}
          </div>

          {!compact && (
            <div
              className="mt-3 pt-3 border-t flex items-center justify-between"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              {match.venue ? (
                <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] truncate max-w-[70%]">
                  <MapPin size={10} className="flex-shrink-0" />
                  {match.venue}
                </span>
              ) : (
                <span className="text-[10px] capitalize text-[var(--text-muted)]">{match.sport}</span>
              )}
              <span className="text-[10px] font-bold" style={{ color: 'var(--primary)' }}>
                {isLive ? 'Watch →' : 'Details →'}
              </span>
            </div>
          )}
        </article>
      </Link>
    </motion.div>
  );
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

export function LiveBadge({ detail }: { detail: string }) {
  return (
    <span className="badge-live">
      <span className="live-dot w-1.5 h-1.5 rounded-full bg-white" />
      {detail || 'LIVE'}
    </span>
  );
}

export function StreamingCardSkeleton({ width = 280 }: { width?: number }) {
  return (
    <div className="match-card-stream" style={{ width, flexShrink: 0 }}>
      <div className="stream-thumb skeleton rounded-none" />
      <div className="p-3.5 space-y-2">
        <div className="skeleton h-2.5 w-16" />
        <div className="flex items-center gap-2">
          <div className="skeleton w-4 h-4 rounded-full" />
          <div className="skeleton h-3 flex-1" />
          <div className="skeleton h-3 w-12" />
          <div className="skeleton w-4 h-4 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="score-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="skeleton h-2.5 w-24" />
        <div className="skeleton h-2.5 w-12" />
      </div>
      <div className="flex items-center gap-2.5">
        <div className="skeleton w-5 h-5 rounded-full" />
        <div className="skeleton h-3 flex-1" />
        <div className="skeleton h-3 w-5" />
      </div>
      <div className="flex items-center gap-2.5">
        <div className="skeleton w-5 h-5 rounded-full" />
        <div className="skeleton h-3 w-3/4" />
        <div className="skeleton h-3 w-5" />
      </div>
    </div>
  );
}

export function MatchGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <MatchCardSkeleton key={i} />)}
    </div>
  );
}
