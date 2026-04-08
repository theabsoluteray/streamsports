'use client';
import { useState, useRef, useEffect } from 'react';
import { RefreshCw, Maximize2, ExternalLink, Loader2, Play, Info } from 'lucide-react';

interface Props {
  embedUrl: string;
  title: string;
}

export default function StreamPlayer({ embedUrl, title }: Props) {
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
  }, [embedUrl]);

  const handleRefresh = () => {
    setLoading(true);
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = currentSrc;
      }, 50);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="player-aspect shadow-2xl shadow-indigo-500/10 group"
      >
        {!isPlaying ? (
          <div
            className="player-overlay flex flex-col items-center justify-center bg-[#030712] transition-all cursor-pointer hover:bg-[#080c18]"
            onClick={() => setIsPlaying(true)}
          >
            <div className="w-20 h-20 rounded-full bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 group-hover:bg-indigo-600/30 transition-all duration-300">
              <Play size={32} className="text-indigo-400 fill-indigo-400 ml-1" />
            </div>
            <p className="mt-6 text-sm font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
              Click to load stream
            </p>
            <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <Info size={14} className="text-slate-500" />
              <p className="text-[11px] text-slate-500">Iframe will load in sandbox for security</p>
            </div>
          </div>
        ) : (
          <>
            {loading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#030712] gap-4">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-xs font-medium text-slate-500 tracking-widest uppercase">Initializing Secure Stream</p>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setLoading(false)}
              title={title}
            />

            {/* In-player controls */}
            <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleRefresh}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-all"
                title="Reload Stream"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={toggleFullscreen}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-all"
                title="Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-600 border border-indigo-500 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                title="Open Source"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[11px] font-bold text-emerald-500/80 uppercase tracking-widest">Connection Stable</p>
        </div>
        <p className="text-[10px] text-slate-600 font-medium">Source: {new URL(embedUrl).hostname}</p>
      </div>
    </div>
  );
}
