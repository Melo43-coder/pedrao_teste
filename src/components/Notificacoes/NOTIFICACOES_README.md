# 🔔 Sistema de Notificações em Tempo Real

## ✅ O Que Foi Implementado

Um sistema completo de notificações em tempo real que:

1. **Notifica quando uma OS é criada**
   - Todos os funcionários, gerentes e admins recebem
   - Informações: cliente, cidade, estado, prioridade
   - Aparece em tempo real (polling a cada 5 segundos)

2. **Alerta de Estoque Baixo**
   - Produto com < 10 unidades → Notifica gerentes e admins
   - Produto com 0 unidades → Notifica TODOS (funcionário, gerente, admin)
   - Com detalhes do produto e quantidade

3. **Painel de Notificações**
   - Bell icon com badge de contagem de não lidas
   - Lista de notificações com data/hora
   - Marca como lida
   - Delete individual
   - Marcar todas como lidas

---

## 📊 Como Funciona

### Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│  OrdemServico.jsx                                       │
│  (Criar nova OS)                                        │
│           ↓                                             │
│  notifyAllUsers() → Firebase                            │
│           ↓                                             │
│  collections: companies/{CNPJ}/notifications/           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Compras.jsx                                            │
│  (Operação de Estoque)                                  │
│           ↓                                             │
│  if (estoque < 10) → notifyAllUsers()                   │
│           ↓                                             │
│  Firebase notifications collection                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  NotificationCenter.jsx (Sidebar)                       │
│           ↓                                             │
│  subscribeToNotifications() - Polling 5 segundos        │
│           ↓                                             │
│  Exibe notificações em tempo real                       │
│  Bell icon 🔔 com contagem não lidas                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Funções Firebase Adicionadas

### 1. `createNotification(cnpj, notificationData)`
Cria uma notificação individual no Firebase.

```javascript
await createNotification(cnpj, {
  type: 'nova_os',
  titulo: 'Nova Ordem de Serviço',
  mensagem: 'OS para João em São Paulo',
  userId: 'user-id-123',
  username: 'funcionario1',
  email: 'func@empresa.com'
});
```

### 2. `notifyAllUsers(cnpj, notificationData, roles)`
Cria notificação para TODOS os usuários com um role específico.

```javascript
await notifyAllUsers(cnpj, {
  type: 'nova_os',
  titulo: 'Nova OS Criada',
  mensagem: 'Nova OS para Cliente X'
}, ['funcionario', 'gerente', 'admin']);
```

**Roles disponíveis:**
- `'funcionario'` - Funcionários
- `'gerente'` - Gerentes
- `'admin'` - Administradores

### 3. `listNotifications(cnpj, userId, limit = 50)`
Lista as notificações de um usuário (ordenadas por data).

```javascript
const notifs = await listNotifications(cnpj, userId);
// Retorna: [{ id, type, titulo, mensagem, isRead, createdAt, ... }]
```

### 4. `markNotificationAsRead(cnpj, notificationId)`
Marca uma notificação como lida.

```javascript
await markNotificationAsRead(cnpj, notificationId);
```

### 5. `markAllNotificationsAsRead(cnpj, userId)`
Marca TODAS as notificações do usuário como lidas.

```javascript
await markAllNotificationsAsRead(cnpj, userId);
```

### 6. `deleteNotification(cnpj, notificationId)`
Deleta uma notificação.

```javascript
await deleteNotification(cnpj, notificationId);
```

### 7. `getUnreadCount(cnpj, userId)`
Retorna a quantidade de notificações não lidas.

```javascript
const count = await getUnreadCount(cnpj, userId);
// Retorna: 5
```

### 8. `subscribeToNotifications(cnpj, userId, callback)`
Monitora notificações em tempo real (polling a cada 5s).

```javascript
const unsubscribe = subscribeToNotifications(cnpj, userId, (notifs) => {
  console.log('Novas notificações:', notifs);
});

// Para parar de ouvir:
unsubscribe();
```

---

