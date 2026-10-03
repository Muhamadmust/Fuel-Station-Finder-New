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
  onOpenKeyModal: () => void;
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
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = userLocation?.lat || stations[0]?.latitude || 6.5244;
      const initialLng = userLocation?.lng || stations[0]?.longitude || 3.3792;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        zoomControl: false,
      });

      // CartoDB Voyager clean tiles (fast, reliable, no quota limitations)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Add Zoom Control to bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
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
            padding: 3px 6px;
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
        iconSize: [40, 24],
        iconAnchor: [20, 12],
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
    <div className="relative w-full h-full min-h-[400px]">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full bg-slate-100 z-0" />

      {/* Quota / Fallback Notification Banner */}
      <div className="absolute top-3 left-3 right-14 sm:right-auto sm:max-w-md z-10 pointer-events-auto animate-in slide-in-from-top-2 duration-200">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-amber-300 flex items-center justify-between gap-3 text-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-base">🗺️</span>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Showing Interactive Backup Map
              </p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Google Maps Demo quota reached. All 56 stations &amp; prices are active.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenKeyModal}
            className="shrink-0 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            Add API Key
          </button>
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
