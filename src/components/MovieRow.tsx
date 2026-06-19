import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import MovieCard from './MovieCard';
import { MediaItem } from '../types';

interface MovieRowProps {
  title: string;
  items: MediaItem[];
  onItemClick: (item: MediaItem) => void;
  onPlayClick: (item: MediaItem) => void;
}

export default function MovieRow({ title, items, onItemClick, onPlayClick }: MovieRowProps) {
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

  if (!items || items.length === 0) return null;

  return (
    <div className="relative space-y-3 px-4 sm:px-8 group/row">
      {/* Title */}
      {title && (
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="font-display text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-[#F5F5F5] flex items-center gap-3">
            <span className="w-1 h-4 bg-[#E5A00D] inline-block"></span>
            {title}
          </h3>
          <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">({items.length} TITLES)</span>
        </div>
      )}

      {/* Row Scrolling Wrapper */}
      <div className="relative">
        {/* Left Scroll Button */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:-translate-x-4 w-9 h-14 bg-black/90 hover:bg-[#080808] border border-white/10 rounded-none text-white flex items-center justify-center shadow-xl hover:text-[#E5A00D] hover:border-[#E5A00D] backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all duration-300 z-20 cursor-pointer"
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
          {items.map((item, index) => (
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
          ))}
        </div>

        {/* Right Scroll Button */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-4 w-9 h-14 bg-black/90 hover:bg-[#080808] border border-white/10 rounded-none text-white flex items-center justify-center shadow-xl hover:text-[#E5A00D] hover:border-[#E5A00D] backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all duration-300 z-20 cursor-pointer"
            title="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
