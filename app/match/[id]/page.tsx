'use client';
import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, Loader2, Calendar, Target, Shield, Info } from 'lucide-react';
import { getMatchesBySport, getAllMatches, getStreams, getBadgeUrl, getSportIcon, getSportColor, isUpcoming } from '@/lib/api';
import type { APIMatch, Stream } from '@/lib/api';
import StreamPlayer from '@/components/StreamPlayer';
import StreamSourceSelector from '@/components/StreamSourceSelector';
import CountdownTimer from '@/components/CountdownTimer';
import { useStore } from '@/lib/store';

export default function MatchPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { id } = use(params);
  const { cat } = use(searchParams);
  const { activeSourceIdx, setActiveSourceIdx, activeStreamIdx, setActiveStreamIdx } = useStore();

  const [match, setMatch] = useState<APIMatch | null | undefined>(undefined);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [streamsLoading, setStreamsLoading] = useState(false);

  // 1. Fetch Match Data
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matches = cat ? await getMatchesBySport(cat) : await getAllMatches();
        const found = matches.find((m) => m.id === id);
        setMatch(found ?? null);
      } catch (err) {
        console.error('Error fetching match:', err);
        setMatch(null);
      }
    };
    fetchMatch();
  }, [id, cat]);

  // 2. Fetch Streams when match or active source changes
  useEffect(() => {
    if (match && match.sources.length > 0) {
      const source = match.sources[activeSourceIdx] || match.sources[0];
      if (source) {
        setStreamsLoading(true);
        getStreams(source.source, source.id)
          .then(setStreams)
          .finally(() => setStreamsLoading(false));
      }
    }
  }, [match, activeSourceIdx]);

  const share = () => {
    if (match && navigator.share) {
      navigator.share({ 
        title: match.title, 
        text: `Watching ${match.title} live on StreamSport!`,
        url: location.href 
      });
    } else {
      navigator.clipboard?.writeText(location.href);
    }
  };

  if (match === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Match Event</p>
      </div>
    );
  }

  if (match === null) return notFound();

  const activeStream = streams[activeStreamIdx] || streams[0];
  const color = getSportColor(match.category);
  const icon = getSportIcon(match.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in" id="match-page">
      <Link href="/" className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white mb-8 transition-colors uppercase tracking-widest">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Arena
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content (Player + Sources) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Enhanced Match Header */}
          <div className="glass-card p-6 relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 w-full h-1" 
              style={{ background: `linear-gradient(to right, ${color.from}, ${color.to})` }} 
            />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl border border-white/10 shadow-inner">
                  {icon}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{match.title}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{match.category}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {new Date(match.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={share}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Share Event"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Teams Visualizer */}
            {match.teams && (
              <div className="mt-8 flex items-center justify-around py-4 border-t border-white/[0.04]">
                <div className="flex flex-col items-center gap-3 flex-1 text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 p-3 border border-white/10 flex items-center justify-center shadow-inner">
                    <img 
                      src={getBadgeUrl(match.teams.home?.badge || '')} 
                      alt={match.teams.home?.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-md"
                    />
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-wider line-clamp-1">{match.teams.home?.name}</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest">VS</div>
                </div>

                <div className="flex flex-col items-center gap-3 flex-1 text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 p-3 border border-white/10 flex items-center justify-center shadow-inner">
                    <img 
                      src={getBadgeUrl(match.teams.away?.badge || '')} 
                      alt={match.teams.away?.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-md"
                    />
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-wider line-clamp-1">{match.teams.away?.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Player Component */}
          <div className="space-y-4">
            {isUpcoming(match) ? (
              <CountdownTimer targetDate={match.date} title={match.title} />
            ) : activeStream ? (
              <StreamPlayer 
                embedUrl={activeStream.embedUrl} 
                title={match.title} 
              />
            ) : (
              <div className="player-aspect flex flex-col items-center justify-center gap-4 bg-[#030712] border-dashed">
                {streamsLoading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Searching for Quality Streams</p>
                  </>
                ) : (
                  <div className="player-aspect flex flex-col items-center justify-center gap-4 bg-[#030712] border-dashed">
                    <Shield size={32} className="text-slate-800" />
                    <p className="text-sm font-semibold text-slate-600 tracking-tight">No active streams found for this server.</p>
                    <p className="text-xs text-slate-700">Please try a different server below.</p>
                  </div>
                )}
              </div>
            )}

            {/* Source Selector */}
            <div className="glass-card p-6">
              <StreamSourceSelector 
                sources={match.sources}
                streams={streams}
                onSourceChange={(idx) => {
                  setActiveSourceIdx(idx);
                  setActiveStreamIdx(0);
                }}
                onStreamChange={(idx) => setActiveStreamIdx(idx)}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Match Intelligence</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-slate-500" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Competition</span>
                </div>
                <span className="text-xs font-bold text-white uppercase">{match.category}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3">
                  <Shield size={14} className="text-slate-500" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Popularity</span>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                  match.popular 
                    ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' 
                    : 'border-slate-800 bg-slate-900 text-slate-500'
                } uppercase tracking-widest`}>
                  {match.popular ? 'Trending' : 'Standard'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/[0.03] border border-indigo-500/10 space-y-3">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-indigo-400" />
                <p className="text-[11px] font-black text-indigo-300 uppercase tracking-widest">Pro Tips</p>
              </div>
              <ul className="text-[11px] text-slate-500 space-y-2 leading-relaxed font-medium">
                <li className="flex gap-2">
                  <span className="text-indigo-500">•</span>
                  Try Server B if Server A lags; they use different global endpoints.
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-500">•</span>
                  Stream is auto-optimized for your connection bandwidth.
                </li>
              </ul>
            </div>
          </div>

          <div className="glass-card p-6 text-center">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-4 text-center">Powered By</p>
            <div className="flex items-center justify-center gap-2 grayscale opacity-40">
              <span className="text-xs font-black text-white italic tracking-tighter">STREAMED</span>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-xs font-black text-white italic tracking-tighter">API V2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
