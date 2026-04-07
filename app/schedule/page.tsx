'use client';
import { useEffect, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchAllMatches, getUpcoming, filterBySport, SPORTS } from '@/lib/api';
import type { Match } from '@/lib/api';
import ScheduleCard from '@/components/ScheduleCard';

export default function SchedulePage() {
  const [sport, setSport] = useState('All');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllMatches().then((all) => {
      setMatches(getUpcoming(all));
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => filterBySport(matches, sport), [matches, sport]);

  const grouped = useMemo(() => {
    const g: Record<string, Match[]> = {};
    for (const m of filtered) {
      const key = new Date(m.startTime).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
      (g[key] ??= []).push(m);
    }
    return g;
  }, [filtered]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8" id="schedule-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Schedule</h1>
        <p className="text-sm text-slate-400">Upcoming matches from ESPN</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {SPORTS.map((s) => (
          <button key={s} id={`sched-${s}`} onClick={() => setSport(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              sport === s ? 'bg-blue-600 text-white' : 'bg-[#0c1526] border border-white/6 text-slate-400 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading schedule…</span>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-[#0c1526] border border-white/6 rounded-xl p-12 text-center">
          <p className="text-sm text-slate-400">No upcoming matches for this sport.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, ms]) => (
            <section key={date}>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-xs font-semibold text-blue-400">{date}</p>
                <div className="flex-1 h-px bg-white/5" />
                <p className="text-[11px] text-slate-600">{ms.length}</p>
              </div>
              <div className="space-y-2">
                {ms.map((m, i) => <ScheduleCard key={m.id} match={m} index={i} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
