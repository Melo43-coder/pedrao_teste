// Firebase initialization file
// SECURITY: Credenciais agora carregadas de variáveis de ambiente
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🔐 SECURITY: Credenciais carregadas APENAS de variáveis de ambiente
// Configure o arquivo .env na raiz do projeto antes de executar
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validação: Verificar se todas as credenciais foram carregadas
const hasConfig = firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId;

if (!hasConfig) {
  console.warn('⚠️ AVISO: Credenciais do Firebase não configuradas!');
  console.warn('📋 Configure as variáveis de ambiente na Vercel');
  console.warn('🔧 Variáveis necessárias: REACT_APP_FIREBASE_*');
}

let app;
let auth;
let db;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  // Criar instâncias vazias para não quebrar a app
  auth = null;
  db = null;
}

export { app, auth, db };
