'use client';
import { useEffect, useState } from 'react';
import { getMatchesBySport, isLive, getSportIcon, getSportColor } from '@/lib/api';
import type { APIMatch } from '@/lib/api';
import MatchCard from './LiveCard';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Props {
  sportId: string;
  sportName: string;
}

export default function SportSection({ sportId, sportName }: Props) {
  const [matches, setMatches] = useState<APIMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const color = getSportColor(sportId);
  const icon = getSportIcon(sportId);

  useEffect(() => {
    getMatchesBySport(sportId)
      .then(setMatches)
      .finally(() => setLoading(false));
  }, [sportId]);

  if (!loading && matches.length === 0) return null;

  return (
    <section className="space-y-4 slide-up">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <h2 className="text-lg font-bold text-white tracking-tight">{sportName}</h2>
          </div>
          <div 
            className="sport-gradient-bar w-12" 
            style={{ background: `linear-gradient(to right, ${color.from}, ${color.to})` }}
          />
        </div>
        <Link 
          href={`/sport/${sportId}`} 
          className="group flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-400 transition-colors"
        >
          See All
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card h-[160px] shimmer" />
          ))}
        </div>
      ) : (
        <div className="sport-scroll pb-2">
          {matches.map((m, i) => (
            <div key={m.id} className="w-[280px] sm:w-[320px]">
              <MatchCard match={m} index={i} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
