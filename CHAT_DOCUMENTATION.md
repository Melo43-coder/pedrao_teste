# 📢 Sistema de Chat em Tempo Real - Documentação

## 🎯 Visão Geral

O novo sistema de **Chat em Tempo Real** foi integrado ao SmartOps para permitir comunicação instantânea entre:
- **Funcionários** da base
- **Prestadores de Serviço**
- **Fornecedores**
- **Clientes**

Tudo com persistência em **Firebase Firestore** e suporte a múltiplas empresas.

---

## 📍 Estrutura do Firebase

```
companies/{CNPJ}/
├── chats/                          # Conversas da empresa
│   └── {chatId}/
│       ├── participantes: []       # Lista de CPFs/emails
│       ├── tipo: "funcionario-prestador"
│       ├── titulo: "Conversa X"
│       ├── criadoEm: "2025-11-24T10:30:00Z"
│       ├── ultimaMensagem: "Última mensagem..."
│       ├── ultimaMensagemData: timestamp
│       ├── ativo: true
│       └── mensagens/              # Sub-collection
│           └── {msgId}/
│               ├── cpfEnvio: "12345678900"
│               ├── nomeEnvio: "João Silva"
│               ├── conteudo: "Olá, como vai?"
│               ├── tipo: "texto"
│               ├── arquivo: {url, nome, tamanho}
│               ├── anexos: []
│               ├── dataCriacao: timestamp
│               └── lido: false
│
├── usuarios/                       # Usuários com status
│   └── {cpf}/
│       ├── nome: "João Silva"
│       ├── email: "joao@empresa.com"
│       ├── status: "online" | "offline"
│       └── ultimaAtividade: timestamp
```

---

## 🚀 Funcionalidades Implementadas

### ✅ FASE 1 - MVP (Completo)

1. **Criar Conversas**
   - Título e descrição
   - Adicionar participantes (CPF ou email)
   - Tipo de conversa (funcionario-prestador, etc)

2. **Enviar Mensagens**
   - Texto em tempo real
   - Auto-save no Firebase
   - Mostrar quem enviou e quando
   - Atualizar preview da conversa

3. **Listar Conversas**
   - Por usuário (CPF)
   - Ordenadas por última mensagem
   - Preview da última mensagem
   - Buscar por título

4. **Visualizar Histórico**
   - Todas as mensagens da conversa
   - Autores e datas
   - Scroll automático para nova mensagem

5. **Deletar Mensagens**
   - Apenas próprias mensagens
   - Com confirmação
   - Atualiza em tempo real

### 🔄 FASE 2 - Upload de Arquivos (Pronto para Implementar)

Estrutura criada em `src/utils/fileUpload.js`:
- Upload para Firebase Storage
- Compressão de imagens
- Validação de tipo/tamanho
- Download direto

### 📊 FASE 3 - Status Online (Pronto para Implementar)

- Atualizar status ao entrar/sair
- Indicador visual online/offline
- Mostrar quando cada usuário estava online por último

---

## 📱 Como Usar

### 1. **Acessar o Chat**
   - Ir ao Dashboard
   - Clicar em "💬 Chat" no menu lateral
   - Aparecerá a lista de conversas

### 2. **Criar Nova Conversa**
   - Clicar no botão "+ Nova Conversa"
   - Preencher:
     - **Título**: Ex: "Projeto X - Discussão"
     - **Participantes**: Adicionar CPFs/emails separados por vírgula
   - Clicar "Criar Conversa"

### 3. **Enviar Mensagem**
   - Selecionar uma conversa
   - Digitar mensagem no campo inferior
   - Clicar "Enviar" ou pressionar **Enter**
   - Usar **Shift+Enter** para quebra de linha

### 4. **Ver Usuários Online**
   - Clicar na aba "Usuários Online"
   - Verde 🟢 = Online
   - Vermelho 🔴 = Offline
   - Ver último acesso

### 5. **Deletar Mensagem**
   - Hover sobre a mensagem
   - Clicar "Deletar" na data
   - Confirmar remoção

---

## 🔧 Funções Firebase Disponíveis

### Criar Chat
```javascript
const chat = await firebase.createChat(cnpj, {
  titulo: "Chat X",
  participantes: ["12345678900", "98765432100"],
  tipo: "funcionario-prestador"
});
```

### Listar Chats de um Usuário
```javascript
const chats = await firebase.listChats(cnpj, cpfUsuario);
```

