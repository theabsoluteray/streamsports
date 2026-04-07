'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

import { fetchAllMatches, getLive } from '@/lib/api';

const NAV = [
  { href: '/',         label: 'Home' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/search',   label: 'Search' },
];

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    fetchAllMatches().then((m) => setLiveCount(getLive(m).length)).catch(() => {});
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        scrolled ? 'bg-[#060d1a]/95 backdrop-blur-sm border-b border-white/5' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" id="logo" className="font-bold text-white text-sm tracking-tight flex-shrink-0">
          StreamSport
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-0.5">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase()}`}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                path === href
                  ? 'text-white bg-white/8 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Live badge */}
        <div className="hidden sm:flex items-center gap-1.5 ml-auto min-h-[20px]">
          {liveCount !== null && (
            <>
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <span className="text-xs text-slate-400 font-medium">{liveCount} live now</span>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          id="mobile-toggle"
          className="sm:hidden ml-auto p-1 text-slate-400 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden bg-[#0a1428] border-b border-white/5" id="mobile-menu">
          <nav className="max-w-6xl mx-auto px-4 py-2 flex flex-col gap-0.5">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2.5 rounded-md text-sm ${
                  path === href
                    ? 'text-white bg-white/8 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
