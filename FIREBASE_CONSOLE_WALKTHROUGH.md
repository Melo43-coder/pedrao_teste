# 📍 FIREBASE CONSOLE - Onde Encontrar Seus Dados

## 🎯 Se você abrir o Firebase Console agora, verá:

### 1. Autenticação (Authentication)

```
Firebase → Authentication → Users

Você verá:
├─ admin@12345678000190.local
├─ gerente@12345678000190.local  
├─ usuario@12345678000190.local
├─ prestador1@12345678000190.local (CRIAR PARA TESTAR)
└─ carlos.silva@98765432000110.local
```

**Para testar no app:**
- Email: `prestador1@12345678000190.local`
- Senha: (a que você definir)

---

### 2. Firestore Database

```
Firestore → Data

companies/
├─ 12345678000190/  (Seu CNPJ principal)
│  │
│  ├─ service_orders/
│  │  ├─ 12345
│  │  │  ├─ id: "12345"
│  │  │  ├─ clienteId: "cli001"
│  │  │  ├─ status: "PENDENTE"  ← Muda quando prestador aceita
│  │  │  ├─ prestadorId: null    ← Muda quando prestador aceita
│  │  │  ├─ cliente: { nome, telefone, email }
│  │  │  ├─ endereco: { rua, numero, latitude, longitude }
│  │  │  ├─ valor: { base, materiais, total }
│  │  │  ├─ etapa1: { ... }      ← Preenchido quando etapa 1 completa
│  │  │  ├─ etapa2: { ... }      ← Preenchido quando etapa 2 completa
│  │  │  └─ etapa3: { ... }      ← Preenchido quando etapa 3 completa
│  │  │
│  │  └─ 12346, 12347, ...
│  │
│  ├─ users/
│  │  ├─ doc1
│  │  │  ├─ username: "prestador1"
│  │  │  ├─ displayName: "Carlos Silva"
│  │  │  ├─ role: "prestador"
│  │  │  ├─ especialidades: ["Hidráulica", "Encanamento"]
│  │  │  ├─ email: "carlos@email.com"
│  │  │  └─ phone: "(11) 98888-7777"
│  │  │
│  │  ├─ doc2 (João Silva - cliente)
│  │  ├─ doc3 (Maria - funcionária)
│  │  └─ doc4 (Admin da empresa)
│  │
│  ├─ chats/
│  │  ├─ chat_12345
│  │  │  ├─ osId: "12345"
│  │  │  ├─ prestadorId: "prestador1"
│  │  │  ├─ criadoEm: "2025-12-15T13:05:00Z"
│  │  │  └─ messages/
│  │  │     ├─ msg001: { sender: "central", text: "...", timestamp }
│  │  │     └─ msg002: { sender: "prestador", text: "...", timestamp }
│  │  │
│  │  └─ chat_12346, ...
│  │
│  └─ satisfaction_ratings/
│     ├─ rating001
│     │  ├─ osId: "12345"
│     │  ├─ avaliacaoPrestador: 5
│     │  ├─ avaliacaoCliente: 5
│     │  └─ comentario: "..."
│     │
│     └─ rating002, ...
│
└─ 98765432000110/  (Outra empresa - dados isolados)
   ├─ service_orders/
   ├─ users/
   ├─ chats/
   └─ satisfaction_ratings/
```

---

### 3. Storage (Fotos)

```
Storage → pedrao-sintaxe-default-rtdb

OS/
├─ 12345/
│  ├─ etapa1/
│  │  └─ foto-antes.jpg          ← Enviada quando completar etapa 1
│  │
│  ├─ etapa2/
│  │  ├─ foto-item-1.jpg
│  │  ├─ foto-item-2.jpg
│  │  └─ resultado.jpg            ← Enviada quando completar etapa 2
│  │
│  └─ chat/
│     └─ msg-001-foto.jpg         ← Enviada quando enviar foto no chat
│
└─ 12346/, 12347/, ...
```

---

## 🔍 COMO TESTAR LOCALMENTE

