import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.04]" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm text-slate-400">
              Stream<span className="text-indigo-400/60">Sport</span>
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-5 text-xs text-slate-600">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <Link href="/schedule" className="hover:text-slate-300 transition-colors">Schedule</Link>
            <Link href="/search" className="hover:text-slate-300 transition-colors">Search</Link>
          </nav>

          {/* Disclaimer */}
          <p className="text-[11px] text-slate-700 text-center sm:text-right max-w-xs leading-relaxed">
            Streams are provided by third-party sources. We do not host or control any content.
          </p>
        </div>
      </div>
    </footer>
  );
}
