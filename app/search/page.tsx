'use client';
import { useEffect, useState, useMemo } from 'react';
import { Search, X, Loader2, Target, Radio } from 'lucide-react';
import { getAllMatches, getLiveMatches, searchMatches as searchApi } from '@/lib/api';
import type { APIMatch } from '@/lib/api';
import MatchCard from '@/components/LiveCard';

function useDebounce(v: string, ms: number) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}

export default function SearchPage() {
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 300);
  const [all, setAll] = useState<APIMatch[]>([]);
  const [live, setLive] = useState<APIMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllMatches(), getLiveMatches()])
      .then(([a, l]) => {
        setAll(a);
        setLive(l);
      })
      .finally(() => setLoading(false));
  }, []);

  const results = useMemo(() => {
    if (!dq.trim()) return [];
    return searchApi(all, dq);
  }, [dq, all]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10" id="search-page">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="text-indigo-400" size={18} />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Global Intelligence</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Arena Search</h1>
        <p className="text-sm text-slate-500 font-medium">Search across disciplines, teams, and tournament classifications</p>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          id="search-input"
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search discipline, team, or event..."
          autoFocus
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all shadow-xl"
        />
        {q && (
          <button 
            id="clear-btn" 
            onClick={() => setQ('')} 
            className="absolute inset-y-0 right-4 flex items-center text-slate-600 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Consulting Databases</p>
        </div>
      ) : dq.trim() ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Search Results</h2>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-md border border-indigo-400/20">
              {results.length} Matches Found
            </span>
          </div>
          
          {results.length === 0 ? (
            <div className="glass-card p-20 text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-700">
                  <Search size={24} />
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-400 leading-tight">Zero matches found for &quot;{dq}&quot;</p>
              <p className="text-xs text-slate-600">Refine your search parameters and try again.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 slide-up">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-red-500" />
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Live In Arena</h2>
            </div>
            <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-md border border-red-400/20">
              {live.length} Active
            </span>
          </div>

          {live.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-600 font-medium text-xs italic">
              No live events currently reporting. Start typing above to search the archive.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {live.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
