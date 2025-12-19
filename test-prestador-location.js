/**
 * Script de teste para adicionar localização de prestadores no Firebase
 * Execute: node test-prestador-location.js
 */

const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = {
  "type": "service_account",
  "project_id": "zillo-base",
  "private_key_id": "YOUR_PRIVATE_KEY_ID",
  "private_key": "YOUR_PRIVATE_KEY",
  "client_email": "YOUR_CLIENT_EMAIL",
  "client_id": "YOUR_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "YOUR_CERT_URL"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addTestLocations() {
  try {
    const cnpj = '12345678000190'; // Seu CNPJ de teste
    
    // Prestador 1 - João Silva
    await db.collection('companies').doc(cnpj).collection('prestadoresLocation').doc('prestador1').set({
      prestadorId: 'prestador1',
      nome: 'João Silva',
      latitude: -23.5505, // São Paulo - região central
      longitude: -46.6333,
      timestamp: new Date().toISOString(),
      osAtual: '#12345',
      velocidade: 45,
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Prestador 1 adicionado');

    // Prestador 2 - Maria Santos
    await db.collection('companies').doc(cnpj).collection('prestadoresLocation').doc('prestador2').set({
      prestadorId: 'prestador2',
      nome: 'Maria Santos',
      latitude: -23.5489, // São Paulo - próximo ao prestador 1
      longitude: -46.6388,
      timestamp: new Date().toISOString(),
      osAtual: '#12346',
      velocidade: 30,
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Prestador 2 adicionado');

    // Prestador 3 - Pedro Oliveira
    await db.collection('companies').doc(cnpj).collection('prestadoresLocation').doc('prestador3').set({
      prestadorId: 'prestador3',
      nome: 'Pedro Oliveira',
      latitude: -23.5610, // São Paulo - região sul
      longitude: -46.6560,
      timestamp: new Date().toISOString(),
      osAtual: null, // Sem OS no momento
      velocidade: 0,
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Prestador 3 adicionado');

    console.log('\n🎉 Todas as localizações de teste foram adicionadas!');
    console.log('📍 Abra o Dashboard e veja os prestadores no mapa.');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar localizações:', error);
  }
}

addTestLocations();
