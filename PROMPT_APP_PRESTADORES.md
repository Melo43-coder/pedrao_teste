# 📱 Aplicativo de Prestadores - Especificação Completa
## ⚡ INTEGRADO COM FIREBASE - Usando dados reais do sistema

## 🎯 Visão Geral
Aplicativo mobile-first para prestadores receberem e gerenciarem Ordens de Serviço (OS) em tempo real, com sistema de roteamento, chat integrado e fluxo de trabalho dividido em 3 etapas. **Este app utiliza o Firebase Firestore para autenticação, carregamento de OS, dados de clientes, chat integrado e histórico de serviços.**

### 🔑 Integração Firebase
- ✅ **Autenticação:** Login com CNPJ + Usuário + Senha (Firebase Auth)
- ✅ **Ordens de Serviço:** Carregadas em tempo real via `firebase.listServiceOrders(companyCnpj)`
- ✅ **Dados de Clientes:** Nome, telefone, avaliação, endereço completo
- ✅ **Chat Integrado:** Sistema de mensagens com central via `firebase.createChat()` e `firebase.sendMessage()`
- ✅ **Histórico de Serviços:** Rastreamento de todas as OS completadas
- ✅ **Notificações:** Usando Firebase Cloud Messaging (FCM)

---

## 🔐 0. TELA DE LOGIN (Firebase Auth)

### Fluxo de Autenticação
```
┌─────────────────────────────────┐
│   TELA DE LOGIN - PRESTADOR     │
├─────────────────────────────────┤
│                                 │
│  Logo do Sistema                │
│                                 │
│  [CNPJ: _______________]  ← 1   │
│  [Usuário: ___________]  ← 2    │
│  [Senha: ______________] ← 3    │
│                                 │
│  [LOGIN] [Recuperar Senha]      │
│                                 │
└─────────────────────────────────┘
```

### Dados Usados
Usar **exatamente** a mesma autenticação do sistema web:
- CNPJ da empresa (normalizado, com ou sem formatação)
- Usuário (username)
- Senha

**Chamadas Firebase:**
```javascript
// 1. Verificar se CNPJ existe
const { exists, company } = await firebase.identifyCnpj(cnpj);

// 2. Verificar se usuário existe
const { exists, user } = await firebase.checkUser(cnpj, usuario);

// 3. Fazer login
const { token, userName, company } = await firebase.login({ 
  cnpj, 
  usuario, 
  senha 
});

// Guardar no AsyncStorage/localStorage:
// - token (para requisições posteriores)
// - userName (exibir no app)
// - companyCnpj (para filtrar OS)
```

### Tratamento de Erros
- CNPJ não encontrado → Mensagem "Empresa não cadastrada"
- Usuário não encontrado → Mensagem "Usuário inválido"
- Senha incorreta → Mensagem "Credenciais inválidas"
- Recuperar senha → Link Firebase para reset

---

## 📋 1. TELA DE LISTAGEM DE OS (Visual Uber)

### Integração Firebase
**Carregar OS disponíveis:**
```javascript
// Ao entrar na tela, carregar todas as OS da empresa
const serviceOrders = await firebase.listServiceOrders(companyCnpj);

// Filtrar apenas OS pendentes (status: "PENDENTE" ou "DISPONÍVEL")
const osDisponiveis = serviceOrders.filter(os => 
  os.status === 'PENDENTE' || 
  os.status === 'DISPONÍVEL' ||
  (os.status === 'ACEITA' && os.prestadorId === null) // Nunca foram aceitas
);

// Estrutura da OS no Firebase:
{
  id: "12345",
  clienteId: "cli001",
  prestadorId: null, // null enquanto não aceita
  status: "PENDENTE",
  tipoServico: "Manutenção Hidráulica",
  descricao: "Vazamento na pia da cozinha",
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
    avaliacaoMedia: 4.8 // Média de avaliações
  },
  valor: {
    base: 150,
    total: 150
  },
  criadaEm: "2025-12-15T13:00:00Z"
}
```

### Design - Cards com dados reais
- **Layout inspirado em Uber:** Cards deslizáveis com informações principais
- **Cards mostrando:**
  - 🏢 Nome do Cliente: `cliente.nome`
  - 📍 Endereço completo: `endereco.rua, ${endereco.numero}`
  - 📍 Distância/tempo: Calcular com Google Maps Distance Matrix API
  - ⏱️ Tempo estimado de chegada (ETA): Google Maps API
  - 💰 Valor da OS: `valor.total` (em reais)
  - ⭐ Avaliação do cliente: `cliente.avaliacaoMedia` (1-5 estrelas)
  - 📋 Descrição: `descricao` ou `tipoServico`

### Ações
- **Botão "ACEITAR"** (verde/azul) - Atualiza `status` para "ACEITA" e seta `prestadorId`
- **Botão "REJEITAR"** (cinza) - Move para próxima (sem salvar)
- **Deslizar para próxima** - Gesto de deslize horizontal (tipo Tinder)

### Fluxo de Aceitação
```javascript
// Quando prestador clica "ACEITAR":
1. Mostrar confirmação: "Você aceita esta OS?"
2. Atualizar Firebase:
   await firebase.updateServiceOrder(companyCnpj, osId, {
     status: 'ACEITA',
     prestadorId: prestadorLogado,
     aceitaEm: new Date().toISOString()
   });
3. Criar chat entre prestador e central:
   const chat = await firebase.createChat(companyCnpj, {
     osId: osId,
     prestadorId: prestadorLogado,
     clienteTelefone: cliente.telefone,
     assunto: `OS #${osId} - ${tipoServico}`
   });
