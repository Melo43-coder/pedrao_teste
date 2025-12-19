# 🔐 PROMPT COMPLETO - LOGIN no App de Prestadores (Firebase Real)

## 🎯 O QUE VOCÊ PRECISA FAZER

Implementar um **LoginScreen** no seu app React Native que:
1. ✅ Consulta o **CNPJ** (identifyCnpj)
2. ✅ Valida o **Usuário** (checkUser)
3. ✅ **🔐 VALIDA QUE O USUÁRIO TEM ROLE "PRESTADOR"**
4. ✅ Faz **Login** com as credenciais
5. ✅ **USA AS MESMAS CONFIGURAÇÕES DO FIREBASE** (firebaseConfig.js)

---

## 🔐 IMPORTANTE: RESTRIÇÃO DE ACESSO POR ROLE

**Este app só pode ser acessado por usuários com role "prestador"**

- Se o usuário tem role `admin`, `user`, ou qualquer outro: **acesso negado**
- Se o usuário tem role `prestador`: **acesso permitido**
- A validação acontece na **PASSO 2** (verificação de usuário)
- Se falhar na validação: **voltar na tela de usuário com mensagem de erro**

---

## 📋 CONFIGURAÇÃO DO FIREBASE

### Seu Firebase Config (Use EXATAMENTE assim):

```javascript
// firebaseConfig.js
const firebaseConfig = {
  apiKey: "AIzaSyA8mAsIZ7bQ2xhwIDPnsLpMz4dRcuE3ea4",
  authDomain: "zillo-base.firebaseapp.com",
  projectId: "zillo-base",
  storageBucket: "zillo-base.firebasestorage.app",
  messagingSenderId: "641837955093",
  appId: "1:641837955093:web:d83905d97c936608a6361c",
  measurementId: "G-KGKBM763D5"
};
```

**Copie exatamente este config para seu projeto React Native!**

---

## 🔑 DADOS DE TESTE

Use estes dados para testar o login:

```
CNPJ:    12.345.678/0001-90  (ou 12345678000190 - apenas números)
Usuário: prestador1
Senha:   senha123
```

Esses dados já existem no seu Firebase!

---

## 📱 STEP-BY-STEP: Implementar LoginScreen

### PASSO 1: Criar firebaseConfig.js no seu projeto

```javascript
// src/firebase/firebaseConfig.js
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
```

---

### PASSO 2: Copiar firebase.js do seu projeto web

```javascript
// src/services/firebase.js
// COPIE EXATAMENTE DO ARQUIVO DO SEU PROJETO WEB
// c:\Users\caiqu\Downloads\pedrao-sintaxe\pedrao_teste\src\services\firebase.js

// Este arquivo já tem TODAS as funções que você precisa:
// - identifyCnpj()
// - checkUser()
// - login()
```

---

### PASSO 3: Criar LoginScreen.jsx

