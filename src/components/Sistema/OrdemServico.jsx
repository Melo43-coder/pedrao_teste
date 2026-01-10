import React, { useState, useEffect, useRef } from "react";
import { 
  FiFileText, FiAlertTriangle, FiClock, FiCheckCircle, 
  FiXCircle, FiPlusCircle, FiFilter, FiEdit3, FiEye, 
  FiCheck, FiSearch, FiRefreshCw, FiCalendar, FiUser,
  FiBarChart2, FiActivity, FiMapPin, FiPhone, FiMail,
  FiMessageSquare, FiCheckSquare, FiInfo, FiImage, FiPaperclip
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import firebase from "../../services/firebase";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDoc } from "firebase/firestore";
import jsPDF from 'jspdf';

// Dados de status e prioridades
const OSSTATUS = [
  { nome: "Pendente", cor: "#f59e0b", bgColor: "#fef3c7", icon: <FiClock /> },
  { nome: "Em andamento", cor: "#3b82f6", bgColor: "#dbeafe", icon: <FiActivity /> },
  { nome: "Aguardando Peça", cor: "#8b5cf6", bgColor: "#ede9fe", icon: <FiAlertTriangle /> },
  { nome: "Concluída", cor: "#10b981", bgColor: "#d1fae5", icon: <FiCheckCircle /> },
  { nome: "Cancelada", cor: "#ef4444", bgColor: "#fee2e2", icon: <FiXCircle /> }
];

const PRIORIDADES = [
  { nome: "Alta", cor: "#ef4444", bgColor: "#fee2e2" },
  { nome: "Média", cor: "#f59e0b", bgColor: "#fef3c7" },
  { nome: "Baixa", cor: "#10b981", bgColor: "#d1fae5" }
];

// Funções de estilo
function getStatusInfo(status) {
  return OSSTATUS.find(s => s.nome === status) || { cor: "#9ca3af", bgColor: "#f3f4f6", icon: <FiFileText /> };
}

function getPrioridadeInfo(prio) {
  return PRIORIDADES.find(p => p.nome === prio) || { cor: "#9ca3af", bgColor: "#f3f4f6" };
}