4. Redirecionar para tela de rota/navegação
```

### Estados da OS
- **PENDENTE** → Disponível para aceitar
- **ACEITA** → Prestador aceitou, pronto para rotas
- **ROTA** → Prestador está indo até o cliente
- **ETAPA1, ETAPA2, ETAPA3** → Serviço em execução
- **CONCLUIDA** → Finalizado e aprovado
- **CANCELADA** → Rejeitada ou cancelada

---

## 🗺️ 2. TELA DE ROTA/NAVEGAÇÃO (Após Aceitar OS)

### Integração Google Maps
```javascript
// Dados da OS aceita
const osAceita = {
  clienteLocalizacao: {
    latitude: -23.5505,
    longitude: -46.6333
  },
  endereco: "Rua Paulista, 1000, São Paulo, SP"
};

// 1. Obter localização atual do prestador (GPS)
const localizacaoPrestador = await getCurrentLocation();

// 2. Chamar Google Maps Distance Matrix API para calcular:
const directions = await google.maps.DistanceMatrixService({
  origins: [localizacaoPrestador],
  destinations: [osAceita.clienteLocalizacao],
  mode: 'DRIVING'
});

// Resposta:
{
  distance: "4.5 km",
  duration: "12 min",
  status: "OK"
}

// 3. Traçar rota no mapa
const route = await google.maps.DirectionsService({
  origin: localizacaoPrestador,
  destination: osAceita.clienteLocalizacao,
  travelMode: 'DRIVING'
});

// 4. Monitorar localização em tempo real
watchPosition((newLocation) => {
  // Atualizar marker do prestador no mapa
  // Atualizar ETA dinamicamente
  // Verificar quando chegou no destino
});
```

### Funcionalidades
- **Mapa integrado** (Google Maps SDK)
- **Rota traçada** do prestador até o cliente (calculada via Distance Matrix)
- **Estimativa de tempo** atualizada em tempo real
- **Localização em tempo real** (GPS do celular)
- **Botão "Iniciou rota"** (atualiza status para "ROTA")
- **Botão "Cheguei"** (atualiza status para "ETAPA1")

### Informações na Tela
```
┌─────────────────────────────────┐
│  OS #12345 - João Silva         │
│  Tempo até chegada: 12 min      │
│  Distância: 4.5 km              │
│  Endereço: Rua Paulista, 1000   │
└─────────────────────────────────┘
│                                 │
│  [MAPA COM ROTA E MARCADORES]  │
│  🔵 Você está aqui              │
│  🟠 Destino (cliente)           │
│                                 │
└─────────────────────────────────┘
│  [💬 Chat] [📞 Ligar] [❌ Cancelar] │
└─────────────────────────────────┘
```

### Ações Disponíveis
- 💬 **Chat com a central** (abre chat já criado durante aceitação)
- 📞 **Ligar para o cliente** (`cliente.telefone`)
- ❌ **Cancelar rota** (com confirmação, volta status para PENDENTE)

### Atualizar Firebase durante rota
```javascript
// Quando prestador clica "Iniciou rota"
await firebase.updateServiceOrder(companyCnpj, osId, {
  status: 'ROTA',
  inicioRotaEm: new Date().toISOString()
});

// Quando prestador clica "Cheguei"
await firebase.updateServiceOrder(companyCnpj, osId, {
  status: 'ETAPA1',
  chegadaEm: new Date().toISOString()
});
```

---

## 🔧 3. TELA DE EXECUÇÃO DO SERVIÇO (3 Etapas - Com Firebase)

### Fluxo Geral
Quando o prestador clica em **"Cheguei"**, é redirecionado para a tela de **"Iniciar Serviço"** com os dados já carregados do Firebase.

```javascript
// Carregar OS completa do Firebase
const osCompleta = await firebase.getServiceOrder(companyCnpj, osId);

