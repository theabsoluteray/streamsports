'use client';
import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Share2, Loader2 } from 'lucide-react';
import { fetchMatchById } from '@/lib/api';
import type { Match } from '@/lib/api';
import Player from '@/components/Player';

function StatusBadge({ state, detail }: { state: Match['state']; detail: string }) {
  if (state === 'in') return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-400 uppercase tracking-wider">
      <span className="live-dot w-1.5 h-1.5 rounded-full bg-red-500" /> Live · {detail}
    </span>
  );
  if (state === 'post') return <span className="text-xs font-semibold text-slate-500">Final</span>;
  return <span className="text-xs text-slate-500">{detail}</span>;
}

export default function MatchPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ path?: string }>;
}) {
  const { id } = use(params);
  const { path } = use(searchParams);
  const [match, setMatch] = useState<Match | null | undefined>(undefined);

  useEffect(() => {
    fetchMatchById(id, path ? decodeURIComponent(path) : undefined)
      .then((m) => setMatch(m ?? null));
  }, [id, path]);

  const share = () => {
    if (match && navigator.share) navigator.share({ title: `${match.homeTeam.name} vs ${match.awayTeam.name}`, url: location.href });
    else navigator.clipboard?.writeText(location.href);
  };

  if (match === undefined) return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={13} /> Back
      </Link>
      <div className="flex items-center justify-center py-24 gap-3 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading match…</span>
      </div>
    </div>
  );

  if (match === null) return notFound();

  const showScore = match.state !== 'pre';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" id="match-page">
      <Link href="/" id="back-btn" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={13} /> Back
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Main */}
        <div className="xl:col-span-2 space-y-4">

          {/* Header card */}
          <div className="bg-[#0c1526] border border-white/6 rounded-xl p-5">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-0.5">
                  {match.sport} · {match.league}
                </p>
                <StatusBadge state={match.state} detail={match.statusDetail} />
              </div>
              <button id="share-btn" onClick={share} className="text-slate-600 hover:text-white transition-colors p-1" title="Share">
                <Share2 size={14} />
              </button>
            </div>

            {/* Teams vs Score */}
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {match.homeTeam.logo && (
                    <Image src={match.homeTeam.logo} alt={match.homeTeam.name} width={24} height={24} unoptimized className="rounded" />
                  )}
                  <span className="font-bold text-white text-lg sm:text-2xl truncate">{match.homeTeam.name}</span>
                </div>
                <p className="text-xs text-slate-600">Home</p>
              </div>

              <div className="flex-shrink-0 text-center px-2">
                {showScore ? (
                  <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {match.homeScore}
                    <span className="text-slate-600 mx-2 font-light">–</span>
                    {match.awayScore}
                  </p>
                ) : (
                  <p className="text-base font-bold text-slate-600">vs</p>
                )}
              </div>

              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <span className="font-bold text-slate-300 text-lg sm:text-2xl truncate">{match.awayTeam.name}</span>
                  {match.awayTeam.logo && (
                    <Image src={match.awayTeam.logo} alt={match.awayTeam.name} width={24} height={24} unoptimized className="rounded" />
                  )}
                </div>
                <p className="text-xs text-slate-600">Away</p>
              </div>
            </div>
          </div>

          <Player match={match} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-[#0c1526] border border-white/6 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Details</h3>
            <dl className="space-y-2.5">
              {[
                ['Sport',   match.sport],
                ['League',  match.league],
                ['Status',  match.state === 'in' ? 'Live' : match.state === 'post' ? 'Final' : 'Upcoming'],
                ['Kickoff', match.statusDetail],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-xs text-slate-600 flex-shrink-0">{k}</dt>
                  <dd className="text-xs text-slate-300 text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-[#0c1526] border border-white/6 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Streaming tips</h3>
            <ul className="text-[11px] text-slate-500 space-y-2 leading-relaxed">
              <li>All 5 sources play inline. If one is blank, retry or try another.</li>
              <li>Source 1 targets the specific event ID. Sources 2–5 use the league channel.</li>
              <li>Stream auto-refreshes every 5 minutes. Your source is remembered.</li>
            </ul>
          </div>

          <p className="text-[10px] text-slate-700 text-center">
            Data · <a href="https://www.espn.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-500">ESPN</a>
          </p>
        </div>
      </div>
    </div>
  );
}
