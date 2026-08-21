import { useState, useEffect, useCallback } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from '../lib/firebase';

export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  isGoogleUser: boolean;
  provider: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('msft_tracker_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const savedUserId = localStorage.getItem('msft_tracker_user_id') || 'lohendra_k';
    return {
      id: savedUserId,
      email: 'lohendra.k@gmail.com',
      displayName: 'Lohendra K',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      isGoogleUser: true,
      provider: 'google.com',
    };
  });

  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all registered SQL users from database
  const refreshUsersList = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setAvailableUsers(data.users);
        }
      }
    } catch (err) {
      console.warn('Could not fetch SQL users list:', err);
    }
  }, []);

  // Sync profile with backend server & SQL storage
  const syncToSqlStorage = useCallback(async (userData: Partial<UserProfile> & { id: string }) => {
    try {
      const res = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        const savedRecord: UserProfile = await res.json();
        setProfile(savedRecord);
        localStorage.setItem('msft_tracker_profile', JSON.stringify(savedRecord));
        localStorage.setItem('msft_tracker_user_id', savedRecord.id);
        await refreshUsersList();
        return savedRecord;
      }
    } catch (err) {
      console.warn('SQL User Sync failed:', err);
    }
    return null;
  }, [refreshUsersList]);

  // Listen to Firebase Auth state
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        setUser(firebaseUser);
        const newProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Google Learner'),
          photoURL: firebaseUser.photoURL,
          isGoogleUser: true,
          provider: 'google.com',
        };
        setProfile(newProfile);
        localStorage.setItem('msft_tracker_profile', JSON.stringify(newProfile));
        localStorage.setItem('msft_tracker_user_id', firebaseUser.uid);
        await syncToSqlStorage(newProfile);
      }
      setLoading(false);
    });

    refreshUsersList().finally(() => setLoading(false));

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [syncToSqlStorage, refreshUsersList]);

  // Sign in with Google (Firebase Auth + SQL sync + sandbox popup fallback)
  const signInWithGoogle = async (customEmail?: string, customName?: string) => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const newProfile: UserProfile = {
          id: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || 'Google Learner',
          photoURL: result.user.photoURL,
          isGoogleUser: true,
          provider: 'google.com',
        };
        setProfile(newProfile);
        localStorage.setItem('msft_tracker_profile', JSON.stringify(newProfile));
        localStorage.setItem('msft_tracker_user_id', result.user.uid);
        await syncToSqlStorage(newProfile);
        return newProfile;
      }
    } catch (error) {
      console.warn('Google Popup SignIn fallback activated:', (error as Error).message);
      const email = customEmail || 'lohendra.k@gmail.com';
      const name = customName || 'Lohendra K (Google)';
      const id = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      const newProfile: UserProfile = {
        id,
        email,
        displayName: name,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        isGoogleUser: true,
        provider: 'google.com',
      };

      const record = await syncToSqlStorage(newProfile);
      return record || newProfile;
    } finally {
      setLoading(false);
    }
  };

  // Sign in or create new SQL account
  const loginOrRegister = async (name: string, email?: string) => {
    setLoading(true);
    try {
      const cleanName = name.trim();
      const cleanEmail = email?.trim() || `${cleanName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
      const id = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_');

      const newProfile: UserProfile = {
        id,
        email: cleanEmail,
        displayName: cleanName,
        photoURL: null,
        isGoogleUser: cleanEmail.includes('gmail.com') || cleanEmail.includes('google'),
        provider: 'sql',
      };

      const record = await syncToSqlStorage(newProfile);
      return record || newProfile;
    } finally {
      setLoading(false);
    }
  };

  // Switch to an existing or custom SQL user
  const switchAccount = async (candidateId: string, name?: string, email?: string) => {
    setLoading(true);
    try {
      if (name) {
        const userRecord = await syncToSqlStorage({
          id: candidateId,
          displayName: name,
          email: email || null,
          photoURL: candidateId.includes('alex')
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
            : candidateId.includes('taylor')
            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
            : null,
          isGoogleUser: (email || '').includes('gmail.com') || (email || '').includes('google'),
          provider: 'sql',
        });
        return userRecord;
      }

      const res = await fetch(`/api/users/${encodeURIComponent(candidateId)}`);
      if (res.ok) {
        const userRecord: UserProfile = await res.json();
        setProfile(userRecord);
        localStorage.setItem('msft_tracker_profile', JSON.stringify(userRecord));
        localStorage.setItem('msft_tracker_user_id', userRecord.id);
        return userRecord;
      }
    } catch (err) {
      console.warn('Failed to switch SQL account:', err);
    } finally {
      setLoading(false);
    }
    return null;
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    const guestProfile: UserProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 8),
      email: null,
      displayName: 'Guest Candidate',
      photoURL: null,
      isGoogleUser: false,
      provider: 'anonymous',
    };
    await syncToSqlStorage(guestProfile);
  };

  return {
    user,
    profile,
    availableUsers,
    loading,
    signInWithGoogle,
    loginOrRegister,
    switchAccount,
    logout,
    refreshUsersList,
  };
}