// Estrutura:
{
  id: "12345",
  cliente: { nome, telefone, email, avaliacaoMedia },
  endereco: { rua, numero, cidade, cep, latitude, longitude },
  tipoServico: "Manutenção Hidráulica",
  descricao: "Vazamento na pia",
  valor: { base, materiais, total },
  status: "ETAPA1", // ou ETAPA2, ETAPA3
  
  // Dados preenchidos em cada etapa
  etapa1: { /* dados etapa 1 */ },
  etapa2: { /* dados etapa 2 */ },
  etapa3: { /* dados etapa 3 */ },
  
  criadaEm: "2025-12-15T13:00:00Z",
  aceitaEm: "2025-12-15T13:05:00Z",
  chegadaEm: "2025-12-15T14:30:00Z"
}
```

### Progress Indicator
```
┌────────────────────────────────────┐
│  EXECUÇÃO DA OS #12345             │
│  Cliente: João Silva               │
│  Endereço: Rua Paulista, 1000      │
├────────────────────────────────────┤
│                                    │
│  ✓ ETAPA 1/3: INICIALIZAÇÃO        │ ← Completada
│  ⚙️ ETAPA 2/3: CHECKLIST           │ ← Em andamento
│  ⊖ ETAPA 3/3: FINALIZAÇÃO          │ ← Bloqueada
│                                    │
│  [Próxima Etapa]                   │
│                                    │
└────────────────────────────────────┘
```

---

### **ETAPA 1: INICIALIZAÇÃO DO SERVIÇO**

**O que aparece:**
- ✅ Checkbox: "Cheguei no local"
- ✅ Checkbox: "Atendi o cliente"
- ✅ Checkbox: "Expliquei o serviço"
- 📝 Campo: "Observações iniciais" (opcional)
- 📷 Botão: "Tirar foto do local (antes)"
- ⏱️ Relógio: "Hora de início" (automático via `new Date()`)
- 🟢 **Botão "Próxima Etapa"** (só ativa se todos os checkboxes marcados)

**Salvar no Firebase:**
```javascript
await firebase.updateServiceOrder(companyCnpj, osId, {
  status: 'ETAPA2',
  etapa1: {
    chegouLocal: true,
    atendeuCliente: true,
    explicouServico: true,
    observacoes: "Cliente estava aguardando",
    fotoAntes: "gs://bucket/foto.jpg", // URL do Storage
    horaInicio: "2025-12-15T14:30:00Z",
    completedAt: "2025-12-15T14:35:00Z"
  }
});
```

---

### **ETAPA 2: PREENCHIMENTO DO CHECKLIST**

**O que aparece:**
- 📋 **Checklist dinâmico** (carregado do Firebase baseado no `tipoServico`)
  - Exemplo para "Manutenção Hidráulica":
    ```
    ✓ Inspecionou a tubulação
    ✓ Limpou os filtros
    ✓ Testou a pressão
    ✓ Verificou vazamentos
    ✓ Lubrificou as conexões
    ```

- **Cada item pode ter:**
  - ✅ Checkbox (sim/não)
  - 📝 Observações específicas
  - 📷 Foto de evidência
  - ⏰ Tempo despendido em minutos

- **Seção de materiais usados:**
  ```
  Material | Qtd | Valor Unit | Subtotal
  Cano PVC  | 2   | R$ 15,00   | R$ 30,00
  Veda      | 1   | R$ 5,00    | R$ 5,00
  ─────────────────────────────────────
  TOTAL:                       | R$ 35,00
  ```

- 📸 **Botão "Tirar foto do resultado final"**
- 🟢 **Botão "Próxima Etapa"** (valida que checklist foi preenchido)

**Salvar no Firebase:**
```javascript
await firebase.updateServiceOrder(companyCnpj, osId, {
  status: 'ETAPA3',
  etapa2: {
    checklist: [
      { item: "Inspecionou tubulação", concluido: true, foto: "gs://...", tempo: 5 },
      { item: "Limpou filtros", concluido: true, foto: "gs://...", tempo: 10 }
    ],
    materiais: [
      { nome: "Cano PVC", qtd: 2, valorUnitario: 15, subtotal: 30 },
      { nome: "Veda", qtd: 1, valorUnitario: 5, subtotal: 5 }
    ],
    totalMateriais: 35,
    fotosResultado: ["gs://...resultado.jpg"],
    tempoTotal: 15, // minutos
    completedAt: "2025-12-15T15:45:00Z"
  }
});
```

---

### **ETAPA 3: FINALIZAÇÃO**

**O que aparece:**
- ✅ Checkbox: "Limpei o local"
- ✅ Checkbox: "Expliquei o resultado"
- ✅ Checkbox: "Cliente aprovou"
- ⭐ **Sistema de avaliação:** "Como foi o atendimento?" (1-5 estrelas)
- ⭐ **Avaliação do cliente:** "Qual foi sua nota para o serviço?" (1-5 estrelas)
- 📝 **Campo: "Observações finais"** (opcional)
- 💰 **Resumo financeiro (leitura):**
  ```
  Valor base da OS:      R$ 150,00
  Materiais utilizados:  R$  35,00
  Desconto/Acréscimo:    R$   0,00
  ───────────────────────────────
  TOTAL A RECEBER:       R$ 185,00
  ```
- 🟢 **Botão "Finalizar e Enviar à Central"** (envia tudo para aprovação)

**Salvar no Firebase:**
```javascript
await firebase.updateServiceOrder(companyCnpj, osId, {
  status: 'CONCLUIDA', // ou 'AGUARDANDO_APROVACAO'
  etapa3: {
    limpouLocal: true,
    explicouResultado: true,
    clienteAprovou: true,
    avaliacaoPrestador: 5, // Avaliação do prestador sobre seu próprio serviço
    avaliacaoCliente: 5, // Avaliação do cliente
    observacoesFinal: "Serviço realizado com sucesso",
    resumoFinanceiro: {
      valorBase: 150,
      materiais: 35,
      desconto: 0,
      total: 185
    },
    completedAt: "2025-12-15T16:20:00Z"
  }
});

// Notificar central sobre conclusão
await firebase.notifyAllUsers(companyCnpj, {
  tipo: 'OS_CONCLUIDA',
  osId: osId,
  mensagem: `OS #${osId} foi concluída por ${prestadorNome}`,
  dados: { osId, prestadorId, clienteId }
});
```

---

## 💬 4. CHAT INTEGRADO (Central) - Sistema Existente

### Funcionalidades
- **Chat único por OS** entre prestador e central (mesmo sistema do app web)
- **Disponível em todas as telas** (ícone de balão flutuante)
- **Notificações em tempo real** via Firebase Realtime DB
- **Histórico persistido** no Firebase (nunca se perde)

### Recursos
- 📝 Mensagens de texto
- 📷 Envio de fotos (upload para Firebase Storage)
- 📍 Compartilhar localização em tempo real
- 🎙️ Notas de áudio (opcional, baixa prioridade)
- ✅ Confirmação de entrega (read receipts)

### Como usar o Chat existente
```javascript
// 1. Chat já foi criado durante aceitação da OS
const chat = await firebase.createChat(companyCnpj, {
  osId: osId,
  prestadorId: prestadorLogado,
  clienteTelefone: cliente.telefone,
  assunto: `OS #${osId} - ${tipoServico}`
});

// 2. Carregar mensagens do chat
const mensagens = await firebase.listMessages(companyCnpj, chat.id);

// 3. Enviar mensagem do prestador
await firebase.sendMessage(companyCnpj, chat.id, {
  sender: 'prestador',
  prestadorId: prestadorLogado,
  text: "Cheguei no local!",
  timestamp: new Date().toISOString(),
  read: false
});

