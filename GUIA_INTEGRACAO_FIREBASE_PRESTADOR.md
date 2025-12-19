# 🔧 GUIA RÁPIDO - Integração Firebase no App de Prestadores

## 📌 O QUE JÁ EXISTE (Use isso!)

O seu projeto web já possui **100% da integração Firebase pronta**. Você não precisa recriar nada!

### Arquivo-Chave: `src/services/firebase.js`

Este arquivo contém TODAS as funções que você precisa para o app de prestadores:

```javascript
// AUTENTICAÇÃO
firebase.identifyCnpj(cnpj)                          // ✅ Pronto
firebase.checkUser(cnpj, usuario)                    // ✅ Pronto
firebase.login({ cnpj, usuario, senha })            // ✅ Pronto

// ORDENS DE SERVIÇO
firebase.listServiceOrders(companyCnpj)              // ✅ Pronto
firebase.getServiceOrder(companyCnpj, osId)         // ✅ Pronto
firebase.createServiceOrder(companyCnpj, data)      // ✅ Pronto
firebase.updateServiceOrder(companyCnpj, osId, upd) // ✅ Pronto

// CHAT
firebase.createChat(companyCnpj, data)              // ✅ Pronto
firebase.listMessages(companyCnpj, chatId)          // ✅ Pronto
firebase.sendMessage(companyCnpj, chatId, msg)      // ✅ Pronto

// USUÁRIOS
firebase.listCompanyUsers(companyCnpj)              // ✅ Pronto
firebase.updateUser(companyCnpj, userId, updates)   // ✅ Pronto

// NOTIFICAÇÕES
firebase.notifyAllUsers(companyCnpj, notif)         // ✅ Pronto

// AVALIAÇÕES
firebase.saveSatisfactionRating(cnpj, rating)       // ✅ Pronto
```

---

## 🚀 PASSO 1: Copiar Firebase para seu App

### Option A: Via Symlink (Recomendado)
```bash
# No seu projeto React Native
cd prestador-app/src/services/
ln -s ../../pedrao_teste/src/services/firebase.js firebase.js

# Assim você reutiliza o arquivo original e mudanças são automáticas
```

### Option B: Via Cópia
```bash
cp pedrao_teste/src/services/firebase.js prestador-app/src/services/firebase.js
```

---

## 📋 PASSO 2: Carregar OS do Firebase (Exemplo Real)