## 💡 Tipos de Notificações Implementadas

### 1. Nova Ordem de Serviço
```javascript
{
  type: 'nova_os',
  titulo: 'Nova Ordem de Serviço Criada',
  mensagem: 'Nova OS para João Silva em São Paulo, SP. Prioridade: Alta',
  osInfo: {
    cliente: 'João Silva',
    cidade: 'São Paulo',
    estado: 'SP',
    prioridade: 'Alta'
  }
}
```

**Enviado para:** Funcionários, Gerentes, Admins
**Quando:** Uma nova OS é criada
**Trigger:** OrdemServico.jsx - handleCreateOS()

### 2. Estoque Baixo (< 10 unidades)
```javascript
{
  type: 'estoque_baixo',
  titulo: 'Aviso: Estoque Baixo',
  mensagem: 'Produto "Ácido Clorídrico" está com apenas 5 unidades em estoque!',
  produtoInfo: {
    nome: 'Ácido Clorídrico',
    categoria: 'Químicos',
    estoque: 5
  }
}
```

**Enviado para:** Gerentes, Admins
**Quando:** Estoque fica < 10 un
**Trigger:** Compras.jsx - handleOperacaoEstoque()

### 3. Estoque Zerado (0 unidades)
```javascript
{
  type: 'estoque_baixo',
  titulo: '⛔ SEM ESTOQUE',
  mensagem: 'Produto "Ácido Clorídrico" ficou SEM ESTOQUE! Fazer novo pedido urgentemente.',
  produtoInfo: {
    nome: 'Ácido Clorídrico',
    categoria: 'Químicos',
    estoque: 0
  }
}
```

**Enviado para:** Funcionários, Gerentes, Admins (TODOS!)
**Quando:** Estoque chega a 0
**Trigger:** Compras.jsx - handleOperacaoEstoque()

---

## 🎨 Interface do Usuário

### Localização
- **Canto superior direito da Sidebar** (acima dos menus)
- Bell icon 🔔 com badge de contagem

### Estados

1. **Sem notificações**
   - Bell icon cinza: 🔔
   - Sem badge

2. **Com notificações não lidas**
   - Bell icon com badge vermelho: 🔔 [5]
   - Clickável

3. **Painel aberto**
   - Mostra lista de notificações
   - Ordenadas por recentes primeiro
   - Cada notificação mostra:
     - Tipo e ícone
     - Título
     - Mensagem
     - Tempo decorrido (ex: "5m atrás")
     - Botão de delete individual

---

## 📂 Estrutura no Firebase

```
companies/{CNPJ}/
└── notifications/
    ├── {notif-id-1}
    │   ├── type: "nova_os"
    │   ├── titulo: "Nova Ordem de Serviço"
    │   ├── mensagem: "..."
    │   ├── userId: "user-123"
    │   ├── username: "funcionario1"
    │   ├── email: "func@empresa.com"
    │   ├── isRead: false
    │   ├── createdAt: "2025-04-15T10:30:00Z"
    │   ├── updatedAt: "2025-04-15T10:30:00Z"
    │   └── [outros campos específicos do tipo]
    │
    ├── {notif-id-2}
    │   ├── type: "estoque_baixo"
    │   ├── titulo: "Aviso: Estoque Baixo"
    │   ├── isRead: true
    │   └── ...
    │
    └── ...
```

---

## 🚀 Como Usar

### Para Usuários Finais

1. **Ver notificações**
   - Clique no bell icon 🔔 no canto superior direito
   - Lista aparece com todas as notificações

2. **Marcar como lida**
   - Clique na notificação
   - Cor muda de azul claro para branco
   - Badge diminui em 1

3. **Marcar todas como lidas**
   - Clique em "Marcar como lidas" no topo do painel
   - Todas ficam brancas
   - Badge desaparece

4. **Deletar uma notificação**
   - Clique no X vermelho da notificação
   - Notificação desaparece
   - Número de não lidas diminui

---

### Para Desenvolvedores

