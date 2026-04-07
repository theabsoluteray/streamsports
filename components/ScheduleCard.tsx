'use client';
import Link from 'next/link';
import type { Match } from '@/lib/api';

function pad(n: number) { return String(n).padStart(2, '0'); }

function Countdown({ iso }: { iso: string }) {
  const [cd, setCd] = [
    { h: 0, m: 0, s: 0 },
    (v: { h: number; m: number; s: number }) => { void v; },
  ];
  // Use client-side only
  if (typeof window !== 'undefined') {
    const diff = +new Date(iso) - Date.now();
    if (diff > 0) {
      cd.h = Math.floor(diff / 3600000);
      cd.m = Math.floor((diff % 3600000) / 60000);
      cd.s = Math.floor((diff % 60000) / 1000);
    }
  }
  void setCd;
  return (
    <p className="font-mono text-sm font-bold text-white tabular-nums leading-none">
      {cd.h > 0 && <>{pad(cd.h)}<span className="text-slate-600 font-normal text-[10px]">h </span></>}
      {pad(cd.m)}<span className="text-slate-600 font-normal text-[10px]">m </span>
      {pad(cd.s)}<span className="text-slate-600 font-normal text-[10px]">s</span>
    </p>
  );
}

export default function ScheduleCard({ match, index = 0 }: { match: Match; index?: number }) {
  const date = new Date(match.startTime);

  return (
    <Link
      href={`/match/${match.id}?path=${encodeURIComponent(match.sportPath)}`}
      id={`sched-${match.id}`}
      className="block slide-up focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-xl"
      style={{ animationDelay: `${Math.min(index * 30, 400)}ms` }}
    >
      <div className="bg-[#0c1526] border border-white/6 rounded-xl px-4 py-3 hover:border-blue-500/20 hover:bg-[#0f1a2e] transition-all flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-slate-500 mb-1 truncate">{match.sport} · {match.league}</p>
          <p className="text-sm font-semibold text-white truncate">
            {match.homeTeam.name} <span className="text-slate-600 font-normal mx-1">vs</span> {match.awayTeam.name}
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            {date.toLocaleDateString([], { month: 'short', day: 'numeric' })} · {match.statusDetail}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-slate-400">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </Link>
  );
}
