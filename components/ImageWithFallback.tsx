'use client';

import { useState } from 'react';
import { Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to get initials from team name
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface TeamLogoProps {
  logo?: string;
  name: string;
  size?: number;
  className?: string;
}

export function TeamLogo({ logo, name, size = 32, className }: TeamLogoProps) {
  const [error, setError] = useState(false);

  if (logo && !error) {
    return (
      <div 
        className={cn("bg-white/[0.04] p-1 rounded-full flex items-center justify-center flex-shrink-0 border border-white/5 overflow-hidden", className)} 
        style={{ width: size + 10, height: size + 10 }}
      >
        <img
          src={logo}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold flex-shrink-0 uppercase border select-none", 
        className
      )}
      style={{ 
        width: size + 10, 
        height: size + 10, 
        background: 'var(--bg-elevated)', 
        borderColor: 'var(--border-default)', 
        color: 'var(--text-muted)',
        fontSize: size > 30 ? '0.85rem' : '0.65rem'
      }}
    >
      {initials}
    </div>
  );
}

interface PlayerPhotoProps {
  photo?: string;
  name: string;
  size?: number;
  className?: string;
}

export function PlayerPhoto({ photo, name, size = 48, className }: PlayerPhotoProps) {
  const [error, setError] = useState(false);

  if (photo && !error) {
    return (
      <div 
        className={cn("overflow-hidden rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0 border border-white/5", className)}
        style={{ width: size, height: size }}
      >
        <img
          src={photo}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl flex-shrink-0 select-none border",
        className
      )}
      style={{
        width: size,
        height: size,
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border-default)',
        color: 'var(--text-muted)',
      }}
    >
      <User size={size * 0.45} />
    </div>
  );
}

interface LeagueLogoProps {
  logo?: string;
  name: string;
  size?: number;
  className?: string;
}

export function LeagueLogo({ logo, name, size = 32, className }: LeagueLogoProps) {
  const [error, setError] = useState(false);

  if (logo && !error) {
    return (
      <div 
        className={cn("bg-white/[0.04] p-1 rounded-full flex items-center justify-center flex-shrink-0 border border-white/5 overflow-hidden", className)} 
        style={{ width: size + 10, height: size + 10 }}
      >
        <img
          src={logo}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full flex-shrink-0 select-none border", 
        className
      )}
      style={{ 
        width: size + 10, 
        height: size + 10, 
        background: 'var(--bg-elevated)', 
        borderColor: 'var(--border-default)', 
        color: 'var(--text-muted)'
      }}
    >
      <Trophy size={size * 0.45} />
    </div>
  );
}
