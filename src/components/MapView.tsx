import React, { useState, useEffect, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useApiLoadingStatus,
  useApiIsLoaded,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import {
  Navigation,
  MapPin,
  Clock,
  KeyRound,
} from 'lucide-react';
import type { StationWithDetails, UserLocation, FuelType } from '../types';
import { formatPrice, formatTimeAgo, getPriceTierColor, getFlagBadgeInfo } from '../utils/formatters';
import { FallbackLeafletMap } from './FallbackLeafletMap';
import { ApiKeyModal } from './ApiKeyModal';

interface MapViewProps {
  stations: StationWithDetails[];
  userLocation: UserLocation | null;
  selectedFuelType: FuelType | 'all';
  averagePrice: number;
  onReportPrice: (station: StationWithDetails) => void;
  onFlagStation: (station: StationWithDetails) => void;
  focusedStation: StationWithDetails | null;
  onSelectStation: (station: StationWithDetails | null) => void;
  onRequestLocation: () => void;
}

export const MapView: React.FC<MapViewProps> = (props) => {
  // Check for custom key in local storage first, fallback to env variable
  const customKey = localStorage.getItem('custom_gmaps_api_key') || '';
  const rawApiKey = customKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const apiKey = typeof rawApiKey === 'string' ? rawApiKey.trim().replace(/^["']|["']$/g, '') : '';
  const hasApiKey = Boolean(apiKey && apiKey !== '');

  const [authFailure, setAuthFailure] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Global auth failure interceptor (Google Maps fires window.gm_authFailure when quota/billing/auth fails)
  useEffect(() => {
    const origHandler = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps JavaScript API gm_authFailure fired (quota or billing restriction)');
      setAuthFailure(true);
      if (typeof origHandler === 'function') {
        origHandler();
      }
    };
    return () => {
      (window as any).gm_authFailure = origHandler;
    };
  }, []);

  const handleApplyKey = (newKey: string) => {
    localStorage.setItem('custom_gmaps_api_key', newKey);
    setAuthFailure(false);
    setRetryKey((k) => k + 1);
  };

  // If no API key configured or if Google Maps auth failed (quota exhausted), render interactive fallback map
  if (!hasApiKey || authFailure) {
    return (
      <div className="relative w-full h-full min-h-[400px]">
        <FallbackLeafletMap
          {...props}
          onOpenKeyModal={() => setIsKeyModalOpen(true)}
        />
        <ApiKeyModal
          isOpen={isKeyModalOpen}
          onClose={() => setIsKeyModalOpen(false)}
          onApplyKey={handleApplyKey}
          currentKey={apiKey}
        />
      </div>
    );
  }

  return (
    <div key={retryKey} className="relative w-full h-full min-h-[400px] bg-slate-100 overflow-hidden">
      <APIProvider
        apiKey={apiKey}
        solutionChannel="GMP_visgl_reactgooglemaps_v1"
      >
        <MapLoaderContent
          {...props}
          apiKey={apiKey}
          onAuthFailure={() => setAuthFailure(true)}
          onOpenKeyModal={() => setIsKeyModalOpen(true)}
        />
      </APIProvider>

      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onApplyKey={handleApplyKey}
        currentKey={apiKey}
      />
    </div>
  );
};

interface MapLoaderContentProps extends MapViewProps {
  apiKey: string;
  onAuthFailure: () => void;
  onOpenKeyModal: () => void;
}

const MapLoaderContent: React.FC<MapLoaderContentProps> = ({
  stations,
  userLocation,
  selectedFuelType,
  averagePrice,
  onReportPrice,
  onFlagStation,
  focusedStation,
  onSelectStation,
  onRequestLocation,
  onAuthFailure,
  onOpenKeyModal,
}) => {
  const loadingStatus = useApiLoadingStatus();
  const isLoaded = useApiIsLoaded();

  const defaultCenter = userLocation || {
    lat: stations[0]?.latitude || 6.5244,
    lng: stations[0]?.longitude || 3.3792,
  };

  const [center, setCenter] = useState<UserLocation>(defaultCenter);
  const [zoom, setZoom] = useState<number>(13);

  // Sync center when user location or focused station changes
  useEffect(() => {
    if (focusedStation) {
      setCenter({ lat: focusedStation.latitude, lng: focusedStation.longitude });
      setZoom(15);
    }
  }, [focusedStation]);

  useEffect(() => {
    if (userLocation && !focusedStation) {
      setCenter(userLocation);
    }
  }, [userLocation, focusedStation]);

  // Check for load failures: fallback smoothly instead of crashing
  if (loadingStatus === APILoadingStatus.FAILED || loadingStatus === APILoadingStatus.AUTH_FAILURE) {
    return (
      <FallbackLeafletMap
        stations={stations}
        userLocation={userLocation}
        selectedFuelType={selectedFuelType}
        averagePrice={averagePrice}
        focusedStation={focusedStation}
        onSelectStation={onSelectStation}
        onRequestLocation={onRequestLocation}
        onOpenKeyModal={onOpenKeyModal}
      />
    );
  }

  // Loading state
  if (!isLoaded || loadingStatus === APILoadingStatus.LOADING) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-700 p-6">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <h3 className="mt-4 font-bold text-sm sm:text-base text-slate-800">Connecting to Google Maps...</h3>
        <p className="text-xs text-slate-500 mt-1">Rendering high-resolution vector map tiles</p>
      </div>
    );
  }

  // Loaded map with real tiles and markers
  return (
    <div className="relative w-full h-full">
      <Map
        defaultCenter={center}
        center={center}
        defaultZoom={zoom}
        zoom={zoom}
        onCameraChanged={(ev) => {
          setCenter(ev.detail.center);
          setZoom(ev.detail.zoom);
        }}
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        {/* User Location Marker */}
        {userLocation && (
          <AdvancedMarker position={userLocation} title="Your Location">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-blue-400 opacity-60"></span>
              <div className="relative w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
              </div>
            </div>
          </AdvancedMarker>
        )}

        {/* Station Markers */}
        {stations.map((station) => {
          const primaryFuel = selectedFuelType === 'all' ? 'petrol' : selectedFuelType;
          const priceObj = station.currentPrices[primaryFuel] || station.currentPrices.petrol;
          const priceVal = priceObj?.price;
          const tier = getPriceTierColor(priceVal, averagePrice);

          const pinBackground =
            tier.label === 'Cheapest' ? '#059669' : tier.label === 'Higher' ? '#e11d48' : '#d97706';

          const isSelected = focusedStation?.id === station.id;

          return (
            <AdvancedMarker
              key={station.id}
              position={{ lat: station.latitude, lng: station.longitude }}
              onClick={() => onSelectStation(station)}
              zIndex={isSelected ? 100 : 1}
            >
              <Pin
                background={pinBackground}
                glyphColor="#ffffff"
                borderColor="#ffffff"
                scale={isSelected ? 1.35 : 1.2}
              >
                <span className="text-[11px] sm:text-xs font-black text-white px-1 py-0.5 tracking-tight whitespace-nowrap">
                  {priceVal ? formatPrice(priceVal) : '⛽'}
                </span>
              </Pin>
            </AdvancedMarker>
          );
        })}

        {/* Info Window */}
        {focusedStation && (
          <InfoWindow
            position={{ lat: focusedStation.latitude, lng: focusedStation.longitude }}
            onCloseClick={() => onSelectStation(null)}
          >
            <div className="p-2.5 max-w-xs text-slate-800 font-sans">
              <div className="flex items-start justify-between gap-1 mb-1">
                <h4 className="font-bold text-base text-slate-900 leading-snug">{focusedStation.name}</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{focusedStation.address}</span>
              </p>

              {/* Active Flag Badges */}
              {focusedStation.activeFlags && focusedStation.activeFlags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {focusedStation.activeFlags.map((flag) => {
                    const badgeInfo = getFlagBadgeInfo(flag.type);
                    return (
                      <span
                        key={flag.type}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${badgeInfo.bg} ${badgeInfo.text} ${badgeInfo.border}`}
                      >
                        <span>{badgeInfo.icon}</span>
                        <span>{badgeInfo.label} ({flag.count})</span>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Prices Display */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Recorded Prices
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Petrol</div>
                    <div className="font-black text-xs sm:text-sm text-slate-900">
                      {formatPrice(focusedStation.currentPrices.petrol?.price)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Diesel</div>
                    <div className="font-black text-xs sm:text-sm text-slate-900">
                      {formatPrice(focusedStation.currentPrices.diesel?.price)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Premium</div>
                    <div className="font-black text-xs sm:text-sm text-slate-900">
                      {formatPrice(focusedStation.currentPrices.premium?.price)}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{formatTimeAgo(focusedStation.lastUpdated)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onReportPrice(focusedStation)}
                  className="flex-1 min-h-[38px] py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
                >
                  Report Price
                </button>
                <button
                  onClick={() => onFlagStation(focusedStation)}
                  className="min-h-[38px] py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                >
                  ⚠️ Flag
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Floating Buttons: Locate Me + Key Button */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={onRequestLocation}
          className="p-2.5 sm:p-3 bg-white/95 backdrop-blur-md hover:bg-white rounded-xl shadow-md border border-slate-200 text-slate-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center min-h-[40px] min-w-[40px]"
          title="Recenter to my location"
          aria-label="Recenter to my location"
        >
          <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
        </button>

        <button
          onClick={onOpenKeyModal}
          className="p-2 sm:p-2.5 bg-white/95 backdrop-blur-md hover:bg-white rounded-xl shadow-md border border-slate-200 text-slate-600 hover:text-slate-900 transition-all hover:scale-105 active:scale-95 flex items-center justify-center min-h-[36px] min-w-[36px]"
          title="Custom Google Maps API Key"
          aria-label="Custom Google Maps API Key"
        >
          <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
        </button>
      </div>

      {/* Map Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3 shadow-md text-xs hidden sm:block">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Fuel Price Tiers</div>
        <div className="flex items-center gap-3 font-medium text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-xs"></span>
            <span>Cheapest</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-600 border border-white shadow-xs"></span>
            <span>Average</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 border border-white shadow-xs"></span>
            <span>Higher</span>
          </div>
        </div>
      </div>
    </div>
  );
};
