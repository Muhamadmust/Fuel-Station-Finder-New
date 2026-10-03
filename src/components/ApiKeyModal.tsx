import React, { useState } from 'react';
import { X, KeyRound, ExternalLink, Check, AlertCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyKey: (key: string) => void;
  currentKey: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onApplyKey,
  currentKey,
}) => {
  const [inputKey, setInputKey] = useState(currentKey);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();
    if (!cleanKey) {
      setError('Please enter a valid Google Maps API Key');
      return;
    }
    if (!cleanKey.startsWith('AIza')) {
      setError('A Google Cloud API key usually starts with "AIza..."');
      return;
    }
    setError(null);
    onApplyKey(cleanKey);
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('custom_gmaps_api_key');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Custom Google Maps Key</h3>
              <p className="text-xs text-slate-500">Enable high-res Google Maps tiles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The shared public Maps demo key has a daily quota limit. By using your own Google Cloud Maps API Key (which includes <strong>$200 free monthly credit</strong>, ~28,000 loads/mo), your map will never run out of quota.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google Maps API Key
            </label>
            <input
              type="text"
              required
              placeholder="AIzaSy..."
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
            {error && (
              <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <a
              href="https://console.cloud.google.com/google/maps-apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Get key from Google Cloud Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            {localStorage.getItem('custom_gmaps_api_key') && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Reset Key
              </button>
            )}
            <button
              type="submit"
              className="flex-1 min-h-[44px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              Apply Key &amp; Reload Map
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
