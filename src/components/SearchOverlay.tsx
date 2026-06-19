import { useState, useEffect, useRef } from 'react';
import { Search, X, Star, Film, Tv, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem } from '../types';

interface SearchOverlayProps {
  onClose: () => void;
  onItemClick: (item: MediaItem) => void;
  onPlayClick: (item: MediaItem) => void;
  isDemo: boolean;
}

export default function SearchOverlay({ onClose, onItemClick, onPlayClick, isDemo }: SearchOverlayProps) {
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
      className="fixed inset-0 bg-[#080808]/98 backdrop-blur-lg z-50 overflow-y-auto no-scrollbar font-sans"
      id="search-overlay"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        
        {/* Search header container */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex-1 flex items-center gap-3 bg-[#080808] px-4 py-3 border border-white/10 rounded-none shadow-none focus-within:border-[#E5A00D]/40 transition-all">
            <Search className="w-5 h-5 text-[#E5A00D] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="SEARCH MOVIES, SHOWS, ACTORS CODE..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-white text-xs sm:text-sm uppercase tracking-widest outline-none placeholder-gray-500 font-bold"
              id="search-input-field"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-neutral-800 rounded-none text-gray-400 hover:text-white"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-3 bg-[#080808] hover:bg-neutral-900 border border-white/10 text-gray-400 hover:text-[#E5A00D] rounded-none transition-all cursor-pointer"
            title="Close Search"
            id="close-search-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and metadata selectors */}
        <div className="mt-4 flex flex-wrap gap-3 items-center justify-between">
          
          {/* Media filter select tabs */}
          <div className="flex gap-1 bg-[#080808] p-1 border border-white/10 rounded-none" id="search-type-filters">
            {(['all', 'movie', 'tv'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setMediaTypeFilter(type)}
                className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-none transition-all cursor-pointer ${
                  mediaTypeFilter === type
                    ? 'bg-[#E5A00D] text-black font-bold'
                    : 'text-gray-400 hover:text-white bg-white/5 border border-white/5'
                }`}
                id={`search-filter-${type}`}
              >
                {type === 'all' ? 'All Formats' : type === 'movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>

          {/* Genre chips selectors */}
          <div className="flex flex-wrap gap-1.5 items-center" id="search-genre-filters">
            <span className="text-[9px] text-[#E5A00D]/60 font-mono font-bold mr-1 tracking-widest">GENRES:</span>
            <button
              onClick={() => setSelectedGenreId(null)}
              className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-none border transition-all cursor-pointer ${
                selectedGenreId === null
                  ? 'bg-[#E5A00D]/10 border-[#E5A00D]/30 text-[#E5A00D]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
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
                    ? 'bg-[#E5A00D]/10 border-[#E5A00D]/30 text-[#E5A00D]'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
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
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Trending Catalog Index</h4>
                <div className="flex flex-wrap gap-2" id="search-mock-tags">
                  {trendingMockTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => setQuery(tag.query)}
                      className="px-4 py-2 bg-white/5 hover:bg-neutral-900 border border-white/10 hover:border-[#E5A00D]/40 rounded-none text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:text-[#E5A00D] transition-all text-left flex items-center gap-1.5 cursor-pointer"
                    >
                      <Search className="w-3 h-3 text-gray-400" />
                      <span>{tag.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {isDemo && (
                <div className="p-5 bg-white/5 rounded-none border border-white/10 text-[10px] tracking-widest text-[#E5A00D] uppercase max-w-xl flex gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-[#E5A00D]" />
                  <div>
                    <span className="font-extrabold block">Plex Database Offline Fallback</span>
                    <p className="text-gray-400 mt-1 uppercase text-[9px] font-semibold leading-relaxed tracking-wider">
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
              <span className="w-8 h-8 rounded-none border-2 border-[#E5A00D] border-t-transparent animate-spin inline-block"></span>
              <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">Querying cinema index modules...</p>
            </div>
          )}

          {/* Results grid container */}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Search Matches ({results.length})</h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" id="search-results-grid">
                {results.map((item) => {
                  const title = item.title || item.name || 'Untitled';
                  const isTv = item.media_type === 'tv' || !item.title;
                  const year = item.release_date ? item.release_date.split('-')[0] : item.first_air_date ? item.first_air_date.split('-')[0] : 'N/A';
                  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'NR';
                  
                  // image configuration
                  const poster = item.poster_path 
                    ? item.poster_path.startsWith('http') 
                    : null;

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
                      className="bg-[#080808] border border-white/10 hover:border-[#E5A00D] rounded-none p-2.5 cursor-pointer transition-all hover:shadow-2xl group flex flex-col h-full overflow-hidden"
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

                        <div className="absolute top-1.5 left-1.5 bg-black/80 px-2 py-0.5 rounded-none text-[8px] font-mono font-bold text-[#E5A00D] flex items-center gap-0.5 border border-white/10">
                          <Star className="w-2.5 h-2.5 fill-[#E5A00D] text-[#E5A00D]" />
                          <span>{rating}</span>
                        </div>

                        <div className="absolute top-1.5 right-1.5 bg-black/85 border border-white/10 px-2 py-0.5 rounded-none text-[8px] font-mono font-bold tracking-widest text-[#E5A00D]">
                          {isTv ? 'TV' : 'MOVIE'}
                        </div>
                      </div>

                      {/* Decriptive */}
                      <div className="px-1.5 pb-1 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h5 className="text-[10px] uppercase font-bold tracking-widest text-gray-100 group-hover:text-[#E5A00D] transition-colors truncate">
                            {title}
                          </h5>
                          <p className="text-[8px] text-gray-503 text-gray-400 font-mono tracking-widest">{year}</p>
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
            <div className="py-20 text-center text-gray-500 space-y-4 font-sans border border-white/10 bg-white/5 p-8">
              <Search className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="font-bold text-xs uppercase tracking-[0.2em]">Zero Index Nodes Matched Query</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-600 max-w-sm mx-auto leading-relaxed">
                Check spelling parameters or adjust formatted category tags above to scan other film nodes.
              </p>
            </div>
          )}

        </div>

      </div>
    </motion.div>
  );
}
