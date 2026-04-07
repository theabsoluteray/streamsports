'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { fetchAllMatches, getLive, getUpcoming, filterBySport } from '@/lib/api';
import type { Match } from '@/lib/api';
import MatchCard from '@/components/LiveCard';
import SportFilter from '@/components/SportCategory';
import { useStore } from '@/lib/store';

function Skeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#0c1526] border border-white/6 rounded-xl p-4 h-[130px] animate-pulse">
          <div className="h-2.5 w-20 bg-white/5 rounded mb-3" />
          <div className="h-4 w-3/4 bg-white/5 rounded mb-2" />
          <div className="h-4 w-1/2 bg-white/5 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { sportFilter } = useStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAllMatches()
      .then(setMatches)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const live     = useMemo(() => filterBySport(getLive(matches),     sportFilter), [matches, sportFilter]);
  const upcoming = useMemo(() => filterBySport(getUpcoming(matches), sportFilter).slice(0, 12), [matches, sportFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">

      <section className="pt-4" id="hero">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
          Watch Sports Live
        </h1>
        <p className="text-slate-400 text-sm">
          Live scores and schedules for NFL, NBA and top football leagues via ESPN.
        </p>
      </section>

      <SportFilter />

      {error && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 text-sm text-red-400">
          Could not load matches. Check your connection and reload the page.
        </div>
      )}

      {/* Live */}
      <section id="live">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-red-500" />
            <h2 className="text-sm font-semibold text-white">Live Now</h2>
          </div>
          {!loading && <span className="text-xs text-slate-600">{live.length} in progress</span>}
        </div>
        {loading ? <Skeleton count={4} /> : live.length === 0 ? (
          <div className="bg-[#0c1526] border border-white/6 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-400">No games in progress right now.</p>
            <p className="text-xs text-slate-600 mt-1">Check the upcoming section below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {live.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
          </div>
        )}
      </section>

      {/* Upcoming */}
      <section id="upcoming">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Upcoming</h2>
          <Link href="/schedule" className="text-xs text-blue-500 hover:text-blue-400 transition-colors">
            View all
          </Link>
        </div>
        {loading ? <Skeleton count={6} /> : upcoming.length === 0 ? (
          <div className="bg-[#0c1526] border border-white/6 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-400">No upcoming matches for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
          </div>
        )}
      </section>

      {!loading && (
        <p className="text-xs text-slate-700 text-center">
          Data from <a href="https://www.espn.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-500">ESPN</a> · Updates on page load
        </p>
      )}
    </div>
  );
}
