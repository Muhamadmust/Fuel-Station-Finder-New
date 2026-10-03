import React from 'react';
import type { StationWithDetails, FuelType } from '../types';
import { StationCard } from './StationCard';
import { Fuel, RefreshCw, SlidersHorizontal } from 'lucide-react';

interface ListViewProps {
  stations: StationWithDetails[];
  selectedFuelType: FuelType | 'all';
  averagePrice: number;
  onReportPrice: (station: StationWithDetails) => void;
  onFlagStation: (station: StationWithDetails) => void;
  onFocusOnMap: (station: StationWithDetails) => void;
  onClearFilters: () => void;
  onOpenFilters?: () => void;
}

export const ListView: React.FC<ListViewProps> = ({
  stations,
  selectedFuelType,
  averagePrice,
  onReportPrice,
  onFlagStation,
  onFocusOnMap,
  onClearFilters,
  onOpenFilters,
}) => {
  if (stations.length === 0) {
    return (
      <div className="py-16 sm:py-20 px-4 sm:px-6 text-center max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-xs my-6 sm:my-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <Fuel className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900">No stations match criteria</h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
          Try adjusting fuel grade, expanding search radius, or clearing search keywords.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            id="list-empty-clear-btn"
            onClick={onClearFilters}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Search &amp; Filters</span>
          </button>
          {onOpenFilters && (
            <button
              onClick={onOpenFilters}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition-all"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Open Filters</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1700px] mx-auto">
      {/* Responsive Grid: 1 col on mobile, 2 on tablet, 3 on xl */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-5 lg:gap-6">
        {stations.map((st) => (
          <StationCard
            key={st.id}
            station={st}
            selectedFuelType={selectedFuelType}
            averagePrice={averagePrice}
            onReportPrice={onReportPrice}
            onFlagStation={onFlagStation}
            onFocusOnMap={onFocusOnMap}
          />
        ))}
      </div>
    </div>
  );
};
