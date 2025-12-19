# 📱 Como Usar Login em 3 Etapas no App React Native

## 🎯 OBJETIVO

Implementar no seu app React Native **exatamente o mesmo fluxo de login** que você tem no dashboard web:

```
CNPJ → Usuário → Senha
```

---

## 🔍 COMO FUNCIONA NO SEU DASHBOARD WEB

### Estados (useState)
```javascript
const [cnpj, setCnpj] = useState("");
const [usuario, setUsuario] = useState("");
const [senha, setSenha] = useState("");
const [loginStage, setLoginStage] = useState(0); // 0: CNPJ, 1: Usuário, 2: Senha
const [erro, setErro] = useState("");
const [carregando, setCarregando] = useState(false);
```

### Etapa 0: Validar CNPJ
```javascript
// Usuário digita CNPJ e clica "Continuar"
const normalized = normalizeCnpj(cnpj); // Remove pontos, barras, hífen
const result = await firebaseService.identifyCnpj(normalized);

if (result.exists) {
  setLoginStage(1); // Avança para Etapa 1 (Usuário)
} else {
  setErro("CNPJ não encontrado");
}
```

### Etapa 1: Validar Usuário
```javascript
// Usuário digita nome de usuário e clica "Continuar"
const result = await firebaseService.checkUser(normalized, usuario);

if (result.exists) {
  // ✨ VALIDAÇÃO DE ROLE "PRESTADOR"
  if (result.user.role !== 'prestador') {
    setErro("Acesso negado. Apenas prestadores podem usar este app.");
    return; // NÃO avança
  }
  
  setLoginStage(2); // Avança para Etapa 2 (Senha)
} else {
  setErro("Usuário não encontrado");
}
```

### Etapa 2: Fazer Login
```javascript
// Usuário digita senha e clica "Entrar"
const result = await firebaseService.login({ cnpj, usuario, senha });

if (result.token) {
  // Salvar dados e navegar
  localStorage.setItem("authToken", result.token);
  localStorage.setItem("userName", result.userName);
  localStorage.setItem("companyCnpj", normalized);
  localStorage.setItem("userRole", "prestador");
  
  navigate("/dashboard");
} else {
  setErro("Senha incorreta");
}
```

---

## 📱 ADAPTANDO PARA REACT NATIVE

### 1. Estados (mesmo conceito, mesma lógica)

```javascript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebase from '../services/firebase'; // COPIAR DO WEB

export default function LoginScreen({ navigation }) {
  const [cnpj, setCnpj] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [step, setStep] = useState(1); // 1: CNPJ, 2: Usuário, 3: Senha
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // ... resto do código
}
```

### 2. Função de Normalizar CNPJ (copiar do web)

```javascript
// utils/cnpj.js (COPIAR DO WEB)
export function normalizeCnpj(cnpj) {
  return (cnpj || '').replace(/\D/g, ''); // Remove tudo que não é número
}

// No LoginScreen
import { normalizeCnpj } from '../utils/cnpj';
```

### 3. Etapa 1: Verificar CNPJ

```javascript
const handleCheckCnpj = async () => {
  try {
    setError('');
    setLoading(true);
    
    const normalized = normalizeCnpj(cnpj);
    const result = await firebase.identifyCnpj(normalized);
    
    if (result.exists) {
      setStep(2); // Avança para usuário
    } else {
      setError('CNPJ não encontrado');
    }
  } catch (err) {
    setError(err.message || 'Erro ao verificar CNPJ');
  } finally {
    setLoading(false);
  }
};
```

### 4. Etapa 2: Verificar Usuário + Role

```javascript
const handleCheckUser = async () => {
  try {
    setError('');
    setLoading(true);
    
    const normalized = normalizeCnpj(cnpj);
    const result = await firebase.checkUser(normalized, usuario);
    
    if (!result.exists) {
      setError('Usuário não encontrado');
      return;
    }
    
    // ✨ VALIDAÇÃO DE ROLE (IGUAL AO WEB)
    if (result.user.role !== 'prestador') {
      setError('Acesso negado. Apenas prestadores podem usar este app.');
      return; // NÃO avança
    }
    
    setStep(3); // Avança para senha
  } catch (err) {
    setError(err.message || 'Erro ao verificar usuário');
  } finally {
    setLoading(false);
  }
};
```

### 5. Etapa 3: Fazer Login

```javascript
const handleLogin = async () => {
  try {
    setError('');
    setLoading(true);
    
    const normalized = normalizeCnpj(cnpj);
    const result = await firebase.login({ cnpj: normalized, usuario, senha });
    
    if (result.token) {
      // Salvar dados (AsyncStorage ao invés de localStorage)
      await AsyncStorage.multiSet([
        ['authToken', result.token],
        ['userName', result.userName],
        ['companyCnpj', normalized],
        ['prestadorId', usuario],
        ['userRole', 'prestador']
      ]);
      
      // Navegar para tela principal
      navigation.replace('ServiceList');
    }
  } catch (err) {
    setError(err.message || 'Senha incorreta');
  } finally {
    setLoading(false);
  }
};
```

### 6. Renderização Condicional (3 telas em 1)

