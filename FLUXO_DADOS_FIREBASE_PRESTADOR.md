# 🔄 MAPA DE FLUXO DE DADOS - Prestador App + Dashboard Web + Firebase

## 📊 Visão Geral do Sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                      FIREBASE FIRESTORE                          │
│                    (Banco de Dados Central)                      │
│                                                                  │
│  ├─ companies/{cnpj}/service_orders/                            │
│  ├─ companies/{cnpj}/users/                                     │
│  ├─ companies/{cnpj}/chats/                                     │
│  └─ companies/{cnpj}/satisfaction_ratings/                      │
└──────────────────────────────────────────────────────────────────┘
           ▲                              ▲
           │                              │
           │                              │
    ┌──────┴──────┐              ┌────────┴──────┐
    │             │              │               │
    │   WEB APP   │              │  MOBILE APP   │
    │  (React)    │              │ (React Native)│
    │             │              │               │
    │ Dashboard   │              │ Prestador     │
    │ - CRM       │              │ - Login       │
    │ - OS        │              │ - Listar OS   │
    │ - Chat      │              │ - Executar    │
    │ - Admin     │              │ - Chat        │
    │             │              │               │
    └─────────────┘              └───────────────┘
```

---

## 🔄 FLUXO 1: Central Cria OS → Prestador Recebe

```
┌─────────────────────────────────┐
│ CENTRAL (Web Dashboard)         │
│                                 │
│ 1. Acessa "Ordem de Serviço"   │
│ 2. Clica "Nova OS"             │
│ 3. Preenche:                   │
│    - Cliente                   │
│    - Tipo de serviço           │
│    - Valor                     │
│ 4. Clica "Salvar"              │
│                                 │
└────────────────┬────────────────┘
                 │
                 │ firebase.createServiceOrder()
                 │
                 ▼
┌─────────────────────────────────┐
│ FIREBASE (companies/{cnpj}/     │
│          service_orders)        │
│                                 │
│ {                               │
│   id: "12345",                 │
│   status: "PENDENTE",          │
│   prestadorId: null,           │
│   cliente: {...},              │
│   valor: {...}                 │
│ }                               │
│                                 │
└────────────────┬────────────────┘
                 │
                 │ Firestore Real-time Listener
                 │
                 ▼
┌─────────────────────────────────┐
│ PRESTADOR (App Mobile)          │
│                                 │
│ 1. App monitora Firebase        │
│ 2. Vê nova OS na lista          │
│ 3. Mostra em cards:             │
│    - João Silva                 │
│    - R$ 150,00                 │
│    - 4.5km de distância        │
│                                 │
│ [ACEITAR] [REJEITAR]           │
│                                 │
└─────────────────────────────────┘
```

---

## 🔄 FLUXO 2: Prestador Aceita OS → Central Vê em Tempo Real

```
┌──────────────────────────────────┐
│ PRESTADOR (App Mobile)           │
│                                  │
│ 1. Vê OS na listagem             │
│ 2. Clica "ACEITAR"               │
│ 3. Confirma                      │
│                                  │
└────────────────┬─────────────────┘
                 │
                 │ firebase.updateServiceOrder(osId, {
                 │   status: 'ACEITA',
                 │   prestadorId: 'prestador1',
                 │   aceitaEm: now
                 │ })
                 │
                 ▼
┌──────────────────────────────────┐
│ FIREBASE (companies/{cnpj}/      │
│          service_orders/12345)   │
│                                  │
│ ANTES:                           │
│ {                                │
│   status: "PENDENTE",           │
│   prestadorId: null             │
│ }                                │
│                                  │
│ DEPOIS (1 segundo depois):       │
│ {                                │
│   status: "ACEITA",             │
│   prestadorId: "prestador1",    │
│   aceitaEm: "2025-12-15T..."    │
│ }                                │
│                                  │
└────────────────┬─────────────────┘
                 │
                 │ Firestore Real-time Listener
                 │
                 ▼
