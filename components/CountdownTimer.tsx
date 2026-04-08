'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Bell, Radio } from 'lucide-react';

interface Props {
  targetDate: number; // unix ms
  title?: string;
}

export default function CountdownTimer({ targetDate, title }: Props) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [isLiveSoon, setIsLiveSoon] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsLiveSoon(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
      <div className="relative group">
        <div className="absolute -inset-2 bg-indigo-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center backdrop-blur-md">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tighter"
            >
              {value.toString().padStart(2, '0')}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <div className="player-aspect overflow-hidden group bg-[#030712] rounded-[16px] shadow-2xl shadow-indigo-500/10">
      <div className="player-overlay flex flex-col items-center justify-center z-10 w-full h-full relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 blur-[100px] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/5 blur-[80px] rounded-full delay-700" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 px-6 text-center w-full max-w-lg mx-auto">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <Timer size={12} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
              Commencing Soon
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight max-w-md">
            {isLiveSoon ? "Final Preparations In Progress" : (title || "Transmission Scheduled")}
          </h3>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <TimeUnit value={timeLeft.days} label="Days" />
          <div className="text-indigo-500/30 font-black text-xl mb-6">:</div>
          <TimeUnit value={timeLeft.hours} label="Hrs" />
          <div className="text-indigo-500/30 font-black text-xl mb-6">:</div>
          <TimeUnit value={timeLeft.minutes} label="Min" />
          <div className="text-indigo-500/30 font-black text-xl mb-6">:</div>
          <TimeUnit value={timeLeft.seconds} label="Sec" />
        </div>

        <div className="flex flex-col items-center gap-4 mt-4">
          <button 
            className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <Bell size={14} />
            Notify on Start
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
              Awaiting Stream Signal
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay z-0" />
    </div>
  );
}
