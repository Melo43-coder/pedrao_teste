import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

// Registrar componentes do Chart.js
Chart.register(...registerables);

// Dados mock para demonstração
const MOCK_METRICAS_NEGOCIO = {
  faturamento: [
    { mes: "Jan", valor: 45000 },
    { mes: "Fev", valor: 48000 },
    { mes: "Mar", valor: 52000 },
    { mes: "Abr", valor: 49000 },
    { mes: "Mai", valor: 53000 },
    { mes: "Jun", valor: 58000 },
    { mes: "Jul", valor: 62000 },
    { mes: "Ago", valor: 65000 },
    { mes: "Set", valor: 68000 },
    { mes: "Out", valor: 71000 },
    { mes: "Nov", valor: 75000 },
    { mes: "Dez", valor: 80000 }
  ],
  clientesNovos: [
    { mes: "Jan", valor: 12 },
    { mes: "Fev", valor: 15 },
    { mes: "Mar", valor: 18 },
    { mes: "Abr", valor: 14 },
    { mes: "Mai", valor: 16 },
    { mes: "Jun", valor: 20 },
    { mes: "Jul", valor: 22 },
    { mes: "Ago", valor: 25 },
    { mes: "Set", valor: 28 },
    { mes: "Out", valor: 24 },
    { mes: "Nov", valor: 26 },
    { mes: "Dez", valor: 30 }
  ],
  custos: [
    { mes: "Jan", valor: 32000 },
    { mes: "Fev", valor: 33000 },
    { mes: "Mar", valor: 35000 },
    { mes: "Abr", valor: 34000 },
    { mes: "Mai", valor: 36000 },
    { mes: "Jun", valor: 38000 },
    { mes: "Jul", valor: 40000 },
    { mes: "Ago", valor: 41000 },
    { mes: "Set", valor: 42000 },
    { mes: "Out", valor: 43000 },
    { mes: "Nov", valor: 45000 },
    { mes: "Dez", valor: 47000 }
  ],
  satisfacaoClientes: [
    { mes: "Jan", valor: 8.2 },
    { mes: "Fev", valor: 8.3 },
    { mes: "Mar", valor: 8.4 },
    { mes: "Abr", valor: 8.1 },
    { mes: "Mai", valor: 8.5 },
    { mes: "Jun", valor: 8.6 },
    { mes: "Jul", valor: 8.7 },
    { mes: "Ago", valor: 8.8 },
    { mes: "Set", valor: 8.9 },
    { mes: "Out", valor: 8.7 },
    { mes: "Nov", valor: 8.8 },
    { mes: "Dez", valor: 9.0 }
  ],
  taxaConversao: [
    { mes: "Jan", valor: 22 },
    { mes: "Fev", valor: 24 },
    { mes: "Mar", valor: 25 },
    { mes: "Abr", valor: 23 },
    { mes: "Mai", valor: 26 },
    { mes: "Jun", valor: 28 },
    { mes: "Jul", valor: 29 },
    { mes: "Ago", valor: 30 },
    { mes: "Set", valor: 32 },
    { mes: "Out", valor: 31 },
    { mes: "Nov", valor: 33 },
    { mes: "Dez", valor: 35 }
  ],
  tempoMedioAtendimento: [
    { mes: "Jan", valor: 45 },
    { mes: "Fev", valor: 43 },
    { mes: "Mar", valor: 42 },
    { mes: "Abr", valor: 44 },
    { mes: "Mai", valor: 40 },
    { mes: "Jun", valor: 38 },
    { mes: "Jul", valor: 36 },
    { mes: "Ago", valor: 35 },
    { mes: "Set", valor: 34 },
    { mes: "Out", valor: 33 },
    { mes: "Nov", valor: 32 },
    { mes: "Dez", valor: 30 }
  ]
};

const MOCK_FUNCIONARIOS = [
  {
    id: "1",
    nome: "Carlos Mendes",
    cargo: "Técnico de Campo",
    departamento: "Suporte",
    eficiencia: 92,
    servicosConcluidos: 128,
    tempoMedioServico: 35,
    avaliacao: 4.8,
    status: "Disponível",
    especialidades: ["Redes", "Servidores", "Suporte Técnico"],
    ultimoServico: {
      id: "S-1245",
      cliente: "Empresa ABC",
      tipo: "Manutenção Preventiva",
      concluido: "2025-04-15T14:30:00"
    }
  },
  {
    id: "2",
    nome: "Ana Oliveira",
    cargo: "Técnica de Suporte",
    departamento: "Suporte",
    eficiencia: 88,
    servicosConcluidos: 112,
    tempoMedioServico: 40,
    avaliacao: 4.7,
    status: "Em Serviço",
    especialidades: ["Software", "Treinamento", "Atendimento ao Cliente"],
    ultimoServico: {
      id: "S-1244",
      cliente: "Consultório Médico Saúde",
      tipo: "Instalação de Software",
      concluido: "2025-04-15T13:15:00"
    }
  },
  {
    id: "3",
    nome: "Rafael Santos",
    cargo: "Técnico de Redes",
    departamento: "Infraestrutura",
    eficiencia: 95,
    servicosConcluidos: 145,
    tempoMedioServico: 32,
    avaliacao: 4.9,
    status: "Em Serviço",
    especialidades: ["Redes", "Segurança", "Infraestrutura"],
    ultimoServico: {
      id: "S-1243",
      cliente: "Escritório Jurídico Leis & Associados",
      tipo: "Configuração de Firewall",
      concluido: "2025-04-15T10:45:00"
    }
  },
  {
    id: "4",
    nome: "Juliana Costa",
    cargo: "Técnica de Campo",
    departamento: "Suporte",
    eficiencia: 90,
    servicosConcluidos: 118,
    tempoMedioServico: 38,
    avaliacao: 4.6,
    status: "Disponível",
    especialidades: ["Hardware", "Manutenção", "Instalação"],
    ultimoServico: {
      id: "S-1242",
      cliente: "Supermercados Estrela",
      tipo: "Manutenção de Equipamentos",
      concluido: "2025-04-15T09:20:00"
    }
  }
];

const MOCK_SERVICOS_PENDENTES = [
  {
    id: "S-1246",
    cliente: {
      id: "C-001",
      nome: "Clínica Saúde Total",
      endereco: "Rua Sete de Setembro, 300, São Paulo - SP",
      telefone: "(11) 2345-6789",
      contato: "Dr. Paulo Silveira"
    },
    tipo: "Manutenção Preventiva",
    descricao: "Realizar manutenção preventiva em todos os computadores e servidores da clínica.",
    prioridade: "Alta",
    dataAgendamento: "2025-04-16T09:00:00",
    tempoEstimado: 180,
    requisitos: ["Ferramentas de diagnóstico", "Peças de reposição básicas"],
    especialidadesNecessarias: ["Hardware", "Servidores", "Redes"],
    historico: [
      {
        data: "2025-04-10T14:30:00",
        descricao: "Cliente solicitou agendamento com urgência"
      }
    ]
  },
  {
    id: "S-1247",
    cliente: {
      id: "C-002",
      nome: "Escritório Contábil Números",
      endereco: "Av. Paulista, 1500, São Paulo - SP",
      telefone: "(11) 3456-7890",
      contato: "Maria Oliveira"
    },
    tipo: "Instalação de Software",
    descricao: "Instalar e configurar novo sistema de gestão contábil em 10 estações de trabalho.",
    prioridade: "Média",
    dataAgendamento: "2025-04-16T13:00:00",
    tempoEstimado: 240,
    requisitos: ["Mídia de instalação", "Licenças", "Acesso admin"],
    especialidadesNecessarias: ["Software", "Treinamento"],
    historico: [
      {
        data: "2025-04-12T10:15:00",
        descricao: "Confirmação das licenças disponíveis"
      }
    ]
  },
  {
    id: "S-1248",
    cliente: {
      id: "C-003",
      nome: "Restaurante Sabor & Arte",
      endereco: "Rua Augusta, 800, São Paulo - SP",
      telefone: "(11) 4567-8901",
      contato: "Carlos Mendonça"
    },
    tipo: "Suporte Emergencial",
    descricao: "Sistema de PDV apresentando falhas. Necessário diagnóstico e correção imediata.",
    prioridade: "Crítica",
    dataAgendamento: "2025-04-16T08:00:00",
    tempoEstimado: 120,
    requisitos: ["Ferramentas de diagnóstico", "Acesso remoto"],
    especialidadesNecessarias: ["Software", "Hardware", "PDV"],
    historico: [
      {
        data: "2025-04-15T18:30:00",
        descricao: "Cliente relatou que sistema parou completamente"
      }
    ]
  },
  {
    id: "S-1249",
    cliente: {
      id: "C-004",
      nome: "Academia Corpo em Forma",
      endereco: "Av. Rebouças, 500, São Paulo - SP",
      telefone: "(11) 5678-9012",
      contato: "Fernando Almeida"
    },
    tipo: "Instalação de Equipamentos",
    descricao: "Instalar novo sistema de controle de acesso com catracas eletrônicas e biometria.",
    prioridade: "Média",
    dataAgendamento: "2025-04-17T09:00:00",
    tempoEstimado: 300,
    requisitos: ["Equipamentos", "Ferramentas específicas", "Teste de carga"],
    especialidadesNecessarias: ["Hardware", "Instalação", "Controle de Acesso"],
    historico: [
      {
        data: "2025-04-13T11:45:00",
        descricao: "Visita técnica para avaliação do local"
      }
    ]
  },
  {
    id: "S-1250",
    cliente: {
      id: "C-005",
      nome: "Escola Futuro Brilhante",
      endereco: "Rua dos Pinheiros, 300, São Paulo - SP",
      telefone: "(11) 6789-0123",
      contato: "Profa. Luciana Martins"
    },
    tipo: "Treinamento",
    descricao: "Realizar treinamento para equipe de professores sobre uso da nova plataforma educacional.",
    prioridade: "Baixa",
    dataAgendamento: "2025-04-17T14:00:00",
    tempoEstimado: 240,
    requisitos: ["Material didático", "Projetor", "Acesso à plataforma"],
    especialidadesNecessarias: ["Treinamento", "Software Educacional"],
    historico: [
      {
        data: "2025-04-14T09:30:00",
        descricao: "Confirmação da lista de participantes"
      }
    ]
  }
];

