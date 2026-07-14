import { Play, Star, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { MediaItem } from '../types';
import { useBrand } from '../utils/brand';

interface MovieCardProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
  onPlayClick: (item: MediaItem) => void;
}

export default function MovieCard({ item, onClick, onPlayClick }: MovieCardProps) {
  const brand = useBrand();
  const isTv = item.media_type === 'tv' || !item.title;
  const title = item.title || item.name || 'Untitled Media';
  const rawDate = item.release_date || item.first_air_date || '';
  const year = rawDate ? rawDate.split('-')[0] : 'N/A';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'NR';

  // TMDB Poster Base Paths
  const imageSrc = item.poster_path 
    ? item.poster_path.startsWith('http') 
      ? item.poster_path 
      : `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      className={`flex-shrink-0 w-[140px] sm:w-[170px] bg-white border border-zinc-200 dark:bg-white/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg cursor-pointer group hover:shadow-2xl transition-all duration-300 hover:border-current`}
      style={{ color: brand.accentColor } as any}
      onClick={() => onClick(item)}
      id={`movie-card-${item.id}`}
    >
      {/* Poster Container with Hover Overlays */}
      <div className="relative aspect-[2/3] w-full bg-[#080808] overflow-hidden rounded-t-2xl">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-2xl"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#080808] to-white/5 text-center relative border border-white/10 rounded-t-2xl">
            <span className={`font-display font-black text-xs uppercase block mb-2 leading-none ${brand.textAccent}`}>{brand.name}</span>
            <span className="text-xs text-gray-400 font-medium line-clamp-3 px-1">{title}</span>
          </div>
        )}

        {/* Rating Bubble Overlay */}
        <div className={`absolute top-2 left-2 bg-black/95 backdrop-blur-md border border-white/10 rounded-lg px-1.5 py-0.5 text-[10px] font-mono flex items-center gap-0.5 ${brand.textAccent}`}>
          <Star className={`w-2.5 h-2.5 ${brand.fillAccent} ${brand.textAccent}`} />
          <span>{rating}</span>
        </div>

        {/* Media Tag Bubble */}
        <div className="absolute top-2 right-2 bg-black/85 backdrop-blur-md border border-white/10 rounded-lg px-2 py-0.5 text-[9px] font-mono uppercase font-bold text-gray-300 tracking-wider">
          {isTv ? 'TV' : 'Movie'}
        </div>

        {/* Instant Hover Play Screen */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation(); // Avoid opening the detail modal
              onPlayClick(item);
            }}
            className={`w-12 h-12 rounded-full bg-white flex items-center justify-center text-black shadow-xl hover:text-white transition-colors duration-200 ${brand.hoverBgAccent}`}
            title="Instant Play Now"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </motion.button>
        </div>
      </div>

      {/* Info Segment */}
      <div className="p-3 space-y-1 bg-zinc-50 dark:bg-black/30">
        <h4 className={`text-xs sm:text-xs uppercase tracking-wider font-bold truncate text-zinc-800 dark:text-gray-100 group-hover:${brand.textAccent} transition-colors`} title={title}>
          {title}
        </h4>
        <div className="flex items-center justify-between text-[9px] text-zinc-500 dark:text-gray-500 font-mono">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-zinc-400 dark:text-gray-650" />
            <span>{year}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[140px] sm:w-[170px] bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      {/* Poster Aspect Ratio Placeholder */}
      <div className="relative aspect-[2/3] w-full bg-zinc-200 dark:bg-zinc-800/80" />
      
      {/* Bottom Info Placeholder */}
      <div className="p-3 space-y-2 bg-zinc-50 dark:bg-black/30">
        {/* Title line placeholder */}
        <div className="h-3.5 w-11/12 bg-zinc-300 dark:bg-zinc-800 rounded" />
        {/* Year placeholder */}
        <div className="h-3 w-1/2 bg-zinc-250 dark:bg-zinc-800/60 rounded" />
      </div>
    </div>
  );
}

