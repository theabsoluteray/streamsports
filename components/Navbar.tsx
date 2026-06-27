'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sun, Moon, Menu, X, ChevronDown,
  Bookmark, Home, Radio, Calendar, User, Play,
} from 'lucide-react';
import { useLiveMatches } from '@/lib/hooks';
import { useUIStore, useThemeStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { SPORTS_CONFIG } from '@/lib/sports-config';
import type { Match } from '@/lib/types';

// ─── Live ticker ──────────────────────────────────────────────────────────────
function LiveTicker({ matches }: { matches: Match[] }) {
  if (matches.length === 0) return null;
  const items = [...matches, ...matches];
  return (
    <div className="ticker-bar border-t" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="ticker-inner">
        {items.map((m, i) => (
          <Link
            key={`${m.id}-${i}`}
            href={`/match/${m.id}?sport=${m.sport}&league=${m.league.id}`}
            className={cn('ticker-item hover:text-[var(--text-primary)] transition-colors', 'is-live')}
          >
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-[var(--live-red)] flex-shrink-0" />
            <span className="truncate max-w-[100px]">{m.homeTeam.abbreviation}</span>
            <span className="ticker-score">{m.homeScore}–{m.awayScore}</span>
            <span className="truncate max-w-[100px]">{m.awayTeam.abbreviation}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Sports mega-dropdown ─────────────────────────────────────────────────────
function SportsDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-full left-0 mt-2 w-52 rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.65)',
          }}
        >
          <div className="p-2">
            {SPORTS_CONFIG.map((sport) => (
              <Link
                key={sport.slug}
                href={`/sports/${sport.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: sport.color }}
                />
                {sport.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────
function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col overflow-y-auto"
            style={{
              background: 'var(--bg-surface)',
              borderRight: '1px solid var(--border-default)',
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--primary)' }}
                >
                  <Play size={14} fill="white" className="text-white ml-0.5" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-[15px] tracking-tight text-[var(--text-primary)]">
                    SPORTS
                  </span>
                  <span className="font-extrabold text-[15px] tracking-tight text-[var(--primary)]">
                    STREAM
                  </span>
                </div>
              </Link>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-[var(--text-muted)]"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="flex-1 p-3">
              {[
                { href: '/',          label: 'Home',     icon: Home },
                { href: '/#live',     label: 'Live TV',  icon: Radio },
                { href: '/schedule',  label: 'Schedule', icon: Calendar },
                { href: '/favorites', label: 'Saved',    icon: Bookmark },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href} href={href} onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors mb-0.5',
                    pathname === href
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}

              <p className="px-3 pt-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                Sports
              </p>
              {SPORTS_CONFIG.map((sport) => (
                <Link
                  key={sport.slug} href={`/sports/${sport.slug}`} onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors mb-0.5"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sport.color }} />
                  {sport.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
function MobileBottomNav() {
  const pathname = usePathname();
  const { openSearch } = useUIStore();

  const items = [
    { icon: Home,     label: 'Home',     href: '/' },
    { icon: Radio,    label: 'Live',     href: '/#live' },
    { icon: Calendar, label: 'Schedule', href: '/schedule' },
    { icon: Bookmark, label: 'Saved',    href: '/favorites' },
    { icon: User,     label: 'Profile',  href: '/settings' },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {items.map(({ icon: Icon, label, href }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href.split('#')[0]);
        return (
          <Link
            key={href} href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-0"
            style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[9px] font-semibold tracking-wide">{label}</span>
          </Link>
        );
      })}
      <button
        onClick={openSearch}
        className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-0"
        style={{ color: 'var(--text-muted)' }}
      >
        <Search size={20} strokeWidth={1.8} />
        <span className="text-[9px] font-semibold tracking-wide">Search</span>
      </button>
    </nav>
  );
}

// ─── Desktop Nav Links ────────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: '/',                    label: 'Home' },
  { href: '/sports/football',     label: 'Football' },
  { href: '/sports/basketball',   label: 'Basketball' },
  { href: '/sports/ufc',          label: 'UFC' },
  { href: '/sports/f1',           label: 'F1' },
  { href: '/sports/tennis',       label: 'Tennis' },
];

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const [sportsOpen,  setSportsOpen]  = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const sportsRef = useRef<HTMLDivElement>(null);

  const { openSearch } = useUIStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const { data: liveMatches } = useLiveMatches();
  const liveCount = liveMatches?.length ?? 0;

  // Scroll detection → transparent/solid nav
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close sports dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sportsRef.current && !sportsRef.current.contains(e.target as Node)) {
        setSportsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Ctrl/Cmd+K → search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openSearch]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href.split('#')[0]);

  return (
    <>
      <header
        className={cn('nav-root', scrolled ? 'nav-solid' : 'nav-transparent')}
      >
        {/* Main bar */}
        <div className="page-container flex items-center h-[72px] gap-0">
          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-[var(--text-secondary)] mr-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mr-8 flex-shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--primary)' }}
            >
              <Play size={14} fill="white" className="text-white ml-0.5" />
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span className="font-extrabold text-[15px] tracking-tight text-[var(--text-primary)]">
                SPORTS
              </span>
              <span className="font-extrabold text-[15px] tracking-tight" style={{ color: 'var(--primary)' }}>
                STREAM
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-stretch gap-0 h-[72px]">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href} href={href}
                  className={cn(
                    'nav-link',
                    active && 'active'
                  )}
                >
                  {label}
                </Link>
              );
            })}

            {/* Sports mega-drop */}
            <div ref={sportsRef} className="relative flex items-center">
              <button
                onClick={() => setSportsOpen((o) => !o)}
                className={cn(
                  'flex items-center gap-1 px-4 text-[14px] font-medium transition-colors h-full',
                  sportsOpen
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
                aria-expanded={sportsOpen}
              >
                More
                <ChevronDown
                  size={13}
                  className={cn('transition-transform duration-200', sportsOpen && 'rotate-180')}
                />
              </button>
              <SportsDropdown isOpen={sportsOpen} onClose={() => setSportsOpen(false)} />
            </div>
          </nav>

          <div className="flex-1" />

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            {/* Search pill */}
            <button onClick={openSearch} className="search-pill" aria-label="Search (Ctrl+K)">
              <Search size={15} />
              <span className="search-pill-text">Search matches, teams...</span>
            </button>

            {/* Bookmark */}
            <Link
              href="/favorites"
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Bookmarks"
            >
              <Bookmark size={18} />
            </Link>

            {/* Profile */}
            <Link href="/settings" className="profile-avatar" aria-label="Profile">
              <User size={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer + bottom nav */}
      <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <MobileBottomNav />
    </>
  );
}
