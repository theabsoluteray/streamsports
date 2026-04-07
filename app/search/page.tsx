'use client';
import { useEffect, useState, useMemo } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { fetchAllMatches, getLive, searchMatches } from '@/lib/api';
import type { Match } from '@/lib/api';
import MatchCard from '@/components/LiveCard';

function useDebounce(v: string, ms: number) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}

export default function SearchPage() {
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 250);
  const [all, setAll] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllMatches().then((m) => { setAll(m); setLoading(false); });
  }, []);

  const results  = useMemo(() => dq.trim() ? searchMatches(all, dq) : [], [dq, all]);
  const live     = useMemo(() => getLive(all), [all]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8" id="search-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Search</h1>
        <p className="text-sm text-slate-400">Search teams, leagues, or sports</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
        <input
          id="search-input"
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Real Madrid, NBA, Premier League…"
          autoFocus
          className="w-full bg-[#0c1526] border border-white/8 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors"
        />
        {q && (
          <button id="clear-btn" onClick={() => setQ('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
            <X size={15} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      ) : dq.trim() ? (
        results.length === 0 ? (
          <div className="bg-[#0c1526] border border-white/6 rounded-xl p-12 text-center">
            <p className="text-sm text-slate-400">No matches found for &quot;{dq}&quot;</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-600 mb-4">{results.length} result{results.length > 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
            </div>
          </>
        )
      ) : (
        <>
          <p className="text-xs text-slate-600 mb-4">Live now · {live.length} games</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {live.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
          </div>
        </>
      )}
    </div>
  );
}
