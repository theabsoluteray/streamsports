'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Radio, Calendar, Trophy, Bookmark, Settings, Sun, Moon,
} from 'lucide-react';
import { useThemeStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const SIDEBAR_ITEMS = [
  { href: '/',          label: 'Home',     icon: Home },
  { href: '/#live',     label: 'Live',     icon: Radio },
  { href: '/schedule',  label: 'Schedule', icon: Calendar },
  { href: '/sports',    label: 'Leagues',  icon: Trophy },
  { href: '/favorites', label: 'My List',  icon: Bookmark },
  { href: '/settings',  label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useThemeStore();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/sports') return pathname.startsWith('/sports');
    return pathname.startsWith(href.split('#')[0]);
  };

  return (
    <aside className="sidebar" aria-label="Main navigation">
      {SIDEBAR_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn('sidebar-item', active && 'active')}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        );
      })}

      <div className="sidebar-spacer" />

      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        className="sidebar-toggle"
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait">
          {resolvedTheme === 'dark' ? (
            <motion.span key="sun" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
              <Moon size={18} />
            </motion.span>
          ) : (
            <motion.span key="moon" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
              <Sun size={18} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </aside>
  );
}
