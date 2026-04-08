'use client';
import { MatchSource, Stream } from '@/lib/api';
import { useStore } from '@/lib/store';
import { Globe, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  sources: MatchSource[];
  streams: Stream[];
  onSourceChange: (sourceIndex: number) => void;
  onStreamChange: (streamIndex: number) => void;
}

export default function StreamSourceSelector({ sources, streams, onSourceChange, onStreamChange }: Props) {
  const { activeSourceIdx, activeStreamIdx } = useStore();

  return (
    <div className="space-y-6">
      {/* Sources (Servers) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Server</h3>
          </div>
          <p className="text-[10px] text-slate-600 font-medium">{sources.length} available</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sources.map((src, i) => (
            <button
              key={`${src.source}-${src.id}`}
              onClick={() => onSourceChange(i)}
              className={`source-btn flex items-center justify-center gap-2 ${
                activeSourceIdx === i ? 'active' : ''
              }`}
            >
              <Zap size={12} className={activeSourceIdx === i ? 'text-white' : 'text-slate-600'} />
              Server {src.source.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Streams (Languages/Resolutions) */}
      {streams.length > 0 && (
        <div className="space-y-3 slide-up">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stream Language</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <p className="text-[10px] text-slate-600 font-medium">Auto-selection active</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {streams.map((stream, i) => (
              <button
                key={stream.id}
                onClick={() => onStreamChange(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  activeStreamIdx === i
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400 shadow-lg shadow-indigo-500/5'
                    : 'bg-white/[0.02] border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
                }`}
              >
                {stream.language}
                {stream.hd && (
                  <span className="px-1 py-0.5 rounded-[4px] bg-emerald-500/10 text-[9px] text-emerald-500 border border-emerald-500/20">
                    HD
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
