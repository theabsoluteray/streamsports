'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Generic Skeleton ──────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton rounded', className)}
      style={style}
      aria-hidden="true"
    />
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'card flex flex-col items-center justify-center text-center p-10',
        className
      )}
    >
      {icon && (
        <div className="mb-4 opacity-30" style={{ color: 'var(--text-muted)' }}>
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-xs max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

// ─── Error State ───────────────────────────────────────────────────────────────

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Could not load data. Check your connection and try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6 text-center',
        className
      )}
      style={{
        background: 'rgba(239,68,68,0.04)',
        borderColor: 'rgba(239,68,68,0.15)',
      }}
    >
      <p className="text-sm font-semibold text-red-400 mb-1">{title}</p>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors hover:bg-[var(--bg-elevated)]"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
        >
          Try again
        </button>
      )}
    </div>
  );
}

// ─── Loading Spinner ───────────────────────────────────────────────────────────

export function LoadingSpinner({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn('rounded-full border-2 border-brand-500 border-t-transparent animate-spin', className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  onViewAllClick?: () => void;
  badge?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = 'View all',
  onViewAllClick,
  badge,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-7', className)}>
      <div className="flex items-center gap-2.5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="section-title">{title}</h2>
            {badge}
          </div>
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
          )}
        </div>
      </div>
      {onViewAllClick ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            onViewAllClick();
          }}
          className="text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors flex-shrink-0 cursor-pointer"
        >
          {viewAllLabel}
        </button>
      ) : viewAllHref ? (
        <a
          href={viewAllHref}
          className="text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors flex-shrink-0"
        >
          {viewAllLabel} →
        </a>
      ) : null}
    </div>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function Section({ children, id, className }: SectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn('', className)}
    >
      {children}
    </motion.section>
  );
}
