import React, { useState, useRef, useEffect } from 'react';
import { Fuel, Map as MapIcon, List, Search, X, LogIn, LogOut, CheckCircle2, Navigation, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NIGERIAN_REGIONS } from '../data/nigeriaFuelStations';

interface NavbarProps {
  currentView: 'map' | 'list';
  onViewChange: (view: 'map' | 'list') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAuth: () => void;
  hasUserLocation?: boolean;
  onRequestLocation?: () => void;
  selectedCity?: string;
  onSelectCity?: (cityId: string) => void;
  onOpenFilters?: () => void;
  activeFilterCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onOpenAuth,
  hasUserLocation = false,
  onRequestLocation,
  selectedCity = 'all',
  onSelectCity,
  onOpenFilters,
  activeFilterCount = 0,
}) => {
  const { user, logout, isFirebaseActive } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus mobile search input when opened
  useEffect(() => {
    if (isMobileSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isMobileSearchOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-5 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-900/10 shrink-0">
            <Fuel className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-none">
                FuelFinder
              </span>
              <span className="hidden sm:inline text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                NG
              </span>
            </div>
            <div className="hidden xs:flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 leading-none">
              <span>₦/Litre</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
              {isFirebaseActive ? (
                <span className="text-emerald-700 font-semibold">56 Live</span>
              ) : (
                <span className="text-amber-800 font-semibold">Verified</span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Desktop/Tablet Search Bar + City Selector */}
        <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="navbar-station-search"
              type="text"
              placeholder="Search station, brand, or street..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                id="navbar-search-clear"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-md transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick City Dropdown on Desktop */}
          {onSelectCity && (
            <div className="relative hidden lg:flex items-center">
              <select
                value={selectedCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="min-h-[40px] text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none cursor-pointer"
                title="Filter by Nigerian city region"
              >
                {NIGERIAN_REGIONS.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Section: Mobile Search Toggle + Filter Button + Locate + View Switcher + Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle search"
            title="Search stations"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Filter Trigger Button */}
          {onOpenFilters && (
            <button
              onClick={onOpenFilters}
              className={`min-h-[40px] px-2.5 sm:px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs ${activeFilterCount > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              title="Filter fuel types, cities, and radius"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {/* GPS Locate Me Button */}
          {onRequestLocation && (
            <button
              onClick={onRequestLocation}
              className={`min-h-[40px] px-2.5 sm:px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs ${hasUserLocation
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              title={hasUserLocation ? 'GPS location locked. Click to refresh' : 'Click to enable device GPS'}
            >
              <Navigation className={`w-3.5 h-3.5 ${hasUserLocation ? 'text-emerald-600 fill-emerald-600' : 'text-slate-500'}`} />
              <span className="hidden md:inline">{hasUserLocation ? 'GPS Active' : 'Locate'}</span>
            </button>
          )}

          {/* Map/List View Switcher */}
          <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center">
            <button
              id="nav-view-map-btn"
              onClick={() => onViewChange('map')}
              className={`min-h-[36px] flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentView === 'map'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              title="Map View"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
            <button
              id="nav-view-list-btn"
              onClick={() => onViewChange('list')}
              className={`min-h-[36px] flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentView === 'list'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {/* User Auth Control */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                id="user-menu-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="min-h-[40px] flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 transition-colors shadow-2xs"
                title="Account menu"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center uppercase">
                    {user.displayName ? user.displayName.charAt(0) : 'D'}
                  </div>
                )}
                <span className="hidden xl:inline text-xs font-semibold text-slate-800 max-w-[90px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 text-slate-700 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.displayName || 'Driver'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Contributor</span>
                    </div>
                  </div>
                  <button
                    id="user-logout-btn"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="navbar-login-btn"
              onClick={onOpenAuth}
              className="min-h-[40px] flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Mobile Search Dropdown */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-3 py-2.5 bg-slate-50 border-t border-slate-200 animate-in slide-in-from-top-2 duration-150">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search station, brand, or street in Nigeria..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[44px]"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="absolute right-2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
