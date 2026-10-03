import React from 'react';
import { X, Droplets, MapPin, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';
import type { FilterOptions, FuelType, SortOption } from '../types';
import { NIGERIAN_REGIONS } from '../data/nigeriaFuelStations';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  selectedCity: string;
  onSelectCity: (cityId: string) => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  selectedCity,
  onSelectCity,
  totalCount,
  filteredCount,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    onChange({
      fuelType: 'all',
      radiusKm: 1000,
      sortBy: 'nearest',
      searchQuery: '',
    });
    onSelectCity('all');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer / Dialog Container */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Mobile Pull Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Station Filters</h3>
            <span className="text-xs text-slate-400 font-medium">({filteredCount} of {totalCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Fuel Type Tabs */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fuel Grade</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'All Fuels' },
                { id: 'petrol', label: 'Petrol (PMS)' },
                { id: 'diesel', label: 'Diesel (AGO)' },
                { id: 'premium', label: 'Premium' },
              ].map((fuel) => {
                const isSelected = filters.fuelType === fuel.id;
                return (
                  <button
                    key={fuel.id}
                    onClick={() => onChange({ ...filters, fuelType: fuel.id as FuelType | 'all' })}
                    className={`min-h-[44px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all active:scale-98 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{fuel.label}</span>
                    {isSelected && <Check className="w-4 h-4 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region / City Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>City / Region (Nigeria)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {NIGERIAN_REGIONS.map((reg) => {
                const isSelected = selectedCity === reg.id;
                return (
                  <button
                    key={reg.id}
                    onClick={() => onSelectCity(reg.id)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between active:scale-98 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span className="truncate">{reg.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Radius Slider */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Search Radius</span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {filters.radiusKm >= 500 ? 'Nationwide (All Nigeria)' : `${filters.radiusKm} km`}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              step="15"
              value={filters.radiusKm >= 500 ? 500 : filters.radiusKm}
              onChange={(e) => {
                const val = Number(e.target.value);
                onChange({ ...filters, radiusKm: val >= 500 ? 1000 : val });
              }}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
              <span>5 km</span>
              <span>100 km</span>
              <span>250 km</span>
              <span>All Nigeria</span>
            </div>
          </div>

          {/* Sort Order */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Sort Stations By
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'nearest', label: 'Nearest' },
                { id: 'cheapest', label: 'Cheapest (₦)' },
                { id: 'recent', label: 'Recent' },
              ].map((sort) => {
                const isSelected = filters.sortBy === sort.id;
                return (
                  <button
                    key={sort.id}
                    onClick={() => onChange({ ...filters, sortBy: sort.id as SortOption })}
                    className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold transition-all text-center active:scale-98 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {sort.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Apply CTA */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="w-full min-h-[48px] py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            Show {filteredCount} Stations
          </button>
        </div>
      </div>
    </div>
  );
};
