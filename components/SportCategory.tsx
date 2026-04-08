'use client';
import { useEffect, useState } from 'react';
import { getSports, getSportIcon } from '@/lib/api';
import type { Sport } from '@/lib/api';
import { useStore } from '@/lib/store';

export default function SportFilter() {
  const { sportFilter, setSportFilter } = useStore();
  const [sports, setSports] = useState<Sport[]>([]);

  useEffect(() => {
    getSports().then(setSports).catch(() => {});
  }, []);

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2" id="sport-filter">
      <button
        id="filter-all"
        onClick={() => setSportFilter('all')}
        className={`sport-pill ${sportFilter === 'all' ? 'active' : ''}`}
      >
        All Sports
      </button>
      {sports.map((s) => (
        <button
          key={s.id}
          id={`filter-${s.id}`}
          onClick={() => setSportFilter(s.id)}
          className={`sport-pill ${sportFilter === s.id ? 'active' : ''}`}
        >
          <span className="mr-1.5">{getSportIcon(s.id)}</span>
          {s.name}
        </button>
      ))}
    </div>
  );
}
