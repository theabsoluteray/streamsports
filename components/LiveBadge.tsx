export default function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-400 uppercase tracking-wider flex-shrink-0">
      <span className="live-dot w-1.5 h-1.5 rounded-full bg-red-500" />
      Live
    </span>
  );
}
