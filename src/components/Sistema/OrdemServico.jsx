import React, { useState, useEffect } from "react";
import { 
  FiFileText, FiAlertTriangle, FiClock, FiCheckCircle, 
  FiXCircle, FiPlusCircle, FiFilter, FiEdit3, FiEye, 
  FiCheck, FiSearch, FiRefreshCw, FiCalendar, FiUser,
  FiBarChart2, FiActivity, FiMapPin, FiPhone, FiMail
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import firebase from "../../services/firebase";

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
  const [showForm, setShowForm] = useState(false);
  const [detalhesOS, setDetalhesOS] = useState(null);
  const [atualizando, setAtualizando] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagensCliente, setMensagensCliente] = useState({});
  const [inputMensagem, setInputMensagem] = useState({});
  const companyCnpj = localStorage.getItem("companyCnpj") || "";

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

  const handleEnviarMensagemCliente = (osId, mensagem) => {
    if (!mensagem.trim()) return;
    
    // Adicionar mensagem ao estado local
    setMensagensCliente(prev => ({
      ...prev,
      [osId]: [...(prev[osId] || []), {
        id: Date.now(),
        texto: mensagem,
        enviado: true,
        data: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]
    }));
    
    // Limpar input usando estado
    setInputMensagem(prev => ({
      ...prev,
      [osId]: ''
    }));
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
        os.responsavel.toLowerCase().includes(pesquisa.toLowerCase())
      : true;
    
    return matchStatus && matchPrioridade && matchPesquisa;
  });

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
                <FiPlusCircle size={20} color={theme.highlight} />
                Nova Ordem de Serviço
              </h3>
              <button 
                onClick={() => setShowForm(false)} 
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
            
            <form onSubmit={handleAddOS} style={{ display: "grid", gap: "20px" }}>
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
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button" 
                  onClick={() => setShowForm(false)}
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
                  Cadastrar OS
                </motion.button>
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
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.95rem"
          }}>
            <thead>
              <tr style={{ 
                background: theme.tableHeaderBg, 
                borderBottom: `1px solid ${theme.border}` 
              }}>
                <th style={{ 
                  padding: "16px", 
                  textAlign: "left", 
                  color: theme.text, 
                  fontWeight: 600 
                }}>
                  Código
                </th>
                <th style={{ 
                  padding: "16px", 
                  textAlign: "left", 
                  color: theme.text, 
                  fontWeight: 600 
                }}>
                  Cliente
                </th>
                <th style={{ 
                  padding: "16px", 
                  textAlign: "left", 
                  color: theme.text, 
                  fontWeight: 600 
                }}>
                  Telefone
                </th>
                <th style={{ 
                  padding: "16px", 
                  textAlign: "left", 
                  color: theme.text, 
                  fontWeight: 600 
                }}>
                  Endereço
                </th>
                <th style={{ 
                  padding: "16px", 
                  textAlign: "left", 
                  color: theme.text, 
                  fontWeight: 600 
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: "16px", 
                  textAlign: "left", 
                  color: theme.text, 
                  fontWeight: 600 
                }}>
                  Prioridade
                </th>
                <th style={{ 
                  padding: "16px", 
                  textAlign: "left", 
                  color: theme.text, 
                  fontWeight: 600 
                }}>
                  Responsável
                </th>
                <th style={{ 
                  padding: "16px", 
                  textAlign: "center", 
                  color: theme.text, 
                  fontWeight: 600 
                }}>
                  Tempo
                </th>
                <th style={{ 
                  padding: "16px", 
                  textAlign: "center", 
                  color: theme.text, 
                  fontWeight: 600 
                }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {ordensFiltradas.length > 0 ? (
                ordensFiltradas.map((os, i) => {
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
                      <td style={{ padding: "16px", color: theme.highlight, fontWeight: 600 }}>
                        {os.codigo}
                      </td>
                      <td style={{ padding: "16px", color: theme.text, fontWeight: 500 }}>
                        {os.cliente}
                      </td>
                      <td style={{ padding: "16px", color: theme.text }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FiPhone size={14} color={theme.subtext} />
                          {os.telefone || '-'}
                        </div>
                      </td>
                      <td style={{ padding: "16px", color: theme.text, fontSize: "0.9rem" }}>
                        {os.endereco && os.numero ? `${os.endereco}, ${os.numero}` : '-'}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: statusInfo.cor,
                            backgroundColor: `${statusInfo.cor}15`
                          }}>
                            {statusInfo.icon}
                            {os.status}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: prioridadeInfo.cor,
                          backgroundColor: `${prioridadeInfo.cor}15`
                        }}>
                          {os.prioridade}
                        </span>
                      </td>
                      <td style={{ padding: "16px", color: theme.text, fontWeight: 500 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                            {os.responsavel.split(' ').map(name => name[0]).join('')}
                          </div>
                          {os.responsavel}
                        </div>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        textAlign: "center",
                        color: theme.text
                      }}>
                        <div title={formatDateTime(os.ultimaAtualizacao)}>
                          {getElapsedTime(os.ultimaAtualizacao)}
                          {os.alerta && (
                            <span 
                              title="Alerta pendente" 
                              style={{ 
                                color: "#f59e0b", 
                                marginLeft: "6px",
                                cursor: "help" 
                              }}
                            >
                              ⚠️
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        textAlign: "center"
                      }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                          <motion.button 
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            title="Editar" 
                            style={{
                              background: `${theme.highlight}15`,
                              border: "none",
                              borderRadius: "8px",
                              padding: "8px",
                              color: theme.highlight,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <FiEdit3 size={16} />
                          </motion.button>
                          
                          {os.status !== "Concluída" && (
                            <motion.button 
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                              title="Concluir" 
                              onClick={() => changeStatus(os.codigo, "Concluída")}
                              style={{
                                background: "#10b98115",
                                border: "none",
                                borderRadius: "8px",
                                padding: "8px",
                                color: "#10b981",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <FiCheckCircle size={16} />
                            </motion.button>
                          )}
                          
                          <motion.button 
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            title="Detalhes" 
                            onClick={() => setDetalhesOS(os)}
                            style={{
                              background: `${theme.subtext}15`,
                              border: "none",
                              borderRadius: "8px",
                              padding: "8px",
                              color: theme.subtext,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <FiEye size={16} />
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
                padding: "24px",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "80vh",
                overflowY: "auto",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                border: `1px solid ${theme.border}`
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start", 
                marginBottom: "20px" 
              }}>
                <div>
                  <h3 style={{ 
                    color: theme.text, 
                    fontWeight: 700, 
                    fontSize: "1.4rem", 
                    margin: "0 0 4px 0" 
                  }}>
                    Ordem de Serviço {detalhesOS.codigo}
                  </h3>
                  <p style={{ 
                    color: theme.subtext, 
                    margin: 0, 
                    fontSize: "0.95rem" 
                  }}>
                    Detalhes completos da ordem
                  </p>
                </div>
                <button 
                  onClick={() => setDetalhesOS(null)} 
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
                  <div style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center"
                  }}>
                    <div style={{ 
                      color: theme.text, 
                      fontWeight: 500, 
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flex: 1
                    }}>
                      <FiPhone size={16} />
                      {detalhesOS.telefone || '-'}
                    </div>
                    {detalhesOS.telefone && (
                      <button
                        onClick={() => handleEnviarWhatsApp(detalhesOS.cliente, detalhesOS.telefone, detalhesOS.codigo)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#25d366",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          whiteSpace: "nowrap"
                        }}
                        title="Enviar mensagem via WhatsApp"
                      >
                        📱 WhatsApp
                      </button>
                    )}
                  </div>
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
                      {detalhesOS.responsavel.split(' ').map(name => name[0]).join('')}
                    </div>
                    {detalhesOS.responsavel}
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

              <div style={{ marginBottom: "24px" }}>
                <p style={{ 
                  color: theme.subtext, 
                  fontSize: "0.85rem", 
                  margin: "0 0 12px 0" 
                }}>
                  💬 Comunicação com Cliente
                </p>
                <div style={{
                  background: `${theme.bg}`,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "8px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  height: "250px"
                }}>
                  {/* Área de mensagens */}
                  <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}>
                    {(mensagensCliente[detalhesOS.codigo] || []).length === 0 ? (
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
                        📱 Clique em <strong>WhatsApp</strong> acima para iniciar conversa com o cliente<br/>
                        ou envie uma mensagem aqui
                      </div>
                    ) : (
                      (mensagensCliente[detalhesOS.codigo] || []).map((msg) => (
                        <div
                          key={msg.id}
                          style={{
                            display: "flex",
                            justifyContent: msg.enviado ? "flex-end" : "flex-start",
                            marginBottom: "4px"
                          }}
                        >
                          <div
                            style={{
                              maxWidth: "70%",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              backgroundColor: msg.enviado ? "#dcfce7" : "#f0f0f0",
                              color: "#000",
                              fontSize: "0.85rem",
                              wordBreak: "break-word"
                            }}
                          >
                            <div>{msg.texto}</div>
                            <div style={{
                              fontSize: "0.7rem",
                              opacity: 0.6,
                              marginTop: "4px"
                            }}>
                              {msg.data}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Área de entrada */}
                  <div style={{
                    padding: "12px",
                    borderTop: `1px solid ${theme.border}`,
                    display: "flex",
                    gap: "8px"
                  }}>
                    <input
                      type="text"
                      placeholder="Mensagem para o cliente..."
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
                        padding: "8px 12px",
                        borderRadius: "6px",
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
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#25d366",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "flex-end", 
                gap: "12px", 
                borderTop: `1px solid ${theme.border}`,
                paddingTop: "20px"
              }}>
                {detalhesOS.status !== "Concluída" && (
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      changeStatus(detalhesOS.codigo, "Concluída");
                      setDetalhesOS(null);
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
                  onClick={() => setDetalhesOS(null)}
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

      {/* Rodapé com informações */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        color: theme.subtext,
        fontSize: "0.9rem",
        padding: "0 8px",
        marginTop: "16px"
      }}>
        <div>
          Mostrando {ordensFiltradas.length} de {total} ordens de serviço
        </div>
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