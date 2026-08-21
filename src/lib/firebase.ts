import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';

const env = (import.meta as any).env || {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBX20vMU23DjVM-deI_eGsOf447pQ_1eks",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "mic-learn.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "mic-learn",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "mic-learn.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "539043565271",
  appId: env.VITE_FIREBASE_APP_ID || "1:539043565271:web:7c4ce9a2ecd78dfc972a92",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-3M39M72NTX"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics conditionally (safe for SSR and restricted sandbox environments)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (err) {
        console.warn('Firebase Analytics initialization skipped:', err);
      }
    }
  }).catch(() => {});
}

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User 
};
