import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from '../services/firebase';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'steward' | 'scientist' | 'ranger' | 'admin';
  restorationActionsCount: number;
  createdAt: string;
  lastActiveAt: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  incrementRestorationActions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  incrementRestorationActions: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Sync/fetch profile
        const userRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
            // Update last active
            await setDoc(userRef, { lastActiveAt: new Date().toISOString() }, { merge: true });
          } else {
            const newProfile: UserProfile = {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Planetary Steward',
              photoURL: user.photoURL || undefined,
              role: 'steward',
              restorationActionsCount: 0,
              createdAt: new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.warn("Could not load user profile from Firestore:", err);
          // Set local fallback profile
          setProfile({
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Planetary Steward',
            photoURL: user.photoURL || undefined,
            role: 'steward',
            restorationActionsCount: 0,
            createdAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Sign-in failed", err);
      throw err;
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Sign-out failed", err);
      throw err;
    }
  };

  const incrementRestorationActions = async () => {
    if (!currentUser || !profile) return;
    const nextCount = (profile.restorationActionsCount || 0) + 1;
    setProfile(prev => prev ? { ...prev, restorationActionsCount: nextCount } : null);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { restorationActionsCount: nextCount }, { merge: true });
    } catch (err) {
      console.warn("Could not sync action count to Firestore:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        loading,
        signIn,
        signOut: handleSignOut,
        incrementRestorationActions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
