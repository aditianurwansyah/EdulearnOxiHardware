import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDVMVmDJxS9lemE8bwb9_aFRKpheJqE1QA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "edulearn-172f2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "edulearn-172f2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "edulearn-172f2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "769812862801",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:769812862801:web:f3a5054794a43b795ba570",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
