'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollRowProps {
  children: React.ReactNode;
}

export function ScrollRow({ children }: ScrollRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [children]);

  const scrollBy = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <div>
      {(canLeft || canRight) && (
        <div className="hidden sm:flex items-center gap-2 justify-end mb-3">
          <button onClick={() => scrollBy(-1)} disabled={!canLeft} className="scroll-arrow" aria-label="Scroll left">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scrollBy(1)} disabled={!canRight} className="scroll-arrow" aria-label="Scroll right">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
      <div ref={ref} className="flex gap-4 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {children}
      </div>
    </div>
  );
}