### Tela de Listagem (ServiceListScreen.jsx)
```jsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import * as firebase from '../services/firebase';
import OSCard from '../components/OSCard';

export default function ServiceListScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dados salvos no login
  const companyCnpj = localStorage.getItem('companyCnpj');
  const prestadorId = localStorage.getItem('prestadorId');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // CARREGA AS OS REAIS DO FIREBASE!
      const allOrders = await firebase.listServiceOrders(companyCnpj);
      
      // Filtra apenas as disponíveis (não aceitas por ninguém)
      const available = allOrders.filter(order => 
        order.status === 'PENDENTE' && !order.prestadorId
      );
      
      setOrders(available);
    } catch (error) {
      console.error('Erro ao carregar OS:', error);
      alert('Erro ao carregar ordens de serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (order) => {
    try {
      // 1. ATUALIZA NO FIREBASE
      await firebase.updateServiceOrder(companyCnpj, order.id, {
        status: 'ACEITA',
        prestadorId: prestadorId,
        aceitaEm: new Date().toISOString()
      });

      // 2. CRIA CHAT AUTOMÁTICO
      const chat = await firebase.createChat(companyCnpj, {
        osId: order.id,
        prestadorId: prestadorId,
        clienteTelefone: order.cliente.telefone,
        assunto: `OS #${order.id} - ${order.tipoServico}`
      });

      // 3. NAVEGA PARA MAPA/ROTA
      navigation.navigate('Navigation', {
        orderId: order.id,
        chatId: chat.id,
        destination: order.endereco
      });

    } catch (error) {
      console.error('Erro ao aceitar OS:', error);
      alert('Erro ao aceitar ordem de serviço');
    }
  };

  if (loading) return <View style={styles.center}><Text>Carregando...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhuma OS disponível no momento</Text>
        </View>
      ) : (
        orders.map(order => (
          <OSCard
            key={order.id}
            order={order}
            onAccept={() => handleAccept(order)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { paddingTop: 100, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#64748b' }
});
```

---

## 🗺️ PASSO 3: Atualizar Status Durante Execução

### Service Execution (ServiceExecutionScreen.jsx)
```jsx
import React, { useState } from 'react';
import * as firebase from '../services/firebase';

export default function ServiceExecutionScreen({ route }) {
  const { orderId } = route.params;
  const companyCnpj = localStorage.getItem('companyCnpj');
  const prestadorId = localStorage.getItem('prestadorId');

  // Atualizar quando passa de etapa
  const handleNextStage = async (currentStage, stageData) => {
    try {
      // Salvar dados da etapa atual
      const updateData = {
        [`etapa${currentStage}`]: stageData,
        status: `ETAPA${currentStage + 1}`
      };

      await firebase.updateServiceOrder(companyCnpj, orderId, updateData);
      
      // Navegar para próxima etapa
      navigation.navigate('Stage', { stage: currentStage + 1 });
      
    } catch (error) {
      console.error('Erro ao salvar etapa:', error);
      alert('Erro ao salvar progresso');
    }
  };

  // Finalizar serviço
  const handleFinalize = async (finalData) => {
    try {
      await firebase.updateServiceOrder(companyCnpj, orderId, {
        etapa3: finalData,
        status: 'CONCLUIDA',
        finalizadaEm: new Date().toISOString()
      });

      // Notificar central
      await firebase.notifyAllUsers(companyCnpj, {
        tipo: 'OS_CONCLUIDA',
        osId: orderId,
        mensagem: `OS #${orderId} foi concluída por ${prestadorId}`,
        dados: { osId: orderId, prestadorId }
      });

      // Voltar para listagem
      navigation.navigate('List');
      alert('Serviço finalizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao finalizar:', error);
      alert('Erro ao finalizar serviço');
    }
  };

  // ... resto do componente
}
```

---

## 💬 PASSO 4: Usar Chat em Tempo Real

### Chat Component (ChatScreen.jsx)
```jsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, Button } from 'react-native';
import * as firebase from '../services/firebase';

export default function ChatScreen({ route }) {
  const { chatId, osId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const companyCnpj = localStorage.getItem('companyCnpj');
  const prestadorId = localStorage.getItem('prestadorId');

  useEffect(() => {
    loadMessages();
    // Opcional: real-time listener para novas mensagens
  }, [chatId]);

  const loadMessages = async () => {
    try {
      const msgs = await firebase.listMessages(companyCnpj, chatId);
      setMessages(msgs);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await firebase.sendMessage(companyCnpj, chatId, {
        sender: 'prestador',
        prestadorId: prestadorId,
        text: newMessage,
        timestamp: new Date().toISOString(),
        read: false
      });

      setNewMessage('');
      loadMessages(); // Recarregar para ver a mensagem enviada
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={msg => msg.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#e2e8f0' }}>
            <Text style={{ fontWeight: 'bold' }}>
              {item.sender === 'prestador' ? 'Você' : 'Central'}
            </Text>
            <Text>{item.text}</Text>
            <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
      />
      
      <View style={{ padding: 10, borderTopWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row' }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: '#e2e8f0', padding: 8, marginRight: 10 }}
          placeholder="Digite uma mensagem..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Enviar" onPress={handleSendMessage} />
      </View>
    </View>
  );
}
```

---

## 🔐 PASSO 5: Login com Firebase (Dados Reais)

### LoginScreen.jsx
```jsx
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import * as firebase from '../services/firebase';

export default function LoginScreen({ navigation }) {
  const [cnpj, setCnpj] = useState('12.345.678/0001-90'); // Seu CNPJ
  const [usuario, setUsuario] = useState('prestador1');     // Seu usuário
  const [senha, setSenha] = useState('senha123');           // Sua senha

  const handleLogin = async () => {
    try {
      // Normalizar CNPJ
      const normalizedCnpj = cnpj.replace(/\D/g, '');

      // 1. Verificar CNPJ
      const cnpjResult = await firebase.identifyCnpj(normalizedCnpj);
      if (!cnpjResult.exists) {
        Alert.alert('Erro', 'CNPJ não encontrado');
        return;
      }

      // 2. Verificar usuário
      const userResult = await firebase.checkUser(normalizedCnpj, usuario);
      if (!userResult.exists) {
        Alert.alert('Erro', 'Usuário não encontrado');
        return;
      }

      // 3. Fazer login
      const loginResult = await firebase.login({
        cnpj: normalizedCnpj,
        usuario,
        senha
      });

      // 4. Guardar dados
      localStorage.setItem('token', loginResult.token);
      localStorage.setItem('userName', loginResult.userName);
      localStorage.setItem('companyCnpj', loginResult.company.cnpj);
      localStorage.setItem('prestadorId', usuario); // Ou obter do banco

      // 5. Navegar para listagem de OS
      navigation.navigate('ServiceList');

    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', error.message || 'Falha ao fazer login');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <TextInput
        placeholder="CNPJ"
        value={cnpj}
        onChangeText={setCnpj}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Usuário"
        value={usuario}
        onChangeText={setUsuario}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

```
✅ 1. Copiar firebase.js do projeto principal
✅ 2. Copiar firebaseConfig.js (mesmos dados)
✅ 3. Criar LoginScreen com firebase.login()
✅ 4. Criar ServiceListScreen com firebase.listServiceOrders()
✅ 5. Implementar aceitar OS com firebase.updateServiceOrder()
✅ 6. Implementar etapas com firebase.updateServiceOrder()
✅ 7. Implementar chat com firebase.createChat() e firebase.sendMessage()
✅ 8. Testar com dados reais do Firebase
```

---

## 🧪 TESTAR COM DADOS REAIS

### Passo a Passo:

1. **No projeto web (dashboard):**
   - Vá para UsersEdit
   - Crie um novo usuário com role "prestador"
   - Credenciais: 
     - CNPJ: 12.345.678/0001-90
     - Usuário: prestador1
     - Senha: senha123

2. **No projeto web (dashboard):**
   - Vá para OrdemServico
   - Crie uma nova OS com status "PENDENTE"
   - Certifique-se de que ninguém foi atribuído (prestadorId = null)

3. **No app de prestadores:**
   - Faça login com: prestador1 / senha123
   - Veja a OS aparecer na lista
   - Clique ACEITAR

4. **De volta no web:**
   - Veja o status mudar para "ACEITA" em tempo real
   - Veja prestadorId mudar para "prestador1"

5. **No app:**
   - Veja o chat estar pronto
   - Execute as 3 etapas
   - Finalize a OS

6. **De volta no web:**
   - Veja todos os dados preenchidos
   - Status = "CONCLUIDA"
   - Todos os dados das etapas salvos

---

## 🎯 ESTRUTURA DE DADOS ESPERADA

Quando você carregar as OS via `firebase.listServiceOrders()`, você vai receber objetos assim:

```javascript
{
  id: "12345",
  clienteId: "cli001",
  prestadorId: null, // Será preenchido quando aceitar
  status: "PENDENTE",
  tipoServico: "Manutenção Hidráulica",
  descricao: "Vazamento na pia",
  endereco: {
    rua: "Rua Paulista",
    numero: "1000",
    cidade: "São Paulo",
    cep: "01311-100",
    latitude: -23.5505,
    longitude: -46.6333
  },
  cliente: {
    nome: "João Silva",
    telefone: "(11) 99999-9999",
    email: "joao@email.com",
    avaliacaoMedia: 4.8
  },
  valor: {
    base: 150,
    materiais: 0,
    total: 150
  },
  criadaEm: "2025-12-15T13:00:00Z"
}
```

Use esses dados direto para renderizar seus Cards!

---

## 🚀 PRÓXIMOS PASSOS

1. **Copie firebase.js** - Comece aqui
2. **Implemente LoginScreen** - Teste autenticação
3. **Implemente ServiceListScreen** - Veja OS reais
4. **Teste aceitar OS** - Veja atualizar no web
5. **Implemente etapas** - Execute o serviço
6. **Implemente chat** - Comunique em tempo real

**Tempo estimado:** 2-3 semanas para um MVP funcional

---

## 📞 DÚVIDAS?

Todos os dados que você vê no app web estão no Firebase. Você está apenas acessando a mesma base de dados de uma interface diferente (React Native em vez de React Web).

O Firebase é a "ponte" que conecta tudo em tempo real! 🌉