// 4. Receber mensagens da central (Real-time listener)
firebase.db.ref(`chats/${companyCnpj}/${chat.id}/messages`).on('child_added', (snapshot) => {
  const msg = snapshot.val();
  // Mostrar mensagem e notificar
  showNotification(msg);
});
```

### Interface do Chat
```
┌─────────────────────────────────┐
│ Chat - OS #12345 - João Silva   │
├─────────────────────────────────┤
│                                 │
│ Central: "Qual seu tempo ETA?"  │ ← Mensagem recebida
│ 14:30                           │
│                                 │
│ Você: "Chego em 5 min"          │ ← Mensagem enviada
│ 14:32 ✓✓                        │
│                                 │
│                                 │
│  [📷] [📍] [🎙️] [______] [➤]  │
│  Escreva uma mensagem...        │
│                                 │
└─────────────────────────────────┘
```

**Dados no Firebase:**
```javascript
{
  chatId: "os_12345_chat",
  osId: "12345",
  prestadorId: "p001",
  centralId: "central",
  criadoEm: "2025-12-15T13:05:00Z",
  messages: [
    {
      id: "msg001",
      sender: "central",
      text: "Qual seu tempo de chegada?",
      timestamp: "2025-12-15T14:30:00Z",
      fotos: [],
      read: true,
      readAt: "2025-12-15T14:32:00Z"
    },
    {
      id: "msg002",
      sender: "prestador",
      prestadorId: "p001",
      text: "Chego em 5 minutos!",
      timestamp: "2025-12-15T14:32:00Z",
      fotos: ["gs://bucket/chat-foto-1.jpg"],
      read: true,
      readAt: "2025-12-15T14:32:30Z"
    }
  ]
}
```

---

## 📊 5. ESTRUTURA DO BANCO DE DADOS (Firebase - Estrutura Real)

### Coleção: `companies/{cnpj}/service_orders`
```javascript
{
  "12345": {
    id: "12345",
    clienteId: "cli001",
    prestadorId: "p001", // null até aceitar
    status: "PENDENTE|ACEITA|ROTA|ETAPA1|ETAPA2|ETAPA3|CONCLUIDA|CANCELADA",
    tipoServico: "Manutenção Hidráulica",
    descricao: "Vazamento na pia da cozinha",
    endereco: {
      rua: "Rua Paulista",
      numero: "1000",
      cidade: "São Paulo",
      cep: "01311-100",
      latitude: -23.5505,
      longitude: -46.6333
    },
    cliente: {
      id: "cli001",
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
    timeline: {
      criadaEm: "2025-12-15T13:00:00Z",
      aceitaEm: "2025-12-15T13:05:00Z",
      inicioRotaEm: "2025-12-15T13:10:00Z",
      chegadaEstimada: "2025-12-15T13:45:00Z",
      chegadaReal: "2025-12-15T13:42:00Z",
      etapa1Concluida: "2025-12-15T14:35:00Z",
      etapa2Concluida: "2025-12-15T15:45:00Z",
      etapa3Concluida: "2025-12-15T16:20:00Z"
    },
    etapa1: {
      chegouLocal: true,
      atendeuCliente: true,
      explicouServico: true,
      observacoes: "Cliente estava aguardando",
      fotoAntes: "gs://bucket/etapa1-foto.jpg",
      horaInicio: "2025-12-15T14:30:00Z",
      completedAt: "2025-12-15T14:35:00Z"
    },
    etapa2: {
      checklist: [
        { item: "Inspecionou tubulação", concluido: true, foto: "gs://...", tempo: 5 },
        { item: "Limpou filtros", concluido: true, foto: "gs://...", tempo: 10 }
      ],
      materiais: [
        { nome: "Cano PVC", qtd: 2, valorUnitario: 15, subtotal: 30 },
        { nome: "Veda", qtd: 1, valorUnitario: 5, subtotal: 5 }
      ],
      totalMateriais: 35,
      fotosResultado: ["gs://bucket/resultado.jpg"],
      completedAt: "2025-12-15T15:45:00Z"
    },
    etapa3: {
      limpouLocal: true,
      explicouResultado: true,
      clienteAprovou: true,
      avaliacaoPrestador: 5,
      avaliacaoCliente: 5,
      observacoesFinal: "Serviço realizado com sucesso",
      resumoFinanceiro: {
        valorBase: 150,
        materiais: 35,
        desconto: 0,
        total: 185
      },
      completedAt: "2025-12-15T16:20:00Z"
    }
  }
}
```

### Coleção: `companies/{cnpj}/chats`
```javascript
{
  "chat_os_12345": {
    id: "chat_os_12345",
    osId: "12345",
    prestadorId: "p001",
    centralId: "central",
    criadoEm: "2025-12-15T13:05:00Z",
    messages: [
      {
        id: "msg001",
        sender: "central",
        text: "Qual seu tempo de chegada?",
        timestamp: "2025-12-15T14:30:00Z",
        fotos: [],
        read: true,
        readAt: "2025-12-15T14:32:00Z"
      },
      {
        id: "msg002",
        sender: "prestador",
        prestadorId: "p001",
        text: "Chego em 5 minutos!",
        timestamp: "2025-12-15T14:32:00Z",
        fotos: ["gs://bucket/chat-foto.jpg"],
        read: true
      }
    ]
  }
}
```

### Coleção: `companies/{cnpj}/users` (Prestadores)
```javascript
{
  "p001": {
    id: "p001",
    username: "carlos.silva",
    displayName: "Carlos Silva",
    email: "carlos@email.com",
    role: "prestador", // ou "funcionario", "gerente", "admin"
    phone: "(11) 98888-7777",
    active: true,
    especialidades: ["Hidráulica", "Encanamento", "Reparos Gerais"],
    avaliacaoMedia: 4.9,
    totalServicos: 150,
    
    // Localização em tempo real
    localizacao: {
      latitude: -23.5505,
      longitude: -46.6333,
      ultimaAtualizacao: "2025-12-15T14:30:00Z"
    },
    
    // Documentos
    documentos: {
      cpf: "123.456.789-00",
      cnh: "1234567890",
      rg: "12.345.678-9",
      fotoPerfil: "gs://bucket/profile-p001.jpg"
    },
    
    // Status do prestador
    statusAtual: "DISPONIVEL|OCUPADO|OFFLINE|EM_ROTA",
    osEmAndamento: "12345", // ID da OS sendo executada
    
    createdAt: "2024-01-15T10:00:00Z"
  }
}
```

### Coleção: `companies/{cnpj}/users` (Clientes)
```javascript
{
  "cli001": {
    id: "cli001",
    username: "joao.silva",
    displayName: "João Silva",
    email: "joao@email.com",
    role: "user",
    phone: "(11) 99999-9999",
    active: true,
    
    // Perfil do cliente
    endereco: {
      rua: "Rua Paulista",
      numero: "1000",
      cidade: "São Paulo",
      cep: "01311-100"
    },
    
    // Avaliações e histórico
    avaliacaoMedia: 4.8,
    totalServicos: 15,
    historico: ["12345", "12346", "12347"],
    
    createdAt: "2023-06-20T10:00:00Z"
  }
}
```

### Coleção: `companies/{cnpj}/satisfaction_ratings`
```javascript
{
  "rating001": {
    id: "rating001",
    osId: "12345",
    prestadorId: "p001",
    clienteId: "cli001",
    avaliacaoPrestador: 5, // Avaliação do prestador sobre o cliente
    avaliacaoCliente: 5, // Avaliação do cliente sobre o prestador
    comentario: "Serviço excelente, muito rápido!",
    criadaEm: "2025-12-15T16:25:00Z"
  }
}
```

---

## 🎨 6. DESIGN VISUAL E INTEGRAÇÃO COM APIS

### Cores Principais
- **Primária (Ação):** #0ea5e9 (Azul claro - aceitar, próximo)
- **Secundária (Sucesso):** #10b981 (Verde - concluído)
- **Alerta:** #f59e0b (Âmbar - aviso, em progresso)
- **Erro:** #ef4444 (Vermelho - cancelar, rejeitar)
- **Fundo:** #f8fafc (Cinza claro)
- **Texto primário:** #1e293b
- **Texto secundário:** #64748b

### Componentes UI
- **Cards:** Sombra suave (0 2px 4px rgba), borda arredondada 12px
- **Botões:** Padding 12px 24px, borderRadius 8px, font-weight 600, transição smooth
- **Input:** Padding 10px 12px, border 1px solid #e2e8f0, focus: border-color #0ea5e9
- **Ícones:** Iconify.io (mdi para Material Design ou tabler)

### Responsividade Mobile-First
- **Breakpoint mobile:** 0px - 640px (foco principal)
- **Breakpoint tablet:** 641px - 1024px (secundário)
- **Breakpoint desktop:** 1025px+ (administrativo)
- **Espaçamento:** 16px margin/padding em mobile, 24px em desktop
- **Font sizes:** 14px corpo, 16px inputs, 20px títulos em mobile

### Integração com APIs Externas

#### 1. Google Maps API
```javascript
// Instalação
npm install @react-native-maps/maps react-native-geolocation-service

// Calcular distância e duração
const getRouteInfo = async (origin, destination) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=YOUR_GOOGLE_API_KEY`
  );
  const data = await response.json();
  return {
    distance: data.rows[0].elements[0].distance.text,
    duration: data.rows[0].elements[0].duration.text
  };
};

// Traçar rota no mapa
const getDirections = async (origin, destination) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=YOUR_GOOGLE_API_KEY`
  );
  return response.json();
};

