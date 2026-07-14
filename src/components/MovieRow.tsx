import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import MovieCard, { MovieCardSkeleton } from './MovieCard';
import { MediaItem } from '../types';
import { useBrand } from '../utils/brand';

interface MovieRowProps {
  title: string;
  items: MediaItem[];
  isLoading?: boolean;
  onItemClick: (item: MediaItem) => void;
  onPlayClick: (item: MediaItem) => void;
}

export default function MovieRow({ title, items, isLoading, onItemClick, onPlayClick }: MovieRowProps) {
  const brand = useBrand();
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check scroll positions to show/hide navigational arrows dynamically
  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const el = rowRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      // Run once on load
      checkScroll();
      // Handle resizing
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [items]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!isLoading && (!items || items.length === 0)) return null;

  return (
    <div className="relative space-y-3 px-4 sm:px-8 group/row">
      {/* Title */}
      {title && (
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-white/5 pb-2">
          <h3 className="font-display text-xs sm:text-sm font-black tracking-[0.15em] uppercase text-zinc-800 dark:text-[#F5F5F5] flex items-center gap-2">
            <span className="text-zinc-400 dark:text-gray-500 font-normal">|</span>
            {title}
          </h3>
          <button className={`text-[10px] text-zinc-500 dark:text-gray-400 font-semibold tracking-wider uppercase flex items-center gap-1 transition-all cursor-pointer hover:opacity-85 ${brand.hoverTextAccent}`}>
            <span>Browse all</span>
            <span>&rsaquo;</span>
          </button>
        </div>
      )}

      {/* Row Scrolling Wrapper */}
      <div className="relative">
        {/* Left Scroll Button */}
        {!isLoading && showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:translate-x-4 w-9 h-14 bg-white/95 text-zinc-800 border border-zinc-200 shadow-lg dark:bg-black/90 dark:text-white dark:border-white/10 dark:hover:bg-[#080808] backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all duration-300 z-20 cursor-pointer flex items-center justify-center hover:border-current`}
            style={{ color: brand.accentColor } as any}
            title="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Horizontal Container */}
        <div
          ref={rowRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth no-scrollbar"
          onScroll={checkScroll}
        >
          {isLoading ? (
            Array.from({ length: 7 }).map((_, index) => (
              <MovieCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : (
            items.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
              >
                <MovieCard
                  item={item}
                  onClick={onItemClick}
                  onPlayClick={onPlayClick}
                />
              </motion.div>
            ))
          )}
        </div>

        {/* Right Scroll Button */}
        {!isLoading && showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-4 w-9 h-14 bg-white/95 text-zinc-800 border border-zinc-200 shadow-lg dark:bg-black/90 dark:text-white dark:border-white/10 dark:hover:bg-[#080808] backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all duration-300 z-20 cursor-pointer flex items-center justify-center hover:border-current`}
            style={{ color: brand.accentColor } as any}
            title="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
