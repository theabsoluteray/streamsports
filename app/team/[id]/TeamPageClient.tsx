'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Users, Globe, Trophy, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTeam, usePlayers } from '@/lib/hooks';
import { EmptyState, LoadingSpinner, SectionHeader } from '@/components/ui';
import { useFavoritesStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { TeamLogo, PlayerPhoto } from '@/components/ImageWithFallback';

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export default function TeamPageClient({ params }: TeamPageProps) {
  const { id } = use(params);
  const { data: team, isLoading: teamLoading, isError: teamError } = useTeam(id);
  const { data: players, isLoading: playersLoading } = usePlayers(id);
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();

  if (teamLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (teamError || !team) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-5 hover:text-[var(--text-secondary)] transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ChevronLeft size={14} /> Back
        </Link>
        <EmptyState
          icon={<Trophy size={36} />}
          title="Team profile unavailable"
          description="We don't have detailed data for this team on our free tier yet — coverage is limited to a small set of clubs right now. Live scores and schedules aren't affected."
          action={
            <Link href="/search" className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors">
              Try another search →
            </Link>
          }
        />
      </div>
    );
  }

  const fav = isFavorite(team.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-5 hover:text-[var(--text-secondary)] transition-colors" style={{ color: 'var(--text-muted)' }}>
        <ChevronLeft size={14} /> Back
      </Link>

      {/* Team header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-6"
      >
        <div className="flex items-start gap-5">
          <TeamLogo logo={team.logo} name={team.name} size={70} className="w-20 h-20 rounded-2xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{team.name}</h1>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {team.country && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Globe size={12} /> {team.country}
                    </span>
                  )}
                  {team.league && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Trophy size={12} /> {team.league}
                    </span>
                  )}
                  <span className="text-xs capitalize px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
                    {team.sport}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (fav) {
                    removeFavorite(team.id);
                  } else {
                    addFavorite({ id: team.id, type: 'team', name: team.name, sport: team.sport, href: `/team/${team.id}`, addedAt: new Date().toISOString() });
                  }
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex-shrink-0',
                  fav ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'border-[var(--border-default)] text-[var(--text-secondary)]'
                )}
              >
                <Heart size={13} fill={fav ? 'currentColor' : 'none'} />
                {fav ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Squad */}
      <SectionHeader title="Squad" subtitle={playersLoading ? 'Loading…' : `${players?.length ?? 0} players`} />
      {playersLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="card p-4 space-y-2">
              <div className="skeleton w-12 h-12 rounded-xl mx-auto" />
              <div className="skeleton h-3 w-3/4 rounded mx-auto" />
              <div className="skeleton h-2.5 w-1/2 rounded mx-auto" />
            </div>
          ))}
        </div>
      ) : !players || players.length === 0 ? (
        <EmptyState icon={<Users size={36} />} title="No squad data" description="Player information is not available for this team." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {players.map((player, i) => (
            <motion.div key={player.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
              <Link href={`/player/${player.id}`} className="card card-interactive p-4 flex flex-col items-center text-center gap-2 block">
                <PlayerPhoto photo={player.photo} name={player.name} size={48} className="rounded-xl" />
                <p className="text-xs font-semibold leading-tight truncate w-full" style={{ color: 'var(--text-primary)' }}>{player.name}</p>
                {player.position && (
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{player.position}</p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
