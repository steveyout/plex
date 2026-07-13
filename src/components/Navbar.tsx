import { useState, useEffect } from 'react';
import { Home, Film, Tv, Cat, Sparkles, Music, ChevronDown, Search, Sun, Moon, Gamepad2, User, Clapperboard } from 'lucide-react';
import { motion } from 'motion/react';
import { NavigationTab } from '../types';

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onSearchClick: () => void;
  isDemo: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onSearchClick, isDemo, theme, toggleTheme }: NavbarProps) {
  // Navigation mapping:
  // - Home -> home
  // - Movies -> movies
  // - TV Shows -> tv
  // - Anime -> watchlist (represented as Anime in CinemaOS theme)
  // - Music -> history (represented as Music in CinemaOS theme)

  const isDark = theme === 'dark';

  const [brand, setBrand] = useState('CinemaOS');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('plexmovies')) {
        setBrand('PlexMovies');
      } else {
        setBrand('CinemaOS');
      }
    }
  }, []);

  return (
    <>
      {/* 1. DESKTOP FLOATING NAVIGATION CAPSULE (CinemaOS UI) */}
      <div className="hidden md:block fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl z-[100] transition-colors duration-300">
        <header className={`h-14 backdrop-blur-xl border rounded-full flex items-center justify-between px-6 transition-all duration-300 ${
          isDark 
            ? 'bg-black/60 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]' 
            : 'bg-white/70 border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)]'
        }`}>
          {/* Left section: Clapper logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className={`p-1.5 rounded-full border flex items-center justify-center ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-zinc-800/5 border-zinc-200'
            }`}>
              <Clapperboard className="w-4 h-4 text-[#E5A00D]" />
            </div>
            <span className={`font-serif font-black text-xs tracking-[0.15em] uppercase select-none ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>{brand}</span>
          </div>

          {/* Center section: Capsule buttons */}
          <nav className={`flex items-center gap-1 border p-1 rounded-full ${
            isDark ? 'bg-white/5 border-white/5' : 'bg-zinc-800/5 border-zinc-100'
          }`}>
            {/* Home Tab */}
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'home'
                  ? isDark
                    ? 'bg-white/15 border border-white/10 text-white shadow-inner'
                    : 'bg-zinc-900/10 border border-zinc-900/5 text-zinc-905 shadow-inner'
                  : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {/* Movies Tab */}
            <button
              onClick={() => setActiveTab('movies')}
              className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'movies'
                  ? isDark
                    ? 'bg-white/15 border border-white/10 text-white shadow-inner'
                    : 'bg-zinc-900/10 border border-zinc-900/5 text-zinc-905 shadow-inner'
                  : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>

            {/* TV Shows Tab */}
            <button
              onClick={() => setActiveTab('tv')}
              className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'tv'
                  ? isDark
                    ? 'bg-white/15 border border-white/10 text-white shadow-inner'
                    : 'bg-zinc-900/10 border border-zinc-900/5 text-zinc-905 shadow-inner'
                  : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>TV Shows</span>
            </button>

            {/* Anime (Watchlist) Tab */}
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'watchlist'
                  ? isDark
                    ? 'bg-white/15 border border-white/10 text-white shadow-inner'
                    : 'bg-zinc-900/10 border border-zinc-900/5 text-zinc-905 shadow-inner'
                  : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Cat className="w-3.5 h-3.5" />
              <span>Anime</span>
            </button>

            {/* AI Search Tab (triggers dynamic overlay) */}
            <button
              onClick={onSearchClick}
              className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5A00D]" />
              <span>AI Search</span>
            </button>

            {/* Music (History) Tab */}
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? isDark
                    ? 'bg-white/15 border border-white/10 text-white shadow-inner'
                    : 'bg-zinc-900/10 border border-zinc-900/5 text-zinc-905 shadow-inner'
                  : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Music</span>
            </button>

            {/* Browse decorative Dropdown */}
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <span>Browse</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </nav>

          {/* Right section: Control row */}
          <div className="flex items-center gap-4">
            {/* Search toggler icon */}
            <button
              onClick={onSearchClick}
              className={`p-1 transition-all cursor-pointer ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Search Library"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Sun/brightness indicator to toggle theme */}
            <button
              className={`p-1 transition-all cursor-pointer ${
                isDark ? 'text-gray-400 hover:text-[#E5A00D]' : 'text-zinc-500 hover:text-[#E5A00D]'
              }`}
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Game controller logo */}
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              className={`p-1 transition-all ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Join Community"
            >
              <Gamepad2 className="w-4 h-4" />
            </a>

            {/* Avatar block */}
            <div 
              onClick={() => setActiveTab('history')}
              className={`w-8 h-8 rounded-full border flex items-center justify-center hover:border-[#E5A00D] transition-all cursor-pointer overflow-hidden ${
                isDark ? 'border-white/10 bg-zinc-800' : 'border-zinc-200 bg-zinc-100'
              }`}
              title="User Node Account"
            >
              <User className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-zinc-650'}`} />
            </div>
          </div>
        </header>

        {/* Demo Tag floating below the top header slightly on right if active */}
        {isDemo && (
          <div className={`absolute top-16 right-4 px-3 py-1 backdrop-blur-md border text-[9px] uppercase tracking-[0.2em] font-mono text-[#E5A00D] rounded-full flex items-center gap-1.5 transition-colors duration-300 ${
            isDark ? 'bg-black/60 border-white/10' : 'bg-white/85 border-zinc-200'
          }`}>
            <span className="w-1.5 h-1.5 bg-[#E5A00D] rounded-full shadow-[0_0_8px_#E5A00D] animate-pulse"></span>
            Demo Feed Active
          </div>
        )}
      </div>

      {/* 2. MOBILE TOP FLOATING HEADER (CinemaOS UI) */}
      <div className="md:hidden fixed top-4 left-4 right-4 z-[100] transition-colors duration-300">
        <header className={`h-14 backdrop-blur-xl border rounded-full flex items-center justify-between px-5 shadow-lg transition-all duration-300 ${
          isDark ? 'bg-black/60 border-white/10' : 'bg-white/75 border-zinc-200/80'
        }`}>
          <div className="flex items-center gap-1.5" onClick={() => setActiveTab('home')}>
            <Clapperboard className="w-5 h-5 text-[#E5A00D]" />
            <span className={`font-serif font-black text-xs tracking-wider uppercase ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>{brand}</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onSearchClick} className={`p-1 ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
            }`}>
              <Search className="w-4 h-4" />
            </button>
            <button onClick={toggleTheme} className={`p-1 ${
              isDark ? 'text-gray-400 hover:text-[#E5A00D]' : 'text-zinc-500 hover:text-[#E5A00D]'
            }`}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className={`p-1 ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
            }`}>
              <Gamepad2 className="w-4 h-4" />
            </button>
            <div className={`w-7 h-7 rounded-full border flex items-center justify-center ${
              isDark ? 'border-white/10 bg-zinc-800' : 'border-zinc-200 bg-zinc-100'
            }`}>
              <User className={`w-3.5 h-3.5 ${isDark ? 'text-gray-300' : 'text-zinc-650'}`} />
            </div>
          </div>
        </header>
      </div>

      {/* 3. MOBILE BOTTOM FLOATING NAVIGATION CAPSULE (CinemaOS UI) */}
      <nav className={`md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm h-14 backdrop-blur-xl border rounded-full z-[100] flex items-center justify-around px-2 shadow-2xl transition-all duration-300 ${
        isDark ? 'bg-black/60 border-white/10' : 'bg-white/75 border-zinc-200/80'
      }`}>
        {/* Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`p-2.5 rounded-xl transition-all ${
            activeTab === 'home'
              ? isDark
                ? 'bg-white/15 border border-white/10 text-white'
                : 'bg-zinc-900/10 border border-zinc-900/5 text-zinc-900'
              : isDark
                ? 'text-gray-400 hover:text-white'
                : 'text-zinc-500 hover:text-zinc-900'
          }`}
          title="Home"
        >
          <Home className="w-4.5 h-4.5" />
        </button>

        {/* Movies */}
        <button
          onClick={() => setActiveTab('movies')}
          className={`p-2.5 rounded-xl transition-all ${
            activeTab === 'movies'
              ? isDark
                ? 'bg-white/15 border border-white/10 text-white'
                : 'bg-zinc-900/10 border border-zinc-900/5 text-zinc-900'
              : isDark
                ? 'text-gray-400 hover:text-white'
                : 'text-zinc-500 hover:text-zinc-900'
          }`}
          title="Movies"
        >
          <Film className="w-4.5 h-4.5" />
        </button>

        {/* TV Shows */}
        <button
          onClick={() => setActiveTab('tv')}
          className={`p-2.5 rounded-xl transition-all ${
            activeTab === 'tv'
              ? isDark
                ? 'bg-white/15 border border-white/10 text-white'
                : 'bg-zinc-900/10 border border-zinc-900/5 text-zinc-900'
              : isDark
                ? 'text-gray-400 hover:text-white'
                : 'text-zinc-500 hover:text-zinc-900'
          }`}
          title="TV Shows"
        >
          <Tv className="w-4.5 h-4.5" />
        </button>

        {/* Anime (Watchlist) */}
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`p-2.5 rounded-xl transition-all ${
            activeTab === 'watchlist'
              ? isDark
                ? 'bg-white/15 border border-white/10 text-white'
                : 'bg-zinc-900/10 border border-zinc-900/5 text-zinc-900'
              : isDark
                ? 'text-gray-400 hover:text-white'
                : 'text-zinc-500 hover:text-zinc-900'
          }`}
          title="Anime"
        >
          <Cat className="w-4.5 h-4.5" />
        </button>

        {/* Music (History) */}
        <button
          onClick={() => setActiveTab('history')}
          className={`p-2.5 rounded-xl transition-all ${
            activeTab === 'history'
              ? isDark
                ? 'bg-white/15 border border-white/10 text-white'
                : 'bg-zinc-900/10 border border-zinc-900/5 text-zinc-900'
              : isDark
                ? 'text-gray-400 hover:text-white'
                : 'text-zinc-500 hover:text-zinc-900'
          }`}
          title="Music"
        >
          <Music className="w-4.5 h-4.5" />
        </button>

        {/* Search */}
        <button
          onClick={onSearchClick}
          className={`p-2.5 transition-all ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
          }`}
          title="Search"
        >
          <Search className="w-4.5 h-4.5" />
        </button>
      </nav>
    </>
  );
}
