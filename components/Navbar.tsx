'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import { getSports, getLiveMatches, isLive } from '@/lib/api';
import type { Sport } from '@/lib/api';

const STATIC_NAV = [
  { href: '/',         label: 'Home' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/search',   label: 'Search' },
];

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    getSports().then(setSports).catch(() => {});
    getLiveMatches().then((m) => {
      const active = m.filter(match => isLive(match));
      setLiveCount(active.length);
    }).catch(() => {});
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#030712]/90 backdrop-blur-xl border-b border-white/[0.04]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" id="logo" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-white text-base tracking-tight">
            Stream<span className="text-indigo-400">Sport</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {STATIC_NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase()}`}
              className={`px-3.5 py-2 rounded-lg text-sm transition-all duration-200 ${
                path === href
                  ? 'text-white bg-white/[0.08] font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {label}
            </Link>
          ))}
          {/* Sport links */}
          {sports.slice(0, 6).map((s) => (
            <Link
              key={s.id}
              href={`/sport/${s.id}`}
              className={`px-3.5 py-2 rounded-lg text-sm transition-all duration-200 ${
                path === `/sport/${s.id}`
                  ? 'text-white bg-white/[0.08] font-semibold'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
              }`}
            >
              {s.name}
            </Link>
          ))}
        </nav>

        {/* Live badge */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          {liveCount !== null && liveCount > 0 && (
            <Link href="/#live" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors">
              <span className="live-dot w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-red-400 font-semibold">{liveCount} Live</span>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          id="mobile-toggle"
          className="md:hidden ml-auto p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#030712]/95 backdrop-blur-xl border-b border-white/5" id="mobile-menu">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {STATIC_NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm ${
                  path === href
                    ? 'text-white bg-white/[0.08] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="h-px bg-white/5 my-2" />
            <p className="px-4 text-[10px] uppercase tracking-wider text-slate-600 mb-1">Sports</p>
            {sports.map((s) => (
              <Link
                key={s.id}
                href={`/sport/${s.id}`}
                onClick={() => setOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm ${
                  path === `/sport/${s.id}`
                    ? 'text-white bg-white/[0.08] font-semibold'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {s.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
