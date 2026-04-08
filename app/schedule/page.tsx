'use client';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, Calendar, Clock, Filter } from 'lucide-react';
import { getTodayMatches, getSports, sortByDate, getSportIcon } from '@/lib/api';
import type { APIMatch, Sport } from '@/lib/api';
import MatchCard from '@/components/LiveCard';

export default function SchedulePage() {
  const [activeSport, setActiveSport] = useState('all');
  const [matches, setMatches] = useState<APIMatch[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTodayMatches(), getSports()])
      .then(([m, s]) => {
        setMatches(sortByDate(m));
        setSports(s);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (activeSport === 'all') return matches;
    return matches.filter((m) => m.category === activeSport);
  }, [matches, activeSport]);

  const grouped = useMemo(() => {
    const g: Record<string, APIMatch[]> = {};
    for (const m of filtered) {
      const key = new Date(m.date).toLocaleDateString([], { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
      (g[key] ??= []).push(m);
    }
    return g;
  }, [filtered]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8" id="schedule-page">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-indigo-400" size={20} />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Master Schedule</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Today's Protocol</h1>
          <p className="text-sm text-slate-500 font-medium">Synced with Streamed API V2 Global Server</p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <Clock size={14} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {filtered.length} Matches Found
            </span>
          </div>
        )}
      </div>

      {/* Advanced Filter */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <Filter size={14} className="text-slate-600" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Filter by discipline</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setActiveSport('all')}
            className={`sport-pill ${activeSport === 'all' ? 'active' : ''}`}
          >
            All Disciplines
          </button>
          {sports.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSport(s.id)}
              className={`sport-pill ${activeSport === s.id ? 'active' : ''}`}
            >
              <span className="mr-1.5">{getSportIcon(s.id)}</span>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Synchronizing Timeline</p>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-sm font-semibold text-slate-400">No scheduled transmissions for this discipline.</p>
          <p className="text-xs text-slate-600 mt-1">Check the global feed for other sports.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([date, ms]) => (
            <section key={date} className="space-y-6">
              <div className="flex items-center gap-4">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.15em]">{date}</p>
                <div className="flex-1 h-px bg-white/[0.04]" />
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-slate-500">{ms.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ms.map((m, i) => (
                  <MatchCard key={m.id} match={m} index={i} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
