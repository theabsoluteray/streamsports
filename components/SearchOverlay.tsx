'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, ArrowRight, Radio } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { useAllMatches, useGlobalSearch } from '@/lib/hooks';
import { formatMatchDate } from '@/lib/utils';
import type { Match } from '@/lib/types';
import { TeamLogo } from '@/components/ImageWithFallback';

const DEBOUNCE_MS = 300;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Match Result Item ────────────────────────────────────────────────────────

function MatchResultItem({ match, onClick }: { match: Match; onClick: () => void }) {
  const isLive = match.state === 'in';
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors text-left"
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-elevated)' }}>
        <Radio size={14} style={{ color: isLive ? '#ef4444' : 'var(--text-muted)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {match.homeTeam.name} <span style={{ color: 'var(--text-muted)' }}>vs</span> {match.awayTeam.name}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {match.league.name} · {isLive ? 'LIVE' : formatMatchDate(match.startTime)}
        </p>
      </div>
      {isLive && (
        <span className="flex-shrink-0 text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
          LIVE
        </span>
      )}
      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
    </button>
  );
}

// ─── Search Overlay ────────────────────────────────────────────────────────────

export default function SearchOverlay() {
  const router = useRouter();
  const { isSearchOpen, closeSearch, recentSearches, addRecentSearch, clearRecentSearches } = useUIStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);

  // All loaded matches for local match search
  const { data: allMatches } = useAllMatches();

  // TheSportsDB global search (teams, players, leagues)
  const { data: globalResults, isLoading: globalLoading } = useGlobalSearch(debouncedQuery);

  // Local match search from cached matches
  const matchResults: Match[] = debouncedQuery.trim().length >= 2
    ? (allMatches ?? [])
        .filter((m) => {
          const q = debouncedQuery.toLowerCase();
          return (
            m.homeTeam.name.toLowerCase().includes(q) ||
            m.awayTeam.name.toLowerCase().includes(q) ||
            m.league.name.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  const hasResults =
    matchResults.length > 0 ||
    (globalResults?.teams?.length ?? 0) > 0 ||
    (globalResults?.players?.length ?? 0) > 0;

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTimeout(() => setQuery(''), 0);
    }
  }, [isSearchOpen]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeSearch]);

  const navigate = useCallback((href: string, searchTerm?: string) => {
    if (searchTerm) addRecentSearch(searchTerm);
    closeSearch();
    router.push(href);
  }, [addRecentSearch, closeSearch, router]);

  const handleMatchClick = (match: Match) => {
    navigate(`/match/${match.id}?sport=${match.sport}&league=${match.league.id}`, query);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`, query.trim());
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeSearch}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-20 z-50 w-full max-w-xl -translate-x-1/2 rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            {/* Input */}
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <Search size={18} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search matches, teams, leagues…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                  style={{ color: 'var(--text-primary)' }}
                  autoComplete="off"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                    <X size={14} />
                  </button>
                )}
                <kbd className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded border" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-default)', background: 'var(--bg-elevated)' }}>ESC</kbd>
              </div>
            </form>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {/* Recent searches (when no query) */}
              {!query && recentSearches.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between px-1 mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Recent</p>
                    <button onClick={clearRecentSearches} className="text-xs hover:text-[var(--text-secondary)] transition-colors" style={{ color: 'var(--text-muted)' }}>Clear</button>
                  </div>
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors text-left"
                    >
                      <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{term}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* No recent searches, no query */}
              {!query && recentSearches.length === 0 && (
                <div className="py-10 text-center">
                  <Search size={28} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Search for matches, teams, and leagues</p>
                </div>
              )}

              {/* Match results */}
              {matchResults.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--bg-base)' }}>
                    Matches
                  </p>
                  {matchResults.map((match) => (
                    <MatchResultItem key={match.id} match={match} onClick={() => handleMatchClick(match)} />
                  ))}
                </div>
              )}

              {/* Team results */}
              {(globalResults?.teams?.length ?? 0) > 0 && (
                <div>
                  <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--bg-base)' }}>
                    Teams
                  </p>
                  {globalResults?.teams?.slice(0, 4).map((team) => (
                    <button
                      key={team.id}
                      onClick={() => navigate(`/team/${team.id}`, query)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <TeamLogo logo={team.logo} name={team.name} size={22} className="w-8 h-8 rounded-lg" />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{team.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{team.country ?? team.league}</p>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* No results state */}
              {debouncedQuery.trim().length >= 2 && !globalLoading && !hasResults && (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No results for &ldquo;{debouncedQuery}&rdquo;</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Try a different search term</p>
                </div>
              )}

              {/* Loading */}
              {debouncedQuery.trim().length >= 2 && globalLoading && matchResults.length === 0 && (
                <div className="py-10 text-center">
                  <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between px-4 py-2 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-muted)' }}>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Press <kbd className="font-medium">↵</kbd> to search all results
              </p>
              <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <span><kbd>↑↓</kbd> navigate</span>
                <span><kbd>Esc</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
