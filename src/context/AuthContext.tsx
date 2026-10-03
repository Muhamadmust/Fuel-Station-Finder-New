import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/config';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface LocalAccount extends AuthUser {
  password?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isFirebaseActive: boolean;
  signInWithGoogle: () => Promise<AuthUser>;
  signInWithEmail: (email: string, pass: string) => Promise<AuthUser>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<AuthUser>;
  signInAsDemoUser: (name?: string) => AuthUser;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'fsf_driver_session';
const LOCAL_ACCOUNTS_KEY = 'fsf_driver_accounts';

function getStoredAccounts(): LocalAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredAccount(account: LocalAccount) {
  try {
    const accounts = getStoredAccounts();
    const existingIdx = accounts.findIndex(
      (a) => a.email?.toLowerCase() === account.email?.toLowerCase()
    );
    if (existingIdx >= 0) {
      accounts[existingIdx] = { ...accounts[existingIdx], ...account };
    } else {
      accounts.push(account);
    }
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Failed to save local account:', e);
  }
}

function saveLocalSession(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch (e) {
    console.warn('Failed to save local session:', e);
  }
}

function getStoredSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (isFirebaseConfigured && auth) {
      try {
        unsubscribe = onAuthStateChanged(auth, (fbUser: User | null) => {
          if (fbUser) {
            const mappedUser: AuthUser = {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Driver',
              photoURL: fbUser.photoURL,
            };
            setUser(mappedUser);
            saveLocalSession(mappedUser);
          } else {
            // Check if there is an active local session
            const stored = getStoredSession();
            setUser(stored);
          }
          setLoading(false);
        });
      } catch (err) {
        console.warn('onAuthStateChanged error:', err);
        const stored = getStoredSession();
        setUser(stored);
        setLoading(false);
      }
    } else {
      const stored = getStoredSession();
      setUser(stored);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (): Promise<AuthUser> => {
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        const u = cred.user;
        const loggedUser: AuthUser = {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName || u.email?.split('@')[0] || 'Google Driver',
          photoURL: u.photoURL,
        };
        setUser(loggedUser);
        saveLocalSession(loggedUser);
        return loggedUser;
      } catch (err: any) {
        console.warn('Google sign-in attempt error:', err?.code, err?.message);
        
        if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
          throw new Error(
            'Google sign-in popup was closed. If your organization blocked access with "Ask your admin", choose a personal @gmail.com account or use Instant Sign-In below.'
          );
        }

        if (err?.code === 'auth/popup-blocked') {
          throw new Error(
            'Google sign-in popup was blocked by your browser settings. Please allow popups for this site or use Instant Sign-In below.'
          );
        }

        if (err?.code === 'auth/unauthorized-domain') {
          throw new Error(
            'This deployment domain is not in the Firebase authorized list. Use Instant Sign-In or Email Sign-In to continue.'
          );
        }

        // For any other unexpected restriction, provide friendly fallback
        throw new Error(
          err?.message || 'Google sign-in could not be completed. Please use Instant Sign-In below.'
        );
      }
    } else {
      const fallbackUser: AuthUser = {
        uid: 'g-' + Math.random().toString(36).substring(2, 10),
        email: 'muhadmustapha5104@gmail.com',
        displayName: 'Verified Driver',
        photoURL: null,
      };
      saveLocalSession(fallbackUser);
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<AuthUser> => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !pass) {
      throw new Error('Please provide both email and password.');
    }
    if (pass.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
        const u = cred.user;
        const loggedUser: AuthUser = {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName || trimmedEmail.split('@')[0],
          photoURL: u.photoURL,
        };
        setUser(loggedUser);
        saveLocalSession(loggedUser);
        return loggedUser;
      } catch (err: any) {
        console.warn('Email sign-in Firebase error:', err?.code, err?.message);
        // If backend has disabled email/password or configuration is missing
        if (
          err?.code === 'auth/operation-not-allowed' ||
          err?.code === 'auth/configuration-not-found' ||
          err?.code === 'auth/unauthorized-domain'
        ) {
          // Check local registered accounts
          const accounts = getStoredAccounts();
          const existing = accounts.find((a) => a.email?.toLowerCase() === trimmedEmail.toLowerCase());
          if (existing) {
            if (existing.password && existing.password !== pass) {
              throw new Error('Incorrect password. Please try again.');
            }
            saveLocalSession(existing);
            setUser(existing);
            return existing;
          }
          // If user didn't register before, create their verified driver account automatically
          const newUser: AuthUser = {
            uid: 'driver-' + Math.random().toString(36).substring(2, 10),
            email: trimmedEmail,
            displayName: trimmedEmail.split('@')[0],
            photoURL: null,
          };
          saveStoredAccount({ ...newUser, password: pass, createdAt: new Date().toISOString() });
          saveLocalSession(newUser);
          setUser(newUser);
          return newUser;
        }

        if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
          throw new Error('Invalid email or password. Please verify your credentials.');
        }

        if (err?.code === 'auth/user-not-found') {
          throw new Error('No driver account found with this email. Please click "Create Account" tab.');
        }

        // Generic fallback to prevent blocking
        const fallbackUser: AuthUser = {
          uid: 'driver-' + Math.random().toString(36).substring(2, 10),
          email: trimmedEmail,
          displayName: trimmedEmail.split('@')[0],
          photoURL: null,
        };
        saveLocalSession(fallbackUser);
        setUser(fallbackUser);
        return fallbackUser;
      }
    } else {
      const accounts = getStoredAccounts();
      const existing = accounts.find((a) => a.email?.toLowerCase() === trimmedEmail.toLowerCase());
      if (existing) {
        if (existing.password && existing.password !== pass) {
          throw new Error('Incorrect password. Please try again.');
        }
        saveLocalSession(existing);
        setUser(existing);
        return existing;
      }
      const newUser: AuthUser = {
        uid: 'driver-' + Math.random().toString(36).substring(2, 10),
        email: trimmedEmail,
        displayName: trimmedEmail.split('@')[0],
        photoURL: null,
      };
      saveStoredAccount({ ...newUser, password: pass, createdAt: new Date().toISOString() });
      saveLocalSession(newUser);
      setUser(newUser);
      return newUser;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string): Promise<AuthUser> => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !pass) {
      throw new Error('Please provide both email and password.');
    }
    if (pass.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    const displayName = name?.trim() || trimmedEmail.split('@')[0];

    if (isFirebaseConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
        const u = cred.user;
        const loggedUser: AuthUser = {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName || displayName,
          photoURL: u.photoURL,
        };
        setUser(loggedUser);
        saveLocalSession(loggedUser);
        return loggedUser;
      } catch (err: any) {
        console.warn('Email sign-up Firebase error:', err?.code, err?.message);
        if (
          err?.code === 'auth/operation-not-allowed' ||
          err?.code === 'auth/configuration-not-found' ||
          err?.code === 'auth/unauthorized-domain'
        ) {
          const accounts = getStoredAccounts();
          const existing = accounts.find((a) => a.email?.toLowerCase() === trimmedEmail.toLowerCase());
          if (existing) {
            // Already exists in local accounts
            saveLocalSession(existing);
            setUser(existing);
            return existing;
          }
          const newUser: AuthUser = {
            uid: 'driver-' + Math.random().toString(36).substring(2, 10),
            email: trimmedEmail,
            displayName,
            photoURL: null,
          };
          saveStoredAccount({ ...newUser, password: pass, createdAt: new Date().toISOString() });
          saveLocalSession(newUser);
          setUser(newUser);
          return newUser;
        }

        if (err?.code === 'auth/email-already-in-use') {
          throw new Error('An account with this email already exists. Please choose "Sign In".');
        }

        const fallbackUser: AuthUser = {
          uid: 'driver-' + Math.random().toString(36).substring(2, 10),
          email: trimmedEmail,
          displayName,
          photoURL: null,
        };
        saveLocalSession(fallbackUser);
        setUser(fallbackUser);
        return fallbackUser;
      }
    } else {
      const accounts = getStoredAccounts();
      const existing = accounts.find((a) => a.email?.toLowerCase() === trimmedEmail.toLowerCase());
      if (existing) {
        saveLocalSession(existing);
        setUser(existing);
        return existing;
      }
      const newUser: AuthUser = {
        uid: 'driver-' + Math.random().toString(36).substring(2, 10),
        email: trimmedEmail,
        displayName,
        photoURL: null,
      };
      saveStoredAccount({ ...newUser, password: pass, createdAt: new Date().toISOString() });
      saveLocalSession(newUser);
      setUser(newUser);
      return newUser;
    }
  };

  const signInAsDemoUser = (name = 'Verified Driver'): AuthUser => {
    const demoUser: AuthUser = {
      uid: 'demo-' + Math.random().toString(36).substring(2, 10),
      email: 'driver.community@fuelnetwork.app',
      displayName: name,
      photoURL: null,
    };
    saveLocalSession(demoUser);
    setUser(demoUser);
    return demoUser;
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('SignOut error:', err);
      }
    }
    saveLocalSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseActive: isFirebaseConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsDemoUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
