'use client';

/**
 * @deprecated Use lib/api/espn.ts and lib/api/thesportsdb.ts instead.
 * This file is kept temporarily for backward compatibility.
 * All new code should use the hooks in lib/hooks.ts.
 */
export type { Match, Team, League, Player } from '@/lib/types';
export { getAllMatches as fetchAllMatches, getMatchById as fetchMatchById } from '@/lib/api/espn';
