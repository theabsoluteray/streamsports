/**
 * Stream Provider Registry — v2 (EmbedSportex-first)
 *
 * Primary: EmbedSportex API supplies real, per-match embed URLs
 * Fallback: static template providers (sportsurge, daddylive, streameast)
 *           used when a match has no EmbedSportex iframes
 */
import type { Match, StreamSource } from '@/lib/types';
import type { EspIframe } from '@/lib/api/embedsportex';

// ─── Provider Interface ───────────────────────────────────────────────────────

export interface StreamProvider {
  id: string;
  name: string;
  quality: string;
  buildUrl: (match: Match) => string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ─── Fallback Static Providers ────────────────────────────────────────────────
// Used when EmbedSportex has no iframes for a match

export const FALLBACK_PROVIDERS: StreamProvider[] = [
  {
    id: 'sportsurge',
    name: 'SportSurge',
    quality: 'HD',
    buildUrl: (m) =>
      `https://v2.sportsurge.uno/embed/${slugify(m.homeTeam.name)}-vs-${slugify(m.awayTeam.name)}`,
  },
  {
    id: 'daddylive',
    name: 'DaddyLive',
    quality: 'HD',
    buildUrl: () => `https://daddylivehd.com/embed/stream-74.php`,
  },
  {
    id: 'streameast',
    name: 'StreamEast',
    quality: 'HD',
    buildUrl: (m) =>
      `https://streameast.app/embed/${slugify(m.homeTeam.name)}-vs-${slugify(m.awayTeam.name)}`,
  },
  {
    id: 'vipleague',
    name: 'VIPLeague',
    quality: 'SD',
    buildUrl: (m) =>
      `https://vipleague.im/embed/${slugify(m.homeTeam.name)}-${slugify(m.awayTeam.name)}-streaming`,
  },
];

// ─── Build StreamSource list for a match ─────────────────────────────────────

/**
 * Get stream sources for a match.
 * If the match has EmbedSportex iframes, those are primary.
 * Otherwise fall back to static template providers.
 */
export function getStreamsForMatch(
  match: Match & { espEmbeds?: EspIframe[] }
): StreamSource[] {
  const isLive = match.state === 'in';
  const espEmbeds: EspIframe[] = match.espEmbeds ?? [];

  if (espEmbeds.length > 0) {
    // Map EmbedSportex iframes to StreamSource
    const esp: StreamSource[] = espEmbeds.map((iframe, i) => ({
      id:      `esp-${i}-${iframe.server.replace(/[^a-z0-9]/gi, '')}`,
      name:    iframe.server || `Server ${i + 1}`,
      url:     iframe.url,
      quality: iframe.server.includes('FHD') ? '1080p'
             : iframe.server.includes('HD')  ? 'HD'
             : iframe.server.includes('VIP') ? 'VIP'
             : 'Auto',
      isLive,
    }));

    // Append fallback providers at the end for resilience
    const fallbacks: StreamSource[] = FALLBACK_PROVIDERS.map((p) => ({
      id: p.id,
      name: p.name,
      url: p.buildUrl(match),
      quality: p.quality,
      isLive,
    }));

    return [...esp, ...fallbacks];
  }

  // No EmbedSportex iframes — use static fallbacks only
  return FALLBACK_PROVIDERS.map((p) => ({
    id: p.id,
    name: p.name,
    url: p.buildUrl(match),
    quality: p.quality,
    isLive,
  }));
}

/** Default provider: first EmbedSportex server or first fallback */
export const DEFAULT_PROVIDER_ID = 'esp-0-AUTO';

/** Get a fallback provider by id */
export function getFallbackProvider(id: string): StreamProvider | undefined {
  return FALLBACK_PROVIDERS.find((p) => p.id === id);
}

// Keep STREAM_PROVIDERS exported for any legacy usage
export const STREAM_PROVIDERS = FALLBACK_PROVIDERS;
