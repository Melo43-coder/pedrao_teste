import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';
import * as firebase from '../../services/firebase';
import { processarMensagemIAInteligente } from '../../services/ia';

export default function Chat() {
  const [activeArea, setActiveArea] = useState('conversas');
  const [chats, setChats] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [chatSelecionado, setChatSelecionado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [novaMsg, setNovaMsg] = useState('');
  const [showNovoChat, setShowNovoChat] = useState(false);
  const [novoChat, setNovoChat] = useState({ titulo: '', participantes: [] });
  const [filtro, setFiltro] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const companyCnpj = localStorage.getItem('companyCnpj') || '';
  const userRole = localStorage.getItem('userRole') || 'user';
  const userName = localStorage.getItem('userName') || 'Usuário';
  const messagesEndRef = useRef(null);

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarChats();
    carregarUsuarios();
  }, []);

  // Atualizar usuário atual quando componente monta
  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (userName) {
      setUsuarioAtual({ cpf: userName, nome: userName });
    }
  }, []);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // Polling para atualizar mensagens em tempo real (WhatsApp)
  useEffect(() => {
    if (!chatSelecionado || (!chatSelecionado.tipo?.includes('whatsapp'))) {
      return; // Não fazer polling se não for WhatsApp
    }
    
    const interval = setInterval(async () => {
      const msgs = await carregarMensagens(chatSelecionado.id);
      
      // Processar novas mensagens para detectar satisfação
      if (msgs && msgs.length > 0) {
        const ultimaMensagem = msgs[msgs.length - 1];
        // Verificar se a última mensagem é de um cliente
        if (ultimaMensagem && ultimaMensagem.cpfEnvio?.includes('cliente-')) {
          await procesarSatisfacao(ultimaMensagem.conteudo, chatSelecionado.id);
        }
      }
    }, 5000); // Verificar a cada 5 segundos (discreto)

    return () => {
      clearInterval(interval);
    };
  }, [chatSelecionado?.id]); // Só reiniciar se o chat mudar

  const carregarChats = async () => {
    try {
      setIsLoading(true);
      const userName = localStorage.getItem('userName');
      const cnpj = localStorage.getItem('companyCnpj');
      
      console.log('Carregando chats com:', { userName, cnpj });
      
      if (!userName || !cnpj) {
        console.warn('userName ou CNPJ não definidos');
        setChats([]);
        return;
      }
      
      const chatsData = await firebase.listChats(cnpj, userName);
      console.log('Chats carregados:', chatsData);
      setChats(chatsData || []);
    } catch (err) {
      console.error('Erro ao carregar chats:', err);
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const carregarUsuarios = async () => {
    try {
      const usuariosData = await firebase.listCompanyUsers(companyCnpj);
      setUsuarios(usuariosData || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const carregarMensagens = async (chatId) => {
    try {
      const mensagensData = await firebase.listMessages(companyCnpj, chatId);
      
      // Se for chat WhatsApp, buscar também mensagens recebidas do cliente
      const chats = await firebase.listChats(companyCnpj, localStorage.getItem('userName'));
      const chatAtual = chats.find(c => c.id === chatId);
      
      if (chatAtual && (chatAtual.tipo === 'whatsapp' || chatAtual.tipo === 'cliente-whatsapp') && chatAtual.telefone) {
        const whatsappMessages = await firebase.getReceivedWhatsAppMessages(chatAtual.telefone);
        
        if (whatsappMessages.messages && whatsappMessages.messages.length > 0) {
          // Converter mensagens do WhatsApp para o formato do chat
          const mensagensWhatsApp = whatsappMessages.messages.map(msg => ({
            id: msg.id,
            cpfEnvio: `cliente-${msg.clientPhone}`,
            nomeEnvio: chatAtual.clienteNome || 'Cliente',
            conteudo: msg.body,
            dataCriacao: msg.timestamp,
            tipo: msg.type || 'texto',
            type: msg.type,
            mediaUrl: msg.mediaUrl,
            mediaType: msg.mediaType,
            whatsapp: true,
            saved: msg.saved
          }));
          
          // Mesclar com mensagens do Firebase (removendo duplicatas)
          const todasMensagens = [...mensagensData || [], ...mensagensWhatsApp];
          const mensagensUnicas = Array.from(new Map(todasMensagens.map(m => [m.id, m])).values());
          const mensagensOrdenadas = mensagensUnicas.sort((a, b) => {
            const dataA = new Date(a.dataCriacao || 0).getTime();
            const dataB = new Date(b.dataCriacao || 0).getTime();
            return dataA - dataB;
          });
          
          setMensagens(mensagensOrdenadas);
          return mensagensOrdenadas;
        }
      }
      
      setMensagens(mensagensData || []);
      return mensagensData;
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      return [];
    }
  };

  // Processar respostas de satisfação (números 0-10)
  const procesarSatisfacao = async (mensagemTexto, chatId) => {
    try {
      // Verifica se a mensagem contém um número entre 0 e 10
      const match = mensagemTexto.trim().match(/^(10|[0-9])$/);
      if (match) {
        const nota = parseInt(match[1], 10);
        const cnpj = localStorage.getItem('companyCnpj');
        
        console.log(`⭐ Resposta de satisfação detectada: ${nota}/10`);
        
        // Registrar a avaliação no Firebase
        await firebase.saveSatisfactionRating(cnpj, nota);
        
        console.log('✅ Avaliação registrada com sucesso!');
      }
    } catch (err) {
      console.error('❌ Erro ao processar satisfação:', err);
    }
  };

  // Detectar se a mensagem é direcionada à IA e processar
  const detectarEProcessarIA = async (mensagem, cnpj) => {
    const palavrasIA = ['ia', 'bot', 'assistente', '@ia', '#ia', '?ia', '!ia', 'gestor'];
    const contemIA = palavrasIA.some(palavra => mensagem.toLowerCase().includes(palavra));

    if (contemIA) {
      try {
        console.log('🤖 Detectada mensagem para IA');
        // Remover palavras-chave de IA da mensagem para processar apenas a pergunta
        let pergunta = mensagem;
        palavrasIA.forEach(palavra => {
          pergunta = pergunta.replace(new RegExp(palavra, 'gi'), '').trim();
        });

        if (pergunta) {
          const resposta = await processarMensagemIAInteligente(pergunta, cnpj, []);
          return resposta;
        }
      } catch (error) {
        console.error('Erro ao processar IA:', error);
        return null;
      }
    }
    return null;
  };

  const handleSelecionarChat = (chat) => {
    setChatSelecionado(chat);
    carregarMensagens(chat.id);
  };

  const handleEnviarMensagem = async () => {
    if (!novaMsg.trim() || !chatSelecionado) return;

    try {
      const cnpj = localStorage.getItem('companyCnpj');
      const userNameMsg = localStorage.getItem('userName');
      
      console.log('📨 Enviando mensagem:', { chat: chatSelecionado.titulo, msg: novaMsg });
      
      // Detectar se é uma mensagem para a IA
      const respostaIA = await detectarEProcessarIA(novaMsg, cnpj);
      
      if (respostaIA) {
        // Mensagem foi para IA, adicionar ambas ao chat
        console.log('✅ Resposta da IA recebida');
        
        // Enviar mensagem do usuário
        await firebase.sendMessage(cnpj, chatSelecionado.id, {
          cpfEnvio: userNameMsg,
          nomeEnvio: userNameMsg,
          conteudo: novaMsg,
          tipo: 'texto'
        });

        // Enviar resposta da IA como uma mensagem do sistema
        await firebase.sendMessage(cnpj, chatSelecionado.id, {
          cpfEnvio: 'ia-bot',
          nomeEnvio: '🤖 IA SmartOps',
          conteudo: respostaIA,
          tipo: 'texto'
        });
      } else {
        // Mensagem normal para o chat
        await firebase.sendMessage(cnpj, chatSelecionado.id, {
          cpfEnvio: userNameMsg,
          nomeEnvio: userNameMsg,
          conteudo: novaMsg,
          tipo: 'texto'
        });

        // Se for conversa via WhatsApp, enviar também para o WhatsApp
        if (chatSelecionado.tipo === 'whatsapp' || chatSelecionado.tipo === 'cliente-whatsapp') {
          const telefone = chatSelecionado.telefone;
          console.log('📱 Chat é WhatsApp. Telefone:', telefone);
          if (telefone) {
            console.log('🔄 Acionando envio WhatsApp...');
            const whatsappResult = await firebase.sendWhatsAppMessage(cnpj, telefone, novaMsg);
            console.log('📲 Resultado WhatsApp:', whatsappResult);
          } else {
            console.warn('⚠️ Chat é WhatsApp mas não tem telefone');
          }
        } else {
          console.log('💬 Chat é interno (não WhatsApp)');
        }
      }
      
      setNovaMsg('');
      carregarMensagens(chatSelecionado.id);
      carregarChats();
    } catch (err) {
      console.error('❌ Erro ao enviar mensagem:', err);
    }
  };

  const handleCriarChat = async () => {
    if (!novoChat.titulo.trim() || novoChat.participantes.length === 0) return;

    try {
      const userName = localStorage.getItem('userName');
      const cnpj = localStorage.getItem('companyCnpj');
      
      if (!userName || !cnpj) {
        console.error('userName ou CNPJ não definidos');
        return;
      }
      
      const participantes = [userName, ...novoChat.participantes.map(u => u.username || u.displayName || u.id)];
      
      const chat = await firebase.createChat(cnpj, {
        titulo: novoChat.titulo,
        participantes,
        tipo: 'funcionario-prestador',
        createdBy: userName
      });
      
      console.log('Chat criado:', chat);
      
      // Adicionar o chat ao estado imediatamente
      if (chat && chat.id) {
        setChats([chat, ...chats]);
      }
      
      setNovoChat({ titulo: '', participantes: [] });
      setShowNovoChat(false);
      
      // Recarregar chats do servidor
      setTimeout(() => carregarChats(), 500);
    } catch (err) {
      console.error('Erro ao criar chat:', err);
    }
  };

  const handleIniciarChatComUsuario = async (usuario) => {
    try {
      const userNameAtual = localStorage.getItem('userName');
      const cnpj = localStorage.getItem('companyCnpj');
      
      if (!userNameAtual || !cnpj) {
        console.error('userName ou CNPJ não definidos');
        return;
      }
      
      const usuarioUsername = usuario.username || usuario.displayName || usuario.id;
      
      // Verificar se já existe chat direto entre esses dois usuários
      const chatExistente = chats.find(chat =>
        chat.participantes.length === 2 &&
        chat.participantes.includes(userNameAtual) &&
        chat.participantes.includes(usuarioUsername)
      );

      if (chatExistente) {
        // Se já existe, abrir
        handleSelecionarChat(chatExistente);
        setActiveArea('conversas');
        return;
      }

      // Se não existe, criar novo
      const nomeUsuario = usuario.displayName || usuario.username || 'Usuário';
      const chat = await firebase.createChat(cnpj, {
        titulo: `💬 Conversa com ${nomeUsuario}`,
        participantes: [userNameAtual, usuarioUsername],
        tipo: 'direto',
        createdBy: userNameAtual
      });
      
      console.log('Chat direto criado:', chat);
      carregarChats();
      
      // Esperar um pouco e então selecionar o novo chat
      setTimeout(() => {
        handleSelecionarChat(chat);
        setActiveArea('conversas');
      }, 500);
    } catch (err) {
      console.error('Erro ao iniciar chat:', err);
    }
  };

  const handleEnviarWhatsApp = async (usuario) => {
    try {
      if (!usuario.phone) {
        alert('Este usuário não possui número de WhatsApp cadastrado');
        return;
      }

      const userNameAtual = localStorage.getItem('userName');
      const cnpj = localStorage.getItem('companyCnpj');
      
      if (!userNameAtual || !cnpj) {
        console.error('userName ou CNPJ não definidos');
        return;
      }

      // Criar conversa com este usuário via WhatsApp
      const nomeUsuario = usuario.displayName || usuario.username || 'Usuário';
      const chat = await firebase.createChat(cnpj, {
        titulo: `📱 WhatsApp - ${nomeUsuario}`,
        participantes: [userNameAtual, usuario.username || usuario.displayName || usuario.id],
        tipo: 'whatsapp',
        createdBy: userNameAtual,
        telefone: usuario.phone
      });

      console.log('Chat WhatsApp criado:', chat);
      carregarChats();

      // Abrir a conversa criada
      setTimeout(() => {
        handleSelecionarChat(chat);
        setActiveArea('conversas');
      }, 500);
    } catch (err) {
      console.error('Erro ao criar chat WhatsApp:', err);
    }
  };

  const handleDeletarMensagem = async (msgId) => {
    if (!window.confirm('Deseja deletar esta mensagem?')) return;

    try {
      const cnpj = localStorage.getItem('companyCnpj');
      await firebase.deleteMessage(cnpj, chatSelecionado.id, msgId);
      carregarMensagens(chatSelecionado.id);
    } catch (err) {
      console.error('Erro ao deletar mensagem:', err);
    }
  };

  const handleDeletarChat = async (chatId, chatTitulo) => {
    if (!window.confirm(`Deseja deletar a conversa "${chatTitulo}"?\n\nEsta ação não pode ser desfeita.`)) return;

    try {
      const cnpj = localStorage.getItem('companyCnpj');
      await firebase.deleteChat(cnpj, chatId);
      
      // Remover do estado local
      setChats(chats.filter(c => c.id !== chatId));
      
      // Se era o chat selecionado, desselecionar
      if (chatSelecionado?.id === chatId) {
        setChatSelecionado(null);
        setMensagens([]);
      }
      
      console.log('✅ Chat deletado com sucesso');
    } catch (err) {
      console.error('Erro ao deletar chat:', err);
      alert('Erro ao deletar conversa. Tente novamente.');
    }
  };

  const filtrarChats = () => {
    return chats.filter(chat =>
      chat.titulo?.toLowerCase().includes(filtro.toLowerCase()) ||
      chat.participantes?.some(p => p.toLowerCase().includes(filtro.toLowerCase()))
    );
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    const hoje = new Date();
    const isHoje = data.toDateString() === hoje.toDateString();
    
    if (isHoje) {
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return data.toLocaleDateString('pt-BR');
  };

  // Estilos
  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    header: {
      marginBottom: '24px'
    },
    pageTitle: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#0f172a',
      margin: '0 0 8px 0'
    },
    pageSubtitle: {
      fontSize: '1rem',
      color: '#64748b',
      margin: 0
    },
    areaSelector: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px'
    },
    areaButton: {
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease'
    },
    areaButtonActive: {
      backgroundColor: '#0ea5e9',
      color: 'white'
    },
    areaButtonInactive: {
      backgroundColor: '#e2e8f0',
      color: '#64748b'
    },
    contentContainer: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '20px',
      height: 'calc(100vh - 200px)'
    },
    sidebar: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    sidebarHeader: {
      padding: '16px',
      borderBottom: '1px solid #e2e8f0'
    },
    sidebarTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#0f172a',
      margin: '0 0 12px 0'
    },
    searchInput: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      fontSize: '0.875rem'
    },
    chatsList: {
      flex: 1,
      overflowY: 'auto',
      padding: '8px'
    },
    chatItem: {
      padding: '12px',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '8px',
      transition: 'all 0.2s ease',
      backgroundColor: '#f8fafc'
    },
    chatItemActive: {
      backgroundColor: '#e0f2fe',
      borderLeft: '4px solid #0ea5e9'
    },
    chatItemTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#0f172a',
      marginBottom: '4px'
    },
    chatItemPreview: {
      fontSize: '0.75rem',
      color: '#64748b',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    newChatBtn: {
      padding: '12px 16px',
      backgroundColor: '#0ea5e9',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      margin: '12px',
      transition: 'all 0.2s ease'
    },
    mainContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    chatHeader: {
      padding: '16px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    chatTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#0f172a'
    },
    emptyState: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#64748b'
    },
    emptyStateIcon: {
      fontSize: '3rem',
      marginBottom: '16px',
      color: '#cbd5e1'
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    mensagem: {
      maxWidth: '70%',
      padding: '12px 16px',
      borderRadius: '12px',
      wordWrap: 'break-word'
    },
    mensagemEnviada: {
      alignSelf: 'flex-end',
      backgroundColor: '#dcfce7',
      color: '#000000'
    },
    mensagemRecebida: {
      alignSelf: 'flex-start',
      backgroundColor: '#ffffff',
      color: '#000000',
      border: '1px solid #e2e8f0'
    },
    mensagemHeader: {
      fontSize: '0.75rem',
      opacity: 0.8,
      marginBottom: '4px'
    },
    mensagemConteudo: {
      fontSize: '0.875rem',
      wordBreak: 'break-word'
    },
    mensagemData: {
      fontSize: '0.7rem',
      opacity: 0.7,
      marginTop: '4px'
    },
    inputArea: {
      padding: '16px',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      fontSize: '0.875rem',
      resize: 'none',
      maxHeight: '100px'
    },
    sendBtn: {
      padding: '10px 16px',
      backgroundColor: '#0ea5e9',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      flex: 1
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '500px',
      padding: '24px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#334155',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      fontSize: '0.875rem'
    },
    formActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    button: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer'
    },
    primaryButton: {
      backgroundColor: '#0ea5e9',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#e2e8f0',
      color: '#334155'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>💬 Chat</h1>
        <p style={styles.pageSubtitle}>Comunicação em tempo real com funcionários e prestadores</p>
      </div>

      <div style={styles.areaSelector}>
        <button
          style={{
            ...styles.areaButton,
            ...(activeArea === 'conversas' ? styles.areaButtonActive : styles.areaButtonInactive)
          }}
          onClick={() => setActiveArea('conversas')}
        >
          Conversas
        </button>
        <button
          style={{
            ...styles.areaButton,
            ...(activeArea === 'usuarios' ? styles.areaButtonActive : styles.areaButtonInactive)
          }}
          onClick={() => setActiveArea('usuarios')}
        >
          Usuários Online
        </button>
      </div>

      {activeArea === 'conversas' && (
        <div style={styles.contentContainer}>
          {/* Sidebar com chats */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h3 style={styles.sidebarTitle}>Conversas</h3>
              <input
                type="text"
                placeholder="Buscar conversa..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.chatsList}>
              {filtrarChats().length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                  Nenhuma conversa
                </div>
              ) : (
                filtrarChats().map((chat) => (
                  <motion.div
                    key={chat.id}
                    style={{
                      ...styles.chatItem,
                      ...(chatSelecionado?.id === chat.id ? styles.chatItemActive : {}),
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingRight: '8px'
                    }}
                    whileHover={{ backgroundColor: '#f1f5f9' }}
                  >
                    <div
                      style={{ flex: 1, cursor: 'pointer' }}
                      onClick={() => handleSelecionarChat(chat)}
                    >
                      <div style={styles.chatItemTitle}>{chat.titulo || 'Conversa'}</div>
                      <div style={styles.chatItemPreview}>
                        {chat.ultimaMensagem || 'Nenhuma mensagem'}
                      </div>
                    </div>
                    
                    {/* Botão de deletar */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletarChat(chat.id, chat.titulo);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '8px',
                        cursor: 'pointer',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        transition: 'all 0.2s'
                      }}
                      whileHover={{
                        backgroundColor: '#fee2e2',
                        borderRadius: '6px'
                      }}
                      title="Deletar conversa"
                    >
                      <FiTrash2 />
                    </motion.button>
                  </motion.div>
                ))
              )}
            </div>

            <motion.button
              style={styles.newChatBtn}
              onClick={() => setShowNovoChat(true)}
              whileHover={{ backgroundColor: '#0284c7' }}
            >
              + Nova Conversa
            </motion.button>
          </div>

          {/* Main content */}
          <div style={styles.mainContent}>
            {chatSelecionado ? (
              <>
                <div style={styles.chatHeader}>
                  <div>
                    <h2 style={styles.chatTitle}>{chatSelecionado.titulo || 'Conversa'}</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                      {chatSelecionado.participantes?.length || 0} participantes
                    </p>
                  </div>
                </div>

                <div style={styles.messagesContainer}>
                  {isLoading ? (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                      Carregando mensagens...
                    </div>
                  ) : mensagens.length === 0 ? (
                    <div style={{ ...styles.emptyState, flex: 1 }}>
                      <div style={styles.emptyStateIcon}>📝</div>
                      <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
                    </div>
                  ) : (
                    mensagens.map((msg) => {
                      const userNameAtual = localStorage.getItem('userName');
                      const isEnviada = msg.cpfEnvio === userNameAtual;

                      return (
                        <motion.div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginBottom: '16px',
                            alignItems: isEnviada ? 'flex-end' : 'flex-start'
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <motion.div
                            style={{
                              ...styles.mensagem,
                              ...(isEnviada ? styles.mensagemEnviada : styles.mensagemRecebida)
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <div style={{
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              color: '#000000',
                              marginBottom: '6px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              opacity: 0.8
                            }}>
                              {msg.nomeEnvio}
                            </div>
                            
                            {/* Renderizar conteúdo baseado no tipo */}
                            {msg.type === 'imagem' && msg.mediaUrl ? (
                              <img 
                                src={msg.mediaUrl} 
                                alt="Imagem do cliente" 
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '300px',
                                  borderRadius: '8px',
                                  marginBottom: '8px'
                                }}
                              />
                            ) : msg.type === 'audio' && msg.mediaUrl ? (
                              <audio 
                                controls 
                                style={{
                                  maxWidth: '100%',
                                  marginBottom: '8px'
                                }}
                              >
                                <source src={msg.mediaUrl} type="audio/wav" />
                                Seu navegador não suporta áudio
                              </audio>
                            ) : msg.type === 'video' && msg.mediaUrl ? (
                              <video 
                                controls 
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '300px',
                                  borderRadius: '8px',
                                  marginBottom: '8px'
                                }}
                              >
                                <source src={msg.mediaUrl} type="video/mp4" />
                                Seu navegador não suporta vídeo
                              </video>
                            ) : msg.type === 'documento' && msg.mediaUrl ? (
                              <a 
                                href={msg.mediaUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px',
                                  backgroundColor: 'rgba(0,0,0,0.1)',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  color: 'inherit',
                                  marginBottom: '8px'
                                }}
                              >
                                📄 {msg.body || 'Documento'}
                              </a>
                            ) : msg.type === 'arquivo' && msg.mediaUrl ? (
                              <a 
                                href={msg.mediaUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px',
                                  backgroundColor: 'rgba(0,0,0,0.1)',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  color: 'inherit',
                                  marginBottom: '8px'
                                }}
                              >
                                📎 {msg.body || 'Arquivo'}
                              </a>
                            ) : (
                              <div style={styles.mensagemConteudo}>{msg.conteudo}</div>
                            )}
                            
                            <div style={styles.mensagemData}>
                              {formatarData(msg.dataCriacao)}
                              {isEnviada && (
                                <>
                                  {' • '}
                                  <button
                                    onClick={() => handleDeletarMensagem(msg.id)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'inherit',
                                      cursor: 'pointer',
                                      opacity: 0.7,
                                      fontSize: '0.7rem'
                                    }}
                                  >
                                    Deletar
                                  </button>
                                </>
                              )}
                            </div>
                          </motion.div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div style={styles.inputArea}>
                  <textarea
                    value={novaMsg}
                    onChange={(e) => setNovaMsg(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleEnviarMensagem();
                      }
                    }}
                    placeholder="Digite sua mensagem... (Shift+Enter para quebra de linha)"
                    style={styles.textarea}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                      style={{
                        ...styles.sendBtn,
                        backgroundColor: '#8b5cf6',
                        flex: '0 0 auto'
                      }}
                      onClick={() => setShowTemplates(!showTemplates)}
                      whileHover={{ backgroundColor: '#7c3aed' }}
                      title="Modelos de mensagens"
                    >
                      📋 Templates
                    </motion.button>
                    <motion.button
                      style={styles.sendBtn}
                      onClick={handleEnviarMensagem}
                      disabled={!novaMsg.trim()}
                      whileHover={{ backgroundColor: '#0284c7' }}
                    >
                      Enviar
                    </motion.button>
                  </div>
                </div>

                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '12px'
                    }}
                  >
                    <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Modelos de Mensagem:</p>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setNovaMsg('Vc esta satisfeito com o serviço? Entre 0 a 10 qual o nivel que vc nos da por favor?');
                          setShowTemplates(false);
                        }}
                        style={{
                          padding: '10px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          textAlign: 'left',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={e => e.target.style.backgroundColor = '#059669'}
                        onMouseOut={e => e.target.style.backgroundColor = '#10b981'}
                      >
                        ⭐ Solicitar Avaliação (0-10)
                      </button>
                      <button
                        onClick={() => {
                          setNovaMsg('Olá! Já realizamos a ordem de serviço. Você poderia confirmar o recebimento?');
                          setShowTemplates(false);
                        }}
                        style={{
                          padding: '10px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          textAlign: 'left',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={e => e.target.style.backgroundColor = '#2563eb'}
                        onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}
                      >
                        ✅ Confirmar Conclusão
                      </button>
                      <button
                        onClick={() => {
                          setNovaMsg('Agradecemos pela preferência! Qualquer dúvida ou problema, entre em contato conosco.');
                          setShowTemplates(false);
                        }}
                        style={{
                          padding: '10px',
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          textAlign: 'left',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={e => e.target.style.backgroundColor = '#d97706'}
                        onMouseOut={e => e.target.style.backgroundColor = '#f59e0b'}
                      >
                        💬 Agradecimento
                      </button>
                      <button
                        onClick={() => {
                          setNovaMsg('Bom dia! Informamos que sua ordem de serviço está em andamento. Acompanhamento em breve.');
                          setShowTemplates(false);
                        }}
                        style={{
                          padding: '10px',
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          textAlign: 'left',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={e => e.target.style.backgroundColor = '#7c3aed'}
                        onMouseOut={e => e.target.style.backgroundColor = '#8b5cf6'}
                      >
                        🔄 Status do Atendimento
                      </button>
                    </div>
                  </motion.div>
                )}
              
              </>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>💬</div>
                <p>Selecione uma conversa para começar</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeArea === 'usuarios' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {usuarios.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Nenhum usuário disponível
            </div>
          ) : (
            usuarios
              .filter(user => user.id !== usuarioAtual?.cpf && user.username !== usuarioAtual?.nome)
              .map((user) => (
              <motion.div
                key={user.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                whileHover={{ y: -4 }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👤</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
                  {user.displayName || user.username}
                </h3>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.875rem', color: '#64748b' }}>
                  {user.email}
                </p>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', color: '#64748b' }}>
                  {user.phone}
                </p>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: user.active ? '#dcfce7' : '#fee2e2',
                  color: user.active ? '#16a34a' : '#dc2626',
                  marginBottom: '12px'
                }}>
                  {user.active ? '🟢 Online' : '🔴 Offline'}
                </span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <motion.button
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleIniciarChatComUsuario(user)}
                    whileHover={{ backgroundColor: '#0284c7' }}
                  >
                    💬 Chat
                  </motion.button>
                  {user.phone && (
                    <motion.button
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: '#25d366',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleEnviarWhatsApp(user)}
                      whileHover={{ backgroundColor: '#20ba5a' }}
                    >
                      📱 WhatsApp
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Modal Novo Chat */}
      <AnimatePresence>
        {showNovoChat && (
          <motion.div
            style={styles.modal}
            onClick={() => setShowNovoChat(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', margin: '0 0 16px 0' }}>
                Nova Conversa
              </h2>

              <div style={styles.formGroup}>
                <label style={styles.label}>Título da Conversa</label>
                <input
                  type="text"
                  value={novoChat.titulo}
                  onChange={(e) => setNovoChat({ ...novoChat, titulo: e.target.value })}
                  placeholder="Ex: Projeto X - Discussão"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Selecionar Participantes</label>
                <div style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  padding: '8px'
                }}>
                  {usuarios
                    .filter(user => user.id !== usuarioAtual?.cpf && user.username !== usuarioAtual?.nome)
                    .map((user) => (
                    <div
                      key={user.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px',
                        borderRadius: '6px',
                        marginBottom: '4px',
                        backgroundColor: novoChat.participantes.some(p => p.id === user.id) ? '#e0f2fe' : '#f8fafc',
                        cursor: 'pointer',
                        border: novoChat.participantes.some(p => p.id === user.id) ? '2px solid #0ea5e9' : '2px solid transparent'
                      }}
                      onClick={() => {
                        const jaAdicionado = novoChat.participantes.some(p => p.id === user.id);
                        if (jaAdicionado) {
                          setNovoChat({
                            ...novoChat,
                            participantes: novoChat.participantes.filter(p => p.id !== user.id)
                          });
                        } else {
                          setNovoChat({
                            ...novoChat,
                            participantes: [...novoChat.participantes, user]
                          });
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={novoChat.participantes.some(p => p.id === user.id)}
                        onChange={() => {}}
                        style={{ marginRight: '8px', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                          {user.displayName || user.username}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {novoChat.participantes.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>Selecionados:</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {novoChat.participantes.map((user) => (
                        <span
                          key={user.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            backgroundColor: '#0ea5e9',
                            color: 'white',
                            borderRadius: '9999px',
                            fontSize: '0.75rem'
                          }}
                        >
                          {user.displayName || user.username}
                          <button
                            onClick={() => setNovoChat({
                              ...novoChat,
                              participantes: novoChat.participantes.filter(p => p.id !== user.id)
                            })}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              padding: '0'
                            }}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.formActions}>
                <motion.button
                  style={{ ...styles.button, ...styles.secondaryButton }}
                  onClick={() => setShowNovoChat(false)}
                  whileHover={{ backgroundColor: '#cbd5e1' }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  style={{ ...styles.button, ...styles.primaryButton }}
                  onClick={handleCriarChat}
                  whileHover={{ backgroundColor: '#0284c7' }}
                >
                  Criar Conversa
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
