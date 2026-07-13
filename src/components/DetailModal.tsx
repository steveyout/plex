import { useState, useEffect } from 'react';
import { Play, Bookmark, BookmarkCheck, X, Star, Calendar, Clock, Share2, Sparkles, Check, Film, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, CastMember, SeasonInfo, Episode } from '../types';

interface DetailModalProps {
  item: MediaItem;
  onClose: () => void;
  onPlayClick: (item: MediaItem, season?: number, episode?: number) => void;
  isDemo: boolean;
}

export default function DetailModal({ item, onClose, onPlayClick, isDemo }: DetailModalProps) {
  const isTv = item.media_type === 'tv' || !item.title;
  const title = item.title || item.name || 'Untitled';
  const rawDate = item.release_date || item.first_air_date || '';
  const year = rawDate ? rawDate.split('-')[0] : 'N/A';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'NR';

  // State
  const [activeSeason, setActiveSeason] = useState<number>(1);
  const [seasonEpisodes, setSeasonEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(false);
  const [isInWatchlist, setIsInWatchlist] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);

  // Backdrop / Poster Image Configs
  const backdropSrc = item.backdrop_path 
    ? item.backdrop_path.startsWith('http') 
      ? item.backdrop_path 
      : `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : null;

  const posterSrc = item.poster_path
    ? item.poster_path.startsWith('http')
      ? item.poster_path
      : `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : null;

  // Check Watchlist status on mount or ID changes
  useEffect(() => {
    try {
      const listRaw = localStorage.getItem('plex_watchlist');
      const list = listRaw ? JSON.parse(listRaw) : [];
      setIsInWatchlist(list.some((w: any) => w.id === item.id));
    } catch (e) {
      console.error(e);
    }
  }, [item.id]);

  // Load episodes details if isTv
  useEffect(() => {
    if (!isTv) return;
    
    const fetchEpisodes = async () => {
      setLoadingEpisodes(true);
      try {
        const response = await fetch(`/api/tmdb/tv/${item.id}/season/${activeSeason}`);
        if (response.ok) {
          const data = await response.json();
          setSeasonEpisodes(data.episodes || []);
        }
      } catch (err) {
        console.error('Error fetching season details in modal:', err);
      } finally {
        setLoadingEpisodes(false);
      }
    };

    fetchEpisodes();
  }, [item.id, activeSeason, isTv]);

  // Add / Remove from Watchlist
  const toggleWatchlist = () => {
    try {
      const listRaw = localStorage.getItem('plex_watchlist');
      let list = listRaw ? JSON.parse(listRaw) : [];
      
      if (isInWatchlist) {
        list = list.filter((w: any) => w.id !== item.id);
        setIsInWatchlist(false);
      } else {
        const watchlistItem = {
          id: item.id,
          title,
          poster_path: item.poster_path,
          media_type: item.media_type,
          addedAt: new Date().toISOString(),
          vote_average: item.vote_average,
          release_date: item.release_date || item.first_air_date
        };
        list.unshift(watchlistItem);
        setIsInWatchlist(true);
      }
      
      localStorage.setItem('plex_watchlist', JSON.stringify(list));
      // Fire custom event to notify watchlist state across components instantly
      window.dispatchEvent(new Event('watchlist_change'));
    } catch (error) {
      console.error('Watchlist persist failed:', error);
    }
  };

  // Click share link in details card
  const handleShare = () => {
    try {
      const origin = window.location.origin;
      const mediaSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const shareUrl = `${origin}?watch=${isTv ? 'tv' : 'movie'}_${item.id}_${mediaSlug}`;
      navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex justify-center items-end md:items-center p-0 md:p-6 overflow-y-auto no-scrollbar"
      id={`detail-modal-${item.id}`}
    >
      {/* Toast Alert */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#E5A00D] text-black font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded-none shadow-2xl z-[160] flex items-center gap-1.5 border border-white/10"
          >
            <Check className="w-4 h-4 text-black stroke-[3]" />
            <span>Title share link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glass Screen Card */}
      <motion.div
        initial={{ y: 100, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 150, scale: 0.95 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#080808] border-t md:border border-zinc-200 dark:border-white/10 rounded-none shadow-2xl overflow-hidden max-h-[85vh] md:max-h-[90vh] flex flex-col focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Absolute Backdrop Header (Blurs beautifully) */}
        <div className="relative h-60 sm:h-80 w-full flex-shrink-0 select-none">
          {backdropSrc ? (
            <img
              src={backdropSrc}
              alt="Backdrop"
              className="w-full h-full object-cover brightness-[0.4]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-[#080808] border-b border-zinc-200 dark:border-white/10" />
          )}
          {/* Subtle bottom gradient to fade backdrop into panel */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 dark:from-[#080808] dark:via-[#080808]/30 to-transparent"></div>

          {/* Close trigger button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/90 text-gray-400 hover:text-white rounded-none border border-white/10 backdrop-blur-md transition-all shadow-xl cursor-pointer"
            id="close-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Quick info layered on backdrop bottom */}
          <div className="absolute bottom-4 left-4 sm:left-8 right-4 sm:right-8 flex flex-col md:flex-row gap-4 md:items-end justify-between">
            <div className="space-y-1 sm:space-y-2 font-sans">
              {/* Genre pill tag list */}
              {item.genres && item.genres.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.genres.slice(0, 3).map((g) => (
                    <span
                      key={g.id}
                      className="text-[9px] sm:text-[10px] bg-[#E5A00D]/15 text-[#E5A00D] px-2.5 py-0.5 border border-[#E5A00D]/20 rounded-none font-bold font-mono tracking-widest uppercase"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              <h2 className="text-xl sm:text-3xl font-display font-black text-white leading-tight uppercase tracking-tight drop-shadow-md">
                {title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-white/95 font-mono drop-shadow-md">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-200" />
                  <span>{year}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#E5A00D] font-bold bg-[#080808]/85 px-1.5 py-0.5 rounded-none border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-[#E5A00D] text-[#E5A00D]" />
                  <span>{rating}</span>
                </div>
                {item.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-200" />
                    <span>{item.runtime} MIN</span>
                  </div>
                )}
              </div>
            </div>

            {/* Backdrop Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onPlayClick(item)}
                className="flex items-center gap-2 px-6 py-3 bg-[#E5A00D] hover:bg-amber-500 text-black rounded-none text-xs sm:text-sm font-black uppercase tracking-[0.15em] transition-all cursor-pointer shadow-lg"
                id="modal-play-btn"
              >
                <Play className="w-4 h-4 fill-current text-black stroke-[3]" />
                <span>Play Now</span>
              </button>

              <button
                onClick={toggleWatchlist}
                className={`flex items-center justify-center p-3 sm:px-4 rounded-none border text-xs sm:text-sm font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  isInWatchlist
                    ? 'bg-[#E5A00D] text-black border-[#E5A00D]'
                    : 'bg-black/50 hover:bg-black/80 border-white/10 text-gray-300 hover:text-white'
                }`}
                title="Add to Watchlist"
                id="modal-watchlist-btn"
              >
                {isInWatchlist ? (
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="w-4.5 h-4.5" />
                    <span>In Watchlist</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4.5 h-4.5" />
                    <span>Add Watchlist</span>
                  </div>
                )}
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="p-3 bg-black/50 hover:bg-black/80 border border-white/10 text-gray-300 hover:text-white rounded-none active:scale-95 transition-all cursor-pointer"
                title="Share Config"
                id="modal-share-btn"
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Details Body Content */}
        <div className="flex-1 p-5 sm:p-8 space-y-6 overflow-y-auto no-scrollbar font-sans border-t border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0c0d10]">
          {/* Overview Section */}
          <div className="space-y-2">
            <h3 className="font-display font-black text-xs text-zinc-500 dark:text-gray-400 tracking-[0.2em] uppercase">Overview Description</h3>
            <p className="text-sm text-zinc-600 dark:text-gray-300 leading-relaxed max-w-3xl" id="modal-overview-text">
              {item.overview || 'Description not imported from TMDB database registry. Connect real API keys to sync full metadata descriptors.'}
            </p>
          </div>

          {/* Cast list credits */}
          {item.credits?.cast && item.credits.cast.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display font-black text-xs text-zinc-500 dark:text-gray-400 tracking-[0.2em] uppercase">Cast Members</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin no-scrollbar" id="modal-cast-list">
                {item.credits.cast.slice(0, 8).map((actor: CastMember) => {
                  const actorImage = actor.profile_path
                    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                    : null;
                  return (
                    <div key={actor.id} className="flex-shrink-0 w-16 text-center space-y-1">
                      <div className="w-12 h-12 rounded-none overflow-hidden mx-auto bg-zinc-100 border border-zinc-200 dark:bg-white/5 dark:border-white/10">
                        {actorImage ? (
                          <img
                            src={actorImage}
                            alt={actor.name}
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-display font-black text-[#E5A00D]/20 text-sm">
                            {actor.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-800 dark:text-gray-200 font-semibold truncate leading-none uppercase tracking-wide">{actor.name}</p>
                      <p className="text-[8px] text-zinc-500 dark:text-gray-500 font-mono truncate leading-none">{actor.character}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TV Shows Season Episode Browser */}
          {isTv && item.number_of_seasons && item.number_of_seasons > 0 && (
            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-zinc-800 dark:text-white">
                  <Tv className="w-4 h-4 text-[#E5A00D]" />
                  <h3 className="font-display font-black text-xs uppercase tracking-widest">TV Episode Navigation</h3>
                </div>

                {/* Season tabs selector scroll row */}
                <div className="flex gap-1 overflow-x-auto pb-1 max-w-full no-scrollbar">
                  {Array.from({ length: item.number_of_seasons }, (_, i) => i + 1).map((sNum) => (
                    <button
                      key={sNum}
                      onClick={() => setActiveSeason(sNum)}
                      className={`px-3.5 py-1 text-xs font-bold uppercase tracking-wider rounded-none shrink-0 border transition-all cursor-pointer ${
                        activeSeason === sNum
                          ? 'bg-[#E5A00D]/15 border-[#E5A00D] text-[#E5A00D]'
                          : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:text-white'
                      }`}
                      id={`modal-season-tab-${sNum}`}
                    >
                      Season {sNum}
                    </button>
                  ))}
                </div>
              </div>

              {/* Episode lists under selected season tab */}
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {loadingEpisodes ? (
                  <div className="py-8 text-center text-xs text-zinc-500 dark:text-gray-500 font-mono flex items-center justify-center gap-2">
                    <span className="w-3 h-3 rounded-none border-2 border-[#E5A00D] border-t-transparent animate-spin inline-block"></span>
                    Fetching Season Structure...
                  </div>
                ) : seasonEpisodes && seasonEpisodes.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2" id="modal-episode-list">
                    {seasonEpisodes.map((ep) => (
                      <div
                        key={ep.id}
                        className="bg-zinc-50 border border-zinc-200 hover:border-[#E5A00D]/30 dark:bg-[#080808] dark:border-white/10 dark:hover:border-[#E5A00D]/30 p-3 sm:p-4 rounded-none flex flex-col sm:flex-row gap-4 items-start justify-between transition-all"
                        id={`modal-episode-card-${ep.episode_number}`}
                      >
                        <div className="flex-1 space-y-1.5 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-[#E5A00D]/10 text-[#E5A00D] px-2 py-0.5 rounded-none font-mono font-bold tracking-widest border border-[#E5A00D]/10 leading-none">
                              EPISODE {ep.episode_number}
                            </span>
                            <h4 className="text-xs sm:text-xs font-bold uppercase tracking-wide text-zinc-800 dark:text-gray-100">{ep.name || `Episode ${ep.episode_number}`}</h4>
                          </div>
                          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-gray-400/80 leading-relaxed line-clamp-2">
                            {ep.overview || 'Synopsis not yet logged by database crawlers for this specific index node.'}
                          </p>
                        </div>

                        {/* Play trigger button next to each individual episode list item */}
                        <button
                          onClick={() => onPlayClick(item, activeSeason, ep.episode_number)}
                          className="w-full sm:w-auto px-4 py-2 sm:mt-1 bg-zinc-800 text-white hover:bg-[#E5A00D] hover:text-black dark:bg-white dark:text-black dark:hover:bg-[#E5A00D] font-bold text-xs rounded-none border border-zinc-300 dark:border-white/10 hover:border-transparent flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          id={`modal-play-episode-${ep.episode_number}`}
                        >
                          <Play className="w-3 h-3 fill-current leading-none" />
                          <span>Stream</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-zinc-500 dark:text-gray-500 font-mono uppercase tracking-widest">Wait list is being fetched or season is unreleased.</div>
                )}
              </div>
            </div>
          )}

          {/* Recommendations list */}
          {item.recommendations?.results && item.recommendations.results.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-zinc-800 dark:text-white">
                <Sparkles className="w-4 h-4 text-[#E5A00D]" />
                <h3 className="font-display font-black text-xs text-zinc-500 dark:text-gray-400 tracking-[0.2em] uppercase">More Like This</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth no-scrollbar" id="modal-recommendations">
                {item.recommendations.results.slice(0, 8).map((rec, index) => {
                  const recTitle = rec.title || rec.name || 'Untitled';
                  const recPoster = rec.poster_path
                    ? `https://image.tmdb.org/t/p/w154${rec.poster_path}`
                    : null;
                  return (
                    <button
                      key={`${rec.id}-${index}`}
                      onClick={() => {
                        // Let's close modal & trigger dynamic navigation swap
                        onClose();
                        onPlayClick(rec);
                      }}
                      className="flex-shrink-0 w-24 bg-zinc-50 border border-zinc-200 hover:border-[#E5A00D] dark:bg-white/5 dark:border-white/10 dark:hover:border-[#E5A00D] p-1.5 rounded-none text-left space-y-1.5 transition-all text-xs active:scale-95 cursor-pointer"
                      id={`modal-rec-${rec.id}`}
                    >
                      <div className="aspect-[2/3] w-full bg-[#080808] rounded-none overflow-hidden">
                        {recPoster ? (
                          <img
                            src={recPoster}
                            alt={recTitle}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#080808] text-center flex items-center justify-center p-2 text-[9px] font-bold text-gray-500 rounded-none uppercase">
                            No Poster
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-zinc-800 dark:text-gray-200 truncate uppercase tracking-widest text-[9px] leading-none">{recTitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