// Monitorar localização em tempo real
Geolocation.watchPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    // Enviar para Firebase e atualizar no mapa
    firebase.updateUserLocation(companyCnpj, prestadorId, { latitude, longitude });
  },
  (error) => console.log(error),
  { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
);
```

#### 2. Firebase Storage (Upload de Fotos)
```javascript
// Instalação
npm install firebase

// Upload de foto
const uploadPhoto = async (uri, path) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  
  const ref = firebase.storage().ref().child(path);
  const snapshot = await ref.put(blob);
  const url = await snapshot.ref.getDownloadURL();
  
  return url;
};

// Usar em etapas
const fotoAntes = await uploadPhoto(photoUri, `OS/${osId}/etapa1/foto-antes.jpg`);
```

#### 3. Firebase Cloud Messaging (Notificações)
```javascript
// Instalação
npm install react-native-firebase

// Registrar device para notificações
const registerForNotifications = async () => {
  const token = await firebase.messaging().getToken();
  await firebase.updateUser(companyCnpj, prestadorId, { fcmToken: token });
};

// Listener para notificações
firebase.messaging().onMessage(async (remoteMessage) => {
  console.log('Notificação recebida:', remoteMessage.notification);
  showLocalNotification(remoteMessage.notification);
});
```

#### 4. Geolocalização
```javascript
import Geolocation from 'react-native-geolocation-service';

// Obter localização atual
const getCurrentLocation = async () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};
```

---

## 🔄 7. FLUXO DE NAVEGAÇÃO

```
┌─────────────────────────────────────────┐
│   TELA INICIAL (Login/Autenticação)     │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  LISTAGEM DE OS (Estilo Uber)           │
│  - Card 1: Aceitar/Rejeitar             │
│  - Card 2: Aceitar/Rejeitar             │
│  - Card 3: Aceitar/Rejeitar             │
└──────────────────┬──────────────────────┘
                   │ (Aceita OS)
                   ▼
