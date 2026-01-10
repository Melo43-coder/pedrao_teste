// Firebase initialization file
// SECURITY: Credenciais agora carregadas de variáveis de ambiente
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyA8mAsIZ7bQ2xhwIDPnsLpMz4dRcuE3ea4",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "zillo-base.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "zillo-base",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "zillo-base.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "641837955093",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:641837955093:web:d83905d97c936608a6361c",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-KGKBM763D5"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
