import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle, Zap, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsDemoUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      let loggedUser;
      if (mode === 'login') {
        loggedUser = await signInWithEmail(email, password);
      } else {
        loggedUser = await signUpWithEmail(email, password, name);
      }
      if (onSuccess) {
        onSuccess(`Welcome, ${loggedUser.displayName || 'Driver'}! You are signed in.`);
      }
      onClose();
    } catch (err: any) {
      console.warn('Auth error:', err);
      const msg = err?.message || 'Authentication error. Please check your credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loggedUser = await signInWithGoogle();
      if (onSuccess) {
        onSuccess(`Welcome, ${loggedUser.displayName || 'Google Driver'}!`);
      }
      onClose();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      const msg = err?.message || 'Google sign-in was closed or failed.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoSignIn = () => {
    const demoUser = signInAsDemoUser('Verified Contributor');
    if (onSuccess) {
      onSuccess(`Signed in as ${demoUser.displayName}!`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {mode === 'login' ? 'Driver Sign In' : 'Create Driver Account'}
              </h3>
              <p className="text-xs text-slate-500">Access crowd-sourced live fuel updates</p>
            </div>
          </div>
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 text-xs font-semibold bg-slate-50">
          <button
            id="tab-login-btn"
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 font-bold ${
              mode === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            id="tab-signup-btn"
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 font-bold ${
              mode === 'signup'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Informative Error Box with Instant Access Fallback */}
          {error && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoSignIn}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Sign-In as Verified Driver</span>
              </button>
            </div>
          )}

          {/* Google Login button */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-2.5 text-[11px] text-slate-400 font-medium absolute">or with email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Name / Handle</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth-name-input"
                    type="text"
                    placeholder="e.g. Alex Cooper"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email address</label>
              <input
                id="auth-email-input"
                type="email"
                required
                placeholder="driver@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[10px] text-slate-400">Min. 6 characters</span>
              </div>
              <input
                id="auth-password-input"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as Driver</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account & Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Option Card */}
          <div className="pt-3 border-t border-slate-100">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-950">Quick Testing Access</div>
                  <div className="text-[11px] text-emerald-700">Instant 1-click verified contributor access</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoSignIn}
                className="shrink-0 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-lg text-xs shadow-xs transition-all flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Login</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