┌─────────────────────────────────────────┐
│  TELA DE ROTA (Google Maps)             │
│  - Mapa com rota traçada                │
│  - ETA em tempo real                    │
│  - Botão "Cheguei"                      │
└──────────────────┬──────────────────────┘
                   │ (Clica "Cheguei")
                   ▼
┌─────────────────────────────────────────┐
│  ETAPA 1: INICIALIZAÇÃO                 │
│  - Checklists iniciais                  │
│  - Foto antes                           │
│  - Botão "Próxima"                      │
└──────────────────┬──────────────────────┘
                   │ (Próxima)
                   ▼
┌─────────────────────────────────────────┐
│  ETAPA 2: CHECKLIST DE SERVIÇO           │
│  - Items dinâmicos                      │
│  - Materiais usados                     │
│  - Fotos resultado                      │
│  - Botão "Próxima"                      │
└──────────────────┬──────────────────────┘
                   │ (Próxima)
                   ▼
┌─────────────────────────────────────────┐
│  ETAPA 3: FINALIZAÇÃO                   │
│  - Checklist final                      │
│  - Avaliações                           │
│  - Resumo financeiro                    │
│  - Botão "Finalizar"                    │
└──────────────────┬──────────────────────┘
                   │ (Finalizar)
                   ▼
┌─────────────────────────────────────────┐
│  CONFIRMAÇÃO DE CONCLUSÃO               │
│  - Dados enviados para central          │
│  - Aguardando aprovação                 │
│  - Botão "Voltar à Listagem"            │
└─────────────────────────────────────────┘
```

---

## 🚀 8. IMPLEMENTAÇÃO TÉCNICA - Usando serviços Firebase existentes

### Tech Stack Recomendado
- **Frontend:** React Native (Expo) - Rápido desenvolvimento com live reload
- **Backend:** Firebase (Firestore + Realtime DB) - **JÁ CONFIGURADO**
- **Mapas:** Google Maps SDK for React Native
- **Autenticação:** Firebase Auth - **JÁ INTEGRADO**
- **Storage:** Firebase Storage - **JÁ INTEGRADO**
- **Notificações:** Firebase Cloud Messaging (FCM)
- **Localização:** React Native Geolocation

### Dependências Principais (package.json)
```json
{
  "expo": "^49.0.0",
  "react": "^18.2.0",
  "react-native": "^0.72.0",
  "firebase": "^10.0.0",
  "react-native-maps": "^1.8.0",
  "react-native-geolocation-service": "^5.10.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/bottom-tabs": "^6.5.0",
  "axios": "^1.6.0"
}
```

### Como Importar Serviços Firebase Existentes

O projeto já possui um arquivo `src/services/firebase.js` com todas as funções necessárias. **Reutilize diretamente no app!**

```javascript
// No seu app de prestadores, importe assim:
import * as firebase from './services/firebase';

// Funções disponíveis que já estão prontas:

// 1. AUTENTICAÇÃO
await firebase.identifyCnpj(cnpj);           // Verificar CNPJ
await firebase.checkUser(cnpj, usuario);     // Verificar usuário
await firebase.login({ cnpj, usuario, senha });  // Login

// 2. ORDENS DE SERVIÇO
await firebase.listServiceOrders(companyCnpj);   // Listar OS disponíveis
await firebase.getServiceOrder(companyCnpj, osId);  // Pegar OS específica
await firebase.createServiceOrder(companyCnpj, osData);  // Criar OS (admin)
await firebase.updateServiceOrder(companyCnpj, osId, updates);  // Atualizar status/etapas

// 3. CHAT
await firebase.createChat(companyCnpj, chatData);  // Criar chat (automático ao aceitar OS)
await firebase.listMessages(companyCnpj, chatId);  // Carregar mensagens
await firebase.sendMessage(companyCnpj, chatId, messageData);  // Enviar mensagem

// 4. USUÁRIOS
await firebase.listCompanyUsers(companyCnpj);  // Listar todos (clientes, prestadores, etc)
await firebase.updateUser(companyCnpj, userId, updates);  // Atualizar perfil

// 5. NOTIFICAÇÕES
await firebase.notifyAllUsers(companyCnpj, notification);  // Notificar quando OS concluída

// 6. AVALIAÇÕES
await firebase.saveSatisfactionRating(cnpj, ratingData);  // Salvar avaliação final
```

### Estrutura de Pastas Recomendada (React Native)
```
prestador-app/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.jsx
│   │   ├── ServiceListScreen.jsx
│   │   ├── NavigationScreen.jsx
│   │   ├── ServiceExecutionScreen.jsx (com abas para etapas)
│   │   ├── ChatScreen.jsx
│   │   └── ProfileScreen.jsx
│   ├── components/
│   │   ├── OSCard.jsx
│   │   ├── MapView.jsx
│   │   ├── ChatMessage.jsx
│   │   ├── StageProgress.jsx
│   │   └── StepForm.jsx
│   ├── services/
│   │   ├── firebase.js (USAR DO PROJETO PRINCIPAL)
│   │   ├── geolocation.js
│   │   └── googleMaps.js
│   ├── styles/
│   │   ├── colors.js
│   │   ├── typography.js
│   │   └── spacing.js
│   ├── navigation/
│   │   └── RootNavigator.jsx
│   ├── context/
│   │   ├── AuthContext.js
│   │   └── ServiceContext.js
│   └── App.jsx
├── app.json
├── package.json
└── README.md
```

### Exemplo de Hook Reutilizável (useServiceOrder)
```javascript
// src/hooks/useServiceOrder.js
import { useState, useEffect } from 'react';
import * as firebase from '../services/firebase';

