
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is not set');
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialisation de l'application
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialisation de l'Auth
export const auth = getAuth(app);

// Initialisation de Firestore avec configuration spécifique pour éviter les erreurs de connexion
// experimentalForceLongPolling est crucial pour les environnements de développement cloud
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
