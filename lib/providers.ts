/**
 * @deprecated Use @/lib/api/streams.ts instead.
 * This re-exports for backward compatibility.
 */
export type { StreamProvider as Provider } from '@/lib/api/streams';
export { STREAM_PROVIDERS as providers, getFallbackProvider as getProvider } from '@/lib/api/streams';