#### Criar notificação manual

```javascript
import firebase from "../../services/firebase";

// Notificar um usuário específico
await firebase.createNotification(cnpj, {
  type: 'novo_tipo',
  titulo: 'Título da Notificação',
  mensagem: 'Descrição detalhada',
  userId: 'user-id-123',
  username: 'funcionario1',
  email: 'func@empresa.com'
});
```

#### Notificar múltiplos usuários

```javascript
// Notificar todos os gerentes e admins
await firebase.notifyAllUsers(cnpj, {
  type: 'alerta_importante',
  titulo: 'Alerta Importante',
  mensagem: 'Algo importante aconteceu'
}, ['gerente', 'admin']);
```

#### Ouvir notificações em tempo real

```javascript
useEffect(() => {
  const cnpj = localStorage.getItem("userCnpj");
  const userId = localStorage.getItem("userId");
  
  const unsubscribe = firebase.subscribeToNotifications(
    cnpj,
    userId,
    (notificacoes) => {
      console.log('Novas notificações:', notificacoes);
      // Atualizar UI
    }
  );
  
  return () => unsubscribe();
}, []);
```

---

## ⏱️ Tempo Real

### Como funciona
- **Polling a cada 5 segundos**
- Sistema busca novas notificações a cada 5s
- Ideal para aplicações sem WebSocket

### Alternativas (Futuro)
Se quiser mais rápido, pode adicionar:
- **Firestore Realtime Listeners** (2-3 segundos)
- **WebSockets** (instantâneo, mas requer backend)
- **Push Notifications** (via FCM - Firebase Cloud Messaging)

---

## 🔐 Segurança

### Regras Firestore (Recomendadas)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /companies/{cnpj}/notifications/{notification} {
      // Usuário só vê suas próprias notificações
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // Apenas sistema (via backend) cria
      allow create: if request.auth != null;
      
      // Usuário pode deletar suas notificações
      allow delete: if request.auth != null && 
                       resource.data.userId == request.auth.uid;
      
      // Usuário pode atualizar status (isRead)
      allow update: if request.auth != null && 
                       resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 📋 Checklist de Implementação

- [x] Funções Firebase criadas (8 funções)
- [x] Notificação ao criar OS
- [x] Alerta de estoque baixo
- [x] Alerta de estoque zerado
- [x] Componente NotificationCenter
- [x] Integrado no Sidebar
- [x] Polling em tempo real (5s)
- [x] Marcar como lida
- [x] Marcar todas como lidas
- [x] Delete individual
- [x] Badge com contagem
- [x] Sem erros de compilação

---

## 🎯 Próximos Passos (Opcional)

- [ ] Notificação de pedido entregue
- [ ] Notificação de OS concluída
- [ ] Notificação de pagamento recebido
- [ ] Notificação customizada por usuário
- [ ] Email de notificação importante
- [ ] Push notifications (mobile)
- [ ] Som de notificação
- [ ] Histórico de notificações
- [ ] Filtrar por tipo

---

## 🐛 Troubleshooting

### Notificações não aparecem
✓ Verifique se userId está no localStorage
✓ Verifique se userCnpj está no localStorage
✓ Abra console (F12) e veja se há erros
✓ Aguarde 5 segundos (polling)

### NotificationCenter não renderiza
✓ Verifique se NotificationCenter foi importado
✓ Verifique se está dentro do Sidebar
✓ Recarregue a página

### Frase "Todos os funcionários, gerentes e admins"
✓ Você pode customizar alterando `['funcionario', 'gerente', 'admin']`
✓ Exemplo: apenas admins: `['admin']`

---

## 📞 Suporte

Para mais detalhes, consulte:
- `firebase.js` - Implementação das funções
- `NotificationCenter.jsx` - Interface
- `OrdemServico.jsx` - Integração OS
- `Compras.jsx` - Integração Estoque

---

**Versão**: 1.0.0  
**Data**: 24/11/2025  
**Status**: ✅ Completo e Funcional
