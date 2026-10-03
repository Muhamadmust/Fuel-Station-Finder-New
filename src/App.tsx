import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import { ListView } from './components/ListView';
import { StationDetailSidebar } from './components/StationDetailSidebar';
import { FilterDrawer } from './components/FilterDrawer';
import { ReportModal } from './components/ReportModal';
import { FlagModal } from './components/FlagModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer, type ToastMessage } from './components/Toast';
import { fetchStationsWithDetails } from './firebase/service';
import type {
  StationWithDetails,
  FilterOptions,
  UserLocation,
} from './types';
import { calculateAveragePrice, formatPrice, formatTimeAgo, getFlagBadgeInfo } from './utils/formatters';
import { NIGERIAN_REGIONS } from './data/nigeriaFuelStations';
import { MapPin, Navigation, Clock, AlertTriangle, PlusCircle, X, ChevronLeft, ChevronRight, SlidersHorizontal, ExternalLink } from 'lucide-react';

// Default center coordinates: Lagos, Nigeria
const NIGERIA_DEFAULT_LOCATION: UserLocation = { lat: 6.5244, lng: 3.3792 };

function FuelStationApp() {
  const [currentView, setCurrentView] = useState<'map' | 'list'>('map');
  const [stations, setStations] = useState<StationWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(NIGERIA_DEFAULT_LOCATION);
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Modals & Panels state
  const [reportingStation, setReportingStation] = useState<StationWithDetails | null>(null);
  const [flaggingStation, setFlaggingStation] = useState<StationWithDetails | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [focusedStation, setFocusedStation] = useState<StationWithDetails | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  // Filters state (defaults to nationwide radius so all 56 stations across Nigeria are displayed)
  const [filters, setFilters] = useState<FilterOptions>({
    fuelType: 'all',
    radiusKm: 1000,
    sortBy: 'nearest',
    searchQuery: '',
  });

  // Calculate active filter count
  const activeFilterCount =
    (filters.fuelType !== 'all' ? 1 : 0) +
    (filters.radiusKm < 500 ? 1 : 0) +
    (filters.sortBy !== 'nearest' ? 1 : 0) +
    (filters.searchQuery !== '' ? 1 : 0) +
    (selectedCity !== 'all' ? 1 : 0);

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // City selection handler
  const handleSelectCity = (cityId: string) => {
    setSelectedCity(cityId);
    const reg = NIGERIAN_REGIONS.find((r) => r.id === cityId);
    if (reg) {
      const newLoc = { lat: reg.lat, lng: reg.lng };
      setUserLocation(newLoc);
      if (cityId === 'all') {
        setFilters((prev) => ({ ...prev, radiusKm: 1000 }));
        addToast('info', 'Showing all 56 fuel stations across Nigeria');
      } else {
        setFilters((prev) => ({ ...prev, radiusKm: 60 }));
        addToast('info', `Centered on ${reg.name}`);
      }
      loadStations(newLoc.lat, newLoc.lng);
    }
  };

  // Geolocation detector
  const requestLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLocation(loc);
          loadStations(loc.lat, loc.lng);
          addToast('success', 'GPS location locked! Calculating distances.');
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, using Nigeria center:', err.message);
          setUserLocation(NIGERIA_DEFAULT_LOCATION);
          loadStations(NIGERIA_DEFAULT_LOCATION.lat, NIGERIA_DEFAULT_LOCATION.lng);
          addToast('info', 'Showing fuel stations across Nigeria. Search or select a city.');
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setUserLocation(NIGERIA_DEFAULT_LOCATION);
      loadStations(NIGERIA_DEFAULT_LOCATION.lat, NIGERIA_DEFAULT_LOCATION.lng);
    }
  }, []);

  const loadStations = async (lat?: number, lng?: number) => {
    setLoading(true);
    try {
      const data = await fetchStationsWithDetails(lat, lng);
      setStations(data);
    } catch (err) {
      console.error('Failed to load stations:', err);
      addToast('error', 'Could not refresh stations. Retrying...');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadStations(NIGERIA_DEFAULT_LOCATION.lat, NIGERIA_DEFAULT_LOCATION.lng);
  }, []);

  // Average price for color-coding tier
  const averagePrice = useMemo(() => {
    return calculateAveragePrice(stations, filters.fuelType);
  }, [stations, filters.fuelType]);

  // Filter and Sort stations
  const filteredStations = useMemo(() => {
    return stations
      .filter((st) => {
        // 1. Search Query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = st.name.toLowerCase().includes(q);
          const matchAddress = st.address.toLowerCase().includes(q);
          if (!matchName && !matchAddress) return false;
        }

        // 2. Fuel Type filter
        if (filters.fuelType !== 'all') {
          const hasPrice = st.currentPrices[filters.fuelType] !== undefined;
          if (!hasPrice) return false;
        }

        // 3. Radius filter (if radius is limited and distance is calculated)
        if (filters.radiusKm < 500 && st.distanceKm !== undefined && st.distanceKm > filters.radiusKm) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'nearest') {
          const distA = a.distanceKm ?? 9999;
          const distB = b.distanceKm ?? 9999;
          return distA - distB;
        }
        if (filters.sortBy === 'cheapest') {
          const fuel = filters.fuelType === 'all' ? 'petrol' : filters.fuelType;
          const priceA = a.currentPrices[fuel]?.price ?? 99999;
          const priceB = b.currentPrices[fuel]?.price ?? 99999;
          return priceA - priceB;
        }
        if (filters.sortBy === 'recent') {
          const timeA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
          const timeB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
          return timeB - timeA;
        }
        return 0;
      });
  }, [stations, filters]);

  // Handlers
  const handleReportPriceSuccess = (_stationId: string) => {
    addToast('success', 'Price report recorded! Thank you for updating fellow drivers in Nigeria.');
    loadStations(userLocation?.lat, userLocation?.lng);
  };

  const handleFlagSuccess = (_stationId: string) => {
    addToast('success', 'Incident flag submitted! Active if reported by 2+ drivers.');
    loadStations(userLocation?.lat, userLocation?.lng);
  };

  const handleFocusOnMap = (st: StationWithDetails) => {
    setFocusedStation(st);
    setCurrentView('map');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Sticky Top Responsive Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        hasUserLocation={Boolean(userLocation && (userLocation.lat !== NIGERIA_DEFAULT_LOCATION.lat || userLocation.lng !== NIGERIA_DEFAULT_LOCATION.lng))}
        onRequestLocation={requestLocation}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        onOpenFilters={() => setIsFilterDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Main Content Area: Responsive Map / List */}
      <main className="flex-1 flex flex-col relative w-full overflow-hidden">
        {loading && stations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-bold text-slate-800 text-sm sm:text-base">Loading 50+ Nigerian Fuel Stations...</p>
            <p className="text-xs text-slate-500 mt-1">Retrieving verified stations, live Naira prices, and driver queues</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row relative w-full h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] overflow-hidden">
            {/* Left/Main Column: Map or List View */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
              {currentView === 'map' ? (
                <div className="w-full h-full min-h-[450px] relative">
                  <MapView
                    stations={filteredStations}
                    userLocation={userLocation}
                    selectedFuelType={filters.fuelType}
                    averagePrice={averagePrice}
                    onReportPrice={setReportingStation}
                    onFlagStation={setFlaggingStation}
                    focusedStation={focusedStation}
                    onSelectStation={setFocusedStation}
                    onRequestLocation={requestLocation}
                  />

                  {/* Mobile/Tablet Floating Quick Controls Bar */}
                  <div className="lg:hidden absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                    <button
                      onClick={() => setIsFilterDrawerOpen(true)}
                      className="pointer-events-auto bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 px-3.5 py-2 rounded-xl shadow-md border border-slate-200/90 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{filters.fuelType === 'all' ? 'All Fuels' : filters.fuelType.toUpperCase()}</span>
                      {activeFilterCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>

                    <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200/90 text-xs font-semibold text-slate-600">
                      <strong className="text-slate-900 font-bold">{filteredStations.length}</strong> stations
                    </div>
                  </div>

                  {/* Desktop Floating Sidebar Toggle Button (offset to the left of map controls so it never covers the button below) */}
                  <div className="hidden lg:block absolute top-3 right-[62px] z-20">
                    <button
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 px-3.5 py-2.5 rounded-xl shadow-md border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 min-h-[40px]"
                      title={isSidebarOpen ? 'Hide station sidebar' : 'Show station sidebar'}
                    >
                      {isSidebarOpen ? (
                        <>
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                          <span>Collapse Panel</span>
                        </>
                      ) : (
                        <>
                          <ChevronLeft className="w-4 h-4 text-slate-500" />
                          <span>Show Station Panel</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Selected Station Floating Bottom Sheet on Mobile / Tablet */}
                  {focusedStation && (
                    <div className="lg:hidden absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-20 animate-in slide-in-from-bottom-4 duration-200">
                      <div className="bg-white rounded-2xl p-4 shadow-2xl border border-slate-200/90 space-y-3 max-h-[75vh] overflow-y-auto">
                        {/* Pull handle indicator */}
                        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto" />

                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Selected Station
                            </span>
                            <h4 className="font-bold text-base text-slate-900 mt-1 truncate">{focusedStation.name}</h4>
                            <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{focusedStation.address}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => setFocusedStation(null)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
                            aria-label="Close"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Distance & Time Ago */}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {focusedStation.distanceKm !== undefined && (
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Navigation className="w-3 h-3 text-emerald-600" />
                              {focusedStation.distanceKm} km away
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatTimeAgo(focusedStation.lastUpdated)}
                          </span>
                        </div>

                        {/* Prices Grid in Naira */}
                        <div className="grid grid-cols-3 gap-2 py-1 text-center">
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-500 block uppercase truncate">Petrol</span>
                            <span className="text-xs sm:text-sm font-black text-slate-900 block mt-0.5">
                              {formatPrice(focusedStation.currentPrices.petrol?.price)}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-500 block uppercase truncate">Diesel</span>
                            <span className="text-xs sm:text-sm font-black text-slate-900 block mt-0.5">
                              {formatPrice(focusedStation.currentPrices.diesel?.price)}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-500 block uppercase truncate">Premium</span>
                            <span className="text-xs sm:text-sm font-black text-slate-900 block mt-0.5">
                              {formatPrice(focusedStation.currentPrices.premium?.price)}
                            </span>
                          </div>
                        </div>

                        {/* Active Incident Badges */}
                        {focusedStation.activeFlags && focusedStation.activeFlags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {focusedStation.activeFlags.map((fl) => {
                              const badge = getFlagBadgeInfo(fl.type);
                              return (
                                <span
                                  key={fl.type}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                                >
                                  <span>{badge.icon}</span>
                                  <span>{badge.label} ({fl.count})</span>
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Action buttons with minimum 44px touch targets */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                          <button
                            onClick={() => setReportingStation(focusedStation)}
                            className="min-h-[44px] py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>Report Price</span>
                          </button>
                          <button
                            onClick={() => setFlaggingStation(focusedStation)}
                            className="min-h-[44px] py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98"
                          >
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span>Flag Issue</span>
                          </button>
                        </div>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${focusedStation.latitude},${focusedStation.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          <span>Get Directions in Google Maps</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full overflow-y-auto bg-slate-50 p-3 sm:p-5 lg:p-8">
                  <ListView
                    stations={filteredStations}
                    selectedFuelType={filters.fuelType}
                    averagePrice={averagePrice}
                    onReportPrice={setReportingStation}
                    onFlagStation={setFlaggingStation}
                    onFocusOnMap={handleFocusOnMap}
                    onClearFilters={() =>
                      setFilters({
                        fuelType: 'all',
                        radiusKm: 1000,
                        sortBy: 'nearest',
                        searchQuery: '',
                      })
                    }
                    onOpenFilters={() => setIsFilterDrawerOpen(true)}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Desktop Sidebar (~380-420px width on desktop) */}
            {isSidebarOpen && (
              <div className="hidden lg:block w-[380px] xl:w-[420px] shrink-0 border-l border-slate-200 bg-white h-full overflow-y-auto p-5">
                <StationDetailSidebar
                  station={focusedStation}
                  onCloseStation={() => setFocusedStation(null)}
                  onReportPrice={setReportingStation}
                  onFlagStation={setFlaggingStation}
                  filters={filters}
                  onFiltersChange={setFilters}
                  totalCount={stations.length}
                  filteredCount={filteredStations.length}
                  stations={filteredStations}
                  onSelectStation={(st) => {
                    setFocusedStation(st);
                    if (currentView !== 'map') setCurrentView('map');
                  }}
                  averagePrice={averagePrice}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Responsive Filter Drawer for Mobile & Tablet */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        totalCount={stations.length}
        filteredCount={filteredStations.length}
      />

      {/* Modals */}
      <ReportModal
        station={reportingStation}
        onClose={() => setReportingStation(null)}
        onSuccess={handleReportPriceSuccess}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <FlagModal
        station={flaggingStation}
        onClose={() => setFlaggingStation(null)}
        onSuccess={handleFlagSuccess}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(msg) => addToast('success', msg)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FuelStationApp />
    </AuthProvider>
  );
}
