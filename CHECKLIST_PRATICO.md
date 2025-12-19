# ✅ CHECKLIST PRÁTICO - Seu App de Prestadores com Firebase

## 🎯 VOCÊ PODE COMEÇAR AGORA!

Tudo que você precisa já existe no seu projeto. Aqui está o plano:

---

## 📖 LEITURA INICIAL (1 hora)

```
☐ SUMMARY_FIREBASE_INTEGRACAO.md         (10 min)
☐ README_INTEGRACAO_FIREBASE.md          (15 min)
☐ FLUXO_DADOS_FIREBASE_PRESTADOR.md      (15 min)
☐ FIREBASE_CONSOLE_WALKTHROUGH.md        (10 min)
☐ PROMPT_APP_PRESTADORES.md - seção 0   (10 min)
```

---

## 🔧 SETUP INICIAL (2-3 horas)

### Passo 1: Copiar Firebase.js
```
☐ Localize: src/services/firebase.js
☐ Copie para seu projeto React Native
☐ Importe em seus componentes
   import * as firebase from './services/firebase';
```

### Passo 2: Configurar Firebase
```
☐ Copie firebaseConfig.js (ou crie um idêntico)
☐ Use os MESMOS dados do seu projeto web:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

☐ Isso conecta ao MESMO banco de dados
```

### Passo 3: Preparar Dados de Teste
```
☐ No Firebase Console:
   - Crie um usuário: prestador1@{seu-cnpj}.local
   
☐ No seu Dashboard web (UsersEdit):
   - Crie usuário "prestador1" com role="prestador"
   
☐ No seu Dashboard web (OrdemServico):
   - Crie uma OS com status="PENDENTE"
   - Deixe prestadorId = null
```

---

## 📱 DESENVOLVIMENTO (20-30 horas)

### FASE 1: Auth - LoginScreen (2-3 horas)

**Checklist:**
```
☐ Crie LoginScreen.jsx com 3 inputs:
  - CNPJ
  - Usuário
  - Senha

☐ Importe firebase.js

☐ Crie função handleLogin():
  const result = await firebase.login({
    cnpj: normalizeCnpj(cnpj),
    usuario: usuario,
    senha: senha
  });

☐ Salve dados em localStorage:
  localStorage.setItem('token', result.token);
  localStorage.setItem('userName', result.userName);
  localStorage.setItem('companyCnpj', result.company.cnpj);

☐ Navegue para ServiceListScreen

☐ TESTE: Faça login com prestador1 / senha123
  → Deve funcionar e ir para ServiceListScreen
```

### FASE 2: Listagem - ServiceListScreen (3-4 horas)

**Checklist:**
```
☐ Crie ServiceListScreen.jsx

☐ Em useEffect, carregue OS:
  const companyCnpj = localStorage.getItem('companyCnpj');
  const orders = await firebase.listServiceOrders(companyCnpj);

☐ Filtre apenas PENDENTES:
  const available = orders.filter(o => 
    o.status === 'PENDENTE' && !o.prestadorId
  );

☐ Crie OSCard component que mostra:
  - cliente.nome
  - cliente.telefone
  - endereco (rua, numero)
  - valor.total
  - cliente.avaliacaoMedia (stars)

☐ Botões: [ACEITAR] [REJEITAR]

☐ Gesture de swipe horizontal

☐ TESTE: Veja a OS real que criou no web
  → Clique ACEITAR
  → Vá para Firebase Console
  → Veja prestadorId mudar para "prestador1"
```

### FASE 3: Mapa - NavigationScreen (4-5 horas)

**Checklist:**
```
☐ Instale react-native-maps:
  npm install react-native-maps

☐ Instale Google Maps services:
  npm install @react-native-community/geolocation

☐ Crie NavigationScreen.jsx

☐ Obtenha localização atual:
  const location = await getCurrentLocation();

☐ Calcule rota com Google Maps API:
  - Distance Matrix: distância + tempo
  - Directions: traçar rota no mapa

☐ Mostre no mapa:
  - Localização atual (prestador)
  - Destino (cliente)
  - Rota entre eles

☐ Botões:
  - [Iniciou rota] → updateServiceOrder status='ROTA'
  - [Cheguei] → updateServiceOrder status='ETAPA1'
  - [Chat] → abra ChatScreen
  - [Ligar] → chame cliente.telefone

☐ TESTE: Clique "Iniciou rota"
  → Firebase Console: status muda para "ROTA"
  → Web Dashboard vê mudança em tempo real
```

### FASE 4: Execução - ServiceExecutionScreen (5-6 horas)

