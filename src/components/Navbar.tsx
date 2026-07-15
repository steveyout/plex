import { useState, useEffect } from 'react';
import { 
  Home, 
  Film, 
  Tv, 
  Cat, 
  Sparkles, 
  Music, 
  ChevronDown, 
  Search, 
  Sun, 
  Moon, 
  Gamepad2, 
  User, 
  Clapperboard, 
  Bookmark, 
  Clock, 
  Library, 
  RotateCcw 
} from 'lucide-react';
import { motion } from 'motion/react';
import { NavigationTab } from '../types';
import { useBrand } from '../utils/brand';

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onSearchClick: () => void;
  isDemo: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onSearchClick, isDemo, theme, toggleTheme }: NavbarProps) {
  const isDark = theme === 'dark';
  const brand = useBrand();

  // Dynamic Tab Labels & Icons based on Domain
  const getTabInfo = (tab: NavigationTab) => {
    switch (tab) {
      case 'home':
        return { label: 'Home', Icon: Home };
      case 'movies':
        return { label: 'Movies', Icon: Film };
      case 'tv':
        return { label: 'TV Shows', Icon: Tv };
      case 'watchlist':
        if (brand.name === 'PlexMovies') {
          return { label: 'Watchlist', Icon: Bookmark };
        } else if (brand.name.startsWith('Hexa') || brand.name === 'HexaVideo') {
          return { label: 'Library', Icon: Library };
        } else {
          return { label: 'Anime', Icon: Cat };
        }
      case 'history':
        if (brand.name === 'PlexMovies') {
          return { label: 'History', Icon: RotateCcw };
        } else if (brand.name.startsWith('Hexa') || brand.name === 'HexaVideo') {
          return { label: 'Sessions', Icon: Clock };
        } else {
          return { label: 'Music', Icon: Music };
        }
    }
  };

  const tabs: NavigationTab[] = ['home', 'movies', 'tv', 'watchlist', 'history'];

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
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setActiveTab('home')}
          >
            <div className={`p-1.5 rounded-full border flex items-center justify-center ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-zinc-800/5 border-zinc-200'
            }`}>
              <Clapperboard className="w-4 h-4 transition-colors" style={{ color: brand.accentColor }} />
            </div>
            <span className={`font-serif font-black text-xs tracking-[0.15em] uppercase select-none ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>{brand.name}</span>
          </motion.div>

          {/* Center section: Capsule buttons */}
          <nav className={`flex items-center gap-1 border p-1 rounded-full ${
            isDark ? 'bg-white/5 border-white/5' : 'bg-zinc-800/5 border-zinc-100'
          }`}>
            {tabs.map((tab) => {
              const info = getTabInfo(tab);
              const isActive = activeTab === tab;
              const Icon = info.Icon;

              return (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'bg-white/15 border border-white/10 text-white shadow-inner font-black'
                        : 'bg-zinc-900/10 border border-zinc-900/5 text-zinc-900 shadow-inner font-black'
                      : isDark
                        ? 'text-gray-400 hover:text-white'
                        : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  style={isActive ? { color: brand.accentColor } : {}}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{info.label}</span>
                </motion.button>
              );
            })}

            {/* AI Search Tab (triggers dynamic overlay) */}
            <motion.button
              onClick={onSearchClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: brand.accentColor }} />
              <span className={brand.textAccent}>AI Search</span>
            </motion.button>

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
              className="p-1 transition-all cursor-pointer hover:scale-110"
              style={{ color: isDark ? '#9ca3af' : '#4b5563' }}
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
              onClick={toggleTheme}
              id="theme-toggler"
            >
              {isDark ? <Sun className="w-4 h-4 hover:text-amber-400 transition-colors" /> : <Moon className="w-4 h-4 hover:text-indigo-600 transition-colors" />}
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
              className="w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer overflow-hidden hover:scale-105"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
              id="avatar-button"
            >
              <User className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-zinc-650'}`} />
            </div>
          </div>
        </header>

        {/* Demo Tag floating below the top header slightly on right if active */}
        {isDemo && (
          <div className={`absolute top-16 right-4 px-3 py-1 backdrop-blur-md border text-[9px] uppercase tracking-[0.2em] font-mono rounded-full flex items-center gap-1.5 transition-colors duration-300 ${
            isDark ? 'bg-black/60 border-white/10 text-gray-300' : 'bg-white/85 border-zinc-200 text-zinc-700'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse shadow-md" style={{ backgroundColor: brand.accentColor, boxShadow: `0 0 8px ${brand.accentColor}` }}></span>
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
            <Clapperboard className="w-5 h-5" style={{ color: brand.accentColor }} />
            <span className={`font-serif font-black text-xs tracking-wider uppercase ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>{brand.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onSearchClick} className={`p-1 ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
            }`}>
              <Search className="w-4 h-4" />
            </button>
            <button onClick={toggleTheme} className="p-1">
              {isDark ? <Sun className="w-4 h-4 text-gray-400" /> : <Moon className="w-4 h-4 text-zinc-500" />}
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

      {/* 3. MOBILE BOTTOM FLOATING NAVIGATION CAPSULE (CinemaOS UI) - Highly optimized with touch-safe tap animations */}
      <nav className={`md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm h-14 backdrop-blur-xl border rounded-full z-[100] flex items-center justify-around px-2 shadow-2xl transition-all duration-300 ${
        isDark ? 'bg-black/60 border-white/10' : 'bg-white/75 border-zinc-200/80'
      }`}>
        {tabs.map((tab) => {
          const info = getTabInfo(tab);
          const isActive = activeTab === tab;
          const Icon = info.Icon;

          return (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileTap={{ scale: 0.85 }}
              className={`p-2.5 rounded-xl transition-all ${
                isActive
                  ? isDark
                    ? 'bg-white/15 border border-white/10'
                    : 'bg-zinc-900/10 border border-zinc-900/5'
                  : isDark
                    ? 'text-gray-400'
                    : 'text-zinc-500'
              }`}
              style={isActive ? { color: brand.accentColor } : {}}
              title={info.label}
            >
              <Icon className="w-4.5 h-4.5" />
            </motion.button>
          );
        })}

        {/* Search button on Mobile */}
        <motion.button
          onClick={onSearchClick}
          whileTap={{ scale: 0.85 }}
          className={`p-2.5 transition-all ${
            isDark ? 'text-gray-400' : 'text-zinc-500'
          }`}
          title="Search"
        >
          <Search className="w-4.5 h-4.5" />
        </motion.button>
      </nav>
    </>
  );
}
