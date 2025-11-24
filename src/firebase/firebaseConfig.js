// Firebase initialization file
// Fill environment variables in a .env file at project root
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA8mAsIZ7bQ2xhwIDPnsLpMz4dRcuE3ea4",
  authDomain: "zillo-base.firebaseapp.com",
  projectId: "zillo-base",
  storageBucket: "zillo-base.firebasestorage.app",
  messagingSenderId: "641837955093",
  appId: "1:641837955093:web:d83905d97c936608a6361c",
  measurementId: "G-KGKBM763D5"
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
