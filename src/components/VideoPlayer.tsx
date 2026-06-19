import { useState, useEffect } from 'react';
import { ArrowLeft, Maximize2, Minimize2, Share2, Server, Play, CheckCircle2, ChevronRight, HelpCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, Episode, SeasonInfo } from '../types';
import { providers, getEmbedUrl, DEFAULT_PROVIDER_ID } from '../config/providers';

interface VideoPlayerProps {
  item: MediaItem;
  initialSeason?: number;
  initialEpisode?: number;
  onBack: () => void;
}

export default function VideoPlayer({ item, initialSeason = 1, initialEpisode = 1, onBack }: VideoPlayerProps) {
  const isTv = item.media_type === 'tv' || !item.title;
  const title = item.title || item.name || 'Untitled';
  
  // States
  const [providerId, setProviderId] = useState<string>(DEFAULT_PROVIDER_ID);
  const [currentSeason, setCurrentSeason] = useState<number>(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState<number>(initialEpisode);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [episodesLoading, setEpisodesLoading] = useState<boolean>(false);
  const [seasonInfo, setSeasonInfo] = useState<SeasonInfo | null>(null);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [showServerTooltip, setShowServerTooltip] = useState<boolean>(false);

  // Load progress dynamically from local storage on mount/season change
  const [secondsPlayed, setSecondsPlayed] = useState<number>(0);

  // Time formatting helper
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const mStr = m < 10 && h > 0 ? `0${m}` : `${m}`;
    const sStr = s < 10 ? `0${s}` : `${s}`;
    if (h > 0) return `${h}:${mStr}:${sStr}`;
    return `${mStr}:${sStr}`;
  };

  // Sync state with correct previous progress whenever media or episode selections change
  useEffect(() => {
    try {
      const raw = localStorage.getItem('plex_watch_progress');
      if (raw) {
        const historyList: any[] = JSON.parse(raw);
        const match = historyList.find(p => p.mediaId === item.id);
        if (match) {
          if (isTv) {
            if (match.season === currentSeason && match.episode === currentEpisode) {
              setSecondsPlayed(match.progressSeconds || 0);
              return;
            }
          } else {
            setSecondsPlayed(match.progressSeconds || 0);
            return;
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore playback tracking progress:', e);
    }
    setSecondsPlayed(0);
  }, [item.id, currentSeason, currentEpisode, isTv]);

  // Auto-increment playing progress every 2 seconds while player is active
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsPlayed(prev => {
        const total = isTv ? 2700 : (item.runtime ? item.runtime * 60 : 7200);
        if (prev >= total) return total;
        return prev + 2;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [item.id, currentSeason, currentEpisode, isTv, item.runtime]);

  // Fetch season information for TV shows to render episode switcher inside the player
  useEffect(() => {
    if (!isTv) return;

    const fetchSeasonData = async () => {
      setEpisodesLoading(true);
      try {
        const response = await fetch(`/api/tmdb/tv/${item.id}/season/${currentSeason}`);
        if (response.ok) {
          const data = await response.json();
          setSeasonInfo(data);
        }
      } catch (err) {
        console.error('Error fetching season details for player:', err);
      } finally {
        setEpisodesLoading(false);
      }
    };

    fetchSeasonData();
  }, [item.id, currentSeason, isTv]);

  // Save progress in LocalStorage periodically when played or updated
  useEffect(() => {
    const saveProgress = () => {
      try {
        const key = 'plex_watch_progress';
        const progressListRaw = localStorage.getItem(key);
        let progressList: any[] = progressListRaw ? JSON.parse(progressListRaw) : [];

        // Remove duplicate entries for this media to place current segment at top
        progressList = progressList.filter((p: any) => p.mediaId !== item.id);

        const totalSecs = isTv ? 2700 : (item.runtime ? item.runtime * 60 : 7200);

        const progressItem: any = {
          mediaId: item.id,
          mediaType: item.media_type || (item.title ? 'movie' : 'tv'),
          title,
          poster_path: item.poster_path,
          progressSeconds: secondsPlayed,
          durationSeconds: totalSecs,
          updatedAt: new Date().toISOString(),
        };

        if (isTv) {
          progressItem.season = currentSeason;
          progressItem.episode = currentEpisode;
          if (seasonInfo) {
            const ep = seasonInfo.episodes.find(e => e.episode_number === currentEpisode);
            if (ep) progressItem.episodeName = ep.name;
          }
        }

        progressList.unshift(progressItem);
        // Cap at 20 items
        if (progressList.length > 20) progressList.pop();

        localStorage.setItem(key, JSON.stringify(progressList));
        
        // Dispatch custom event to notify App.tsx to refresh watch history rows
        window.dispatchEvent(new Event('watchlist_change'));
      } catch (e) {
        console.error('Failed to save watching progress:', e);
      }
    };

    saveProgress();
  }, [item.id, currentSeason, currentEpisode, isTv, seasonInfo, secondsPlayed]);

  // Construct sharing link with slugs
  const handleShare = () => {
    try {
      const origin = window.location.origin;
      const mediaSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      let shareUrl = '';
      if (isTv) {
        shareUrl = `${origin}?watch=tv_${item.id}_s${currentSeason}e${currentEpisode}_${mediaSlug}`;
      } else {
        shareUrl = `${origin}?watch=movie_${item.id}_${mediaSlug}`;
      }

      navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const nextEpisode = () => {
    if (!seasonInfo) return;
    const currentIdx = seasonInfo.episodes.findIndex(e => e.episode_number === currentEpisode);
    if (currentIdx !== -1 && currentIdx < seasonInfo.episodes.length - 1) {
      setCurrentEpisode(seasonInfo.episodes[currentIdx + 1].episode_number);
    } else {
      // End of season, roll to next season if exist
      if (item.number_of_seasons && currentSeason < item.number_of_seasons) {
        setCurrentSeason(prev => prev + 1);
        setCurrentEpisode(1);
      }
    }
  };

  const prevEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode(prev => prev - 1);
    } else if (currentSeason > 1) {
      setCurrentSeason(prev => prev - 1);
      // We will set episode to 1 for simplicity of loading new season, or it will load episode 1
      setCurrentEpisode(1);
    }
  };

  const embedUrl = getEmbedUrl(providerId, item.media_type, item.id, currentSeason, currentEpisode);

  return (
    <div className="min-h-screen bg-[#080808] text-gray-100 flex flex-col absolute inset-0 z-50">
      {/* Toast Alert */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#E5A00D] border border-white/10 text-black font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded-none shadow-2xl flex items-center gap-2 z-50"
          >
            <CheckCircle2 className="w-4 h-4 text-black" />
            <span>Link Copied with Playback Configurations!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Player Top Control Bar */}
      <header className="p-4 bg-black/90 border-b border-white/10 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 sm:p-2.5 bg-black hover:bg-neutral-900 border border-white/10 hover:border-[#E5A00D] text-gray-300 hover:text-white rounded-none transition-all cursor-pointer"
            id="player-back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-white truncate max-w-[200px] sm:max-w-md">
              {title}
            </h1>
            <p className="text-[9px] text-gray-400 font-mono tracking-widest uppercase flex items-center gap-1.5 mt-1">
              <span>{isTv ? 'TV SESSION NODE' : 'MOVIE FILM'}</span>
              {isTv && (
                <>
                  <span className="w-1 h-1 bg-stone-600"></span>
                  <span className="text-[#E5A00D] font-bold bg-[#E5A00D]/10 px-1.5 py-0.5 border border-[#E5A00D]/20 rounded-none">S{currentSeason} : E{currentEpisode}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Top-Right Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Theater mode switcher */}
          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className="p-2 sm:p-2.5 bg-black hover:bg-[#E5A00D]/10 border border-white/10 text-gray-400 hover:text-[#E5A00D] rounded-none transition-all cursor-pointer hidden sm:flex"
            title={isTheaterMode ? 'Exit Theater Mode' : 'Enter Theater Mode'}
          >
            {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Share Button with Slugs */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#E5A00D] text-black rounded-none text-[10px] uppercase tracking-widest font-bold shadow-none transition-all cursor-pointer"
            id="player-share-btn"
          >
            <Share2 className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Share Connection</span>
          </button>
        </div>
      </header>

      {/* Main Playing View Stage */}
      <main className="flex-1 p-4 sm:p-6 flex flex-col items-center gap-6 overflow-y-auto pb-24">
        {/* Iframe Screen Frame */}
        <div
          className={`w-full transition-all duration-500 ${
            isTheaterMode ? 'max-w-7xl' : 'max-w-5xl'
          }`}
        >
          {/* Cinema Frame */}
          <div className="relative aspect-video w-full bg-black border border-white/10 rounded-none overflow-hidden shadow-none group flex items-center justify-center">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`Plex Video Stream Player - ${title}`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                referrerPolicy="no-referrer"
                id="plex-streaming-iframe"
              />
            ) : (
              <div className="p-8 text-center text-gray-400 space-y-3 font-sans">
                <p className="text-sm font-semibold uppercase tracking-widest">Configuring secure embedding playback link...</p>
              </div>
            )}
            
            {/* Overlay notification for ads in some servers */}
            <div className="absolute bottom-3 left-3 bg-black/90 px-3 py-1.5 rounded-none border border-white/10 text-[9px] font-bold uppercase tracking-widest text-[#E5A00D] flex items-center gap-1.5 pointer-events-none group-hover:opacity-0 transition-opacity">
              <span className="w-1.5 h-1.5 bg-[#E5A00D] animate-ping"></span>
              <span>Hint: Toggle servers for fast playback backup. AdBlocker recommended.</span>
            </div>
          </div>
        </div>

        {/* Player Bottom Layout Panels */}
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6 text-gray-300">
          {/* COL 1 & 2: Servers list & episode selections */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Servers Selector Area */}
            <div className="bg-[#080808] border border-white/10 rounded-none p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#E5A00D]" />
                  <h3 className="font-display font-black text-[10px] tracking-widest uppercase text-white">Select Broadcast Server</h3>
                </div>
                <button 
                  onClick={() => setShowServerTooltip(!showServerTooltip)}
                  className="p-1 hover:bg-neutral-900 rounded-none text-gray-500 hover:text-[#E5A00D] relative"
                  title="Server Info"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              {showServerTooltip && (
                <div className="p-3 bg-stone-900 border border-white/10 rounded-none text-[10px] tracking-wider uppercase text-gray-400 space-y-1">
                  <p className="font-black text-white">Experiencing buffering lag?</p>
                  <p className="text-[9px] text-gray-400 font-sans tracking-wide">
                    Switch servers below to change video signals. Server 1 is premium VidKing. Series channels (Servers 2/3) offer backup streams.
                  </p>
                </div>
              )}

              {/* Grid of Servers */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2" id="server-list">
                {providers.map((p) => {
                  const isActive = providerId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setProviderId(p.id)}
                      className={`px-3 py-3 rounded-none text-[9px] uppercase tracking-wider text-left font-bold border transition-all flex flex-col justify-center cursor-pointer ${
                        isActive
                          ? 'bg-[#E5A00D]/10 border-[#E5A00D] text-[#E5A00D]'
                          : 'bg-white/5 hover:bg-neutral-900 border-white/10 text-gray-400 hover:text-white'
                      }`}
                      id={`server-${p.id}`}
                    >
                      <span>{p.name}</span>
                      <span className="text-[8px] text-gray-500 font-mono mt-1 tracking-widest uppercase block">
                        {p.id === 'vidking' ? 'Primary feed' : 'Backup link'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* If TV Show: Episode Switcher Selector Row */}
            {isTv && (
              <div className="bg-[#080808] border border-white/10 rounded-none p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-[10px] tracking-widest uppercase text-white">Season / Episode Directory</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={prevEpisode}
                      disabled={currentSeason === 1 && currentEpisode === 1}
                      className="px-3 py-1.5 bg-white/5 hover:bg-neutral-900 border border-white/10 rounded-none text-[9px] uppercase tracking-wider font-bold disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-gray-300"
                    >
                      Prev
                    </button>
                    <button
                      onClick={nextEpisode}
                      disabled={!!(item.number_of_seasons && currentSeason === item.number_of_seasons && seasonInfo && currentEpisode === seasonInfo.episodes.length)}
                      className="px-3 py-1.5 bg-[#E5A00D] hover:bg-white text-black font-black uppercase tracking-wider text-[9px] rounded-none cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Season Select dropdown */}
                {item.number_of_seasons && item.number_of_seasons > 1 && (
                  <div className="flex items-center gap-3 bg-[#080808] p-2 rounded-none border border-white/10">
                    <span className="text-[9px] text-[#E5A00D]/60 tracking-widest font-mono pl-1 uppercase font-bold">SELECT SEASON</span>
                    <select
                      value={currentSeason}
                      onChange={(e) => {
                        setCurrentSeason(Number(e.target.value));
                        setCurrentEpisode(1);
                      }}
                      className="flex-1 bg-transparent text-xs text-white border-0 outline-none cursor-pointer font-bold uppercase tracking-widest"
                    >
                      {Array.from({ length: item.number_of_seasons }, (_, i) => i + 1).map((sNum) => (
                        <option key={sNum} value={sNum} className="bg-[#080808] text-white font-mono text-xs">
                          Season {sNum}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Episodes grid */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {episodesLoading ? (
                    <div className="py-8 text-center text-xs text-gray-500 font-mono tracking-widest uppercase flex items-center justify-center gap-2">
                      <span className="w-3 h-3 rounded-none border-2 border-[#E5A00D] border-t-transparent animate-spin inline-block"></span>
                      Syncing season database indexes...
                    </div>
                  ) : seasonInfo?.episodes && seasonInfo.episodes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="episodes-list">
                      {seasonInfo.episodes.map((ep) => {
                        const isCurrent = ep.episode_number === currentEpisode;
                        return (
                          <button
                            key={ep.id}
                            onClick={() => setCurrentEpisode(ep.episode_number)}
                            className={`p-3 rounded-none border text-left transition-all relative flex flex-col justify-between overflow-hidden cursor-pointer ${
                              isCurrent
                                ? 'bg-[#E5A00D]/5 border-[#E5A00D] text-[#E5A00D]'
                                : 'bg-white/5 hover:bg-neutral-900 border-white/10 text-gray-400 hover:text-white'
                            }`}
                            id={`episode-${ep.episode_number}`}
                          >
                            <div className="flex items-start justify-between gap-2.5 w-full">
                              <span className="text-xs uppercase font-bold line-clamp-1 tracking-wide">{ep.name || `Episode ${ep.episode_number}`}</span>
                              <span className="text-[9px] bg-stone-900 px-1.5 py-0.5 rounded-none font-mono border border-white/10 leading-none">
                                E{ep.episode_number}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 line-clamp-1 mt-1 font-sans">{ep.overview || 'No synopsis loaded by directory index.'}</p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-gray-500 uppercase font-mono tracking-widest">Episodes index is currently vacant.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* COL 3: Show/Movie Info Panel Cards Right */}
          <div className="space-y-6">
            <div className="bg-[#080808] border border-white/10 rounded-none p-5 space-y-4">
              <h3 className="font-display font-black text-[10px] text-[#E5A00D] tracking-widest uppercase">ABOUT SYSTEM CATALOG NODE</h3>
              
              <div className="flex gap-4">
                {item.poster_path && (
                  <img
                    src={item.poster_path.startsWith('http') ? item.poster_path : `https://image.tmdb.org/t/p/w185${item.poster_path}`}
                    alt="Poster"
                    className="w-16 h-24 object-cover rounded-none border border-white/10 shadow-none grayscale hover:grayscale-0 transition-all duration-300"
                  />
                )}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider line-clamp-2">{title}</h4>
                  <p className="text-[10px] text-[#E5A00D] font-mono tracking-widest uppercase">
                    {item.release_date ? item.release_date.substring(0, 4) : item.first_air_date ? item.first_air_date.substring(0, 4) : 'N/A'} YEAR
                  </p>
                  <p className="text-[10px] text-[#E5A00D] font-mono tracking-widest uppercase flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-[#E5A00D] text-[#E5A00D]" />
                    <span>{item.vote_average ? item.vote_average.toFixed(1) : 'NR'} CRITICS</span>
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed pt-3 border-t border-white/10" id="media-overview">
                {item.overview || 'No synopses metadata imported for this media item.'}
              </p>

              {item.genres && item.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.genres.map((g) => (
                    <span key={g.id} className="text-[8px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-none text-gray-400 font-bold uppercase tracking-widest">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick tips */}
            <div className="bg-[#080808] border border-white/10 rounded-none p-5 space-y-3 relative overflow-hidden">
              <h3 className="text-[10px] font-black text-[#E5A00D] flex items-center gap-1.5 uppercase tracking-widest">
                <Play className="w-3 h-3 fill-current text-[#E5A00D]" />
                Interactive Directives
              </h3>
              <ul className="text-[10px] text-gray-400 space-y-3.5 list-none font-semibold uppercase tracking-wider">
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#E5A00D] shrink-0 mt-0.5" />
                  <span>SESSION STATE CACHING AUTOMATICALLY RECORDS TIME CODES AND RESUMPTION VALUES.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#E5A00D] shrink-0 mt-0.5" />
                  <span>SERVER LATENCY DISRUPTIONS RESOLVE WITH SECURE MIRROR BROADCAST HOVERS.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
