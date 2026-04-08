'use client';
import { useEffect, useState, useMemo } from 'react';
import { getLiveMatches, getSports, sortByDate, isLive } from '@/lib/api';
import type { APIMatch, Sport } from '@/lib/api';
import MatchCard from '@/components/LiveCard';
import SportFilter from '@/components/SportCategory';
import SportSection from '@/components/SportSection';
import { useStore } from '@/lib/store';
import { Loader2, TrendingUp, Radio } from 'lucide-react';

export default function HomePage() {
  const { sportFilter } = useStore();
  const [liveMatches, setLiveMatches] = useState<APIMatch[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLiveMatches(), getSports()])
      .then(([m, s]) => {
        const currentlyLive = m.filter(match => isLive(match));
        setLiveMatches(sortByDate(currentlyLive));
        setSports(s);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredSports = useMemo(() => {
    if (sportFilter === 'all') return sports;
    return sports.filter((s) => s.id === sportFilter);
  }, [sports, sportFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase">Initializing Arena</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-16 animate-fade-in">
      
      {/* Live Directives - Spotlight when active */}
      {liveMatches.length > 0 && (
        <section id="live" className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5">
                <Radio size={18} className="text-red-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Active Transmissions</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Live Broadcasts</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest px-2 py-0.5 rounded bg-red-400/10 border border-red-400/20">
                {liveMatches.length} STREAMS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {liveMatches.map((m, i) => (
              <MatchCard key={m.id} match={m} index={i} />
            ))}
          </div>
          
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
        </section>
      )}
      
      {/* Hero Section */}
      <section className="pt-8 space-y-6 relative">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <TrendingUp size={12} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Global Protocol V2</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter leading-[0.9]">
            THE FUTURE OF <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">LIVE SPORTS.</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
            Ultra-low latency streaming for every major discipline. No subscriptions, 
            no limits. Powered by the next generation Streamed infrastructure.
          </p>
        </div>
      </section>

      {/* Navigation Filter */}
      <section className="sticky top-[72px] z-40 -mx-4 px-4 py-3 bg-[#030712]/80 backdrop-blur-xl border-y border-white/[0.03]">
        <SportFilter />
      </section>


      {/* Discipline Collections */}
      <div className="space-y-24">
        {filteredSports.map((sport) => (
          <SportSection 
            key={sport.id} 
            sportId={sport.id} 
            sportName={sport.name} 
          />
        ))}
      </div>

      {/* Intelligence Feed */}
      <div className="pt-12 pb-8 border-t border-white/[0.04] flex flex-col items-center gap-4">
        <div className="flex items-center gap-4 text-slate-700">
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">INTELLIGENCE FEED</span>
          <div className="w-1 h-1 rounded-full bg-slate-800" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">API V2.0.4</span>
        </div>
      </div>
    </div>
  );
}