const MOCK_INSIGHTS = [
  {
    id: "1",
    tipo: "Tendência",
    titulo: "Aumento de demanda em serviços de segurança",
    descricao: "Nosso sistema detectou um aumento de 27% nas solicitações de serviços relacionados à segurança digital nos últimos 3 meses. Considere ampliar a equipe especializada nesta área.",
    impacto: "Alto",
    acaoRecomendada: "Investir em treinamento de segurança para a equipe técnica e considerar a contratação de especialistas adicionais.",
    metricas: {
      crescimento: 27,
      tendencia: "Ascendente",
      confiabilidade: 92
    }
  },
  {
    id: "2",
    tipo: "Otimização",
    titulo: "Redução do tempo médio de atendimento",
    descricao: "Identificamos que os técnicos que utilizam o novo sistema de diagnóstico reduzem em média 15 minutos o tempo de atendimento por chamado.",
    impacto: "Médio",
    acaoRecomendada: "Padronizar o uso do sistema de diagnóstico para toda a equipe técnica e realizar treinamento específico.",
    metricas: {
      reducaoTempo: 15,
      tendencia: "Positiva",
      confiabilidade: 88
    }
  },
  {
    id: "3",
    tipo: "Alerta",
    titulo: "Queda na satisfação de clientes corporativos",
    descricao: "Detectamos uma redução de 0.5 pontos na avaliação média de satisfação dos clientes corporativos nos últimos 45 dias.",
    impacto: "Alto",
    acaoRecomendada: "Realizar pesquisa detalhada com clientes corporativos para identificar pontos de melhoria e implementar plano de ação imediato.",
    metricas: {
      queda: 0.5,
      tendencia: "Preocupante",
      confiabilidade: 95
    }
  },
  {
    id: "4",
    tipo: "Oportunidade",
    titulo: "Potencial de expansão para setor educacional",
    descricao: "Análise de mercado indica crescimento de 32% na demanda por serviços de TI no setor educacional, com poucos concorrentes especializados.",
    impacto: "Alto",
    acaoRecomendada: "Desenvolver pacote de serviços específico para instituições educacionais e iniciar campanha de marketing direcionada.",
    metricas: {
      crescimentoMercado: 32,
      concorrencia: "Baixa",
      confiabilidade: 87
    }
  },
  {
    id: "5",
    tipo: "Eficiência",
    titulo: "Otimização de rotas para técnicos de campo",
    descricao: "Nosso algoritmo de otimização de rotas pode reduzir em 22% o tempo de deslocamento dos técnicos de campo.",
    impacto: "Médio",
    acaoRecomendada: "Implementar sistema de roteirização inteligente e integrar com aplicativo móvel dos técnicos.",
    metricas: {
      reducaoDeslocamento: 22,
      economiaEstimada: "R$ 3.500/mês",
      confiabilidade: 90
    }
  }
];

const MOCK_PREVISOES = [
  {
    periodo: "Próximo Trimestre",
    faturamento: {
      valor: 245000,
      crescimento: 8.5,
      confiabilidade: 92
    },
    clientesNovos: {
      valor: 85,
      crescimento: 12.3,
      confiabilidade: 88
    },
    custos: {
      valor: 142000,
      crescimento: 5.2,
      confiabilidade: 94
    },
    margemLucro: {
      valor: 42.1,
      crescimento: 3.2,
      confiabilidade: 90
    }
  },
  {
    periodo: "Próximo Semestre",
    faturamento: {
      valor: 520000,
      crescimento: 12.8,
      confiabilidade: 85
    },
    clientesNovos: {
      valor: 175,
      crescimento: 15.6,
      confiabilidade: 82
    },
    custos: {
      valor: 298000,
      crescimento: 7.8,
      confiabilidade: 88
    },
    margemLucro: {
      valor: 42.7,
      crescimento: 4.1,
      confiabilidade: 84
    }
  },
  {
    periodo: "Próximo Ano",
    faturamento: {
      valor: 1120000,
      crescimento: 16.4,
      confiabilidade: 78
    },
    clientesNovos: {
      valor: 380,
      crescimento: 18.2,
      confiabilidade: 75
    },
    custos: {
      valor: 630000,
      crescimento: 10.5,
      confiabilidade: 80
    },
    margemLucro: {
      valor: 43.8,
      crescimento: 5.3,
      confiabilidade: 76
    }
  }
];

const MOCK_REGRAS_AUTOMACAO = [
  {
    id: "1",
    nome: "Atribuição automática de serviços",
    descricao: "Atribui automaticamente novos serviços ao técnico mais adequado com base em especialidade, localização e carga de trabalho",
    status: "Ativo",
    criterios: [
      "Especialidade do técnico",
      "Proximidade geográfica",
      "Carga atual de trabalho",
      "Histórico com o cliente"
    ],
    prioridade: 1,
    ultimaExecucao: "2025-04-15T08:15:22"
  },
  {
    id: "2",
    nome: "Notificação de conclusão de serviço",
    descricao: "Envia notificação ao cliente quando um serviço é concluído e solicita avaliação de satisfação",
    status: "Ativo",
    criterios: [
      "Serviço marcado como concluído",
      "Cliente com email ou número de telefone cadastrado"
    ],
    prioridade: 2,
    ultimaExecucao: "2025-04-15T14:32:18"
  },
  {
    id: "3",
    nome: "Alerta de SLA em risco",
    descricao: "Notifica gerentes quando um serviço está próximo de ultrapassar o tempo acordado em contrato",
    status: "Ativo",
    criterios: [
      "Tempo decorrido > 80% do tempo acordado",
      "Serviço não concluído",
      "Prioridade média ou alta"
    ],
    prioridade: 1,
    ultimaExecucao: "2025-04-15T13:45:10"
  },
  {
    id: "4",
    nome: "Reagendamento automático",
    descricao: "Sugere novos horários quando um serviço precisa ser reagendado",
    status: "Ativo",
    criterios: [
      "Serviço cancelado ou não realizado",
      "Disponibilidade na agenda",
      "Prioridade do cliente"
    ],
    prioridade: 3,
    ultimaExecucao: "2025-04-15T11:20:45"
  },
  {
    id: "5",
    nome: "Preparação de kit de serviço",
    descricao: "Gera lista de equipamentos e ferramentas necessárias para cada tipo de serviço",
    status: "Ativo",
    criterios: [
      "Tipo de serviço",
      "Histórico do cliente",
      "Equipamentos registrados"
    ],
    prioridade: 4,
    ultimaExecucao: "2025-04-15T07:30:12"
  }
];

