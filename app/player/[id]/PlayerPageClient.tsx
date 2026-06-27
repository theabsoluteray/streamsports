'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Users, Globe, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayer } from '@/lib/hooks';
import { EmptyState, LoadingSpinner } from '@/components/ui';

import { PlayerPhoto } from '@/components/ImageWithFallback';

interface PlayerPageClientProps {
  params: Promise<{ id: string }>;
}

export default function PlayerPageClient({ params }: PlayerPageClientProps) {
  const { id } = use(params);
  const { data: player, isLoading, isError } = usePlayer(id);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (isError || !player) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-5 hover:text-[var(--text-secondary)] transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ChevronLeft size={14} /> Back
        </Link>
        <EmptyState
          icon={<Users size={36} />}
          title="Player profile unavailable"
          description="We don't have detailed data for this player on our free tier yet — coverage is limited to a small set of players right now."
          action={
            <Link href="/search" className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors">
              Try another search →
            </Link>
          }
        />
      </div>
    );
  }

  const stats = [
    { label: 'Position',    value: player.position,    icon: Users    },
    { label: 'Nationality', value: player.nationality, icon: Globe    },
    { label: 'Date of Birth', value: player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString() : null, icon: Calendar },
    { label: 'Team',        value: player.teamName,    icon: Users    },
  ].filter((s) => s.value);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-5 hover:text-[var(--text-secondary)] transition-colors" style={{ color: 'var(--text-muted)' }}>
        <ChevronLeft size={14} /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-start gap-5">
          <PlayerPhoto photo={player.photo} name={player.name} size={96} className="w-24 h-24 rounded-2xl" />
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{player.name}</h1>
            {player.teamName && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{player.teamName}</p>
            )}
            <div className="grid grid-cols-2 gap-3 mt-5">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: 'var(--bg-elevated)' }}>
                  <Icon size={15} className="mt-0.5 text-[var(--text-muted)] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