export default function OrdemServico() {
  const [ordens, setOrdens] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [nova, setNova] = useState({
    codigo: "",
    nomeCliente: "",
    telefoneCliente: "",
    emailCliente: "",
    endereco: "",
    numero: "",
    cep: "",
    cidade: "",
    estado: "",
    complemento: "",
    latitude: "",
    longitude: "",
    prioridade: "Média",
    responsavel: "",
    descricao: ""
  });

  // Função para gerar código aleatório
  const gerarCodigoAleatorio = () => {
    const prefixo = "OS";
    const ano = new Date().getFullYear().toString().slice(-2);
    const numero = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `${prefixo}-${ano}${numero}`;
  };
  const [showForm, setShowForm] = useState(false);
  const [detalhesOS, setDetalhesOS] = useState(null);
  const [abaDetalhesOS, setAbaDetalhesOS] = useState('info'); // 'info', 'chat', 'checklist'
  const [mensagensChat, setMensagensChat] = useState([]);
  const [novaMensagemChat, setNovaMensagemChat] = useState('');
  const [editandoOS, setEditandoOS] = useState(null);
  const [atualizando, setAtualizando] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagensCliente, setMensagensCliente] = useState({});
  const [inputMensagem, setInputMensagem] = useState({});
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(10);
  const [checklistPrestador, setChecklistPrestador] = useState(null);
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState({});
  const chatScrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const companyCnpj = localStorage.getItem("companyCnpj") || "";
  const currentUserName = localStorage.getItem("userName") || "Você";

  // Efeito para carregar mensagens do chat quando abrir uma OS
  useEffect(() => {
    if (!detalhesOS || !detalhesOS.id || !companyCnpj) return;

    console.log('📱 Iniciando listener de mensagens para OS:', detalhesOS.codigo);
    console.log('📍 Caminho:', `companies/${companyCnpj}/serviceOrders/${detalhesOS.id}/messages`);

    const messagesRef = collection(db, 'companies', companyCnpj, 'serviceOrders', detalhesOS.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('📨 Mensagens recebidas:', snapshot.size);
      
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('💬 Mensagens processadas:', msgs);
      
      // Contar mensagens não lidas (não enviadas pelo usuário atual)
      const naoLidas = msgs.filter(m => !m.enviado && !m.lida).length;
      setMensagensNaoLidas(prev => ({ ...prev, [detalhesOS.codigo]: naoLidas }));
      
      setMensagensCliente(prev => ({ ...prev, [detalhesOS.codigo]: msgs }));
      
      // Scroll automático para última mensagem
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 100);
    }, (error) => {
      console.error("❌ Erro ao carregar mensagens:", error);
    });

    return () => unsubscribe();
  }, [detalhesOS, companyCnpj]);

  // Efeito para carregar checklist do prestador quando abrir a aba de checklist
  useEffect(() => {
    async function loadChecklistPrestador() {
      if (!detalhesOS || !detalhesOS.id || !companyCnpj) return;
      
      try {
        const osDocRef = doc(db, 'companies', companyCnpj, 'serviceOrders', detalhesOS.id);
        const osDocSnap = await getDoc(osDocRef);
        
        if (osDocSnap.exists()) {
          const data = osDocSnap.data();
          // Verificar se existem dados das etapas do prestador
          if (data.etapa1 || data.etapa2 || data.etapa3 || data.estado) {
            const checklistData = {
              estado: data.estado || '',
              etapa1: data.etapa1 || null,
              etapa2: data.etapa2 || null,
              etapa3: data.etapa3 || null,
              logoBase64: '' // Inicializa sem logo
            };
            
            // Buscar logo da checklist configurada
            try {
              const checklistsDb = await firebase.listarChecklists(companyCnpj);
              
              // Primeiro tenta buscar pela checklistId específica da OS
              if (data.checklistId) {
                const checklist = checklistsDb.find(c => c.id === data.checklistId);
                if (checklist && checklist.logoBase64) {
                  checklistData.logoBase64 = checklist.logoBase64;
                  console.log('✅ Logo da checklist específica carregada:', checklist.nome);
                }
              }
              
              // Se não encontrou, usa a primeira checklist que tiver logo
              if (!checklistData.logoBase64 && checklistsDb.length > 0) {
                const checklistComLogo = checklistsDb.find(c => c.logoBase64);
                if (checklistComLogo) {
                  checklistData.logoBase64 = checklistComLogo.logoBase64;
                  console.log('✅ Logo da checklist padrão carregada:', checklistComLogo.nome);
                }
              }
            } catch (err) {
              console.log('⚠️ Erro ao buscar logo da checklist:', err);
            }
            
            setChecklistPrestador(checklistData);
          } else {
            setChecklistPrestador(null);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar checklist do prestador:", error);
        setChecklistPrestador(null);
      }
    }
    
    if (abaDetalhesOS === 'checklist') {
      loadChecklistPrestador();
    }
  }, [detalhesOS, companyCnpj, abaDetalhesOS]);

  // Efeito para monitorar mudanças nas etapas e criar notificações
  useEffect(() => {
    if (!detalhesOS || !detalhesOS.id || !companyCnpj) return;

    const osDocRef = doc(db, 'companies', companyCnpj, 'serviceOrders', detalhesOS.id);
    
    const unsubscribe = onSnapshot(osDocRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const userName = localStorage.getItem('userName') || 'Sistema';
        
        // Notificação de aceite do prestador
        if (data.prestadorAceitou && !data.notificacaoAceiteEnviada) {
          try {
            await firebase.createNotification(companyCnpj, {
              title: '✅ Prestador Aceitou o Serviço',
              message: `O prestador aceitou a OS #${detalhesOS.codigo}`,
              type: 'aceite',
              osId: detalhesOS.id,
              osCodigo: detalhesOS.codigo,
              userId: 'all',
              createdBy: userName
            });
            // Marcar que a notificação foi enviada
            await firebase.updateServiceOrder(companyCnpj, detalhesOS.id, { notificacaoAceiteEnviada: true });
          } catch (error) {
            console.error('Erro ao criar notificação de aceite:', error);
          }
        }
        
        // Notificação de etapa 1 completa
        if (data.etapa1?.completedAt && !data.notificacaoEtapa1Enviada) {
          try {
            await firebase.createNotification(companyCnpj, {
              title: '🔍 Etapa 1 Concluída',
              message: `Reconhecimento da OS #${detalhesOS.codigo} foi concluído`,
              type: 'etapa',
              osId: detalhesOS.id,
              osCodigo: detalhesOS.codigo,
              userId: 'all',
              createdBy: userName
            });
            await firebase.updateServiceOrder(companyCnpj, detalhesOS.id, { notificacaoEtapa1Enviada: true });
          } catch (error) {
            console.error('Erro ao criar notificação etapa 1:', error);
          }
        }
        
        // Notificação de etapa 2 completa (checklist)
        if (data.etapa2?.completedAt && !data.notificacaoEtapa2Enviada) {
          try {
            await firebase.createNotification(companyCnpj, {
              title: '📋 Checklist Recebido',
              message: `Checklist da OS #${detalhesOS.codigo} foi completado pelo prestador`,
              type: 'checklist',
              osId: detalhesOS.id,
              osCodigo: detalhesOS.codigo,
              userId: 'all',
              createdBy: userName
            });
            await firebase.updateServiceOrder(companyCnpj, detalhesOS.id, { notificacaoEtapa2Enviada: true });
          } catch (error) {
            console.error('Erro ao criar notificação checklist:', error);
          }
        }
        
        // Notificação de etapa 3 completa (conclusão)
        if (data.etapa3?.completedAt && !data.notificacaoConclusaoEnviada) {
          try {
            await firebase.createNotification(companyCnpj, {
              title: '✅ Serviço Concluído',
              message: `OS #${detalhesOS.codigo} foi finalizada com assinatura do cliente`,
              type: 'conclusao',
              osId: detalhesOS.id,
              osCodigo: detalhesOS.codigo,
              userId: 'all',
              createdBy: userName
            });
            await firebase.updateServiceOrder(companyCnpj, detalhesOS.id, { notificacaoConclusaoEnviada: true });
          } catch (error) {
            console.error('Erro ao criar notificação de conclusão:', error);
          }
        }
      }
    }, (error) => {
      console.error('Erro ao monitorar mudanças na OS:', error);
    });

    return () => unsubscribe();
  }, [detalhesOS, companyCnpj]);

  // Efeito para carregar ordens e usuários do Firebase ao montar
  useEffect(() => {
    loadOrdens();
    loadUsuarios();
  }, [companyCnpj]);

  // Função para carregar usuários do Firebase
  async function loadUsuarios() {
    if (!companyCnpj) return;
    try {
      const list = await firebase.listCompanyUsers(companyCnpj);
      setUsuarios(list);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  }

  // Função para carregar ordens do Firebase
  async function loadOrdens() {
    if (!companyCnpj) {
      setOrdens([]);
      return;
    }
    setLoading(true);
    try {
      const list = await firebase.listServiceOrders(companyCnpj);
      setOrdens(list);
    } catch (err) {
      console.error('Erro ao carregar ordens:', err);
      setOrdens([]);
    } finally {
      setLoading(false);
    }
  }

  // Função para buscar endereço por CEP usando ViaCEP
  const handleEnviarWhatsApp = async (nomeCliente, telefone, osId) => {
    if (!telefone) {
      alert('Este cliente não possui número de WhatsApp cadastrado');
      return;
    }

    try {
      const userName = localStorage.getItem('userName');
      const cnpj = localStorage.getItem('companyCnpj');

      if (!userName || !cnpj) {
        alert('Erro: Usuário ou CNPJ não definido');
        return;
      }

      // Criar conversa com o cliente no Chat
      const chat = await firebase.createChat(cnpj, {
        titulo: `📱 WhatsApp - ${nomeCliente} (OS #${osId})`,
        participantes: [userName, `cliente-${telefone}`],
        tipo: 'cliente-whatsapp',
        createdBy: userName,
        telefone: telefone,
        clienteNome: nomeCliente,
        osId: osId
      });

      if (chat && chat.id) {
        // Enviar mensagem inicial
        await firebase.sendMessage(cnpj, chat.id, {
          cpfEnvio: userName,
          nomeEnvio: userName,
          conteudo: `Iniciada conversa com cliente ${nomeCliente} via WhatsApp - OS #${osId}`,
          tipo: 'sistema'
        });

        alert(`✅ Conversa criada! Vá até o Chat para conversar com o cliente.`);
      }
    } catch (err) {
      console.error('Erro ao criar conversa:', err);
      alert('Erro ao criar conversa. Tente novamente.');
    }
  };

  const handleEnviarMensagemCliente = async (osId, mensagem, arquivo = null) => {
    if ((!mensagem || !mensagem.trim()) && !arquivo) return;
    
    try {
      console.log('📤 Enviando mensagem para OS:', osId);
      
      // Buscar o ID real da OS (documento Firebase)
      const os = ordens.find(o => o.codigo === osId);
      if (!os || !os.id) {
        console.error("❌ OS não encontrada");
        alert("Erro: OS não encontrada");
        return;
      }

      console.log('✅ OS encontrada, ID:', os.id);

      let arquivoURL = null;
      let tipoArquivo = null;
      
      // Upload de arquivo se houver
      if (arquivo) {
        console.log('📎 Processando arquivo:', arquivo.name);
        const formData = new FormData();
        formData.append('file', arquivo);
        
        // Você pode usar uploadFile do utils/cnpj.js ou fazer upload direto
        // Por enquanto vou simular com base64 para imagens pequenas
        if (arquivo.type.startsWith('image/')) {
          arquivoURL = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(arquivo);
          });
          tipoArquivo = 'imagem';
          console.log('🖼️ Imagem convertida para base64');
        }
      }

      const mensagemData = {
        texto: mensagem?.trim() || '',
        enviado: true,
        remetente: currentUserName,
        data: new Date().toLocaleString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        timestamp: new Date().toISOString(),
        ...(arquivoURL && { arquivo: arquivoURL, tipoArquivo }),
        lida: false
      };

      console.log('💾 Salvando mensagem:', mensagemData);

      // Salvar mensagem no Firebase
      const messagesRef = collection(db, 'companies', companyCnpj, 'serviceOrders', os.id, 'messages');
      const docRef = await addDoc(messagesRef, mensagemData);
      
      console.log('✅ Mensagem salva com ID:', docRef.id);
      
      // Limpar input e arquivo
      setInputMensagem(prev => ({
        ...prev,
        [osId]: ''
      }));
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem: " + error.message);
    }
  };

  // Função para gerar PDF do checklist
  const handleGerarPDF = async () => {
    if (!checklistPrestador || !detalhesOS) return;
    
    console.log('📄 Gerando PDF com dados:', {
      codigo: detalhesOS.codigo,
      nomeCliente: detalhesOS.nomeCliente,
      telefoneCliente: detalhesOS.telefoneCliente,
      emailCliente: detalhesOS.emailCliente,
      endereco: detalhesOS.endereco,
      cidade: detalhesOS.cidade,
      cep: detalhesOS.cep
    });
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      
      // Função auxiliar para converter valores em string segura
      const safeText = (value, defaultValue = 'NÃO INFORMADO') => {
        if (value === null || value === undefined || value === '') return defaultValue;
        return String(value);
      };
      
      // Função para adicionar linha horizontal
      const addHorizontalLine = (y) => {
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, pageWidth - margin, y);
      };
      
      // ========== CABEÇALHO ==========
      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, 0, pageWidth, 45, 'F');
      
      // Logo da empresa/checklist (se existir)
      console.log('🖼️ Verificando logo:', checklistPrestador.logoBase64 ? 'Logo encontrada' : 'Sem logo');
      if (checklistPrestador.logoBase64) {
        try {
          const logoWidth = 30;
          const logoHeight = 30;
          const logoX = margin;
          const logoY = 7.5;
          pdf.addImage(checklistPrestador.logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
          console.log('✅ Logo adicionada ao PDF com sucesso');
        } catch (error) {
          console.error('❌ Erro ao adicionar logo ao PDF:', error);
        }
      }
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ORDEM DE SERVIÇO', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const empresaNome = localStorage.getItem('companyName') || 'EMPRESA DE ASSISTÊNCIA TÉCNICA';
      pdf.text(empresaNome.toUpperCase(), pageWidth / 2, 23, { align: 'center' });
      
      const empresaCNPJ = companyCnpj || 'NÃO INFORMADO';
      pdf.text(`CNPJ: ${empresaCNPJ}`, pageWidth / 2, 29, { align: 'center' });
      
      pdf.setFontSize(8);
      pdf.text('Ordem de serviço impressa pelo sistema', pageWidth / 2, 38, { align: 'center' });
      
      yPosition = 50;
      
      // ========== DADOS DA ASSISTÊNCIA ==========
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DADOS DA ASSISTÊNCIA', margin, yPosition);
      yPosition += 2;
      addHorizontalLine(yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OS Nº:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`#${detalhesOS.codigo}`, margin + 20, yPosition);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Data/Hora:', pageWidth / 2, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(new Date().toLocaleString('pt-BR'), pageWidth / 2 + 25, yPosition);
      yPosition += 6;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Profissional:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(safeText(detalhesOS.responsavel), margin + 28, yPosition);
      yPosition += 6;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Produto/Serviço:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(safeText(detalhesOS.descricao).substring(0, 80), margin + 35, yPosition);
      yPosition += 6;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Endereço:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      const enderecoCompleto = `${safeText(detalhesOS.endereco)}, ${safeText(detalhesOS.numero)} - ${safeText(detalhesOS.cidade)}/${safeText(detalhesOS.estado)}`;
      const enderecoLines = pdf.splitTextToSize(enderecoCompleto, contentWidth - 25);
      pdf.text(enderecoLines, margin + 25, yPosition);
      yPosition += enderecoLines.length * 5 + 8;
      
      // ========== DADOS DO CLIENTE/SEGURADO ==========
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('DADOS DO CLIENTE', margin, yPosition);
      yPosition += 2;
      addHorizontalLine(yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Nome:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(safeText(detalhesOS.nomeCliente), margin + 20, yPosition);
      yPosition += 6;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Telefone:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(safeText(detalhesOS.telefoneCliente), margin + 25, yPosition);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('E-mail:', pageWidth / 2, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(safeText(detalhesOS.emailCliente), pageWidth / 2 + 18, yPosition);
      yPosition += 6;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('CEP:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(safeText(detalhesOS.cep), margin + 15, yPosition);
      yPosition += 10;
      
      // ========== DETALHAMENTO DO SERVIÇO ==========
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('DETALHAMENTO DO SERVIÇO', margin, yPosition);
      yPosition += 2;
      addHorizontalLine(yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Status:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(safeText(detalhesOS.status), margin + 20, yPosition);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Prioridade:', pageWidth / 2, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(safeText(detalhesOS.prioridade), pageWidth / 2 + 25, yPosition);
      yPosition += 6;
      
      if (checklistPrestador.etapa1 && checklistPrestador.etapa1.horaReconhecimento) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Situação:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        const situacao = checklistPrestador.etapa1.dadosConfirmados ? 'CONFIRMADO' : 'PENDENTE';
        pdf.text(situacao, margin + 23, yPosition);
        yPosition += 6;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Observações:', margin, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      const obsLines = pdf.splitTextToSize(safeText(detalhesOS.descricao), contentWidth - 5);
      pdf.text(obsLines, margin + 5, yPosition);
      yPosition += obsLines.length * 5 + 10;
      
      // ========== CHECKLIST DE EXECUÇÃO ==========
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('CHECKLIST DE EXECUÇÃO', margin, yPosition);
      yPosition += 2;
      addHorizontalLine(yPosition);
      yPosition += 8;
      
      // === ANTES DA EXECUÇÃO ===
      if (checklistPrestador.etapa1) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('ANTES DA EXECUÇÃO', margin, yPosition);
        yPosition += 6;
        
        pdf.setFontSize(10);
        
        if (checklistPrestador.etapa1.horaReconhecimento) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('[ ] Reconhecimento realizado em:', margin + 5, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.text(new Date(checklistPrestador.etapa1.horaReconhecimento).toLocaleString('pt-BR'), margin + 75, yPosition);
          yPosition += 6;
        }
        
        if (checklistPrestador.etapa1.dadosConfirmados !== undefined) {
          const checkbox = checklistPrestador.etapa1.dadosConfirmados ? '[X]' : '[ ]';
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${checkbox} Dados do cliente confirmados`, margin + 5, yPosition);
          yPosition += 6;
        }
        
        if (checklistPrestador.estado) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('[ ] Localização verificada:', margin + 5, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.text(safeText(checklistPrestador.estado), margin + 60, yPosition);
          yPosition += 6;
        }
        
        yPosition += 4;
      }
      
      // === DURANTE A EXECUÇÃO ===
      if (checklistPrestador.etapa2) {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('DURANTE A EXECUÇÃO', margin, yPosition);
        yPosition += 6;
        
        pdf.setFontSize(10);
        
        // Itens do checklist
        if (checklistPrestador.etapa2.checklist && checklistPrestador.etapa2.checklist.length > 0) {
          checklistPrestador.etapa2.checklist.forEach((item, index) => {
            if (yPosition > pageHeight - 40) {
              pdf.addPage();
              yPosition = margin;
            }
            
            const checkbox = item.checked ? '[X]' : '[ ]';
            const obrigatorio = item.obrigatorio ? '*' : ' ';
            
            pdf.setFont('helvetica', 'normal');
            pdf.text(`${checkbox} ${obrigatorio} ${safeText(item.label, 'Item')}`, margin + 5, yPosition);
            yPosition += 5;
            
            if (item.obs) {
              pdf.setFont('helvetica', 'italic');
              pdf.setFontSize(9);
              const obsLines = pdf.splitTextToSize(`    Obs: ${item.obs}`, contentWidth - 10);
              pdf.text(obsLines, margin + 5, yPosition);
              yPosition += obsLines.length * 4 + 2;
              pdf.setFontSize(10);
            }
            
            if (item.tipo === 'foto' && item.foto) {
              // Verificar se é Base64 ou caminho de arquivo local
              const isBase64 = item.foto.startsWith('data:image');
              const isLocalFile = item.foto.startsWith('file://') || item.foto.includes('/var/mobile') || item.foto.includes('ImagePicker');
              
              if (isBase64) {
                try {
                  // Verificar se precisa de nova página
                  if (yPosition > pageHeight - 80) {
                    pdf.addPage();
                    yPosition = margin;
                  }
                  
                  pdf.setFont('helvetica', 'italic');
                  pdf.setFontSize(9);
                  pdf.text('    Foto anexada:', margin + 5, yPosition);
                  yPosition += 5;
                  
                  // Adicionar a imagem
                  const imgWidth = 80;
                  const imgHeight = 60;
                  const imgX = margin + 10;
                  
                  pdf.addImage(item.foto, 'JPEG', imgX, yPosition, imgWidth, imgHeight);
                  yPosition += imgHeight + 5;
                  
                  pdf.setFontSize(10);
                } catch (error) {
                  console.error('Erro ao adicionar foto ao PDF:', error);
                  pdf.setFont('helvetica', 'italic');
                  pdf.setFontSize(9);
                  pdf.text('    (Erro ao carregar foto)', margin + 5, yPosition);
                  yPosition += 4;
                  pdf.setFontSize(10);
                }
              } else if (isLocalFile) {
                // Foto armazenada no dispositivo móvel
                pdf.setFont('helvetica', 'italic');
                pdf.setFontSize(9);
                pdf.text('    Foto capturada pelo prestador (armazenada no dispositivo móvel)', margin + 5, yPosition);
                yPosition += 4;
                pdf.setFontSize(10);
              } else {
                // Outro tipo de caminho
                pdf.setFont('helvetica', 'italic');
                pdf.setFontSize(9);
                pdf.text('    (Foto anexada - não disponível para impressão)', margin + 5, yPosition);
                yPosition += 4;
                pdf.setFontSize(10);
              }
            }
          });
          
          yPosition += 4;
        }
        
        if (checklistPrestador.etapa2.observacoesGerais) {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.setFont('helvetica', 'bold');
          pdf.text('Observações Gerais:', margin + 5, yPosition);
          yPosition += 5;
          pdf.setFont('helvetica', 'normal');
          const obsLines = pdf.splitTextToSize(checklistPrestador.etapa2.observacoesGerais, contentWidth - 10);
          pdf.text(obsLines, margin + 5, yPosition);
          yPosition += obsLines.length * 5 + 4;
        }
        
        if (checklistPrestador.etapa2.horaFinalizacao) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('[ ] Execução finalizada em:', margin + 5, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.text(new Date(checklistPrestador.etapa2.horaFinalizacao).toLocaleString('pt-BR'), margin + 65, yPosition);
          yPosition += 6;
        }
        
        yPosition += 4;
      }
      
      
      // === APÓS A EXECUÇÃO ===
      if (checklistPrestador.etapa3) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('APÓS A EXECUÇÃO', margin, yPosition);
        yPosition += 6;
        
        pdf.setFontSize(10);
        
        if (checklistPrestador.etapa3.duracaoTotal) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('[ ] Duração total do serviço:', margin + 5, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.text(safeText(checklistPrestador.etapa3.duracaoTotal), margin + 65, yPosition);
          yPosition += 6;
        }
        
        if (checklistPrestador.etapa3.horaFinalizacaoTotal) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('[ ] Serviço concluído em:', margin + 5, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.text(new Date(checklistPrestador.etapa3.horaFinalizacaoTotal).toLocaleString('pt-BR'), margin + 60, yPosition);
          yPosition += 6;
        }
        
        const garantia = checklistPrestador.etapa3.garantia !== undefined ? 
          (checklistPrestador.etapa3.garantia ? '[X] Sim  [ ] Não' : '[ ] Sim  [X] Não') : 
          '[ ] Sim  [ ] Não';
        pdf.setFont('helvetica', 'bold');
        pdf.text(`[ ] Garantia aplicada: ${garantia}`, margin + 5, yPosition);
        yPosition += 8;
        
        if (checklistPrestador.etapa3.observacoesRevisao) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Observações da Revisão:', margin + 5, yPosition);
          yPosition += 5;
          pdf.setFont('helvetica', 'normal');
          const obsLines = pdf.splitTextToSize(checklistPrestador.etapa3.observacoesRevisao, contentWidth - 10);
          pdf.text(obsLines, margin + 5, yPosition);
          yPosition += obsLines.length * 5 + 8;
        }
        
        // Assinatura do cliente
        if (checklistPrestador.etapa3.assinaturaBase64) {
          if (yPosition > pageHeight - 70) {
            pdf.addPage();
            yPosition = margin;
          }
          
          yPosition += 5;
          addHorizontalLine(yPosition);
          yPosition += 8;
          
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.text('ASSINATURA DO CLIENTE/SEGURADO', margin, yPosition);
          yPosition += 8;
          
          try {
            const imgWidth = 80;
            const imgHeight = 35;
            const imgX = margin + 10;
            
            pdf.addImage(checklistPrestador.etapa3.assinaturaBase64, 'PNG', imgX, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 5;
          } catch (error) {
            console.error('Erro ao adicionar assinatura:', error);
            yPosition += 35;
          }
          
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.3);
          pdf.line(margin, yPosition, margin + 80, yPosition);
          yPosition += 5;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.text(`Assinatura: ${safeText(detalhesOS.nomeCliente)}`, margin, yPosition);
          yPosition += 8;
          
          pdf.text(`Data: _____/_____/_____`, margin, yPosition);
        } else {
          // Espaço para assinatura manual
          if (yPosition > pageHeight - 50) {
            pdf.addPage();
            yPosition = margin;
          }
          
          yPosition += 5;
          addHorizontalLine(yPosition);
          yPosition += 8;
          
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.text('ASSINATURA DO CLIENTE/SEGURADO', margin, yPosition);
          yPosition += 25;
          
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.3);
          pdf.line(margin, yPosition, margin + 80, yPosition);
          yPosition += 5;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.text('Assinatura', margin, yPosition);
          yPosition += 8;
          
          pdf.line(margin + 100, yPosition - 13, margin + 160, yPosition - 13);
          pdf.text('Data: _____/_____/_____', margin + 100, yPosition);
        }
      }
      
      
      // ========== RODAPÉ EM TODAS AS PÁGINAS ==========
      pdf.setTextColor(0, 0, 0);
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        const footerY = pageHeight - 25;
        
        // Linha superior
        addHorizontalLine(footerY);
        
        // Texto do rodapé
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Documento gerado em ${new Date().toLocaleString('pt-BR')}`, margin, footerY + 5);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, footerY + 5, { align: 'right' });
        
        // Observação importante
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Este documento é válido sem assinatura conforme legislação vigente', pageWidth / 2, footerY + 10, { align: 'center' });
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('IMPORTANTE: GUARDE ESTE DOCUMENTO PARA GARANTIA E REFERÊNCIA', pageWidth / 2, footerY + 15, { align: 'center' });
      }
      
      // ========== SALVAR PDF ==========
      const fileName = `OS_${detalhesOS.codigo}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      
      // Notificação de sucesso
      await firebase.createNotification(companyCnpj, {
        title: 'PDF Gerado',
        message: `Documento oficial da OS #${detalhesOS.codigo} foi gerado com sucesso`,
        type: 'info',
        osId: detalhesOS.id,
        osCodigo: detalhesOS.codigo,
        userId: 'all',
        createdBy: localStorage.getItem('userName') || 'Sistema'
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Verifique os dados e tente novamente.');
    }
  };

  // Função para buscar endereço por CEP usando ViaCEP
  async function buscarEnderecoByCEP() {
    const cepLimpo = nova.cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      alert('CEP deve ter 8 dígitos');
      return;
    }

    setAtualizando(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await response.json();
      
      if (dados.erro) {
        alert('❌ CEP não encontrado. Verifique e tente novamente.');
        setAtualizando(false);
        return;
      }

      // Preencher endereço automaticamente
      setNova(prev => ({ 
        ...prev, 
        endereco: dados.logradouro || '',
        cidade: dados.localidade || '',
        estado: dados.uf || '',
        numero: '' // Usuario preenche manualmente
      }));
      
      alert(`✅ Endereço encontrado!\n${dados.logradouro}\n${dados.localidade}, ${dados.uf}`);
      
      // Agora buscar coordenadas do endereço completo
      const enderecoCompleto = `${dados.logradouro}, ${dados.localidade}, ${dados.uf}, Brasil`;
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}`,
        { headers: { 'Accept-Language': 'pt-BR' } }
      );
      const geoResults = await geoResponse.json();
      
      if (geoResults.length > 0) {
        setNova(prev => ({ 
          ...prev, 
          latitude: geoResults[0].lat, 
          longitude: geoResults[0].lon 
        }));
      }
    } catch (err) {
      console.error('Erro ao buscar endereço:', err);
      alert('❌ Erro ao buscar endereço. Verifique sua internet.');
    } finally {
      setAtualizando(false);
    }
  }

  // Função para buscar coordenadas do endereço (quando não tiver CEP)
  async function buscarCoordenadas() {
    if (!nova.endereco || !nova.numero || !nova.cidade || !nova.estado) {
      alert('Preencha o endereço, número, cidade e estado para buscar a localização no mapa');
      return;
    }

    setAtualizando(true);
    const endereco = `${nova.endereco}, ${nova.numero}, ${nova.cidade}, ${nova.estado}, Brasil`;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`,
        { headers: { 'Accept-Language': 'pt-BR' } }
      );
      const results = await response.json();
      
      if (results.length > 0) {
        const { lat, lon } = results[0];
        setNova(prev => ({ ...prev, latitude: lat, longitude: lon }));
        alert(`✅ Localização encontrada no mapa!\n\nCidade: ${results[0].address?.city || nova.cidade}\nLatitude: ${parseFloat(lat).toFixed(4)}\nLongitude: ${parseFloat(lon).toFixed(4)}`);
      } else {
        alert('❌ Localização não encontrada. Verifique os dados e tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao buscar localização:', err);
      alert('❌ Erro ao buscar localização. Verifique sua internet.');
    } finally {
      setAtualizando(false);
    }
  }

  // Função para adicionar nova OS com auto-geocodificação
  async function handleAddOS(e) {
    e.preventDefault();
    if (!companyCnpj) {
      alert('CNPJ da empresa não encontrado');
      return;
    }
    
    if (!nova.nomeCliente || !nova.numero || !nova.endereco || !nova.cidade || !nova.estado) {
      alert('Preencha o CEP primeiro para carregar o endereço, depois adicione o número');
      return;
    }

    if (!nova.responsavel) {
      alert('Selecione um responsável');
      return;
    }

    if (!nova.descricao) {
      alert('Descreva o serviço a ser realizado');
      return;
    }

    setAtualizando(true);

    try {
      // Garantir que tem coordenadas
      let latitude = nova.latitude;
      let longitude = nova.longitude;

      if (!latitude || !longitude) {
        const endereco = `${nova.endereco}, ${nova.numero}, ${nova.cidade}, ${nova.estado}, Brasil`;
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`);
        const results = await response.json();

        if (results.length > 0) {
          latitude = results[0].lat;
          longitude = results[0].lon;
        } else {
          alert('Não foi possível localizar o endereço no mapa. Clique em "Localizar no Mapa".');
          setAtualizando(false);
          return;
        }
      }

      const novaOS = {
        codigo: nova.codigo || gerarCodigoAleatorio(),
        cliente: nova.nomeCliente,
        telefone: nova.telefoneCliente,
        ...(nova.emailCliente ? { email: nova.emailCliente } : {}),
        endereco: nova.endereco,
        numero: nova.numero,
        complemento: nova.complemento,
        cep: nova.cep,
        cidade: nova.cidade,
        estado: nova.estado,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        abertura: new Date().toISOString().slice(0, 10),
        status: "Pendente",
        prioridade: nova.prioridade,
        responsavel: nova.responsavel,
        alerta: false,
        descricao: nova.descricao,
        ultimaAtualizacao: new Date().toISOString()
      };

      // Salvar no Firebase
      await firebase.createServiceOrder(companyCnpj, novaOS);
      
      // Notificar todos os usuários sobre a nova OS
      await firebase.notifyAllUsers(companyCnpj, {
        type: 'nova_os',
        titulo: 'Nova Ordem de Serviço Criada',
        mensagem: `Nova OS para ${nova.nomeCliente} em ${nova.cidade}, ${nova.estado}. Prioridade: ${nova.prioridade}`,
        osInfo: {
          cliente: nova.nomeCliente,
          cidade: nova.cidade,
          estado: nova.estado,
          prioridade: nova.prioridade
        }
      }, ['funcionario', 'gerente', 'admin']);
      
      // Mostrar notificação visual no header
      if (window.showHeaderNotification) {
        window.showHeaderNotification('📋 Nova OS Criada', `OS para ${nova.nomeCliente} em ${nova.cidade}`, 'success');
      }
      
      setNova({
        codigo: "",
        nomeCliente: "",
        telefoneCliente: "",
        emailCliente: "",
        endereco: "",
        numero: "",
        cep: "",
        cidade: "",
        estado: "",
        complemento: "",
        latitude: "",
        longitude: "",
        prioridade: "Média",
        responsavel: "",
        descricao: ""
      });
      setShowForm(false);
      await loadOrdens();
      alert(`✅ Ordem de Serviço criada com sucesso!\n\n${nova.nomeCliente} em ${nova.cidade}, ${nova.estado}`);
    } catch (err) {
      console.error('Erro ao criar OS:', err);
      alert(`❌ Erro ao criar OS: ${err.message}`);
    } finally {
      setAtualizando(false);
    }
  }

  // Função para abrir edição de OS
  function abrirEdicaoOS(os) {
    setEditandoOS(os);
    setNova({
      codigo: os.codigo || "",
      nomeCliente: os.cliente || "",
      telefoneCliente: os.telefone || "",
      emailCliente: os.email || "",
      endereco: os.endereco || "",
      numero: os.numero || "",
      cep: os.cep || "",
      cidade: os.cidade || "",
      estado: os.estado || "",
      complemento: os.complemento || "",
      latitude: os.latitude || "",
      longitude: os.longitude || "",
      prioridade: os.prioridade || "Média",
      responsavel: os.responsavel || "",
      descricao: os.descricao || ""
    });
    setShowForm(true);
  }

  // Função para atualizar OS
  async function handleAtualizarOS(e) {
    e.preventDefault();
    if (!companyCnpj || !editandoOS) return;

    setAtualizando(true);
    try {
      const osAtualizada = {
        ...editandoOS,
        codigo: nova.codigo,
        cliente: nova.nomeCliente,
        telefone: nova.telefoneCliente,
        email: nova.emailCliente,
        endereco: nova.endereco,
        numero: nova.numero,
        complemento: nova.complemento,
        cep: nova.cep,
        cidade: nova.cidade,
        estado: nova.estado,
        latitude: nova.latitude,
        longitude: nova.longitude,
        prioridade: nova.prioridade,
        responsavel: nova.responsavel,
        descricao: nova.descricao,
        ultimaAtualizacao: new Date().toISOString()
      };

      await firebase.updateServiceOrder(companyCnpj, editandoOS.id, osAtualizada);
      
      setNova({
        codigo: "",
        nomeCliente: "",
        telefoneCliente: "",
        emailCliente: "",
        endereco: "",
        numero: "",
        cep: "",
        cidade: "",
        estado: "",
        complemento: "",
        latitude: "",
        longitude: "",
        prioridade: "Média",
        responsavel: "",
        descricao: ""
      });
      setEditandoOS(null);
      setShowForm(false);
      await loadOrdens();
      alert(`✅ Ordem de Serviço atualizada com sucesso!`);
    } catch (err) {
      console.error('Erro ao atualizar OS:', err);
      alert(`❌ Erro ao atualizar OS: ${err.message}`);
    } finally {
      setAtualizando(false);
    }
  }

  // Função para excluir OS
  async function handleExcluirOS() {
    if (!companyCnpj || !editandoOS) return;
    
    const confirmacao = window.confirm(
      `⚠️ Tem certeza que deseja excluir a OS?\n\n` +
      `Código: ${editandoOS.codigo}\n` +
      `Cliente: ${editandoOS.cliente}\n\n` +
      `Esta ação não pode ser desfeita!`
    );
    
    if (!confirmacao) return;

    setAtualizando(true);
    try {
      await firebase.deleteServiceOrder(companyCnpj, editandoOS.id);
      
      setNova({
        codigo: "",
        nomeCliente: "",
        telefoneCliente: "",
        emailCliente: "",
        endereco: "",
        numero: "",
        cep: "",
        cidade: "",
        estado: "",
        complemento: "",
        latitude: "",
        longitude: "",
        prioridade: "Média",
        responsavel: "",
        descricao: ""
      });
      setEditandoOS(null);
      setShowForm(false);
      await loadOrdens();
      alert(`✅ Ordem de Serviço excluída com sucesso!`);
    } catch (err) {
      console.error('Erro ao excluir OS:', err);
      alert(`❌ Erro ao excluir OS: ${err.message}`);
    } finally {
      setAtualizando(false);
    }
  }

  // Função para mudar status
  async function changeStatus(codigo, novoStatus) {
    try {
      setAtualizando(true);
      
      // Buscar a OS no array local
      const os = ordens.find(o => o.codigo === codigo);
      if (!os) {
        alert('❌ Ordem de serviço não encontrada');
        return;
      }
      
      // Verificar se tem ID do Firebase
      if (!os.id) {
        console.warn('⚠️ OS sem ID do Firebase, apenas atualizando localmente');
        // Atualizar apenas localmente se não tiver ID
        setOrdens(prev => 
          prev.map(o => 
            o.codigo === codigo 
              ? { 
                  ...o, 
                  status: novoStatus, 
                  ultimaAtualizacao: new Date().toISOString(),
                  ...(novoStatus === 'Concluída' && {
                    dataConclusao: new Date().toISOString()
                  })
                } 
              : o
          )
        );
        alert(`✅ Status alterado para "${novoStatus}" (apenas localmente)`);
        if (novoStatus === 'Concluída' && detalhesOS?.codigo === codigo) {
          setDetalhesOS(null);
        }
        return;
      }
      
      // Atualizar no Firebase
      const companyCnpj = localStorage.getItem('companyCnpj');
      if (!companyCnpj) {
        alert('❌ CNPJ da empresa não encontrado');
        return;
      }
      
      // Preparar dados de atualização
      const updateData = {
        status: novoStatus,
        updatedAt: new Date().toISOString()
      };
      
      // Se concluir, adicionar dados de conclusão
      if (novoStatus === 'Concluída') {
        updateData.dataConclusao = new Date().toISOString();
        updateData.concluidoPor = localStorage.getItem('userName') || 'Sistema';
      }
      
      console.log('🔄 Atualizando OS no Firebase:', { id: os.id, codigo, updateData });
      
      // Atualizar OS no Firebase
      await firebase.updateServiceOrder(companyCnpj, os.id, updateData);
      
      console.log('✅ OS atualizada no Firebase com sucesso');
      
      // Atualizar estado local
      setOrdens(prev => 
        prev.map(o => 
          o.codigo === codigo 
            ? { 
                ...o, 
                status: novoStatus, 
                ultimaAtualizacao: new Date().toISOString(),
                ...(novoStatus === 'Concluída' && {
                  dataConclusao: new Date().toISOString(),
                  concluidoPor: updateData.concluidoPor
                })
              } 
            : o
        )
      );
      
      alert(`✅ Status alterado para "${novoStatus}" com sucesso!`);
      
      // Se concluiu, fechar modal de detalhes
      if (novoStatus === 'Concluída' && detalhesOS?.codigo === codigo) {
        setDetalhesOS(null);
      }
      
    } catch (err) {
      console.error('❌ Erro ao mudar status:', err);
      alert(`❌ Erro ao alterar status: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setAtualizando(false);
    }
  }

  // Função para atualizar dados
  function handleRefresh() {
    setAtualizando(true);
    // Simulação de atualização
    setTimeout(() => {
      // Apenas atualiza as timestamps para simular dados novos
      setOrdens(prev => 
        prev.map(os => ({ 
          ...os, 
          ultimaAtualizacao: new Date().toISOString() 
        }))
      );
    }, 800);
  }

  // Filtragem de ordens
  const ordensFiltradas = ordens.filter(os => {
    const matchStatus = filtroStatus ? os.status === filtroStatus : true;
    const matchPrioridade = filtroPrioridade ? os.prioridade === filtroPrioridade : true;
    const matchPesquisa = pesquisa 
      ? os.cliente.toLowerCase().includes(pesquisa.toLowerCase()) || 
        os.codigo.toLowerCase().includes(pesquisa.toLowerCase()) ||
        (os.responsavel && os.responsavel.toLowerCase().includes(pesquisa.toLowerCase()))
      : true;
    
    return matchStatus && matchPrioridade && matchPesquisa;
  }).sort((a, b) => {
    // Concluídas vão para o final
    if (a.status === "Concluída" && b.status !== "Concluída") return 1;
    if (a.status !== "Concluída" && b.status === "Concluída") return -1;
    
    // Entre não concluídas: mais RECENTES primeiro (menor tempo)
    const dataA = new Date(a.ultimaAtualizacao || a.abertura);
    const dataB = new Date(b.ultimaAtualizacao || b.abertura);
    return dataB - dataA; // Invertido: mais recentes primeiro
  });

  // Paginação
  const totalPaginas = Math.ceil(ordensFiltradas.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const ordensExibidas = ordensFiltradas.slice(indiceInicio, indiceFim);

  // Resetar para página 1 quando filtros mudarem
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroStatus, filtroPrioridade, pesquisa]);

  // Contadores para cards
  const total = ordens.length;
  const porStatus = status =>
    ordens.filter(os => os.status === status).length;

  // Formatador de data
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      return dateString;
    }
  };

  // Formatador de data e hora
  const formatDateTime = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (error) {
      return dateTimeString;
    }
  };

  // Cálculo de tempo decorrido
  const getElapsedTime = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        return `${diffMins} min`;
      } else if (diffMins < 1440) {
        return `${Math.floor(diffMins / 60)} h`;
      } else {
        return `${Math.floor(diffMins / 1440)} d`;
      }
    } catch (error) {
      return "N/A";
    }
  };

  // Tema baseado no modo (claro/escuro)
  const theme = darkMode ? {
    bg: "#111827",
    cardBg: "#1f2937",
    tableBg: "#1f2937",
    tableRowBg: "#1f2937",
    tableRowAltBg: "#1f2937",
    tableHeaderBg: "#111827",
    text: "#f9fafb",
    subtext: "#9ca3af",
    border: "#374151",
    formBg: "#1f2937",
    inputBg: "#374151",
    inputText: "#f9fafb",
    buttonBg: "#0ea5e9",
    buttonText: "#f9fafb",
    cancelButtonBg: "#4b5563",
    cancelButtonText: "#f9fafb",
    highlight: "#0ea5e9"
  } : {
    bg: "#f8fafc",
    cardBg: "#ffffff",
    tableBg: "#ffffff",
    tableRowBg: "#ffffff",
    tableRowAltBg: "#f9fafb",
    tableHeaderBg: "#f0f9ff",
    text: "#0f172a",
    subtext: "#64748b",
    border: "#e2e8f0",
    formBg: "#f0f9ff",
    inputBg: "#ffffff",
    inputText: "#0f172a",
    buttonBg: "#0ea5e9",
    buttonText: "#ffffff",
    cancelButtonBg: "#f1f5f9",
    cancelButtonText: "#64748b",
    highlight: "#0ea5e9"
  };

  return (
    <div style={{ 
      width: "100%", 
      padding: "24px", 
      background: theme.bg,
      color: theme.text,
      borderRadius: "12px",
      transition: "all 0.3s ease"
    }}>
      {/* Cabeçalho da seção */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "24px" 
      }}>
        <div>
          <h2 style={{
            fontWeight: 700,
            fontSize: "1.75rem",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: theme.text
          }}>
            <FiFileText size={28} color={theme.highlight} />
            Gestão de Ordens de Serviço
          </h2>
          <p style={{ 
            color: theme.subtext, 
            fontSize: "1rem", 
            margin: "8px 0 0 0" 
          }}>
            Emissão, controle e agenda de ordens com status, checklist e alertas em tempo real.
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            onClick={handleRefresh} 
            style={{
              background: theme.cancelButtonBg,
              color: theme.cancelButtonText,
              border: "none",
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.9rem",
              fontWeight: 500,
              transition: "all 0.2s ease"
            }}
          >
            <FiRefreshCw size={16} className={atualizando ? "spin" : ""} />
            Atualizar
          </button>
          
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={{
              background: theme.cancelButtonBg,
              color: theme.cancelButtonText,
              border: "none",
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.9rem",
              fontWeight: 500,
              transition: "all 0.2s ease"
            }}
          >
            {darkMode ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px", 
        marginBottom: "24px" 
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: theme.cardBg,
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            border: `1px solid ${theme.border}`,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div style={{ 
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "12px"
          }}>
            <div style={{ 
              fontSize: "0.9rem", 
              fontWeight: 600, 
              color: theme.highlight
            }}>
              Total de Ordens
            </div>
            <div style={{
              background: `${theme.highlight}20`,
              padding: "8px",
              borderRadius: "8px",
              color: theme.highlight
            }}>
              <FiBarChart2 size={20} />
            </div>
          </div>
          <div style={{ 
            fontSize: "2rem", 
            fontWeight: 700, 
            color: theme.text
          }}>
            {total}
          </div>
          <div style={{
            marginTop: "8px",
            fontSize: "0.85rem",
            color: theme.subtext
          }}>
            {ordensFiltradas.length} exibidas no filtro atual
          </div>
        </motion.div>
        
        {OSSTATUS.slice(0, 4).map((status, index) => (
          <motion.div 
            key={status.nome}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
            style={{
              background: theme.cardBg,
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
              border: `1px solid ${theme.border}`,
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div style={{ 
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "12px"
            }}>
              <div style={{ 
                fontSize: "0.9rem", 
                fontWeight: 600, 
                color: status.cor, 
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: status.cor,
                  display: "inline-block"
                }}></span>
                {status.nome}
              </div>
              <div style={{
                background: `${status.cor}20`,
                padding: "8px",
                borderRadius: "8px",
                color: status.cor
              }}>
                {status.icon}
              </div>
            </div>
            <div style={{ 
              fontSize: "2rem", 
              fontWeight: 700, 
              color: status.cor 
            }}>
              {porStatus(status.nome)}
            </div>
            <div style={{
              marginTop: "8px",
              fontSize: "0.85rem",
              color: theme.subtext
            }}>
              {status.nome === "Pendente" ? "Aguardando atendimento" : 
               status.nome === "Em andamento" ? "Em execução" :
               status.nome === "Aguardando Peça" ? "Esperando componentes" :
               status.nome === "Concluída" ? "Finalizadas com sucesso" : "Canceladas pelo cliente"}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Barra de ações e filtros */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "16px",
        background: theme.cardBg,
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        border: `1px solid ${theme.border}`
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          flexWrap: "wrap"
        }}>
          <div style={{ 
            position: "relative",
            display: "flex",
            alignItems: "center"
          }}>
            <div style={{
              position: "absolute",
              left: "12px",
              color: theme.subtext
            }}>
              <FiSearch size={16} />
            </div>
            <input
              type="text"
              placeholder="Buscar OS, cliente ou responsável..."
              value={pesquisa}
              onChange={e => setPesquisa(e.target.value)}
              style={{
                background: theme.inputBg,
                color: theme.inputText,
                border: `1px solid ${theme.border}`,
                borderRadius: "8px",
                padding: "10px 12px 10px 36px",
                fontSize: "0.95rem",
                width: "280px",
                outline: "none"
              }}
            />
          </div>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px" 
          }}>
            <FiFilter size={16} color={theme.subtext} />
            <select 
              value={filtroStatus} 
              onChange={e => setFiltroStatus(e.target.value)} 
              style={{
                background: theme.inputBg,
                color: theme.inputText,
                border: `1px solid ${theme.border}`,
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "0.95rem",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="">Todos os status</option>
              {OSSTATUS.map(s => <option key={s.nome}>{s.nome}</option>)}
            </select>
          </div>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px" 
          }}>
            <FiAlertTriangle size={16} color={theme.subtext} />
            <select 
              value={filtroPrioridade} 
              onChange={e => setFiltroPrioridade(e.target.value)} 
              style={{
                background: theme.inputBg,
                color: theme.inputText,
                border: `1px solid ${theme.border}`,
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "0.95rem",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="">Todas as prioridades</option>
              {PRIORIDADES.map(p => <option key={p.nome}>{p.nome}</option>)}
            </select>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)} 
          style={{
            background: theme.buttonBg,
            color: theme.buttonText,
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
          }}
        >
          <FiPlusCircle size={18} />
          Nova Ordem de Serviço
        </motion.button>
      </div>

      {/* Formulário de nova OS (condicional) */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              background: theme.formBg,
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: `1px solid ${theme.border}`
            }}
          >
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "20px" 
            }}>
              <h3 style={{ 
                color: theme.text, 
                fontWeight: 600, 
                fontSize: "1.2rem", 
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                {editandoOS ? (
                  <>
                    <FiEdit3 size={20} color={theme.highlight} />
                    Editar Ordem de Serviço
                  </>
                ) : (
                  <>
                    <FiPlusCircle size={20} color={theme.highlight} />
                    Nova Ordem de Serviço
                  </>
                )}
              </h3>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditandoOS(null);
                  setNova({
                    codigo: "",
                    nomeCliente: "",
                    telefoneCliente: "",
                    emailCliente: "",
                    endereco: "",
                    numero: "",
                    cep: "",
                    cidade: "",
                    estado: "",
                    complemento: "",
                    latitude: "",
                    longitude: "",
                    prioridade: "Média",
                    responsavel: "",
                    descricao: ""
                  });
                }} 
                style={{
                  background: "transparent",
                  border: "none",
                  color: theme.subtext,
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={e => e.currentTarget.style.background = theme.cancelButtonBg}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={editandoOS ? handleAtualizarOS : handleAddOS} style={{ display: "grid", gap: "20px" }}>
              {/* Campo de Código */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ 
                  color: theme.subtext, 
                  fontSize: "0.9rem", 
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  🔢 Código da OS
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="OS-2512345"
                    value={nova.codigo}
                    onChange={e => setNova(prev => ({ ...prev, codigo: e.target.value }))}
                    style={{
                      flex: 1,
                      background: theme.inputBg,
                      color: theme.inputText,
                      border: `1px solid ${theme.inputBorder}`,
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "all 0.2s ease"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setNova(prev => ({ ...prev, codigo: gerarCodigoAleatorio() }))}
                    style={{
                      padding: "10px 16px",
                      background: "#667eea",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "#5568d3"}
                    onMouseOut={e => e.currentTarget.style.background = "#667eea"}
                  >
                    🎲 Gerar
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ 
                    color: theme.subtext, 
                    fontSize: "0.9rem", 
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <FiUser size={14} />
                    Nome do Cliente *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Nome completo do cliente"
                    value={nova.nomeCliente}
                    onChange={e => setNova(prev => ({ ...prev, nomeCliente: e.target.value }))}
                    style={{
                      background: theme.inputBg,
                      color: theme.inputText,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "all 0.2s ease"
                    }}
                  />
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ 
                    color: theme.subtext, 
                    fontSize: "0.9rem", 
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <FiPhone size={14} />
                    Telefone do Cliente *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="(XX) XXXXX-XXXX"
                    value={nova.telefoneCliente}
                    onChange={e => setNova(prev => ({ ...prev, telefoneCliente: e.target.value }))}
                    style={{
                      background: theme.inputBg,
                      color: theme.inputText,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "all 0.2s ease"
                    }}
                  />
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ 
                    color: theme.subtext, 
                    fontSize: "0.9rem", 
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <FiMail size={14} />
                    E-mail do Cliente
                  </label>
                  <input
                    type="email"
                    placeholder="cliente@email.com"
                    value={nova.emailCliente}
                    onChange={e => setNova(prev => ({ ...prev, emailCliente: e.target.value }))}
                    style={{
                      background: theme.inputBg,
                      color: theme.inputText,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "all 0.2s ease"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ 
                    color: theme.subtext, 
                    fontSize: "0.9rem", 
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <FiAlertTriangle size={14} />
                    Prioridade
                  </label>
                  <select
                    value={nova.prioridade}
                    onChange={e => setNova(prev => ({ ...prev, prioridade: e.target.value }))}
                    style={{
                      background: theme.inputBg,
                      color: theme.inputText,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.95rem",
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {PRIORIDADES.map(p => <option key={p.nome}>{p.nome}</option>)}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ 
                    color: theme.subtext, 
                    fontSize: "0.9rem", 
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <FiUser size={14} />
                    Responsável *
                  </label>
                  <select
                    required
                    value={nova.responsavel}
                    onChange={e => setNova(prev => ({ ...prev, responsavel: e.target.value }))}
                    style={{
                      background: theme.inputBg,
                      color: theme.inputText,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.95rem",
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <option value="">Selecione um responsável</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.displayName || u.username}>
                        {u.displayName || u.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ 
                    color: theme.subtext, 
                    fontSize: "0.9rem", 
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <FiMapPin size={14} />
                    CEP * (Preenchat primeiro!)
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="XXXXX-XXX"
                    value={nova.cep}
                    onChange={e => {
                      const valor = e.target.value;
                      setNova(prev => ({ ...prev, cep: valor }));
                      // Auto-buscar quando digitar 8 dígitos
                      if (valor.replace(/\D/g, '').length === 8) {
                        setTimeout(() => buscarEnderecoByCEP(), 300);
                      }
                    }}
                    style={{
                      background: theme.inputBg,
                      color: theme.inputText,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "all 0.2s ease"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ 
                    color: theme.subtext, 
                    fontSize: "0.9rem", 
                    fontWeight: 500
                  }}>
                    Número *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Nº"
                    value={nova.numero}
                    onChange={e => setNova(prev => ({ ...prev, numero: e.target.value }))}
                    style={{
                      background: theme.inputBg,
                      color: theme.inputText,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "all 0.2s ease"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignSelf: "flex-end" }}>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={buscarEnderecoByCEP}
                    disabled={nova.cep.replace(/\D/g, '').length !== 8}
                    style={{
                      background: nova.cep.replace(/\D/g, '').length === 8 ? theme.highlight : theme.border,
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: nova.cep.replace(/\D/g, '').length === 8 ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                      opacity: atualizando ? 0.7 : 1
                    }}
                  >
                    <FiMapPin size={14} />
                    {atualizando ? "Buscando..." : "Buscar"}
                  </motion.button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ 
                    color: theme.subtext, 
                    fontSize: "0.9rem", 
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <FiMapPin size={14} />
                    Endereço (Preenchido automaticamente)
                  </label>
                  <input
                    type="text"
                    placeholder="Carregará automaticamente ao buscar CEP"
                    value={nova.endereco}
                    disabled
                    onChange={e => setNova(prev => ({ ...prev, endereco: e.target.value }))}
                    style={{
                      background: theme.inputBg,
                      color: theme.subtext,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "all 0.2s ease",
                      cursor: "not-allowed",
                      opacity: 0.7
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ 
                    color: theme.subtext, 
                    fontSize: "0.9rem", 
                    fontWeight: 500
                  }}>
                    Cidade (Preenchida automaticamente)
                  </label>
                  <input
                    type="text"
                    placeholder="Carregará automaticamente"
                    value={nova.cidade}
                    disabled
                    onChange={e => setNova(prev => ({ ...prev, cidade: e.target.value }))}
                    style={{
                      background: theme.inputBg,
                      color: theme.subtext,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "all 0.2s ease",
                      cursor: "not-allowed",
                      opacity: 0.7
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ 
                    color: theme.subtext, 
                    fontSize: "0.9rem", 
                    fontWeight: 500
                  }}>
                    Estado (Preenchido automaticamente)
                  </label>
                  <input
                    type="text"
                    placeholder="UF"
                    maxLength="2"
                    value={nova.estado}
                    disabled
                    onChange={e => setNova(prev => ({ ...prev, estado: e.target.value.toUpperCase() }))}
                    style={{
                      background: theme.inputBg,
                      color: theme.subtext,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "all 0.2s ease",
                      cursor: "not-allowed",
                      opacity: 0.7
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ 
                    color: theme.subtext, 
                    fontSize: "0.9rem", 
                    fontWeight: 500
                  }}>
                    Complemento (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Apto, sala, andar, etc"
                    value={nova.complemento || ""}
                    onChange={e => setNova(prev => ({ ...prev, complemento: e.target.value }))}
                    style={{
                      background: theme.inputBg,
                      color: theme.inputText,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "all 0.2s ease"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", padding: "16px", background: `${theme.bg}`, borderRadius: "8px", border: `1px solid ${theme.border}` }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ 
                    color: theme.subtext, 
                    fontSize: "0.9rem", 
                    fontWeight: 500
                  }}>
                    Latitude (Auto-preenchida)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Ex: -23.5505"
                    value={nova.latitude}
                    disabled
                    onChange={e => setNova(prev => ({ ...prev, latitude: e.target.value }))}
                    style={{
                      background: theme.inputBg,
                      color: theme.subtext,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "all 0.2s ease",
                      cursor: "not-allowed",
                      opacity: 0.7
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ 
                    color: theme.subtext, 
                    fontSize: "0.9rem", 
                    fontWeight: 500
                  }}>
                    Longitude (Auto-preenchida)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Ex: -46.6333"
                    value={nova.longitude}
                    disabled
                    onChange={e => setNova(prev => ({ ...prev, longitude: e.target.value }))}
                    style={{
                      background: theme.inputBg,
                      color: theme.subtext,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "all 0.2s ease",
                      cursor: "not-allowed",
                      opacity: 0.7
                    }}
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={buscarCoordenadas}
                disabled={!nova.endereco || !nova.numero || !nova.cidade || !nova.estado}
                style={{
                  background: (nova.endereco && nova.numero && nova.cidade && nova.estado) ? theme.highlight + "20" : theme.border,
                  color: (nova.endereco && nova.numero && nova.cidade && nova.estado) ? theme.highlight : theme.subtext,
                  border: `1px solid ${(nova.endereco && nova.numero && nova.cidade && nova.estado) ? theme.highlight : theme.border}`,
                  borderRadius: "8px",
                  padding: "12px 20px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: (nova.endereco && nova.numero && nova.cidade && nova.estado) ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s ease"
                }}
              >
                <FiMapPin size={18} />
                {atualizando ? "Localizando no mapa..." : "Localizar no Mapa"}
              </motion.button>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ 
                  color: theme.subtext, 
                  fontSize: "0.9rem", 
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <FiFileText size={14} />
                  Descrição do Serviço *
                </label>
                <textarea
                  required
                  placeholder="Descreva o problema ou serviço a ser realizado com detalhes"
                  value={nova.descricao}
                  onChange={e => setNova(prev => ({ ...prev, descricao: e.target.value }))}
                  style={{
                    background: theme.inputBg,
                    color: theme.inputText,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "0.95rem",
                    minHeight: "120px",
                    resize: "vertical",
                    outline: "none",
                    transition: "all 0.2s ease"
                  }}
                />
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                {editandoOS && (
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button" 
                    onClick={handleExcluirOS}
                    style={{
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: "1px solid #fca5a5",
                      borderRadius: "8px",
                      padding: "12px 20px",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    🗑️ Excluir OS
                  </motion.button>
                )}
                <div style={{ display: "flex", gap: "12px", marginLeft: "auto" }}>
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button" 
                    onClick={() => {
                      setShowForm(false);
                      setEditandoOS(null);
                      setNova({
                        codigo: "",
                        nomeCliente: "",
                        telefoneCliente: "",
                        emailCliente: "",
                        endereco: "",
                        numero: "",
                        cep: "",
                        cidade: "",
                        estado: "",
                        complemento: "",
                        latitude: "",
                        longitude: "",
                        prioridade: "Média",
                        responsavel: "",
                        descricao: ""
                      });
                    }}
                    style={{
                      background: theme.cancelButtonBg,
                      color: theme.cancelButtonText,
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 20px",
                      fontWeight: 500,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    Cancelar
                  </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit" 
                  style={{
                    background: theme.buttonBg,
                    color: theme.buttonText,
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 20px",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <FiCheck size={18} />
                  {editandoOS ? "Atualizar OS" : "Cadastrar OS"}
                </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabela de ordens */}
      <div style={{
        background: theme.tableBg,
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        marginBottom: "24px",
        border: `1px solid ${theme.border}`
      }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "clamp(0.75rem, 1vw, 0.9rem)",
            tableLayout: "fixed"
          }}>
            <thead>
              <tr style={{ 
                background: theme.tableHeaderBg, 
                borderBottom: `1px solid ${theme.border}` 
              }}>
                <th style={{ 
                  padding: "clamp(8px, 1.5vw, 16px)", 
                  textAlign: "left", 
                  color: theme.text, 
                  fontWeight: 600,
                  width: "8%"
                }}>
                  Código
                </th>
                <th style={{ 
                  padding: "clamp(8px, 1.5vw, 16px)", 
                  textAlign: "left", 
                  color: theme.text, 
                  fontWeight: 600,
                  width: "14%"
                }}>
                  Cliente
                </th>
                <th style={{ 
                  padding: "clamp(8px, 1.5vw, 16px)", 
                  textAlign: "left", 
                  color: theme.text, 
                  fontWeight: 600,
                  width: "11%"
                }}>
                  Telefone
                </th>
                <th style={{ 
                  padding: "clamp(8px, 1.5vw, 16px)", 
                  textAlign: "left", 
                  color: theme.text, 
                  fontWeight: 600,
                  width: "15%"
                }}>
                  Endereço
                </th>
                <th style={{ 
                  padding: "clamp(8px, 1.5vw, 16px)", 
                  textAlign: "left", 
                  color: theme.text, 
                  fontWeight: 600,
                  width: "11%"
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: "clamp(8px, 1.5vw, 16px)", 
                  textAlign: "left", 
                  color: theme.text, 
                  fontWeight: 600,
                  width: "8%"
                }}>
                  Prioridade
                </th>
                <th style={{ 
                  padding: "clamp(8px, 1.5vw, 16px)", 
                  textAlign: "left", 
                  color: theme.text, 
                  fontWeight: 600,
                  width: "11%"
                }}>
                  Responsável
                </th>
                <th style={{ 
                  padding: "clamp(8px, 1.5vw, 16px)", 
                  textAlign: "center", 
                  color: theme.text, 
                  fontWeight: 600,
                  width: "6%"
                }}>
                  Tempo
                </th>
                <th style={{ 
                  padding: "clamp(4px, 1vw, 12px)", 
                  textAlign: "center", 
                  color: theme.text, 
                  fontWeight: 600,
                  width: "11%"
                }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {ordensExibidas.length > 0 ? (
                ordensExibidas.map((os, i) => {
                  const statusInfo = getStatusInfo(os.status);
                  const prioridadeInfo = getPrioridadeInfo(os.prioridade);
                  
                  return (
                    <motion.tr 
                      key={os.codigo} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      style={{
                        background: i % 2 === 0 ? theme.tableRowBg : theme.tableRowAltBg,
                        borderBottom: `1px solid ${theme.border}`,
                        transition: "background-color 0.2s ease"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = darkMode ? "#2d3748" : "#f0f9ff"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = i % 2 === 0 ? theme.tableRowBg : theme.tableRowAltBg}
                    >
                      <td style={{ padding: "clamp(8px, 1.5vw, 16px)", color: theme.highlight, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {os.codigo}
                      </td>
                      <td style={{ padding: "clamp(8px, 1.5vw, 16px)", color: theme.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {os.cliente}
                      </td>
                      <td style={{ padding: "clamp(8px, 1.5vw, 16px)", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FiPhone size={14} color={theme.subtext} />
                          {os.telefone || '-'}
                        </div>
                      </td>
                      <td style={{ padding: "clamp(8px, 1.5vw, 16px)", color: theme.text, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {os.endereco && os.numero ? `${os.endereco}, ${os.numero}` : '-'}
                      </td>
                      <td style={{ padding: "clamp(8px, 1.5vw, 16px)" }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "clamp(0.7rem, 0.9vw, 0.85rem)",
                            fontWeight: 600,
                            color: statusInfo.cor,
                            backgroundColor: `${statusInfo.cor}15`,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}>
                            {statusInfo.icon}
                            {os.status}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "clamp(8px, 1.5vw, 16px)" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "clamp(0.7rem, 0.9vw, 0.85rem)",
                          fontWeight: 600,
                          color: prioridadeInfo.cor,
                          backgroundColor: `${prioridadeInfo.cor}15`,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {os.prioridade}
                        </span>
                      </td>
                      <td style={{ padding: "clamp(8px, 1.5vw, 16px)", color: theme.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{
                            width: "clamp(24px, 3vw, 28px)",
                            height: "clamp(24px, 3vw, 28px)",
                            borderRadius: "50%",
                            background: theme.highlight,
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "clamp(0.65rem, 0.8vw, 0.75rem)",
                            fontWeight: 600
                          }}>
                            {os.responsavel ? os.responsavel.split(' ').map(name => name[0]).join('') : 'NA'}
                          </div>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {os.responsavel || 'Não atribuído'}
                          </span>
                        </div>
                      </td>
                      <td style={{ 
                        padding: "clamp(8px, 1.5vw, 16px)", 
                        textAlign: "center",
                        color: theme.text,
                        fontSize: "clamp(0.7rem, 0.9vw, 0.85rem)"
                      }}>
                        <div title={formatDateTime(os.ultimaAtualizacao)} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {getElapsedTime(os.ultimaAtualizacao)}
                          {os.alerta && (
                            <span 
                              title="Alerta pendente" 
                              style={{ 
                                color: "#f59e0b", 
                                marginLeft: "4px",
                                cursor: "help" 
                              }}
                            >
                              ⚠️
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ 
                        padding: "clamp(4px, 1vw, 12px)", 
                        textAlign: "center"
                      }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "2px", flexWrap: "nowrap" }}>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Editar" 
                            onClick={() => abrirEdicaoOS(os)}
                            style={{
                              background: `${theme.highlight}15`,
                              border: "none",
                              borderRadius: "4px",
                              padding: "clamp(3px, 0.8vw, 6px)",
                              color: theme.highlight,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "24px",
                              minHeight: "24px"
                            }}
                          >
                            <FiEdit3 size={12} />
                          </motion.button>
                          
                          {os.status !== "Concluída" && (
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              title="Concluir" 
                              onClick={() => changeStatus(os.codigo, "Concluída")}
                              style={{
                                background: "#10b98115",
                                border: "none",
                                borderRadius: "4px",
                                padding: "clamp(3px, 0.8vw, 6px)",
                                color: "#10b981",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: "24px",
                                minHeight: "24px"
                              }}
                            >
                              <FiCheckCircle size={12} />
                            </motion.button>
                          )}
                          
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Detalhes" 
                            onClick={() => setDetalhesOS(os)}
                            style={{
                              background: `${theme.subtext}15`,
                              border: "none",
                              borderRadius: "4px",
                              padding: "clamp(3px, 0.8vw, 6px)",
                              color: theme.subtext,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "24px",
                              minHeight: "24px"
                            }}
                          >
                            <FiEye size={12} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td 
                    colSpan={9} 
                    style={{ 
                      textAlign: "center", 
                      padding: "32px", 
                      color: theme.subtext 
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <FiSearch size={36} />
                      <div>
                        <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>Nenhuma ordem de serviço encontrada</p>
                        <p style={{ margin: 0, fontSize: "0.9rem" }}>Tente ajustar os filtros ou criar uma nova OS</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>

      {/* Modal de detalhes */}
      <AnimatePresence>
        {detalhesOS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px"
            }}
            onClick={() => setDetalhesOS(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: theme.cardBg,
                borderRadius: "12px",
                padding: "16px",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "95vh",
                overflowY: "auto",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                border: `1px solid ${theme.border}`,
                display: "flex",
                flexDirection: "column"
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start", 
                marginBottom: "12px" 
              }}>
                <div>
                  <h3 style={{ 
                    color: theme.text, 
                    fontWeight: 700, 
                    fontSize: "1.2rem", 
                    margin: 0
                  }}>
                    OS {detalhesOS.codigo}
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    setDetalhesOS(null);
                    setAbaDetalhesOS('info');
                  }} 
                  style={{
                    background: theme.cancelButtonBg,
                    border: "none",
                    color: theme.cancelButtonText,
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "1.2rem"
                  }}
                >
                  ×
                </button>
              </div>

              {/* Tabs de navegação */}
              <div style={{
                display: "flex",
                gap: "4px",
                marginBottom: "12px",
                borderBottom: `2px solid ${theme.border}`,
                paddingBottom: "0"
              }}>
                <button
                  onClick={() => setAbaDetalhesOS('info')}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: abaDetalhesOS === 'info' ? theme.highlight : 'transparent',
                    color: abaDetalhesOS === 'info' ? 'white' : theme.text,
                    border: "none",
                    borderRadius: "8px 8px 0 0",
                    fontWeight: abaDetalhesOS === 'info' ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <FiInfo size={14} />
                  Info
                </button>
                <button
                  onClick={() => setAbaDetalhesOS('chat')}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: abaDetalhesOS === 'chat' ? theme.highlight : 'transparent',
                    color: abaDetalhesOS === 'chat' ? 'white' : theme.text,
                    border: "none",
                    borderRadius: "8px 8px 0 0",
                    fontWeight: abaDetalhesOS === 'chat' ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <FiMessageSquare size={14} />
                  Chat
                </button>
                <button
                  onClick={() => setAbaDetalhesOS('checklist')}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: abaDetalhesOS === 'checklist' ? theme.highlight : 'transparent',
                    color: abaDetalhesOS === 'checklist' ? 'white' : theme.text,
                    border: "none",
                    borderRadius: "8px 8px 0 0",
                    fontWeight: abaDetalhesOS === 'checklist' ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <FiCheckSquare size={14} />
                  Checklist
                </button>
              </div>

              {/* Conteúdo da aba Info */}
              {abaDetalhesOS === 'info' && (
                <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "12px", 
                marginBottom: "16px" 
              }}>
                <div>
                  <p style={{ 
                    color: theme.subtext, 
                    fontSize: "0.85rem", 
                    margin: "0 0 4px 0" 
                  }}>
                    Cliente
                  </p>
                  <p style={{ 
                    color: theme.text, 
                    fontWeight: 600, 
                    fontSize: "1.1rem", 
                    margin: 0 
                  }}>
                    {detalhesOS.cliente}
                  </p>
                </div>
                
                <div>
                  <p style={{ 
                    color: theme.subtext, 
                    fontSize: "0.85rem", 
                    margin: "0 0 4px 0" 
                  }}>
                    Telefone
                  </p>
                  <p style={{ 
                    color: theme.text, 
                    fontWeight: 500, 
                    fontSize: "1rem", 
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <FiPhone size={16} />
                    {detalhesOS.telefone || '-'}
                  </p>
                </div>

                <div>
                  <p style={{ 
                    color: theme.subtext, 
                    fontSize: "0.85rem", 
                    margin: "0 0 4px 0" 
                  }}>
                    E-mail
                  </p>
                  <p style={{ 
                    color: theme.text, 
                    fontWeight: 500, 
                    fontSize: "1rem", 
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <FiMail size={16} />
                    {detalhesOS.email || '-'}
                  </p>
                </div>

                <div>
                  <p style={{ 
                    color: theme.subtext, 
                    fontSize: "0.85rem", 
                    margin: "0 0 4px 0" 
                  }}>
                    Responsável
                  </p>
                  <p style={{ 
                    color: theme.text, 
                    fontWeight: 600, 
                    fontSize: "1rem", 
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <div style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: theme.highlight,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 600
                    }}>
                      {detalhesOS.responsavel ? detalhesOS.responsavel.split(' ').map(name => name[0]).join('') : 'NA'}
                    </div>
                    {detalhesOS.responsavel || 'Não atribuído'}
                  </p>
                </div>
              </div>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "2fr 1fr 1fr", 
                gap: "20px", 
                marginBottom: "24px",
                paddingBottom: "20px",
                borderBottom: `1px solid ${theme.border}`
              }}>
                <div>
                  <p style={{ 
                    color: theme.subtext, 
                    fontSize: "0.85rem", 
                    margin: "0 0 4px 0" 
                  }}>
                    Endereço
                  </p>
                  <p style={{ 
                    color: theme.text, 
                    fontWeight: 500, 
                    fontSize: "1rem", 
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <FiMapPin size={16} />
                    {detalhesOS.endereco && detalhesOS.numero ? `${detalhesOS.endereco}, ${detalhesOS.numero}` : '-'}
                  </p>
                </div>

                <div>
                  <p style={{ 
                    color: theme.subtext, 
                    fontSize: "0.85rem", 
                    margin: "0 0 4px 0" 
                  }}>
                    CEP
                  </p>
                  <p style={{ 
                    color: theme.text, 
                    fontWeight: 500, 
                    fontSize: "1rem", 
                    margin: 0 
                  }}>
                    {detalhesOS.cep || '-'}
                  </p>
                </div>

                <div>
                  <p style={{ 
                    color: theme.subtext, 
                    fontSize: "0.85rem", 
                    margin: "0 0 4px 0" 
                  }}>
                    Cidade/Estado
                  </p>
                  <p style={{ 
                    color: theme.text, 
                    fontWeight: 500, 
                    fontSize: "1rem", 
                    margin: 0 
                  }}>
                    {detalhesOS.cidade && detalhesOS.estado ? `${detalhesOS.cidade}, ${detalhesOS.estado}` : '-'}
                  </p>
                </div>
              </div>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "20px", 
                marginBottom: "24px" 
              }}>
                <div>
                  <p style={{ 
                    color: theme.subtext, 
                    fontSize: "0.85rem", 
                    margin: "0 0 4px 0" 
                  }}>
                    Data de Abertura
                  </p>
                  <p style={{ 
                    color: theme.text, 
                    fontWeight: 500, 
                    fontSize: "1rem", 
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <FiCalendar size={16} />
                    {formatDate(detalhesOS.abertura)}
                  </p>
                </div>
                
                <div>
                  <p style={{ 
                    color: theme.subtext, 
                    fontSize: "0.85rem", 
                    margin: "0 0 4px 0" 
                  }}>
                    Última Atualização
                  </p>
                  <p style={{ 
                    color: theme.text, 
                    fontWeight: 500, 
                    fontSize: "1rem", 
                    margin: 0 
                  }}>
                    {formatDateTime(detalhesOS.ultimaAtualizacao)}
                  </p>
                </div>
                
                <div>
                  <p style={{ 
                    color: theme.subtext, 
                    fontSize: "0.85rem", 
                    margin: "0 0 4px 0" 
                  }}>
                    Status
                  </p>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px" 
                  }}>
                    {(() => {
                      const statusInfo = getStatusInfo(detalhesOS.status);
                      return (
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: statusInfo.cor,
                          backgroundColor: `${statusInfo.cor}15`
                        }}>
                          {statusInfo.icon}
                          {detalhesOS.status}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                
                <div>
                  <p style={{ 
                    color: theme.subtext, 
                    fontSize: "0.85rem", 
                    margin: "0 0 4px 0" 
                  }}>
                    Prioridade
                  </p>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px" 
                  }}>
                    {(() => {
                      const prioridadeInfo = getPrioridadeInfo(detalhesOS.prioridade);
                      return (
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: prioridadeInfo.cor,
                          backgroundColor: `${prioridadeInfo.cor}15`
                        }}>
                          <FiAlertTriangle size={16} />
                          {detalhesOS.prioridade}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: "24px" }}>
                <p style={{ 
                  color: theme.subtext, 
                  fontSize: "0.85rem", 
                  margin: "0 0 8px 0" 
                }}>
                  Descrição
                </p>
                <div style={{ 
                  background: `${theme.bg}`,
                  padding: "16px",
                  borderRadius: "8px",
                  color: theme.text,
                  fontSize: "0.95rem",
                  border: `1px solid ${theme.border}`
                }}>
                  {detalhesOS.descricao || "Sem descrição disponível."}
                </div>
              </div>
                </div>
              )}

              {/* Conteúdo da aba Chat */}
              {abaDetalhesOS === 'chat' && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px"
                }}>
                  <p style={{ 
                    color: theme.subtext, 
                    fontSize: "0.85rem", 
                    margin: 0
                  }}>
                    💬 Comunicação com Prestador
                  </p>
                  {mensagensNaoLidas[detalhesOS.codigo] > 0 && (
                    <span style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      fontSize: "0.7rem",
                      fontWeight: "700",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      minWidth: "20px",
                      textAlign: "center"
                    }}>
                      {mensagensNaoLidas[detalhesOS.codigo]}
                    </span>
                  )}
                </div>
                <div style={{
                  background: `${theme.bg}`,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "8px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  height: "calc(95vh - 320px)",
                  minHeight: "200px"
                }}>
                  {/* Área de mensagens */}
                  <div 
                    ref={chatScrollRef}
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      width: "100%"
                    }}>
                    {(() => {
                      const msgs = mensagensCliente[detalhesOS.codigo] || [];
                      console.log('🔍 RENDER - Total mensagens:', msgs.length);
                      console.log('📋 Estado mensagensCliente:', mensagensCliente);
                      console.log('🔑 Código OS:', detalhesOS.codigo);
                      
                      if (msgs.length === 0) {
                        console.log('⚠️ Mostrando estado vazio');
                        return (
                          <div style={{
                            textAlign: "center",
                            color: theme.subtext,
                            fontSize: "0.85rem",
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%"
                          }}>
                            📬 Envie uma mensagem para iniciar a conversa com o prestador
                          </div>
                        );
                      }
                      
                      console.log('✅ Renderizando', msgs.length, 'mensagens');
                      return msgs.map((msg, index) => {
                        console.log(`💬 Mensagem ${index}:`, msg);
                        return (
                        <div
                          key={msg.id}
                          style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: msg.enviado ? "flex-end" : "flex-start",
                            alignItems: "flex-start",
                            gap: "8px",
                            clear: "both"
                          }}
                        >
                          {/* Avatar do Prestador à esquerda */}
                          {!msg.enviado && (
                            <div style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor: "#10b981", // Verde para prestador
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              flexShrink: 0
                            }}>
                              {(msg.remetente || "P")[0].toUpperCase()}
                            </div>
                          )}
                          
                          {/* Balão da mensagem */}
                          <div
                            style={{
                              maxWidth: "70%",
                              padding: "10px 14px",
                              borderRadius: msg.enviado ? "12px 12px 0 12px" : "12px 12px 12px 0", // Ponta do balão
                              backgroundColor: msg.enviado ? "#0ea5e9" : "#dcfce7", // Base azul, Prestador verde claro
                              color: msg.enviado ? "#ffffff" : "#000",
                              fontSize: "0.85rem",
                              wordBreak: "break-word",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                            }}
                          >
                            {/* Nome do remetente */}
                            <div style={{
                              fontSize: "0.7rem",
                              fontWeight: "700",
                              color: msg.enviado ? "#ffffff" : "#10b981",
                              marginBottom: "4px",
                              opacity: 0.9
                            }}>
                              {msg.enviado ? (msg.remetente || "Você") : (msg.remetente || "Prestador")}
                            </div>
                            
                            {/* Imagem se houver */}
                            {msg.arquivo && msg.tipoArquivo === 'imagem' && (
                              <img 
                                src={msg.arquivo} 
                                alt="Imagem" 
                                style={{
                                  maxWidth: "100%",
                                  borderRadius: "8px",
                                  marginBottom: msg.texto ? "8px" : 0
                                }}
                              />
                            )}
                            
                            {/* Texto da mensagem */}
                            {msg.texto && <div style={{ lineHeight: "1.4" }}>{msg.texto}</div>}
                            
                            {/* Hora e status */}
                            <div style={{
                              fontSize: "0.65rem",
                              opacity: 0.7,
                              marginTop: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: "4px"
                            }}>
                              {msg.data}
                              {msg.enviado && (
                                <span style={{ color: msg.lida ? "#a7f3d0" : "rgba(255,255,255,0.6)" }}>✓✓</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Avatar da Base à direita */}
                          {msg.enviado && (
                            <div style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor: "#0369a1", // Azul escuro para base
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              flexShrink: 0
                            }}>
                              {(msg.remetente || currentUserName || "B")[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      )});
                    })()}
                  </div>
                  
                  {/* Área de entrada */}
                  <div style={{
                    padding: "12px",
                    borderTop: `1px solid ${theme.border}`,
                    display: "flex",
                    gap: "8px"
                  }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleEnviarMensagemCliente(detalhesOS.codigo, inputMensagem[detalhesOS.codigo] || '', file);
                        }
                      }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: theme.inputBg || theme.bg,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      title="Anexar imagem"
                    >
                      <FiImage size={18} />
                    </button>
                    <input
                      type="text"
                      placeholder="Mensagem para o prestador..."
                      value={inputMensagem[detalhesOS.codigo] || ''}
                      onChange={(e) => setInputMensagem(prev => ({
                        ...prev,
                        [detalhesOS.codigo]: e.target.value
                      }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEnviarMensagemCliente(detalhesOS.codigo, inputMensagem[detalhesOS.codigo]);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg || theme.bg,
                        color: theme.text,
                        fontSize: "0.85rem"
                      }}
                    />
                    <button
                      onClick={() => {
                        handleEnviarMensagemCliente(detalhesOS.codigo, inputMensagem[detalhesOS.codigo]);
                      }}
                      disabled={!inputMensagem[detalhesOS.codigo]?.trim()}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: inputMensagem[detalhesOS.codigo]?.trim() ? "#25d366" : "#9ca3af",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        cursor: inputMensagem[detalhesOS.codigo]?.trim() ? "pointer" : "not-allowed",
                        transition: "all 0.2s"
                      }}
                    >
                      Enviar
                    </button>
                  </div>
                </div>
                </div>
              )}

              {/* Conteúdo da aba Checklist */}
              {abaDetalhesOS === 'checklist' && (
                <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px"
                  }}>
                    <p style={{ 
                      color: theme.subtext, 
                      fontSize: "0.85rem", 
                      margin: 0
                    }}>
                      ✅ Checklist do Prestador
                    </p>
                    {checklistPrestador && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGerarPDF}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 16px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                      >
                        <FiFileText size={16} />
                        Baixar PDF
                      </motion.button>
                    )}
                  </div>
                  <div style={{
                    background: `${theme.bg}`,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "8px",
                    padding: "12px",
                    height: "calc(95vh - 320px)",
                    minHeight: "200px",
                    overflowY: "auto"
                  }}>
                    {checklistPrestador ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        
                        {/* Estado */}
                        {checklistPrestador.estado && (
                          <div style={{
                            background: theme.cardBg,
                            border: `1px solid ${theme.border}`,
                            borderRadius: "8px",
                            padding: "16px"
                          }}>
                            <h4 style={{ margin: "0 0 8px 0", color: theme.text, fontSize: "1rem" }}>
                              📍 Localização
                            </h4>
                            <p style={{ margin: 0, color: theme.subtext, fontSize: "0.9rem" }}>
                              <strong>Estado:</strong> {checklistPrestador.estado}
                            </p>
                          </div>
                        )}

                        {/* Etapa 1 - Reconhecimento */}
                        {checklistPrestador.etapa1 && (
                          <div style={{
                            background: theme.cardBg,
                            border: `1px solid ${theme.border}`,
                            borderRadius: "8px",
                            padding: "16px"
                          }}>
                            <h4 style={{ margin: "0 0 12px 0", color: theme.text, fontSize: "1rem" }}>
                              🔍 Etapa 1 - Reconhecimento
                            </h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {checklistPrestador.etapa1.dadosConfirmados !== undefined && (
                                <p style={{ margin: 0, color: theme.subtext, fontSize: "0.9rem" }}>
                                  <strong>Dados Confirmados:</strong> {checklistPrestador.etapa1.dadosConfirmados ? '✅ Sim' : '❌ Não'}
                                </p>
                              )}
                              {checklistPrestador.etapa1.horaReconhecimento && (
                                <p style={{ margin: 0, color: theme.subtext, fontSize: "0.9rem" }}>
                                  <strong>Hora do Reconhecimento:</strong> {new Date(checklistPrestador.etapa1.horaReconhecimento).toLocaleString('pt-BR')}
                                </p>
                              )}
                              {checklistPrestador.etapa1.completedAt && (
                                <p style={{ margin: 0, color: theme.subtext, fontSize: "0.9rem" }}>
                                  <strong>Completado em:</strong> {new Date(checklistPrestador.etapa1.completedAt).toLocaleString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Etapa 2 - Execução */}
                        {checklistPrestador.etapa2 && (
                          <div style={{
                            background: theme.cardBg,
                            border: `1px solid ${theme.border}`,
                            borderRadius: "8px",
                            padding: "16px"
                          }}>
                            <h4 style={{ margin: "0 0 12px 0", color: theme.text, fontSize: "1rem" }}>
                              🛠️ Etapa 2 - Execução
                            </h4>
                            
                            {/* Checklist Items */}
                            {checklistPrestador.etapa2.checklist && checklistPrestador.etapa2.checklist.length > 0 && (
                              <div style={{ marginBottom: "16px" }}>
                                <h5 style={{ margin: "0 0 12px 0", color: theme.text, fontSize: "0.95rem" }}>
                                  📋 Itens do Checklist
                                </h5>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                  {checklistPrestador.etapa2.checklist.map((item, index) => (
                                    <div
                                      key={item.id || index}
                                      style={{
                                        padding: "12px",
                                        background: item.obrigatorio ? "#fef3c7" : theme.bg,
                                        border: `1px solid ${theme.border}`,
                                        borderRadius: "6px"
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                                        <span style={{ fontSize: "1.2rem" }}>
                                          {item.checked ? '✅' : '⬜'}
                                        </span>
                                        <div style={{ flex: 1 }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                            {item.obrigatorio && (
                                              <span style={{ color: "#f59e0b", fontSize: "0.9rem" }}>★</span>
                                            )}
                                            <strong style={{ color: theme.text, fontSize: "0.9rem" }}>
                                              {item.label}
                                            </strong>
                                            <span style={{ 
                                              color: theme.subtext, 
                                              fontSize: "0.75rem", 
                                              background: theme.bg,
                                              padding: "2px 6px",
                                              borderRadius: "4px"
                                            }}>
                                              {item.tipo}
                                            </span>
                                          </div>
                                          
                                          {item.dica && (
                                            <p style={{ margin: "4px 0", color: theme.subtext, fontSize: "0.8rem", fontStyle: "italic" }}>
                                              💡 {item.dica}
                                            </p>
                                          )}
                                          
                                          {item.obs && (
                                            <p style={{ margin: "4px 0", color: theme.subtext, fontSize: "0.85rem" }}>
                                              <strong>Observação:</strong> {item.obs}
                                            </p>
                                          )}
                                          
                                          {item.tipo === 'foto' && item.foto && (
                                            <div style={{ marginTop: "8px" }}>
                                              <p style={{ margin: "0 0 6px 0", color: theme.subtext, fontSize: "0.85rem" }}>
                                                <strong>📷 Foto capturada:</strong>
                                              </p>
                                              {item.foto.startsWith('file://') || item.foto.startsWith('/var/mobile') ? (
                                                <div style={{
                                                  padding: "16px",
                                                  background: "#fef3c7",
                                                  border: "1px dashed #f59e0b",
                                                  borderRadius: "6px",
                                                  textAlign: "center"
                                                }}>
                                                  <p style={{ 
                                                    margin: "0 0 8px 0", 
                                                    color: "#92400e", 
                                                    fontSize: "0.85rem",
                                                    fontWeight: "600"
                                                  }}>
                                                    📱 Foto armazenada no dispositivo móvel
                                                  </p>
                                                  <p style={{ 
                                                    margin: 0, 
                                                    color: "#78350f", 
                                                    fontSize: "0.75rem"
                                                  }}>
                                                    Esta foto está salva localmente no aplicativo do prestador.
                                                    <br />
                                                    Para visualizar, sincronize com o servidor ou acesse via app.
                                                  </p>
                                                </div>
                                              ) : (
                                                <>
                                                  <img 
                                                    src={item.foto} 
                                                    alt={item.label}
                                                    style={{ 
                                                      maxWidth: "100%", 
                                                      maxHeight: "200px",
                                                      borderRadius: "6px",
                                                      border: `1px solid ${theme.border}`,
                                                      objectFit: "cover"
                                                    }}
                                                    onError={(e) => {
                                                      e.target.style.display = 'none';
                                                      e.target.nextSibling.style.display = 'block';
                                                    }}
                                                  />
                                                  <div style={{ 
                                                    display: 'none',
                                                    padding: "16px",
                                                    background: "#fee2e2",
                                                    border: "1px solid #ef4444",
                                                    borderRadius: "6px",
                                                    textAlign: "center"
                                                  }}>
                                                    <p style={{ 
                                                      margin: 0, 
                                                      color: '#991b1b', 
                                                      fontSize: '0.8rem' 
                                                    }}>
                                                      ⚠️ Erro ao carregar imagem
                                                    </p>
                                                  </div>
                                                </>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Informações de conclusão da etapa 2 */}
                            <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: "12px", marginTop: "12px" }}>
                              {checklistPrestador.etapa2.observacoesGerais && (
                                <p style={{ margin: "0 0 8px 0", color: theme.subtext, fontSize: "0.9rem" }}>
                                  <strong>Observações Gerais:</strong> {checklistPrestador.etapa2.observacoesGerais}
                                </p>
                              )}
                              {checklistPrestador.etapa2.horaFinalizacao && (
                                <p style={{ margin: "0 0 8px 0", color: theme.subtext, fontSize: "0.9rem" }}>
                                  <strong>Hora de Finalização:</strong> {new Date(checklistPrestador.etapa2.horaFinalizacao).toLocaleString('pt-BR')}
                                </p>
                              )}
                              {checklistPrestador.etapa2.completedAt && (
                                <p style={{ margin: 0, color: theme.subtext, fontSize: "0.9rem" }}>
                                  <strong>Completado em:</strong> {new Date(checklistPrestador.etapa2.completedAt).toLocaleString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Etapa 3 - Revisão */}
                        {checklistPrestador.etapa3 && (
                          <div style={{
                            background: theme.cardBg,
                            border: `1px solid ${theme.border}`,
                            borderRadius: "8px",
                            padding: "16px"
                          }}>
                            <h4 style={{ margin: "0 0 12px 0", color: theme.text, fontSize: "1rem" }}>
                              ✍️ Etapa 3 - Revisão e Assinatura
                            </h4>
                            
                            {/* Assinatura */}
                            {checklistPrestador.etapa3.assinaturaBase64 && (
                              <div style={{ marginBottom: "16px" }}>
                                <p style={{ margin: "0 0 8px 0", color: theme.subtext, fontSize: "0.9rem" }}>
                                  <strong>✍️ Assinatura do Cliente:</strong>
                                </p>
                                <img 
                                  src={checklistPrestador.etapa3.assinaturaBase64} 
                                  alt="Assinatura"
                                  style={{ 
                                    maxWidth: "100%", 
                                    maxHeight: "150px",
                                    background: "white",
                                    borderRadius: "6px",
                                    border: `1px solid ${theme.border}`,
                                    padding: "8px"
                                  }}
                                />
                              </div>
                            )}

                            {/* Informações da etapa 3 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {checklistPrestador.etapa3.observacoesRevisao && (
                                <p style={{ margin: 0, color: theme.subtext, fontSize: "0.9rem" }}>
                                  <strong>Observações da Revisão:</strong> {checklistPrestador.etapa3.observacoesRevisao}
                                </p>
                              )}
                              {checklistPrestador.etapa3.duracaoTotal && (
                                <p style={{ margin: 0, color: theme.subtext, fontSize: "0.9rem" }}>
                                  <strong>Duração Total:</strong> {checklistPrestador.etapa3.duracaoTotal}
                                </p>
                              )}
                              {checklistPrestador.etapa3.horaFinalizacaoTotal && (
                                <p style={{ margin: 0, color: theme.subtext, fontSize: "0.9rem" }}>
                                  <strong>Hora de Finalização Total:</strong> {new Date(checklistPrestador.etapa3.horaFinalizacaoTotal).toLocaleString('pt-BR')}
                                </p>
                              )}
                              {checklistPrestador.etapa3.completedAt && (
                                <p style={{ margin: 0, color: theme.subtext, fontSize: "0.9rem" }}>
                                  <strong>Completado em:</strong> {new Date(checklistPrestador.etapa3.completedAt).toLocaleString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                      </div>
                    ) : (
                      <div style={{
                        textAlign: "center",
                        color: theme.subtext,
                        fontSize: "0.9rem",
                        padding: "40px 20px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "12px"
                      }}>
                        <FiCheckSquare size={48} style={{ opacity: 0.3 }} />
                        <div>
                          Nenhum checklist preenchido pelo prestador.
                        </div>
                        <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                          Os dados aparecerão aqui quando o prestador completar as etapas no aplicativo.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div style={{ 
                display: "flex", 
                justifyContent: "flex-end", 
                gap: "12px", 
                borderTop: `1px solid ${theme.border}`,
                paddingTop: "12px",
                marginTop: "auto"
              }}>
                {detalhesOS.status !== "Concluída" && (
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      changeStatus(detalhesOS.codigo, "Concluída");
                      setDetalhesOS(null);
                      setAbaDetalhesOS('info');
                    }}
                    style={{
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 16px",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <FiCheckCircle size={18} />
                    Concluir OS
                  </motion.button>
                )}
                
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setDetalhesOS(null);
                    setAbaDetalhesOS('info');
                  }}
                  style={{
                    background: theme.cancelButtonBg,
                    color: theme.cancelButtonText,
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    cursor: "pointer"
                  }}
                >
                  Fechar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rodapé com informações e paginação */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        color: theme.subtext,
        fontSize: "0.9rem",
        padding: "0 8px",
        marginTop: "16px",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div>
          Mostrando {indiceInicio + 1}-{Math.min(indiceFim, ordensFiltradas.length)} de {ordensFiltradas.length} ordens
        </div>
        
        {/* Controles de Paginação */}
        {totalPaginas > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {[...Array(totalPaginas)].map((_, index) => {
              const numeroPagina = index + 1;
              return (
                <motion.button
                  key={numeroPagina}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPaginaAtual(numeroPagina)}
                  style={{
                    minWidth: "32px",
                    height: "32px",
                    padding: "0 8px",
                    background: paginaAtual === numeroPagina ? theme.highlight : theme.bg,
                    color: paginaAtual === numeroPagina ? "white" : theme.text,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: paginaAtual === numeroPagina ? 700 : 500
                  }}
                >
                  {numeroPagina}
                </motion.button>
              );
            })}
          </div>
        )}
        
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <FiRefreshCw size={14} className={atualizando ? "spin" : ""} />
          Última atualização: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Estilos CSS para animações */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}