// Componente principal
export default function AutomacaoIA() {
  // Estados
  const [metricas, setMetricas] = useState({});
  const [funcionarios, setFuncionarios] = useState([]);
  const [servicosPendentes, setServicosPendentes] = useState([]);
  const [insights, setInsights] = useState([]);
  const [previsoes, setPrevisoes] = useState([]);
  const [regrasAutomacao, setRegrasAutomacao] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [showNovaRegraModal, setShowNovaRegraModal] = useState(false);
  const [novaRegra, setNovaRegra] = useState({
    nome: "",
    descricao: "",
    criterios: [],
    prioridade: 3
  });
  const [showAtribuirServicoModal, setShowAtribuirServicoModal] = useState(false);
  const [atribuicaoManual, setAtribuicaoManual] = useState({
    servicoId: "",
    funcionarioId: "",
    observacao: ""
  });
  const [showConfirmacaoModal, setShowConfirmacaoModal] = useState(false);
  const [confirmacaoMensagem, setConfirmacaoMensagem] = useState("");
  const [confirmacaoCallback, setConfirmacaoCallback] = useState(null);
  const [servicoConcluido, setServicoConcluido] = useState(null);
  const [showServicoConcluidoModal, setShowServicoConcluidoModal] = useState(false);

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulando chamada de API
        setTimeout(() => {
          setMetricas(MOCK_METRICAS_NEGOCIO);
          setFuncionarios(MOCK_FUNCIONARIOS);
          setServicosPendentes(MOCK_SERVICOS_PENDENTES);
          setInsights(MOCK_INSIGHTS);
          setPrevisoes(MOCK_PREVISOES);
          setRegrasAutomacao(MOCK_REGRAS_AUTOMACAO);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Simular conclusão de serviço e atribuição automática
  const simularConclusaoServico = (funcionarioId, servicoId) => {
    // Encontrar o funcionário e atualizar seu status
    const funcionarioAtualizado = funcionarios.find(f => f.id === funcionarioId);
    if (!funcionarioAtualizado) return;
    
    // Encontrar o serviço concluído
    const servicoConcluido = servicosPendentes.find(s => s.id === servicoId);
    if (!servicoConcluido) return;
    
    // Atualizar status do funcionário
    const novosFuncionarios = funcionarios.map(f => {
      if (f.id === funcionarioId) {
        return {
          ...f,
          status: "Disponível",
          servicosConcluidos: f.servicosConcluidos + 1,
          ultimoServico: {
            id: servicoId,
            cliente: servicoConcluido.cliente.nome,
            tipo: servicoConcluido.tipo,
            concluido: new Date().toISOString()
          }
        };
      }
      return f;
    });
    
    // Remover serviço concluído da lista de pendentes
    const novosServicosPendentes = servicosPendentes.filter(s => s.id !== servicoId);
    
    // Encontrar próximo serviço adequado para o funcionário
    const proximoServico = encontrarProximoServico(funcionarioAtualizado, novosServicosPendentes);
    
    // Mostrar modal de conclusão e próximo serviço
    setServicoConcluido({
      servicoAnterior: servicoConcluido,
      funcionario: funcionarioAtualizado,
      proximoServico: proximoServico
    });
    
    setShowServicoConcluidoModal(true);
    
    // Atualizar estados
    setFuncionarios(novosFuncionarios);
    setServicosPendentes(novosServicosPendentes);
  };

  // Algoritmo para encontrar o próximo serviço mais adequado
  const encontrarProximoServico = (funcionario, servicos) => {
    if (!funcionario || !servicos || servicos.length === 0) return null;
    
    // Sistema de pontuação para cada serviço
    const servicosPontuados = servicos.map(servico => {
      let pontuacao = 0;
      
      // Pontuação por especialidade (maior peso)
      const especialidadesMatch = servico.especialidadesNecessarias.filter(
        esp => funcionario.especialidades.includes(esp)
      ).length;
      
      pontuacao += (especialidadesMatch / servico.especialidadesNecessarias.length) * 50;
      
      // Pontuação por prioridade
      if (servico.prioridade === "Crítica") pontuacao += 30;
      else if (servico.prioridade === "Alta") pontuacao += 20;
      else if (servico.prioridade === "Média") pontuacao += 10;
      
      // Pontuação por data de agendamento (mais próximo = melhor)
      const dataAgendamento = new Date(servico.dataAgendamento);
      const agora = new Date();
      const diferencaDias = Math.max(0, (dataAgendamento - agora) / (1000 * 60 * 60 * 24));
      pontuacao += Math.max(0, 20 - diferencaDias * 2); // Máximo de 20 pontos, diminui 2 por dia
      
      return {
        servico,
        pontuacao
      };
    });
    
    // Ordenar por pontuação e retornar o melhor
    servicosPontuados.sort((a, b) => b.pontuacao - a.pontuacao);
    return servicosPontuados[0]?.servico || null;
  };

  // Atribuir serviço a um funcionário
  const atribuirServico = (servicoId, funcionarioId, manual = false) => {
    const servico = servicosPendentes.find(s => s.id === servicoId);
    const funcionario = funcionarios.find(f => f.id === funcionarioId);
    
    if (!servico || !funcionario) return;
    
    // Atualizar status do funcionário
    const novosFuncionarios = funcionarios.map(f => {
      if (f.id === funcionarioId) {
        return {
          ...f,
          status: "Em Serviço"
        };
      }
      return f;
    });
    
    // Adicionar histórico ao serviço
    const novosServicosPendentes = servicosPendentes.map(s => {
      if (s.id === servicoId) {
        return {
          ...s,
          historico: [
            ...s.historico,
            {
              data: new Date().toISOString(),
              descricao: manual 
                ? `Serviço atribuído manualmente a ${funcionario.nome}`
                : `Serviço atribuído automaticamente a ${funcionario.nome} pelo sistema`
            }
          ]
        };
      }
      return s;
    });
    
    setFuncionarios(novosFuncionarios);
    setServicosPendentes(novosServicosPendentes);
    
    if (manual) {
      setShowAtribuirServicoModal(false);
      setAtribuicaoManual({
        servicoId: "",
        funcionarioId: "",
        observacao: ""
      });
    }
    
    // Mostrar confirmação
    setConfirmacaoMensagem(`Serviço ${servico.id} atribuído com sucesso a ${funcionario.nome}`);
    setShowConfirmacaoModal(true);
  };

  // Adicionar nova regra de automação
  const adicionarRegra = () => {
    if (!novaRegra.nome || !novaRegra.descricao || novaRegra.criterios.length === 0) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
        const novaRegraObj = {
      id: Date.now().toString(),
      nome: novaRegra.nome,
      descricao: novaRegra.descricao,
      status: "Ativo",
      criterios: novaRegra.criterios,
      prioridade: novaRegra.prioridade,
      ultimaExecucao: new Date().toISOString()
    };
    
    setRegrasAutomacao([...regrasAutomacao, novaRegraObj]);
    setShowNovaRegraModal(false);
    setNovaRegra({
      nome: "",
      descricao: "",
      criterios: [],
      prioridade: 3
    });
    
    // Mostrar confirmação
    setConfirmacaoMensagem(`Nova regra de automação "${novaRegra.nome}" criada com sucesso!`);
    setShowConfirmacaoModal(true);
  };

  // Aceitar próximo serviço sugerido
  const aceitarProximoServico = () => {
    if (!servicoConcluido || !servicoConcluido.proximoServico) return;
    
    // Atribuir o próximo serviço ao funcionário
    atribuirServico(servicoConcluido.proximoServico.id, servicoConcluido.funcionario.id);
    
    // Fechar modal
    setShowServicoConcluidoModal(false);
    setServicoConcluido(null);
  };

  // Rejeitar próximo serviço sugerido
  const rejeitarProximoServico = () => {
    setShowServicoConcluidoModal(false);
    setServicoConcluido(null);
  };

  // Formatadores
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (dataString) => {
    const data = new Date(dataString);
    return `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatarDuracao = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins}min` : `${mins}min`;
  };

  // Dados para gráficos
  const dadosGraficoFaturamento = {
    labels: metricas.faturamento?.map(item => item.mes) || [],
    datasets: [
      {
        label: 'Faturamento Mensal',
        data: metricas.faturamento?.map(item => item.valor) || [],
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const dadosGraficoClientes = {
    labels: metricas.clientesNovos?.map(item => item.mes) || [],
    datasets: [
      {
        label: 'Novos Clientes',
        data: metricas.clientesNovos?.map(item => item.valor) || [],
        backgroundColor: '#8b5cf6',
        borderRadius: 6,
        borderWidth: 0
      }
    ]
  };

  const dadosGraficoLucratividade = {
    labels: metricas.faturamento?.map(item => item.mes) || [],
    datasets: [
      {
        label: 'Faturamento',
        data: metricas.faturamento?.map(item => item.valor) || [],
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
        stack: 'Stack 0'
      },
      {
        label: 'Custos',
        data: metricas.custos?.map(item => item.valor) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        stack: 'Stack 0'
      }
    ]
  };

  const dadosGraficoSatisfacao = {
    labels: ['Muito Satisfeito', 'Satisfeito', 'Neutro', 'Insatisfeito', 'Muito Insatisfeito'],
    datasets: [
      {
        data: [65, 25, 7, 2, 1],
        backgroundColor: [
          '#10b981',
          '#34d399',
          '#fbbf24',
          '#f87171',
          '#ef4444'
        ],
        borderWidth: 0
      }
    ]
  };

  const opcoesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    }
  };

  // Estilos
  const styles = {
    container: {
      padding: "24px",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    header: {
      marginBottom: "24px"
    },
    pageTitle: {
      fontSize: "1.875rem",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 8px 0"
    },
    pageSubtitle: {
      fontSize: "1rem",
      color: "#64748b",
      margin: 0
    },
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "16px",
      marginBottom: "24px"
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
      color: "#0ea5e9"
    },
    statWarning: {
      color: "#f59e0b"
    },
    statDanger: {
      color: "#ef4444"
    },
    statSuccess: {
      color: "#10b981"
    },
    tabContainer: {
      marginBottom: "24px",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      gap: "24px"
    },
    tab: {
      padding: "12px 4px",
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#64748b",
      cursor: "pointer",
      position: "relative",
      border: "none",
      backgroundColor: "transparent"
    },
    activeTab: {
      color: "#0ea5e9"
    },
    activeTabIndicator: {
      position: "absolute",
      bottom: "-1px",
      left: 0,
      width: "100%",
      height: "2px",
      backgroundColor: "#0ea5e9"
    },
    contentContainer: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "24px"
    },
    contentWithSidebar: {
      gridTemplateColumns: "2fr 1fr"
    },
    card: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      overflow: "hidden"
    },
    cardHeader: {
      padding: "16px 20px",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    cardTitle: {
      fontSize: "1.125rem",
      fontWeight: "600",
      color: "#0f172a",
      margin: 0
    },
    cardContent: {
      padding: "20px"
    },
    gridContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "24px"
    },
    chartContainer: {
      height: "300px",
      position: "relative"
    },
    insightsList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    },
    insightCard: {
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      padding: "16px",
      borderLeft: "4px solid #0ea5e9"
    },
    insightTendencia: {
      borderLeftColor: "#0ea5e9"
    },
    insightOtimizacao: {
      borderLeftColor: "#10b981"
    },
    insightAlerta: {
      borderLeftColor: "#ef4444"
    },
    insightOportunidade: {
      borderLeftColor: "#8b5cf6"
    },
    insightEficiencia: {
      borderLeftColor: "#f59e0b"
    },
    insightHeader: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px"
    },
    insightTipo: {
      fontSize: "0.75rem",
      fontWeight: "600",
      padding: "2px 8px",
      borderRadius: "9999px",
      backgroundColor: "#e0f2fe",
      color: "#0ea5e9"
    },
    insightTipoTendencia: {
      backgroundColor: "#e0f2fe",
      color: "#0ea5e9"
    },
    insightTipoOtimizacao: {
      backgroundColor: "#dcfce7",
      color: "#10b981"
    },
    insightTipoAlerta: {
      backgroundColor: "#fee2e2",
      color: "#ef4444"
    },
    insightTipoOportunidade: {
      backgroundColor: "#f3e8ff",
      color: "#8b5cf6"
    },
    insightTipoEficiencia: {
      backgroundColor: "#fef3c7",
      color: "#f59e0b"
    },
    insightImpacto: {
      fontSize: "0.75rem",
      fontWeight: "600",
      color: "#64748b"
    },
    insightTitulo: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "8px"
    },
    insightDescricao: {
      fontSize: "0.875rem",
      color: "#334155",
      marginBottom: "12px"
    },
    insightAcao: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "8px"
    },
    insightMetricas: {
      display: "flex",
      gap: "16px",
      marginTop: "12px"
    },
    insightMetrica: {
      flex: 1,
      textAlign: "center"
    },
    insightMetricaValor: {
      fontSize: "1.125rem",
      fontWeight: "600",
      color: "#0f172a"
    },
    insightMetricaLabel: {
      fontSize: "0.75rem",
      color: "#64748b"
    },
    previsaoCard: {
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "16px"
    },
    previsaoHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px"
    },
    previsaoPeriodo: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#0f172a"
    },
    previsaoConfiabilidade: {
      fontSize: "0.75rem",
      fontWeight: "600",
      padding: "2px 8px",
      borderRadius: "9999px",
      backgroundColor: "#e0f2fe",
      color: "#0ea5e9"
    },
    previsaoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "16px"
    },
    previsaoItem: {
      textAlign: "center"
    },
    previsaoValor: {
      fontSize: "1.25rem",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "4px"
    },
    previsaoLabel: {
      fontSize: "0.75rem",
      color: "#64748b"
    },
    previsaoCrescimento: {
      fontSize: "0.875rem",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
      marginTop: "4px"
    },
    previsaoCrescimentoPositivo: {
      color: "#10b981"
    },
    previsaoCrescimentoNegativo: {
      color: "#ef4444"
    },
    funcionariosList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    },
    funcionarioCard: {
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      padding: "16px",
      display: "flex",
      gap: "16px",
      alignItems: "center"
    },
    funcionarioAvatar: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      backgroundColor: "#e0f2fe",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.5rem",
      fontWeight: "600",
      color: "#0ea5e9"
    },
    funcionarioInfo: {
      flex: 1
    },
    funcionarioNome: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "4px"
    },
    funcionarioCargo: {
      fontSize: "0.875rem",
      color: "#64748b",
      marginBottom: "8px"
    },
    funcionarioMetricas: {
      display: "flex",
      gap: "16px"
    },
    funcionarioMetrica: {
      flex: 1
    },
    funcionarioMetricaValor: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#0f172a"
    },
    funcionarioMetricaLabel: {
      fontSize: "0.75rem",
      color: "#64748b"
    },
    funcionarioStatus: {
      fontSize: "0.75rem",
      fontWeight: "600",
      padding: "4px 8px",
      borderRadius: "9999px",
      marginBottom: "8px",
      display: "inline-block"
    },
    funcionarioDisponivel: {
      backgroundColor: "#dcfce7",
      color: "#10b981"
    },
    funcionarioOcupado: {
      backgroundColor: "#fef3c7",
      color: "#f59e0b"
    },
    funcionarioAcoes: {
      display: "flex",
      gap: "8px"
    },
    servicosList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    },
    servicoCard: {
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      padding: "16px",
      borderLeft: "4px solid #0ea5e9"
    },
    servicoCritico: {
      borderLeftColor: "#ef4444"
    },
    servicoAlto: {
      borderLeftColor: "#f59e0b"
    },
    servicoMedio: {
      borderLeftColor: "#0ea5e9"
    },
    servicoBaixo: {
      borderLeftColor: "#10b981"
    },
    servicoHeader: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px"
    },
    servicoId: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#64748b"
    },
    servicoPrioridade: {
      fontSize: "0.75rem",
      fontWeight: "600",
      padding: "2px 8px",
      borderRadius: "9999px"
    },
    servicoPrioridadeCritica: {
      backgroundColor: "#fee2e2",
      color: "#ef4444"
    },
    servicoPrioridadeAlta: {
      backgroundColor: "#fef3c7",
      color: "#f59e0b"
    },
    servicoPrioridadeMedia: {
      backgroundColor: "#e0f2fe",
      color: "#0ea5e9"
    },
    servicoPrioridadeBaixa: {
      backgroundColor: "#dcfce7",
      color: "#10b981"
    },
    servicoTitulo: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "8px"
    },
    servicoCliente: {
      fontSize: "0.875rem",
      color: "#64748b",
      marginBottom: "12px"
    },
    servicoInfo: {
      display: "flex",
      gap: "16px",
      marginBottom: "12px"
    },
    servicoInfoItem: {
      flex: 1
    },
    servicoInfoLabel: {
      fontSize: "0.75rem",
      color: "#64748b"
    },
    servicoInfoValor: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#0f172a"
    },
    servicoAcoes: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "8px",
      marginTop: "12px"
    },
    regrasList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    },
    regraCard: {
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      padding: "16px"
    },
    regraHeader: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px"
    },
    regraNome: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#0f172a"
    },
    regraStatus: {
      fontSize: "0.75rem",
      fontWeight: "600",
      padding: "2px 8px",
      borderRadius: "9999px"
    },
    regraAtiva: {
      backgroundColor: "#dcfce7",
      color: "#10b981"
    },
    regraInativa: {
      backgroundColor: "#fee2e2",
      color: "#ef4444"
    },
    regraDescricao: {
      fontSize: "0.875rem",
      color: "#334155",
      marginBottom: "12px"
    },
    regraCriterios: {
      marginBottom: "12px"
    },
    regraCriteriosTitulo: {
      fontSize: "0.75rem",
      fontWeight: "600",
      color: "#64748b",
      marginBottom: "4px"
    },
    regraCriteriosList: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px"
    },
    regraCriterio: {
      fontSize: "0.75rem",
      padding: "2px 8px",
      borderRadius: "9999px",
      backgroundColor: "#e0f2fe",
      color: "#0ea5e9"
    },
    regraFooter: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "0.75rem",
      color: "#64748b"
    },
    regraAcoes: {
      display: "flex",
      gap: "8px"
    },
    button: {
      padding: "8px 16px",
      borderRadius: "8px",
      border: "none",
      fontSize: "0.875rem",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    primaryButton: {
      backgroundColor: "#0ea5e9",
      color: "white"
    },
    secondaryButton: {
      backgroundColor: "#8b5cf6",
      color: "white"
    },
    successButton: {
      backgroundColor: "#10b981",
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
    iconButton: {
      width: "32px",
      height: "32px",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      border: "1px solid #e2e8f0",
      color: "#64748b",
      cursor: "pointer"
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
      borderTop: "3px solid #0ea5e9",
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
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    },
    modalHeader: {
      padding: "20px",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    modalTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#0f172a",
      margin: 0
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
      padding: "20px"
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
      fontSize: "0.875rem"
    },
    textarea: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      fontSize: "0.875rem",
      minHeight: "80px",
      resize: "vertical"
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
      gap: "16px"
    },
    checkboxGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginBottom: "16px"
    },
    checkboxItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    checkbox: {
      width: "16px",
      height: "16px"
    },
    checkboxLabel: {
      fontSize: "0.875rem",
      color: "#334155"
    },
    alertBox: {
      padding: "16px",
      borderRadius: "8px",
      marginBottom: "16px",
      backgroundColor: "#f8fafc",
      borderLeft: "4px solid #0ea5e9"
    },
    alertBoxInfo: {
      backgroundColor: "#e0f2fe",
      borderLeftColor: "#0ea5e9"
    },
    alertBoxSuccess: {
      backgroundColor: "#dcfce7",
      borderLeftColor: "#10b981"
    },
    alertBoxWarning: {
      backgroundColor: "#fef3c7",
      borderLeftColor: "#f59e0b"
    },
    alertBoxDanger: {
      backgroundColor: "#fee2e2",
      borderLeftColor: "#ef4444"
    },
    alertTitle: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "8px"
    },
    alertContent: {
      fontSize: "0.875rem",
      color: "#334155"
    },
    servicoConcluidoContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "24px"
    },
    servicoConcluidoHeader: {
      textAlign: "center",
      marginBottom: "16px"
    },
    servicoConcluidoTitulo: {
      fontSize: "1.25rem",
      fontWeight: "700",
      color: "#10b981",
      marginBottom: "8px"
    },
    servicoConcluidoSubtitulo: {
      fontSize: "0.875rem",
      color: "#64748b"
    },
    servicoConcluidoInfo: {
      backgroundColor: "#f1f5f9",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "24px"
    },
    servicoConcluidoLabel: {
      fontSize: "0.75rem",
      fontWeight: "600",
      color: "#64748b",
      marginBottom: "4px"
    },
    servicoConcluidoValor: {
      fontSize: "0.875rem",
      color: "#0f172a"
    },
    servicoConcluidoSeparador: {
      height: "1px",
      backgroundColor: "#e2e8f0",
      margin: "16px 0"
    },
    servicoProximoContainer: {
      backgroundColor: "#f0f9ff",
      borderRadius: "12px",
      padding: "16px",
      borderLeft: "4px solid #0ea5e9"
    },
    servicoProximoHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px"
    },
    servicoProximoTitulo: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#0ea5e9"
    },
    servicoProximoMatch: {
      fontSize: "0.75rem",
      fontWeight: "600",
      padding: "4px 8px",
      borderRadius: "9999px",
      backgroundColor: "#dcfce7",
      color: "#10b981"
    },
    servicoProximoAcoes: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "16px"
    }
  };

  // Componente
  return (
    <div style={styles.container}>
      {/* Cabeçalho */}
      <header style={styles.header}>
        <h1 style={styles.pageTitle}>Sistema de Automação Inteligente</h1>
        <p style={styles.pageSubtitle}>Previsões, insights e automação para otimizar seu negócio</p>
      </header>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "dashboard" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
          {activeTab === "dashboard" && <div style={styles.activeTabIndicator}></div>}
        </button>
        
        <button 
                    style={{
            ...styles.tab,
            ...(activeTab === "insights" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("insights")}
        >
          Insights e Previsões
          {activeTab === "insights" && <div style={styles.activeTabIndicator}></div>}
        </button>
        
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "fluxo" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("fluxo")}
        >
          Fluxo de Trabalho
          {activeTab === "fluxo" && <div style={styles.activeTabIndicator}></div>}
        </button>
        
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "automacao" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("automacao")}
        >
          Regras de Automação
          {activeTab === "automacao" && <div style={styles.activeTabIndicator}></div>}
        </button>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div style={styles.loadingState}>
          <div style={styles.loadingSpinner}></div>
          <p>Carregando sistema de automação inteligente...</p>
        </div>
      ) : activeTab === "dashboard" ? (
        <>
          {/* Cards de estatísticas */}
          <div style={styles.statsContainer}>
            <motion.div 
              style={styles.statCard}
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{...styles.statValue, ...styles.statHighlight}}>
                {formatarMoeda(metricas.faturamento?.[metricas.faturamento.length - 1]?.valor || 0)}
              </div>
              <div style={styles.statLabel}>Faturamento Mensal</div>
            </motion.div>

            <motion.div 
              style={styles.statCard}
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div style={{...styles.statValue, ...styles.statSuccess}}>
                {metricas.clientesNovos?.[metricas.clientesNovos.length - 1]?.valor || 0}
              </div>
              <div style={styles.statLabel}>Novos Clientes</div>
            </motion.div>

            <motion.div 
              style={styles.statCard}
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div style={{...styles.statValue, ...styles.statWarning}}>
                {metricas.taxaConversao?.[metricas.taxaConversao.length - 1]?.valor || 0}%
              </div>
              <div style={styles.statLabel}>Taxa de Conversão</div>
            </motion.div>

            <motion.div 
              style={styles.statCard}
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div style={{...styles.statValue, ...styles.statSuccess}}>
                {metricas.satisfacaoClientes?.[metricas.satisfacaoClientes.length - 1]?.valor || 0}/10
              </div>
              <div style={styles.statLabel}>Satisfação do Cliente</div>
            </motion.div>
          </div>

          {/* Gráficos */}
          <div style={styles.gridContainer}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Faturamento Mensal</h3>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.chartContainer}>
                  <Line data={dadosGraficoFaturamento} options={opcoesGrafico} />
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Novos Clientes</h3>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.chartContainer}>
                  <Bar data={dadosGraficoClientes} options={opcoesGrafico} />
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Faturamento vs Custos</h3>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.chartContainer}>
                  <Bar data={dadosGraficoLucratividade} options={opcoesGrafico} />
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Satisfação do Cliente</h3>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.chartContainer}>
                  <Pie data={dadosGraficoSatisfacao} options={opcoesGrafico} />
                </div>
              </div>
            </div>
          </div>

          {/* Insights em destaque */}
          <div style={{...styles.card, marginTop: "24px"}}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Insights em Destaque</h3>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={() => setActiveTab("insights")}
              >
                Ver Todos
              </button>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.insightsList}>
                {insights.slice(0, 3).map(insight => (
                  <motion.div 
                    key={insight.id}
                    style={{
                      ...styles.insightCard,
                      ...(insight.tipo === "Tendência" ? styles.insightTendencia :
                         insight.tipo === "Otimização" ? styles.insightOtimizacao :
                         insight.tipo === "Alerta" ? styles.insightAlerta :
                         insight.tipo === "Oportunidade" ? styles.insightOportunidade :
                         styles.insightEficiencia)
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={styles.insightHeader}>
                      <span style={{
                        ...styles.insightTipo,
                        ...(insight.tipo === "Tendência" ? styles.insightTipoTendencia :
                           insight.tipo === "Otimização" ? styles.insightTipoOtimizacao :
                           insight.tipo === "Alerta" ? styles.insightTipoAlerta :
                           insight.tipo === "Oportunidade" ? styles.insightTipoOportunidade :
                           styles.insightTipoEficiencia)
                      }}>
                        {insight.tipo}
                      </span>
                      <span style={styles.insightImpacto}>
                        Impacto: {insight.impacto}
                      </span>
                    </div>
                    <h4 style={styles.insightTitulo}>{insight.titulo}</h4>
                    <p style={styles.insightDescricao}>{insight.descricao}</p>
                    <div style={styles.insightAcao}>Ação Recomendada:</div>
                    <p style={styles.insightDescricao}>{insight.acaoRecomendada}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : activeTab === "insights" ? (
        <div style={styles.contentContainer}>
          {/* Insights */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Insights de Negócio</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.insightsList}>
                {insights.map(insight => (
                  <motion.div 
                    key={insight.id}
                    style={{
                      ...styles.insightCard,
                      ...(insight.tipo === "Tendência" ? styles.insightTendencia :
                         insight.tipo === "Otimização" ? styles.insightOtimizacao :
                         insight.tipo === "Alerta" ? styles.insightAlerta :
                         insight.tipo === "Oportunidade" ? styles.insightOportunidade :
                         styles.insightEficiencia)
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={styles.insightHeader}>
                      <span style={{
                        ...styles.insightTipo,
                        ...(insight.tipo === "Tendência" ? styles.insightTipoTendencia :
                           insight.tipo === "Otimização" ? styles.insightTipoOtimizacao :
                           insight.tipo === "Alerta" ? styles.insightTipoAlerta :
                           insight.tipo === "Oportunidade" ? styles.insightTipoOportunidade :
                           styles.insightTipoEficiencia)
                      }}>
                        {insight.tipo}
                      </span>
                      <span style={styles.insightImpacto}>
                        Impacto: {insight.impacto}
                      </span>
                    </div>
                    <h4 style={styles.insightTitulo}>{insight.titulo}</h4>
                    <p style={styles.insightDescricao}>{insight.descricao}</p>
                    <div style={styles.insightAcao}>Ação Recomendada:</div>
                    <p style={styles.insightDescricao}>{insight.acaoRecomendada}</p>
                    <div style={styles.insightMetricas}>
                      {Object.entries(insight.metricas).map(([chave, valor], index) => (
                        <div key={index} style={styles.insightMetrica}>
                          <div style={styles.insightMetricaValor}>
                            {typeof valor === "number" && valor > 0 ? "+" : ""}
                            {typeof valor === "number" ? 
                              (chave.includes("crescimento") || chave.includes("reducao") ? `${valor}%` : valor) : 
                              valor}
                          </div>
                          <div style={styles.insightMetricaLabel}>
                            {chave.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Previsões */}
          <div style={{...styles.card, marginTop: "24px"}}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Previsões de Negócio</h3>
            </div>
            <div style={styles.cardContent}>
              {previsoes.map((previsao, index) => (
                <motion.div 
                  key={index}
                  style={styles.previsaoCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div style={styles.previsaoHeader}>
                    <div style={styles.previsaoPeriodo}>{previsao.periodo}</div>
                    <div style={styles.previsaoConfiabilidade}>
                      Confiabilidade: {previsao.faturamento.confiabilidade}%
                    </div>
                  </div>
                  <div style={styles.previsaoGrid}>
                    <div style={styles.previsaoItem}>
                      <div style={styles.previsaoValor}>
                        {formatarMoeda(previsao.faturamento.valor)}
                      </div>
                      <div style={styles.previsaoLabel}>Faturamento</div>
                      <div style={{
                        ...styles.previsaoCrescimento,
                        ...(previsao.faturamento.crescimento >= 0 ? 
                            styles.previsaoCrescimentoPositivo : 
                            styles.previsaoCrescimentoNegativo)
                      }}>
                        {previsao.faturamento.crescimento >= 0 ? "↑" : "↓"} 
                        {Math.abs(previsao.faturamento.crescimento)}%
                      </div>
                    </div>
                    <div style={styles.previsaoItem}>
                      <div style={styles.previsaoValor}>
                        {previsao.clientesNovos.valor}
                      </div>
                      <div style={styles.previsaoLabel}>Novos Clientes</div>
                      <div style={{
                        ...styles.previsaoCrescimento,
                        ...(previsao.clientesNovos.crescimento >= 0 ? 
                            styles.previsaoCrescimentoPositivo : 
                            styles.previsaoCrescimentoNegativo)
                      }}>
                        {previsao.clientesNovos.crescimento >= 0 ? "↑" : "↓"} 
                        {Math.abs(previsao.clientesNovos.crescimento)}%
                      </div>
                    </div>
                    <div style={styles.previsaoItem}>
                      <div style={styles.previsaoValor}>
                        {formatarMoeda(previsao.custos.valor)}
                      </div>
                      <div style={styles.previsaoLabel}>Custos</div>
                      <div style={{
                        ...styles.previsaoCrescimento,
                        ...(previsao.custos.crescimento <= 0 ? 
                            styles.previsaoCrescimentoPositivo : 
                            styles.previsaoCrescimentoNegativo)
                      }}>
                        {previsao.custos.crescimento >= 0 ? "↑" : "↓"} 
                        {Math.abs(previsao.custos.crescimento)}%
                      </div>
                    </div>
                    <div style={styles.previsaoItem}>
                      <div style={styles.previsaoValor}>
                        {previsao.margemLucro.valor}%
                      </div>
                      <div style={styles.previsaoLabel}>Margem de Lucro</div>
                      <div style={{
                        ...styles.previsaoCrescimento,
                        ...(previsao.margemLucro.crescimento >= 0 ? 
                            styles.previsaoCrescimentoPositivo : 
                            styles.previsaoCrescimentoNegativo)
                      }}>
                        {previsao.margemLucro.crescimento >= 0 ? "↑" : "↓"} 
                        {Math.abs(previsao.margemLucro.crescimento)}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === "fluxo" ? (
        <div style={{...styles.contentContainer, ...styles.contentWithSidebar}}>
          <div>
            {/* Serviços Pendentes */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Serviços Pendentes</h3>
                <button 
                  style={{...styles.button, ...styles.primaryButton}}
                  onClick={() => setShowAtribuirServicoModal(true)}
                >
                  Atribuir Serviço
                </button>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.servicosList}>
                  {servicosPendentes.map(servico => (
                    <motion.div 
                      key={servico.id}
                      style={{
                        ...styles.servicoCard,
                        ...(servico.prioridade === "Crítica" ? styles.servicoCritico :
                           servico.prioridade === "Alta" ? styles.servicoAlto :
                           servico.prioridade === "Média" ? styles.servicoMedio :
                           styles.servicoBaixo)
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => setServicoSelecionado(servico)}
                    >
                      <div style={styles.servicoHeader}>
                        <div style={styles.servicoId}>{servico.id}</div>
                        <span style={{
                          ...styles.servicoPrioridade,
                          ...(servico.prioridade === "Crítica" ? styles.servicoPrioridadeCritica :
                             servico.prioridade === "Alta" ? styles.servicoPrioridadeAlta :
                             servico.prioridade === "Média" ? styles.servicoPrioridadeMedia :
                             styles.servicoPrioridadeBaixa)
                        }}>
                          {servico.prioridade}
                        </span>
                      </div>
                      <h4 style={styles.servicoTitulo}>{servico.tipo}</h4>
                      <div style={styles.servicoCliente}>
                        Cliente: {servico.cliente.nome}
                      </div>
                      <div style={styles.servicoInfo}>
                        <div style={styles.servicoInfoItem}>
                          <div style={styles.servicoInfoLabel}>Data</div>
                          <div style={styles.servicoInfoValor}>
                            {formatarData(servico.dataAgendamento)}
                          </div>
                        </div>
                        <div style={styles.servicoInfoItem}>
                          <div style={styles.servicoInfoLabel}>Horário</div>
                          <div style={styles.servicoInfoValor}>
                            {new Date(servico.dataAgendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div style={styles.servicoInfoItem}>
                          <div style={styles.servicoInfoLabel}>Duração Est.</div>
                          <div style={styles.servicoInfoValor}>
                            {formatarDuracao(servico.tempoEstimado)}
                          </div>
                        </div>
                      </div>
                      <div style={styles.servicoAcoes}>
                        <button 
                          style={{...styles.button, ...styles.outlineButton}}
                          onClick={(e) => {
                            e.stopPropagation();
                            setServicoSelecionado(servico);
                            setAtribuicaoManual({
                              servicoId: servico.id,
                              funcionarioId: "",
                              observacao: ""
                            });
                            setShowAtribuirServicoModal(true);
                          }}
                        >
                          Atribuir
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Funcionários */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Equipe Técnica</h3>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.funcionariosList}>
                  {funcionarios.map(funcionario => (
                    <motion.div 
                      key={funcionario.id}
                      style={styles.funcionarioCard}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => setFuncionarioSelecionado(funcionario)}
                    >
                      <div style={styles.funcionarioAvatar}>
                        {funcionario.nome.charAt(0)}
                      </div>
                      <div style={styles.funcionarioInfo}>
                        <div style={styles.funcionarioNome}>{funcionario.nome}</div>
                        <div style={styles.funcionarioCargo}>{funcionario.cargo}</div>
                        <span style={{
                          ...styles.funcionarioStatus,
                          ...(funcionario.status === "Disponível" ? styles.funcionarioDisponivel : styles.funcionarioOcupado)
                        }}>
                          {funcionario.status}
                        </span>
                        <div style={styles.funcionarioMetricas}>
                          <div style={styles.funcionarioMetrica}>
                            <div style={styles.funcionarioMetricaValor}>{funcionario.servicosConcluidos}</div>
                            <div style={styles.funcionarioMetricaLabel}>Serviços</div>
                          </div>
                          <div style={styles.funcionarioMetrica}>
                            <div style={styles.funcionarioMetricaValor}>{funcionario.eficiencia}%</div>
                            <div style={styles.funcionarioMetricaLabel}>Eficiência</div>
                          </div>
                          <div style={styles.funcionarioMetrica}>
                            <div style={styles.funcionarioMetricaValor}>{funcionario.avaliacao}</div>
                            <div style={styles.funcionarioMetricaLabel}>Avaliação</div>
                          </div>
                        </div>
                      </div>
                      {funcionario.status === "Em Serviço" && (
                        <div style={styles.funcionarioAcoes}>
                          <button 
                            style={{...styles.button, ...styles.successButton}}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Simular conclusão de serviço
                              simularConclusaoServico(funcionario.id, funcionario.ultimoServico.id);
                            }}
                          >
                            Concluir Serviço
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "automacao" ? (
        <div style={styles.contentContainer}>
          {/* Regras de Automação */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Regras de Automação</h3>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={() => setShowNovaRegraModal(true)}
              >
                Nova Regra
              </button>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.regrasList}>
                {regrasAutomacao.map(regra => (
                  <motion.div 
                    key={regra.id}
                    style={styles.regraCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={styles.regraHeader}>
                      <div style={styles.regraNome}>{regra.nome}</div>
                      <span style={{
                        ...styles.regraStatus,
                        ...(regra.status === "Ativo" ? styles.regraAtiva : styles.regraInativa)
                      }}>
                        {regra.status}
                      </span>
                    </div>
                    <p style={styles.regraDescricao}>{regra.descricao}</p>
                    <div style={styles.regraCriterios}>
                      <div style={styles.regraCriteriosTitulo}>Critérios:</div>
                      <div style={styles.regraCriteriosList}>
                        {regra.criterios.map((criterio, index) => (
                          <span key={index} style={styles.regraCriterio}>{criterio}</span>
                        ))}
                      </div>
                    </div>
                    <div style={styles.regraFooter}>
                      <div>
                        Prioridade: {regra.prioridade} • Última execução: {formatarDataHora(regra.ultimaExecucao)}
                      </div>
                      <div style={styles.regraAcoes}>
                        <button style={styles.iconButton} title="Editar">
                          ✏️
                        </button>
                        <button 
                          style={styles.iconButton} 
                          title={regra.status === "Ativo" ? "Desativar" : "Ativar"}
                        >
                          {regra.status === "Ativo" ? "🔴" : "🟢"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal de Nova Regra */}
      {showNovaRegraModal && (
        <div style={styles.modal}>
          <motion.div 
            style={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nova Regra de Automação</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowNovaRegraModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome da Regra *</label>
                <input 
                  type="text"
                  style={styles.input}
                  value={novaRegra.nome}
                  onChange={(e) => setNovaRegra({...novaRegra, nome: e.target.value})}
                  placeholder="Ex: Atribuição automática por especialidade"
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Descrição *</label>
                <textarea 
                  style={styles.textarea}
                  value={novaRegra.descricao}
                  onChange={(e) => setNovaRegra({...novaRegra, descricao: e.target.value})}
                  placeholder="Descreva o que esta regra de automação faz..."
                  required
                ></textarea>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Critérios *</label>
                <div style={styles.checkboxGroup}>
                  <div style={styles.checkboxItem}>
                    <input 
                      type="checkbox" 
                      id="criterio-especialidade" 
                      style={styles.checkbox}
                      checked={novaRegra.criterios.includes("Especialidade do técnico")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNovaRegra({...novaRegra, criterios: [...novaRegra.criterios, "Especialidade do técnico"]});
                        } else {
                          setNovaRegra({...novaRegra, criterios: novaRegra.criterios.filter(c => c !== "Especialidade do técnico")});
                        }
                      }}
                    />
                    <label style={styles.checkboxLabel} htmlFor="criterio-especialidade">
                      Especialidade do técnico
                    </label>
                  </div>
                  <div style={styles.checkboxItem}>
                    <input 
                      type="checkbox" 
                      id="criterio-proximidade" 
                      style={styles.checkbox}
                      checked={novaRegra.criterios.includes("Proximidade geográfica")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNovaRegra({...novaRegra, criterios: [...novaRegra.criterios, "Proximidade geográfica"]});
                        } else {
                          setNovaRegra({...novaRegra, criterios: novaRegra.criterios.filter(c => c !== "Proximidade geográfica")});
                        }
                      }}
                    />
                    <label style={styles.checkboxLabel} htmlFor="criterio-proximidade">
                      Proximidade geográfica
                    </label>
                  </div>
                                        <div style={styles.checkboxItem}>
                    <input 
                      type="checkbox" 
                      id="criterio-carga" 
                      style={styles.checkbox}
                      checked={novaRegra.criterios.includes("Carga atual de trabalho")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNovaRegra({...novaRegra, criterios: [...novaRegra.criterios, "Carga atual de trabalho"]});
                        } else {
                          setNovaRegra({...novaRegra, criterios: novaRegra.criterios.filter(c => c !== "Carga atual de trabalho")});
                        }
                      }}
                    />
                    <label style={styles.checkboxLabel} htmlFor="criterio-carga">
                      Carga atual de trabalho
                    </label>
                  </div>
                  <div style={styles.checkboxItem}>
                    <input 
                      type="checkbox" 
                      id="criterio-historico" 
                      style={styles.checkbox}
                      checked={novaRegra.criterios.includes("Histórico com o cliente")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNovaRegra({...novaRegra, criterios: [...novaRegra.criterios, "Histórico com o cliente"]});
                        } else {
                          setNovaRegra({...novaRegra, criterios: novaRegra.criterios.filter(c => c !== "Histórico com o cliente")});
                        }
                      }}
                    />
                    <label style={styles.checkboxLabel} htmlFor="criterio-historico">
                      Histórico com o cliente
                    </label>
                  </div>
                  <div style={styles.checkboxItem}>
                    <input 
                      type="checkbox" 
                      id="criterio-prioridade" 
                      style={styles.checkbox}
                      checked={novaRegra.criterios.includes("Prioridade do serviço")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNovaRegra({...novaRegra, criterios: [...novaRegra.criterios, "Prioridade do serviço"]});
                        } else {
                          setNovaRegra({...novaRegra, criterios: novaRegra.criterios.filter(c => c !== "Prioridade do serviço")});
                        }
                      }}
                    />
                    <label style={styles.checkboxLabel} htmlFor="criterio-prioridade">
                      Prioridade do serviço
                    </label>
                  </div>
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Prioridade da Regra</label>
                <select 
                  style={styles.input}
                  value={novaRegra.prioridade}
                  onChange={(e) => setNovaRegra({...novaRegra, prioridade: parseInt(e.target.value)})}
                >
                  <option value="1">1 - Máxima</option>
                  <option value="2">2 - Alta</option>
                  <option value="3">3 - Média</option>
                  <option value="4">4 - Baixa</option>
                  <option value="5">5 - Mínima</option>
                </select>
              </div>
              
              <div style={{...styles.alertBox, ...styles.alertBoxInfo}}>
                <div style={styles.alertTitle}>Como funcionam as regras de automação?</div>
                <div style={styles.alertContent}>
                  As regras são executadas em ordem de prioridade. Regras com prioridade mais alta (número menor) 
                  são executadas primeiro. Os critérios selecionados determinam como a automação tomará decisões.
                </div>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.button, ...styles.outlineButton}}
                onClick={() => setShowNovaRegraModal(false)}
              >
                Cancelar
              </button>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={adicionarRegra}
              >
                Criar Regra
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Atribuir Serviço */}
      {showAtribuirServicoModal && (
        <div style={styles.modal}>
          <motion.div 
            style={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Atribuir Serviço</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowAtribuirServicoModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Serviço</label>
                <select 
                  style={styles.input}
                  value={atribuicaoManual.servicoId}
                  onChange={(e) => setAtribuicaoManual({...atribuicaoManual, servicoId: e.target.value})}
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {servicosPendentes.map(servico => (
                    <option key={servico.id} value={servico.id}>
                      {servico.id} - {servico.tipo} - {servico.cliente.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Técnico</label>
                <select 
                  style={styles.input}
                  value={atribuicaoManual.funcionarioId}
                  onChange={(e) => setAtribuicaoManual({...atribuicaoManual, funcionarioId: e.target.value})}
                  required
                >
                  <option value="">Selecione um técnico</option>
                  {funcionarios
                    .filter(f => f.status === "Disponível")
                    .map(funcionario => (
                      <option key={funcionario.id} value={funcionario.id}>
                        {funcionario.nome} - {funcionario.cargo}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Observação</label>
                <textarea 
                  style={styles.textarea}
                  value={atribuicaoManual.observacao}
                  onChange={(e) => setAtribuicaoManual({...atribuicaoManual, observacao: e.target.value})}
                  placeholder="Observações sobre esta atribuição..."
                ></textarea>
              </div>
              
              {funcionarios.filter(f => f.status === "Disponível").length === 0 && (
                <div style={{...styles.alertBox, ...styles.alertBoxWarning}}>
                  <div style={styles.alertTitle}>Atenção!</div>
                  <div style={styles.alertContent}>
                    Não há técnicos disponíveis no momento. Considere concluir serviços em andamento ou 
                    aguardar a disponibilidade da equipe.
                  </div>
                </div>
              )}
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.button, ...styles.outlineButton}}
                onClick={() => setShowAtribuirServicoModal(false)}
              >
                Cancelar
              </button>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={() => atribuirServico(atribuicaoManual.servicoId, atribuicaoManual.funcionarioId, true)}
                disabled={!atribuicaoManual.servicoId || !atribuicaoManual.funcionarioId || funcionarios.filter(f => f.status === "Disponível").length === 0}
              >
                Atribuir Serviço
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmacaoModal && (
        <div style={styles.modal}>
          <motion.div 
            style={{...styles.modalContent, maxWidth: "400px"}}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Confirmação</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowConfirmacaoModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={{...styles.alertBox, ...styles.alertBoxSuccess}}>
                <div style={styles.alertContent}>
                  {confirmacaoMensagem}
                </div>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={() => {
                  setShowConfirmacaoModal(false);
                  if (confirmacaoCallback) confirmacaoCallback();
                }}
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Serviço Concluído */}
      {showServicoConcluidoModal && servicoConcluido && (
        <div style={styles.modal}>
          <motion.div 
            style={{...styles.modalContent, maxWidth: "500px"}}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Serviço Concluído</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowServicoConcluidoModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.servicoConcluidoContainer}>
                <div style={styles.servicoConcluidoHeader}>
                  <div style={styles.servicoConcluidoTitulo}>
                    ✅ Serviço Concluído com Sucesso!
                  </div>
                  <div style={styles.servicoConcluidoSubtitulo}>
                    O serviço foi marcado como concluído e o cliente será notificado.
                  </div>
                </div>
                
                <div style={styles.servicoConcluidoInfo}>
                  <div style={styles.servicoConcluidoLabel}>Serviço</div>
                  <div style={styles.servicoConcluidoValor}>
                    {servicoConcluido.servicoAnterior.id} - {servicoConcluido.servicoAnterior.tipo}
                  </div>
                  
                  <div style={styles.servicoConcluidoSeparador}></div>
                  
                  <div style={styles.servicoConcluidoLabel}>Cliente</div>
                  <div style={styles.servicoConcluidoValor}>
                    {servicoConcluido.servicoAnterior.cliente.nome}
                  </div>
                  
                  <div style={styles.servicoConcluidoSeparador}></div>
                  
                  <div style={styles.servicoConcluidoLabel}>Técnico</div>
                  <div style={styles.servicoConcluidoValor}>
                    {servicoConcluido.funcionario.nome}
                  </div>
                  
                  <div style={styles.servicoConcluidoSeparador}></div>
                  
                  <div style={styles.servicoConcluidoLabel}>Concluído em</div>
                  <div style={styles.servicoConcluidoValor}>
                    {formatarDataHora(new Date().toISOString())}
                  </div>
                </div>
                
                {servicoConcluido.proximoServico ? (
                  <div style={styles.servicoProximoContainer}>
                    <div style={styles.servicoProximoHeader}>
                      <div style={styles.servicoProximoTitulo}>
                        Próximo Serviço Sugerido
                      </div>
                      <div style={styles.servicoProximoMatch}>
                        Compatibilidade 92%
                      </div>
                    </div>
                    
                    <div style={styles.servicoConcluidoLabel}>Serviço</div>
                    <div style={styles.servicoConcluidoValor}>
                      {servicoConcluido.proximoServico.id} - {servicoConcluido.proximoServico.tipo}
                    </div>
                    
                    <div style={styles.servicoConcluidoSeparador}></div>
                    
                    <div style={styles.servicoConcluidoLabel}>Cliente</div>
                    <div style={styles.servicoConcluidoValor}>
                      {servicoConcluido.proximoServico.cliente.nome}
                    </div>
                    
                    <div style={styles.servicoConcluidoSeparador}></div>
                    
                    <div style={styles.servicoConcluidoLabel}>Agendado para</div>
                    <div style={styles.servicoConcluidoValor}>
                      {formatarDataHora(servicoConcluido.proximoServico.dataAgendamento)}
                    </div>
                    
                    <div style={styles.servicoConcluidoSeparador}></div>
                    
                    <div style={styles.servicoConcluidoLabel}>Prioridade</div>
                    <div style={styles.servicoConcluidoValor}>
                      <span style={{
                        ...styles.servicoPrioridade,
                        ...(servicoConcluido.proximoServico.prioridade === "Crítica" ? styles.servicoPrioridadeCritica :
                           servicoConcluido.proximoServico.prioridade === "Alta" ? styles.servicoPrioridadeAlta :
                           servicoConcluido.proximoServico.prioridade === "Média" ? styles.servicoPrioridadeMedia :
                           styles.servicoPrioridadeBaixa)
                      }}>
                        {servicoConcluido.proximoServico.prioridade}
                      </span>
                    </div>
                    
                                       <div style={styles.servicoProximoAcoes}>
                      <button 
                        style={{...styles.button, ...styles.outlineButton}}
                        onClick={rejeitarProximoServico}
                      >
                        Rejeitar
                      </button>
                      <button 
                        style={{...styles.button, ...styles.successButton}}
                        onClick={aceitarProximoServico}
                      >
                        Aceitar Próximo Serviço
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{...styles.alertBox, ...styles.alertBoxInfo}}>
                    <div style={styles.alertTitle}>Sem próximos serviços</div>
                    <div style={styles.alertContent}>
                      Não há serviços pendentes compatíveis com as habilidades do técnico no momento.
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.button, ...styles.outlineButton}}
                onClick={() => setShowServicoConcluidoModal(false)}
              >
                Fechar
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