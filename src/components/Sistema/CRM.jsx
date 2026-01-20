import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import firebaseService from '../../services/firebase';
import { normalizeCnpj } from '../../utils/cnpj';

// Dados mock para demonstração
const MOCK_CLIENTES = [
  {
    id: "1",
    nome: "Empresa ABC Ltda",
    tipo: "Empresa",
    segmento: "Tecnologia",
    responsavel: "Maria Silva",
    telefone: "(11) 98765-4321",
    email: "contato@empresaabc.com",
    status: "Ativo",
    valorContrato: 2500.00,
    dataUltimoContato: "2025-04-12",
    proximoContato: "2025-05-15",
    endereco: "Av. Paulista, 1000, São Paulo - SP",
    observacoes: "Cliente desde 2023. Prefere contato por email.",
    tags: ["VIP", "Contrato Anual"],
    historico: [
      { data: "2025-04-12", tipo: "Email", assunto: "Renovação de contrato", responsavel: "Carlos Mendes" },
      { data: "2025-03-25", tipo: "Reunião", assunto: "Apresentação de novos serviços", responsavel: "Ana Oliveira" },
      { data: "2025-02-10", tipo: "Suporte", assunto: "Problema técnico resolvido", responsavel: "Rafael Santos" }
    ]
  },
  {
    id: "2",
    nome: "João Pereira",
    tipo: "Pessoa Física",
    segmento: "Profissional Liberal",
    responsavel: "Ana Oliveira",
    telefone: "(11) 97654-3210",
    email: "joao.pereira@email.com",
    status: "Ativo",
    valorContrato: 350.00,
    dataUltimoContato: "2025-04-05",
    proximoContato: "2025-04-20",
    endereco: "Rua das Flores, 123, São Paulo - SP",
    observacoes: "Prefere ser contatado no período da tarde.",
    tags: ["Plano Básico"],
    historico: [
      { data: "2025-04-05", tipo: "Telefone", assunto: "Dúvidas sobre fatura", responsavel: "Ana Oliveira" },
      { data: "2025-03-15", tipo: "Email", assunto: "Envio de documentação", responsavel: "Ana Oliveira" }
    ]
  },
  {
    id: "3",
    nome: "Supermercados Estrela",
    tipo: "Empresa",
    segmento: "Varejo",
    responsavel: "Carlos Mendes",
    telefone: "(11) 3456-7890",
    email: "contato@estrela.com",
    status: "Inativo",
    valorContrato: 0,
    dataUltimoContato: "2025-02-20",
    proximoContato: "2025-04-25",
    endereco: "Av. Brasil, 500, São Paulo - SP",
    observacoes: "Ex-cliente. Potencial para retorno.",
    tags: ["Prospecção", "Antigo Cliente"],
    historico: [
      { data: "2025-02-20", tipo: "Reunião", assunto: "Tentativa de reativação", responsavel: "Carlos Mendes" },
      { data: "2024-11-10", tipo: "Email", assunto: "Cancelamento de serviços", responsavel: "Maria Silva" }
    ]
  },
  {
    id: "4",
    nome: "Clínica Saúde Total",
    tipo: "Empresa",
    segmento: "Saúde",
    responsavel: "Rafael Santos",
    telefone: "(11) 2345-6789",
    email: "adm@clinicasaude.com",
    status: "Ativo",
    valorContrato: 1800.00,
    dataUltimoContato: "2025-04-10",
    proximoContato: "2025-05-10",
    endereco: "Rua Sete de Setembro, 300, São Paulo - SP",
    observacoes: "Necessita de atenção especial para área de segurança de dados.",
    tags: ["Contrato Anual", "Suporte Prioritário"],
    historico: [
      { data: "2025-04-10", tipo: "Visita", assunto: "Manutenção preventiva", responsavel: "Rafael Santos" },
      { data: "2025-03-05", tipo: "Telefone", assunto: "Agendamento de treinamento", responsavel: "Carlos Mendes" }
    ]
  },
  {
    id: "5",
    nome: "Escritório Jurídico Leis & Associados",
    tipo: "Empresa",
    segmento: "Jurídico",
    responsavel: "Ana Oliveira",
    telefone: "(11) 3333-4444",
    email: "contato@leisassociados.com",
    status: "Ativo",
    valorContrato: 1200.00,
    dataUltimoContato: "2025-04-08",
    proximoContato: "2025-04-22",
    endereco: "Rua dos Advogados, 150, São Paulo - SP",
    observacoes: "Cliente exigente. Necessita de relatórios mensais.",
    tags: ["Contrato Mensal"],
    historico: [
      { data: "2025-04-08", tipo: "Email", assunto: "Envio de relatório mensal", responsavel: "Ana Oliveira" },
      { data: "2025-03-20", tipo: "Reunião", assunto: "Revisão de contrato", responsavel: "Maria Silva" }
    ]
  }
];

const MOCK_FUNCIONARIOS = [
  {
    id: "1",
    nome: "Carlos Mendes",
    cargo: "Gerente de Contas",
    departamento: "Comercial",
    email: "carlos.mendes@empresa.com",
    telefone: "(11) 98888-7777",
    foto: "https://randomuser.me/api/portraits/men/32.jpg",
    clientesAtendidos: 12,
    status: "Disponível",
    ultimaAtividade: "2025-04-15T14:30:00"
  },
  {
    id: "2",
    nome: "Ana Oliveira",
    cargo: "Analista de Relacionamento",
    departamento: "Atendimento",
    email: "ana.oliveira@empresa.com",
    telefone: "(11) 97777-6666",
    foto: "https://randomuser.me/api/portraits/women/44.jpg",
    clientesAtendidos: 25,
    status: "Em atendimento",
    ultimaAtividade: "2025-04-15T15:45:00"
  },
  {
    id: "3",
    nome: "Rafael Santos",
    cargo: "Técnico de Suporte",
    departamento: "Suporte",
    email: "rafael.santos@empresa.com",
    telefone: "(11) 96666-5555",
    foto: "https://randomuser.me/api/portraits/men/67.jpg",
    clientesAtendidos: 18,
    status: "Ausente",
    ultimaAtividade: "2025-04-15T12:15:00"
  },
  {
    id: "4",
    nome: "Maria Silva",
    cargo: "Gerente de Relacionamento",
    departamento: "Comercial",
    email: "maria.silva@empresa.com",
    telefone: "(11) 95555-4444",
    foto: "https://randomuser.me/api/portraits/women/28.jpg",
    clientesAtendidos: 30,
    status: "Disponível",
    ultimaAtividade: "2025-04-15T16:00:00"
  }
];

const MOCK_MENSAGENS = [
  {
    id: "1",
    remetente: { id: "1", nome: "Carlos Mendes", tipo: "funcionario" },
    destinatario: { id: "1", nome: "Empresa ABC Ltda", tipo: "cliente" },
    assunto: "Renovação de contrato",
    conteudo: "Prezados, gostaria de agendar uma reunião para discutirmos a renovação do contrato que vence no próximo mês. Podemos agendar para a próxima semana?",
    data: "2025-04-12T10:30:00",
    lida: true,
    anexos: []
  },
  {
    id: "2",
    remetente: { id: "1", nome: "Empresa ABC Ltda", tipo: "cliente" },
    destinatario: { id: "1", nome: "Carlos Mendes", tipo: "funcionario" },
    assunto: "Re: Renovação de contrato",
    conteudo: "Olá Carlos, podemos agendar para terça-feira às 14h. Confirma por favor?",
    data: "2025-04-12T14:45:00",
    lida: true,
    anexos: []
  },
  {
    id: "3",
    remetente: { id: "1", nome: "Carlos Mendes", tipo: "funcionario" },
    destinatario: { id: "1", nome: "Empresa ABC Ltda", tipo: "cliente" },
    assunto: "Re: Re: Renovação de contrato",
    conteudo: "Confirmado! Estarei enviando o convite para a reunião online. Obrigado.",
    data: "2025-04-12T15:20:00",
    lida: true,
    anexos: []
  },
  {
    id: "4",
    remetente: { id: "2", nome: "Ana Oliveira", tipo: "funcionario" },
    destinatario: { id: "2", nome: "João Pereira", tipo: "cliente" },
    assunto: "Esclarecimento sobre fatura",
    conteudo: "Prezado João, conforme conversamos por telefone, estou enviando os detalhes sobre os itens da sua última fatura. Qualquer dúvida, estou à disposição.",
    data: "2025-04-05T16:30:00",
    lida: true,
    anexos: [{ nome: "fatura_detalhada.pdf", tamanho: "245 KB" }]
  },
  {
    id: "5",
    remetente: { id: "4", nome: "Maria Silva", tipo: "funcionario" },
    destinatario: { id: "5", nome: "Escritório Jurídico Leis & Associados", tipo: "cliente" },
    assunto: "Relatório mensal de atividades",
    conteudo: "Prezados, segue em anexo o relatório mensal de atividades conforme solicitado. Por favor, confirmem o recebimento.",
    data: "2025-04-08T09:15:00",
    lida: false,
    anexos: [{ nome: "relatorio_abril_2025.pdf", tamanho: "1.2 MB" }]
  }
];

const MOCK_TAREFAS = [
  {
    id: "1",
    titulo: "Ligar para Empresa ABC",
    cliente: { id: "1", nome: "Empresa ABC Ltda" },
    responsavel: { id: "1", nome: "Carlos Mendes" },
    prazo: "2025-04-18",
    prioridade: "Alta",
    status: "Pendente",
    descricao: "Confirmar detalhes da renovação de contrato"
  },
  {
    id: "2",
    titulo: "Enviar proposta atualizada",
    cliente: { id: "3", nome: "Supermercados Estrela" },
    responsavel: { id: "1", nome: "Carlos Mendes" },
    prazo: "2025-04-20",
    prioridade: "Média",
    status: "Pendente",
    descricao: "Elaborar nova proposta com descontos para reativação"
  },
  {
    id: "3",
    titulo: "Agendar treinamento",
    cliente: { id: "4", nome: "Clínica Saúde Total" },
    responsavel: { id: "3", nome: "Rafael Santos" },
    prazo: "2025-04-25",
    prioridade: "Baixa",
    status: "Pendente",
    descricao: "Treinamento para novos funcionários sobre o sistema"
  },
  {
    id: "4",
    titulo: "Preparar relatório mensal",
    cliente: { id: "5", nome: "Escritório Jurídico Leis & Associados" },
    responsavel: { id: "2", nome: "Ana Oliveira" },
    prazo: "2025-05-05",
    prioridade: "Média",
    status: "Pendente",
    descricao: "Relatório detalhado de atividades e métricas"
  },
  {
    id: "5",
    titulo: "Resolver problema técnico",
    cliente: { id: "2", nome: "João Pereira" },
    responsavel: { id: "3", nome: "Rafael Santos" },
    prazo: "2025-04-16",
    prioridade: "Alta",
    status: "Concluída",
    descricao: "Problema de conexão com o servidor resolvido remotamente"
  }
];