┌──────────────────────────────────┐
│ CENTRAL (Web Dashboard)          │
│                                  │
│ 1. Vê mudança em tempo real      │
│ 2. Atualiza status na tabela:    │
│    OS #12345: ACEITA             │
│    Prestador: Carlos Silva       │
│ 3. Pode acompanhar a rota        │
│ 4. Clica em chat para falar      │
│                                  │
└──────────────────────────────────┘
```

---

## 🔄 FLUXO 3: Prestador Executa Serviço → Salva 3 Etapas

```
┌────────────────────────────────────┐
│ PRESTADOR (App Mobile)             │
│                                    │
│ ETAPA 1: Inicialização             │
│ ✓ Cheguei no local                │
│ ✓ Atendi o cliente                │
│ ✓ Foto: [camera icon]             │
│ Clica "Próxima"                    │
│                                    │
│ ETAPA 2: Checklist                 │
│ ✓ Inspecionou                     │
│ ✓ Limpou                          │
│ ✓ Material: Cano PVC x2 R$30      │
│ Clica "Próxima"                    │
│                                    │
│ ETAPA 3: Finalização               │
│ ✓ Limpou local                    │
│ ⭐⭐⭐⭐⭐ Avaliação                   │
│ Clica "Finalizar"                  │
│                                    │
└────────────────┬───────────────────┘
                 │
                 │ firebase.updateServiceOrder(osId, {
                 │   status: 'ETAPA2',
                 │   etapa1: { ...dados... }
                 │ })
                 │ ... (repete para cada etapa)
                 │
                 ▼
┌────────────────────────────────────┐
│ FIREBASE (companies/{cnpj}/        │
│          service_orders/12345)     │
│                                    │
│ {                                  │
│   id: "12345",                    │
│   status: "ETAPA3",               │
│   etapa1: {                        │
│     chegouLocal: true,            │
│     foto: "gs://...",             │
│     completedAt: "..."            │
│   },                               │
│   etapa2: {                        │
│     checklist: [...],             │
│     materiais: [...],             │
│     completedAt: "..."            │
│   },                               │
│   etapa3: {                        │
│     avaliacaoPrestador: 5,        │
│     ... (vindo a cada atualização) │
│   }                                │
│ }                                  │
│                                    │
└────────────────┬───────────────────┘
                 │
                 │ Firestore Real-time Listener
                 │
                 ▼
┌────────────────────────────────────┐
│ CENTRAL (Web Dashboard)            │
│                                    │
│ 1. CRM mostra progresso em tempo  │
│    real:                           │
│    OS #12345                       │
│    Status: ETAPA3                 │
│    Etapa1: ✓ Concluída            │
│    Etapa2: ✓ Concluída            │
│    Etapa3: ⚙️ Em andamento         │
│                                    │
│ 2. Pode ver fotos conforme        │
│    são enviadas                    │
│ 3. Pode enviar mensagem via chat   │
│                                    │
└────────────────────────────────────┘
```

---

## 💬 FLUXO 4: Chat em Tempo Real Entre Prestador e Central

### Cenário: Prestador faz pergunta durante execução

```
┌──────────────────────────────┐
│ PRESTADOR (App Mobile)       │
│                              │
│ Chat com Central             │
│ ────────────────            │
│                              │
│ "Qual é a medida da         │
│  tubulação?"                │
│                              │
│ [Enviar]                     │
│                              │
└────────────────┬─────────────┘
                 │
                 │ firebase.sendMessage(chatId, {
                 │   sender: 'prestador',
                 │   text: 'Qual é a medida...',
                 │   timestamp: now
                 │ })
                 │
                 ▼
