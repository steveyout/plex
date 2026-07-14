import { useState, useEffect, useRef } from 'react';
import { Search, X, Star, Film, Tv, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem } from '../types';
import { useBrand } from '../utils/brand';

interface SearchOverlayProps {
  onClose: () => void;
  onItemClick: (item: MediaItem) => void;
  onPlayClick: (item: MediaItem) => void;
  isDemo: boolean;
}

export default function SearchOverlay({ onClose, onItemClick, onPlayClick, isDemo }: SearchOverlayProps) {
  const brand = useBrand();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
    // Bind Escape key to close search
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced search trigger
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setLoading(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        let endpoint = `/api/tmdb/search/multi?query=${encodeURIComponent(query)}`;
        if (mediaTypeFilter === 'movie') {
          endpoint = `/api/tmdb/search/movie?query=${encodeURIComponent(query)}`;
        } else if (mediaTypeFilter === 'tv') {
          endpoint = `/api/tmdb/search/tv?query=${encodeURIComponent(query)}`;
        }

        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          let items: MediaItem[] = data.results || [];
          
          // Inject media type to searches that return general objects
          items = items.map(item => {
            if (!item.media_type) {
              item.media_type = item.title ? 'movie' : 'tv';
            }
            return item;
          });

          // Screen out people profiles
          items = items.filter(item => item.media_type === 'movie' || item.media_type === 'tv');

          // Apply client-side genre filters if specified
          if (selectedGenreId) {
            items = items.filter(item => {
              if (item.genre_ids) {
                return item.genre_ids.includes(selectedGenreId);
              }
              if (item.genres) {
                return item.genres.some(g => g.id === selectedGenreId);
              }
              return true; // fallback
            });
          }

          setResults(items);
        }
      } catch (err) {
        console.error('Error searching:', err);
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce time

    return () => clearTimeout(delayDebounce);
  }, [query, mediaTypeFilter, selectedGenreId]);

  // Handle click on background overlay to close
  const handleOverlayClick = (e: any) => {
    if (e.target === e.currentTarget) onClose();
  };

  const trendingMockTags = [
    { id: 'oppenheimer', label: 'Oppenheimer', query: 'Oppenheimer' },
    { id: 'interstellar', label: 'Interstellar', query: 'Interstellar' },
    { id: 'breaking', label: 'Breaking Bad', query: 'Breaking Bad' },
    { id: 'dune', label: 'Dune', query: 'Dune' },
    { id: 'shogun', label: 'Shogun', query: 'Shogun' }
  ];

  // List of high-level genres for quick categorizations
  const filterGenres = [
    { id: 28, label: 'Action' },
    { id: 12, label: 'Adventure' },
    { id: 18, label: 'Drama' },
    { id: 878, label: 'Sci-Fi' },
    { id: 80, label: 'Crime' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-[#f4f5f6]/98 dark:bg-[#080808]/98 backdrop-blur-lg z-[150] overflow-y-auto no-scrollbar font-sans text-zinc-900 dark:text-[#f3f4f6]"
      id="search-overlay"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        
        {/* Search header container */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-4">
          <div className="flex-1 flex items-center gap-3 bg-white dark:bg-[#080808] px-4 py-3 border border-zinc-200 dark:border-white/10 rounded-none shadow-none focus-within:border-current transition-all" style={{ color: brand.accentColor } as any}>
            <Search className="w-5 h-5 shrink-0" style={{ color: brand.accentColor }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="SEARCH MOVIES, SHOWS, ACTORS CODE..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-zinc-900 dark:text-white text-xs sm:text-sm uppercase tracking-widest outline-none placeholder-zinc-400 dark:placeholder-gray-500 font-bold"
              id="search-input-field"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-neutral-800 rounded-none text-zinc-500 hover:text-zinc-900 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-3 bg-white hover:bg-zinc-100 dark:bg-[#080808] dark:hover:bg-[#121212] border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-gray-400 rounded-none transition-all cursor-pointer hover:border-current hover:text-current"
            style={{ '--tw-hover-color': brand.accentColor } as any}
            title="Close Search"
            id="close-search-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and metadata selectors */}
        <div className="mt-4 flex flex-wrap gap-3 items-center justify-between">
          
          {/* Media filter select tabs */}
          <div className="flex gap-1 bg-white dark:bg-[#080808] p-1 border border-zinc-200 dark:border-white/10 rounded-none" id="search-type-filters">
            {(['all', 'movie', 'tv'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setMediaTypeFilter(type)}
                className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-none transition-all cursor-pointer ${
                  mediaTypeFilter === type
                    ? 'text-black font-bold'
                    : 'text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5'
                }`}
                style={mediaTypeFilter === type ? { backgroundColor: brand.accentColor } : {}}
                id={`search-filter-${type}`}
              >
                {type === 'all' ? 'All Formats' : type === 'movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>

          {/* Genre chips selectors */}
          <div className="flex flex-wrap gap-1.5 items-center" id="search-genre-filters">
            <span className="text-[9px] font-mono font-bold mr-1 tracking-widest uppercase opacity-70" style={{ color: brand.accentColor }}>GENRES:</span>
            <button
              onClick={() => setSelectedGenreId(null)}
              className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-none border transition-all cursor-pointer ${
                selectedGenreId === null
                  ? brand.badgeBg
                  : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All Genres
            </button>
            {filterGenres.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenreId(g.id)}
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-none border transition-all cursor-pointer ${
                  selectedGenreId === g.id
                    ? brand.badgeBg
                    : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
                id={`genre-pill-${g.id}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mt-8">
          
          {/* Quick recommendations on empty queries */}
          {query.trim() === '' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-zinc-400 dark:text-gray-500 uppercase tracking-[0.2em]">Trending Catalog Index</h4>
                <div className="flex flex-wrap gap-2" id="search-mock-tags">
                  {trendingMockTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => setQuery(tag.query)}
                      className="px-4 py-2 bg-white hover:bg-zinc-100 dark:bg-white/5 dark:hover:bg-neutral-900 border border-zinc-200 dark:border-white/10 rounded-none text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-gray-300 transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-current hover:text-current"
                      style={{ color: brand.accentColor } as any}
                    >
                      <Search className="w-3 h-3 text-current" />
                      <span>{tag.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {isDemo && (
                <div className="p-5 bg-white dark:bg-white/5 rounded-none border border-zinc-200 dark:border-white/10 text-[10px] tracking-widest uppercase max-w-xl flex gap-3 shadow-sm" style={{ color: brand.accentColor }}>
                  <AlertCircle className="w-5 h-5 shrink-0 text-current" />
                  <div>
                    <span className="font-extrabold block">{brand.name} Database Offline Fallback</span>
                    <p className="text-zinc-500 dark:text-gray-400 mt-1 uppercase text-[9px] font-semibold leading-relaxed tracking-wider">
                      Type &quot;Interstellar&quot;, &quot;Dune&quot;, or &quot;Breaking Bad&quot; to test. Configure TMDB API keys in Secrets to scan the full cinema catalog index.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search loader spinner */}
          {loading && (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <span className={`w-8 h-8 rounded-none border-2 border-t-transparent animate-spin inline-block ${brand.loaderBorderColor}`}></span>
              <p className="text-[9px] text-zinc-500 dark:text-gray-500 font-mono tracking-widest uppercase">Querying cinema index modules...</p>
            </div>
          )}

          {/* Results grid container */}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-zinc-400 dark:text-gray-500 uppercase tracking-[0.2em]">Search Matches ({results.length})</h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" id="search-results-grid">
                {results.map((item) => {
                  const title = item.title || item.name || 'Untitled';
                  const isTv = item.media_type === 'tv' || !item.title;
                  const year = item.release_date ? item.release_date.split('-')[0] : item.first_air_date ? item.first_air_date.split('-')[0] : 'N/A';
                  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'NR';
                  
                  const posterUrl = item.poster_path 
                    ? item.poster_path.startsWith('http') 
                      ? item.poster_path 
                      : `https://image.tmdb.org/t/p/w342${item.poster_path}`
                    : null;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => onItemClick(item)}
                      className="bg-white dark:bg-[#080808] border border-zinc-200 dark:border-white/10 rounded-none p-2.5 cursor-pointer transition-all hover:shadow-2xl group flex flex-col h-full overflow-hidden hover:border-current"
                      style={{ color: brand.accentColor } as any}
                      id={`search-result-${item.id}`}
                    >
                      {/* Thumbnail frame */}
                      <div className="relative aspect-[2/3] w-full bg-[#080808] rounded-none overflow-hidden mb-3">
                        {posterUrl ? (
                          <img
                            src={posterUrl}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale hover:grayscale-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-[#080808] border border-white/5">
                            <span className="font-display font-bold text-[9px] uppercase tracking-wider text-gray-400 text-center line-clamp-3">{title}</span>
                          </div>
                        )}

                        <div className={`absolute top-1.5 left-1.5 bg-black/80 px-2 py-0.5 rounded-none text-[8px] font-mono font-bold flex items-center gap-0.5 border border-white/10 ${brand.textAccent}`}>
                          <Star className={`w-2.5 h-2.5 ${brand.fillAccent} ${brand.textAccent}`} />
                          <span>{rating}</span>
                        </div>

                        <div className={`absolute top-1.5 right-1.5 bg-black/85 border border-white/10 px-2 py-0.5 rounded-none text-[8px] font-mono font-bold tracking-widest ${brand.textAccent}`}>
                          {isTv ? 'TV' : 'MOVIE'}
                        </div>
                      </div>

                      {/* Decriptive */}
                      <div className="px-1.5 pb-1 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h5 className="text-[10px] uppercase font-bold tracking-widest text-zinc-800 dark:text-gray-100 group-hover:text-current transition-colors truncate">
                            {title}
                          </h5>
                          <p className="text-[8px] text-zinc-400 dark:text-gray-400 font-mono tracking-widest">{year}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty search results layout */}
          {!loading && query.trim() !== '' && results.length === 0 && (
            <div className="py-20 text-center text-zinc-500 space-y-4 font-sans border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-sm">
              <Search className="w-8 h-8 mx-auto" style={{ color: brand.accentColor }} />
              <p className="font-bold text-xs uppercase tracking-[0.2em] text-zinc-800 dark:text-white">Zero Index Nodes Matched Query</p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-gray-600 max-w-sm mx-auto leading-relaxed">
                Check spelling parameters or adjust formatted category tags above to scan other film nodes on {brand.name}.
              </p>
            </div>
          )}

        </div>

      </div>
    </motion.div>
  );
}
