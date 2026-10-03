import React, { useState } from 'react';
import { Navigation, RotateCcw, Droplets, SlidersHorizontal, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import type { FuelType, SortOption, FilterOptions } from '../types';
import { NIGERIAN_REGIONS } from '../data/nigeriaFuelStations';

interface FilterBarProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  totalCount: number;
  filteredCount: number;
  hasUserLocation: boolean;
  onRequestLocation: () => void;
  selectedCity?: string;
  onSelectCity?: (cityId: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  totalCount,
  filteredCount,
  hasUserLocation,
  onRequestLocation,
  selectedCity = 'all',
  onSelectCity,
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const handleFuelTypeChange = (val: FuelType | 'all') => {
    onChange({ ...filters, fuelType: val });
  };

  const handleRadiusChange = (val: number) => {
    onChange({ ...filters, radiusKm: val });
  };

  const handleSortChange = (val: SortOption) => {
    onChange({ ...filters, sortBy: val });
  };

  const handleReset = () => {
    onChange({
      fuelType: 'all',
      radiusKm: 1000,
      sortBy: 'nearest',
      searchQuery: '',
    });
    if (onSelectCity) onSelectCity('all');
  };

  const activeFiltersCount =
    (filters.fuelType !== 'all' ? 1 : 0) +
    (filters.radiusKm < 500 ? 1 : 0) +
    (filters.sortBy !== 'nearest' ? 1 : 0) +
    (filters.searchQuery !== '' ? 1 : 0) +
    (selectedCity !== 'all' ? 1 : 0);

  const isFiltered = activeFiltersCount > 0;

  return (
    <div className="bg-white border-b border-slate-200/90 shadow-2xs">
      {/* Main Bar */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Fuel selector + City region buttons + Sort */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap flex-1">
          {/* Quick Fuel Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase px-2 hidden sm:flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-emerald-600" /> Fuel
            </span>
            {(['all', 'petrol', 'diesel', 'premium'] as const).map((type) => (
              <button
                key={type}
                id={`filter-fuel-${type}`}
                onClick={() => handleFuelTypeChange(type)}
                className={`min-h-[38px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold capitalize transition-all active:scale-95 ${
                  filters.fuelType === type
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {type === 'all' ? 'All Fuels' : type === 'petrol' ? 'Petrol (PMS)' : type === 'diesel' ? 'Diesel (AGO)' : 'Premium'}
              </button>
            ))}
          </div>

          {/* Quick City Regions */}
          <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase px-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> City
            </span>
            {NIGERIAN_REGIONS.map((reg) => (
              <button
                key={reg.id}
                onClick={() => onSelectCity?.(reg.id)}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  selectedCity === reg.id
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {reg.name}
              </button>
            ))}
          </div>

          {/* Desktop Radius Slider */}
          <div className="hidden xl:flex min-h-[38px] items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 shrink-0">
              Radius: <span className="font-black text-emerald-700">{filters.radiusKm >= 500 ? 'All Nigeria' : `${filters.radiusKm} km`}</span>
            </span>
            <input
              id="filter-radius-slider"
              type="range"
              min="5"
              max="500"
              step="10"
              value={filters.radiusKm >= 500 ? 500 : filters.radiusKm}
              onChange={(e) => {
                const val = Number(e.target.value);
                handleRadiusChange(val >= 500 ? 1000 : val);
              }}
              className="w-24 accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              title={filters.radiusKm >= 500 ? 'Nationwide view' : `Search within ${filters.radiusKm} km`}
            />
          </div>

          {/* Desktop Sort Dropdown */}
          <div className="hidden lg:flex items-center gap-1.5">
            <label htmlFor="filter-sort-select" className="text-xs font-semibold text-slate-500">
              Sort:
            </label>
            <select
              id="filter-sort-select"
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="min-h-[38px] text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              <option value="nearest">Nearest Distance</option>
              <option value="cheapest">Cheapest Naira Price</option>
              <option value="recent">Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Right Section: Mobile Filter Toggle + Locate Me + Station Count */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            <strong className="text-slate-900 font-bold">{filteredCount}</strong> of {totalCount} fuel stations
          </span>

          {/* Mobile Filter Toggle Button */}
          <button
            id="mobile-filter-toggle-btn"
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className={`lg:hidden min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs ${
              mobileExpanded || isFiltered
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            {mobileExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Locate Me */}
          <button
            id="location-detect-btn"
            onClick={onRequestLocation}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs ${
              hasUserLocation
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title={hasUserLocation ? 'GPS location locked. Click to refresh' : 'Click to enable device GPS'}
          >
            <Navigation className={`w-3.5 h-3.5 ${hasUserLocation ? 'text-emerald-600 fill-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{hasUserLocation ? 'GPS Active' : 'Locate Me'}</span>
          </button>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              id="filter-reset-btn"
              onClick={handleReset}
              className="min-h-[38px] px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Expandable Filter Panel */}
      {mobileExpanded && (
        <div className="lg:hidden border-t border-slate-200 bg-slate-50/90 p-4 space-y-3.5 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Refine Nigerian Fuel Stations
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {filteredCount} matching stations
            </span>
          </div>

          {/* Mobile City Chips */}
          <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 block">Select Region / City</span>
            <div className="flex flex-wrap gap-1.5">
              {NIGERIAN_REGIONS.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => {
                    onSelectCity?.(reg.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCity === reg.id
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {reg.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Radius Slider */}
          <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Search Radius</span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {filters.radiusKm >= 500 ? 'All Nigeria' : `${filters.radiusKm} km`}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              step="10"
              value={filters.radiusKm >= 500 ? 500 : filters.radiusKm}
              onChange={(e) => {
                const val = Number(e.target.value);
                handleRadiusChange(val >= 500 ? 1000 : val);
              }}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Mobile Sort Dropdown */}
          <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 block">Sort Order</span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="w-full min-h-[40px] text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="nearest">Nearest Distance</option>
              <option value="cheapest">Cheapest Fuel Price (₦)</option>
              <option value="recent">Recently Updated</option>
            </select>
          </div>

          {/* Close / Apply Button */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setMobileExpanded(false)}
              className="w-full min-h-[42px] py-2 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all"
            >
              Apply Filters ({filteredCount} Fuel Stations)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
