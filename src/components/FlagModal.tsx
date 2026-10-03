import React, { useState } from 'react';
import { X, AlertTriangle, LogIn, AlertCircle } from 'lucide-react';
import type { StationWithDetails, FlagType } from '../types';
import { useAuth } from '../context/AuthContext';
import { submitStationFlag } from '../firebase/service';

interface FlagModalProps {
  station: StationWithDetails | null;
  onClose: () => void;
  onSuccess: (stationId: string) => void;
  onOpenAuth: () => void;
}

interface FlagOption {
  id: FlagType;
  title: string;
  description: string;
  icon: string;
}

const FLAG_OPTIONS: FlagOption[] = [
  {
    id: 'no_fuel',
    title: 'No Fuel',
    description: 'Pumps are dry or out of specific fuels',
    icon: '⛽',
  },
  {
    id: 'long_queue',
    title: 'Long Queue',
    description: 'Traffic backing up, 10+ minute wait time',
    icon: '⏳',
  },
  {
    id: 'closed',
    title: 'Closed / Inaccessible',
    description: 'Station gates shut or maintenance underway',
    icon: '🚫',
  },
  {
    id: 'wrong_price',
    title: 'Wrong Price',
    description: 'Pump price differs from the community app rate',
    icon: '🏷️',
  },
];

export const FlagModal: React.FC<FlagModalProps> = ({
  station,
  onClose,
  onSuccess,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<FlagType>('long_queue');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!station) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onClose();
      onOpenAuth();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await submitStationFlag(station.id, selectedType, note, user.uid);
      onSuccess(station.id);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to log flag. Please try again.');
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
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Flag Station Issue</h3>
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

        {!user ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <LogIn className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Driver Login Required</h4>
            <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto">
              Please sign in to report station status. To prevent false alarms, verified community flags help fellow drivers avoid delays.
            </p>
            <button
              id="flag-login-prompt-btn"
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

            {/* Note on 2+ flags threshold */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-amber-900 font-medium">
                Flags are displayed as verified public badges when <strong>2 or more drivers</strong> report the same issue within 6 hours.
              </p>
            </div>

            {/* Radio options */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">What's the issue?</label>
              {FLAG_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedType === opt.id
                      ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-400/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="flag_type"
                    value={opt.id}
                    checked={selectedType === opt.id}
                    onChange={() => setSelectedType(opt.id)}
                    className="accent-amber-600"
                  />
                  <span className="text-xl">{opt.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900">{opt.title}</div>
                    <div className="text-[11px] text-slate-500">{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Optional Short Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Details <span className="text-slate-400 font-normal">(e.g. which pump is affected)</span>
              </label>
              <textarea
                id="flag-note-input"
                rows={2}
                maxLength={300}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Only 2 pumps working, queue extending onto main road..."
                className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <div className="text-right text-[10px] text-slate-400">{note.length}/300</div>
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
                id="submit-flag-btn"
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Logging...' : 'Submit Flag'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