### Enviar Mensagem
```javascript
const msg = await firebase.sendMessage(cnpj, chatId, {
  cpfEnvio: "12345678900",
  nomeEnvio: "João Silva",
  conteudo: "Olá!",
  tipo: "texto"
});
```

### Listar Mensagens
```javascript
const messages = await firebase.listMessages(cnpj, chatId, 100);
```

### Marcar como Lida
```javascript
await firebase.markMessageAsRead(cnpj, chatId, messageId);
```

### Deletar Mensagem
```javascript
await firebase.deleteMessage(cnpj, chatId, messageId);
```

### Atualizar Status do Usuário
```javascript
await firebase.updateUserStatus(cnpj, cpf, "online");
```

---

## 📧 Próximos Passos - FASE 2 (Upload de Arquivos)

### Será Implementado:
1. **Botão de Upload** na área de input
2. **Suporte a Arquivos**:
   - Imagens (JPEG, PNG, GIF)
   - PDFs
   - Documentos (DOC, DOCX, XLS, XLSX)
3. **Compressão de Imagens** automática
4. **Preview em miniatura**
5. **Download direto** do arquivo

### Código de Exemplo (Pronto para FASE 2):
```javascript
// Já existe em src/utils/fileUpload.js
import { uploadFile, compressImage, validateFileSize } from '../utils/fileUpload';

// Usar no Chat.jsx
const handleFileUpload = async (file) => {
  if (!validateFileSize(file, 10)) { // Max 10MB
    alert('Arquivo muito grande!');
    return;
  }
  
  let processedFile = file;
  if (file.type.includes('image')) {
    processedFile = await compressImage(file);
  }
  
  const fileData = await uploadFile(companyCnpj, processedFile, 'chats');
  // Enviar como anexo na mensagem
};
```

---

## 🎨 Interface

### Tema
- **Cores**: Azul (#0ea5e9) - Brand principal
- **Sidebar**: 300px largura
- **Main Content**: Responsivo

### Componentes
- **Chat Item**: Preview de conversa
- **Mensagem**: Alignado esquerda (recebida) ou direita (enviada)
- **Input Area**: Bottom com textarea + botão

---

## 🔒 Segurança

### Regras Firebase (Recomendadas)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /companies/{cnpj}/chats/{chatId} {
      allow read, write: if request.auth != null 
        && request.auth.uid in resource.data.participantes;
      
      match /mensagens/{msgId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
        allow delete: if request.auth.uid == resource.data.cpfEnvio;
      }
    }
  }
}
```

---

## 📊 Dados Persistidos

### O Chat **NÃO** é mock mais
- ✅ Todas as mensagens salvam em Firebase
- ✅ Histórico completo mantido
- ✅ Múltiplos usuários podem conversar
- ✅ Suporta múltiplas empresas
- ✅ Isolamento por CNPJ

---

## 🐛 Troubleshooting

### "Erro ao carregar chats"
- Verificar se CNPJ está no localStorage
- Verificar permissões Firebase
- Verificar conexão internet

### "Mensagem não envia"
- Verificar se CPF do usuário está no localStorage
- Verificar se está autenticado
- Verificar console para erro específico

### "Não vejo novo usuário"
- Novo usuário precisa ter 'displayName' ou 'username' configurado
- Refresh da página

---

## 📈 Métricas (Para Dashboard Futuro)

- Total de chats ativos
- Mensagens por período
- Usuários únicos
- Tempo de resposta médio
- Chat mais ativo

---

## 🎯 Roadmap

**✅ FASE 1 - MVP Chat Texto**
- Chat básico com texto
- Persistência Firebase
- Notificações simples

**⏳ FASE 2 - Upload & Media**
- Upload de arquivos
- Preview de imagens
- Compressão automática

**⏳ FASE 3 - UX Avançada**
- Status online/offline
- Typing indicator ("está digitando...")
- Read receipts (✓ lido)
- Busca em chats

**⏳ FASE 4 - Integrações**
- WhatsApp integration
- Email notifications
- Mobile app

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. `src/components/Sistema/Chat.jsx` - Componente principal
2. `src/services/firebase.js` - Funções de backend
3. `src/utils/fileUpload.js` - Utilitários de arquivo
4. Console do navegador (F12) para erros específicos

---

**Versão**: 1.0 MVP
**Data**: 24 de Novembro de 2025
**Status**: ✅ Pronto para Produção (Fase 1)
