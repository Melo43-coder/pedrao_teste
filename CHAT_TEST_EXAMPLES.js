// ============================================
// EXEMPLO DE USO DO CHAT - TESTE RÁPIDO
// ============================================

// Para testar as funções Firebase:

import * as firebase from './services/firebase';

// Dados de teste
const testCNPJ = "11222333000181";  // CNPJ da sua empresa
const testCPF1 = "12345678900";      // CPF do funcionário 1
const testCPF2 = "98765432100";      // CPF do funcionário 2
const testNome1 = "João Silva";
const testNome2 = "Maria Santos";

// ============================================
// 1. CRIAR UM CHAT
// ============================================

async function criarChatTeste() {
  try {
    const novoChat = await firebase.createChat(testCNPJ, {
      titulo: "Chat de Teste - Projeto X",
      participantes: [testCPF1, testCPF2],
      tipo: "funcionario-prestador",
      descricao: "Conversa para discussão do Projeto X"
    });
    
    console.log("✅ Chat criado:", novoChat);
    console.log("📍 Chat ID:", novoChat.id);
    
    return novoChat.id;
  } catch (error) {
    console.error("❌ Erro ao criar chat:", error);
  }
}

// ============================================
// 2. LISTAR CHATS DO USUÁRIO
// ============================================

async function listarChatsTeste() {
  try {
    const chats = await firebase.listChats(testCNPJ, testCPF1);
    
    console.log("📋 Chats do usuário:", chats);
    console.log("Total de chats:", chats.length);
    
    chats.forEach(chat => {
      console.log(`  - ${chat.titulo} (${chat.participantes.length} participantes)`);
    });
    
    return chats;
  } catch (error) {
    console.error("❌ Erro ao listar chats:", error);
  }
}

// ============================================
// 3. ENVIAR MENSAGEM
// ============================================

async function enviarMensagemTeste(chatId) {
  try {
    const novaMensagem = await firebase.sendMessage(testCNPJ, chatId, {
      cpfEnvio: testCPF1,
      nomeEnvio: testNome1,
      conteudo: "Olá pessoal! Como está o projeto?",
      tipo: "texto"
    });
    
    console.log("✅ Mensagem enviada:", novaMensagem);
    console.log("📝 Conteúdo:", novaMensagem.conteudo);
    console.log("🕐 Enviada em:", novaMensagem.dataCriacao);
    
    return novaMensagem.id;
  } catch (error) {
    console.error("❌ Erro ao enviar mensagem:", error);
  }
}

// ============================================
// 4. LISTAR MENSAGENS
// ============================================

async function listarMensagensTeste(chatId) {
  try {
    const mensagens = await firebase.listMessages(testCNPJ, chatId, 50);
    
    console.log("💬 Mensagens da conversa:", mensagens);
    console.log("Total de mensagens:", mensagens.length);
    
    mensagens.forEach((msg, index) => {
      console.log(`  ${index + 1}. ${msg.nomeEnvio}: "${msg.conteudo}" (${msg.dataCriacao})`);
    });
    
    return mensagens;
  } catch (error) {
    console.error("❌ Erro ao listar mensagens:", error);
  }
}

// ============================================
// 5. MARCAR COMO LIDA
// ============================================

async function marcarComolIdaTeste(chatId, messageId) {
  try {
    await firebase.markMessageAsRead(testCNPJ, chatId, messageId);
    console.log("✅ Mensagem marcada como lida");
  } catch (error) {
    console.error("❌ Erro ao marcar como lida:", error);
  }
}

// ============================================
// 6. DELETAR MENSAGEM
// ============================================

async function deletarMensagemTeste(chatId, messageId) {
  try {
    await firebase.deleteMessage(testCNPJ, chatId, messageId);
    console.log("✅ Mensagem deletada");
  } catch (error) {
    console.error("❌ Erro ao deletar mensagem:", error);
  }
}

// ============================================
// 7. ATUALIZAR STATUS DO USUÁRIO
// ============================================