┌──────────────────────────────┐
│ FIREBASE                     │
│ (companies/{cnpj}/           │
│  chats/chat_12345)           │
│                              │
│ messages: [                  │
│   {                          │
│     sender: 'prestador',    │
│     text: 'Qual é...',      │
│     timestamp: '2025-...',  │
│     read: false             │
│   }                          │
│ ]                            │
│                              │
└────────────────┬─────────────┘
                 │
                 │ Firestore Real-time Listener
                 │
                 ▼
┌──────────────────────────────┐
│ CENTRAL (Web Dashboard)      │
│                              │
│ Chat Component               │
│ ────────────────            │
│ Carlos Silva (Prestador):    │
│ "Qual é a medida da          │
│  tubulação?"                │
│ 14:32                        │
│                              │
│ [Digitando resposta...]      │
│ "A tubulação é 3/4 polegada" │
│ [Enviar]                     │
│                              │
└────────────────┬─────────────┘
                 │
                 │ firebase.sendMessage(chatId, {
                 │   sender: 'central',
                 │   text: 'A tubulação...',
                 │   timestamp: now
                 │ })
                 │
                 ▼
┌──────────────────────────────┐
│ FIREBASE (atualizado)        │
│                              │
│ messages: [                  │
│   { prestador... },         │
│   {                          │
│     sender: 'central',      │
│     text: 'A tubulação...'  │
│   }                          │
│ ]                            │
│                              │
└────────────────┬─────────────┘
                 │
                 │ Firestore Real-time Listener
                 │
                 ▼
┌──────────────────────────────┐
│ PRESTADOR (App Mobile)       │
│                              │
│ Chat atualiza:               │
│                              │
│ Você: "Qual é a medida?"    │
│ 14:32 ✓✓                     │
│                              │
│ Central: "A tubulação é      │
│ 3/4 polegada"               │
│ 14:33 (NEW MESSAGE!)        │
│                              │
│ 🔔 Notificação recebida      │
│                              │
└──────────────────────────────┘
```

---

## 🔐 FLUXO 5: Autenticação - Login Compartilhado

```
┌─────────────────────────────────┐
│ PRESTADOR (App Mobile)          │
│                                 │
│ Login Screen                    │
│ CNPJ: 12.345.678/0001-90       │
│ Usuário: carlos.silva           │
│ Senha: ****                     │
│                                 │
│ [LOGIN]                         │
│                                 │
└────────────────┬────────────────┘
                 │
                 │ firebase.login({
                 │   cnpj: '12345678000190',
                 │   usuario: 'carlos.silva',
                 │   senha: '...'
                 │ })
                 │
                 ▼
┌─────────────────────────────────┐
│ FIREBASE AUTH                   │
│                                 │
│ 1. Valida credenciais          │
│ 2. Retorna token               │
│ 3. Carrega dados do usuário    │
│    da coleção:                 │
│    companies/{cnpj}/users/     │
│                                 │
└────────────────┬────────────────┘
                 │
                 │ Token + User Data
                 │
                 ▼
┌─────────────────────────────────┐
│ PRESTADOR (App Mobile)          │
│                                 │
│ Dados salvos em localStorage:   │
│ - token                         │
│ - userName: "Carlos Silva"      │
│ - companyCnpj: "12345678000190" │
│ - prestadorId: "carlos.silva"   │
│                                 │
│ Navega para ServiceListScreen   │
│                                 │
└─────────────────────────────────┘

MESMOS DADOS são usados no:
└─ Web Dashboard (Login.jsx)
└─ Todas as requisições firebase
└─ Multi-tenancy (CNPJ isolamento)
```

---

## 📊 ESTRUTURA DE DADOS NO FIREBASE

### Companies/{cnpj}/service_orders
```
12345/
├─ id: "12345"
├─ status: "CONCLUIDA"
├─ prestadorId: "carlos.silva"
├─ cliente: { nome, telefone, email }
├─ endereco: { rua, numero, cidade }
├─ valor: { base, materiais, total }
├─ etapa1: { chegouLocal, foto, completedAt }
├─ etapa2: { checklist, materiais, completedAt }
├─ etapa3: { avaliacaoPrestador, avaliacaoCliente, completedAt }
└─ timeline: { criadaEm, aceitaEm, finalizadaEm }
```

### Companies/{cnpj}/chats
```
chat_12345/
├─ osId: "12345"
├─ prestadorId: "carlos.silva"
├─ criadoEm: "2025-12-15T13:05:00Z"
└─ messages/
   ├─ msg001: { sender: 'prestador', text: '...', timestamp, read }
   ├─ msg002: { sender: 'central', text: '...', timestamp, read }
   └─ msg003: { sender: 'prestador', text: '...', timestamp, read }
