import React, { useState } from 'react';
import { X, Fuel, AlertCircle, LogIn } from 'lucide-react';
import type { StationWithDetails, FuelType } from '../types';
import { useAuth } from '../context/AuthContext';
import { submitPriceReport } from '../firebase/service';
import { formatPrice } from '../utils/formatters';

interface ReportModalProps {
  station: StationWithDetails | null;
  onClose: () => void;
  onSuccess: (stationId: string) => void;
  onOpenAuth: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  station,
  onClose,
  onSuccess,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [priceInput, setPriceInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!station) return null;

  // Pre-fill input if price exists
  const currentFuelPrice = station.currentPrices[fuelType]?.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onClose();
      onOpenAuth();
      return;
    }

    const priceNum = parseFloat(priceInput);
    if (isNaN(priceNum) || priceNum <= 100 || priceNum > 10000) {
      setError('Please enter a valid fuel price between ₦100 and ₦10,000 per litre');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await submitPriceReport(station.id, fuelType, priceNum, user.uid);
      onSuccess(station.id);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to submit price report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header - Clean Light Theme */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Report Fuel Price</h3>
              <p className="text-xs text-slate-500 truncate max-w-[220px]">{station.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!user ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <LogIn className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Driver Login Required</h4>
            <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto">
              To ensure price accuracy and prevent spam, price submissions require you to sign in with your driver account.
            </p>
            <button
              id="report-login-prompt-btn"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-sm transition-all"
            >
              Sign In to Continue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Fuel Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fuel Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['petrol', 'diesel', 'premium'] as const).map((ft) => (
                  <button
                    key={ft}
                    type="button"
                    onClick={() => {
                      setFuelType(ft);
                      const current = station.currentPrices[ft]?.price;
                      if (current) setPriceInput(current.toString());
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      fuelType === ft
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {ft}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Price Banner */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Recorded Price:</span>
              <span className="font-bold text-slate-900">
                {currentFuelPrice ? formatPrice(currentFuelPrice) : 'None reported yet'}
              </span>
            </div>

            {/* Price Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Price per Litre (₦)
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₦
                </div>
                <input
                  id="report-price-input"
                  type="number"
                  step="1"
                  min="100"
                  max="10000"
                  required
                  placeholder="e.g. 1060"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quick adjust buttons */}
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
              {[980, 1025, 1060, 1150, 1450].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPriceInput(val.toString())}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
                >
                  ₦{val.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                id="submit-price-report-btn"
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Price'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
