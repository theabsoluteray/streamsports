'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Radio, Calendar, ChevronLeft } from 'lucide-react';
import { useLiveMatches, useUpcomingMatches, useFinishedMatches } from '@/lib/hooks';
import { SPORTS_MAP, getSportColor } from '@/lib/sports-config';
import { MatchCard, MatchCardSkeleton } from '@/components/MatchCard';
import { EmptyState, SectionHeader } from '@/components/ui';
import { formatMatchDate, groupBy, cn } from '@/lib/utils';
import { TeamLogo } from '@/components/ImageWithFallback';
import type { Match, SportSlug } from '@/lib/types';

interface SportPageProps {
  params: Promise<{ sport: string }>;
}

// ─── Upcoming match row ────────────────────────────────────────────────────────
function UpcomingRow({ match }: { match: Match }) {
  const href = `/match/${match.id}?sport=${match.sport}&league=${match.league.id}`;
  const isLive = match.state === 'in';
  const isFinished = match.state === 'post';

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.025] transition-colors"
    >
      {/* Time / status */}
      <div className="w-14 flex-shrink-0">
        <span
          className={cn(
            'text-[11px] font-bold tabular-nums',
            isLive ? 'text-[var(--live-red)]' : 'text-[var(--text-muted)]'
          )}
        >
          {isLive
            ? match.statusDetail || 'Live'
            : formatMatchDate(match.startTime).replace(/^.+,\s/, '')}
        </span>
      </div>

      {/* Teams */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1.5">
          <TeamLogo logo={match.homeTeam.logo} name={match.homeTeam.name} size={14} />
          <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
            {match.homeTeam.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <TeamLogo logo={match.awayTeam.logo} name={match.awayTeam.name} size={14} />
          <span className="text-[13px] font-medium text-[var(--text-secondary)] truncate">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* League name */}
      <span className="hidden sm:block text-[10px] font-semibold text-[var(--text-muted)] flex-shrink-0 text-right max-w-[100px] truncate">
        {match.league.shortName || match.league.name}
      </span>

      {/* Score (live / finished only) */}
      {(isLive || isFinished) && (
        <div className="flex-shrink-0 text-right w-8">
          <div className={cn('score-num text-[13px]', match.homeScore >= match.awayScore ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>
            {match.homeScore}
          </div>
          <div className={cn('score-num text-[13px]', match.awayScore > match.homeScore ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>
            {match.awayScore}
          </div>
        </div>
      )}
    </Link>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function SportPageClient({ params }: SportPageProps) {
  const { sport: sportSlug } = use(params);
  const sport = SPORTS_MAP[sportSlug];

  const { data: live, isLoading: liveLoading } = useLiveMatches(sportSlug as SportSlug);
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingMatches(sportSlug as SportSlug, 20);
  const { data: finished, isLoading: finishedLoading } = useFinishedMatches(sportSlug as SportSlug, 8);

  const sportColor = getSportColor(sportSlug);

  // Group upcoming by day label
  const groupedUpcoming = useMemo(() => {
    if (!upcoming) return {} as Record<string, Match[]>;
    return groupBy(
      [...upcoming].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
      (m) => {
        const full = formatMatchDate(m.startTime);
        if (full.startsWith('Today')) return 'Today';
        if (full.startsWith('Tomorrow')) return 'Tomorrow';
        // e.g. "Sat 28 Jun, 20:00" → "Sat 28 Jun"
        return full.replace(/,.*$/, '');
      }
    ) as Record<string, Match[]>;
  }, [upcoming]);

  if (!sport) {
    return (
      <div className="page-container py-12 text-center">
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Sport not found</p>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          &ldquo;{sportSlug}&rdquo; isn't in our catalogue.
        </p>
        <Link
          href="/"
          className="text-xs font-bold text-[var(--primary)] hover:underline"
        >
          ← Back home
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container py-6 pb-20">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-4 transition-colors"
        >
          <ChevronLeft size={13} /> All sports
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${sportColor}18`, color: sportColor }}
          >
            <Radio size={15} />
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--text-primary)]">
            {sport.name}
          </h1>
          {!liveLoading && live && live.length > 0 && (
            <span className="badge-live">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-white" />
              {live.length} live
            </span>
          )}
        </div>

        {/* League pills — compact, horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {sport.leagues.map((league) => (
            <span
              key={league.id}
              className="flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
              style={{
                borderColor: `${sportColor}28`,
                color: 'var(--text-muted)',
                background: `${sportColor}0a`,
              }}
            >
              {league.name}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="space-y-10">

        {/* ── Live Now ─────────────────────────────────────────────────────── */}
        {(liveLoading || (live && live.length > 0)) && (
          <section>
            <SectionHeader
              title="Live now"
              badge={
                live && live.length > 0 ? (
                  <span className="badge-live">
                    <span className="live-dot w-1.5 h-1.5 rounded-full bg-white" />
                    {live.length}
                  </span>
                ) : undefined
              }
            />
            {liveLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => <MatchCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {live!.map((m, i) => <MatchCard key={m.id} match={m} index={i} compact />)}
              </div>
            )}
          </section>
        )}

        {/* ── Upcoming — date-grouped list ──────────────────────────────────── */}
        <section>
          <SectionHeader title="Upcoming" viewAllHref="/schedule" />

          {upcomingLoading ? (
            <div className="card overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="skeleton h-2.5 w-10 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-2.5 w-2/3" />
                    <div className="skeleton h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !upcoming || upcoming.length === 0 ? (
            <EmptyState
              icon={<Calendar size={28} />}
              title="No upcoming matches"
              description={`No ${sport.name} fixtures scheduled right now.`}
            />
          ) : (
            <div className="card overflow-hidden">
              {Object.entries(groupedUpcoming).map(([dateLabel, matches], groupIdx) => (
                <div key={dateLabel}>
                  {/* Date header */}
                  <div
                    className="px-4 py-2"
                    style={{
                      background: 'var(--bg-elevated)',
                      borderTop: groupIdx > 0 ? '1px solid var(--border-default)' : undefined,
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      {dateLabel}
                    </span>
                  </div>

                  {/* Match rows */}
                  <div>
                    {matches.map((m, rowIdx) => (
                      <div
                        key={m.id}
                        style={{ borderTop: rowIdx > 0 ? '1px solid var(--border-subtle)' : undefined }}
                      >
                        <UpcomingRow match={m} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Recent Results ────────────────────────────────────────────────── */}
        {(finishedLoading || (finished && finished.length > 0)) && (
          <section>
            <SectionHeader title="Recent results" />
            {finishedLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => <MatchCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {finished!.map((m, i) => <MatchCard key={m.id} match={m} index={i} compact />)}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