**Checklist:**
```
☐ Crie ServiceExecutionScreen.jsx

☐ State para current stage (1, 2 ou 3)

☐ ETAPA 1: Inicialização
  ☐ 3 checkboxes:
    - Cheguei no local
    - Atendi o cliente
    - Expliquei o serviço
  
  ☐ TextField: Observações (opcional)
  
  ☐ Camera button: Tirar foto (upload p/ Storage)
  
  ☐ Hora de início (automático)
  
  ☐ Botão "Próxima Etapa" (só ativa se tudo marcado)
  
  ☐ Ao clicar:
    await firebase.updateServiceOrder(companyCnpj, osId, {
      status: 'ETAPA2',
      etapa1: { chegouLocal, atendeuCliente, ... }
    });

☐ ETAPA 2: Checklist
  ☐ Array de items (baseado em tipoServico)
  ☐ Cada item tem:
    - Checkbox (sim/não)
    - TextField (observações)
    - Camera (foto)
    - Time input (tempo gasto)
  
  ☐ Seção de Materiais:
    - Material name
    - Quantidade
    - Valor unitário
    - Subtotal (auto)
    - Total acumulado
  
  ☐ Botão "Próxima Etapa"
  
  ☐ Ao clicar:
    await firebase.updateServiceOrder(..., {
      status: 'ETAPA3',
      etapa2: { checklist, materiais, ... }
    });

☐ ETAPA 3: Finalização
  ☐ 3 checkboxes:
    - Limpei o local
    - Expliquei o resultado
    - Cliente aprovou
  
  ☐ Rating: Avaliação (1-5 stars)
  
  ☐ TextField: Observações finais
  
  ☐ Resumo financeiro (read-only):
    - Valor base
    - Materiais
    - Total
  
  ☐ Botão "Finalizar" (vermelho)
  
  ☐ Ao clicar:
    await firebase.updateServiceOrder(..., {
      status: 'CONCLUIDA',
      etapa3: { ... }
    });
    
    // Notificar central
    await firebase.notifyAllUsers(...);

☐ TESTE: Complete todas as 3 etapas
  → Firebase Console: veja etapa1, etapa2, etapa3 preenchidas
  → Web Dashboard: veja progresso em tempo real
```

### FASE 5: Chat - ChatScreen (3-4 horas)

**Checklist:**
```
☐ Crie ChatScreen.jsx

☐ Carregar mensagens iniciais:
  const messages = await firebase.listMessages(
    companyCnpj, 
    chatId
  );

☐ Listener para novas mensagens (real-time):
  db.ref(`chats/${companyCnpj}/${chatId}/messages`)
    .on('child_added', (snapshot) => {
      // Adicionar mensagem
    });

☐ Renderize messages:
  - Se sender='prestador': alinhado à direita
  - Se sender='central': alinhado à esquerda
  - Mostra timestamp
  - Mostra read status (✓, ✓✓)

☐ Input para enviar mensagem:
  - TextField
  - Botão Enviar
  
  ☐ handleSendMessage:
    await firebase.sendMessage(companyCnpj, chatId, {
      sender: 'prestador',
      prestadorId: prestadorId,
      text: message,
      timestamp: new Date().toISOString()
    });

☐ Botão para enviar foto:
  - Selecionar da galeria
  - Upload para Storage
  - Enviar link no chat

☐ TESTE: Envie mensagem no app
  → Firebase Console: veja aparecer em messages
  → Web Dashboard: veja mensagem em tempo real no chat
```

### FASE 6: Perfil - ProfileScreen (2-3 horas)

**Checklist:**
```
☐ Crie ProfileScreen.jsx

☐ Carregue dados do prestador:
  const user = await firebase.updateUser(...);

☐ Mostra:
  - Nome
  - Especialidades
  - Avaliação média
  - Total de serviços
  - Histórico de OS (últimas 10)

☐ Editar especialidades:
  - Botão "Editar"
  - Adicionar/remover tags
  - Salvar

☐ Botão Logout:
  - Limpar localStorage
  - Navegar para Login

☐ TESTE: Veja dados corretos
```

### FASE 7: Testes e Polimento (3-5 horas)

**Checklist:**
```
☐ Teste em device real (Android)
  ☐ Login
  ☐ Listar OS
  ☐ Aceitar OS
  ☐ Mapa
  ☐ Etapas
  ☐ Chat
  ☐ Perfil

☐ Teste em device real (iOS)
  ☐ Repita todos os testes

☐ Teste de performance
  ☐ Geolocalização não drena bateria rápido
  ☐ Imagens comprimem corretamente
  ☐ Chat não fica lento com muitas mensagens

☐ Teste offline
  ☐ App não quebra sem internet
  ☐ Salvar draft de mensagens

☐ Polimento
  ☐ Melhorar UX
  ☐ Corrigir bugs
  ☐ Optimizar performance
```

