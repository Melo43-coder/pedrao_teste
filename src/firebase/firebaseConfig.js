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
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('❌ ERRO: Credenciais do Firebase não configuradas!');
  console.error('📋 Configure o arquivo .env com as variáveis REACT_APP_FIREBASE_*');
  console.error('💡 Copie o arquivo .env.example para .env e preencha os valores');
}

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
