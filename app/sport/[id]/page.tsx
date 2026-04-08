'use client';
import { use, useEffect, useState } from 'react';
import { getMatchesBySport, getSports, sortByDate, getSportColor, getSportIcon } from '@/lib/api';
import type { APIMatch } from '@/lib/api';
import MatchCard from '@/components/LiveCard';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [matches, setMatches] = useState<APIMatch[]>([]);
  const [sportName, setSportName] = useState('Sport');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMatchesBySport(id), getSports()])
      .then(([m, s]) => {
        setMatches(sortByDate(m));
        const found = s.find((x) => x.id === id);
        if (found) setSportName(found.name);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const color = getSportColor(id);
  const icon = getSportIcon(id);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase">Loading Category</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      <Link href="/" className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white mb-4 transition-colors uppercase tracking-widest">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Arena
      </Link>
      
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl border border-white/10 shadow-inner">
            {icon}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{sportName}</h1>
        </div>
        <div 
          className="sport-gradient-bar w-24 h-1 mt-2" 
          style={{ background: `linear-gradient(to right, ${color.from}, ${color.to})` }}
        />
      </div>

      {matches.length === 0 && id !== 'motor-sports' ? (
        <div className="glass-card p-20 text-center flex flex-col items-center gap-4 border-dashed">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Transmissions</p>
          <p className="text-xs text-slate-600">No scheduled matches found for {sportName}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {id === 'motor-sports' && (
            <a 
              href="https://f1net.dpdns.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card relative overflow-hidden group flex flex-col items-center justify-center p-6 border-red-500/30 hover:border-red-500 bg-[#030712] hover:bg-red-500/10 transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] min-h-[200px]"
            >
              {/* Background Glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-600/10 blur-[60px] rounded-full pointer-events-none" />
              
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 group-hover:scale-110 group-hover:bg-red-500/30 transition-all duration-300 animate-pulse relative z-10">
                <span className="text-2xl font-black text-red-500 italic tracking-tighter">F1</span>
              </div>
              
              <div className="mt-6 text-center relative z-10">
                <h3 className="text-lg font-black text-white tracking-tight group-hover:text-red-400 transition-colors uppercase">For F1 Click Here</h3>
                <p className="text-[11px] text-red-500/70 font-semibold mt-1 uppercase tracking-widest">Priority Access</p>
              </div>
            </a>
          )}
          {matches.map((m, i) => (
            <MatchCard key={m.id} match={m} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
