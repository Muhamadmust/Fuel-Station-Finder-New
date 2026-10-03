import React from 'react';
import { MapPin, Navigation, Clock, AlertTriangle, PlusCircle } from 'lucide-react';
import type { StationWithDetails, FuelType } from '../types';
import { formatPrice, formatTimeAgo, getPriceTierColor, getFlagBadgeInfo } from '../utils/formatters';

interface StationCardProps {
  station: StationWithDetails;
  selectedFuelType: FuelType | 'all';
  averagePrice: number;
  onReportPrice: (station: StationWithDetails) => void;
  onFlagStation: (station: StationWithDetails) => void;
  onFocusOnMap?: (station: StationWithDetails) => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  selectedFuelType,
  averagePrice,
  onReportPrice,
  onFlagStation,
  onFocusOnMap,
}) => {
  // Determine primary display price
  const primaryFuel = selectedFuelType === 'all' ? 'petrol' : selectedFuelType;
  const primaryPriceObj =
    station.currentPrices[primaryFuel] || station.currentPrices.petrol || station.currentPrices.diesel;
  const primaryPriceVal = primaryPriceObj?.price;
  const tier = getPriceTierColor(primaryPriceVal, averagePrice);

  return (
    <div
      id={`station-card-${station.id}`}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between gap-4 group"
    >
      {/* Header: Name (18px), Distance, Address (14px) */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-emerald-700 transition-colors">
              {station.name}
            </h3>
            <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{station.address}</span>
            </p>
          </div>

          {station.distanceKm !== undefined && (
            <span className="shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-3 py-1 text-sm font-bold flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              {station.distanceKm} km
            </span>
          )}
        </div>

        {/* Active Flag Badges (Shown only if count >= 2 in last 6h) */}
        {station.activeFlags && station.activeFlags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {station.activeFlags.map((flag) => {
              const info = getFlagBadgeInfo(flag.type);
              return (
                <span
                  key={flag.type}
                  id={`flag-badge-${station.id}-${flag.type}`}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${info.bg} ${info.text} ${info.border} shadow-2xs`}
                  title={`${flag.count} driver reports in last 6 hours`}
                >
                  <span>{info.icon}</span>
                  <span>{info.label} ({flag.count})</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Center: Large Fuel Price Display (~24-28px bold) + Multi-Fuel Grid */}
      <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200/80">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
              {selectedFuelType === 'all' ? 'Petrol (Unleaded)' : selectedFuelType}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {formatPrice(primaryPriceVal)}
              </span>
              <span className="text-sm font-semibold text-slate-500">/ litre</span>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${tier.bg} ${tier.text} ${tier.border}`}
            >
              {tier.label}
            </span>
            <div className="text-xs text-slate-500 mt-1.5 flex items-center justify-end gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTimeAgo(primaryPriceObj?.reportedAt || station.lastUpdated)}</span>
            </div>
          </div>
        </div>

        {/* Multi-fuel comparison grid with readable text */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/80 text-center">
          {(['petrol', 'diesel', 'premium'] as const).map((ft) => {
            const item = station.currentPrices[ft];
            const isSelected = selectedFuelType === ft;
            return (
              <div
                key={ft}
                className={`py-2 px-1.5 rounded-xl transition-colors ${
                  isSelected
                    ? 'bg-emerald-100/80 border border-emerald-400 font-bold'
                    : 'bg-white border border-slate-200'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-500 uppercase">{ft}</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  {item ? formatPrice(item.price) : '—'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions: High-touch targets (~44px minimum height) */}
      <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
        <button
          id={`btn-report-${station.id}`}
          onClick={() => onReportPrice(station)}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-xs transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Price</span>
        </button>

        <button
          id={`btn-flag-${station.id}`}
          onClick={() => onFlagStation(station)}
          className="min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-sm font-bold active:scale-[0.98] transition-all"
          title="Flag station issue (no fuel, queue, closed)"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Flag</span>
        </button>

        {onFocusOnMap && (
          <button
            id={`btn-locate-${station.id}`}
            onClick={() => onFocusOnMap(station)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors"
            title="Focus station on map"
            aria-label="Focus on map"
          >
            <Navigation className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
