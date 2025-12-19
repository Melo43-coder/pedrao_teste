# 🔧 SOLUÇÃO: Erro 404 e 400 no Login

## ❌ Erros que Você Está Vendo

```
1. api/auth/login:1 - Failed 404 (Not Found)
   → Tentando chamar backend API que não existe

2. identitytoolkit.googleapis.com - Failed 400
   → Firebase Auth retornando erro (Email/Password desabilitado ou usuário não existe)
```

---

## 🎯 CAUSA DO PROBLEMA

Você está no **Dashboard Web** (não no app), e o código está tentando 2 coisas:

1. ❌ Chamar `api.login()` (backend não existe)
2. ❌ Chamar `firebaseService.login()` com Firebase Auth (não configurado)

---

## ✅ SOLUÇÃO RÁPIDA: Usar Fallback do Firestore

Seu `firebase.js` **JÁ TEM** um fallback que autentica direto pelo Firestore (sem precisar de Firebase Auth). Mas ele só funciona se o erro for `auth/operation-not-allowed`.

### Opção 1: Habilitar Firebase Auth (RECOMENDADO)

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione projeto `zillo-base`
3. Vá em **Authentication** → **Sign-in method**
4. Habilite **Email/Password**
5. Crie usuários no Firebase Auth:

```javascript
// No Firebase Console > Authentication > Users > Add User
Email: prestador1@12345678000190.local
Senha: senha123
```

### Opção 2: Usar Apenas Firestore (DESENVOLVIMENTO)

Modifique o `firebase.js` para **SEMPRE** usar o fallback do Firestore:

```javascript
// src/services/firebase.js
export async function login({ cnpj, usuario, senha }) {
  // ✨ PULAR FIREBASE AUTH - IR DIRETO PRO FIRESTORE
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  const usersRef = collection(db, 'companies', companyId, 'users');
  const q = query(usersRef, where('username', '==', usuario));
  const snap = await getDocs(q);
  
  if (snap.empty) throw new Error('Usuário não encontrado');
  
  const docData = snap.docs[0].data();
  
  // Comparar senha do Firestore
  if (docData.password && docData.password === senha) {
    const fakeToken = 'firestore-token-' + snap.docs[0].id;
    return { 
      token: fakeToken, 
      userName: docData.displayName || usuario, 
      company: { cnpj: companyId },
      user: docData
    };
  }
  
  throw new Error('Senha inválida');
}
```

### Opção 3: Criar Dados de Teste no Firestore

Certifique-se que você tem estes dados no Firebase:

```
Firestore Database:
  └─ companies/
      └─ 12345678000190/  (CNPJ normalizado)
          └─ users/
              └─ [doc-id]/
                  ├─ username: "prestador1"
                  ├─ password: "senha123"  ⚠️ plaintext (só dev)
                  ├─ displayName: "Prestador 1"
                  ├─ role: "prestador"
                  └─ active: true
```

---

## 🔥 SOLUÇÃO IMEDIATA: Modificar Login.jsx

Vou criar uma versão que usa **APENAS Firebase (sem API backend)**:

### Passo 1: Forçar uso do Firebase no Login

Abra `src/components/Sistema/Login.jsx` e encontre esta linha:

```javascript
const USE_FIREBASE = process.env.REACT_APP_USE_FIREBASE === 'true';
```

**Mude para:**

```javascript
const USE_FIREBASE = true; // ✨ SEMPRE usar Firebase
```

### Passo 2: Criar arquivo .env na raiz do projeto

```bash
# .env
REACT_APP_USE_FIREBASE=true
```

### Passo 3: Reiniciar o servidor

```bash
npm start
```

---

## 🧪 TESTE RÁPIDO: Verificar Dados no Firestore

Execute este código no Console do navegador (F12) depois de abrir o dashboard:

```javascript
// Testar conexão com Firestore
import { db } from './firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const testConnection = async () => {
  try {
    const companiesRef = collection(db, 'companies');
    const snapshot = await getDocs(companiesRef);
    
    console.log('✅ Firestore conectado!');
    console.log('📊 Companies encontradas:', snapshot.size);
    
    snapshot.forEach(doc => {
      console.log('Company:', doc.id, doc.data());
    });
  } catch (error) {
    console.error('❌ Erro:', error);
  }
};

testConnection();
```

---

