import React from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  AlertTriangle,
  PlusCircle,
  X,
  ExternalLink,
  Droplets,
  SlidersHorizontal,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import type { StationWithDetails, FilterOptions, FuelType, SortOption } from '../types';
import { formatPrice, formatTimeAgo, getPriceTierColor, getFlagBadgeInfo } from '../utils/formatters';

interface StationDetailSidebarProps {
  station: StationWithDetails | null;
  onCloseStation: () => void;
  onReportPrice: (station: StationWithDetails) => void;
  onFlagStation: (station: StationWithDetails) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  totalCount: number;
  filteredCount: number;
  stations: StationWithDetails[];
  onSelectStation: (st: StationWithDetails) => void;
  averagePrice?: number;
}

export const StationDetailSidebar: React.FC<StationDetailSidebarProps> = ({
  station,
  onCloseStation,
  onReportPrice,
  onFlagStation,
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  stations,
  onSelectStation,
  averagePrice = 1040,
}) => {
  const isFiltered =
    filters.fuelType !== 'all' ||
    filters.radiusKm !== 25 ||
    filters.sortBy !== 'nearest' ||
    filters.searchQuery !== '';

  const handleResetFilters = () => {
    onFiltersChange({
      fuelType: 'all',
      radiusKm: 25,
      sortBy: 'nearest',
      searchQuery: '',
    });
  };

  // If a station is selected, show generous dedicated Station Detail Card
  if (station) {
    const primaryFuel = filters.fuelType === 'all' ? 'petrol' : filters.fuelType;
    const primaryPriceObj =
      station.currentPrices[primaryFuel] || station.currentPrices.petrol || station.currentPrices.diesel;
    const priceVal = primaryPriceObj?.price;
    const tier = getPriceTierColor(priceVal, averagePrice);

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-200">
        {/* Header with Close */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mb-2">
              Selected Station
            </span>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{station.name}</h3>
            <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{station.address}</span>
            </p>
          </div>
          <button
            onClick={onCloseStation}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Deselect station"
            aria-label="Close station details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Distance & Price Tier */}
        <div className="flex items-center justify-between gap-3">
          {station.distanceKm !== undefined ? (
            <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>{station.distanceKm} km away</span>
            </div>
          ) : (
            <div />
          )}

          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide border ${tier.bg} ${tier.text} ${tier.border}`}
          >
            {tier.label} Price
          </span>
        </div>

        {/* Active Flag Badges (Shown only if count >= 2 in last 6h) */}
        {station.activeFlags && station.activeFlags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Reports (Last 6h)</h4>
            <div className="flex flex-wrap gap-2">
              {station.activeFlags.map((flag) => {
                const info = getFlagBadgeInfo(flag.type);
                return (
                  <span
                    key={flag.type}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${info.bg} ${info.text} ${info.border} shadow-2xs`}
                  >
                    <span>{info.icon}</span>
                    <span>{info.label} ({flag.count} reports)</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Multi-Fuel Price Grid with Generous Internal Spacing */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Community Pricing</span>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTimeAgo(primaryPriceObj?.reportedAt || station.lastUpdated)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {(['petrol', 'diesel', 'premium'] as const).map((ft) => {
              const item = station.currentPrices[ft];
              const isSelected = filters.fuelType === ft;
              return (
                <div
                  key={ft}
                  className={`py-3 px-2 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-emerald-100/80 border-2 border-emerald-500 shadow-xs'
                      : 'bg-white border border-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-500 uppercase">{ft}</div>
                  <div className="text-base sm:text-lg font-black text-slate-900 mt-1">
                    {item ? formatPrice(item.price) : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons (Generous Touch Targets ~48px) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onReportPrice(station)}
              className="flex-1 min-h-[48px] flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Price</span>
            </button>

            <button
              onClick={() => onFlagStation(station)}
              className="min-h-[48px] flex items-center justify-center gap-2 py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-sm font-bold active:scale-[0.98] transition-all"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Flag Issue</span>
            </button>
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>Open Directions in Google Maps</span>
          </a>
        </div>
      </div>
    );
  }

  // If no station is selected, show Filter & Settings Panel + Quick Station List
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 flex flex-col gap-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-base text-slate-900">Station Filters</h3>
        </div>
        {isFiltered && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Fuel Type Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fuel Type</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['all', 'petrol', 'diesel', 'premium'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onFiltersChange({ ...filters, fuelType: type })}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all active:scale-98 ${
                filters.fuelType === type
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {type === 'all' ? 'All Fuels' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Radius Slider with Live km Label */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Search Radius
          </label>
          <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {filters.radiusKm} km
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={filters.radiusKm}
          onChange={(e) => onFiltersChange({ ...filters, radiusKm: Number(e.target.value) })}
          className="w-full accent-emerald-600 cursor-pointer h-2.5 bg-slate-200 rounded-lg"
        />
        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
          <span>1 km</span>
          <span>25 km</span>
          <span>50 km</span>
        </div>
      </div>

      {/* Sort Option */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Sort Order
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as SortOption })}
          className="w-full min-h-[44px] text-sm bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
        >
          <option value="nearest">Nearest Distance</option>
          <option value="cheapest">Cheapest Fuel Price</option>
          <option value="recent">Recently Updated</option>
        </select>
      </div>

      {/* Quick Station Select List */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Nearby Stations ({filteredCount})
          </span>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {stations.slice(0, 6).map((st) => {
            const primaryFuel = filters.fuelType === 'all' ? 'petrol' : filters.fuelType;
            const price = st.currentPrices[primaryFuel]?.price;
            return (
              <button
                key={st.id}
                onClick={() => onSelectStation(st)}
                className="w-full text-left p-3 rounded-xl border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all flex items-center justify-between gap-2 group"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 truncate">
                    {st.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{st.address}</p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <span className="text-sm font-black text-slate-900 block">{formatPrice(price)}</span>
                    {st.distanceKm !== undefined && (
                      <span className="text-[11px] text-slate-500 font-medium">{st.distanceKm} km</span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
