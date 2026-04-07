'use client';
import { SPORTS } from '@/lib/api';
import { useStore } from '@/lib/store';

export default function SportFilter() {
  const { sportFilter, setSportFilter } = useStore();
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5" id="sport-filter">
      {SPORTS.map((s) => (
        <button
          key={s}
          id={`filter-${s}`}
          onClick={() => setSportFilter(s)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
            sportFilter === s
              ? 'bg-blue-600 text-white'
              : 'bg-[#0c1526] border border-white/6 text-slate-400 hover:text-white hover:border-white/12'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
