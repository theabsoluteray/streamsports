'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, Radio, ChevronRight, Trophy } from 'lucide-react';
import { useAllMatches } from '@/lib/hooks';
import { useUIStore } from '@/lib/store';
import { SPORTS_CONFIG, getSportColor } from '@/lib/sports-config';
import { EmptyState, ErrorState } from '@/components/ui';
import { groupBy, formatMatchDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Match, MatchState, SportSlug } from '@/lib/types';

type StateFilter = 'all' | MatchState;

const STATE_TABS: { id: StateFilter; label: string; icon: React.ElementType }[] = [
  { id: 'all',  label: 'All',      icon: Calendar  },
  { id: 'in',   label: 'Live',     icon: Radio     },
  { id: 'pre',  label: 'Upcoming', icon: Clock     },
  { id: 'post', label: 'Finished', icon: CheckCircle },
];

import { TeamLogo } from '@/components/ImageWithFallback';

// ─── Schedule Row ─────────────────────────────────────────────────────────────

function ScheduleRow({ match }: { match: Match }) {
  const isLive = match.state === 'in';
  const isFinished = match.state === 'post';
  const sportColor = getSportColor(match.sport);

  return (
    <a
      href={`/match/${match.id}?sport=${match.sport}&league=${match.league.id}`}
      className="flex items-center gap-3 px-5 py-4 hover:bg-white/[0.02] transition-all duration-200 group relative"
    >
      {/* Sport line accent */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-transparent group-hover:bg-[var(--brand-color)] transition-colors"
        style={{ '--brand-color': sportColor } as React.CSSProperties} />

      {/* Time / status */}
      <div className="w-16 flex-shrink-0 text-center">
        {isLive ? (
          <span className="live-badge text-[9px] shadow-glow-live">
            <span className="live-dot w-1 h-1 rounded-full bg-red-500" />
            {match.statusDetail || 'LIVE'}
          </span>
        ) : (
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isFinished ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
            {isFinished ? 'FT' : formatMatchDate(match.startTime).replace(/^.+,\s/, '')}
          </p>
        )}
      </div>

      {/* Teams */}
      <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-3 items-center min-w-0">
        <div className="flex items-center gap-2.5 justify-end min-w-0">
          <span className="text-xs sm:text-sm font-semibold truncate text-[var(--text-primary)] text-right">
            {match.homeTeam.shortName || match.homeTeam.name}
          </span>
          <TeamLogo logo={match.homeTeam.logo} name={match.homeTeam.name} size={14} />
        </div>
        
        <p className="text-[10px] font-black tabular-nums px-3 py-1 rounded bg-white/5 border border-white/5 text-[var(--text-secondary)] text-center w-12 flex-shrink-0">
          {isLive || isFinished ? `${match.homeScore}–${match.awayScore}` : 'VS'}
        </p>

        <div className="flex items-center gap-2.5 min-w-0">
          <TeamLogo logo={match.awayTeam.logo} name={match.awayTeam.name} size={14} />
          <span className="text-xs sm:text-sm font-semibold truncate text-[var(--text-primary)]">
            {match.awayTeam.shortName || match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Right chevron / sport dot */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-2 h-2 rounded-full shadow-sm" style={{ background: sportColor }} title={match.sport} />
        <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors" />
      </div>
    </a>
  );
}

// ─── Schedule Page ────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const { sportFilter, setSportFilter } = useUIStore();
  const [stateFilter, setStateFilter] = useState<StateFilter>('all');
  const { data: allMatches, isLoading, isError, refetch } = useAllMatches();

  const filtered = useMemo(() => {
    if (!allMatches) return [];
    return allMatches.filter((m) => {
      const sportMatch = sportFilter === 'all' || m.sport === sportFilter;
      const stateMatch = stateFilter === 'all' || m.state === stateFilter;
      return sportMatch && stateMatch;
    }).sort((a, b) => {
      const order = { in: 0, pre: 1, post: 2 };
      if (order[a.state] !== order[b.state]) return order[a.state] - order[b.state];
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  }, [allMatches, sportFilter, stateFilter]);

  const grouped = useMemo(() => groupBy(filtered, (m) => m.league.name), [filtered]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2 gradient-text">
          Broadcast Planner
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Aggregated Live Events, Schedules, and Match Records
        </p>
      </div>

      {/* Filter Tabs Block */}
      <div className="flex flex-col gap-4 mb-8">
        {/* State tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-1 p-1 rounded-2xl border border-white/[0.04] w-fit" style={{ background: 'var(--bg-surface)' }}>
          {STATE_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setStateFilter(id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex-shrink-0',
                stateFilter === id
                  ? 'bg-brand-600 text-white shadow-glow-brand'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
              )}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Sport tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSportFilter('all')}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 cursor-pointer',
              sportFilter === 'all'
                ? 'bg-brand-600 border-brand-600 text-white shadow-glow-brand'
                : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
            )}
          >
            All Sports
          </button>
          {SPORTS_CONFIG.map((sport) => (
            <button
              key={sport.slug}
              onClick={() => setSportFilter(sport.slug as SportSlug)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 cursor-pointer',
                sportFilter === sport.slug
                  ? 'text-white border-transparent'
                  : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
              )}
              style={sportFilter === sport.slug ? {
                background: sport.color,
                borderColor: sport.color,
                boxShadow: `0 0 12px ${sport.color}40`
              } : {}}
            >
              {sport.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Deck */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card overflow-hidden p-5 space-y-4">
              <div className="skeleton h-4 w-32 rounded-md" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center gap-4">
                  <div className="skeleton h-3 w-10 rounded-md" />
                  <div className="flex-1 skeleton h-3 rounded-md" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : Object.keys(grouped).length === 0 ? (
        <EmptyState
          icon={<Calendar size={40} />}
          title="No fixtures scheduled"
          description="Adjust the time filters or sports select options above."
        />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([league, matches]) => (
            <motion.div
              key={league}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="card overflow-hidden border border-white/[0.04]"
            >
              {/* League Header banner */}
              <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
                <div className="flex items-center gap-2">
                  <Trophy size={13} className="text-[var(--text-muted)]" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">{league}</p>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {matches.length} Event{matches.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {/* Schedule list rows */}
              <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {matches.map((match) => (
                  <ScheduleRow key={match.id} match={match} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
