'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { History, Trash2, Radio } from 'lucide-react';
import { useHistoryStore } from '@/lib/store';
import { EmptyState } from '@/components/ui';
import { getSportColor } from '@/lib/sports-config';
import { formatRelative } from '@/lib/utils';

export default function HistoryPage() {
  const { history, removeFromHistory, clearHistory } = useHistoryStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History size={22} style={{ color: 'var(--text-secondary)' }} />
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Watch History
          </h1>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={<History size={40} />}
          title="No watch history"
          description="Matches you've watched will appear here."
          action={
            <Link href="/" className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors">
              Browse live matches →
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {history.map((entry, i) => {
            const color = getSportColor(entry.sport);
            const progressPct = Math.min((entry.progressSeconds / 7200) * 100, 100);
            return (
              <motion.div
                key={entry.matchId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card flex items-center gap-4 p-4"
              >
                {/* Sport icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15`, color }}
                >
                  <Radio size={17} />
                </div>

                {/* Info */}
                <Link
                  href={`/match/${entry.matchId}?sport=${entry.sport}`}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-semibold truncate hover:underline" style={{ color: 'var(--text-primary)' }}>
                    {entry.matchTitle}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                    {entry.leagueName} · Watched {formatRelative(entry.watchedAt)}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-2 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <div
                      className="h-full rounded-full bg-brand-500/60 transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </Link>

                {/* Remove */}
                <button
                  onClick={() => removeFromHistory(entry.matchId)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-elevated)] transition-colors flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Remove from history"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