```jsx
// src/screens/LoginScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as firebase from '../services/firebase';

export default function LoginScreen({ navigation }) {
  const [cnpj, setCnpj] = useState('12.345.678/0001-90'); // Pré-preenchido para teste
  const [usuario, setUsuario] = useState('prestador1');    // Pré-preenchido para teste
  const [senha, setSenha] = useState('senha123');          // Pré-preenchido para teste
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: CNPJ, 2: Usuário, 3: Senha
  const [error, setError] = useState('');

  // Normalizar CNPJ (remover caracteres especiais)
  const normalizeCnpj = (value) => {
    return value.replace(/\D/g, ''); // Remove tudo que não é número
  };

  // Formatar CNPJ para exibição
  const formatCnpj = (value) => {
    const clean = value.replace(/\D/g, '');
    if (clean.length <= 2) return clean;
    if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
    if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
    if (clean.length <= 12) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
    return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12, 14)}`;
  };

  // PASSO 1: Verificar CNPJ
  const handleCheckCnpj = async () => {
    try {
      setError('');
      setLoading(true);

      if (!cnpj.trim()) {
        setError('Informe o CNPJ');
        return;
      }

      const normalizedCnpj = normalizeCnpj(cnpj);

      // Chamar firebase.identifyCnpj()
      const result = await firebase.identifyCnpj(normalizedCnpj);

      if (!result.exists) {
        setError('CNPJ não encontrado. Verifique e tente novamente.');
        return;
      }

      console.log('✅ CNPJ encontrado:', result.company);

      // Ir para PASSO 2
      setStep(2);
      setError('');
    } catch (err) {
      console.error('❌ Erro ao verificar CNPJ:', err);
      setError(err.message || 'Erro ao verificar CNPJ');
    } finally {
      setLoading(false);
    }
  };

  // PASSO 2: Verificar Usuário
  const handleCheckUser = async () => {
    try {
      setError('');
      setLoading(true);

      if (!usuario.trim()) {
        setError('Informe o usuário');
        return;
      }

      const normalizedCnpj = normalizeCnpj(cnpj);

      // Chamar firebase.checkUser()
      const result = await firebase.checkUser(normalizedCnpj, usuario);

      if (!result.exists) {
        setError('Usuário não encontrado. Verifique o nome de usuário.');
        return;
      }

      // ✨ VALIDAÇÃO: Verificar se o usuário tem role "prestador"
      if (result.user.role !== 'prestador') {
        setError('Acesso negado. Apenas prestadores podem usar este app.');
        return;
      }

      console.log('✅ Usuário encontrado (prestador):', result.user);

      // Ir para PASSO 3
      setStep(3);
      setError('');
    } catch (err) {
      console.error('❌ Erro ao verificar usuário:', err);
      setError(err.message || 'Erro ao verificar usuário');
    } finally {
      setLoading(false);
    }
  };

  // PASSO 3: Fazer Login
  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);

      if (!senha.trim()) {
        setError('Informe a senha');
        return;
      }

      const normalizedCnpj = normalizeCnpj(cnpj);

      // Chamar firebase.login()
      const result = await firebase.login({
        cnpj: normalizedCnpj,
        usuario: usuario,
        senha: senha
      });

      console.log('✅ Login bem-sucedido!', result);

      // Guardar dados importantes
      await AsyncStorage.multiSet([
        ['token', result.token],
        ['userName', result.userName],
        ['companyCnpj', result.company.cnpj],
        ['prestadorId', usuario],
        ['userRole', 'prestador'] // ✨ Guardar que é prestador
      ]);

      // Navegação bem-sucedida
      Alert.alert('Sucesso', `Bem-vindo ${result.userName}!`);
      navigation.replace('ServiceList'); // Ir para tela de listagem de OS

    } catch (err) {
      console.error('❌ Erro no login:', err);
      setError(err.message || 'Falha ao fazer login. Verifique a senha.');
    } finally {
      setLoading(false);
    }
  };

  // Voltar um passo
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>🔐 Login Prestador</Text>
          <Text style={styles.subtitle}>
            Acesso ao Sistema SmartOps
          </Text>
        </View>

        {/* PASSO 1: CNPJ */}
        {step >= 1 && (
          <View style={[styles.section, step === 1 ? styles.activeSectionBorder : {}]}>
            <Text style={styles.label}>CNPJ da Empresa</Text>
            <TextInput
              style={[styles.input, step > 1 && styles.inputDisabled]}
              placeholder="XX.XXX.XXX/XXXX-XX"
              value={cnpj}
              onChangeText={(text) => setCnpj(formatCnpj(text))}
              editable={step === 1}
              keyboardType="numeric"
            />
            {step === 1 && (
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleCheckCnpj}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Continuar →</Text>
                )}
              </TouchableOpacity>
            )}
            {step > 1 && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓ Verificado</Text>
              </View>
            )}
          </View>
        )}

        {/* PASSO 2: USUÁRIO */}
        {step >= 2 && (
          <View style={[styles.section, step === 2 ? styles.activeSectionBorder : {}]}>
            <Text style={styles.label}>Usuário</Text>
            <TextInput
              style={[styles.input, step > 2 && styles.inputDisabled]}
              placeholder="Nome de usuário"
              value={usuario}
              onChangeText={setUsuario}
              editable={step === 2}
            />
            {step === 2 && (
              <View style={styles.twoButtonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary, { flex: 1 }]}
                  onPress={handleBack}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>← Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled, { flex: 1, marginLeft: 10 }]}
                  onPress={handleCheckUser}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Continuar →</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
            {step > 2 && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓ Verificado</Text>
              </View>
            )}
          </View>
        )}

        {/* PASSO 3: SENHA */}
        {step >= 3 && (
          <View style={[styles.section, step === 3 ? styles.activeSectionBorder : {}]}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
            <View style={styles.twoButtonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, { flex: 1 }]}
                onPress={handleBack}
                disabled={loading}
              >
                <Text style={styles.buttonText}>← Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled, { flex: 1, marginLeft: 10 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Acessar 🚀</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MENSAGEM DE ERRO */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* INFO DESENVOLVIMENTO */}
        <View style={styles.devInfo}>
          <Text style={styles.devInfoText}>
            Para testar use:{'\n'}
            CNPJ: 12.345.678/0001-90{'\n'}
            Usuário: prestador1{'\n'}
            Senha: senha123
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  header: {
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeSectionBorder: {
    borderColor: '#0ea5e9',
    borderWidth: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: '#1e293b',
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#64748b',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  twoButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmark: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#22c55e',
    fontWeight: '600',
    fontSize: 14,
  },
  errorContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
  },
  devInfo: {
    marginTop: 'auto',
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  devInfoText: {
    fontSize: 11,
    color: '#92400e',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
```

---

## 🔄 FLUXO DO LOGIN

```
┌─────────────────────────────────────┐
│ Usuário insere CNPJ                │
│ Clica "Continuar"                   │
└────────────────┬────────────────────┘
                 │
                 ▼
    firebase.identifyCnpj(cnpj)
    ✓ CNPJ existe no Firebase
                 │
                 ▼
┌─────────────────────────────────────┐
│ Usuário insere Nome de Usuário      │
│ Clica "Continuar"                   │
└────────────────┬────────────────────┘
                 │
                 ▼
    firebase.checkUser(cnpj, usuario)
    ✓ Usuário existe na empresa
                 │
                 ▼
    🔐 Valida: user.role === "prestador"
    ✓ Usuário é prestador (pode acessar)
                 │
                 ▼
┌─────────────────────────────────────┐
│ Usuário insere Senha                │
│ Clica "Acessar"                     │
└────────────────┬────────────────────┘
                 │
                 ▼
    firebase.login({ cnpj, usuario, senha })
    ✓ Autenticado com sucesso
                 │
                 ▼
┌─────────────────────────────────────┐
│ Guardar:                            │
│ - token                             │
│ - userName                          │
│ - companyCnpj                       │
│ - prestadorId                       │
│ - userRole (prestador)              │
│                                     │
│ Navegar para ServiceListScreen      │
└─────────────────────────────────────┘
```

---

## 📲 INTEGRAÇÃO COM SEU APP

### No seu App.js ou RootNavigator:

```jsx
import LoginScreen from './screens/LoginScreen';
import ServiceListScreen from './screens/ServiceListScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ServiceList"
          component={ServiceListScreen}
          options={{ headerShown: false }}
        />
        {/* ... outras telas */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 🧪 TESTES

### Teste 1: Login com Dados Válidos (Prestador)
```
CNPJ:    12.345.678/0001-90
Usuário: prestador1 (role: "prestador")
Senha:   senha123

Esperado: ✅ Login bem-sucedido
         ✅ Validação de role "prestador" passa
         ✅ Navega para ServiceListScreen
         ✅ Token salvo em localStorage
         ✅ userRole: "prestador" salvo
```

### Teste 2: Login com Usuário que NÃO é Prestador
```
CNPJ:    12.345.678/0001-90
Usuário: admin (role: "admin" ou "user")
Senha:   senha_correta

Esperado: ❌ Mensagem "Acesso negado. Apenas prestadores podem usar este app."
         ❌ Fica na tela de Usuário
         ❌ NÃO avança para Senha
```

### Teste 3: CNPJ Inválido
```
CNPJ:    99.999.999/9999-99

Esperado: ❌ Mensagem "CNPJ não encontrado"
         ❌ Fica na tela de CNPJ
```

### Teste 4: Usuário Inexistente
```
CNPJ:    12.345.678/0001-90
Usuário: usuario_inexistente

Esperado: ❌ Mensagem "Usuário não encontrado"
         ❌ Fica na tela de Usuário
```

### Teste 5: Senha Incorreta
```
CNPJ:    12.345.678/0001-90
Usuário: prestador1
Senha:   senha_errada

Esperado: ❌ Mensagem "Credenciais inválidas"
         ❌ Fica na tela de Senha
```

---

## 📦 DEPENDÊNCIAS NECESSÁRIAS

```bash
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install firebase
npm install @react-native-async-storage/async-storage
```

---

## 💾 GUARDAR DADOS APÓS LOGIN

```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Após login bem-sucedido:
await AsyncStorage.multiSet([
  ['token', result.token],
  ['userName', result.userName],
  ['companyCnpj', result.company.cnpj],
  ['prestadorId', usuario],
  ['userRole', 'prestador'], // ✨ APENAS PRESTADORES CHEGAM AQUI
  ['loginTime', new Date().toISOString()]
]);
```

---

## 🔑 RECUPERAR DADOS EM OUTRAS TELAS

```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Em qualquer tela:
const getLoginData = async () => {
  const token = await AsyncStorage.getItem('token');
  const userName = await AsyncStorage.getItem('userName');
  const companyCnpj = await AsyncStorage.getItem('companyCnpj');
  const prestadorId = await AsyncStorage.getItem('prestadorId');
  const userRole = await AsyncStorage.getItem('userRole');
  
  return { token, userName, companyCnpj, prestadorId, userRole };
};

// Usar em useEffect:
useEffect(() => {
  const loadData = async () => {
    const data = await getLoginData();
    console.log('Dados do login:', data);
    
    // ✨ Validação: Garanta que é prestador
    if (data.userRole !== 'prestador') {
      // Navegar de volta para login
      navigation.replace('Login');
    }
  };
  loadData();
}, []);
```

---

## 🚀 PRÓXIMO PASSO

Depois que o login estiver funcionando:

1. ✅ Criar **ServiceListScreen** para ver as OS
2. ✅ Implementar **Carregar OS do Firebase**
3. ✅ Criar **Aceitar OS** (updateServiceOrder)
4. ✅ Implementar **Chat**
5. ✅ Implementar **3 Etapas de execução**

---

## 🎯 RESULTADO

Você terá um LoginScreen que:

```
✅ Consulta CNPJ no Firebase
✅ Valida usuário da empresa
✅ 🔐 VALIDA QUE O USUÁRIO TEM ROLE "PRESTADOR"
✅ Rejeita acesso para usuários que não são prestadores
✅ Faz autenticação com Firebase Auth
✅ Usa EXATAMENTE as mesmas credenciais do seu Dashboard web
✅ Salva dados para usar nas outras telas
✅ Navega para tela de OS após login bem-sucedido
```

**Agora somente prestadores podem acessar o app!** 🔐🚀

---

**Bora implementar!** 🚀

