import { Home, Film, Tv, Bookmark, History, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { NavigationTab } from '../types';

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onSearchClick: () => void;
  isDemo: boolean;
}

export default function Navbar({ activeTab, setActiveTab, onSearchClick, isDemo }: NavbarProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Shows', icon: Tv },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { id: 'history', label: 'History', icon: History }
  ] as const;

  return (
    <>
      {/* SIDEBAR - DESKTOP ONLY */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-[#080808] border-r border-white/10 text-gray-300 z-30">
        {/* Plex Brand Logo & Title */}
        <div className="p-8 pb-4 flex flex-col gap-1 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-3xl tracking-tighter text-[#E5A00D]">
              PLEX
            </span>
            <span className="text-[10px] uppercase tracking-widest font-bold border border-white/20 text-[#F5F5F5] px-2 py-0.5">
              LIVE
            </span>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-mono">Premium Node</p>
        </div>

        {/* Demo Mode Status Indicator */}
        {isDemo && (
          <div className="mx-4 mt-4 p-4 bg-white/5 border border-[#E5A00D]/30 text-xs text-[#E5A00D] font-sans flex flex-col gap-1 rounded-none">
            <span className="font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5A00D] shadow-[0_0_8px_#E5A00D] animate-pulse"></span>
              Demo Active
            </span>
            <p className="text-[10px] text-gray-400 leading-normal">Supply TMDB_API_KEY to unlock full high-speed directory.</p>
          </div>
        )}

        {/* Search Invoker Card */}
        <button
          onClick={onSearchClick}
          className="mx-4 mt-4 mb-2 flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-none text-left text-gray-400 hover:text-[#F5F5F5] transition-all group duration-200 cursor-pointer"
          id="search-trigger"
        >
          <Search className="w-4 h-4 text-gray-500 group-hover:text-[#E5A00D] transition-colors" />
          <span className="text-xs uppercase tracking-wider font-semibold">Search Catalog...</span>
          <span className="ml-auto text-[9px] font-mono border border-white/25 text-gray-500 px-1.5 py-0.5 rounded-none">
            ⌘K
          </span>
        </button>

        {/* Main Nav Items List */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-widest font-bold transition-all duration-200 group relative cursor-pointer ${
                  isActive
                    ? 'text-[#E5A00D] bg-white/5 border-l-2 border-[#E5A00D]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                id={`nav-${tab.id}`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-[#E5A00D]' : 'text-gray-400 group-hover:text-white'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Info Box Footer */}
        <div className="p-6 border-t border-white/10 text-[9px] uppercase tracking-widest text-gray-500 font-mono space-y-1">
          <div>Engine API: v3 (Proxied)</div>
          <div>Node Status: Online</div>
          <div className="text-[8px] text-gray-600">© 2026 Plex Inc.</div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#080808]/95 backdrop-blur-md border-t border-white/10 flex items-center justify-around px-2 pb-safe z-40 text-gray-400"
        id="mobile-bottom-nav"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[9px] uppercase tracking-wider font-bold transition-all duration-200 relative cursor-pointer ${
                isActive ? 'text-[#E5A00D]' : 'text-gray-400 active:scale-95'
              }`}
              id={`mobile-nav-${tab.id}`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-active-dot"
                  className="absolute top-0 w-12 h-0.5 bg-[#E5A00D]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="w-4.5 h-4.5 mb-1" />
              <span>{tab.label}</span>
            </button>
          );
        })}
        {/* Search button on Mobile navbar */}
        <button
          onClick={onSearchClick}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[9px] uppercase tracking-wider font-bold text-gray-400 active:scale-95 cursor-pointer"
          id="mobile-nav-search"
        >
          <Search className="w-4.5 h-4.5 mb-1 text-gray-400" />
          <span>Search</span>
        </button>
      </nav>
    </>
  );
}
