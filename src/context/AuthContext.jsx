import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import { auth, database } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AUTH_STORAGE_KEY = 'verby_auth_user';

const getUserProfileFromDB = async (uid) => {
  const userRef = ref(database, `users/${uid}/profile`);
  const snapshot = await get(userRef);
  return snapshot.exists() ? snapshot.val() : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem(AUTH_STORAGE_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await ensureUserDocument(firebaseUser);
        const profileData = await getUserProfileFromDB(firebaseUser.uid);
        
        const userData = {
          uid: firebaseUser.uid,
          displayName: profileData?.displayName || firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: profileData?.photoURL || firebaseUser.photoURL,
        };
        setUser(userData);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const ensureUserDocument = async (firebaseUser) => {
    const userRef = ref(database, `users/${firebaseUser.uid}`);
    const snapshot = await get(userRef);

    // Placeholder to ensure empty objects/folders are visible in Firebase UI
    const PLACEHOLDER = { _initialized: true };

    if (!snapshot.exists()) {
      // NEW USER INITIALIZATION
      await set(userRef, {
        profile: {
          displayName: firebaseUser.displayName || 'Anonymous',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || '',
          createdAt: Date.now(),
          lastLogin: Date.now(),
          country: 'Not Set',
          role: 'user',
          languages: { default: 'en' }, // Objects are safer than arrays in RTDB
          bio: '',
        },
        stats: {
          blitz: { rating: 1200, games: 0, wins: 0, losses: 0, rank: 'Unranked' },
          duels: { rating: 1200, games: 0, wins: 0, losses: 0, rank: 'Unranked' },
          mastery: { rating: 1200, games: 0, wins: 0, losses: 0, rank: 'Unranked' },
          daily: { rating: 1200, games: 0, streak: 0, lastPlayed: 0 },
        },
        ratingHistory: {
          [new Date().toISOString().split('T')[0]]: { blitz: 1200, duels: 1200, mastery: 1200 },
        },
        settings: {
          theme: 'light',
          notifications: true,
          soundEffects: true,
        },
        achievements: {
          totalGames: 0,
          totalWins: 0,
          longestStreak: 0,
          badges: PLACEHOLDER,
        },
        verbProgress: {
          irregulars: { learned: 0, total: 0 },
          subjunctive: { learned: 0, total: 0 },
          conditional: { learned: 0, total: 0 },
        },
        gameHistory: {
          blitz: PLACEHOLDER,
          duels: PLACEHOLDER,
          mastery: PLACEHOLDER,
          daily: PLACEHOLDER,
        },
      });
    } else {
      // EXISTING USER: Update last login and check for missing gameHistory
      await update(ref(database, `users/${firebaseUser.uid}/profile`), {
        lastLogin: Date.now()
      });
      
      const gameHistoryRef = ref(database, `users/${firebaseUser.uid}/gameHistory`);
      const gameHistorySnapshot = await get(gameHistoryRef);
      
      // If history node was deleted or never created, add it now
      if (!gameHistorySnapshot.exists()) {
        await set(gameHistoryRef, {
          blitz: PLACEHOLDER,
          duels: PLACEHOLDER,
          mastery: PLACEHOLDER,
          daily: PLACEHOLDER,
        });
      }
    }
  };

  const updateCachedUser = (updates) => {
    const cached = localStorage.getItem(AUTH_STORAGE_KEY);
    if (cached) {
      const userData = JSON.parse(cached);
      const updatedUser = { ...userData, ...updates };
      setUser(updatedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    } else {
      setUser(prev => prev ? { ...prev, ...updates } : updates);
    }
  };

  const value = { user, loading, updateCachedUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};