```

### Companies/{cnpj}/users
```
carlos.silva/
├─ id: "carlos.silva"
├─ displayName: "Carlos Silva"
├─ role: "prestador"
├─ email: "carlos@email.com"
├─ phone: "(11) 98888-7777"
├─ especialidades: ["Hidráulica", "Encanamento"]
├─ avaliacaoMedia: 4.9
├─ totalServicos: 150
└─ localizacao: { latitude, longitude, ultimaAtualizacao }
```

---

## ⚡ REAL-TIME SYNC - Tudo Acontece em < 1 Segundo

```
Prestador atualiza status
        ↓ (firebase.updateServiceOrder)
Firebase (Firestore) atualiza documento
        ↓ (Real-time listeners)
Dashboard Web atualiza em tempo real ✓
        + 
Chat mensagem recebida em tempo real ✓
        + 
Notificações push enviadas ✓
        + 
Histórico atualizado ✓

TUDO ISSO ACONTECE SIMULTANEAMENTE!
```

---

## 🎯 RESUMO - Como os Dados Fluem

```
┌────────────────────────────────────────────────────────────┐
│                    FIREBASE FIRESTORE                      │
│              (Única Fonte da Verdade - "Source of Truth")  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  WEB APP ←→ Firebase ←→ MOBILE APP                        │
│  Dashboard     (Real-time Sync)    Prestador            │
│                                                            │
│  Quando Central cria OS:                                  │
│  Dashboard → Firebase ← Mobile App vê automaticamente    │
│                                                            │
│  Quando Prestador aceita OS:                             │
│  Mobile App → Firebase ← Dashboard vê automaticamente    │
│                                                            │
│  Quando Prestador preenche etapas:                       │
│  Mobile App → Firebase ← Dashboard vê em tempo real     │
│                                                            │
│  Quando ambos enviam chat:                               │
│  App ↔ Firebase ↔ Web (ambos veem mensagens)            │
│                                                            │
│  RESULTADO: Sincronização perfeita entre plataformas!   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🔐 SEGURANÇA - CNPJ Isolation

```
Companies/
├─ 12345678000190/  (CNPJ da Empresa A)
│  ├─ service_orders/
│  ├─ users/
│  ├─ chats/
│  └─ (Dados isolados - Prestador A só vê isso)
│
├─ 98765432000110/  (CNPJ da Empresa B)
│  ├─ service_orders/
│  ├─ users/
│  ├─ chats/
│  └─ (Dados isolados - Prestador B só vê isso)
│
└─ (Cada empresa tem seus dados separados)

Implementação:
- Login vincula a um CNPJ específico
- Todas as queries filtram por CNPJ
- Prestador de A nunca vê dados de B
- Multi-tenancy automática!
```

---

## 📱 PRÓXIMOS PASSOS

1. **Entender o fluxo:** Leia este documento
2. **Copiar firebase.js:** De `src/services/firebase.js`
3. **Implementar LoginScreen:** Use `firebase.login()`
4. **Testar com dados reais:** Crie uma OS no web, veja no app
5. **Implemente os flows:** Um fluxo por vez
6. **Sincronia em tempo real:** Abra web e app lado a lado

---

**Resultado final:** Uma aplicação real em tempo real usando Firebase! 🚀

