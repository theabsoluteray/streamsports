export default function LiveBadge({ small = false }: { small?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold text-red-400 uppercase tracking-wider flex-shrink-0 ${
      small ? 'text-[9px]' : 'text-[10px]'
    }`}>
      <span className={`live-dot rounded-full bg-red-500 ${small ? 'w-1 h-1' : 'w-1.5 h-1.5'}`} />
      Live
    </span>
  );
}
