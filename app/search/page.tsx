'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useAllMatches, useGlobalSearch } from '@/lib/hooks';
import { useUIStore } from '@/lib/store';
import { MatchCard } from '@/components/MatchCard';
import { EmptyState, LoadingSpinner, SectionHeader } from '@/components/ui';
import Link from 'next/link';
import { TeamLogo, PlayerPhoto } from '@/components/ImageWithFallback';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const { addRecentSearch, recentSearches, clearRecentSearches } = useUIStore();

  const debouncedQuery = useDebounce(query, 300);

  // Match search from cached data
  const { data: allMatches, isLoading: matchesLoading } = useAllMatches();
  const matchResults = debouncedQuery.trim().length >= 2
    ? (allMatches ?? []).filter((m) => {
        const q = debouncedQuery.toLowerCase();
        return (
          m.homeTeam.name.toLowerCase().includes(q) ||
          m.awayTeam.name.toLowerCase().includes(q) ||
          m.league.name.toLowerCase().includes(q) ||
          m.sport.toLowerCase().includes(q)
        );
      })
    : [];

  // TheSportsDB search (teams, players, leagues)
  const { data: globalResults, isLoading: globalLoading } = useGlobalSearch(debouncedQuery);

  const isLoading = (matchesLoading || globalLoading) && debouncedQuery.length >= 2;
  const hasResults =
    matchResults.length > 0 ||
    (globalResults?.teams?.length ?? 0) > 0 ||
    (globalResults?.players?.length ?? 0) > 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    addRecentSearch(query.trim());
    router.replace(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
        Search
      </h1>
      <p className="text-sm font-medium mb-8" style={{ color: 'var(--text-muted)' }}>
        Find matches, teams, players, and leagues across all sports
      </p>

      {/* Search input */}
      <form onSubmit={handleSearch} className="mb-10">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search matches, teams, leagues…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
            style={{ color: 'var(--text-primary)' }}
            autoFocus
          />
          {query && (
            <button type="button" onClick={() => setQuery('')}>
              <X size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
        <p className="text-[11px] mt-2 px-1" style={{ color: 'var(--text-muted)' }}>
          Match search covers all live scores &amp; schedules. Team &amp; player profile search runs on a free data tier with limited coverage.
        </p>
      </form>

      {/* Recent searches */}
      {!query && recentSearches.length > 0 && (
        <div className="mb-8">
          <SectionHeader
            title="Recent Searches"
            viewAllLabel="Clear all"
            onViewAllClick={clearRecentSearches}
          />
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:border-[var(--border-strong)]"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={32} />
        </div>
      )}

      {/* No results */}
      {query.length >= 2 && !isLoading && !hasResults && (
        <EmptyState
          icon={<Search size={40} />}
          title={`No results for "${query}"`}
          description="Try a different search term or browse by sport."
          action={
            <Link href="/" className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors">
              Browse matches →
            </Link>
          }
        />
      )}

      {/* Match results */}
      {matchResults.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <SectionHeader title="Matches" subtitle={`${matchResults.length} result${matchResults.length !== 1 ? 's' : ''}`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {matchResults.map((m, i) => (
              <MatchCard key={m.id} match={m} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Teams */}
      {(globalResults?.teams?.length ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <SectionHeader title="Teams" subtitle={`${globalResults?.teams?.length} result${(globalResults?.teams?.length ?? 0) !== 1 ? 's' : ''}`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {globalResults?.teams?.slice(0, 12).map((team) => (
              <Link
                key={team.id}
                href={`/team/${team.id}`}
                className="card card-interactive flex items-center gap-3 p-4"
              >
                <TeamLogo logo={team.logo} name={team.name} size={30} className="w-10 h-10 rounded-xl" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{team.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{team.country ?? team.sport}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Players */}
      {(globalResults?.players?.length ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <SectionHeader title="Players" subtitle={`${globalResults?.players?.length} result${(globalResults?.players?.length ?? 0) !== 1 ? 's' : ''}`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {globalResults?.players?.slice(0, 12).map((player) => (
              <Link
                key={player.id}
                href={`/player/${player.id}`}
                className="card card-interactive flex items-center gap-3 p-4"
              >
                <PlayerPhoto photo={player.photo} name={player.name} size={40} className="rounded-xl" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{player.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {player.position ?? ''}{player.position && player.teamName ? ' · ' : ''}{player.teamName ?? ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty / initial state */}
      {!query && recentSearches.length === 0 && (
        <EmptyState
          icon={<Search size={40} />}
          title="Search everything"
          description="Find live matches, teams, players, and leagues across all sports."
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