## 📝 CRIAR USUÁRIO DE TESTE MANUALMENTE

Se você não tem dados no Firestore, crie assim:

### Via Firebase Console:

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Projeto: `zillo-base`
3. Firestore Database
4. Criar estrutura:

```
companies (collection)
  └─ 12345678000190 (document)
      ├─ name: "Empresa Teste"
      ├─ cnpj: "12345678000190"
      └─ users (subcollection)
          └─ (auto-id) (document)
              ├─ username: "prestador1"
              ├─ password: "senha123"
              ├─ displayName: "João Prestador"
              ├─ role: "prestador"
              ├─ active: true
              └─ email: "prestador1@12345678000190.local"
```

---

## 🚀 SOLUÇÃO DEFINITIVA (CÓDIGO)

Criar arquivo de configuração para desenvolvimento:

```javascript
// src/services/firebaseLoginDev.js
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

function normalizeCnpj(cnpj) {
  return (cnpj || '').replace(/\D/g, '');
}

export async function loginDev({ cnpj, usuario, senha }) {
  console.log('🔄 Login DEV mode (Firestore only)');
  
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  // Buscar usuário no Firestore
  const usersRef = collection(db, 'companies', companyId, 'users');
  const q = query(usersRef, where('username', '==', usuario));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    throw new Error('Usuário não encontrado. Verifique CNPJ e usuário.');
  }
  
  const userData = snap.docs[0].data();
  
  // Validar role (apenas prestador)
  if (userData.role !== 'prestador') {
    throw new Error('Acesso negado. Apenas prestadores podem acessar.');
  }
  
  // Validar senha
  if (!userData.password || userData.password !== senha) {
    throw new Error('Senha incorreta');
  }
  
  // Retornar dados do login
  return {
    token: 'dev-token-' + snap.docs[0].id,
    userName: userData.displayName || usuario,
    company: { cnpj: companyId },
    user: userData
  };
}
```

### Usar no Login.jsx:

```javascript
import { loginDev } from '../../services/firebaseLoginDev';

// No handleLogin:
const handleLogin = e => {
  e.preventDefault();
  setCarregando(true);
  
  loginDev({ cnpj, usuario, senha })
    .then(result => {
      // Salvar e navegar
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userName', result.userName);
      localStorage.setItem('companyCnpj', normalizeCnpj(cnpj));
      localStorage.setItem('userRole', 'prestador');
      
      navigate('/dashboard');
    })
    .catch(err => {
      setErro(err.message);
    })
    .finally(() => setCarregando(false));
};
```

---

## 🎯 RESUMO: O Que Fazer AGORA

1. **Abrir `.env`** e adicionar:
   ```
   REACT_APP_USE_FIREBASE=true
   ```

2. **Verificar se existe dados no Firestore**:
   - Firebase Console → Firestore Database
   - Verificar se existe `companies/12345678000190/users`

3. **Se NÃO existir, criar manualmente** (instruções acima)

4. **Reiniciar o servidor**:
   ```bash
   npm start
   ```

5. **Testar login**:
   - CNPJ: `12.345.678/0001-90`
   - Usuário: `prestador1`
   - Senha: `senha123`

---

## 🔍 DEBUG: Ver o que está acontecendo

Adicione logs no `firebase.js`:

```javascript
export async function login({ cnpj, usuario, senha }) {
  console.log('🔄 Tentando login:', { cnpj, usuario });
  
  const email = makeEmail(cnpj, usuario);
  console.log('📧 Email gerado:', email);
  
  try {
    console.log('🔥 Tentando Firebase Auth...');
    const res = await signInWithEmailAndPassword(auth, email, senha);
    console.log('✅ Firebase Auth sucesso!');
    // ... resto
  } catch (err) {
    console.log('❌ Firebase Auth falhou:', err.code);
    console.log('🔄 Tentando Firestore fallback...');
    
    // Fallback...
  }
}
```

Isso vai mostrar **exatamente onde está falhando** no Console do navegador (F12).

---

## 💡 Qual opção escolher?

- **Produção**: Opção 1 (Firebase Auth + Firestore)
- **Desenvolvimento rápido**: Opção 2 (Só Firestore)
- **Teste rápido**: Opção 3 (Dados manuais + .env)

Me diga qual erro específico aparece no Console do navegador e eu te ajudo a resolver! 🚀
