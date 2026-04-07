import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5" id="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <span className="font-semibold text-slate-500">StreamSport</span>
        <nav className="flex items-center gap-4">
          <Link href="/" className="hover:text-slate-400 transition-colors">Home</Link>
          <Link href="/schedule" className="hover:text-slate-400 transition-colors">Schedule</Link>
          <Link href="/search" className="hover:text-slate-400 transition-colors">Search</Link>
        </nav>
        <span>Streams are from third-party providers. We host no content.</span>
      </div>
    </footer>
  );
}