async function atualizarStatusTeste(cpf, novoStatus) {
  try {
    await firebase.updateUserStatus(testCNPJ, cpf, novoStatus);
    console.log(`✅ Status de ${cpf} atualizado para: ${novoStatus}`);
  } catch (error) {
    console.error("❌ Erro ao atualizar status:", error);
  }
}

// ============================================
// TESTE COMPLETO (Rodar em Sequência)
// ============================================

async function testeCompleto() {
  console.log("\n🎬 INICIANDO TESTE COMPLETO DO CHAT\n");
  
  // 1. Criar chat
  console.log("1️⃣ Criando chat...");
  const chatId = await criarChatTeste();
  
  if (!chatId) {
    console.error("Não foi possível criar chat");
    return;
  }
  
  // 2. Listar chats
  console.log("\n2️⃣ Listando chats...");
  await listarChatsTeste();
  
  // 3. Enviar primeira mensagem (João)
  console.log("\n3️⃣ João envia mensagem...");
  const msgId1 = await enviarMensagemTeste(chatId);
  
  // 4. Esperar um pouco
  await new Promise(r => setTimeout(r, 1000));
  
  // 5. Enviar segunda mensagem (Maria)
  console.log("\n4️⃣ Maria envia resposta...");
  const msgId2 = await firebase.sendMessage(testCNPJ, chatId, {
    cpfEnvio: testCPF2,
    nomeEnvio: testNome2,
    conteudo: "Ótimo! Estou focando na implementação da API.",
    tipo: "texto"
  });
  console.log("✅ Mensagem de Maria enviada");
  
  // 6. Listar todas as mensagens
  console.log("\n5️⃣ Listando todas as mensagens...");
  const todasMsgs = await listarMensagensTeste(chatId);
  
  // 7. Atualizar status
  console.log("\n6️⃣ Atualizando status dos usuários...");
  await atualizarStatusTeste(testCPF1, "online");
  await atualizarStatusTeste(testCPF2, "offline");
  
  console.log("\n✨ TESTE COMPLETO FINALIZADO!\n");
}

// ============================================
// EXEMPLO DE USO NO REACT
// ============================================

/*
import { useEffect, useState } from 'react';
import * as firebase from './services/firebase';

function MeuChat() {
  const [chats, setChats] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const companyCnpj = localStorage.getItem('companyCnpj');
  const userCpf = localStorage.getItem('userCpf');
  
  // Carregar chats ao montar componente
  useEffect(() => {
    carregarChats();
  }, []);
  
  const carregarChats = async () => {
    try {
      const dados = await firebase.listChats(companyCnpj, userCpf);
      setChats(dados);
    } catch (error) {
      console.error('Erro:', error);
    }
  };
  
  const enviarMensagem = async (chatId, conteudo) => {
    try {
      await firebase.sendMessage(companyCnpj, chatId, {
        cpfEnvio: userCpf,
        nomeEnvio: "Seu Nome",
        conteudo: conteudo,
        tipo: "texto"
      });
      
      // Recarregar mensagens
      const msgs = await firebase.listMessages(companyCnpj, chatId);
      setMensagens(msgs);
    } catch (error) {
      console.error('Erro ao enviar:', error);
    }
  };
  
  return (
    <div>
      <h1>Meus Chats</h1>
      {chats.map(chat => (
        <div key={chat.id}>
          <h3>{chat.titulo}</h3>
          <button onClick={() => carregarMensagens(chat.id)}>
            Abrir
          </button>
        </div>
      ))}
    </div>
  );
}
*/

// ============================================
// EXECUTAR TESTE
// ============================================

// Descomente a linha abaixo para rodar o teste
// testeCompleto();

export {
  criarChatTeste,
  listarChatsTeste,
  enviarMensagemTeste,
  listarMensagensTeste,
  marcarComolIdaTeste,
  deletarMensagemTeste,
  atualizarStatusTeste,
  testeCompleto
};