// Componente principal
export default function CRM() {
  // Estados
  const [activeArea, setActiveArea] = useState("clientes");
  const [activeTab, setActiveTab] = useState("lista");
  const [clientes, setClientes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroSegmento, setFiltroSegmento] = useState("Todos");
  const [ordenacao, setOrdenacao] = useState("nome_asc");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [showNovoClienteModal, setShowNovoClienteModal] = useState(false);
  const [showNovaTarefaModal, setShowNovaTarefaModal] = useState(false);
  const [showNovaMensagemModal, setShowNovaMensagemModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showNovoPrestadorModal, setShowNovoPrestadorModal] = useState(false);
  const [showNovoFuncionarioModal, setShowNovoFuncionarioModal] = useState(false);
  const [prestadores, setPrestadores] = useState([]);
  
  const [novaMensagem, setNovaMensagem] = useState({
    destinatario: "",
    assunto: "",
    conteudo: ""
  });
  const [novaTarefa, setNovaTarefa] = useState({
    titulo: "",
    cliente: "",
    responsavel: "",
    prazo: "",
    prioridade: "Média",
    descricao: ""
  });
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    tipo: "Empresa",
    segmento: "",
    responsavel: "",
    telefone: "",
    email: "",
    endereco: "",
    observacoes: ""
  });
  const [novoPrestador, setNovoPrestador] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    especialidades: [],
    status: "Disponível"
  });
  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    cargo: "",
    departamento: "",
    status: "Ativo"
  });
  const [showEditarEspecialidadesModal, setShowEditarEspecialidadesModal] = useState(false);
  const [itemEditandoEspecialidades, setItemEditandoEspecialidades] = useState(null); // pode ser prestador ou funcionário
  const [tipoItemEspecialidades, setTipoItemEspecialidades] = useState(null); // 'prestador' ou 'funcionario'
  const [especialidadaInput, setEspecialidadeInput] = useState("");
  const [conversaAtual, setConversaAtual] = useState(null);
  // Users management (company users)
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ usuario: '', senha: '', displayName: '', role: 'user', active: true, email: '', phone: '', address: '', addressNumber: '', especialidades: [] });
  const [novaEspecialidadeUser, setNovaEspecialidadeUser] = useState("");

  const userRoleLocal = localStorage.getItem('userRole') || 'user';
  const companyCnpjLocal = localStorage.getItem('companyCnpj') || '';

  // Carregar dados
  // Carregar clientes do Firebase
  const loadClientes = async () => {
    if (!companyCnpjLocal) return;
    try {
      const list = await firebaseService.listCompanyUsers(companyCnpjLocal);
      // Filtrar para pegar apenas usuários do tipo cliente
      const clientes = list.filter(u => u.role === 'user' || !u.role).map(u => ({
        id: u.id || u.username,
        nome: u.displayName || u.username || 'Cliente',
        tipo: u.tipoCliente || 'Pessoa Física',
        segmento: u.segmento || 'Geral',
        responsavel: u.responsavel || 'Não atribuído',
        telefone: u.phone || '',
        email: u.email || '',
        status: u.active !== false ? 'Ativo' : 'Inativo',
        valorContrato: u.valorContrato || 0,
        dataUltimoContato: u.dataUltimoContato || new Date().toISOString().split('T')[0],
        proximoContato: u.proximoContato || '',
        endereco: u.address ? `${u.address}, ${u.addressNumber || ''}` : '',
        observacoes: u.observacoes || '',
        tags: u.tags || [],
        historico: u.historico || []
      }));
      setClientes(clientes);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClientes(MOCK_CLIENTES);
    }
  };

  // Carregar prestadores do Firebase
  const loadPrestadores = async () => {
    if (!companyCnpjLocal) return;
    try {
      // Buscar prestadores do banco
      const docs = await firebaseService.queryDatabase('prestadores', 'cnpj', companyCnpjLocal);
      if (docs && docs.length > 0) {
        setPrestadores(docs);
      } else {
        setPrestadores([]);
      }
    } catch (error) {
      console.error('Erro ao carregar prestadores:', error);
      setPrestadores([]);
    }
  };

  // Carregar funcionários do Firebase
  const loadFuncionariosEmpresa = async () => {
    if (!companyCnpjLocal) return;
    try {
      // Buscar funcionários com role 'funcionario' ou 'gerente'
      const list = await firebaseService.listCompanyUsers(companyCnpjLocal);
      const funcionarios = list.filter(u => u.role === 'funcionario' || u.role === 'gerente').map(u => ({
        id: u.id || u.username,
        nome: u.displayName || u.username || 'Funcionário',
        email: u.email || '',
        telefone: u.phone || '',
        cpf: u.cpf || '',
        cargo: u.cargo || (u.role === 'gerente' ? 'Gerente' : 'Funcionário'),
        departamento: u.departamento || 'Administrativo',
        status: u.active !== false ? 'Ativo' : 'Inativo',
        especialidades: u.especialidades || []
      }));
      setFuncionarios(funcionarios);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      setFuncionarios(MOCK_FUNCIONARIOS);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Carrega dados do Firebase
        await Promise.all([
          loadClientes(),
          loadPrestadores(),
          loadFuncionariosEmpresa()
        ]);
        setMensagens(MOCK_MENSAGENS);
        setTarefas(MOCK_TAREFAS);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [companyCnpjLocal]);

  // Filtrar clientes
  const filtrarClientes = () => {
    return clientes.filter(cliente => {
      // Filtro de texto
      if (filtroTexto && !cliente.nome.toLowerCase().includes(filtroTexto.toLowerCase()) &&
          !cliente.email.toLowerCase().includes(filtroTexto.toLowerCase()) &&
          !cliente.telefone.includes(filtroTexto)) {
        return false;
      }
      
      // Filtro de status
      if (filtroStatus !== "Todos" && cliente.status !== filtroStatus) {
        return false;
      }
      
      // Filtro de segmento
      if (filtroSegmento !== "Todos" && cliente.segmento !== filtroSegmento) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Ordenação
      switch (ordenacao) {
        case "nome_asc":
          return a.nome.localeCompare(b.nome);
        case "nome_desc":
          return b.nome.localeCompare(a.nome);
        case "valor_asc":
          return a.valorContrato - b.valorContrato;
        case "valor_desc":
          return b.valorContrato - a.valorContrato;
        case "data_asc":
          return new Date(a.dataUltimoContato) - new Date(b.dataUltimoContato);
        case "data_desc":
          return new Date(b.dataUltimoContato) - new Date(a.dataUltimoContato);
        default:
          return 0;
      }
    });
  };

  // Filtrar funcionários
  const filtrarFuncionarios = () => {
    return funcionarios.filter(funcionario => {
      // Filtro de texto
      if (filtroTexto && !funcionario.nome.toLowerCase().includes(filtroTexto.toLowerCase()) &&
          !funcionario.email.toLowerCase().includes(filtroTexto.toLowerCase()) &&
          !funcionario.cargo.toLowerCase().includes(filtroTexto.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  // Filtrar tarefas
  const filtrarTarefas = () => {
    return tarefas.filter(tarefa => {
      // Filtrar por cliente selecionado (se houver)
      if (clienteSelecionado && tarefa.cliente.id !== clienteSelecionado.id) {
        return false;
      }
      
      // Filtrar por funcionário selecionado (se houver)
      if (funcionarioSelecionado && tarefa.responsavel.id !== funcionarioSelecionado.id) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Ordenar por prioridade e prazo
      const prioridadeValor = { "Alta": 3, "Média": 2, "Baixa": 1 };
      const prioridadeA = prioridadeValor[a.prioridade];
      const prioridadeB = prioridadeValor[b.prioridade];
      
      if (prioridadeA !== prioridadeB) {
        return prioridadeB - prioridadeA; // Maior prioridade primeiro
      }
      
      return new Date(a.prazo) - new Date(b.prazo); // Prazo mais próximo primeiro
    });
  };

  // Filtrar mensagens
  const filtrarMensagens = () => {
    return mensagens.filter(mensagem => {
      // Filtrar por conversa atual
      if (conversaAtual) {
        const isParticipante = 
          (mensagem.remetente.id === conversaAtual.id && mensagem.remetente.tipo === conversaAtual.tipo) ||
          (mensagem.destinatario.id === conversaAtual.id && mensagem.destinatario.tipo === conversaAtual.tipo);
        
        return isParticipante;
      }
      
      // Filtrar por cliente selecionado
      if (clienteSelecionado) {
        return mensagem.remetente.id === clienteSelecionado.id || 
               mensagem.destinatario.id === clienteSelecionado.id;
      }
      
      // Filtrar por funcionário selecionado
      if (funcionarioSelecionado) {
        return mensagem.remetente.id === funcionarioSelecionado.id || 
               mensagem.destinatario.id === funcionarioSelecionado.id;
      }
      
      return true;
    }).sort((a, b) => {
      // Ordenar por data (mais recentes primeiro)
      return new Date(b.data) - new Date(a.data);
    });
  };

  // Obter segmentos únicos
  const segmentosUnicos = () => {
    const segmentos = ["Todos"];
    clientes.forEach(cliente => {
      if (!segmentos.includes(cliente.segmento)) {
        segmentos.push(cliente.segmento);
      }
    });
    return segmentos;
  };

  // --- Company users management ---
  const loadCompanyUsers = async () => {
    if (!companyCnpjLocal) return setUsers([]);
    try {
      // Use API fallback via services/api which already handles firebase fallback
      const list = await firebaseService.listCompanyUsers(companyCnpjLocal);
      setUsers(list || []);
    } catch (err) {
      console.error('Erro ao carregar usuários da empresa:', err);
      setUsers([]);
    }
  };

  useEffect(() => {
    // load users when component mounts if user is manager/admin
    if (userRoleLocal === 'admin' || userRoleLocal === 'gerente') {
      loadCompanyUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenNewUser = () => {
    setEditingUser(null);
    setNewUser({ usuario: '', senha: '', displayName: '', role: 'user', active: true, email: '', phone: '', address: '', addressNumber: '', especialidades: [] });
    setNovaEspecialidadeUser("");
    setShowUserModal(true);
  };

  const handleEditUser = (u) => {
    setEditingUser(u);
    setNewUser({ usuario: u.username || '', senha: '', displayName: u.displayName || '', role: u.role || 'user', active: !!u.active, email: u.email || '', phone: u.phone || '', address: u.address || '', addressNumber: u.addressNumber || '', especialidades: u.especialidades || [] });
    setNovaEspecialidadeUser("");
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!companyCnpjLocal) return alert('CNPJ da empresa não definido.');
    try {
      if (editingUser) {
        // update
        const upd = {
          displayName: newUser.displayName,
          role: newUser.role,
          active: !!newUser.active,
          email: newUser.email || null,
          phone: newUser.phone || null,
          address: newUser.address || null,
          addressNumber: newUser.addressNumber || null,
          especialidades: newUser.especialidades || []
        };
        await firebaseService.updateUser(companyCnpjLocal, editingUser.id, upd);
        await loadCompanyUsers();
        setShowUserModal(false);
      } else {
        // create
        if (!newUser.usuario || !newUser.senha) return alert('Usuário e senha são obrigatórios');
        await firebaseService.registerUser({ cnpj: companyCnpjLocal, usuario: newUser.usuario, senha: newUser.senha, displayName: newUser.displayName, role: newUser.role, active: newUser.active, email: newUser.email, phone: newUser.phone, address: newUser.address, addressNumber: newUser.addressNumber, especialidades: newUser.especialidades || [] });
        await loadCompanyUsers();
        setShowUserModal(false);
      }
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      alert('Erro ao salvar usuário. Veja o console para detalhes.');
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await firebaseService.updateUser(companyCnpjLocal, u.id, { active: !u.active });
      await loadCompanyUsers();
    } catch (err) {
      console.error('Erro ao alternar ativo:', err);
      alert('Erro ao alterar status do usuário.');
    }
  };

  // Handlers para Prestadores e Funcionários (Admin)
  const handleSalvarPrestador = async () => {
    if (!novoPrestador.nome || !novoPrestador.email) {
      alert("Nome e email são obrigatórios");
      return;
    }
    const novoPrestadorObj = {
      id: novoPrestador.id || Date.now().toString(),
      ...novoPrestador,
      cnpj: companyCnpjLocal,
      dataCriacao: novoPrestador.dataCriacao || new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    };
    
    try {
      // Salvar no Firebase
      await firebaseService.setData(`prestadores/${novoPrestadorObj.id}`, novoPrestadorObj);
      
      if (novoPrestador.id) {
        setPrestadores(prestadores.map(p => p.id === novoPrestadorObj.id ? novoPrestadorObj : p));
      } else {
        setPrestadores([...prestadores, novoPrestadorObj]);
      }
      setNovoPrestador({ nome: "", email: "", telefone: "", cpf: "", especialidades: [], status: "Disponível" });
      setShowNovoPrestadorModal(false);
      alert("Prestador salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar prestador:", error);
      alert("Erro ao salvar prestador. Tente novamente.");
    }
  };

  const handleSalvarFuncionario = async () => {
    if (!novoFuncionario.nome || !novoFuncionario.email) {
      alert("Nome e email são obrigatórios");
      return;
    }
    const novoFuncionarioObj = {
      id: novoFuncionario.id || Date.now().toString(),
      ...novoFuncionario,
      username: novoFuncionario.email.split('@')[0],
      cnpj: companyCnpjLocal,
      role: novoFuncionario.cargo === 'Gerente' ? 'gerente' : 'funcionario',
      active: novoFuncionario.status === 'Ativo',
      dataCriacao: novoFuncionario.dataCriacao || new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    };
    
    try {
      // Salvar no Firebase
      await firebaseService.setData(`users/${novoFuncionarioObj.username}`, novoFuncionarioObj);
      
      if (novoFuncionario.id) {
        setFuncionarios(funcionarios.map(f => f.id === novoFuncionarioObj.id ? novoFuncionarioObj : f));
      } else {
        setFuncionarios([...funcionarios, novoFuncionarioObj]);
      }
      setNovoFuncionario({ nome: "", email: "", telefone: "", cpf: "", cargo: "", departamento: "", status: "Ativo" });
      setShowNovoFuncionarioModal(false);
      alert("Funcionário salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      alert("Erro ao salvar funcionário. Tente novamente.");
    }
  };

  const handleDeletarPrestador = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este prestador?")) {
      try {
        // Deletar do Firebase
        await firebaseService.deleteData(`prestadores/${id}`);
        setPrestadores(prestadores.filter(p => p.id !== id));
        alert("Prestador deletado com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar prestador:", error);
        alert("Erro ao deletar prestador. Tente novamente.");
      }
    }
  };

  const handleDeletarFuncionario = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este funcionário?")) {
      try {
        const func = funcionarios.find(f => f.id === id);
        if (!func) return;
        
        // Deletar do Firebase
        const username = func.username || func.email.split('@')[0];
        await firebaseService.deleteData(`users/${username}`);
        setFuncionarios(funcionarios.filter(f => f.id !== id));
        alert("Funcionário deletado com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar funcionário:", error);
        alert("Erro ao deletar funcionário. Tente novamente.");
      }
    }
  };

  // Funções para editar especialidades
  const handleAbrirEditarEspecialidades = (item, tipo) => {
    setItemEditandoEspecialidades(item);
    setTipoItemEspecialidades(tipo);
    setEspecialidadeInput("");
    setShowEditarEspecialidadesModal(true);
  };

  const handleAdicionarEspecialidade = () => {
    if (!especialidadaInput.trim()) return;
    
    const novaEspecialidade = especialidadaInput.trim();
    
    if (tipoItemEspecialidades === 'prestador') {
      const especialidadesAtuais = itemEditandoEspecialidades.especialidades || [];
      if (!especialidadesAtuais.includes(novaEspecialidade)) {
        const prestadorAtualizado = {
          ...itemEditandoEspecialidades,
          especialidades: [...especialidadesAtuais, novaEspecialidade],
          dataAtualizacao: new Date().toISOString()
        };
        setItemEditandoEspecialidades(prestadorAtualizado);
      }
    } else if (tipoItemEspecialidades === 'funcionario') {
      const especialidadesAtuais = itemEditandoEspecialidades.especialidades || [];
      if (!especialidadesAtuais.includes(novaEspecialidade)) {
        const funcionarioAtualizado = {
          ...itemEditandoEspecialidades,
          especialidades: [...especialidadesAtuais, novaEspecialidade],
          dataAtualizacao: new Date().toISOString()
        };
        setItemEditandoEspecialidades(funcionarioAtualizado);
      }
    }
    
    setEspecialidadeInput("");
  };

  const handleRemoverEspecialidade = (especialidade) => {
    if (tipoItemEspecialidades === 'prestador') {
      const prestadorAtualizado = {
        ...itemEditandoEspecialidades,
        especialidades: itemEditandoEspecialidades.especialidades.filter(e => e !== especialidade),
        dataAtualizacao: new Date().toISOString()
      };
      setItemEditandoEspecialidades(prestadorAtualizado);
    } else if (tipoItemEspecialidades === 'funcionario') {
      const funcionarioAtualizado = {
        ...itemEditandoEspecialidades,
        especialidades: itemEditandoEspecialidades.especialidades.filter(e => e !== especialidade),
        dataAtualizacao: new Date().toISOString()
      };
      setItemEditandoEspecialidades(funcionarioAtualizado);
    }
  };

  const handleSalvarEspecialidades = async () => {
    try {
      if (tipoItemEspecialidades === 'prestador') {
        await firebaseService.setData(`prestadores/${itemEditandoEspecialidades.id}`, itemEditandoEspecialidades);
        setPrestadores(prestadores.map(p => p.id === itemEditandoEspecialidades.id ? itemEditandoEspecialidades : p));
      } else if (tipoItemEspecialidades === 'funcionario') {
        const username = itemEditandoEspecialidades.username || itemEditandoEspecialidades.email.split('@')[0];
        await firebaseService.setData(`users/${username}`, itemEditandoEspecialidades);
        setFuncionarios(funcionarios.map(f => f.id === itemEditandoEspecialidades.id ? itemEditandoEspecialidades : f));
      }
      
      setShowEditarEspecialidadesModal(false);
      setItemEditandoEspecialidades(null);
      setTipoItemEspecialidades(null);
      alert("Especialidades salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar especialidades:", error);
      alert("Erro ao salvar especialidades. Tente novamente.");
    }
  };

  // Handlers
  const handleClienteClick = (cliente) => {
    setClienteSelecionado(cliente);
    setFuncionarioSelecionado(null);
    setActiveTab("detalhes");
  };

  const handleFuncionarioClick = (funcionario) => {
    setFuncionarioSelecionado(funcionario);
    setClienteSelecionado(null);
    setActiveTab("detalhes");
  };

  const handleNovaMensagem = () => {
    setNovaMensagem({
      destinatario: clienteSelecionado ? clienteSelecionado.id : "",
      assunto: "",
      conteudo: ""
    });
    setShowNovaMensagemModal(true);
  };

  const handleEnviarMensagem = () => {
    if (!novaMensagem.destinatario || !novaMensagem.assunto || !novaMensagem.conteudo) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const destinatario = clientes.find(c => c.id === novaMensagem.destinatario);
    
    if (!destinatario) {
      alert("Destinatário não encontrado.");
      return;
    }

    const novaMensagemObj = {
      id: Date.now().toString(),
      remetente: { id: "1", nome: "Carlos Mendes", tipo: "funcionario" }, // Usuário logado (simulado)
      destinatario: { id: destinatario.id, nome: destinatario.nome, tipo: "cliente" },
      assunto: novaMensagem.assunto,
      conteudo: novaMensagem.conteudo,
      data: new Date().toISOString(),
      lida: false,
      anexos: []
    };

    setMensagens([novaMensagemObj, ...mensagens]);
    setShowNovaMensagemModal(false);
    setNovaMensagem({ destinatario: "", assunto: "", conteudo: "" });
  };

  const handleNovaTarefa = () => {
    setNovaTarefa({
      titulo: "",
      cliente: clienteSelecionado ? clienteSelecionado.id : "",
      responsavel: "",
      prazo: new Date().toISOString().split('T')[0],
      prioridade: "Média",
      descricao: ""
    });
    setShowNovaTarefaModal(true);
  };

  const handleSalvarTarefa = () => {
    if (!novaTarefa.titulo || !novaTarefa.cliente || !novaTarefa.responsavel || !novaTarefa.prazo) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const cliente = clientes.find(c => c.id === novaTarefa.cliente);
    const responsavel = funcionarios.find(f => f.id === novaTarefa.responsavel);
    
    if (!cliente || !responsavel) {
      alert("Cliente ou responsável não encontrado.");
      return;
    }

    const novaTarefaObj = {
      id: Date.now().toString(),
      titulo: novaTarefa.titulo,
      cliente: { id: cliente.id, nome: cliente.nome },
      responsavel: { id: responsavel.id, nome: responsavel.nome },
      prazo: novaTarefa.prazo,
      prioridade: novaTarefa.prioridade,
      status: "Pendente",
      descricao: novaTarefa.descricao
    };

    setTarefas([...tarefas, novaTarefaObj]);
    setShowNovaTarefaModal(false);
    setNovaTarefa({
      titulo: "",
      cliente: "",
      responsavel: "",
      prazo: "",
      prioridade: "Média",
      descricao: ""
    });
  };

  const handleNovoCliente = () => {
    setNovoCliente({
      nome: "",
      tipo: "Empresa",
      segmento: "",
      responsavel: "",
      telefone: "",
      email: "",
      endereco: "",
      observacoes: ""
    });
    setShowNovoClienteModal(true);
  };

  const handleSalvarCliente = () => {
    if (!novoCliente.nome || !novoCliente.email) {
      alert("Nome e email são campos obrigatórios.");
      return;
    }

    const novoClienteObj = {
      id: Date.now().toString(),
      ...novoCliente,
      status: "Ativo",
      valorContrato: 0,
      dataUltimoContato: new Date().toISOString().split('T')[0],
      proximoContato: "",
      tags: [],
      historico: []
    };

    setClientes([...clientes, novoClienteObj]);
    setShowNovoClienteModal(false);
    setNovoCliente({
      nome: "",
      tipo: "Empresa",
      segmento: "",
      responsavel: "",
      telefone: "",
      email: "",
      endereco: "",
      observacoes: ""
    });
  };

  const handleIniciarConversa = (participante) => {
    setConversaAtual(participante);
    setActiveTab("mensagens");
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (dataString) => {
    const data = new Date(dataString);
    return `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  };

  // Estilos
  const styles = {
    container: {
      padding: "24px",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "@media (max-width: 640px)": {
        padding: "12px"
      }
    },
    header: {
      marginBottom: "24px"
    },
    pageTitle: {
      fontSize: "1.875rem",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 8px 0",
      "@media (max-width: 640px)": {
        fontSize: "1.5rem"
      }
    },
    pageSubtitle: {
      fontSize: "1rem",
      color: "#64748b",
      margin: 0,
      "@media (max-width: 640px)": {
        fontSize: "0.875rem"
      }
    },
    areaSelector: {
      display: "flex",
      gap: "16px",
      marginBottom: "24px",
      flexWrap: "wrap",
      "@media (max-width: 768px)": {
        gap: "12px"
      },
      "@media (max-width: 640px)": {
        gap: "8px"
      }
    },
    areaButton: {
      padding: "12px 24px",
      borderRadius: "8px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      border: "none",
      transition: "all 0.2s ease",
      whiteSpace: "nowrap",
      "@media (max-width: 768px)": {
        padding: "10px 16px",
        fontSize: "0.9rem"
      },
      "@media (max-width: 640px)": {
        padding: "8px 12px",
        fontSize: "0.8rem",
        flex: "1 1 auto",
        minWidth: "100px"
      }
    },
    areaButtonActive: {
      backgroundColor: "#2C30D5",
      color: "white"
    },
    areaButtonInactive: {
      backgroundColor: "#e2e8f0",
      color: "#64748b"
    },
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "16px",
      marginBottom: "24px",
      "@media (max-width: 1024px)": {
        gridTemplateColumns: "repeat(2, 1fr)"
      },
      "@media (max-width: 640px)": {
        gridTemplateColumns: "1fr",
        gap: "12px"
      }
    },
    statCard: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      display: "flex",
      flexDirection: "column"
    },
    statValue: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "4px"
    },
    statLabel: {
      fontSize: "0.875rem",
      color: "#64748b"
    },
    statHighlight: {
      color: "#2C30D5"
    },
    actionBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      flexWrap: "wrap",
      gap: "12px",
      "@media (max-width: 768px)": {
        flexDirection: "column",
        alignItems: "stretch"
      }
    },
    searchContainer: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      "@media (max-width: 640px)": {
        flexDirection: "column",
        gap: "8px"
      }
    },
    searchInput: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      width: "280px",
      fontSize: "0.875rem",
      "@media (max-width: 640px)": {
        width: "100%",
        padding: "8px 12px",
        fontSize: "0.8rem"
      }
    },
    select: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      backgroundColor: "white",
      fontSize: "0.875rem"
    },
    buttonGroup: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      "@media (max-width: 640px)": {
        gap: "8px"
      }
    },
    button: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "none",
      fontSize: "0.875rem",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      whiteSpace: "nowrap",
      "@media (max-width: 640px)": {
        padding: "8px 12px",
        fontSize: "0.75rem",
        gap: "4px"
      }
    },
    primaryButton: {
      backgroundColor: "#2C30D5",
      color: "white"
    },
    secondaryButton: {
      backgroundColor: "#889DD3",
      color: "white"
    },
    successButton: {
      backgroundColor: "#11A561",
      color: "white"
    },
    warningButton: {
      backgroundColor: "#f59e0b",
      color: "white"
    },
    dangerButton: {
      backgroundColor: "#ef4444",
      color: "white"
    },
    outlineButton: {
      backgroundColor: "transparent",
      border: "1px solid #e2e8f0",
      color: "#64748b"
    },
    tabContainer: {
      marginBottom: "24px",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      gap: "8px",
      overflowX: "auto",
      flexWrap: "wrap"
    },
    tab: {
      padding: "12px 8px",
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#64748b",
      cursor: "pointer",
      position: "relative",
      border: "none",
      backgroundColor: "transparent",
      whiteSpace: "nowrap",
      minWidth: "auto",
      "@media (max-width: 640px)": {
        fontSize: "0.75rem",
        padding: "10px 6px"
      }
    },
    activeTab: {
      color: "#2C30D5"
    },
    activeTabIndicator: {
      position: "absolute",
      bottom: "-1px",
      left: 0,
      width: "100%",
      height: "2px",
      backgroundColor: "#2C30D5"
    },
    contentContainer: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "24px"
    },
    contentWithSidebar: {
      gridTemplateColumns: "2fr 1fr",
      "@media (max-width: 1024px)": {
        gridTemplateColumns: "1fr"
      }
    },
    mainContent: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      overflow: "hidden"
    },
    sidebar: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      height: "fit-content"
    },
    sidebarHeader: {
      padding: "16px 20px",
      borderBottom: "1px solid #e2e8f0",
      fontWeight: "600",
      fontSize: "1rem",
      color: "#0f172a"
    },
    sidebarContent: {
      padding: "16px 20px"
    },
    tableContainer: {
      width: "100%",
      overflowX: "auto",
      "-webkit-overflow-scrolling": "touch"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      "@media (max-width: 768px)": {
        fontSize: "0.75rem"
      }
    },
    tableHeader: {
      backgroundColor: "#f8fafc",
      padding: "12px 16px",
      fontSize: "0.75rem",
      fontWeight: "600",
      color: "#64748b",
      textAlign: "left",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: "1px solid #e2e8f0"
    },
    tableRow: {
      borderBottom: "1px solid #e2e8f0",
      transition: "background-color 0.2s"
    },
    tableRowHover: {
      backgroundColor: "#f1f5f9"
    },
    tableCell: {
      padding: "12px 16px",
      fontSize: "0.875rem",
      color: "#334155"
    },
    tableCellHighlight: {
      fontWeight: "600",
      color: "#0f172a"
    },
    statusBadge: {
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: "600"
    },
    statusAtivo: {
      backgroundColor: "#dcfce7",
      color: "#16a34a"
    },
    statusInativo: {
      backgroundColor: "#fee2e2",
      color: "#dc2626"
    },
    statusDisponivel: {
      backgroundColor: "#dcfce7",
      color: "#16a34a"
    },
    statusOcupado: {
      backgroundColor: "#fef3c7",
      color: "#d97706"
    },
    statusAusente: {
      backgroundColor: "#fee2e2",
      color: "#dc2626"
    },
    prioridadeAlta: {
      backgroundColor: "#fee2e2",
      color: "#dc2626"
    },
    prioridadeMedia: {
      backgroundColor: "#fef3c7",
      color: "#d97706"
    },
    prioridadeBaixa: {
      backgroundColor: "#dcfce7",
      color: "#16a34a"
    },
    tag: {
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: "600",
      backgroundColor: "#e0f2fe",
      color: "#0284c7",
      marginRight: "8px",
      marginBottom: "8px"
    },
    detailsContainer: {
      padding: "24px"
    },
    detailsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "24px"
    },
    detailsTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 8px 0"
    },
    detailsSubtitle: {
      fontSize: "1rem",
      color: "#64748b",
      margin: 0
    },
    detailsActions: {
      display: "flex",
      gap: "12px"
    },
    detailsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px"
    },
    detailsSection: {
      marginBottom: "24px"
    },
    sectionTitle: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "12px",
      paddingBottom: "8px",
      borderBottom: "1px solid #e2e8f0"
    },
    detailRow: {
      display: "flex",
      marginBottom: "12px"
    },
    detailLabel: {
      width: "140px",
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#64748b"
    },
    detailValue: {
      flex: 1,
      fontSize: "0.875rem",
      color: "#0f172a"
    },
    avatarContainer: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      marginBottom: "24px"
    },
    avatar: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      objectFit: "cover"
    },
    avatarInfo: {
      flex: 1
    },
    avatarName: {
      fontSize: "1.25rem",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 4px 0"
    },
    avatarTitle: {
      fontSize: "0.875rem",
      color: "#64748b",
      margin: 0
    },
    avatarStatus: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginTop: "8px"
    },
    statusDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%"
    },
    statusDotDisponivel: {
      backgroundColor: "#16a34a"
    },
    statusDotOcupado: {
      backgroundColor: "#d97706"
    },
    statusDotAusente: {
      backgroundColor: "#dc2626"
    },
    statusText: {
      fontSize: "0.75rem",
      color: "#64748b"
    },
    historicoItem: {
      marginBottom: "16px",
      padding: "12px",
      backgroundColor: "#f8fafc",
      borderRadius: "8px"
    },
    historicoHeader: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px"
    },
    historicoTipo: {
      fontSize: "0.75rem",
      fontWeight: "600",
      color: "#2C30D5"
    },
    historicoData: {
      fontSize: "0.75rem",
      color: "#64748b"
    },
    historicoAssunto: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "4px"
    },
    historicoResponsavel: {
      fontSize: "0.75rem",
      color: "#64748b"
    },
    mensagensContainer: {
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    },
    mensagemItem: {
      padding: "16px",
      borderRadius: "12px",
      maxWidth: "80%"
    },
    mensagemEnviada: {
      backgroundColor: "#e0f2fe",
      alignSelf: "flex-end"
    },
    mensagemRecebida: {
      backgroundColor: "#f1f5f9",
      alignSelf: "flex-start"
    },
    mensagemHeader: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px"
    },
    mensagemRemetente: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#0f172a"
    },
    mensagemData: {
      fontSize: "0.75rem",
      color: "#64748b"
    },
    mensagemAssunto: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "8px"
    },
    mensagemConteudo: {
      fontSize: "0.875rem",
      color: "#334155",
      whiteSpace: "pre-wrap"
    },
    mensagemAnexos: {
      marginTop: "12px"
    },
    anexoItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px",
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      borderRadius: "8px",
      marginBottom: "8px"
    },
    anexoIcon: {
      fontSize: "1rem",
      color: "#64748b"
    },
    anexoNome: {
      fontSize: "0.75rem",
      color: "#0f172a",
      flex: 1
    },
    anexoTamanho: {
      fontSize: "0.75rem",
      color: "#64748b"
    },
    mensagemInput: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      padding: "16px",
      borderTop: "1px solid #e2e8f0"
    },
    textarea: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      fontSize: "0.875rem",
      minHeight: "80px",
      resize: "vertical"
    },
    conversasList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    },
    conversaItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "background-color 0.2s"
    },
    conversaItemHover: {
      backgroundColor: "#f1f5f9"
    },
    conversaAvatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      objectFit: "cover",
      backgroundColor: "#e0f2fe",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#2C30D5",
      fontWeight: "600"
    },
    conversaInfo: {
      flex: 1
    },
    conversaNome: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#0f172a"
    },
    conversaPreview: {
      fontSize: "0.75rem",
      color: "#64748b",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    },
    tarefasList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    },
    tarefaItem: {
      padding: "16px",
      borderRadius: "12px",
      backgroundColor: "#f8fafc",
      borderLeft: "4px solid #2C30D5"
    },
    tarefaItemAlta: {
      borderLeftColor: "#ef4444"
    },
    tarefaItemMedia: {
      borderLeftColor: "#f59e0b"
    },
    tarefaItemBaixa: {
      borderLeftColor: "#11A561"
    },
    tarefaHeader: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px"
    },
    tarefaTitulo: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#0f172a"
    },
    tarefaCliente: {
      fontSize: "0.875rem",
      color: "#64748b"
    },
    tarefaFooter: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "12px"
    },
    tarefaResponsavel: {
      fontSize: "0.75rem",
      color: "#64748b"
    },
    tarefaPrazo: {
      fontSize: "0.75rem",
      fontWeight: "600",
      color: "#0f172a"
    },
    emptyState: {
      padding: "48px 24px",
      textAlign: "center"
    },
    emptyStateIcon: {
      fontSize: "3rem",
      marginBottom: "16px",
      color: "#cbd5e1"
    },
    emptyStateText: {
      fontSize: "1rem",
      color: "#64748b",
      marginBottom: "24px"
    },
    loadingState: {
      padding: "48px 24px",
      textAlign: "center",
      color: "#64748b"
    },
    loadingSpinner: {
      width: "40px",
      height: "40px",
      border: "3px solid rgba(203, 213, 225, 0.3)",
      borderRadius: "50%",
      borderTop: "3px solid #2C30D5",
      animation: "spin 1s linear infinite",
      margin: "0 auto 16px auto"
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "12px",
      width: "90%",
      maxWidth: "600px",
      maxHeight: "90vh",
      overflow: "auto",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      "@media (max-width: 640px)": {
        width: "95%",
        maxWidth: "100%",
        maxHeight: "95vh",
        borderRadius: "8px"
      }
    },
    modalHeader: {
      padding: "20px",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      "@media (max-width: 640px)": {
        padding: "16px"
      }
    },
    modalTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#0f172a",
      margin: 0,
      "@media (max-width: 640px)": {
        fontSize: "1.1rem"
      }
    },
    closeButton: {
      backgroundColor: "transparent",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: "#64748b",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "32px",
      height: "32px",
      borderRadius: "6px"
    },
    modalBody: {
      padding: "20px",
      "@media (max-width: 640px)": {
        padding: "16px"
      }
    },
    formGroup: {
      marginBottom: "16px"
    },
    label: {
      display: "block",
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#334155",
      marginBottom: "6px"
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      fontSize: "0.875rem",
      "@media (max-width: 640px)": {
        padding: "8px 10px",
        fontSize: "0.8rem"
      }
    },
    modalFooter: {
      padding: "16px 20px",
      borderTop: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px"
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      "@media (max-width: 640px)": {
        gridTemplateColumns: "1fr",
        gap: "12px"
      }
    },
    statusBadge: {
      fontSize: "0.75rem",
      fontWeight: "600",
      padding: "4px 12px",
      borderRadius: "12px",
      whiteSpace: "nowrap"
    },
    statusAtivo: {
      backgroundColor: "#d1fae5",
      color: "#065f46"
    },
    statusDisponivel: {
      backgroundColor: "#bfdbfe",
      color: "#1e40af"
    },
    statusInativo: {
      backgroundColor: "#fee2e2",
      color: "#991b1b"
    },
    warningButton: {
      backgroundColor: "#fef3c7",
      color: "#92400e",
      border: "1px solid #fde68a",
      "&:hover": {
        backgroundColor: "#fcd34d"
      }
    }
  };

  // Componente
  return (
    <div style={styles.container}>
      {/* Cabeçalho */}
      <header style={styles.header}>
        <h1 style={styles.pageTitle}>Sistema de Gestão de Relacionamento</h1>
        <p style={styles.pageSubtitle}>Gerencie clientes, funcionários e comunicações em um só lugar</p>
      </header>

      {/* Seletor de área */}
      <div style={styles.areaSelector}>
        <button 
          style={{
            ...styles.areaButton,
            ...(activeArea === "clientes" ? styles.areaButtonActive : styles.areaButtonInactive)
          }}
          onClick={() => {
            setActiveArea("clientes");
            setActiveTab("lista");
            setClienteSelecionado(null);
            setFuncionarioSelecionado(null);
          }}
        >
          Área de Clientes
        </button>
        <button 
          style={{
            ...styles.areaButton,
            ...(activeArea === "funcionarios" ? styles.areaButtonActive : styles.areaButtonInactive)
          }}
          onClick={() => {
            setActiveArea("funcionarios");
            setActiveTab("lista");
            setClienteSelecionado(null);
            setFuncionarioSelecionado(null);
          }}
        >
          Área de Funcionários
        </button>
        {(userRoleLocal === 'admin' || userRoleLocal === 'gerente') && (
          <>
            <button 
              style={{
                ...styles.areaButton,
                ...(activeArea === "usuarios" ? styles.areaButtonActive : styles.areaButtonInactive)
              }}
              onClick={() => {
                setActiveArea("usuarios");
                setActiveTab("lista");
                setClienteSelecionado(null);
                setFuncionarioSelecionado(null);
                loadCompanyUsers();
              }}
            >
              Área de Usuários (Empresa)
            </button>

            <button 
              style={{
                ...styles.areaButton,
                backgroundColor: "#11A561",
                color: "white"
              }}
              onClick={() => {
                window.location.href = '/dashboard/users-edit';
              }}
            >
              ⚙️ Gerenciar Usuários
            </button>

            {/* Botão Secret o de Admin - Gerenciar Prestadores e Funcionários */}
            <button 
              style={{
                ...styles.areaButton,
                ...(activeArea === "admin" ? styles.areaButtonActive : styles.areaButtonInactive),
                position: "relative"
              }}
              onClick={() => {
                setActiveArea("admin");
                setActiveTab("lista");
              }}
              title="⚙️ Painel Administrativo"
            >
              👥 Gerenciar Equipe
            </button>
          </>
        )}
      </div>

      {/* Área de Clientes */}
      {activeArea === "clientes" && (
        <>
          {/* Estatísticas */}
          <div style={styles.statsContainer}>
            <motion.div 
              style={styles.statCard}
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{...styles.statValue, ...styles.statHighlight}}>{clientes.filter(c => c.status === "Ativo").length}</div>
              <div style={styles.statLabel}>Clientes Ativos</div>
            </motion.div>

            <motion.div 
              style={styles.statCard}
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div style={styles.statValue}>{formatarMoeda(clientes.reduce((acc, cliente) => acc + cliente.valorContrato, 0))}</div>
              <div style={styles.statLabel}>Valor Total de Contratos</div>
            </motion.div>

            <motion.div 
              style={styles.statCard}
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div style={styles.statValue}>{tarefas.filter(t => t.status === "Pendente").length}</div>
              <div style={styles.statLabel}>Tarefas Pendentes</div>
            </motion.div>

            <motion.div 
              style={styles.statCard}
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div style={styles.statValue}>{mensagens.filter(m => !m.lida && m.destinatario.tipo === "funcionario").length}</div>
              <div style={styles.statLabel}>Mensagens Não Lidas</div>
            </motion.div>
          </div>

          {/* Barra de ações */}
          <div style={styles.actionBar}>
            <div style={styles.searchContainer}>
              <input 
                type="text" 
                placeholder="Buscar cliente, email, telefone..." 
                style={styles.searchInput}
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
              />
              
              <select 
                style={styles.select}
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="Todos">Todos os Status</option>
                <option value="Ativo">Ativos</option>
                <option value="Inativo">Inativos</option>
              </select>
              
              <select 
                style={styles.select}
                value={filtroSegmento}
                onChange={(e) => setFiltroSegmento(e.target.value)}
              >
                {segmentosUnicos().map(segmento => (
                  <option key={segmento} value={segmento}>{segmento}</option>
                ))}
              </select>
              
              <select 
                style={styles.select}
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
              >
                <option value="nome_asc">Nome (A-Z)</option>
                <option value="nome_desc">Nome (Z-A)</option>
                <option value="valor_asc">Valor (Menor-Maior)</option>
                <option value="valor_desc">Valor (Maior-Menor)</option>
                <option value="data_asc">Último Contato (Mais Antigo)</option>
                <option value="data_desc">Último Contato (Mais Recente)</option>
              </select>
            </div>
            
            <div style={styles.buttonGroup}>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={handleNovoCliente}
              >
                ✚ Novo Cliente
              </button>
              
              <button 
                style={{...styles.button, ...styles.secondaryButton}}
                onClick={handleNovaMensagem}
                disabled={!clienteSelecionado}
              >
                ✉️ Nova Mensagem
              </button>
              
              <button 
                style={{...styles.button, ...styles.warningButton}}
                onClick={handleNovaTarefa}
                disabled={!clienteSelecionado}
              >
                📋 Nova Tarefa
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.tabContainer}>
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === "lista" ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab("lista")}
            >
              Lista de Clientes
              {activeTab === "lista" && <div style={styles.activeTabIndicator}></div>}
            </button>
            
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === "detalhes" ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab("detalhes")}
              disabled={!clienteSelecionado}
            >
              Detalhes do Cliente
              {activeTab === "detalhes" && <div style={styles.activeTabIndicator}></div>}
            </button>
            
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === "tarefas" ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab("tarefas")}
            >
              Tarefas
              {activeTab === "tarefas" && <div style={styles.activeTabIndicator}></div>}
            </button>
            
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === "mensagens" ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab("mensagens")}
            >
              Mensagens
              {activeTab === "mensagens" && <div style={styles.activeTabIndicator}></div>}
            </button>
          </div>

          {/* Users management area (only for gerente/admin) */}
          {activeArea === "usuarios" && (userRoleLocal === 'admin' || userRoleLocal === 'gerente') && (
            <div>
              <div style={{...styles.actionBar, marginTop: 8}}>
                <div style={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Buscar usuário, email..."
                    style={styles.searchInput}
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                  />
                </div>
                <div style={styles.buttonGroup}>
                  <button style={{...styles.button, ...styles.primaryButton}} onClick={handleOpenNewUser}>✚ Novo Usuário</button>
                  <button style={{...styles.button, ...styles.outlineButton}} onClick={loadCompanyUsers}>⟳ Recarregar</button>
                </div>
              </div>

              <div style={styles.mainContent}>
                <div style={styles.tableContainer}>
                  {users.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyStateIcon}>👥</div>
                      <p style={styles.emptyStateText}>Nenhum usuário cadastrado para este CNPJ.</p>
                      <button style={{...styles.button, ...styles.primaryButton}} onClick={handleOpenNewUser}>Criar Usuário</button>
                    </div>
                  ) : (
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.tableHeader}>Usuário</th>
                          <th style={styles.tableHeader}>Nome</th>
                          <th style={styles.tableHeader}>E-mail</th>
                          <th style={styles.tableHeader}>Telefone</th>
                          <th style={styles.tableHeader}>Role</th>
                          <th style={styles.tableHeader}>Ativo</th>
                          <th style={styles.tableHeader}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => {
                          if (!filtroTexto) return true;
                          const ft = filtroTexto.toLowerCase();
                          return (u.username && u.username.toLowerCase().includes(ft)) || (u.displayName && u.displayName.toLowerCase().includes(ft)) || (u.email && u.email.toLowerCase().includes(ft));
                        }).map(u => (
                          <tr key={u.id} style={styles.tableRow}>
                            <td style={styles.tableCell}>{u.username}</td>
                            <td style={styles.tableCell}>{u.displayName || '-'}</td>
                            <td style={styles.tableCell}>{u.email || '-'}</td>
                            <td style={styles.tableCell}>{u.phone || '-'}</td>
                            <td style={styles.tableCell}>{u.role || 'user'}</td>
                            <td style={styles.tableCell}>{u.active ? 'Sim' : 'Não'}</td>
                            <td style={styles.tableCell}>
                              <div style={styles.buttonGroup}>
                                <button style={{...styles.button, ...styles.outlineButton}} onClick={() => handleEditUser(u)}>✎ Editar</button>
                                <button style={{...styles.button, ...styles.warningButton}} onClick={() => handleToggleActive(u)}>{u.active ? 'Desativar' : 'Ativar'}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Modal para criar/editar usuário */}
              {showUserModal && (
                <div style={styles.modal}>
                  <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                      <h3 style={styles.modalTitle}>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                      <button style={styles.closeButton} onClick={() => setShowUserModal(false)}>×</button>
                    </div>
                    <div style={styles.modalBody}>
                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Usuário (login)</label>
                          <input style={styles.input} value={newUser.usuario} onChange={(e) => setNewUser({...newUser, usuario: e.target.value})} disabled={!!editingUser} />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Senha{editingUser ? ' (manter em branco para não alterar)' : ''}</label>
                          <input style={styles.input} value={newUser.senha} onChange={(e) => setNewUser({...newUser, senha: e.target.value})} type="password" />
                        </div>
                      </div>

                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Nome</label>
                          <input style={styles.input} value={newUser.displayName} onChange={(e) => setNewUser({...newUser, displayName: e.target.value})} />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>E-mail</label>
                          <input style={styles.input} value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                        </div>
                      </div>

                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Telefone</label>
                          <input style={styles.input} value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Endereço / Nº</label>
                          <input style={styles.input} value={newUser.address} onChange={(e) => setNewUser({...newUser, address: e.target.value})} placeholder="Endereço" />
                          <input style={{...styles.input, marginTop:8}} value={newUser.addressNumber} onChange={(e) => setNewUser({...newUser, addressNumber: e.target.value})} placeholder="Número" />
                        </div>
                      </div>

                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Role</label>
                          <select style={styles.input} value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                            <option value="admin">admin</option>
                            <option value="gerente">gerente</option>
                            <option value="funcionario">funcionario</option>
                            <option value="prestador">prestador</option>
                            <option value="user">user</option>
                          </select>
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Ativo</label>
                          <select style={styles.input} value={newUser.active ? 'true' : 'false'} onChange={(e) => setNewUser({...newUser, active: e.target.value === 'true'})}>
                            <option value="true">Sim</option>
                            <option value="false">Não</option>
                          </select>
                        </div>
                      </div>

                      {(newUser.role === 'prestador' || newUser.role === 'funcionario') && (
                        <div style={styles.formGroup}>
                          <label style={styles.label}>✏️ Especialidades</label>
                          <p style={{fontSize: "0.8rem", color: "#64748b", marginBottom: "8px"}}>Adicione as especialidades deste {newUser.role === 'prestador' ? 'prestador' : 'funcionário'}</p>
                          
                          {(newUser.especialidades || []).length > 0 && (
                            <div style={{display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px"}}>
                              {newUser.especialidades.map((esp, idx) => (
                                <div 
                                  key={idx} 
                                  style={{
                                    backgroundColor: "#dbeafe",
                                    color: "#1e40af",
                                    padding: "6px 12px",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "0.875rem"
                                  }}
                                >
                                  <span>{esp}</span>
                                  <button 
                                    style={{
                                      backgroundColor: "transparent",
                                      border: "none",
                                      color: "#1e40af",
                                      cursor: "pointer",
                                      fontSize: "1rem",
                                      padding: "0",
                                      display: "flex",
                                      alignItems: "center"
                                    }}
                                    onClick={() => setNewUser({
                                      ...newUser,
                                      especialidades: (newUser.especialidades || []).filter((e, i) => i !== idx)
                                    })}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={{display: "flex", gap: "8px"}}>
                            <input 
                              style={{...styles.input, flex: 1}}
                              value={novaEspecialidadeUser}
                              onChange={(e) => setNovaEspecialidadeUser(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && novaEspecialidadeUser.trim()) {
                                  setNewUser({
                                    ...newUser,
                                    especialidades: [...(newUser.especialidades || []), novaEspecialidadeUser.trim()]
                                  });
                                  setNovaEspecialidadeUser("");
                                }
                              }}
                              placeholder="Ex: Entrega, Mecânica, Elétrica..."
                            />
                            <button 
                              style={{...styles.button, ...styles.primaryButton}}
                              onClick={() => {
                                if (novaEspecialidadeUser.trim()) {
                                  setNewUser({
                                    ...newUser,
                                    especialidades: [...(newUser.especialidades || []), novaEspecialidadeUser.trim()]
                                  });
                                  setNovaEspecialidadeUser("");
                                }
                              }}
                            >
                              ➕ Adicionar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={styles.modalFooter}>
                      <button style={{...styles.button, ...styles.outlineButton}} onClick={() => setShowUserModal(false)}>Cancelar</button>
                      <button style={{...styles.button, ...styles.primaryButton}} onClick={handleSaveUser}>{editingUser ? 'Salvar Alterações' : 'Criar Usuário'}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAINEL ADMINISTRATIVO - Gerenciar Prestadores e Funcionários */}
          {activeArea === "admin" && (userRoleLocal === 'admin' || userRoleLocal === 'gerente') && (
            <div>
              {/* Tabs para Clientes, Prestadores e Funcionários */}
              <div style={styles.tabContainer}>
                <button 
                  style={{
                    ...styles.tab,
                    ...(activeTab === "clientes" ? styles.activeTab : {})
                  }}
                  onClick={() => setActiveTab("clientes")}
                >
                  🏢 Clientes da Empresa
                  {activeTab === "clientes" && <div style={styles.activeTabIndicator}></div>}
                </button>

                <button 
                  style={{
                    ...styles.tab,
                    ...(activeTab === "prestadores" ? styles.activeTab : {})
                  }}
                  onClick={() => setActiveTab("prestadores")}
                >
                  👨‍🔧 Prestadores da Empresa
                  {activeTab === "prestadores" && <div style={styles.activeTabIndicator}></div>}
                </button>
                
                <button 
                  style={{
                    ...styles.tab,
                    ...(activeTab === "funcionarios" ? styles.activeTab : {})
                  }}
                  onClick={() => setActiveTab("funcionarios")}
                >
                  👥 Funcionários Internos
                  {activeTab === "funcionarios" && <div style={styles.activeTabIndicator}></div>}
                </button>
              </div>

              {/* Seção Clientes */}
              {activeTab === "clientes" && (
                <div>
                  <div style={{...styles.actionBar, marginTop: "20px"}}>
                    <h3 style={{margin: 0, color: "#0f172a"}}>Gerenciar Clientes</h3>
                    <button 
                      style={{...styles.button, ...styles.primaryButton}}
                      onClick={() => {
                        setClienteSelecionado(null);
                        setEditingUser(null);
                        setNewUser({ usuario: '', senha: '', displayName: '', role: 'user', active: true, email: '', phone: '', address: '', addressNumber: '' });
                        setShowUserModal(true);
                      }}
                    >
                      ➕ Novo Cliente
                    </button>
                  </div>

                  {clientes.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyStateIcon}>🏢</div>
                      <p style={styles.emptyStateText}>Nenhum cliente cadastrado ainda.</p>
                      <button 
                        style={{...styles.button, ...styles.primaryButton}}
                        onClick={() => {
                          setClienteSelecionado(null);
                          setEditingUser(null);
                          setNewUser({ usuario: '', senha: '', displayName: '', role: 'user', active: true, email: '', phone: '', address: '', addressNumber: '' });
                          setShowUserModal(true);
                        }}
                      >
                        Cadastrar Primeiro Cliente
                      </button>
                    </div>
                  ) : (
                    <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", marginTop: "20px"}}>
                      {clientes.map(cliente => (
                        <motion.div 
                          key={cliente.id}
                          style={{
                            backgroundColor: "white",
                            borderRadius: "12px",
                            padding: "20px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                          }}
                          whileHover={{y: -5, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"}}
                        >
                          <div style={{display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px"}}>
                            <h4 style={{margin: 0, color: "#0f172a", fontSize: "1.1rem"}}>{cliente.nome}</h4>
                            <span style={{...styles.statusBadge, ...styles.statusAtivo}}>{cliente.status}</span>
                          </div>
                          
                          <div style={{fontSize: "0.875rem", color: "#64748b", marginBottom: "12px"}}>
                            <p style={{margin: "4px 0"}}>📧 {cliente.email}</p>
                            <p style={{margin: "4px 0"}}>📱 {cliente.telefone || "N/A"}</p>
                            <p style={{margin: "4px 0"}}>🏷️ {cliente.tipo || "Pessoa Física"}</p>
                            <p style={{margin: "4px 0"}}>💼 {cliente.segmento || "Geral"}</p>
                          </div>

                          {cliente.tags && cliente.tags.length > 0 && (
                            <div style={{marginBottom: "12px"}}>
                              <p style={{margin: "8px 0 4px 0", fontSize: "0.875rem", fontWeight: "600", color: "#334155"}}>Tags:</p>
                              <div style={{display: "flex", gap: "4px", flexWrap: "wrap"}}>
                                {cliente.tags.map((tag, idx) => (
                                  <span key={idx} style={styles.tag}>{tag}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div style={{display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid #e2e8f0"}}>
                            <button style={{flex: 1, ...styles.button, ...styles.outlineButton}} onClick={() => {
                              setClienteSelecionado(cliente);
                              setEditingUser(cliente);
                              setNewUser({
                                usuario: cliente.id || '',
                                senha: '',
                                displayName: cliente.nome || '',
                                role: 'user',
                                active: cliente.status === 'Ativo',
                                email: cliente.email || '',
                                phone: cliente.telefone || '',
                                address: cliente.endereco || '',
                                addressNumber: ''
                              });
                              setShowUserModal(true);
                            }}>✎ Editar</button>
                            <button 
                              style={{flex: 1, ...styles.button, ...styles.warningButton}}
                              onClick={() => {
                                if (window.confirm("Tem certeza que deseja deletar este cliente?")) {
                                  setClientes(clientes.filter(c => c.id !== cliente.id));
                                  alert("Cliente deletado com sucesso!");
                                }
                              }}
                            >
                              🗑️ Deletar
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Seção Prestadores */}
              {activeTab === "prestadores" && (
                <div>
                  <div style={{...styles.actionBar, marginTop: "20px"}}>
                    <h3 style={{margin: 0, color: "#0f172a"}}>Gerenciar Prestadores de Serviço</h3>
                    <button 
                      style={{...styles.button, ...styles.primaryButton}}
                      onClick={() => setShowNovoPrestadorModal(true)}
                    >
                      ➕ Novo Prestador
                    </button>
                  </div>

                  {prestadores.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyStateIcon}>👨‍🔧</div>
                      <p style={styles.emptyStateText}>Nenhum prestador cadastrado ainda.</p>
                      <button 
                        style={{...styles.button, ...styles.primaryButton}}
                        onClick={() => setShowNovoPrestadorModal(true)}
                      >
                        Cadastrar Primeiro Prestador
                      </button>
                    </div>
                  ) : (
                    <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", marginTop: "20px"}}>
                      {prestadores.map(prestador => (
                        <motion.div 
                          key={prestador.id}
                          style={{
                            backgroundColor: "white",
                            borderRadius: "12px",
                            padding: "20px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                          }}
                          whileHover={{y: -5, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"}}
                        >
                          <div style={{display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px"}}>
                            <h4 style={{margin: 0, color: "#0f172a", fontSize: "1.1rem"}}>{prestador.nome}</h4>
                            <span style={{...styles.statusBadge, ...styles.statusDisponivel}}>{prestador.status}</span>
                          </div>
                          
                          <div style={{fontSize: "0.875rem", color: "#64748b", marginBottom: "12px"}}>
                            <p style={{margin: "4px 0"}}>📧 {prestador.email}</p>
                            <p style={{margin: "4px 0"}}>📱 {prestador.telefone || "N/A"}</p>
                            <p style={{margin: "4px 0"}}>🆔 {prestador.cpf || "N/A"}</p>
                          </div>

                          {prestador.especialidades && prestador.especialidades.length > 0 && (
                            <div style={{marginBottom: "12px"}}>
                              <p style={{margin: "8px 0 4px 0", fontSize: "0.875rem", fontWeight: "600", color: "#334155"}}>Especialidades:</p>
                              <div style={{display: "flex", gap: "4px", flexWrap: "wrap"}}>
                                {prestador.especialidades.map((esp, idx) => (
                                  <span key={idx} style={styles.tag}>{esp}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div style={{display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid #e2e8f0"}}>
                            <button 
                              style={{flex: 1, ...styles.button, ...styles.outlineButton}}
                              onClick={() => handleAbrirEditarEspecialidades(prestador, 'prestador')}
                            >
                              ✏️ Especialidades
                            </button>
                            <button 
                              style={{flex: 1, ...styles.button, ...styles.warningButton}}
                              onClick={() => handleDeletarPrestador(prestador.id)}
                            >
                              🗑️ Deletar
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Seção Funcionários */}
              {activeTab === "funcionarios" && (
                <div>
                  <div style={{...styles.actionBar, marginTop: "20px"}}>
                    <h3 style={{margin: 0, color: "#0f172a"}}>Gerenciar Funcionários Internos</h3>
                    <button 
                      style={{...styles.button, ...styles.primaryButton}}
                      onClick={() => setShowNovoFuncionarioModal(true)}
                    >
                      ➕ Novo Funcionário
                    </button>
                  </div>

                  {funcionarios.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyStateIcon}>👥</div>
                      <p style={styles.emptyStateText}>Nenhum funcionário cadastrado ainda.</p>
                      <button 
                        style={{...styles.button, ...styles.primaryButton}}
                        onClick={() => setShowNovoFuncionarioModal(true)}
                      >
                        Cadastrar Primeiro Funcionário
                      </button>
                    </div>
                  ) : (
                    <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", marginTop: "20px"}}>
                      {funcionarios.map(func => (
                        <motion.div 
                          key={func.id}
                          style={{
                            backgroundColor: "white",
                            borderRadius: "12px",
                            padding: "20px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                          }}
                          whileHover={{y: -5, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"}}
                        >
                          <div style={{display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px"}}>
                            <h4 style={{margin: 0, color: "#0f172a", fontSize: "1.1rem"}}>{func.nome}</h4>
                            <span style={{...styles.statusBadge, ...styles.statusAtivo}}>{func.status}</span>
                          </div>
                          
                          <div style={{fontSize: "0.875rem", color: "#64748b", marginBottom: "12px"}}>
                            <p style={{margin: "4px 0"}}>💼 {func.cargo || "N/A"}</p>
                            <p style={{margin: "4px 0"}}>🏢 {func.departamento || "N/A"}</p>
                            <p style={{margin: "4px 0"}}>📧 {func.email}</p>
                            <p style={{margin: "4px 0"}}>📱 {func.telefone || "N/A"}</p>
                            <p style={{margin: "4px 0"}}>🆔 {func.cpf || "N/A"}</p>
                          </div>

                          {func.especialidades && func.especialidades.length > 0 && (
                            <div style={{marginBottom: "12px"}}>
                              <p style={{margin: "8px 0 4px 0", fontSize: "0.875rem", fontWeight: "600", color: "#334155"}}>Especialidades:</p>
                              <div style={{display: "flex", gap: "4px", flexWrap: "wrap"}}>
                                {func.especialidades.map((esp, idx) => (
                                  <span key={idx} style={styles.tag}>{esp}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div style={{display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid #e2e8f0"}}>
                            <button 
                              style={{flex: 1, ...styles.button, ...styles.outlineButton}}
                              onClick={() => handleAbrirEditarEspecialidades(func, 'funcionario')}
                            >
                              ✏️ Especialidades
                            </button>
                            <button 
                              style={{flex: 1, ...styles.button, ...styles.warningButton}}
                              onClick={() => handleDeletarFuncionario(func.id)}
                            >
                              🗑️ Deletar
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Modais para Novo Prestador */}
              {showNovoPrestadorModal && (
                <div style={styles.modal}>
                  <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                      <h2 style={styles.modalTitle}>➕ Novo Prestador</h2>
                      <button 
                        style={styles.closeButton}
                        onClick={() => setShowNovoPrestadorModal(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={styles.modalBody}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Nome *</label>
                        <input 
                          style={styles.input} 
                          value={novoPrestador.nome}
                          onChange={(e) => setNovoPrestador({...novoPrestador, nome: e.target.value})}
                          placeholder="Nome do prestador"
                        />
                      </div>
                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Email *</label>
                          <input 
                            style={styles.input} 
                            value={novoPrestador.email}
                            onChange={(e) => setNovoPrestador({...novoPrestador, email: e.target.value})}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Telefone</label>
                          <input 
                            style={styles.input} 
                            value={novoPrestador.telefone}
                            onChange={(e) => setNovoPrestador({...novoPrestador, telefone: e.target.value})}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </div>
                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>CPF</label>
                          <input 
                            style={styles.input} 
                            value={novoPrestador.cpf}
                            onChange={(e) => setNovoPrestador({...novoPrestador, cpf: e.target.value})}
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Status</label>
                          <select 
                            style={styles.input}
                            value={novoPrestador.status}
                            onChange={(e) => setNovoPrestador({...novoPrestador, status: e.target.value})}
                          >
                            <option value="Disponível">Disponível</option>
                            <option value="Em Serviço">Em Serviço</option>
                            <option value="Indisponível">Indisponível</option>
                          </select>
                        </div>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Especialidades (separadas por vírgula)</label>
                        <input 
                          style={styles.input} 
                          value={novoPrestador.especialidades.join(", ")}
                          onChange={(e) => setNovoPrestador({...novoPrestador, especialidades: e.target.value.split(",").map(s => s.trim()).filter(s => s)})}
                          placeholder="Ex: Elétrica, Encanamento, Pintura"
                        />
                      </div>
                    </div>
                    <div style={styles.modalFooter}>
                      <button 
                        style={{...styles.button, ...styles.outlineButton}}
                        onClick={() => setShowNovoPrestadorModal(false)}
                      >
                        Cancelar
                      </button>
                      <button 
                        style={{...styles.button, ...styles.primaryButton}}
                        onClick={handleSalvarPrestador}
                      >
                        ✓ Cadastrar Prestador
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modais para Novo Funcionário */}
              {showNovoFuncionarioModal && (
                <div style={styles.modal}>
                  <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                      <h2 style={styles.modalTitle}>➕ Novo Funcionário</h2>
                      <button 
                        style={styles.closeButton}
                        onClick={() => setShowNovoFuncionarioModal(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={styles.modalBody}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Nome *</label>
                        <input 
                          style={styles.input} 
                          value={novoFuncionario.nome}
                          onChange={(e) => setNovoFuncionario({...novoFuncionario, nome: e.target.value})}
                          placeholder="Nome do funcionário"
                        />
                      </div>
                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Email *</label>
                          <input 
                            style={styles.input} 
                            value={novoFuncionario.email}
                            onChange={(e) => setNovoFuncionario({...novoFuncionario, email: e.target.value})}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Telefone</label>
                          <input 
                            style={styles.input} 
                            value={novoFuncionario.telefone}
                            onChange={(e) => setNovoFuncionario({...novoFuncionario, telefone: e.target.value})}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </div>
                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>CPF</label>
                          <input 
                            style={styles.input} 
                            value={novoFuncionario.cpf}
                            onChange={(e) => setNovoFuncionario({...novoFuncionario, cpf: e.target.value})}
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Cargo *</label>
                          <input 
                            style={styles.input} 
                            value={novoFuncionario.cargo}
                            onChange={(e) => setNovoFuncionario({...novoFuncionario, cargo: e.target.value})}
                            placeholder="Ex: Gerente, Supervisor"
                          />
                        </div>
                      </div>
                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Departamento</label>
                          <input 
                            style={styles.input} 
                            value={novoFuncionario.departamento}
                            onChange={(e) => setNovoFuncionario({...novoFuncionario, departamento: e.target.value})}
                            placeholder="Ex: Administrativo, Suporte"
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Status</label>
                          <select 
                            style={styles.input}
                            value={novoFuncionario.status}
                            onChange={(e) => setNovoFuncionario({...novoFuncionario, status: e.target.value})}
                          >
                            <option value="Ativo">Ativo</option>
                            <option value="Licença">Licença</option>
                            <option value="Inativo">Inativo</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div style={styles.modalFooter}>
                      <button 
                        style={{...styles.button, ...styles.outlineButton}}
                        onClick={() => setShowNovoFuncionarioModal(false)}
                      >
                        Cancelar
                      </button>
                      <button 
                        style={{...styles.button, ...styles.primaryButton}}
                        onClick={handleSalvarFuncionario}
                      >
                        ✓ Cadastrar Funcionário
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal para editar especialidades */}
              {showEditarEspecialidadesModal && itemEditandoEspecialidades && (
                <div style={styles.modal}>
                  <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                      <h2 style={styles.modalTitle}>✏️ Editar Especialidades</h2>
                      <button 
                        style={styles.closeButton}
                        onClick={() => {
                          setShowEditarEspecialidadesModal(false);
                          setItemEditandoEspecialidades(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={styles.modalBody}>
                      <h3 style={{color: "#0f172a", marginTop: 0}}>{itemEditandoEspecialidades.nome}</h3>
                      
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Especialidades Atuais:</label>
                        <div style={{display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px"}}>
                          {(itemEditandoEspecialidades.especialidades || []).length > 0 ? (
                            itemEditandoEspecialidades.especialidades.map((esp, idx) => (
                              <div 
                                key={idx} 
                                style={{
                                  backgroundColor: "#dbeafe",
                                  color: "#1e40af",
                                  padding: "6px 12px",
                                  borderRadius: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px"
                                }}
                              >
                                <span>{esp}</span>
                                <button 
                                  style={{
                                    backgroundColor: "transparent",
                                    border: "none",
                                    color: "#1e40af",
                                    cursor: "pointer",
                                    fontSize: "1.2rem",
                                    padding: "0"
                                  }}
                                  onClick={() => handleRemoverEspecialidade(esp)}
                                >
                                  ✕
                                </button>
                              </div>
                            ))
                          ) : (
                            <p style={{color: "#94a3b8", fontStyle: "italic"}}>Nenhuma especialidade adicionada</p>
                          )}
                        </div>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Adicionar Especialidade:</label>
                        <div style={{display: "flex", gap: "8px"}}>
                          <input 
                            style={{...styles.input, flex: 1}}
                            value={especialidadaInput}
                            onChange={(e) => setEspecialidadeInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAdicionarEspecialidade();
                              }
                            }}
                            placeholder="Digite uma especialidade e pressione Enter"
                          />
                          <button 
                            style={{...styles.button, ...styles.primaryButton}}
                            onClick={handleAdicionarEspecialidade}
                          >
                            ➕ Adicionar
                          </button>
                        </div>
                      </div>
                    </div>
                    <div style={styles.modalFooter}>
                      <button 
                        style={{...styles.button, ...styles.outlineButton}}
                        onClick={() => {
                          setShowEditarEspecialidadesModal(false);
                          setItemEditandoEspecialidades(null);
                        }}
                      >
                        Cancelar
                      </button>
                      <button 
                        style={{...styles.button, ...styles.primaryButton}}
                        onClick={handleSalvarEspecialidades}
                      >
                        ✓ Salvar Especialidades
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conteúdo */}
          {isLoading ? (
            <div style={styles.loadingState}>
              <div style={styles.loadingSpinner}></div>
              <p>Carregando dados...</p>
            </div>
          ) : activeTab === "lista" ? (
            <div style={styles.mainContent}>
              <div style={styles.tableContainer}>
                {filtrarClientes().length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyStateIcon}>👥</div>
                    <p style={styles.emptyStateText}>
                      Nenhum cliente encontrado com os filtros selecionados.
                    </p>
                    <button 
                      style={{...styles.button, ...styles.primaryButton}}
                      onClick={() => {
                        setFiltroTexto("");
                        setFiltroStatus("Todos");
                        setFiltroSegmento("Todos");
                      }}
                    >
                      Limpar Filtros
                    </button>
                  </div>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Cliente</th>
                        <th style={styles.tableHeader}>Contato</th>
                        <th style={styles.tableHeader}>Segmento</th>
                        <th style={styles.tableHeader}>Responsável</th>
                        <th style={styles.tableHeader}>Valor Contrato</th>
                        <th style={styles.tableHeader}>Último Contato</th>
                        <th style={styles.tableHeader}>Status</th>
                        <th style={styles.tableHeader}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrarClientes().map(cliente => (
                        <motion.tr 
                          key={cliente.id}
                          style={styles.tableRow}
                          whileHover={styles.tableRowHover}
                          onClick={() => handleClienteClick(cliente)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td style={{...styles.tableCell, ...styles.tableCellHighlight}}>
                            {cliente.nome}
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              {cliente.tipo}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            {cliente.email}
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              {cliente.telefone}
                            </div>
                          </td>
                          <td style={styles.tableCell}>{cliente.segmento}</td>
                          <td style={styles.tableCell}>{cliente.responsavel}</td>
                          <td style={styles.tableCell}>{formatarMoeda(cliente.valorContrato)}</td>
                          <td style={styles.tableCell}>{formatarData(cliente.dataUltimoContato)}</td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              ...(cliente.status === "Ativo" ? styles.statusAtivo : styles.statusInativo)
                            }}>
                              {cliente.status}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.buttonGroup}>
                              <button 
                                style={{...styles.button, ...styles.outlineButton}}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleIniciarConversa({ id: cliente.id, nome: cliente.nome, tipo: "cliente" });
                                }}
                              >
                                ✉️ Mensagem
                                                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : activeTab === "detalhes" && clienteSelecionado ? (
            <div style={{...styles.contentContainer, ...styles.contentWithSidebar}}>
              <div style={styles.mainContent}>
                <div style={styles.detailsContainer}>
                  <div style={styles.detailsHeader}>
                    <div>
                      <h2 style={styles.detailsTitle}>{clienteSelecionado.nome}</h2>
                      <p style={styles.detailsSubtitle}>{clienteSelecionado.tipo} • {clienteSelecionado.segmento}</p>
                      <div style={{ marginTop: "8px" }}>
                        {clienteSelecionado.tags.map(tag => (
                          <span key={tag} style={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div style={styles.detailsActions}>
                      <button 
                        style={{...styles.button, ...styles.secondaryButton}}
                        onClick={() => handleIniciarConversa({ id: clienteSelecionado.id, nome: clienteSelecionado.nome, tipo: "cliente" })}
                      >
                        ✉️ Enviar Mensagem
                      </button>
                      <button 
                        style={{...styles.button, ...styles.warningButton}}
                        onClick={handleNovaTarefa}
                      >
                        📋 Nova Tarefa
                      </button>
                    </div>
                  </div>
                  
                  <div style={styles.detailsGrid}>
                    <div style={styles.detailsSection}>
                      <h3 style={styles.sectionTitle}>Informações de Contato</h3>
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Email:</div>
                        <div style={styles.detailValue}>{clienteSelecionado.email}</div>
                      </div>
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Telefone:</div>
                        <div style={styles.detailValue}>{clienteSelecionado.telefone}</div>
                      </div>
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Endereço:</div>
                        <div style={styles.detailValue}>{clienteSelecionado.endereco}</div>
                      </div>
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Responsável:</div>
                        <div style={styles.detailValue}>{clienteSelecionado.responsavel}</div>
                      </div>
                    </div>
                    
                    <div style={styles.detailsSection}>
                      <h3 style={styles.sectionTitle}>Informações Comerciais</h3>
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Status:</div>
                        <div style={styles.detailValue}>
                          <span style={{
                            ...styles.statusBadge,
                            ...(clienteSelecionado.status === "Ativo" ? styles.statusAtivo : styles.statusInativo)
                          }}>
                            {clienteSelecionado.status}
                          </span>
                        </div>
                      </div>
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Valor Contrato:</div>
                        <div style={styles.detailValue}>{formatarMoeda(clienteSelecionado.valorContrato)}</div>
                      </div>
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Último Contato:</div>
                        <div style={styles.detailValue}>{formatarData(clienteSelecionado.dataUltimoContato)}</div>
                      </div>
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Próximo Contato:</div>
                        <div style={styles.detailValue}>
                          {clienteSelecionado.proximoContato ? formatarData(clienteSelecionado.proximoContato) : "Não agendado"}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsSection}>
                    <h3 style={styles.sectionTitle}>Observações</h3>
                    <p style={{ fontSize: "0.875rem", color: "#334155", lineHeight: "1.5" }}>
                      {clienteSelecionado.observacoes || "Nenhuma observação registrada."}
                    </p>
                  </div>
                  
                  <div style={styles.detailsSection}>
                    <h3 style={styles.sectionTitle}>Histórico de Interações</h3>
                    {clienteSelecionado.historico.length === 0 ? (
                      <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                        Nenhuma interação registrada.
                      </p>
                    ) : (
                      clienteSelecionado.historico.map((item, index) => (
                        <div key={index} style={styles.historicoItem}>
                          <div style={styles.historicoHeader}>
                            <div style={styles.historicoTipo}>{item.tipo}</div>
                            <div style={styles.historicoData}>{formatarData(item.data)}</div>
                          </div>
                          <div style={styles.historicoAssunto}>{item.assunto}</div>
                          <div style={styles.historicoResponsavel}>Responsável: {item.responsavel}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                  Tarefas Relacionadas
                </div>
                <div style={styles.sidebarContent}>
                  {tarefas.filter(t => t.cliente.id === clienteSelecionado.id).length === 0 ? (
                    <p style={{ fontSize: "0.875rem", color: "#64748b", textAlign: "center" }}>
                      Nenhuma tarefa para este cliente.
                    </p>
                  ) : (
                    <div style={styles.tarefasList}>
                      {tarefas
                        .filter(t => t.cliente.id === clienteSelecionado.id)
                        .map(tarefa => (
                          <div 
                            key={tarefa.id} 
                            style={{
                              ...styles.tarefaItem,
                              ...(tarefa.prioridade === "Alta" ? styles.tarefaItemAlta : 
                                 tarefa.prioridade === "Média" ? styles.tarefaItemMedia : 
                                 styles.tarefaItemBaixa)
                            }}
                          >
                            <div style={styles.tarefaHeader}>
                              <div style={styles.tarefaTitulo}>{tarefa.titulo}</div>
                              <span style={{
                                ...styles.statusBadge,
                                ...(tarefa.prioridade === "Alta" ? styles.prioridadeAlta : 
                                   tarefa.prioridade === "Média" ? styles.prioridadeMedia : 
                                   styles.prioridadeBaixa)
                              }}>
                                {tarefa.prioridade}
                              </span>
                            </div>
                            <div style={styles.tarefaCliente}>{tarefa.descricao}</div>
                            <div style={styles.tarefaFooter}>
                              <div style={styles.tarefaResponsavel}>Resp: {tarefa.responsavel.nome}</div>
                              <div style={styles.tarefaPrazo}>Prazo: {formatarData(tarefa.prazo)}</div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                  
                  <div style={{ marginTop: "16px", textAlign: "center" }}>
                    <button 
                      style={{...styles.button, ...styles.warningButton}}
                      onClick={handleNovaTarefa}
                    >
                      📋 Nova Tarefa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "tarefas" ? (
            <div style={styles.mainContent}>
              <div style={styles.detailsContainer}>
                <div style={styles.detailsHeader}>
                  <h2 style={styles.detailsTitle}>
                    {clienteSelecionado ? `Tarefas para ${clienteSelecionado.nome}` : "Todas as Tarefas"}
                  </h2>
                  <button 
                    style={{...styles.button, ...styles.warningButton}}
                    onClick={handleNovaTarefa}
                  >
                    📋 Nova Tarefa
                  </button>
                </div>
                
                {filtrarTarefas().length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyStateIcon}>📋</div>
                    <p style={styles.emptyStateText}>
                      Nenhuma tarefa encontrada.
                    </p>
                    <button 
                      style={{...styles.button, ...styles.warningButton}}
                      onClick={handleNovaTarefa}
                    >
                      Criar Nova Tarefa
                    </button>
                  </div>
                ) : (
                  <div style={styles.tarefasList}>
                    {filtrarTarefas().map(tarefa => (
                      <motion.div 
                        key={tarefa.id} 
                        style={{
                          ...styles.tarefaItem,
                          ...(tarefa.prioridade === "Alta" ? styles.tarefaItemAlta : 
                             tarefa.prioridade === "Média" ? styles.tarefaItemMedia : 
                             styles.tarefaItemBaixa)
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div style={styles.tarefaHeader}>
                          <div style={styles.tarefaTitulo}>{tarefa.titulo}</div>
                          <span style={{
                            ...styles.statusBadge,
                            ...(tarefa.prioridade === "Alta" ? styles.prioridadeAlta : 
                               tarefa.prioridade === "Média" ? styles.prioridadeMedia : 
                               styles.prioridadeBaixa)
                          }}>
                            {tarefa.prioridade}
                          </span>
                        </div>
                        <div style={styles.tarefaCliente}>
                          Cliente: <strong>{tarefa.cliente.nome}</strong>
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "#334155", margin: "8px 0" }}>
                          {tarefa.descricao}
                        </div>
                        <div style={styles.tarefaFooter}>
                          <div style={styles.tarefaResponsavel}>Responsável: {tarefa.responsavel.nome}</div>
                          <div style={styles.tarefaPrazo}>Prazo: {formatarData(tarefa.prazo)}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "mensagens" ? (
            <div style={{...styles.contentContainer, ...styles.contentWithSidebar}}>
              <div style={styles.mainContent}>
                {conversaAtual ? (
                  <div style={{ display: "flex", flexDirection: "column", height: "600px" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "600" }}>{conversaAtual.nome}</h3>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {conversaAtual.tipo === "cliente" ? "Cliente" : "Funcionário"}
                        </div>
                      </div>
                      <button 
                        style={{...styles.button, ...styles.outlineButton}}
                        onClick={() => setConversaAtual(null)}
                      >
                        Voltar
                      </button>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                      <div style={styles.mensagensContainer}>
                        {filtrarMensagens().length === 0 ? (
                          <div style={{ textAlign: "center", color: "#64748b", padding: "32px 0" }}>
                            Nenhuma mensagem nesta conversa. Envie uma mensagem para iniciar.
                          </div>
                        ) : (
                          filtrarMensagens().map(mensagem => (
                            <motion.div 
                              key={mensagem.id} 
                              style={{
                                ...styles.mensagemItem,
                                ...(mensagem.remetente.tipo === "funcionario" ? styles.mensagemEnviada : styles.mensagemRecebida)
                              }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div style={styles.mensagemHeader}>
                                <div style={styles.mensagemRemetente}>{mensagem.remetente.nome}</div>
                                <div style={styles.mensagemData}>{formatarDataHora(mensagem.data)}</div>
                              </div>
                              <div style={styles.mensagemAssunto}>{mensagem.assunto}</div>
                              <div style={styles.mensagemConteudo}>{mensagem.conteudo}</div>
                              
                              {mensagem.anexos.length > 0 && (
                                <div style={styles.mensagemAnexos}>
                                  {mensagem.anexos.map((anexo, index) => (
                                    <div key={index} style={styles.anexoItem}>
                                      <div style={styles.anexoIcon}>📎</div>
                                      <div style={styles.anexoNome}>{anexo.nome}</div>
                                      <div style={styles.anexoTamanho}>{anexo.tamanho}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <div style={styles.mensagemInput}>
                      <textarea 
                        style={styles.textarea}
                        placeholder="Digite sua mensagem..."
                        value={novaMensagem.conteudo}
                        onChange={(e) => setNovaMensagem({...novaMensagem, conteudo: e.target.value})}
                      ></textarea>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <button style={{...styles.button, ...styles.outlineButton}}>
                          📎 Anexar Arquivo
                        </button>
                        <button 
                          style={{...styles.button, ...styles.secondaryButton}}
                          onClick={() => {
                            if (!novaMensagem.conteudo.trim()) return;
                            
                            const novaMensagemObj = {
                              id: Date.now().toString(),
                              remetente: { id: "1", nome: "Carlos Mendes", tipo: "funcionario" }, // Usuário logado (simulado)
                              destinatario: { id: conversaAtual.id, nome: conversaAtual.nome, tipo: conversaAtual.tipo },
                              assunto: "RE: Conversa em andamento",
                              conteudo: novaMensagem.conteudo,
                              data: new Date().toISOString(),
                              lida: false,
                              anexos: []
                            };

                            setMensagens([novaMensagemObj, ...mensagens]);
                            setNovaMensagem({...novaMensagem, conteudo: ""});
                          }}
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={styles.detailsContainer}>
                    <div style={styles.detailsHeader}>
                      <h2 style={styles.detailsTitle}>
                        {clienteSelecionado ? `Mensagens para ${clienteSelecionado.nome}` : "Todas as Mensagens"}
                      </h2>
                      <button 
                        style={{...styles.button, ...styles.secondaryButton}}
                        onClick={handleNovaMensagem}
                        disabled={!clienteSelecionado}
                      >
                        ✉️ Nova Mensagem
                      </button>
                    </div>
                    
                    {filtrarMensagens().length === 0 ? (
                      <div style={styles.emptyState}>
                        <div style={styles.emptyStateIcon}>✉️</div>
                        <p style={styles.emptyStateText}>
                          Nenhuma mensagem encontrada.
                        </p>
                        <button 
                          style={{...styles.button, ...styles.secondaryButton}}
                          onClick={handleNovaMensagem}
                          disabled={!clienteSelecionado}
                        >
                          Enviar Nova Mensagem
                        </button>
                      </div>
                    ) : (
                      <div style={styles.tableContainer}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.tableHeader}>Remetente</th>
                              <th style={styles.tableHeader}>Destinatário</th>
                              <th style={styles.tableHeader}>Assunto</th>
                              <th style={styles.tableHeader}>Data</th>
                              <th style={styles.tableHeader}>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtrarMensagens().map(mensagem => (
                              <motion.tr 
                                key={mensagem.id}
                                style={styles.tableRow}
                                whileHover={styles.tableRowHover}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <td style={styles.tableCell}>
                                  <strong>{mensagem.remetente.nome}</strong>
                                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                    {mensagem.remetente.tipo === "cliente" ? "Cliente" : "Funcionário"}
                                  </div>
                                </td>
                                <td style={styles.tableCell}>
                                  <strong>{mensagem.destinatario.nome}</strong>
                                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                    {mensagem.destinatario.tipo === "cliente" ? "Cliente" : "Funcionário"}
                                  </div>
                                </td>
                                <td style={{...styles.tableCell, ...styles.tableCellHighlight}}>
                                  {mensagem.assunto}
                                </td>
                                <td style={styles.tableCell}>{formatarDataHora(mensagem.data)}</td>
                                <td style={styles.tableCell}>
                                  <button 
                                    style={{...styles.button, ...styles.outlineButton}}
                                    onClick={() => {
                                      if (mensagem.remetente.tipo === "cliente") {
                                        handleIniciarConversa({ id: mensagem.remetente.id, nome: mensagem.remetente.nome, tipo: "cliente" });
                                      } else {
                                        handleIniciarConversa({ id: mensagem.destinatario.id, nome: mensagem.destinatario.nome, tipo: "cliente" });
                                      }
                                    }}
                                  >
                                    Ver Conversa
                                  </button>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                  Conversas Recentes
                </div>
                <div style={styles.sidebarContent}>
                  <div style={styles.conversasList}>
                    {clientes.slice(0, 5).map(cliente => (
                      <div 
                        key={cliente.id}
                        style={styles.conversaItem}
                        onClick={() => handleIniciarConversa({ id: cliente.id, nome: cliente.nome, tipo: "cliente" })}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <div style={styles.conversaAvatar}>
                          {cliente.nome.charAt(0)}
                        </div>
                        <div style={styles.conversaInfo}>
                          <div style={styles.conversaNome}>{cliente.nome}</div>
                          <div style={styles.conversaPreview}>
                            {cliente.tipo} • {cliente.segmento}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Área de Funcionários */}
      {activeArea === "funcionarios" && (
        <>
          {/* Estatísticas */}
          <div style={styles.statsContainer}>
            <motion.div 
              style={styles.statCard}
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{...styles.statValue, ...styles.statHighlight}}>{funcionarios.length}</div>
              <div style={styles.statLabel}>Funcionários Ativos</div>
            </motion.div>

            <motion.div 
              style={styles.statCard}
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div style={styles.statValue}>{funcionarios.filter(f => f.status === "Disponível").length}</div>
              <div style={styles.statLabel}>Disponíveis Agora</div>
            </motion.div>

            <motion.div 
              style={styles.statCard}
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div style={styles.statValue}>{clientes.length}</div>
              <div style={styles.statLabel}>Clientes Atendidos</div>
            </motion.div>

            <motion.div 
              style={styles.statCard}
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div style={styles.statValue}>{tarefas.filter(t => t.status === "Pendente").length}</div>
              <div style={styles.statLabel}>Tarefas Pendentes</div>
            </motion.div>
          </div>

          {/* Barra de ações */}
          <div style={styles.actionBar}>
            <div style={styles.searchContainer}>
              <input 
                type="text" 
                placeholder="Buscar funcionário, cargo, email..." 
                style={styles.searchInput}
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
              />
            </div>
            
            <div style={styles.buttonGroup}>
              <button 
                style={{...styles.button, ...styles.warningButton}}
                onClick={handleNovaTarefa}
                disabled={!funcionarioSelecionado}
              >
                📋 Nova Tarefa
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.tabContainer}>
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === "lista" ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab("lista")}
            >
              Equipe
              {activeTab === "lista" && <div style={styles.activeTabIndicator}></div>}
            </button>
            
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === "detalhes" ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab("detalhes")}
              disabled={!funcionarioSelecionado}
            >
              Detalhes do Funcionário
              {activeTab === "detalhes" && <div style={styles.activeTabIndicator}></div>}
            </button>
            
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === "tarefas" ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab("tarefas")}
            >
              Tarefas
              {activeTab === "tarefas" && <div style={styles.activeTabIndicator}></div>}
            </button>
            
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === "mensagens" ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab("mensagens")}
            >
              Mensagens
              {activeTab === "mensagens" && <div style={styles.activeTabIndicator}></div>}
            </button>
          </div>

          {/* Conteúdo */}
          {isLoading ? (
            <div style={styles.loadingState}>
              <div style={styles.loadingSpinner}></div>
              <p>Carregando dados...</p>
            </div>
          ) : activeTab === "lista" ? (
            <div style={styles.mainContent}>
              <div style={styles.tableContainer}>
                {filtrarFuncionarios().length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyStateIcon}>👥</div>
                    <p style={styles.emptyStateText}>
                      Nenhum funcionário encontrado com os filtros selecionados.
                    </p>
                    <button 
                      style={{...styles.button, ...styles.primaryButton}}
                      onClick={() => setFiltroTexto("")}
                    >
                      Limpar Filtros
                    </button>
                  </div>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Funcionário</th>
                        <th style={styles.tableHeader}>Contato</th>
                        <th style={styles.tableHeader}>Cargo</th>
                        <th style={styles.tableHeader}>Departamento</th>
                        <th style={styles.tableHeader}>Clientes Atendidos</th>
                        <th style={styles.tableHeader}>Status</th>
                        <th style={styles.tableHeader}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrarFuncionarios().map(funcionario => (
                        <motion.tr 
                          key={funcionario.id}
                          style={styles.tableRow}
                          whileHover={styles.tableRowHover}
                          onClick={() => handleFuncionarioClick(funcionario)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td style={{...styles.tableCell, ...styles.tableCellHighlight}}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <img 
                                src={funcionario.foto} 
                                alt={funcionario.nome} 
                                style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                              />
                              {funcionario.nome}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            {funcionario.email}
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              {funcionario.telefone}
                            </div>
                          </td>
                          <td style={styles.tableCell}>{funcionario.cargo}</td>
                          <td style={styles.tableCell}>{funcionario.departamento}</td>
                          <td style={styles.tableCell}>{funcionario.clientesAtendidos}</td>
                                                    <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              ...(funcionario.status === "Disponível" ? styles.statusDisponivel : 
                                 funcionario.status === "Em atendimento" ? styles.statusOcupado : 
                                 styles.statusAusente)
                            }}>
                              {funcionario.status}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.buttonGroup}>
                              <button 
                                style={{...styles.button, ...styles.outlineButton}}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleIniciarConversa({ id: funcionario.id, nome: funcionario.nome, tipo: "funcionario" });
                                }}
                              >
                                ✉️ Mensagem
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : activeTab === "detalhes" && funcionarioSelecionado ? (
            <div style={{...styles.contentContainer, ...styles.contentWithSidebar}}>
              <div style={styles.mainContent}>
                <div style={styles.detailsContainer}>
                  <div style={styles.avatarContainer}>
                    <img 
                      src={funcionarioSelecionado.foto} 
                      alt={funcionarioSelecionado.nome} 
                      style={styles.avatar}
                    />
                    <div style={styles.avatarInfo}>
                      <h2 style={styles.avatarName}>{funcionarioSelecionado.nome}</h2>
                      <p style={styles.avatarTitle}>{funcionarioSelecionado.cargo} • {funcionarioSelecionado.departamento}</p>
                      <div style={styles.avatarStatus}>
                        <div style={{
                          ...styles.statusDot,
                          ...(funcionarioSelecionado.status === "Disponível" ? styles.statusDotDisponivel : 
                             funcionarioSelecionado.status === "Em atendimento" ? styles.statusDotOcupado : 
                             styles.statusDotAusente)
                        }}></div>
                        <span style={styles.statusText}>{funcionarioSelecionado.status}</span>
                      </div>
                    </div>
                    <div style={styles.detailsActions}>
                      <button 
                        style={{...styles.button, ...styles.secondaryButton}}
                        onClick={() => handleIniciarConversa({ id: funcionarioSelecionado.id, nome: funcionarioSelecionado.nome, tipo: "funcionario" })}
                      >
                        ✉️ Enviar Mensagem
                      </button>
                      <button 
                        style={{...styles.button, ...styles.warningButton}}
                        onClick={handleNovaTarefa}
                      >
                        📋 Nova Tarefa
                      </button>
                    </div>
                  </div>
                  
                  <div style={styles.detailsGrid}>
                    <div style={styles.detailsSection}>
                      <h3 style={styles.sectionTitle}>Informações de Contato</h3>
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Email:</div>
                        <div style={styles.detailValue}>{funcionarioSelecionado.email}</div>
                      </div>
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Telefone:</div>
                        <div style={styles.detailValue}>{funcionarioSelecionado.telefone}</div>
                      </div>
                    </div>
                    
                    <div style={styles.detailsSection}>
                      <h3 style={styles.sectionTitle}>Informações Profissionais</h3>
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Cargo:</div>
                        <div style={styles.detailValue}>{funcionarioSelecionado.cargo}</div>
                      </div>
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Departamento:</div>
                        <div style={styles.detailValue}>{funcionarioSelecionado.departamento}</div>
                      </div>
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Clientes Atendidos:</div>
                        <div style={styles.detailValue}>{funcionarioSelecionado.clientesAtendidos}</div>
                      </div>
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Última Atividade:</div>
                        <div style={styles.detailValue}>{formatarDataHora(funcionarioSelecionado.ultimaAtividade)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsSection}>
                    <h3 style={styles.sectionTitle}>Clientes Atendidos</h3>
                    <div style={styles.tableContainer}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.tableHeader}>Cliente</th>
                            <th style={styles.tableHeader}>Segmento</th>
                            <th style={styles.tableHeader}>Valor Contrato</th>
                            <th style={styles.tableHeader}>Último Contato</th>
                            <th style={styles.tableHeader}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientes
                            .filter(cliente => cliente.responsavel === funcionarioSelecionado.nome)
                            .map(cliente => (
                              <tr key={cliente.id} style={styles.tableRow}>
                                <td style={{...styles.tableCell, ...styles.tableCellHighlight}}>{cliente.nome}</td>
                                <td style={styles.tableCell}>{cliente.segmento}</td>
                                <td style={styles.tableCell}>{formatarMoeda(cliente.valorContrato)}</td>
                                <td style={styles.tableCell}>{formatarData(cliente.dataUltimoContato)}</td>
                                <td style={styles.tableCell}>
                                  <span style={{
                                    ...styles.statusBadge,
                                    ...(cliente.status === "Ativo" ? styles.statusAtivo : styles.statusInativo)
                                  }}>
                                    {cliente.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                  Tarefas Atribuídas
                </div>
                <div style={styles.sidebarContent}>
                  {tarefas.filter(t => t.responsavel.id === funcionarioSelecionado.id).length === 0 ? (
                    <p style={{ fontSize: "0.875rem", color: "#64748b", textAlign: "center" }}>
                      Nenhuma tarefa atribuída a este funcionário.
                    </p>
                  ) : (
                    <div style={styles.tarefasList}>
                      {tarefas
                        .filter(t => t.responsavel.id === funcionarioSelecionado.id)
                        .map(tarefa => (
                          <div 
                            key={tarefa.id} 
                            style={{
                              ...styles.tarefaItem,
                              ...(tarefa.prioridade === "Alta" ? styles.tarefaItemAlta : 
                                 tarefa.prioridade === "Média" ? styles.tarefaItemMedia : 
                                 styles.tarefaItemBaixa)
                            }}
                          >
                            <div style={styles.tarefaHeader}>
                              <div style={styles.tarefaTitulo}>{tarefa.titulo}</div>
                              <span style={{
                                ...styles.statusBadge,
                                ...(tarefa.prioridade === "Alta" ? styles.prioridadeAlta : 
                                   tarefa.prioridade === "Média" ? styles.prioridadeMedia : 
                                   styles.prioridadeBaixa)
                              }}>
                                {tarefa.prioridade}
                              </span>
                            </div>
                            <div style={styles.tarefaCliente}>Cliente: {tarefa.cliente.nome}</div>
                            <div style={styles.tarefaFooter}>
                              <div style={styles.tarefaResponsavel}>{tarefa.status}</div>
                              <div style={styles.tarefaPrazo}>Prazo: {formatarData(tarefa.prazo)}</div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                  
                  <div style={{ marginTop: "16px", textAlign: "center" }}>
                    <button 
                      style={{...styles.button, ...styles.warningButton}}
                      onClick={handleNovaTarefa}
                    >
                      📋 Nova Tarefa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "tarefas" ? (
            <div style={styles.mainContent}>
              <div style={styles.detailsContainer}>
                <div style={styles.detailsHeader}>
                  <h2 style={styles.detailsTitle}>
                    {funcionarioSelecionado ? `Tarefas de ${funcionarioSelecionado.nome}` : "Todas as Tarefas"}
                  </h2>
                  <button 
                    style={{...styles.button, ...styles.warningButton}}
                    onClick={handleNovaTarefa}
                  >
                    📋 Nova Tarefa
                  </button>
                </div>
                
                {filtrarTarefas().length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyStateIcon}>📋</div>
                    <p style={styles.emptyStateText}>
                      Nenhuma tarefa encontrada.
                    </p>
                    <button 
                      style={{...styles.button, ...styles.warningButton}}
                      onClick={handleNovaTarefa}
                    >
                      Criar Nova Tarefa
                    </button>
                  </div>
                ) : (
                  <div style={styles.tarefasList}>
                    {filtrarTarefas().map(tarefa => (
                      <motion.div 
                        key={tarefa.id} 
                        style={{
                          ...styles.tarefaItem,
                          ...(tarefa.prioridade === "Alta" ? styles.tarefaItemAlta : 
                             tarefa.prioridade === "Média" ? styles.tarefaItemMedia : 
                             styles.tarefaItemBaixa)
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div style={styles.tarefaHeader}>
                          <div style={styles.tarefaTitulo}>{tarefa.titulo}</div>
                          <span style={{
                            ...styles.statusBadge,
                            ...(tarefa.prioridade === "Alta" ? styles.prioridadeAlta : 
                               tarefa.prioridade === "Média" ? styles.prioridadeMedia : 
                               styles.prioridadeBaixa)
                          }}>
                            {tarefa.prioridade}
                          </span>
                        </div>
                        <div style={styles.tarefaCliente}>
                          Cliente: <strong>{tarefa.cliente.nome}</strong>
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "#334155", margin: "8px 0" }}>
                          {tarefa.descricao}
                        </div>
                        <div style={styles.tarefaFooter}>
                          <div style={styles.tarefaResponsavel}>Responsável: {tarefa.responsavel.nome}</div>
                          <div style={styles.tarefaPrazo}>Prazo: {formatarData(tarefa.prazo)}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "mensagens" ? (
            <div style={{...styles.contentContainer, ...styles.contentWithSidebar}}>
              <div style={styles.mainContent}>
                {conversaAtual ? (
                  <div style={{ display: "flex", flexDirection: "column", height: "600px" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "600" }}>{conversaAtual.nome}</h3>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {conversaAtual.tipo === "cliente" ? "Cliente" : "Funcionário"}
                        </div>
                      </div>
                      <button 
                        style={{...styles.button, ...styles.outlineButton}}
                        onClick={() => setConversaAtual(null)}
                      >
                        Voltar
                      </button>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                      <div style={styles.mensagensContainer}>
                        {filtrarMensagens().length === 0 ? (
                          <div style={{ textAlign: "center", color: "#64748b", padding: "32px 0" }}>
                            Nenhuma mensagem nesta conversa. Envie uma mensagem para iniciar.
                          </div>
                        ) : (
                          filtrarMensagens().map(mensagem => (
                            <motion.div 
                              key={mensagem.id} 
                              style={{
                                ...styles.mensagemItem,
                                ...(mensagem.remetente.tipo === "funcionario" ? styles.mensagemEnviada : styles.mensagemRecebida)
                              }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div style={styles.mensagemHeader}>
                                <div style={styles.mensagemRemetente}>{mensagem.remetente.nome}</div>
                                <div style={styles.mensagemData}>{formatarDataHora(mensagem.data)}</div>
                              </div>
                              <div style={styles.mensagemAssunto}>{mensagem.assunto}</div>
                              <div style={styles.mensagemConteudo}>{mensagem.conteudo}</div>
                              
                              {mensagem.anexos.length > 0 && (
                                <div style={styles.mensagemAnexos}>
                                  {mensagem.anexos.map((anexo, index) => (
                                    <div key={index} style={styles.anexoItem}>
                                      <div style={styles.anexoIcon}>📎</div>
                                      <div style={styles.anexoNome}>{anexo.nome}</div>
                                      <div style={styles.anexoTamanho}>{anexo.tamanho}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <div style={styles.mensagemInput}>
                      <textarea 
                        style={styles.textarea}
                        placeholder="Digite sua mensagem..."
                        value={novaMensagem.conteudo}
                        onChange={(e) => setNovaMensagem({...novaMensagem, conteudo: e.target.value})}
                      ></textarea>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <button style={{...styles.button, ...styles.outlineButton}}>
                          📎 Anexar Arquivo
                        </button>
                        <button 
                          style={{...styles.button, ...styles.secondaryButton}}
                          onClick={() => {
                            if (!novaMensagem.conteudo.trim()) return;
                            
                            const novaMensagemObj = {
                              id: Date.now().toString(),
                              remetente: { id: "1", nome: "Carlos Mendes", tipo: "funcionario" }, // Usuário logado (simulado)
                              destinatario: { id: conversaAtual.id, nome: conversaAtual.nome, tipo: conversaAtual.tipo },
                              assunto: "RE: Conversa em andamento",
                              conteudo: novaMensagem.conteudo,
                              data: new Date().toISOString(),
                              lida: false,
                              anexos: []
                            };

                            setMensagens([novaMensagemObj, ...mensagens]);
                            setNovaMensagem({...novaMensagem, conteudo: ""});
                          }}
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={styles.detailsContainer}>
                    <div style={styles.detailsHeader}>
                      <h2 style={styles.detailsTitle}>
                        {funcionarioSelecionado ? `Mensagens de ${funcionarioSelecionado.nome}` : "Todas as Mensagens"}
                      </h2>
                    </div>
                    
                    {filtrarMensagens().length === 0 ? (
                      <div style={styles.emptyState}>
                        <div style={styles.emptyStateIcon}>✉️</div>
                        <p style={styles.emptyStateText}>
                          Nenhuma mensagem encontrada.
                        </p>
                      </div>
                    ) : (
                      <div style={styles.tableContainer}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.tableHeader}>Remetente</th>
                              <th style={styles.tableHeader}>Destinatário</th>
                              <th style={styles.tableHeader}>Assunto</th>
                              <th style={styles.tableHeader}>Data</th>
                              <th style={styles.tableHeader}>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtrarMensagens().map(mensagem => (
                              <motion.tr 
                                key={mensagem.id}
                                style={styles.tableRow}
                                whileHover={styles.tableRowHover}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <td style={styles.tableCell}>
                                  <strong>{mensagem.remetente.nome}</strong>
                                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                    {mensagem.remetente.tipo === "cliente" ? "Cliente" : "Funcionário"}
                                  </div>
                                </td>
                                <td style={styles.tableCell}>
                                  <strong>{mensagem.destinatario.nome}</strong>
                                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                    {mensagem.destinatario.tipo === "cliente" ? "Cliente" : "Funcionário"}
                                  </div>
                                </td>
                                <td style={{...styles.tableCell, ...styles.tableCellHighlight}}>
                                  {mensagem.assunto}
                                </td>
                                <td style={styles.tableCell}>{formatarDataHora(mensagem.data)}</td>
                                <td style={styles.tableCell}>
                                  <button 
                                    style={{...styles.button, ...styles.outlineButton}}
                                    onClick={() => {
                                      if (mensagem.remetente.tipo === "cliente") {
                                        handleIniciarConversa({ id: mensagem.remetente.id, nome: mensagem.remetente.nome, tipo: "cliente" });
                                      } else if (mensagem.destinatario.tipo === "cliente") {
                                        handleIniciarConversa({ id: mensagem.destinatario.id, nome: mensagem.destinatario.nome, tipo: "cliente" });
                                      }
                                    }}
                                  >
                                    Ver Conversa
                                  </button>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                  Equipe
                </div>
                <div style={styles.sidebarContent}>
                  <div style={styles.conversasList}>
                    {funcionarios.map(funcionario => (
                      <div 
                        key={funcionario.id}
                        style={styles.conversaItem}
                        onClick={() => handleIniciarConversa({ id: funcionario.id, nome: funcionario.nome, tipo: "funcionario" })}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <img 
                          src={funcionario.foto} 
                          alt={funcionario.nome} 
                          style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        <div style={styles.conversaInfo}>
                          <div style={styles.conversaNome}>{funcionario.nome}</div>
                          <div style={styles.conversaPreview}>
                            {funcionario.cargo} • 
                            <span style={{ 
                              color: funcionario.status === "Disponível" ? "#16a34a" : 
                                    funcionario.status === "Em atendimento" ? "#d97706" : "#dc2626" 
                            }}>
                              {" "}{funcionario.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Modal de Nova Mensagem */}
      {showNovaMensagemModal && (
        <div style={styles.modal}>
          <motion.div 
            style={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nova Mensagem</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowNovaMensagemModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Para</label>
                <select 
                  style={styles.input}
                  value={novaMensagem.destinatario}
                  onChange={(e) => setNovaMensagem({...novaMensagem, destinatario: e.target.value})}
                  required
                >
                  <option value="">Selecione um destinatário</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nome} (Cliente)</option>
                  ))}
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Assunto</label>
                <input 
                  type="text"
                  style={styles.input}
                  value={novaMensagem.assunto}
                  onChange={(e) => setNovaMensagem({...novaMensagem, assunto: e.target.value})}
                  placeholder="Digite o assunto da mensagem"
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Mensagem</label>
                <textarea 
                  style={{...styles.textarea, minHeight: "150px"}}
                  value={novaMensagem.conteudo}
                  onChange={(e) => setNovaMensagem({...novaMensagem, conteudo: e.target.value})}
                  placeholder="Digite sua mensagem aqui..."
                  required
                ></textarea>
              </div>
              
              <div style={styles.formGroup}>
                <button style={{...styles.button, ...styles.outlineButton, width: "auto"}}>
                  📎 Anexar Arquivo
                </button>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.button, ...styles.outlineButton}}
                onClick={() => setShowNovaMensagemModal(false)}
              >
                Cancelar
              </button>
              <button 
                style={{...styles.button, ...styles.secondaryButton}}
                onClick={handleEnviarMensagem}
              >
                Enviar Mensagem
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Nova Tarefa */}
      {showNovaTarefaModal && (
        <div style={styles.modal}>
          <motion.div 
            style={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nova Tarefa</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowNovaTarefaModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Título da Tarefa</label>
                <input 
                  type="text"
                  style={styles.input}
                  value={novaTarefa.titulo}
                  onChange={(e) => setNovaTarefa({...novaTarefa, titulo: e.target.value})}
                  placeholder="Ex: Ligar para cliente, Enviar proposta..."
                  required
                />
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Cliente</label>
                  <select 
                    style={styles.input}
                    value={novaTarefa.cliente}
                    onChange={(e) => setNovaTarefa({...novaTarefa, cliente: e.target.value})}
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Responsável</label>
                  <select 
                    style={styles.input}
                    value={novaTarefa.responsavel}
                    onChange={(e) => setNovaTarefa({...novaTarefa, responsavel: e.target.value})}
                    required
                  >
                    <option value="">Selecione um responsável</option>
                    {funcionarios.map(funcionario => (
                      <option key={funcionario.id} value={funcionario.id}>{funcionario.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Prazo</label>
                  <input 
                    type="date"
                    style={styles.input}
                    value={novaTarefa.prazo}
                    onChange={(e) => setNovaTarefa({...novaTarefa, prazo: e.target.value})}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Prioridade</label>
                  <select 
                    style={styles.input}
                    value={novaTarefa.prioridade}
                    onChange={(e) => setNovaTarefa({...novaTarefa, prioridade: e.target.value})}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Descrição</label>
                <textarea 
                  style={styles.textarea}
                  value={novaTarefa.descricao}
                  onChange={(e) => setNovaTarefa({...novaTarefa, descricao: e.target.value})}
                  placeholder="Descreva os detalhes da tarefa..."
                ></textarea>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
                           <button 
                style={{...styles.button, ...styles.outlineButton}}
                onClick={() => setShowNovaTarefaModal(false)}
              >
                Cancelar
              </button>
              <button 
                style={{...styles.button, ...styles.warningButton}}
                onClick={handleSalvarTarefa}
              >
                Salvar Tarefa
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Novo Cliente */}
      {showNovoClienteModal && (
        <div style={styles.modal}>
          <motion.div 
            style={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Novo Cliente</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowNovoClienteModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome/Razão Social *</label>
                <input 
                  type="text"
                  style={styles.input}
                  value={novoCliente.nome}
                  onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                  placeholder="Nome completo ou razão social"
                  required
                />
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tipo</label>
                  <select 
                    style={styles.input}
                    value={novoCliente.tipo}
                    onChange={(e) => setNovoCliente({...novoCliente, tipo: e.target.value})}
                  >
                    <option value="Empresa">Empresa</option>
                    <option value="Pessoa Física">Pessoa Física</option>
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Segmento</label>
                  <input 
                    type="text"
                    style={styles.input}
                    value={novoCliente.segmento}
                    onChange={(e) => setNovoCliente({...novoCliente, segmento: e.target.value})}
                    placeholder="Ex: Tecnologia, Saúde, Varejo..."
                  />
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email *</label>
                  <input 
                    type="email"
                    style={styles.input}
                    value={novoCliente.email}
                    onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Telefone</label>
                  <input 
                    type="text"
                    style={styles.input}
                    value={novoCliente.telefone}
                    onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Endereço</label>
                <input 
                  type="text"
                  style={styles.input}
                  value={novoCliente.endereco}
                  onChange={(e) => setNovoCliente({...novoCliente, endereco: e.target.value})}
                  placeholder="Endereço completo"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Responsável pelo Atendimento</label>
                <select 
                  style={styles.input}
                  value={novoCliente.responsavel}
                  onChange={(e) => setNovoCliente({...novoCliente, responsavel: e.target.value})}
                >
                  <option value="">Selecione um responsável</option>
                  {funcionarios.map(funcionario => (
                    <option key={funcionario.id} value={funcionario.nome}>{funcionario.nome}</option>
                  ))}
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Observações</label>
                <textarea 
                  style={styles.textarea}
                  value={novoCliente.observacoes}
                  onChange={(e) => setNovoCliente({...novoCliente, observacoes: e.target.value})}
                  placeholder="Informações adicionais sobre o cliente..."
                ></textarea>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.button, ...styles.outlineButton}}
                onClick={() => setShowNovoClienteModal(false)}
              >
                Cancelar
              </button>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={handleSalvarCliente}
              >
                Cadastrar Cliente
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Estilo global para animações */}
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
