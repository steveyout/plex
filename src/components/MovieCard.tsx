import { Play, Star, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { MediaItem } from '../types';

interface MovieCardProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
  onPlayClick: (item: MediaItem) => void;
}

export default function MovieCard({ item, onClick, onPlayClick }: MovieCardProps) {
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
      className="flex-shrink-0 w-[140px] sm:w-[170px] bg-white border border-zinc-200 dark:bg-white/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg cursor-pointer group hover:shadow-2xl hover:border-[#E5A00D] dark:hover:border-[#E5A00D] transition-all duration-300"
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
            <span className="font-display font-black text-[#E5A00D] text-4xl block mb-2 leading-none">PLEX</span>
            <span className="text-xs text-gray-400 font-medium line-clamp-3 px-1">{title}</span>
          </div>
        )}

        {/* Rating Bubble Overlay */}
        <div className="absolute top-2 left-2 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg px-1.5 py-0.5 text-[10px] font-mono text-[#E5A00D] flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-[#E5A00D] text-[#E5A00D]" />
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
            className="w-12 h-12 rounded-full bg-white hover:bg-[#E5A00D] flex items-center justify-center text-black shadow-xl"
            title="Instant Play Now"
          >
            <Play className="w-5 h-5 fill-current text-black ml-0.5" />
          </motion.button>
        </div>
      </div>

      {/* Info Segment */}
      <div className="p-3 space-y-1 bg-zinc-50 dark:bg-black/30">
        <h4 className="text-xs sm:text-xs uppercase tracking-wider font-bold truncate text-zinc-800 dark:text-gray-100 group-hover:text-[#E5A00D] transition-colors" title={title}>
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
