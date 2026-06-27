'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Radio, Clock, ChevronRight, Play, Home, Bookmark, Trophy,
} from 'lucide-react';
import {
  useLiveMatches, useUpcomingMatches, useFinishedMatches, useTodaysMatches,
} from '@/lib/hooks';
import { useUIStore, useHistoryStore } from '@/lib/store';
import { SPORTS_CONFIG, getSportColor } from '@/lib/sports-config';
import { MatchTile, MatchTileSkeleton } from '@/components/MatchTile';
import { StreamingCard, StreamingCardSkeleton, MatchCard, MatchCardSkeleton } from '@/components/MatchCard';
import { ScrollRow } from '@/components/ScrollRow';
import { EmptyState, ErrorState, SectionHeader, Section } from '@/components/ui';
import { formatMatchDate, groupBy, cn } from '@/lib/utils';
import { TeamLogo } from '@/components/ImageWithFallback';
import type { Match, SportSlug } from '@/lib/types';

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ candidates }: { candidates: Match[] }) {
  const [idx, setIdx] = useState(0);
  const featured = candidates[idx];

  useEffect(() => {
    if (candidates.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % candidates.length), 8000);
    return () => clearInterval(t);
  }, [candidates.length]);

  // ── Empty hero fallback ──────────────────────────────────────────────────
  if (!featured) {
    return (
      <div className="hero-wrap mb-8">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0d0d12 0%, #090909 100%)' }} />
        <div className="relative px-8 sm:px-12 pb-12 pt-20 max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--primary)' }}>
            Live Sports
          </p>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-tight leading-none mb-5 text-[var(--text-primary)]">
            Every game,<br />one screen.
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] max-w-sm mb-8">
            Live scores, streams, and schedules across football, basketball, combat sports, F1 and tennis.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/schedule" className="btn-primary">
              <Calendar size={15} /> View schedule
            </Link>
            <Link href="/sports/football" className="btn-secondary">
              Explore sports
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLive     = featured.state === 'in';
  const sportColor = getSportColor(featured.sport);
  const href       = `/match/${featured.id}?sport=${featured.sport}&league=${featured.league.id}`;

  return (
    <div className="hero-wrap mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={featured.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Poster/background */}
          {featured.thumb ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${featured.thumb})` }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, #0f0f12 0%, #1a1a20 100%)` }}
            />
          )}
          {/* Sport color ambient glow */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 65% 55% at 80% 30%, ${sportColor}1e, transparent 60%)`,
            }}
          />
          {/* Left fade for text readability */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(9,9,9,0.97) 0%, rgba(9,9,9,0.82) 40%, rgba(9,9,9,0.2) 70%, transparent 100%)',
            }}
          />
          {/* Bottom fade */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(9,9,9,0.8) 0%, transparent 45%)' }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative w-full px-8 sm:px-12 pb-10 pt-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

          {/* Left: match info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={featured.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl"
            >
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {isLive ? (
                  <span className="badge-live">
                    <span className="live-dot w-1.5 h-1.5 rounded-full bg-white" /> LIVE
                  </span>
                ) : (
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {formatMatchDate(featured.startTime)}
                  </span>
                )}
                <span
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: sportColor }}
                >
                  {featured.league.name}
                </span>
              </div>

              <h1
                className="font-bold tracking-tight leading-[1.05] mb-2 text-[var(--text-primary)]"
                style={{ fontSize: 'clamp(2rem, 5.5vw, 3.6rem)' }}
              >
                {featured.homeTeam.name}
                <br />
                <span className="text-[var(--text-muted)] text-[clamp(1.2rem,3vw,2rem)] font-medium">vs </span>
                <span>{featured.awayTeam.name}</span>
              </h1>

              {featured.venue && (
                <p className="text-[13px] mb-2" style={{ color: 'var(--text-muted)' }}>
                  {featured.venue}
                </p>
              )}

              {!isLive && featured.state === 'pre' && (
                <p className="flex items-center gap-2 text-[13px] mb-6" style={{ color: 'var(--text-secondary)' }}>
                  <Clock size={14} />
                  Starts in {formatMatchDate(featured.startTime).replace(/^.+,\s/, '')}
                </p>
              )}

              <div className="flex items-center gap-3 flex-wrap mt-4">
                <Link href={href} className="btn-primary">
                  <Play size={14} fill="currentColor" />
                  {isLive ? 'Watch Live' : 'Watch Live'}
                </Link>
                <Link href={href} className="btn-secondary">
                  Match Details
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right: score panel (desktop) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`score-${featured.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block"
            >
              <div className="glass rounded-2xl p-6 min-w-[270px]">
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-4 text-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {featured.league.name}
                </p>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <TeamLogo logo={featured.homeTeam.logo} name={featured.homeTeam.name} size={40} />
                    <span
                      className="text-[12px] font-bold text-center truncate w-full"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {featured.homeTeam.shortName || featured.homeTeam.name}
                    </span>
                  </div>

                  <div className="flex flex-col items-center flex-shrink-0">
                    {isLive || featured.state === 'post' ? (
                      <span className="score-num text-[30px] text-[var(--text-primary)]">
                        {featured.homeScore}–{featured.awayScore}
                      </span>
                    ) : (
                      <span className="text-[15px] font-bold text-[var(--text-muted)]">VS</span>
                    )}
                    {isLive && (
                      <span className="text-[10px] font-bold mt-1" style={{ color: 'var(--live-red)' }}>
                        {featured.statusDetail || 'Live'}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-1">
                    <TeamLogo logo={featured.awayTeam.logo} name={featured.awayTeam.name} size={40} />
                    <span
                      className="text-[12px] font-bold text-center truncate w-full"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {featured.awayTeam.shortName || featured.awayTeam.name}
                    </span>
                  </div>
                </div>

                {/* Dot indicators */}
                {candidates.length > 1 && (
                  <div className="flex items-center gap-1.5 justify-center mt-5">
                    {candidates.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setIdx(i)}
                        className="h-1 rounded-full transition-all duration-300"
                        style={{
                          width: i === idx ? 20 : 6,
                          background: i === idx ? 'var(--primary)' : 'var(--border-strong)',
                        }}
                        aria-label={`Featured match ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Sport filter tabs ────────────────────────────────────────────────────────
function SportFilterTabs() {
  const { sportFilter, setSportFilter } = useUIStore();
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      <button
        onClick={() => setSportFilter('all')}
        className={cn('sport-tab', sportFilter === 'all' && 'sport-tab-active')}
      >
        <Home size={13} /> All
      </button>
      {SPORTS_CONFIG.map((sport) => (
        <button
          key={sport.slug}
          onClick={() => setSportFilter(sport.slug as SportSlug)}
          className={cn('sport-tab', sportFilter === sport.slug && 'sport-tab-active')}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sport.color }} />
          {sport.name}
        </button>
      ))}
      <Link href="/schedule" className="sport-tab">
        <Calendar size={13} /> Schedule
      </Link>
    </div>
  );
}

// ─── Live Now section ─────────────────────────────────────────────────────────
function LiveSection() {
  const { sportFilter } = useUIStore();
  const { data: live, isLoading, isError, refetch } = useLiveMatches(
    sportFilter !== 'all' ? (sportFilter as SportSlug) : undefined
  );

  return (
    <Section id="live">
      <SectionHeader
        title="Live Now"
        badge={
          live && live.length > 0 ? (
            <span className="badge-live">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-white" /> {live.length} live
            </span>
          ) : undefined
        }
        viewAllHref="/#live"
        viewAllLabel="View all"
      />
      {isLoading ? (
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => <MatchTileSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !live || live.length === 0 ? (
        <EmptyState
          icon={<Radio size={32} />}
          title="Nothing live right now"
          description="Check today's schedule below for upcoming fixtures."
          action={
            <Link href="/schedule" className="text-[12px] font-bold hover:underline" style={{ color: 'var(--primary)' }}>
              Full schedule →
            </Link>
          }
        />
      ) : (
        <ScrollRow>
          {live.map((m) => <MatchTile key={m.id} match={m} />)}
        </ScrollRow>
      )}
    </Section>
  );
}

// ─── Generic sport carousel section ──────────────────────────────────────────
function SportSection({ sport }: { sport: typeof SPORTS_CONFIG[number] }) {
  const { data: all, isLoading } = useLiveMatches();
  const { data: upcomingAll } = useUpcomingMatches(undefined, 20);

  const matches = useMemo(() => {
    const live     = (all ?? []).filter((m) => m.sport === sport.slug);
    const upcoming = (upcomingAll ?? []).filter((m) => m.sport === sport.slug);
    const combined = [...live, ...upcoming];
    // De-dupe by id
    const seen = new Set<string>();
    return combined.filter((m) => { if (seen.has(m.id)) return false; seen.add(m.id); return true; }).slice(0, 10);
  }, [all, upcomingAll, sport.slug]);

  if (!isLoading && matches.length === 0) return null;

  return (
    <Section id={sport.slug}>
      <SectionHeader
        title={sport.name}
        viewAllHref={`/sports/${sport.slug}`}
        viewAllLabel="See all"
      />
      {isLoading ? (
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StreamingCardSkeleton key={i} />)}
        </div>
      ) : (
        <ScrollRow>
          {matches.map((m, i) => <StreamingCard key={m.id} match={m} index={i} />)}
        </ScrollRow>
      )}
    </Section>
  );
}

// ─── Upcoming section ─────────────────────────────────────────────────────────
function UpcomingSection() {
  const { sportFilter } = useUIStore();
  const { data: upcoming, isLoading, isError, refetch } = useUpcomingMatches(
    sportFilter !== 'all' ? (sportFilter as SportSlug) : undefined, 12
  );

  return (
    <Section id="upcoming">
      <SectionHeader title="Upcoming Matches" viewAllHref="/schedule" viewAllLabel="View all" />
      {isLoading ? (
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => <MatchTileSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !upcoming || upcoming.length === 0 ? (
        <EmptyState icon={<Clock size={32} />} title="Nothing scheduled" description="No upcoming fixtures for this category." />
      ) : (
        <ScrollRow>
          {upcoming.map((m) => <MatchTile key={m.id} match={m} />)}
        </ScrollRow>
      )}
    </Section>
  );
}

// ─── Today's schedule ─────────────────────────────────────────────────────────
function TodaysSchedule() {
  const { sportFilter } = useUIStore();
  const { data: todays, isLoading, isError, refetch } = useTodaysMatches(
    sportFilter !== 'all' ? (sportFilter as SportSlug) : undefined
  );

  const grouped = useMemo(() => {
    if (!todays) return {};
    return groupBy(
      todays
        .filter((m) => m.state !== 'post')
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
      (m) => m.league.name
    );
  }, [todays]);

  const hasData = Object.keys(grouped).length > 0;

  return (
    <Section id="today">
      <SectionHeader title="Today's Schedule" subtitle="All fixtures today" viewAllHref="/schedule" />
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="score-card flex items-center gap-4 py-3">
              <div className="skeleton h-2.5 w-16" />
              <div className="flex-1 skeleton h-2.5" />
              <div className="skeleton h-2.5 w-10" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !hasData ? (
        <EmptyState icon={<Calendar size={32} />} title="No more matches today" description="All of today's fixtures have finished." />
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([leagueName, matches]) => (
            <div key={leagueName} className="card overflow-hidden">
              <div
                className="flex items-center gap-2 px-4 py-2.5 border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <Trophy size={11} className="text-[var(--text-muted)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  {leagueName}
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {matches.map((match) => (
                  <Link
                    key={match.id}
                    href={`/match/${match.id}?sport=${match.sport}&league=${match.league.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.025] transition-colors"
                  >
                    <div className="w-14 flex-shrink-0 text-center">
                      <span
                        className={cn('text-[11px] font-bold',
                          match.state === 'in' ? 'text-[var(--live-red)]' : 'text-[var(--text-muted)]'
                        )}
                      >
                        {match.state === 'in'
                          ? match.statusDetail || 'Live'
                          : formatMatchDate(match.startTime).replace(/^.+,\s/, '')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <TeamLogo logo={match.homeTeam.logo} name={match.homeTeam.name} size={16} />
                        <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                          {match.homeTeam.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TeamLogo logo={match.awayTeam.logo} name={match.awayTeam.name} size={16} />
                        <span className="text-[13px] font-semibold text-[var(--text-secondary)] truncate">
                          {match.awayTeam.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right w-14">
                      {match.state !== 'pre' ? (
                        <div>
                          <div className={cn('score-num text-[14px]',
                            match.homeScore > match.awayScore
                              ? 'text-[var(--text-primary)]'
                              : 'text-[var(--text-secondary)]'
                          )}>{match.homeScore}</div>
                          <div className={cn('score-num text-[14px]',
                            match.awayScore > match.homeScore
                              ? 'text-[var(--text-primary)]'
                              : 'text-[var(--text-secondary)]'
                          )}>{match.awayScore}</div>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-[var(--text-muted)]">–</span>
                      )}
                    </div>
                    <ChevronRight size={13} className="text-[var(--text-muted)] flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ─── Browse by sport ──────────────────────────────────────────────────────────
function BrowseBySport() {
  return (
    <Section id="sports">
      <SectionHeader title="Browse by Sport" />
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {SPORTS_CONFIG.map((sport, i) => (
          <motion.div
            key={sport.slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={`/sports/${sport.slug}`}
              className="card card-hover flex flex-col items-center justify-center gap-2.5 py-5 px-3 text-center"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-base"
                style={{ background: `${sport.color}18`, color: sport.color }}
              >
                <span className="font-bold text-[11px] uppercase tracking-widest">
                  {sport.slug.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <p className="text-[12px] font-semibold text-[var(--text-primary)]">{sport.name}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ─── Continue watching ────────────────────────────────────────────────────────
function ContinueWatching() {
  const { history } = useHistoryStore();
  const recent = history.slice(0, 4);
  if (recent.length === 0) return null;
  return (
    <Section id="continue">
      <SectionHeader title="Continue Watching" viewAllHref="/history" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {recent.map((entry) => {
          const color = getSportColor(entry.sport);
          return (
            <Link
              key={entry.matchId}
              href={`/match/${entry.matchId}?sport=${entry.sport}`}
              className="card card-hover p-4 block"
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18`, color }}
                >
                  <Radio size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate text-[var(--text-primary)]">{entry.matchTitle}</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{entry.leagueName}</p>
                </div>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((entry.progressSeconds / 7200) * 100, 100)}%`,
                    background: color,
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}

// ─── Recent results ───────────────────────────────────────────────────────────
function RecentResults() {
  const { sportFilter } = useUIStore();
  const { data: finished, isLoading } = useFinishedMatches(
    sportFilter !== 'all' ? (sportFilter as SportSlug) : undefined, 8
  );
  if (!isLoading && (!finished || finished.length === 0)) return null;
  return (
    <Section id="results">
      <SectionHeader title="Recent Results" viewAllHref="/schedule?state=finished" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <MatchCardSkeleton key={i} />)
          : finished!.slice(0, 8).map((m, i) => (
              <MatchCard key={m.id} match={m} index={i} compact />
            ))
        }
      </div>
    </Section>
  );
}

// ─── Homepage ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { data: live }     = useLiveMatches();
  const { data: upcoming } = useUpcomingMatches(undefined, 5);

  const featuredCandidates = useMemo(() => {
    return [...(live ?? []), ...(upcoming ?? [])].slice(0, 5);
  }, [live, upcoming]);

  return (
    <div
      className="page-container py-5"
      style={{ paddingTop: '24px', paddingBottom: '80px' }}
    >
      {/* Hero */}
      <Hero candidates={featuredCandidates} />

      {/* Sport filter */}
      <div className="mb-8">
        <SportFilterTabs />
      </div>

      <div className="section-stack">
        {/* Live now */}
        <LiveSection />

        {/* Upcoming */}
        <UpcomingSection />

        {/* Per-sport streaming carousels */}
        {SPORTS_CONFIG.map((sport) => (
          <SportSection key={sport.slug} sport={sport} />
        ))}

        {/* Today schedule */}
        <TodaysSchedule />

        {/* Browse by sport */}
        <BrowseBySport />

        {/* Continue watching */}
        <ContinueWatching />

        {/* Recent results */}
        <RecentResults />

        <p className="text-[11px] text-center pb-4" style={{ color: 'var(--text-muted)' }}>
          Scores &amp; schedules via{' '}
          <a href="https://espn.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--text-secondary)]">ESPN</a>
          {' '}·{' '}
          <a href="https://api.esportex.site" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--text-secondary)]">EmbedSportex</a>
        </p>
      </div>
    </div>
  );
}
