'use client';

import { useState, useRef, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  RefreshCw, Maximize2, ExternalLink, WifiOff, Clock,
  Theater, ChevronLeft, Heart, Share2, Trophy,
  Tv2,
} from 'lucide-react';
import { getStreamsForMatch } from '@/lib/api/streams';
import { useSettingsStore, useFavoritesStore, useHistoryStore } from '@/lib/store';
import { useAllMatches } from '@/lib/hooks';
import { getSportColor } from '@/lib/sports-config';
import { cn, formatMatchDate, formatRelative } from '@/lib/utils';
import { MatchCard, MatchGridSkeleton, LiveBadge } from '@/components/MatchCard';
import { ErrorState, LoadingSpinner, Section, SectionHeader } from '@/components/ui';
import { TeamLogo } from '@/components/ImageWithFallback';
import type { Match, StreamSource } from '@/lib/types';

const REFRESH_MS = 5 * 60 * 1000;
const BLOCKED_MS = 9000;

// ─── Countdown ───────────────────────────────────────────────────────────────

function CountdownTimer({ startTime }: { startTime: string }) {
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0, diff: 1 });
  useEffect(() => {
    const target = new Date(startTime).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return setCd({ d: 0, h: 0, m: 0, s: 0, diff });
      setCd({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        diff,
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [startTime]);

  if (cd.diff <= 0) {
    return <p className="text-[12px] font-extrabold uppercase tracking-widest text-[var(--live-red)] animate-pulse">Match starting — please refresh</p>;
  }

  const units = [
    { label: 'Days', value: cd.d, show: cd.d > 0 },
    { label: 'Hrs',  value: cd.h, show: true },
    { label: 'Min',  value: cd.m, show: true },
    { label: 'Sec',  value: cd.s, show: true },
  ].filter((u) => u.show);

  return (
    <div className="flex items-center justify-center gap-5 mt-3">
      {units.map(({ label, value }) => (
        <div key={label} className="text-center">
          <p className="score-num text-4xl sm:text-5xl text-[var(--text-primary)]">
            {value.toString().padStart(2, '0')}
          </p>
          <p className="text-[9px] font-bold uppercase tracking-widest mt-1 text-[var(--text-muted)]">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Stream Player ───────────────────────────────────────────────────────────

function StreamPlayer({ match }: { match: Match }) {
  const { preferredProvider, setSetting } = useSettingsStore();
  const streams: StreamSource[] = getStreamsForMatch(match as Match & { espEmbeds?: { server: string; url: string }[] });

  const [streamIdx, setStreamIdx] = useState(() => {
    if (!preferredProvider) return 0;
    const idx = streams.findIndex((s) => s.id === preferredProvider);
    return idx >= 0 ? idx : 0;
  });
  const [loading,      setLoading]      = useState(true);
  const [maybeBlocked, setMaybeBlocked] = useState(false);
  const [isTheater,    setIsTheater]    = useState(false);

  const wrapRef    = useRef<HTMLDivElement>(null);
  const iframeRef  = useRef<HTMLIFrameElement>(null);
  const blockedRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStream = streams[streamIdx];
  const src = currentStream?.url ?? '';

  const clearTimer = () => { if (blockedRef.current) clearTimeout(blockedRef.current); };
  const startTimer = useCallback(() => {
    clearTimer();
    blockedRef.current = setTimeout(() => setMaybeBlocked(true), BLOCKED_MS);
  }, []);

  // Auto-refresh when live
  useEffect(() => {
    if (match.state !== 'in') return;
    const t = setInterval(() => {
      setLoading(true); setMaybeBlocked(false); startTimer();
      if (iframeRef.current) iframeRef.current.src = src;
    }, REFRESH_MS);
    return () => clearInterval(t);
  }, [src, startTimer, match.state]);

  // Reset loading/blocked state when the stream source changes. Done as a
  // render-time state adjustment (rather than inside the effect below) to
  // avoid the extra cascading render that a synchronous setState in an
  // effect body would trigger.
  const streamKey = `${streamIdx}-${match.id}`;
  const [prevStreamKey, setPrevStreamKey] = useState(streamKey);
  if (match.state !== 'pre' && prevStreamKey !== streamKey) {
    setPrevStreamKey(streamKey);
    setLoading(true);
    setMaybeBlocked(false);
  }

  useEffect(() => {
    if (match.state === 'pre') return;
    startTimer();
    return () => clearTimer();
  }, [streamIdx, match.id, startTimer, match.state]);

  const switchStream = (i: number) => {
    setStreamIdx(i);
    const s = streams[i];
    if (s) setSetting('preferredProvider', s.id);
  };

  const handleRefresh = useCallback(() => {
    if (match.state === 'pre') { window.location.reload(); return; }
    setLoading(true); setMaybeBlocked(false); startTimer();
    if (iframeRef.current) {
      iframeRef.current.src = '';
      setTimeout(() => { if (iframeRef.current) iframeRef.current.src = src; }, 60);
    }
  }, [match.state, src, startTimer]);

  const handleFullscreen = useCallback(() => {
    wrapRef.current?.requestFullscreen?.();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'f' || e.key === 'F') handleFullscreen();
      if (e.key === 't' || e.key === 'T') setIsTheater((v) => !v);
      if (e.key === 'r' || e.key === 'R') handleRefresh();
      if (e.key === 'ArrowLeft')  { e.preventDefault(); setStreamIdx((i) => Math.max(0, i - 1)); }
      if (e.key === 'ArrowRight') { e.preventDefault(); setStreamIdx((i) => Math.min(streams.length - 1, i + 1)); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handleRefresh, handleFullscreen, streams.length]);

  // Pre-match countdown
  if (match.state === 'pre') {
    const startLabel = new Date(match.startTime).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    return (
      <div className="relative w-full rounded-xl overflow-hidden border" style={{ paddingBottom: '56.25%', borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <Clock size={32} className="text-[var(--text-muted)] mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Match starts in</p>
          <CountdownTimer startTime={match.startTime} />
          <div className="mt-6 px-5 py-3 rounded-lg border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-elevated)' }}>
            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Scheduled (IST)</p>
            <p className="text-[12px] font-bold text-[var(--text-primary)]">{startLabel}</p>
          </div>
          <p className="mt-4 text-[10px] text-[var(--text-muted)] max-w-sm">
            Streams go live 5–10 minutes before kickoff.
          </p>
          <button onClick={handleRefresh}
            className="mt-5 btn-primary !text-[11px] !py-2 !px-4">
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3 transition-all duration-300', isTheater && 'fixed inset-0 z-40 p-3 flex flex-col')}
      style={isTheater ? { background: 'rgba(6,6,8,0.99)' } : {}}>

      {/* Iframe wrapper */}
      <div ref={wrapRef}
        className="relative w-full rounded-xl overflow-hidden bg-black border"
        style={{
          paddingBottom: isTheater ? '0' : '56.25%',
          flex: isTheater ? 1 : undefined,
          borderColor: 'var(--border-default)',
        }}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
            style={{ background: 'var(--bg-surface)' }}>
            <LoadingSpinner size={22} />
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Connecting to {currentStream?.name ?? 'server'}…
            </p>
          </div>
        )}

        {/* Blocked overlay */}
        {maybeBlocked && !loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 text-center"
            style={{ background: 'var(--bg-surface)' }}>
            <WifiOff size={28} className="text-[var(--text-muted)] animate-pulse" />
            <div>
              <p className="text-[13px] font-extrabold uppercase tracking-wider mb-1 text-[var(--text-primary)]">
                Stream not loading
              </p>
              <p className="text-[12px] text-[var(--text-secondary)] max-w-sm leading-relaxed">
                {currentStream?.name} may be blocking iframes. Try another server.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={handleRefresh} className="btn-ghost !text-[11px] !py-2">Retry</button>
              <a href={src} target="_blank" rel="noopener noreferrer" className="btn-primary !text-[11px] !py-2">
                <ExternalLink size={11} /> Open in tab
              </a>
              {streamIdx < streams.length - 1 && (
                <button onClick={() => switchStream(streamIdx + 1)} className="btn-ghost !text-[11px] !py-2">
                  Next server
                </button>
              )}
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          key={`${currentStream?.id ?? 'default'}-${match.id}`}
          src={src}
          className="w-full h-full absolute inset-0"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => { setLoading(false); setMaybeBlocked(false); clearTimer(); }}
          title={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
        />

        {/* Floating controls */}
        <div className="absolute top-2.5 right-2.5 z-20 flex gap-1">
          <button onClick={handleRefresh} title="Refresh (R)"
            className="w-7 h-7 rounded-md flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setIsTheater((v) => !v)} title="Theater (T)"
            className="w-7 h-7 rounded-md flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Theater size={12} />
          </button>
          <button onClick={handleFullscreen} title="Fullscreen (F)"
            className="w-7 h-7 rounded-md flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Maximize2 size={12} />
          </button>
          <a href={src} target="_blank" rel="noopener noreferrer" title="Open in tab"
            className="w-7 h-7 rounded-md flex items-center justify-center text-white transition-all hover:scale-105"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Server selector */}
      {!isTheater && streams.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Tv2 size={13} className="text-[var(--text-muted)]" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                Stream servers
              </p>
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">← → to switch</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {streams.map((s, i) => (
              <button key={s.id} onClick={() => switchStream(i)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer',
                  i === streamIdx
                    ? 'bg-[var(--live-red)] text-white'
                    : 'btn-ghost !py-1.5 !px-3 !text-[11px]'
                )}
              >
                {s.name}
                {s.quality && <span className="ml-1 opacity-60 text-[9px]">{s.quality}</span>}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-[var(--text-muted)]">
            If a stream shows a black screen, click Retry or switch to another server.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Match Header ─────────────────────────────────────────────────────────────

function MatchHeader({ match }: { match: Match }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const fav      = isFavorite(match.id);
  const isLive   = match.state === 'in';
  const isFinished = match.state === 'post';
  const sportColor = getSportColor(match.sport);

  return (
    <div className="card overflow-hidden">
      {/* Sport color top strip */}
      <div className="h-1 w-full" style={{ background: sportColor }} />

      <div className="p-5">
        {/* League row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={12} className="text-[var(--text-muted)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              {match.league.name}
            </span>
          </div>
          {isLive ? (
            <LiveBadge detail={match.statusDetail} />
          ) : isFinished ? (
            <span className="badge-ft">Full time</span>
          ) : (
            <span className="text-[10px] font-bold text-[var(--text-muted)]">
              {formatRelative(match.startTime)}
            </span>
          )}
        </div>

        {/* Scoreboard */}
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex-1 flex flex-col items-center text-center gap-2.5">
            <TeamLogo logo={match.homeTeam.logo} name={match.homeTeam.name} size={40} />
            <p className="text-[14px] font-extrabold text-[var(--text-primary)] truncate w-full">{match.homeTeam.name}</p>
          </div>

          <div className="flex flex-col items-center flex-shrink-0">
            {(isLive || isFinished) ? (
              <p className="score-num text-[30px] sm:text-[38px] text-[var(--text-primary)] flex items-center gap-2.5">
                <span>{match.homeScore}</span>
                <span className="text-[var(--text-muted)] opacity-40">–</span>
                <span>{match.awayScore}</span>
              </p>
            ) : (
              <span className="text-[12px] font-black text-[var(--text-muted)] px-3 py-1.5 rounded-md" style={{ background: 'var(--bg-elevated)' }}>
                VS
              </span>
            )}
            <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
              {match.statusDetail || (isLive ? 'Live' : formatMatchDate(match.startTime))}
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center text-center gap-2.5">
            <TeamLogo logo={match.awayTeam.logo} name={match.awayTeam.name} size={40} />
            <p className="text-[14px] font-extrabold text-[var(--text-primary)] truncate w-full">{match.awayTeam.name}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={() => {
            if (fav) {
              removeFavorite(match.id);
            } else {
              addFavorite({ id: match.id, type: 'match', name: `${match.homeTeam.name} vs ${match.awayTeam.name}`, subtitle: match.league.name, href: `/match/${match.id}`, sport: match.sport, addedAt: new Date().toISOString() });
            }
          }}
            className={cn('btn-ghost !text-[11px] !py-1.5 !px-3',
              fav && 'border-[var(--live-red)] text-[var(--live-red)]'
            )}
          >
            <Heart size={11} fill={fav ? 'currentColor' : 'none'} />
            {fav ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={() => navigator.share?.({ title: `${match.homeTeam.name} vs ${match.awayTeam.name}`, url: window.location.href })}
            className="btn-ghost !text-[11px] !py-1.5 !px-3"
          >
            <Share2 size={11} /> Share
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Related matches ──────────────────────────────────────────────────────────

function RelatedMatches({ match }: { match: Match }) {
  const { data: all, isLoading } = useAllMatches();
  const related = (all ?? [])
    .filter((m) => m.id !== match.id && (m.sport === match.sport || m.league.id === match.league.id))
    .slice(0, 4);
  if (isLoading) return <MatchGridSkeleton count={4} />;
  if (related.length === 0) return null;
  return (
    <Section id="related">
      <SectionHeader title="Related" />
      <div className="space-y-3">
        {related.map((m, i) => <MatchCard key={m.id} match={m} index={i} compact />)}
      </div>
    </Section>
  );
}

// ─── Match Page Client ────────────────────────────────────────────────────────

export default function MatchPageClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: allMatches, isLoading, isError, refetch } = useAllMatches();
  const { addToHistory, updateProgress } = useHistoryStore();

  const match = allMatches?.find((m) => m.id === id);

  useEffect(() => {
    if (!match) return;
    addToHistory({
      matchId: match.id,
      matchTitle: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      sport: match.sport,
      leagueName: match.league.name,
      watchedAt: new Date().toISOString(),
      progressSeconds: 0,
      providerId: 'embedsportex',
    });
    let elapsed = 0;
    const interval = setInterval(() => { elapsed += 30; updateProgress(match.id, elapsed); }, 30_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.id]);

  if (isLoading) {
    return (
      <div className="page-container py-8" style={{ paddingTop: 'calc(var(--nav-height) + 32px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          <div className="space-y-4">
            <div className="card" style={{ paddingBottom: '56.25%', position: 'relative' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !match) {
    return (
      <div className="page-container py-8" style={{ paddingTop: 'calc(var(--nav-height) + 32px)' }}>
        <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-5 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
          <ChevronLeft size={13} /> Back
        </Link>
        <ErrorState
          title="Match not found"
          description={isError ? 'Could not load match data. Please reload.' : 'This match may have expired or not yet started.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="page-container py-5" style={{ paddingTop: 'calc(var(--nav-height) + 20px)' }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/sports/${match.sport}`} className="hover:text-[var(--text-secondary)] transition-colors capitalize">{match.sport}</Link>
        <span>/</span>
        <span className="text-[var(--text-secondary)]">{match.homeTeam.shortName} vs {match.awayTeam.shortName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
        {/* Main: header + player */}
        <div className="space-y-4">
          <MatchHeader match={match} />
          <StreamPlayer match={match} />
        </div>

        {/* Sidebar: related */}
        <aside className="space-y-5 lg:sticky lg:top-20">
          <RelatedMatches match={match} />
        </aside>
      </div>
    </div>
  );
}