### 1. Abra Firebase Console
```
https://console.firebase.google.com
→ Seu projeto
→ Firestore Database
```

### 2. Crie Dados de Teste

#### A. Crie um Prestador
```
1. Authentication → Create User
   - Email: prestador1@12345678000190.local
   - Password: senha123

2. Firestore → companies/12345678000190/users
   - Click "+ Add document"
   - Document ID: auto
   - Dados:
     {
       "username": "prestador1",
       "displayName": "Carlos Silva",
       "role": "prestador",
       "email": "prestador1@email.com",
       "phone": "(11) 98888-7777",
       "especialidades": ["Hidráulica", "Encanamento"],
       "active": true,
       "createdAt": "2025-12-15T10:00:00Z"
     }
```

#### B. Crie uma OS
```
Firestore → companies/12345678000190/service_orders
- Click "+ Add document"
- Document ID: 12345
- Dados:
  {
    "id": "12345",
    "clienteId": "cli001",
    "prestadorId": null,
    "status": "PENDENTE",
    "tipoServico": "Manutenção Hidráulica",
    "descricao": "Vazamento na pia",
    "endereco": {
      "rua": "Rua Paulista",
      "numero": "1000",
      "cidade": "São Paulo",
      "cep": "01311-100",
      "latitude": -23.5505,
      "longitude": -46.6333
    },
    "cliente": {
      "id": "cli001",
      "nome": "João Silva",
      "telefone": "(11) 99999-9999",
      "email": "joao@email.com",
      "avaliacaoMedia": 4.8
    },
    "valor": {
      "base": 150,
      "materiais": 0,
      "total": 150
    },
    "criadaEm": "2025-12-15T13:00:00Z"
  }
```

---

## 🔴 LIVE UPDATE - Teste a Sincronização

### Teste 1: Ver mudança em Tempo Real

```
1. Abra Firebase Console em uma aba
   Firestore → companies/12345678000190/service_orders/12345
   Veja: status = "PENDENTE"

2. Abra seu app (React Native)
   Faça login com: prestador1 / senha123
   Veja a OS aparecer na listagem

3. No app, clique "ACEITAR"

4. Volte ao Firebase Console
   Aguarde 1 segundo...
   Veja: status = "ACEITA"
   Veja: prestadorId = "prestador1"
   
   ✅ SINCRONIZAÇÃO FUNCIONANDO!
```

### Teste 2: Ver Dados das Etapas

```
1. No app, complete ETAPA 1
   (todos os checkboxes + foto)

2. Aguarde um segundo

3. No Firebase Console
   Veja em: service_orders/12345/etapa1
   
   Campo "etapa1" aparece com:
   - chegouLocal: true
   - atendeuCliente: true
   - fotoAntes: "gs://..."
   - completedAt: "2025-12-15T14:35:00Z"
   
   ✅ DADOS SALVANDO!
```

### Teste 3: Ver Chat em Tempo Real

```
1. No app, envie mensagem:
   "Cheguei no local!"

2. No Firebase Console
   Veja em: chats/chat_12345/messages
   
   Mensagem aparece:
   - sender: "prestador"
   - text: "Cheguei no local!"
   - timestamp: "2025-12-15T14:30:00Z"

3. Na Dashboard web, veja mensagem
   aparecer em tempo real no chat!
   
   ✅ CHAT FUNCIONANDO!
```

---

## 📊 ESTRUTURA QUE VOCÊ VERÁ

### Ao Aceitar OS
```
ANTES (Firebase):
service_orders/12345: {
  status: "PENDENTE",
  prestadorId: null
}

DEPOIS (1 segundo depois):
service_orders/12345: {
  status: "ACEITA",
  prestadorId: "prestador1",
  aceitaEm: "2025-12-15T13:05:00Z"
}
```

### Ao Completar Etapa 1
```
service_orders/12345: {
  status: "ETAPA2",
  etapa1: {
    chegouLocal: true,
    atendeuCliente: true,
    explicouServico: true,
    observacoes: "Cliente estava aguardando",
    fotoAntes: "gs://bucket/photo.jpg",
    horaInicio: "2025-12-15T14:30:00Z",
    completedAt: "2025-12-15T14:35:00Z"
  }
}
```

