import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { StationWithDetails, UserLocation, FuelType } from '../types';
import { formatPrice, getPriceTierColor } from '../utils/formatters';
import { Navigation } from 'lucide-react';

interface FallbackLeafletMapProps {
  stations: StationWithDetails[];
  userLocation: UserLocation | null;
  selectedFuelType: FuelType | 'all';
  averagePrice: number;
  focusedStation: StationWithDetails | null;
  onSelectStation: (station: StationWithDetails | null) => void;
  onRequestLocation: () => void;
  onOpenKeyModal?: () => void;
  onSwitchToGoogle?: () => void;
  hasGoogleKey?: boolean;
}

export const FallbackLeafletMap: React.FC<FallbackLeafletMapProps> = ({
  stations,
  userLocation,
  selectedFuelType,
  averagePrice,
  focusedStation,
  onSelectStation,
  onRequestLocation,
  onOpenKeyModal,
  onSwitchToGoogle,
  hasGoogleKey = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map safely with cleanup and sizing
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clear any previous Leaflet ID on the DOM node to avoid "Map container is already initialized"
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const initialLat = userLocation?.lat || stations[0]?.latitude || 6.5244;
    const initialLng = userLocation?.lng || stations[0]?.longitude || 3.3792;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
      zoomControl: false,
    });

    // High performance CartoDB Voyager tiles (100% reliable, zero quota issues)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Force map to recalculate its dimensions after layout renders
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 800);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when stations, prices, or selection change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // User Location Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background-color: #60a5fa; opacity: 0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 20px; height: 20px; border-radius: 9999px; background-color: #2563eb; border: 2px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #ffffff;"></div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(layer);
    }

    // Fuel Station Markers
    stations.forEach((station) => {
      const primaryFuel = selectedFuelType === 'all' ? 'petrol' : selectedFuelType;
      const priceObj = station.currentPrices[primaryFuel] || station.currentPrices.petrol;
      const priceVal = priceObj?.price;
      const tier = getPriceTierColor(priceVal, averagePrice);

      const pinBackground =
        tier.label === 'Cheapest' ? '#059669' : tier.label === 'Higher' ? '#e11d48' : '#d97706';

      const isSelected = focusedStation?.id === station.id;
      const priceDisplay = priceVal ? formatPrice(priceVal) : '⛽';

      const stationIcon = L.divIcon({
        className: 'custom-station-pin',
        html: `
          <div style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: ${pinBackground};
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 7px;
            border-radius: 12px;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'};
            transition: transform 0.15s ease;
            white-space: nowrap;
            cursor: pointer;
          ">
            ${priceDisplay}
          </div>
        `,
        iconSize: [42, 24],
        iconAnchor: [21, 12],
      });

      const marker = L.marker([station.latitude, station.longitude], {
        icon: stationIcon,
        zIndexOffset: isSelected ? 1000 : 1,
      });

      marker.on('click', () => {
        onSelectStation(station);
      });

      marker.addTo(layer);
    });
  }, [stations, userLocation, selectedFuelType, averagePrice, focusedStation]);

  // Center on focused station
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && focusedStation) {
      map.setView([focusedStation.latitude, focusedStation.longitude], 15, { animate: true });
    }
  }, [focusedStation]);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden">
      {/* Map Container - absolute inset-0 with explicit dimensions ensures Leaflet never collapses to 0px height */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%', minHeight: '100%' }}
        className="absolute inset-0 w-full h-full bg-slate-200 z-0"
      />

      {/* Engine Switcher & Status Banner */}
      <div className="absolute top-3 left-3 right-14 sm:right-auto sm:max-w-md z-10 pointer-events-auto animate-in slide-in-from-top-2 duration-200">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-lg border border-emerald-300 flex items-center justify-between gap-2.5 text-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base shrink-0">🗺️</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                Interactive Map (Live)
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                All 56 stations &amp; Naira prices active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onSwitchToGoogle && (
              <button
                onClick={onSwitchToGoogle}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                title="Switch to Google Maps"
              >
                Try Google
              </button>
            )}
            {onOpenKeyModal && (
              <button
                onClick={onOpenKeyModal}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
              >
                {hasGoogleKey ? 'Change Key' : 'Add Key'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Locate Button */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={onRequestLocation}
          className="p-2.5 sm:p-3 bg-white hover:bg-slate-50 rounded-xl shadow-md border border-slate-200 text-slate-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center min-h-[40px] min-w-[40px]"
          title="Recenter to my location"
          aria-label="Recenter to my location"
        >
          <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
        </button>
      </div>

      {/* Price Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl px-3 py-2 shadow-md text-xs hidden sm:block">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Fuel Price Tiers</div>
        <div className="flex items-center gap-3 font-semibold text-slate-700">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Cheapest</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <span>Average</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>Higher</span>
          </div>
        </div>
      </div>
    </div>
  );
};
