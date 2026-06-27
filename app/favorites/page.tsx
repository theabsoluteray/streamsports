'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Trash2, Radio, Users, Trophy } from 'lucide-react';
import { useFavoritesStore } from '@/lib/store';
import { EmptyState, SectionHeader } from '@/components/ui';
import { getSportColor } from '@/lib/sports-config';
import { formatRelative } from '@/lib/utils';

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavoritesStore();

  const matches = favorites.filter((f) => f.type === 'match');
  const teams = favorites.filter((f) => f.type === 'team');
  const leagues = favorites.filter((f) => f.type === 'league');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-2 mb-2">
        <Heart size={24} style={{ color: '#f87171' }} />
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Favorites
        </h1>
      </div>
      <p className="text-sm font-medium mb-8" style={{ color: 'var(--text-muted)' }}>
        Your saved matches, teams, and leagues
      </p>

      {favorites.length === 0 ? (
        <EmptyState
          icon={<Heart size={40} />}
          title="No favorites yet"
          description="Save matches, teams, and leagues to quickly find them here."
          action={
            <Link href="/" className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors">
              Browse matches →
            </Link>
          }
        />
      ) : (
        <div className="space-y-10">
          {/* Matches */}
          {matches.length > 0 && (
            <div>
              <SectionHeader title="Saved Matches" subtitle={`${matches.length} saved`} />
              <div className="space-y-2 mt-4">
                {matches.map((item, i) => {
                  const color = getSportColor(item.sport);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="card flex items-center gap-4 p-4"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>
                        <Radio size={15} />
                      </div>
                      <Link href={item.href} className="flex-1 min-w-0 hover:underline">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {item.subtitle} · Added {formatRelative(item.addedAt)}
                        </p>
                      </Link>
                      <button
                        onClick={() => removeFavorite(item.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label="Remove from favorites"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Teams */}
          {teams.length > 0 && (
            <div>
              <SectionHeader title="Saved Teams" subtitle={`${teams.length} saved`} />
              <div className="space-y-2 mt-4">
                {teams.map((item, i) => {
                  const color = getSportColor(item.sport);
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className="card flex items-center gap-4 p-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>
                        <Users size={15} />
                      </div>
                      <Link href={item.href} className="flex-1 min-w-0 hover:underline">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{item.subtitle}</p>
                      </Link>
                      <button onClick={() => removeFavorite(item.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                        style={{ color: 'var(--text-muted)' }} aria-label="Remove">
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Leagues */}
          {leagues.length > 0 && (
            <div>
              <SectionHeader title="Saved Leagues" subtitle={`${leagues.length} saved`} />
              <div className="space-y-2 mt-4">
                {leagues.map((item, i) => {
                  const color = getSportColor(item.sport);
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className="card flex items-center gap-4 p-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>
                        <Trophy size={15} />
                      </div>
                      <Link href={item.href} className="flex-1 min-w-0 hover:underline">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{item.subtitle || 'League'}</p>
                      </Link>
                      <button onClick={() => removeFavorite(item.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                        style={{ color: 'var(--text-muted)' }} aria-label="Remove">
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