### Ao Completar Etapa 2
```
service_orders/12345: {
  status: "ETAPA3",
  etapa2: {
    checklist: [
      {
        item: "Inspecionou tubulação",
        concluido: true,
        foto: "gs://bucket/photo1.jpg",
        tempo: 5
      },
      {
        item: "Limpou filtros",
        concluido: true,
        foto: "gs://bucket/photo2.jpg",
        tempo: 10
      }
    ],
    materiais: [
      {
        nome: "Cano PVC",
        qtd: 2,
        valorUnitario: 15,
        subtotal: 30
      }
    ],
    totalMateriais: 30,
    fotosResultado: ["gs://bucket/resultado.jpg"],
    completedAt: "2025-12-15T15:45:00Z"
  }
}
```

### Ao Finalizar (Etapa 3)
```
service_orders/12345: {
  status: "CONCLUIDA",
  etapa3: {
    limpouLocal: true,
    explicouResultado: true,
    clienteAprovou: true,
    avaliacaoPrestador: 5,
    avaliacaoCliente: 5,
    observacoesFinal: "Serviço realizado com sucesso",
    resumoFinanceiro: {
      valorBase: 150,
      materiais: 30,
      desconto: 0,
      total: 180
    },
    completedAt: "2025-12-15T16:20:00Z"
  }
}
```

---

## 🎯 RESUMO - O que Você Verá no Firebase

```
├─ Authentication
│  └─ prestador1@... (seu usuário de teste)
│
└─ Firestore Database
   └─ companies/12345678000190/
      ├─ service_orders/12345
      │  ├─ status: PENDENTE → ACEITA → ETAPA2 → ETAPA3 → CONCLUIDA
      │  ├─ prestadorId: null → "prestador1"
      │  ├─ etapa1: (preenchido após etapa 1)
      │  ├─ etapa2: (preenchido após etapa 2)
      │  └─ etapa3: (preenchido após etapa 3)
      │
      ├─ users/prestador1
      │  ├─ username: "prestador1"
      │  ├─ role: "prestador"
      │  └─ especialidades: [...]
      │
      └─ chats/chat_12345
         └─ messages/msg001, msg002, ...
            └─ Mensagens em tempo real
```

---

## ✅ ISSO PROVA QUE:

```
✅ Firebase está funcionando
✅ Dados estão sincronizando
✅ App está salvando corretamente
✅ Web vê mudanças em tempo real
✅ Chat está funcionando
✅ Seu código está certo
```

---

## 🎉 CONCLUSÃO

Quando você abrir o Firebase Console e fizer um teste:

1. **Faça login no app** → Veja autenticação funcionar
2. **Veja OS na listagem** → Veja dados sendo carregados
3. **Clique ACEITAR** → Veja prestadorId aparecer em tempo real
4. **Complete etapas** → Veja campos etapa1, etapa2, etapa3 aparecendo
5. **Envie chat** → Veja mensagens aparecendo em tempo real

**Tudo isso = Firebase funcionando perfeitamente!** ✅

---

## 📞 SE ALGO NÃO APARECER

```
❌ Dados não aparecem no Firebase?
→ Verifique se firebase.js está importando corretamente
→ Verifique se companyCnpj está sendo passado
→ Verifique Firebase Firestore rules (devem permitir write)

❌ App não faz login?
→ Verifique se usuário existe em Authentication
→ Verifique se senha está correta
→ Verifique Firebase Auth configuration

❌ Dados não sincronizam em tempo real?
→ Verifique real-time listeners estão configurados
→ Feche e reabra Firebase Console
→ Aguarde alguns segundos para sincronizar

❌ Fotos não fazem upload?
→ Verifique se Storage bucket está criado
→ Verifique Storage rules permitem write
→ Verifique se app tem permissão de câmera
```

---

**Happy coding! 🚀**

