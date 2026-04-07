'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw, Maximize2, ExternalLink, Loader2, WifiOff, Clock } from 'lucide-react';
import { providers } from '@/lib/providers';
import { useStore } from '@/lib/store';
import type { Match } from '@/lib/api';

const REFRESH_MS = 5 * 60 * 1000;
const BLOCKED_MS = 7000;

function CountdownTimer({ startTime }: { startTime: string }) {
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0, diff: 1 });

  useEffect(() => {
    const target = new Date(startTime).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setCd({ d: 0, h: 0, m: 0, s: 0, diff });
      } else {
        setCd({
          d: Math.floor(diff / 86400000),
          h: Math.floor((diff % 86400000) / 3600000),
          m: Math.floor((diff % 3600000) / 60000),
          s: Math.floor((diff % 60000) / 1000),
          diff
        });
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [startTime]);

  if (cd.diff <= 0) return <p className="text-sm font-semibold text-blue-400 animate-pulse">Match is starting! Please refresh the page...</p>;

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 mt-2">
      {cd.d > 0 && <div><p className="text-3xl sm:text-4xl font-black text-white tabular-nums">{cd.d.toString().padStart(2, '0')}</p><p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest mt-1 text-center">Days</p></div>}
      <div><p className="text-3xl sm:text-4xl font-black text-white tabular-nums">{cd.h.toString().padStart(2, '0')}</p><p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest mt-1 text-center">Hrs</p></div>
      <div><p className="text-3xl sm:text-4xl font-black text-white tabular-nums">{cd.m.toString().padStart(2, '0')}</p><p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest mt-1 text-center">Mins</p></div>
      <div><p className="text-3xl sm:text-4xl font-black text-blue-400 tabular-nums">{cd.s.toString().padStart(2, '0')}</p><p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest mt-1 text-center">Secs</p></div>
    </div>
  );
}

export default function Player({ match }: { match: Match }) {
  const { selectedProvider, setSelectedProvider } = useStore();
  const [idx, setIdx] = useState(() => {
    const i = providers.findIndex((p) => p.id === selectedProvider);
    return i >= 0 ? i : 0;
  });
  const [loading, setLoading] = useState(true);
  const [maybeBlocked, setMaybeBlocked] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blockedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prov = providers[idx];
  const src = prov.buildUrl(match);

  const clearTimer = () => { if (blockedTimer.current) clearTimeout(blockedTimer.current); };
  const startTimer = useCallback(() => {
    clearTimer();
    blockedTimer.current = setTimeout(() => setMaybeBlocked(true), BLOCKED_MS);
  }, []);

  useEffect(() => {
    if (match.state === 'pre') return;
    const t = setInterval(() => {
      setLoading(true); setMaybeBlocked(false); startTimer();
      if (iframeRef.current) iframeRef.current.src = src;
    }, REFRESH_MS);
    return () => clearInterval(t);
  }, [src, startTimer, match.state]);

  useEffect(() => {
    if (match.state === 'pre') return;
    setLoading(true); setMaybeBlocked(false); startTimer();
    return clearTimer;
  }, [idx, match.id, startTimer, match.state]);

  const switchTo = (i: number) => { setIdx(i); setSelectedProvider(providers[i].id); };
  const handleLoad = () => { setLoading(false); setMaybeBlocked(false); clearTimer(); };
  const handleRefresh = () => {
    if (match.state === 'pre') {
      window.location.reload();
      return;
    }
    setLoading(true); setMaybeBlocked(false); startTimer();
    if (iframeRef.current) { iframeRef.current.src = ''; setTimeout(() => { if (iframeRef.current) iframeRef.current.src = src; }, 50); }
  };

  // If match has not started, show countdown screen instead of player
  if (match.state === 'pre') {
    const istDate = new Date(match.startTime).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
      <div className="space-y-3" id="player-section">
        <div className="relative w-full bg-[#030810] rounded-xl flex items-center justify-center border border-white/8" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-blue-900/10 to-transparent">
            <Clock className="w-8 h-8 text-blue-500/50 mb-4" />
            <h2 className="text-sm font-semibold text-white mb-2 uppercase tracking-widest text-center">Match Starts In</h2>
            <CountdownTimer startTime={match.startTime} />
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-6 py-3 mt-8 text-center max-w-sm">
              <p className="text-xs text-blue-200/70 mb-0.5">Scheduled for (IST)</p>
              <p className="text-sm font-semibold text-blue-100">{istDate}</p>
            </div>
            
            <p className="mt-8 text-[11px] text-slate-500 text-center max-w-md px-4 leading-relaxed">
              Video sources typically go live 5-10 minutes prior to kickoff. We will automatically block stream connections until then to prevent 404 errors.
            </p>

            <button onClick={handleRefresh} className="mt-6 px-4 py-2 text-xs font-semibold rounded-md bg-white border border-white/10 text-black hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <RefreshCw size={14} /> Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Live or Finished Match — show the actual player and sources
  return (
    <div className="space-y-3" id="player-section">
      {/* Video */}
      <div ref={wrapRef} id="player-wrap" className="relative w-full bg-black rounded-xl overflow-hidden border border-white/8" style={{ paddingBottom: '56.25%' }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#030810] gap-3">
            <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-400">Connecting to {prov.name}…</p>
          </div>
        )}

        {maybeBlocked && !loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#030810] gap-4 px-6 text-center">
            <WifiOff className="w-8 h-8 text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Stream not loading</p>
              <p className="text-xs text-slate-500">{prov.name} may be blocking embedded playback or the stream is currently offline.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={handleRefresh} className="px-3 py-1.5 text-xs rounded-md bg-white/8 border border-white/10 text-white hover:bg-white/12 transition-colors">Retry</button>
              <a href={src} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-md bg-blue-600/80 text-white hover:bg-blue-600 transition-colors inline-flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Open in new tab
              </a>
              {idx < providers.length - 1 && (
                <button onClick={() => switchTo(idx + 1)} className="px-3 py-1.5 text-xs rounded-md bg-white/8 border border-white/10 text-white hover:bg-white/12 transition-colors">Try next source</button>
              )}
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          key={`${prov.id}-${match.id}`}
          src={src}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={handleLoad}
          title={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
        />

        <div className="absolute top-2 right-2 z-20 flex gap-1">
          <button id="player-refresh" onClick={handleRefresh} title="Refresh" className="w-7 h-7 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-md flex items-center justify-center text-slate-300 hover:text-white transition-colors">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          </button>
          <button id="player-fullscreen" onClick={() => wrapRef.current?.requestFullscreen?.()} title="Fullscreen" className="w-7 h-7 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-md flex items-center justify-center text-slate-300 hover:text-white transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <a href={src} target="_blank" rel="noopener noreferrer" className="w-7 h-7 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-md flex items-center justify-center text-slate-300 hover:text-white transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Source selector */}
      <div className="bg-[#0c1526] border border-white/6 rounded-xl p-4" id="source-selector">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400">Sources</p>
          <p className="text-[10px] text-slate-600">Preference saved</p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {providers.map((p, i) => (
            <button key={p.id} id={`source-${p.id}`} onClick={() => switchTo(i)}
              className={`py-2 rounded-md text-xs font-medium transition-colors ${i === idx ? 'bg-blue-600 text-white' : 'bg-[#0a1120] border border-white/6 text-slate-400 hover:text-white hover:border-white/12'}`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-600">
          If a source shows a blank screen, hit Retry or try another source. All sources open inline.
        </p>
      </div>
    </div>
  );
}