export const useServiceOrder = (companyCnpj, osId) => {
  const [serviceOrder, setServiceOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await firebase.getServiceOrder(companyCnpj, osId);
        setServiceOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [companyCnpj, osId]);

  const updateOrder = async (updates) => {
    try {
      await firebase.updateServiceOrder(companyCnpj, osId, updates);
      setServiceOrder({ ...serviceOrder, ...updates });
    } catch (err) {
      setError(err.message);
    }
  };

  return { serviceOrder, loading, error, updateOrder };
};
```

### Exemplo de Fluxo Completo (Aceitar OS)
```javascript
// src/screens/ServiceListScreen.jsx
import React, { useState, useEffect } from 'react';
import * as firebase from '../services/firebase';

export default function ServiceListScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const companyCnpj = localStorage.getItem('companyCnpj');
  const prestadorId = localStorage.getItem('prestadorId');

  useEffect(() => {
    loadAvailableOrders();
  }, []);

  const loadAvailableOrders = async () => {
    try {
      const allOrders = await firebase.listServiceOrders(companyCnpj);
      const available = allOrders.filter(o => 
        o.status === 'PENDENTE' && !o.prestadorId
      );
      setOrders(available);
    } catch (err) {
      console.error('Erro ao carregar OS:', err);
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (order) => {
    try {
      // 1. Atualizar status da OS
      await firebase.updateServiceOrder(companyCnpj, order.id, {
        status: 'ACEITA',
        prestadorId: prestadorId,
        aceitaEm: new Date().toISOString()
      });

      // 2. Criar chat
      const chat = await firebase.createChat(companyCnpj, {
        osId: order.id,
        prestadorId: prestadorId,
        clienteTelefone: order.cliente.telefone,
        assunto: `OS #${order.id} - ${order.tipoServico}`
      });

      // 3. Navegar para rota
      navigation.navigate('Navigation', { 
        orderId: order.id,
        chatId: chat.id
      });
    } catch (err) {
      console.error('Erro ao aceitar OS:', err);
      alert('Erro ao aceitar OS. Tente novamente.');
    }
  };

  return (
    // UI aqui...
  );
}
```

---

## ⚡ 8.5 QUICK START - Começar Rápido Reutilizando Código

### 1. Copiar Arquivo de Serviços Firebase
```bash
# Copie src/services/firebase.js do projeto principal
cp ../pedrao_teste/src/services/firebase.js ./src/services/firebase.js

# Ele já contém todas as funções que você precisa!
```

### 2. Configurar Firebase no seu app
```javascript
// src/firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 3. Componentes Base Essenciais
```javascript
// src/components/LoginForm.jsx - Usar mesma lógica do Login.jsx principal
// src/components/ServiceCards.jsx - Cards deslizáveis com OS
// src/components/MapContainer.jsx - Integração Google Maps
// src/components/ChatBox.jsx - Chat em tempo real
// src/components/StageForm.jsx - Formulários das 3 etapas
```

### 4. Context para Estado Global
```javascript
// src/context/AppContext.js
import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [companyCnpj, setCompanyCnpj] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  return (
    <AppContext.Provider value={{
      user, setUser,
      companyCnpj, setCompanyCnpj,
      currentOrder, setCurrentOrder
    }}>
      {children}
    </AppContext.Provider>
  );
}
```

### 5. Dados de Teste
```javascript
// Use o mesmo CNPJ do seu projeto principal para testar
// CNPJ: 12.345.678/0001-90
// Usuário: prestador1 (criar em UsersEdit com role="prestador")
// Senha: senha123

// Isso vai carregar todas as OS reais do seu Firebase!
```

---

## ✅ 9. CHECKLIST DE DESENVOLVIMENTO

### Fase 1: Estrutura Base ⚡ (RAPIDO - 2-3 dias)
- [ ] Inicializar projeto React Native (Expo)
- [ ] Copiar `firebase.js` do projeto principal
- [ ] Configurar Firebase Config (mesmos dados do projeto principal)
- [ ] Criar tela de login (copiar lógica de Login.jsx principal)
- [ ] Criar contexto AppContext para estado global
- [ ] Testar autenticação com dados reais

### Fase 2: Listagem de OS 🎯 (3-4 dias)
- [ ] Criar ServiceListScreen com Cards
- [ ] Implementar `firebase.listServiceOrders()`
- [ ] Criar componente OSCard estilizado
- [ ] Gesture de deslize (swipe) com react-native-gesture-handler
- [ ] Botões ACEITAR e REJEITAR funcionando
- [ ] Confirmação visual antes de aceitar
- [ ] Navegação para tela de rota após aceitar

### Fase 3: Roteamento com Google Maps 🗺️ (4-5 dias)
- [ ] Integrar React Native Maps
- [ ] Obter localização atual com Geolocation
- [ ] Chamar Google Maps Distance Matrix API
- [ ] Traçar rota no mapa
- [ ] Atualizar ETA em tempo real
- [ ] Monitorar localização (watchPosition)
- [ ] Botões "Iniciou rota" e "Cheguei" funcionando
- [ ] Salvando status no Firebase em cada etapa

### Fase 4: Execução do Serviço - 3 Etapas 🔧 (5-6 dias)
- [ ] Criar ServiceExecutionScreen com abas de etapas
- [ ] **ETAPA 1:** Formulário com checkboxes + câmera
- [ ] **ETAPA 2:** Checklist dinâmico + materiais + fotos
- [ ] **ETAPA 3:** Avaliações + resumo financeiro
- [ ] Upload de fotos para Firebase Storage
- [ ] Validação de formulários em cada etapa
- [ ] Navegação entre etapas com bloqueios apropriados
- [ ] Salvar progresso no Firebase após cada etapa

### Fase 5: Comunicação (Chat) 💬 (3-4 dias)
- [ ] Criar ChatScreen
- [ ] Implementar `firebase.listMessages()`
- [ ] Implementar `firebase.sendMessage()`
- [ ] Real-time listener para novas mensagens
- [ ] Upload de fotos no chat
- [ ] Notificações de mensagens recebidas
- [ ] Read receipts (✓, ✓✓)
- [ ] Chat flutuante acessível de qualquer tela

### Fase 6: Perfil e Configurações 👤 (2-3 dias)
- [ ] Criar ProfileScreen
- [ ] Mostrar dados do prestador (especialidades, avaliações)
- [ ] Histórico de serviços completados
- [ ] Editar perfil (especialidades, dados)
- [ ] Logout
- [ ] Notificações push (FCM)

### Fase 7: Testes e Polimento ✨ (3-5 dias)
- [ ] Testes em device real (Android)
- [ ] Testes em device real (iOS)
- [ ] Testes de performance (geolocalização)
- [ ] Offline resilience (salvar rascunhos)
- [ ] Testes de câmera e galeria
- [ ] Otimização de images
- [ ] Tratamento de erros robusto

### Fase 8: Deploy e Monitoramento 🚀 (2-3 dias)
- [ ] Build APK para Android
- [ ] Build IPA para iOS
- [ ] Upload para Play Store / App Store
- [ ] Configurar Crashlytics para monitoramento
- [ ] Analytics para rastrear uso
- [ ] Monitoramento de performance

---

## 📱 10. PROTOTIPAGEM VISUAL (Figma)

Criar as seguintes telas no Figma:
1. **Tela de Login** - CNPJ, Usuário, Senha
2. **Tela de Listagem de OS** - 3 cards com informações (Uber style)
3. **Tela de Rota/Navegação** - Mapa + ETA + Chat
4. **Tela de Etapa 1** - Checklists + Foto antes
5. **Tela de Etapa 2** - Checklist dinâmico + Materiais + Fotos
6. **Tela de Etapa 3** - Finalizações + Avaliações + Resumo
7. **Modal de Chat** - Mensagens em tempo real
8. **Tela de Perfil** - Dados, especialidades, histórico

---

## 🎯 11. RESUMO DA INTEGRAÇÃO COM FIREBASE

### O que já está pronto (REUTILIZE!)
✅ **Autenticação** - `firebase.login()`, `firebase.checkUser()`, `firebase.identifyCnpj()`
✅ **Ordens de Serviço** - `firebase.listServiceOrders()`, `firebase.updateServiceOrder()`
✅ **Chat** - `firebase.createChat()`, `firebase.sendMessage()`, `firebase.listMessages()`
✅ **Usuários** - `firebase.listCompanyUsers()`, `firebase.updateUser()`
✅ **Notificações** - `firebase.notifyAllUsers()`
✅ **Avaliações** - `firebase.saveSatisfactionRating()`

### Como usar no seu app
```javascript
// 1. Importe o arquivo de serviços
import * as firebase from './services/firebase';

// 2. Use as funções prontas
const orders = await firebase.listServiceOrders(companyCnpj);
const chat = await firebase.createChat(companyCnpj, { osId, prestadorId });
await firebase.updateServiceOrder(companyCnpj, osId, { status: 'ETAPA2' });

// 3. Todos os dados vão para o mesmo Firebase do sistema web
// Prestador aceita OS no app → Central vê atualização em tempo real no web
```

### Fluxo End-to-End (Prestador recebe até finalizar OS)
```
1. CENTRAL (Web) → Cria OS → Salva no Firebase
   └─> status: "PENDENTE"

2. PRESTADOR (App) → Login com CNPJ + Usuário
   └─> Autentica via Firebase Auth

3. PRESTADOR (App) → Vê lista de OS disponíveis
   └─> Carrega via firebase.listServiceOrders()

4. PRESTADOR (App) → Clica ACEITAR
   └─> Status muda para "ACEITA" no Firebase
   └─> Central vê em tempo real (Firestore listener)

5. PRESTADOR (App) → Recebe rota no mapa até cliente
   └─> Google Maps API calcula distância/duração

6. PRESTADOR (App) → Executa serviço em 3 etapas
   └─> Cada etapa salva dados no Firebase
   └─> Pode comunicar com central via chat

7. PRESTADOR (App) → Finaliza e envia
   └─> Status muda para "CONCLUIDA"
   └─> Central recebe notificação para aprovar

8. CENTRAL (Web) → Aprova na interface
   └─> Serviço finalizado, prestador pode avaliar
```

---

## 🎓 DICAS IMPORTANTES

### 1. Reutile o máximo possível
- Copie `firebase.js` do projeto principal
- Copie lógica de Login de `Login.jsx`
- Use o mesmo Firebase project ID
- Use os mesmos padrões de código

### 2. Dados de Teste
```
CNPJ: 12.345.678/0001-90 (mesmo do projeto principal)
Usuário: prestador1 (crie em UsersEdit com role="prestador")
Senha: senha123
```

Ao fazer login com essas credenciais, você vai ver as OS reais do Firebase!

### 3. Variáveis de Ambiente
```javascript
// .env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_GOOGLE_MAPS_API_KEY=...
```

### 4. Testing com Dados Reais
1. Crie um prestador no UsersEdit do web
2. Crie uma OS com status "PENDENTE" no OrdemServico
3. Faça login no app com credenciais do prestador
4. Veja a OS aparecer na lista
5. Clique ACEITAR e veja atualizar em tempo real no web

---

## 📞 SUPORTE E DOCUMENTAÇÃO

- **Firebase Docs:** https://firebase.google.com/docs
- **React Native Docs:** https://reactnative.dev
- **Google Maps SDK:** https://developers.google.com/maps/documentation/android-sdk
- **Expo Docs:** https://docs.expo.dev

---