```jsx
return (
  <View style={styles.container}>
    <Text style={styles.title}>Login Prestador</Text>
    
    {/* ETAPA 1: CNPJ */}
    {step === 1 && (
      <View>
        <Text style={styles.label}>CNPJ da Empresa</Text>
        <TextInput
          style={styles.input}
          value={cnpj}
          onChangeText={setCnpj}
          placeholder="00.000.000/0000-00"
          keyboardType="numeric"
        />
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCheckCnpj}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verificando...' : 'Continuar'}
          </Text>
        </TouchableOpacity>
      </View>
    )}
    
    {/* ETAPA 2: USUÁRIO */}
    {step === 2 && (
      <View>
        <Text style={styles.label}>Usuário</Text>
        <TextInput
          style={styles.input}
          value={usuario}
          onChangeText={setUsuario}
          placeholder="Seu usuário"
        />
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCheckUser}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verificando...' : 'Continuar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStep(1)}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
      </View>
    )}
    
    {/* ETAPA 3: SENHA */}
    {step === 3 && (
      <View>
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          placeholder="Sua senha"
          secureTextEntry
        />
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStep(2)}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
      </View>
    )}
    
    {/* MENSAGEM DE ERRO */}
    {error && (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    )}
  </View>
);
```

---

## 📦 ARQUIVOS NECESSÁRIOS

### 1. Copiar `firebase.js` do Web para o App

```bash
# NO SEU PROJETO WEB
src/services/firebase.js

# COPIAR PARA O APP REACT NATIVE
src/services/firebase.js
```

Este arquivo já tem TODAS as funções:
- `identifyCnpj(cnpj)`
- `checkUser(cnpj, usuario)`
- `login({ cnpj, usuario, senha })`

### 2. Copiar `cnpj.js` do Web para o App

```bash
# NO SEU PROJETO WEB
src/utils/cnpj.js

# COPIAR PARA O APP REACT NATIVE
src/utils/cnpj.js
```

### 3. Copiar `firebaseConfig.js` do Web para o App

```bash
# NO SEU PROJETO WEB
src/firebase/firebaseConfig.js

# COPIAR PARA O APP REACT NATIVE
src/firebase/firebaseConfig.js
```

---

## 🔄 COMPARAÇÃO: WEB vs APP

| Aspecto | Dashboard Web | App React Native |
|---------|---------------|------------------|
| **Estados** | `useState` | `useState` (igual) |
| **Etapas** | `loginStage` (0, 1, 2) | `step` (1, 2, 3) |
| **Validação CNPJ** | `firebaseService.identifyCnpj()` | `firebase.identifyCnpj()` (mesma função) |
| **Validação Usuário** | `firebaseService.checkUser()` | `firebase.checkUser()` (mesma função) |
| **Validação Role** | ❌ Não tem no web | ✅ `role === 'prestador'` (app tem) |
| **Login** | `firebaseService.login()` | `firebase.login()` (mesma função) |
| **Armazenamento** | `localStorage.setItem()` | `AsyncStorage.setItem()` |
| **Navegação** | `navigate("/dashboard")` | `navigation.replace('ServiceList')` |
| **Formulário** | `<form onSubmit={}>` | `<TouchableOpacity onPress={}>` |
| **Input** | `<input>` | `<TextInput>` |
| **Botão** | `<button>` | `<TouchableOpacity>` |
| **Loading** | `{carregando ? <Loader /> : 'Entrar'}` | `{loading ? <ActivityIndicator /> : 'Entrar'}` |

---

## ✅ PASSOS PARA IMPLEMENTAR

### Passo 1: Copiar arquivos do Web
```bash
cp src/services/firebase.js ../app-prestador/src/services/
cp src/utils/cnpj.js ../app-prestador/src/utils/
cp src/firebase/firebaseConfig.js ../app-prestador/src/firebase/
```

### Passo 2: Instalar dependências no App
```bash
npm install firebase
npm install @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/stack
```

### Passo 3: Criar LoginScreen.jsx
Use o código completo do `PROMPT_LOGIN_FIREBASE.md` (já está pronto!)

### Passo 4: Testar com dados reais
```
CNPJ: 12.345.678/0001-90
Usuário: prestador1 (role: "prestador")
Senha: senha123
```

---

## 🎯 RESULTADO FINAL

Você terá **exatamente o mesmo fluxo** do dashboard web:

```
┌─────────────────────────────────────┐
│ 1. Usuário digita CNPJ              │
│    Clica "Continuar"                │
└────────────────┬────────────────────┘
                 │
                 ▼
    firebase.identifyCnpj(cnpj)
    ✓ CNPJ existe
                 │
                 ▼
┌─────────────────────────────────────┐
│ 2. Usuário digita nome de usuário   │
│    Clica "Continuar"                │
└────────────────┬────────────────────┘
                 │
                 ▼
    firebase.checkUser(cnpj, usuario)
    ✓ Usuário existe
    ✓ role === "prestador" ✨
                 │
                 ▼
┌─────────────────────────────────────┐
│ 3. Usuário digita senha             │
│    Clica "Entrar"                   │
└────────────────┬────────────────────┘
                 │
                 ▼
    firebase.login({ cnpj, usuario, senha })
    ✓ Autenticado
                 │
                 ▼
┌─────────────────────────────────────┐
│ Salva AsyncStorage                  │
│ Navega para ServiceList             │
└─────────────────────────────────────┘
```

---

## 💡 DICA FINAL

O código do `PROMPT_LOGIN_FIREBASE.md` que já criei **já implementa tudo isso**! 

É só:
1. Copiar os 3 arquivos (firebase.js, cnpj.js, firebaseConfig.js)
2. Copiar o código do LoginScreen.jsx do prompt
3. Testar com os dados de teste

**Está pronto para usar!** 🚀
