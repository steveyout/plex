import { useState, useEffect } from 'react';
import { Play, Info, Bookmark, BookmarkCheck, Trash2, Library, Sparkles, Star, Calendar, Clock, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import MovieRow from './components/MovieRow';
import DetailModal from './components/DetailModal';
import VideoPlayer from './components/VideoPlayer';
import SearchOverlay from './components/SearchOverlay';
import { useSEO } from './utils/seo';
import { MediaItem, NavigationTab, WatchlistItem, PlaybackProgress } from './types';

export default function App() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [playbackMedia, setPlaybackMedia] = useState<{ media: MediaItem; season?: number; episode?: number } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isDemo, setIsDemo] = useState<boolean>(true);

  // Content state rows
  const [heroMedia, setHeroMedia] = useState<MediaItem | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [trendingTv, setTrendingTv] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTv, setPopularTv] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Discovery / Categorization filtering lists state (For Movies and TV separate screens)
  const [activeGenreId, setActiveGenreId] = useState<number | null>(null);
  const [discoverItems, setDiscoverItems] = useState<MediaItem[]>([]);
  const [loadingDiscover, setLoadingDiscover] = useState<boolean>(false);

  // Local storage lists
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [history, setHistory] = useState<PlaybackProgress[]>([]);

  // SEO dynamic meta hooks
  useSEO(
    activeTab === 'home' ? 'Home' : activeTab === 'movies' ? 'Free Movies' : activeTab === 'tv' ? 'Free TV Shows' : activeTab === 'watchlist' ? 'My Watchlist' : 'Watch History',
    'Stream free movies and full season episodes of TV shows with multiple high speed media server links. Highly optimized for desktop and mobile playback.'
  );

  // Parse configurations mode (Demo vs API live state)
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          setIsDemo(data.isDemo);
        }
      } catch (err) {
        console.error('Failed to read configurations state:', err);
      }
    };
    checkConfig();
  }, []);

  // Fetch frontpage carousel nodes on mount (and when configuration changes)
  useEffect(() => {
    const fetchMainContent = async () => {
      setLoading(true);
      try {
        // Parallelized fetches for quick initial loads
        const [trendingMoviesRes, trendingTvRes] = await Promise.all([
          fetch('/api/tmdb/trending/movie/day'),
          fetch('/api/tmdb/trending/tv/day')
        ]);

        let movies: MediaItem[] = [];
        let tvShows: MediaItem[] = [];

        if (trendingMoviesRes.ok) {
          const data = await trendingMoviesRes.json();
          movies = data.results || [];
          setTrendingMovies(movies);
          setPopularMovies(movies.slice().reverse()); // Mock fallback for popular categories
        }
        if (trendingTvRes.ok) {
          const data = await trendingTvRes.json();
          tvShows = data.results || [];
          setTrendingTv(tvShows);
          setPopularTv(tvShows.slice().reverse());
        }

        // Configure random hero element
        const pool = [...movies, ...tvShows];
        if (pool.length > 0) {
          const randomHero = pool[Math.floor(Math.random() * pool.length)];
          setHeroMedia(randomHero);
        }
      } catch (err) {
        console.error('Failed to fetch home library feeds:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMainContent();
  }, [isDemo]);

  // Load Watchlist and Watching History of users
  useEffect(() => {
    const syncLocalHistory = () => {
      try {
        const watchlistRaw = localStorage.getItem('plex_watchlist');
        setWatchlist(watchlistRaw ? JSON.parse(watchlistRaw) : []);

        const progressRaw = localStorage.getItem('plex_watch_progress');
        setHistory(progressRaw ? JSON.parse(progressRaw) : []);
      } catch (e) {
        console.error(e);
      }
    };

    syncLocalHistory();
    // Watch other components triggering deletions or insertions dynamically
    window.addEventListener('watchlist_change', syncLocalHistory);
    return () => window.removeEventListener('watchlist_change', syncLocalHistory);
  }, []);

  // Dynamic search list parameters mapping on shared links slugs loading
  useEffect(() => {
    const parseWatchParam = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const watchVal = params.get('watch');
        if (watchVal) {
          const parseNode = watchVal.split('_');
          if (parseNode.length >= 2) {
            const mediaType: 'movie' | 'tv' = parseNode[0] === 'tv' ? 'tv' : 'movie';
            const tmdbId = parseInt(parseNode[1]);

            // Season and episode matching for shared TV shows series URLs
            let season = 1;
            let episode = 1;

            if (mediaType === 'tv' && parseNode[2]) {
              const matchedPatterns = parseNode[2].match(/^s(\d+)e(\d+)$/i);
              if (matchedPatterns) {
                season = parseInt(matchedPatterns[1]);
                episode = parseInt(matchedPatterns[2]);
              }
            }

            // Fetch target info to launch player
            const response = await fetch(`/api/tmdb/${mediaType}/${tmdbId}`);
            if (response.ok) {
              const data = await response.json();
              data.media_type = mediaType;
              
              setPlaybackMedia({
                media: data,
                season,
                episode
              });
            }
          }
        }
      } catch (e) {
        console.error('Failed to resolve sharing URL slug node:', e);
      }
    };
    parseWatchParam();
  }, []);

  // Handle discover filtering tags selection inside separately organized media formats screens (Movies/TV tab views)
  useEffect(() => {
    if (activeTab !== 'movies' && activeTab !== 'tv') return;

    const fetchDiscoverByCategory = async () => {
      setLoadingDiscover(true);
      try {
        const type = activeTab === 'movies' ? 'movie' : 'tv';
        let subUrl = `discover/${type}`;
        if (activeGenreId) {
          subUrl += `?with_genres=${activeGenreId}`;
        }
        
        const response = await fetch(`/api/tmdb/${subUrl}`);
        if (response.ok) {
          const data = await response.json();
          const mapped = (data.results || []).map((item: any) => {
            item.media_type = type;
            return item;
          });
          setDiscoverItems(mapped);
        }
      } catch (err) {
        console.error('Discover categories lookup failed:', err);
      } finally {
        setLoadingDiscover(false);
      }
    };

    fetchDiscoverByCategory();
  }, [activeTab, activeGenreId]);

  // Keyboard shortcut listener for global fast search invocation (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  // Handle launches from card clicks
  const launchDetailModal = async (compactItem: MediaItem) => {
    try {
      const type = compactItem.media_type || (compactItem.title ? 'movie' : 'tv');
      // Fetch full details with append_to_response enabled (credits, recommendations)
      const res = await fetch(`/api/tmdb/${type}/${compactItem.id}?append_to_response=credits,recommendations`);
      if (res.ok) {
        const fullItem = await res.json();
        fullItem.media_type = type; // preserve correct classification
        setSelectedMedia(fullItem);
      } else {
        // Fallback to existing compact item
        compactItem.media_type = type;
        setSelectedMedia(compactItem);
      }
    } catch (err) {
      console.error(err);
      compactItem.media_type = compactItem.media_type || 'movie';
      setSelectedMedia(compactItem);
    }
  };

  // Launch Player directly on play requests
  const launchPlayer = async (compactItem: MediaItem, season?: number, episode?: number) => {
    try {
      // close details modal if open
      setSelectedMedia(null);
      const type = compactItem.media_type || (compactItem.title ? 'movie' : 'tv');
      
      const res = await fetch(`/api/tmdb/${type}/${compactItem.id}?append_to_response=credits`);
      if (res.ok) {
        const data = await res.json();
        data.media_type = type;
        setPlaybackMedia({ media: data, season, episode });
      } else {
        compactItem.media_type = type;
        setPlaybackMedia({ media: compactItem, season, episode });
      }
    } catch (err) {
      console.error(err);
      setPlaybackMedia({ media: compactItem, season, episode });
    }
  };

  const removeHistoryItem = (id: number, e: any) => {
    e.stopPropagation();
    try {
      const listRaw = localStorage.getItem('plex_watch_progress');
      if (listRaw) {
        let list: PlaybackProgress[] = JSON.parse(listRaw);
        list = list.filter(p => p.mediaId !== id);
        localStorage.setItem('plex_watch_progress', JSON.stringify(list));
        setHistory(list);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllHistory = () => {
    if (confirm('Clear entire watching session logs?')) {
      localStorage.removeItem('plex_watch_progress');
      setHistory([]);
    }
  };

  // Reset category lists when tabs are changed
  const handleTabChange = (tab: NavigationTab) => {
    setActiveTab(tab);
    setActiveGenreId(null);
  };

  // Genre static arrays mappings
  const discoverGenres = activeTab === 'movies'
    ? [
        { id: 28, label: 'Action' },
        { id: 12, label: 'Adventure' },
        { id: 35, label: 'Comedy' },
        { id: 18, label: 'Drama' },
        { id: 878, label: 'Sci-Fi' }
      ]
    : [
        { id: 10759, label: 'Action & Adventure' },
        { id: 16, label: 'Animation' },
        { id: 80, label: 'Crime' },
        { id: 18, label: 'Drama' },
        { id: 10765, label: 'Sci-Fi' }
      ];

  const heroBackdrop = heroMedia?.backdrop_path
    ? heroMedia.backdrop_path.startsWith('http')
      ? heroMedia.backdrop_path
      : `https://image.tmdb.org/t/p/original${heroMedia.backdrop_path}`
    : null;

  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#f3f4f6] font-sans antialiased overflow-x-hidden relative flex">
      
      {/* 1. SIDEBAR NAVIGATION - RESPONSIVE DESKTOP */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onSearchClick={() => setIsSearchOpen(true)}
        isDemo={isDemo}
      />

      {/* 2. MAIN HUB SHELTER (Indented for sidebar on desktop layouts) */}
      <div className="flex-1 md:pl-64 min-h-screen flex flex-col pb-24 md:pb-8">
        
        {/* Absolute Banner for mobile layouts header */}
        <header className="md:hidden p-4 bg-slate-950/80 border-b border-[#1b1e25] sticky top-0 z-30 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-black text-xl tracking-wider text-[#e5a93b]">PLEX</span>
            <span className="text-[9px] bg-amber-500/15 text-amber-500 font-semibold px-2 py-0.5 rounded border border-amber-500/20">STREAM</span>
          </div>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-gray-400 hover:text-white transition-all"
            title="Scan library"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </header>

        {/* Global Loading screen */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3" id="main-loader-container">
            <span className="w-10 h-10 rounded-full border-4 border-[#e5a93b] border-t-transparent animate-spin inline-block"></span>
            <span className="text-xs text-gray-500 font-mono">Synchronizing Plex streaming indexing clusters...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* TAB 1: HOME PANEL */}
            {activeTab === 'home' && (
              <motion.div
                key="home-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                {/* HERO BLOCK */}
                {heroMedia && (
                  <div className="relative h-[70vh] sm:h-[80vh] w-full flex items-end overflow-hidden pb-16 px-4 sm:px-8 border-b border-white/10" id="hero-banner">
                    {/* Shadowed backdrop backdrop images */}
                    {heroBackdrop ? (
                      <img
                        src={heroBackdrop}
                        alt="Hero Backdrop"
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.3]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#080808] to-black" />
                    )}
                    {/* Cinema black grading shadow overlays from Editorial layout patterns */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/85 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/90 via-transparent to-transparent"></div>

                    {/* Content details overlay */}
                    <div className="relative z-10 max-w-3xl space-y-6">
                      {/* Floating tags */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-2.5 py-0.5 border border-[#E5A00D]/30 text-[9px] uppercase tracking-[0.2em] font-black text-[#E5A00D] bg-[#E5A00D]/10">
                          Featured Stream
                        </span>
                        <span className="px-2.5 py-0.5 border border-white/10 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-300 bg-white/5">
                          {heroMedia.media_type === 'tv' ? 'TV SHOWS' : 'MOVIES'}
                        </span>
                        <span className="px-2.5 py-0.5 border border-white/10 text-[9px] uppercase tracking-[0.2em] font-medium text-gray-400">
                          4K Ultra HD
                        </span>
                      </div>

                      <h1 className="font-display font-black text-3xl sm:text-7xl text-white leading-[0.85] tracking-tighter uppercase mb-2">
                        {(() => {
                          const originalTitle = heroMedia.title || heroMedia.name || 'UNTITLED';
                          const words = originalTitle.split(' ');
                          if (words.length > 2) {
                            const firstLine = words.slice(0, words.length - 1).join(' ');
                            const lastWord = words[words.length - 1];
                            return (
                              <>
                                {firstLine} <br/>
                                <span className="text-transparent text-outline" style={{ WebkitTextStroke: '1.5px #F5F5F5' }}>{lastWord}</span>
                              </>
                            );
                          }
                          return originalTitle;
                        })()}
                      </h1>

                      <p className="text-xs sm:text-sm text-gray-400/80 line-clamp-3 leading-relaxed max-w-xl font-normal">
                        {heroMedia.overview}
                      </p>

                      {/* Info lines tags */}
                      <div className="flex items-center gap-4 text-[11px] font-mono tracking-widest text-[#F5F5F5]">
                        <span className="flex items-center gap-1.5 font-bold text-[#E5A00D]">
                          <Star className="w-3.5 h-3.5 fill-[#E5A00D] text-[#E5A00D]" />
                          <span>{heroMedia.vote_average ? heroMedia.vote_average.toFixed(1) : '8.5'}</span>
                        </span>
                        <span className="opacity-40">•</span>
                        <span className="font-semibold text-gray-300">
                          {heroMedia.release_date ? heroMedia.release_date.split('-')[0] : heroMedia.first_air_date ? heroMedia.first_air_date.split('-')[0] : '2024'}
                        </span>
                      </div>

                      {/* Media core triggers */}
                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button
                          onClick={() => launchPlayer(heroMedia)}
                          className="px-8 py-4 bg-white hover:bg-[#E5A00D] hover:text-black text-black font-bold uppercase tracking-[0.15em] text-xs flex items-center gap-2 transition-all duration-300 cursor-pointer rounded-none shadow-none"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-black stroke-[2]" />
                          <span>Watch Now</span>
                        </button>

                        <button
                          onClick={() => launchDetailModal(heroMedia)}
                          className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 font-bold uppercase tracking-[0.15em] text-xs flex items-center gap-2 transition-all duration-300 cursor-pointer rounded-none"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>More Info</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CONTINUE PLAYBACK VIEW (Synced Local histories) */}
                {history && history.length > 0 && (
                  <div className="px-4 sm:px-8 space-y-3">
                    <h3 className="font-display text-lg sm:text-base font-bold tracking-tight text-white flex items-center gap-2 uppercase">
                      <span className="w-1.5 h-4 bg-amber-400 rounded-full"></span>
                      Resume Streaming
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {history.slice(0, 3).map((progress) => (
                        <div
                          key={progress.mediaId}
                          onClick={() => launchPlayer({ id: progress.mediaId, media_type: progress.mediaType, overview: '', poster_path: progress.poster_path, backdrop_path: '', vote_average: 1, vote_count: 1 } as any, progress.season, progress.episode)}
                          className="flex gap-4 p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-amber-500/30 cursor-pointer shadow-lg hover:shadow-2xl transition-all group"
                        >
                          {progress.poster_path && (
                            <img
                              src={progress.poster_path.startsWith('http') ? progress.poster_path : `https://image.tmdb.org/t/p/w185${progress.poster_path}`}
                              alt={progress.title}
                              className="w-12 h-18 object-cover rounded-lg shadow border border-slate-900"
                            />
                          )}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-gray-200 truncate group-hover:text-amber-400 transition-colors">{progress.title}</h4>
                              <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                {progress.mediaType === 'tv' ? `Season ${progress.season} : Ep ${progress.episode}` : 'Movie'}
                              </p>
                              {progress.episodeName && (
                                <p className="text-[9px] text-gray-400 truncate font-sans italic mt-1">&quot;{progress.episodeName}&quot;</p>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[8px] text-gray-500 pt-1 font-mono">
                              <span>Watched just now</span>
                              <button
                                onClick={(e) => removeHistoryItem(progress.mediaId, e)}
                                className="p-1 hover:bg-slate-800 rounded-md text-gray-500 hover:text-red-400"
                                title="Dismiss progress"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rows Grid container */}
                <div className="space-y-12">
                  <MovieRow
                    title="Trending Movies"
                    items={trendingMovies}
                    onItemClick={launchDetailModal}
                    onPlayClick={launchPlayer}
                  />

                  <MovieRow
                    title="Trending TV Shows"
                    items={trendingTv}
                    onItemClick={launchDetailModal}
                    onPlayClick={launchPlayer}
                  />

                  <MovieRow
                    title="Popular Releases"
                    items={popularMovies}
                    onItemClick={launchDetailModal}
                    onPlayClick={launchPlayer}
                  />

                  <MovieRow
                    title="Top Series Hits"
                    items={popularTv}
                    onItemClick={launchDetailModal}
                    onPlayClick={launchPlayer}
                  />
                </div>
              </motion.div>
            )}

            {/* TAB 2 & 3: CATEGORIZED MOVIES / TV SHOWS VIEWS */}
            {(activeTab === 'movies' || activeTab === 'tv') && (
              <motion.div
                key={`${activeTab}-view`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 sm:px-8 pt-6 space-y-6"
              >
                {/* Genre filtering list */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Library className="w-5 h-5 text-amber-500" />
                    <h2 className="font-display font-black text-xl text-white tracking-tight">
                      Browse Free {activeTab === 'movies' ? 'Movies' : 'TV Shows'}
                    </h2>
                  </div>

                  {/* Filter chips listing */}
                  <div className="flex flex-wrap gap-1 items-center border-b border-slate-900 pb-4">
                    <button
                      onClick={() => setActiveGenreId(null)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        activeGenreId === null
                          ? 'bg-amber-400/10 border-amber-500/30 text-amber-400'
                          : 'bg-slate-950 border-slate-900 text-gray-400 hover:text-white'
                      }`}
                    >
                      All Genres
                    </button>
                    {discoverGenres.map((genre) => (
                      <button
                        key={genre.id}
                        onClick={() => setActiveGenreId(genre.id)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          activeGenreId === genre.id
                            ? 'bg-amber-400/10 border-amber-500/30 text-amber-400'
                            : 'bg-slate-950 border-slate-900 text-gray-400 hover:text-white'
                        }`}
                        id={`category-tag-${genre.id}`}
                      >
                        {genre.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loading discover results */}
                {loadingDiscover ? (
                  <div className="py-24 text-center flex flex-col items-center justify-center gap-2">
                    <span className="w-8 h-8 rounded-full border-3 border-amber-400 border-t-transparent animate-spin inline-block"></span>
                    <p className="text-xs text-gray-500 font-mono">Fetching categorized feeds...</p>
                  </div>
                ) : discoverItems && discoverItems.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {discoverItems.map((item, idx) => (
                      <motion.div
                        key={`${item.id}-${idx}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (idx % 12) * 0.03 }}
                        className="flex justify-center"
                      >
                        {/* Adapt card sizes on discover lists for beautiful structural rows */}
                        <div className="w-full max-w-[170px]">
                          <MovieRow
                            title=""
                            items={[item]}
                            onItemClick={launchDetailModal}
                            onPlayClick={launchPlayer}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-gray-500 font-sans">
                    No results found in discovery cache. Check credentials configuration.
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: MY WATCHLIST */}
            {activeTab === 'watchlist' && (
              <motion.div
                key="watchlist-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 sm:px-8 pt-6 space-y-6"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-amber-500" />
                  <h2 className="font-display font-black text-xl text-white tracking-tight">My Watchlist</h2>
                  <span className="text-xs bg-slate-800 text-gray-400 px-2.5 py-0.5 rounded-full font-bold font-mono">
                    {watchlist.length} ITEMS
                  </span>
                </div>

                {watchlist && watchlist.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" id="watchlist-grid">
                    {watchlist.map((item) => {
                      const mockCastItem: MediaItem = {
                        id: item.id,
                        title: item.media_type === 'movie' ? item.title : undefined,
                        name: item.media_type === 'tv' ? item.title : undefined,
                        media_type: item.media_type,
                        poster_path: item.poster_path,
                        backdrop_path: '',
                        overview: '',
                        vote_average: 1,
                        vote_count: 1
                      };
                      return (
                        <div key={item.id} className="w-full max-w-[170px] mx-auto">
                          {/* Wrap in row play handler wrappers directly */}
                          <MovieRow
                            title=""
                            items={[mockCastItem]}
                            onItemClick={launchDetailModal}
                            onPlayClick={launchPlayer}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-24 text-center max-w-sm mx-auto space-y-4 font-sans border border-dashed border-slate-800 rounded-3xl p-8" id="empty-watchlist">
                    <Bookmark className="w-10 h-10 text-slate-700 mx-auto" />
                    <div>
                      <h3 className="font-bold text-base text-gray-200">Watchlist is Empty</h3>
                      <p className="text-xs text-gray-500 mt-1">Bookmark movies and shows while browsing to save them here for easy playback access later!</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="px-5 py-2 bg-[#e5a93b] hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
                    >
                      Browse Recommendations
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 5: WATCH HISTORY */}
            {activeTab === 'history' && (
              <motion.div
                key="history-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 sm:px-8 pt-6 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-amber-500" />
                    <h2 className="font-display font-black text-xl text-white tracking-tight">Watching History</h2>
                    <span className="text-xs bg-slate-800 text-gray-400 px-2.5 py-0.5 rounded-full font-bold font-mono">
                      {history.length} SESSIONS
                    </span>
                  </div>

                  {history && history.length > 0 && (
                    <button
                      onClick={clearAllHistory}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-500/10 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear Session Logs</span>
                    </button>
                  )}
                </div>

                {history && history.length > 0 ? (
                  <div className="space-y-3" id="history-logs-stack">
                    {history.map((session) => (
                      <div
                        key={session.mediaId}
                        onClick={() => launchPlayer({ id: session.mediaId, media_type: session.mediaType, overview: '', poster_path: session.poster_path, backdrop_path: '', vote_average: 1, vote_count: 1 } as any, session.season, session.episode)}
                        className="bg-slate-950 border border-slate-900 hover:border-amber-500/20 p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all"
                        id={`history-row-${session.mediaId}`}
                      >
                        <div className="flex items-center gap-4">
                          {session.poster_path && (
                            <img
                              src={session.poster_path.startsWith('http') ? session.poster_path : `https://image.tmdb.org/t/p/w185${session.poster_path}`}
                              alt={session.title}
                              className="w-10 h-15 object-cover rounded-lg border border-slate-900 shadow shrink-0"
                            />
                          )}
                          <div className="text-left space-y-0.5">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wide text-amber-400">
                              {session.mediaType === 'tv' ? 'TV SHOWS' : 'MOVIES'}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-gray-100">{session.title}</h4>
                            <p className="text-[11px] text-gray-400">
                              {session.mediaType === 'tv' 
                                ? `Resumes at Season ${session.season} : Episode ${session.episode} ${session.episodeName ? `("${session.episodeName}")` : ''}`
                                : 'Resumes playback stream'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => removeHistoryItem(session.mediaId, e)}
                            className="p-2 sm:p-2.5 bg-slate-900 hover:bg-red-950/20 text-gray-500 hover:text-red-400 border border-slate-800 rounded-xl"
                            title="Forget session progress"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center max-w-sm mx-auto space-y-4 font-sans border border-dashed border-slate-800 rounded-3xl p-8" id="empty-history">
                    <Clock className="w-10 h-10 text-slate-700 mx-auto" />
                    <div>
                      <h3 className="font-bold text-base text-gray-200">No Playback Sessions Found</h3>
                      <p className="text-xs text-gray-500 mt-1">Your watched history sessions and episodes bookmarks will accumulate logs here dynamically for instant resumption of movies.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="px-5 py-2 bg-[#e5a93b] hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
                    >
                      Stream Recommendations
                    </button>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>

      {/* 3. CORE SUB-MODALS INSERTS */}
      
      {/* Search Overlay Panel */}
      <AnimatePresence>
        {isSearchOpen && (
          <SearchOverlay
            onClose={() => setIsSearchOpen(false)}
            onItemClick={launchDetailModal}
            onPlayClick={launchPlayer}
            isDemo={isDemo}
          />
        )}
      </AnimatePresence>

      {/* Detail Modal Popovers */}
      <AnimatePresence>
        {selectedMedia && (
          <DetailModal
            item={selectedMedia}
            onClose={() => setSelectedMedia(null)}
            onPlayClick={launchPlayer}
            isDemo={isDemo}
          />
        )}
      </AnimatePresence>

      {/* High-fidelity Video Player Theatre Screen */}
      <AnimatePresence>
        {playbackMedia && (
          <VideoPlayer
            item={playbackMedia.media}
            initialSeason={playbackMedia.season}
            initialEpisode={playbackMedia.episode}
            onBack={() => setPlaybackMedia(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
