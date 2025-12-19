// SCRIPT DE TESTE - Execute no Console do navegador (F12)
// Para verificar se os dados existem no Firestore

// 1. TESTE: Verificar CNPJ
async function testeCNPJ() {
  const { identifyCnpj } = await import('./services/firebase.js');
  
  console.log('🔍 Testando CNPJ: 12345678000190');
  
  try {
    const result = await identifyCnpj('12345678000190');
    console.log('✅ Resultado:', result);
    
    if (result.exists) {
      console.log('✅ CNPJ encontrado!');
      console.log('Empresa:', result.company);
    } else {
      console.log('❌ CNPJ não encontrado no Firestore');
    }
  } catch (err) {
    console.error('❌ Erro ao buscar CNPJ:', err);
  }
}

// 2. TESTE: Verificar Usuário
async function testeUsuario() {
  const { checkUser } = await import('./services/firebase.js');
  
  console.log('🔍 Testando usuário: prestador1');
  
  try {
    const result = await checkUser('12345678000190', 'prestador1');
    console.log('✅ Resultado:', result);
    
    if (result.exists) {
      console.log('✅ Usuário encontrado!');
      console.log('Dados:', result.user);
      console.log('Role:', result.user.role);
      console.log('Senha armazenada:', result.user.password ? '✅ Sim' : '❌ Não');
    } else {
      console.log('❌ Usuário não encontrado no Firestore');
    }
  } catch (err) {
    console.error('❌ Erro ao buscar usuário:', err);
  }
}

// 3. TESTE: Login completo
async function testeLogin() {
  const { login } = await import('./services/firebase.js');
  
  console.log('🔍 Testando login completo');
  
  try {
    const result = await login({
      cnpj: '12345678000190',
      usuario: 'prestador1',
      senha: 'senha123'
    });
    
    console.log('✅ Login bem-sucedido!');
    console.log('Token:', result.token);
    console.log('Nome:', result.userName);
    console.log('CNPJ:', result.company.cnpj);
    console.log('User:', result.user);
  } catch (err) {
    console.error('❌ Erro no login:', err.message);
  }
}

// 4. TESTE: Listar todas as companies
async function listarCompanies() {
  const { db } = await import('./firebase/firebaseConfig.js');
  const { collection, getDocs } = await import('firebase/firestore');
  
  console.log('📋 Listando todas as companies no Firestore...');
  
  try {
    const companiesRef = collection(db, 'companies');
    const snapshot = await getDocs(companiesRef);
    
    console.log(`✅ Total de companies: ${snapshot.size}`);
    
    snapshot.forEach(doc => {
      console.log(`\n📊 Company ID: ${doc.id}`);
      console.log('Dados:', doc.data());
    });
    
    if (snapshot.size === 0) {
      console.log('❌ Nenhuma company encontrada! Você precisa criar dados de teste.');
    }
  } catch (err) {
    console.error('❌ Erro ao listar companies:', err);
  }
}

// 5. TESTE: Listar usuários de uma company
async function listarUsuarios(cnpj = '12345678000190') {
  const { db } = await import('./firebase/firebaseConfig.js');
  const { collection, getDocs } = await import('firebase/firestore');
  
  console.log(`📋 Listando usuários da company ${cnpj}...`);
  
  try {
    const usersRef = collection(db, 'companies', cnpj, 'users');
    const snapshot = await getDocs(usersRef);
    
    console.log(`✅ Total de usuários: ${snapshot.size}`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n👤 Usuário: ${data.username}`);
      console.log(`   Nome: ${data.displayName}`);
      console.log(`   Role: ${data.role}`);
      console.log(`   Active: ${data.active}`);
      console.log(`   Senha: ${data.password ? '✅ Definida' : '❌ Não definida'}`);
    });
    
    if (snapshot.size === 0) {
      console.log('❌ Nenhum usuário encontrado! Você precisa criar usuários de teste.');
    }
  } catch (err) {
    console.error('❌ Erro ao listar usuários:', err);
  }
}

// ========================================
// COMO USAR:
// ========================================
// 1. Abra o Console do navegador (F12)
// 2. Execute os comandos:

console.log(`
╔════════════════════════════════════════╗
║  🧪 TESTES FIREBASE - DASHBOARD       ║
╚════════════════════════════════════════╝

Execute os comandos abaixo para testar:

1️⃣ Listar companies:
   listarCompanies()

2️⃣ Listar usuários:
   listarUsuarios('12345678000190')

3️⃣ Testar CNPJ:
   testeCNPJ()

4️⃣ Testar usuário:
   testeUsuario()

5️⃣ Testar login:
   testeLogin()
`);

// Exportar funções globalmente
window.testeCNPJ = testeCNPJ;
window.testeUsuario = testeUsuario;
window.testeLogin = testeLogin;
window.listarCompanies = listarCompanies;
window.listarUsuarios = listarUsuarios;