---

## 🚀 DEPLOY (2-3 horas)

```
☐ Build APK para Android
  npx react-native build-android

☐ Build IPA para iOS
  npx react-native build-ios

☐ Upload para Play Store
  - Crie conta developer
  - Configure app signing
  - Upload APK

☐ Upload para App Store
  - Crie conta Apple Developer
  - Configure provisioning profiles
  - Upload IPA

☐ Monitoring
  ☐ Setup Crashlytics
  ☐ Setup Analytics
  ☐ Setup Performance Monitoring
```

---

## 🧪 TESTES END-TO-END

### Teste 1: Fluxo Completo de Uma OS
```
☐ Central cria OS no web
☐ Prestador vê no app
☐ Prestador aceita
☐ Central vê em tempo real
☐ Prestador faz rota
☐ Prestador executa 3 etapas
☐ Central vê progresso em tempo real
☐ Chat funciona nos dois lados
☐ Prestador finaliza
☐ Central vê CONCLUIDA
```

### Teste 2: Sincronização Real-Time
```
☐ Abra web e app lado a lado
☐ Mude algo no app
☐ Veja atualizar no web < 1 segundo
☐ Mude algo no web
☐ Veja atualizar no app < 1 segundo
```

### Teste 3: Chat em Tempo Real
```
☐ Envie mensagem do app
☐ Veja aparecer no web imediatamente
☐ Envie resposta do web
☐ Veja aparecer no app imediatamente
☐ Imagens funcionam
```

---

## ✅ ANTES DE CONSIDERAR PRONTO

```
☐ Todos os componentes criados
☐ Firebase.js reutilizado corretamente
☐ Dados sincronizam em tempo real
☐ Chat funciona ambos os lados
☐ Fotos fazem upload
☐ Testes em device real passaram
☐ Performance aceitável
☐ Sem erros de console
☐ Offline handling implementado
☐ Push notifications configuradas (FCM)
```

---

## 📊 TEMPO ESTIMADO FINAL

```
Leitura:               1 hora
Setup Inicial:         2-3 horas
Auth:                  2-3 horas
Listagem:              3-4 horas
Mapa:                  4-5 horas
Execução:              5-6 horas
Chat:                  3-4 horas
Perfil:                2-3 horas
Testes/Polimento:      3-5 horas
Deploy:                2-3 horas
─────────────────────────────
TOTAL:                 ~25-40 horas

Para MVP completo: ~25-30 horas
Para versão 1.0 refinada: ~35-40 horas
```

---

## 🎯 FASES EM PARALELO

Se você tiver mais gente:

```
Pessoa 1: Auth + Listagem
Pessoa 2: Mapa + Execução
Pessoa 3: Chat + Perfil
Pessoa 4: Testes + Deploy

Resultado: ~15-20 horas com equipe
```

---

## 📞 DÚVIDAS DURANTE DESENVOLVIMENTO?

```
❓ "Como carregar OS do Firebase?"
→ Ver: GUIA_INTEGRACAO_FIREBASE_PRESTADOR.md PASSO 2

❓ "Como fazer upload de fotos?"
→ Ver: PROMPT_APP_PRESTADORES.md seção 6

❓ "Como fazer chat funcionar?"
→ Ver: GUIA_INTEGRACAO_FIREBASE_PRESTADOR.md PASSO 4

❓ "Como dados sincronizam?"
→ Ver: FLUXO_DADOS_FIREBASE_PRESTADOR.md

❓ "Onde vejo os dados no Firebase?"
→ Ver: FIREBASE_CONSOLE_WALKTHROUGH.md

❓ "Qual é a próxima etapa?"
→ Ver: README_INTEGRACAO_FIREBASE.md
```

---

## 🎉 RESULTADO FINAL

Depois de completar este checklist, você terá:

```
✅ Aplicativo de Prestadores completo
✅ Login seguro com Firebase
✅ Listagem de OS em tempo real
✅ Aceitar OS com sincronização imediata
✅ Navegação com Google Maps
✅ 3 etapas de execução com fotos
✅ Chat integrado com central
✅ Perfil do prestador
✅ 100% sincronizado com Dashboard web
✅ Dados salvos no Firebase (na nuvem)
✅ Pronto para deploy
```

**App de Prestadores FUNCIONAL e PRONTO PARA PRODUÇÃO!** 🚀

---

**Bora codar! Let's go! 💪**

