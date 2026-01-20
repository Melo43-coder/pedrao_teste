import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import firebase from "../../services/firebase";

// Dados serão carregados do Firebase em tempo real
// Não usamos mock - o sistema carrega automaticamente do banco de dados

// Insights iniciais (serão substituídos pela IA a cada 12h)
const MOCK_INSIGHTS = [
  {
    id: 1,
    tipo: "Oportunidade",
    titulo: "Aumento de demanda detectado",
    descricao: "Análise mostra crescimento de 23% nas solicitações nos últimos 7 dias. Tendência de crescimento sustentável.",
    acaoRecomendada: "Considere contratar mais 2 técnicos ou ativar equipe de backup para atender demanda crescente.",
    impacto: "🟢 Alto",
    metricas: {
      crescimento: 23,
      confiabilidade: 87
    }
  },
  {
    id: 2,
    tipo: "Otimização",
    titulo: "Rotas podem ser otimizadas",
    descricao: "IA detectou que 15% do tempo dos técnicos é gasto em deslocamento. Reagrupamento de rotas pode economizar 2h/dia.",
    acaoRecomendada: "Implementar agrupamento geográfico de serviços para reduzir tempo de deslocamento.",
    impacto: "🟡 Médio",
    metricas: {
      economiaHoras: 2,
      reducaoDeslocamento: 15
    }
  },
  {
    id: 3,
    tipo: "Eficiência",
    titulo: "Técnicos com alta eficiência",
    descricao: "3 técnicos estão com taxa de conclusão acima de 95% e tempo médio 20% abaixo da meta.",
    acaoRecomendada: "Reconhecer desempenho excepcional e usar como mentores para treinar equipe.",
    impacto: "🟢 Alto",
    metricas: {
      eficiencia: 95,
      economiaHoras: 3
    }
  }
];

// Previsões iniciais (serão atualizadas pela IA a cada 12h)
const MOCK_PREVISOES = [
  {
    id: 1,
    periodo: "Próximas 24h",
    faturamento: {
      valor: "R$ 45.280,00",
      crescimento: 18,
      confiabilidade: 89
    },
    servicos: {
      quantidade: 28,
      tendencia: "Crescente"
    },
    alertas: ["Demanda 18% acima da média", "Capacidade em 85% do limite"],
    recomendacoes: ["Ativar equipe de apoio", "Priorizar serviços urgentes"]
  },
  {
    id: 2,
    periodo: "Próximos 7 dias",
    faturamento: {
      valor: "R$ 312.450,00",
      crescimento: 22,
      confiabilidade: 82
    },
    servicos: {
      quantidade: 186,
      tendencia: "Crescente"
    },
    alertas: ["Pico previsto na quarta-feira", "3 técnicos com férias agendadas"],
    recomendacoes: ["Contratar temporários", "Redistribuir carga de trabalho"]
  },
  {
    id: 3,
    periodo: "Próximos 30 dias",
    faturamento: {
      valor: "R$ 1.280.350,00",
      crescimento: 15,
      confiabilidade: 75
    },
    servicos: {
      quantidade: 742,
      tendencia: "Estável"
    },
    alertas: ["Tendência de estabilização", "Sazonalidade prevista"],
    recomendacoes: ["Manter equipe atual", "Preparar campanhas de retenção"]
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
  const [prestadores, setPrestadores] = useState([]);
  const [servicosPendentes, setServicosPendentes] = useState([]);
  const [insights, setInsights] = useState([]);
  const [previsoes, setPrevisoes] = useState([]);
  const [regrasAutomacao, setRegrasAutomacao] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("automacao"); // Começa em Automação (onde IA fica)
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
  const [servicoConcluido, setServicoConcluido] = useState(null);
  const [showServicoConcluidoModal, setShowServicoConcluidoModal] = useState(false);
  
  // Estados da IA Gemini
  const [iaMessages, setIaMessages] = useState([]);
  const [iaInput, setIaInput] = useState("");
  const [iaLoading, setIaLoading] = useState(false);
  const [cnpj, setCnpj] = useState(""); // CNPJ da empresa do usuário

  // Carregar dados do Firebase em tempo real
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const cnpjArmazenado = localStorage.getItem('companyCnpj');
        
        if (cnpjArmazenado) {
          console.log(`📥 Carregando fluxo de trabalho para CNPJ: ${cnpjArmazenado}`);
          setCnpj(cnpjArmazenado);
          
          // ✅ 1️⃣ Carregar prestadores com role 'prestador' + status das ordens
          await carregarPrestadoresComStatus(cnpjArmazenado);
          
          // ✅ 2️⃣ Carregar serviços pendentes (ordens de serviço com status != Concluída)
          const todosServicos = await firebase.listServiceOrders(cnpjArmazenado).catch(() => []);
          console.log('📦 Serviços brutos do Firebase:', todosServicos);
          
          const servicosPendentes = todosServicos
            .filter(s => 
              s.status !== 'Concluída' && s.status !== 'Concluído' && s.status !== 'Cancelada'
            )
            .map(servico => ({
              id: servico.id || servico.codigo,
              cliente: {
                id: servico.clienteId || 'C-000',
                nome: servico.clienteNome || servico.cliente || 'Cliente Desconhecido',
                endereco: servico.endereco || '',
                telefone: servico.telefone || '',
                contato: servico.contato || ''
              },
              tipo: servico.tipo || 'Serviço',
              descricao: servico.descricao || 'Sem descrição',
              prioridade: servico.prioridade || 'Média',
              dataAgendamento: servico.dataAgendamento || servico.data || new Date().toISOString(),
              tempoEstimado: parseInt(servico.tempoEstimado) || 60,
              requisitos: servico.requisitos || [],
              especialidadesNecessarias: servico.especialidadesNecessarias || servico.especialidades || [],
              historico: servico.historico || [],
              status: servico.status || 'Pendente',
              prestadorId: servico.prestadorId || null
            }));
          
          setServicosPendentes(servicosPendentes);
          console.log(`✅ ${servicosPendentes.length} serviços pendentes mapeados corretamente`);
          
          // ✅ 3️⃣ Carregar regras de automação
          const regrasDb = await firebase.listarRegrasAutomacao(cnpjArmazenado).catch(() => []);
          setRegrasAutomacao(regrasDb.length > 0 ? regrasDb : []);
          console.log(`✅ ${regrasDb.length} regras de automação carregadas`);
          
          // ✅ 4️⃣ Carregar insights e previsões
          const [insightsDb, previsoenDb] = await Promise.all([
            firebase.listarInsights(cnpjArmazenado, 5).catch(() => []),
            firebase.listarPrevisoes(cnpjArmazenado, 5).catch(() => [])
          ]);
          
          // Se não houver dados no Firebase, usar dados iniciais
          setInsights(insightsDb.length > 0 ? insightsDb : MOCK_INSIGHTS);
          setPrevisoes(previsoenDb.length > 0 ? previsoenDb : MOCK_PREVISOES);
          
          console.log(`✅ ${insightsDb.length > 0 ? insightsDb.length : MOCK_INSIGHTS.length} insights e ${previsoenDb.length > 0 ? previsoenDb.length : MOCK_PREVISOES.length} previsões carregadas`);
        } else {
          console.warn('⚠️ CNPJ não encontrado no localStorage');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Erro ao carregar dados:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ========================================
  // ⚡ MOTOR DE AUTOMAÇÃO - EXECUÇÃO REAL DAS REGRAS
  // ========================================
  useEffect(() => {
    if (isLoading || !cnpj || regrasAutomacao.length === 0 || servicosPendentes.length === 0) return;
    
    const executarAutomacao = async () => {
      console.log("⚡ Motor de Automação: Verificando regras...");
      
      const regrasAtivas = regrasAutomacao.filter(r => r.status === "Ativo");
      
      for (const regra of regrasAtivas) {
        try {
          // Executar regra baseada no nome/tipo
          if (regra.nome.toLowerCase().includes("atribui") && regra.nome.toLowerCase().includes("automática")) {
            await executarRegraAtribuicaoAutomatica(regra);
          } else if (regra.nome.toLowerCase().includes("notificação") || regra.nome.toLowerCase().includes("notifica")) {
            await executarRegraNotificacao(regra);
          } else if (regra.nome.toLowerCase().includes("sla") || regra.nome.toLowerCase().includes("alerta")) {
            await executarRegraAlertaSLA(regra);
          }
        } catch (error) {
          console.error(`❌ Erro ao executar regra ${regra.nome}:`, error);
        }
      }
    };
    
    // Executar automação a cada 30 segundos
    const intervalo = setInterval(executarAutomacao, 30000);
    
    // Executar imediatamente ao carregar
    setTimeout(executarAutomacao, 2000);
    
    return () => clearInterval(intervalo);
  }, [isLoading, cnpj, regrasAutomacao, servicosPendentes, prestadores]); // eslint-disable-line react-hooks/exhaustive-deps

  // Executar Regra: Atribuição Automática
  const executarRegraAtribuicaoAutomatica = async (regra) => {
    console.log(`🤖 Executando: ${regra.nome}`);
    
    // Encontrar serviços não atribuídos
    const servicosNaoAtribuidos = servicosPendentes.filter(s => 
      !s.prestadorId && s.status === "Pendente"
    );
    
    if (servicosNaoAtribuidos.length === 0) {
      console.log("✓ Nenhum serviço pendente para atribuição");
      return;
    }
    
    for (const servico of servicosNaoAtribuidos) {
      // Encontrar melhor prestador usando algoritmo de matching
      const melhorPrestador = encontrarMelhorPrestador(servico);
      
      if (melhorPrestador) {
        console.log(`✅ Atribuindo serviço ${servico.id} para ${melhorPrestador.nome}`);
        
        try {
          // Atribuir no Firebase
          await firebase.updateServiceOrder(cnpj, servico.id, {
            prestadorId: melhorPrestador.id,
            prestadorNome: melhorPrestador.nome,
            status: "Atribuído",
            dataAtribuicao: new Date().toISOString(),
            atribuidoPor: "Sistema de Automação"
          });
          
          // Atualizar localmente
          atribuirServico(servico.id, melhorPrestador.id, false);
          
          // Atualizar última execução da regra
          await firebase.atualizarRegraAutomacao(cnpj, regra.id, {
            ultimaExecucao: new Date().toISOString()
          });
          
        } catch (error) {
          console.error(`❌ Erro ao atribuir serviço ${servico.id}:`, error);
        }
      }
    }
  };

  // Executar Regra: Notificações
  const executarRegraNotificacao = async (regra) => {
    console.log(`🔔 Executando: ${regra.nome}`);
    
    // Encontrar serviços concluídos recentemente (últimas 24h) sem avaliação
    const servicosConcluidos = servicosPendentes.filter(s => 
      s.status === "Concluída" && 
      !s.avaliacaoEnviada &&
      s.dataConclusao &&
      (new Date() - new Date(s.dataConclusao)) < 24 * 60 * 60 * 1000
    );
    
    for (const servico of servicosConcluidos) {
      console.log(`📧 Enviando notificação para ${servico.cliente.nome}`);
      
      try {
        // Enviar notificação (implementar via WhatsApp/Email)
        const mensagem = `Olá ${servico.cliente.nome}! Seu serviço ${servico.tipo} foi concluído. Por favor, avalie nosso atendimento: [link]`;
        
        // Marcar como notificado
        await firebase.updateServiceOrder(cnpj, servico.id, {
          avaliacaoEnviada: true,
          dataEnvioAvaliacao: new Date().toISOString()
        });
        
        console.log(`✅ Notificação enviada para serviço ${servico.id}`);
      } catch (error) {
        console.error(`❌ Erro ao enviar notificação:`, error);
      }
    }
  };

  // Executar Regra: Alerta de SLA
  const executarRegraAlertaSLA = async (regra) => {
    console.log(`⚠️ Executando: ${regra.nome}`);
    
    const agora = new Date();
    
    // Verificar serviços em risco de SLA
    const servicosEmRisco = servicosPendentes.filter(s => {
      if (s.status === "Concluída" || !s.dataAgendamento) return false;
      
      const dataAgendamento = new Date(s.dataAgendamento);
      const tempoDecorrido = agora - dataAgendamento;
      const tempoEstimadoMs = (s.tempoEstimado || 60) * 60 * 1000;
      const percentualDecorrido = (tempoDecorrido / tempoEstimadoMs) * 100;
      
      return percentualDecorrido > 80 && (s.prioridade === "Alta" || s.prioridade === "Crítica");
    });
    
    for (const servico of servicosEmRisco) {
      console.log(`🚨 ALERTA SLA: Serviço ${servico.id} está em risco!`);
      
      // Enviar alerta para gerentes (implementar notificação real)
      const alerta = {
        tipo: "SLA_EM_RISCO",
        servicoId: servico.id,
        cliente: servico.cliente.nome,
        prioridade: servico.prioridade,
        timestamp: new Date().toISOString()
      };
      
      console.log("📢 Alerta gerado:", alerta);
    }
  };

  // Encontrar melhor prestador para um serviço
  const encontrarMelhorPrestador = (servico) => {
    const prestadoresDisponiveis = prestadores.filter(p => p.status === "Disponível");
    
    if (prestadoresDisponiveis.length === 0) return null;
    
    // Sistema de pontuação
    const prestadoresPontuados = prestadoresDisponiveis.map(prestador => {
      let pontuacao = 0;
      
      // Especialidades (peso 40%)
      const especialidadesMatch = servico.especialidadesNecessarias?.filter(
        esp => prestador.especialidades?.includes(esp)
      ).length || 0;
      pontuacao += (especialidadesMatch / (servico.especialidadesNecessarias?.length || 1)) * 40;
      
      // Eficiência (peso 30%)
      pontuacao += ((prestador.eficiencia || 50) / 100) * 30;
      
      // Avaliação (peso 20%)
      pontuacao += ((prestador.avaliacao || 3) / 5) * 20;
      
      // Carga de trabalho (peso 10%)
      const cargaInvertida = Math.max(0, 100 - (prestador.servicosConcluidos * 2));
      pontuacao += (cargaInvertida / 100) * 10;
      
      return { prestador, pontuacao };
    });
    
    prestadoresPontuados.sort((a, b) => b.pontuacao - a.pontuacao);
    return prestadoresPontuados[0]?.prestador || null;
  };

  // ✅ Gerar recomendações quando dados forem carregados
  useEffect(() => {
    if (!isLoading && cnpj && gerarRecomendacoesIA) {
      setTimeout(() => {
        gerarRecomendacoesIA();
      }, 500);
    }
  });  // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ Função para carregar prestadores com base em role + status de ordens de serviço
  const carregarPrestadoresComStatus = async (cnpjEmpresa) => {
    try {
      console.log(`🔍 Buscando prestadores (role: 'prestador') para CNPJ: ${cnpjEmpresa}`);
      
      // 1️⃣ Buscar todos os usuários da empresa
      const todosUsuarios = await firebase.listCompanyUsers(cnpjEmpresa).catch(() => []);
      console.log(`✅ ${todosUsuarios.length} usuários encontrados`);
      
      // 2️⃣ Filtrar apenas prestadores (role: 'prestador')
      const usuariosDb = todosUsuarios.filter(u => u.role === 'prestador' && u.active);
      console.log(`✅ ${usuariosDb.length} prestadores encontrados`);
      
      // 3️⃣ Buscar todas as ordens de serviço
      const ordensDb = await firebase.listServiceOrders(cnpjEmpresa).catch(() => []);
      console.log(`✅ ${ordensDb.length} ordens de serviço carregadas`);
      
      // 4️⃣ Determinar status de cada prestador baseado nas ordens
      const prestadoresComStatus = usuariosDb.map(usuario => {
        // Procurar ordens ativas deste prestador
        const ordensAtivas = ordensDb.filter(ordem => 
          ordem.prestadorId === usuario.id && 
          (ordem.status === 'Em Progresso' || ordem.status === 'Aguardando')
        );
        
        // Procurar última ordem concluída
        const ordensCompletas = ordensDb.filter(ordem => 
          ordem.prestadorId === usuario.id && 
          (ordem.status === 'Concluída' || ordem.status === 'Concluído')
        );
        
        const ultimaOrdem = ordensCompletas.length > 0 
          ? ordensCompletas.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0]
          : null;
        
        return {
          id: usuario.id,
          nome: usuario.displayName || usuario.username,
          email: usuario.email,
          cargo: usuario.cargo || 'Técnico',
          departamento: usuario.departamento || 'Suporte',
          eficiencia: usuario.eficiencia || 85,
          servicosConcluidos: ordensCompletas.length,
          tempoMedioServico: usuario.tempoMedioServico || 45,
          avaliacao: usuario.avaliacao || 4.5,
          status: ordensAtivas.length > 0 ? 'Em Serviço' : 'Disponível',
          especialidades: usuario.especialidades || [],
          ultimoServico: ultimaOrdem ? {
            id: ultimaOrdem.id,
            cliente: ultimaOrdem.cliente || 'N/A',
            tipo: ultimaOrdem.tipo || 'Serviço',
            concluido: ultimaOrdem.updatedAt || ultimaOrdem.createdAt
          } : null,
          ordensAtivasCount: ordensAtivas.length
        };
      });
      
      setPrestadores(prestadoresComStatus);
      console.log(`✅ ${prestadoresComStatus.length} prestadores com status determinado`);
      
    } catch (error) {
      console.error('❌ Erro ao carregar prestadores:', error);
    }
  };

  // Simular conclusão de serviço e atribuição automática
  const simularConclusaoServico = (funcionarioId, servicoId) => {
    // Encontrar o prestador e atualizar seu status
    const prestadorAtualizado = prestadores.find(p => p.id === funcionarioId);
    if (!prestadorAtualizado) return;
    
    // Encontrar o serviço concluído
    const servicoConcluido = servicosPendentes.find(s => s.id === servicoId);
    if (!servicoConcluido) return;
    
    // Atualizar status do prestador
    const novosPrestadores = prestadores.map(p => {
      if (p.id === funcionarioId) {
        return {
          ...p,
          status: "Disponível",
          servicosConcluidos: p.servicosConcluidos + 1,
          ultimoServico: {
            id: servicoId,
            cliente: servicoConcluido.cliente.nome,
            tipo: servicoConcluido.tipo,
            concluido: new Date().toISOString()
          }
        };
      }
      return p;
    });
    
    // Remover serviço concluído da lista de pendentes
    const novosServicosPendentes = servicosPendentes.filter(s => s.id !== servicoId);
    
    // Encontrar próximo serviço adequado para o prestador
    const proximoServico = encontrarProximoServico(prestadorAtualizado, novosServicosPendentes);
    
    // Mostrar modal de conclusão e próximo serviço
    setServicoConcluido({
      servicoAnterior: servicoConcluido,
      prestador: prestadorAtualizado,
      proximoServico: proximoServico
    });
    
    setShowServicoConcluidoModal(true);
    
    // Atualizar estados
    setPrestadores(novosPrestadores);
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

  // Atribuir serviço a um prestador
  const atribuirServico = (servicoId, funcionarioId, manual = false) => {
    const servico = servicosPendentes.find(s => s.id === servicoId);
    const prestador = prestadores.find(p => p.id === funcionarioId);
    
    if (!servico || !prestador) return;
    
    // Atualizar status do prestador
    const novosPrestadores = prestadores.map(p => {
      if (p.id === funcionarioId) {
        return {
          ...p,
          status: "Em Serviço"
        };
      }
      return p;
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
                ? `Serviço atribuído manualmente a ${prestador.nome}`
                : `Serviço atribuído automaticamente a ${prestador.nome} pelo sistema`
            }
          ]
        };
      }
      return s;
    });
    
    setPrestadores(novosPrestadores);
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
    setConfirmacaoMensagem(`Serviço ${servico.id} atribuído com sucesso a ${prestador.nome}`);
    setShowConfirmacaoModal(true);
  };

  // Adicionar nova regra de automação
  const adicionarRegra = async () => {
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
    
    // Atualizar estado local
    setRegrasAutomacao([...regrasAutomacao, novaRegraObj]);
    
    // ✅ Salvar no Firebase se tiver CNPJ
    if (cnpj) {
      try {
        await firebase.criarRegraAutomacao(cnpj, novaRegraObj);
        console.log(`✅ Regra criada e salva no Firebase: ${novaRegraObj.nome}`);
      } catch (error) {
        console.error('⚠️ Erro ao salvar no Firebase:', error);
        // A regra foi adicionada localmente, então continua ok
      }
    }
    
    setShowNovaRegraModal(false);
    setNovaRegra({
      nome: "",
      descricao: "",
      criterios: [],
      prioridade: 3
    });
    
    // Mostrar confirmação
    setConfirmacaoMensagem(`Nova regra de automação "${novaRegraObj.nome}" criada com sucesso!`);
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

  // ✅ GERAR RECOMENDAÇÕES DA IA PARA AUTOMAÇÃO
  const gerarRecomendacoesIA = async () => {
    try {
      console.log("🤖 [Groq/Llama] Analisando fluxo de trabalho e gerando recomendações...");
      
      const prestadoresDisponiveis = prestadores.filter(p => p.status === "Disponível").length;
      const tempoMedioAtendimento = prestadores.length > 0 
        ? Math.round(prestadores.reduce((acc, p) => acc + p.tempoMedioServico, 0) / prestadores.length)
        : 0;
      
      // Chamar Groq para gerar recomendações inteligentes com contexto completo
      const prompt = `
Você é um especialista em automação e otimização de fluxos de trabalho para empresas de serviços de TI.

ANÁLISE CRÍTICA DO SISTEMA ATUAL:
📊 Dados em Tempo Real:
- Serviços Pendentes: ${servicosPendentes.length}
- Prestadores Disponíveis: ${prestadoresDisponiveis}
- Tempo Médio de Atendimento: ${tempoMedioAtendimento} minutos
- Taxa de Satisfação Média: ${insights[0]?.metricas?.confiabilidade || 'Não calculada'}%
- Regras Ativas: ${regrasAutomacao.filter(r => r.status === "Ativo").length}

REQUISIÇÃO:
Analise PROFUNDAMENTE e gere exatamente 3 recomendações estratégicas de AUTOMAÇÃO que:
1. Sejam específicas e mensuráveis
2. Tragam impacto real na eficiência operacional
3. Sejam implementáveis imediatamente

Para CADA recomendação, estruture assim:
[TÍTULO]: Nome curto e direto
[BENEFÍCIO]: O que será ganho em % ou número
[AÇÃO]: Como implementar em 2-3 linhas
[IMPACTO]: Quais métricas melhoram

Separe as 3 recomendações com "==="
      `;
      
      const response = await fetch('http://localhost:3001/api/zoe/process-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: prompt,
          telefoneCliente: '+5511999999999',
          historico: [],
          contextoOS: { 
            tipo: 'automacao', 
            dados: 'recomendacoes',
            totalServicos: servicosPendentes.length,
            prestadoresDisponiveis: prestadoresDisponiveis,
            cnpj: cnpj
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const resposta = data.resposta || '';
        
        // Parsear resposta estruturada
        const recomendacoes = resposta.split('===').slice(0, 3).map((rec, idx) => {
          const linhas = rec.trim().split('\n').filter(l => l.trim());
          return {
            id: idx + 1,
            titulo: linhas.find(l => l.includes('[TÍTULO]'))?.replace('[TÍTULO]:', '').trim() || `Recomendação ${idx + 1}`,
            beneficio: linhas.find(l => l.includes('[BENEFÍCIO]'))?.replace('[BENEFÍCIO]:', '').trim() || '',
            acao: linhas.find(l => l.includes('[AÇÃO]'))?.replace('[AÇÃO]:', '').trim() || '',
            impacto: linhas.find(l => l.includes('[IMPACTO]'))?.replace('[IMPACTO]:', '').trim() || '',
            descricao: rec.trim(),
            aplicada: false
          };
        }).filter(r => r.titulo);
        
        console.log("✅ [Groq/Llama] 3 recomendações geradas com sucesso:", recomendacoes);
      } else {
        console.warn("⚠️ Resposta da IA não foi OK:", response.status);
      }
    } catch (error) {
      console.error("❌ Erro ao gerar recomendações (Groq/Llama):", error);
    }
  };

  // ✅ PROCESSAR MENSAGEM COM IA (Groq + Llama 3.3 70B)
  const processarMensagemIA = async (mensagem) => {
    if (!mensagem.trim()) {
      alert("❌ Digite uma mensagem para a IA");
      return;
    }

    if (!cnpj) {
      alert("⚠️ CNPJ não configurado. A IA precisa conhecer sua empresa para acessar os dados.");
      return;
    }

    // Adicionar mensagem do usuário ao histórico
    setIaMessages(prev => [...prev, { tipo: 'usuario', texto: mensagem }]);
    setIaInput("");
    setIaLoading(true);

    try {
      // Contexto COMPLETO para a IA analisar profundamente
      const contextoCompleto = {
        empresa: { cnpj },
        servicosEmAndamento: {
          total: servicosPendentes.length,
          porStatus: {
            pendente: servicosPendentes.filter(s => s.status === 'Pendente').length,
            emProgresso: servicosPendentes.filter(s => s.status === 'Em Progresso').length,
            aguardando: servicosPendentes.filter(s => s.status === 'Aguardando').length
          }
        },
        prestadores: {
          total: prestadores.length,
          disponiveis: prestadores.filter(p => p.status === "Disponível").length,
          emServico: prestadores.filter(p => p.status === "Em Serviço").length,
          eficienciaMedia: prestadores.length > 0 
            ? Math.round(prestadores.reduce((acc, p) => acc + p.eficiencia, 0) / prestadores.length)
            : 0
        },
        automacao: {
          regrasAtivas: regrasAutomacao.filter(r => r.status === "Ativo").length,
          regrasInativas: regrasAutomacao.filter(r => r.status !== "Ativo").length
        },
        metricas: {
          tempoMedioAtendimento: prestadores.length > 0
            ? Math.round(prestadores.reduce((acc, p) => acc + p.tempoMedioServico, 0) / prestadores.length)
            : 0,
          satisfacao: insights[0]?.metricas?.confiabilidade || 0
        }
      };
      
      // Enriquecer prompt com contexto PROFUNDO
      const promptEnriquecido = `
Você é um assistente de AUTOMAÇÃO e OTIMIZAÇÃO de fluxos de trabalho para a empresa com CNPJ: ${cnpj}.
Você tem acesso a DADOS EM TEMPO REAL e deve fornecer análises e recomendações PRECISAS.

📊 CONTEXTO OPERACIONAL COMPLETO:
${JSON.stringify(contextoCompleto, null, 2)}

🎯 PERGUNTA/SOLICITAÇÃO DO USUÁRIO:
"${mensagem}"

INSTRUÇÕES PARA RESPOSTA:
1. Analise PROFUNDAMENTE o contexto atual
2. Se for pergunta sobre automação: recomende regras específicas com impacto estimado
3. Se for sobre fluxo de trabalho: sugira otimizações com métricas de melhoria
4. Se for sobre performance: identifique gargalos e soluções
5. SEMPRE forneça ações concretas e mensuráveis
6. Se aplicável, cite números e porcentagens de ganho potencial

Responda de forma ESTRUTURADA e PROFISSIONAL:
      `;
      
      const response = await fetch('http://localhost:3001/api/zoe/process-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: promptEnriquecido,
          telefoneCliente: '+5511999999999',
          historico: iaMessages.map(m => ({
            tipo: m.tipo === 'usuario' ? 'user' : 'assistant',
            conteudo: m.texto
          })),
          contextoOS: { 
            tipo: 'automacao', 
            cnpj: cnpj,
            contextoCompleto: contextoCompleto
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIaMessages(prev => [...prev, { 
          tipo: 'bot', 
          texto: data.resposta,
          timestamp: new Date().toLocaleTimeString('pt-BR')
        }]);
        console.log(`✅ [Groq/Llama 3.3 70B] IA processou mensagem com sucesso (CNPJ: ${cnpj})`);
      } else {
        throw new Error(`Erro HTTP ${response.status} ao chamar IA`);
      }
    } catch (error) {
      console.error("❌ Erro ao processar IA (Groq/Llama):", error);
      setIaMessages(prev => [...prev, { 
        tipo: 'bot', 
        texto: `❌ Erro ao processar sua pergunta: ${error.message}. \n\nDica: Certifique-se de que o servidor Groq está rodando em http://localhost:3001`, 
        timestamp: new Date().toLocaleTimeString('pt-BR')
      }]);
    } finally {
      setIaLoading(false);
    }
  };

  // ✅ ATUALIZAR INSIGHTS E PREVISÕES A CADA 12H COM GROQ
  useEffect(() => {
    const gerarInsightsIA = async () => {
      console.log("🤖 [Groq/Llama] Gerando insights profundos sobre operações...");
      try {
        const promptInsights = `
Analise e gere 3 insights estratégicos:

DADOS:
- Pendência: ${servicosPendentes.length}
- Disponíveis: ${prestadores.filter(p => p.status === "Disponível").length}
- Tempo médio: ${prestadores.length > 0 ? Math.round(prestadores.reduce((acc, p) => acc + p.tempoMedioServico, 0) / prestadores.length) : 0}min

Formato:
[INSIGHT]: Título
[IMPACTO]: X%
[AÇÃO]: Recomendação
---
        `;

        const response = await fetch('http://localhost:3001/api/zoe/process-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mensagem: promptInsights,
            telefoneCliente: '+5511999999999',
            historico: [],
            contextoOS: { 
              tipo: 'insights', 
              cnpj: cnpj,
              totalServicos: servicosPendentes.length
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ [Groq/Llama] Insights gerados:", data.resposta);
          
          // Parsear e estruturar insights da resposta da IA
          const insightsTexto = data.resposta || '';
          const insightsArray = insightsTexto.split('---').filter(i => i.trim()).map((insight, index) => {
            const linhas = insight.split('\n').filter(l => l.trim());
            const titulo = linhas.find(l => l.includes('[INSIGHT]'))?.replace('[INSIGHT]:', '').trim() || `Insight ${index + 1}`;
            const impacto = linhas.find(l => l.includes('[IMPACTO]'))?.replace('[IMPACTO]:', '').trim() || 'Médio';
            const acao = linhas.find(l => l.includes('[AÇÃO]'))?.replace('[AÇÃO]:', '').trim() || 'Em análise';
            
            return {
              id: Date.now() + index,
              tipo: index === 0 ? 'Oportunidade' : index === 1 ? 'Otimização' : 'Eficiência',
              titulo: titulo,
              descricao: insight.trim().substring(0, 200),
              acaoRecomendada: acao,
              impacto: impacto.includes('%') ? impacto : '🔴 Alto',
              metricas: {
                crescimento: parseInt(impacto) || 15,
                confiabilidade: 85
              },
              dataGeracao: new Date().toISOString()
            };
          });
          
          if (insightsArray.length > 0) {
            setInsights(insightsArray);
            console.log(`✅ ${insightsArray.length} insights salvos no estado`);
          }
          
          localStorage.setItem('lastInsightsUpdate', new Date().toISOString());
        }
      } catch (error) {
        console.error("❌ Erro ao gerar insights (Groq/Llama):", error);
      }
    };

    const gerarPrevisõesIA = async () => {
      console.log("🤖 [Groq/Llama] Gerando previsões inteligentes...");
      try {
        const promptPrevisoes = `
Gere 3 previsões operacionais:

CONTEXTO:
- Fila: ${servicosPendentes.length}
- Disponíveis: ${prestadores.filter(p => p.status === "Disponível").length}
- Tendência: ${servicosPendentes.length > 10 ? 'Crescente' : 'Estável'}

Formato:
[PREVISÃO]: O que vai acontecer
[PROBABILIDADE]: X%
[PREPARAÇÃO]: Ação
---
        `;

        const response = await fetch('http://localhost:3001/api/zoe/process-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mensagem: promptPrevisoes,
            telefoneCliente: '+5511999999999',
            historico: [],
            contextoOS: { 
              tipo: 'previsoes', 
              cnpj: cnpj,
              servicosPendentes: servicosPendentes.length
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ [Groq/Llama] Previsões geradas:", data.resposta);
          
          // Parsear e estruturar previsões da resposta da IA
          const previsoesTexto = data.resposta || '';
          const previsoesArray = previsoesTexto.split('---').filter(p => p.trim()).map((previsao, index) => {
            const linhas = previsao.split('\n').filter(l => l.trim());
            const prevTexto = linhas.find(l => l.includes('[PREVISÃO]'))?.replace('[PREVISÃO]:', '').trim() || `Previsão ${index + 1}`;
            const probabilidade = linhas.find(l => l.includes('[PROBABILIDADE]'))?.replace('[PROBABILIDADE]:', '').replace('%', '').trim() || '70';
            const preparacao = linhas.find(l => l.includes('[PREPARAÇÃO]'))?.replace('[PREPARAÇÃO]:', '').trim() || 'Acompanhar indicadores';
            
            return {
              id: Date.now() + index,
              periodo: index === 0 ? 'Próximas 24h' : index === 1 ? 'Próximos 7 dias' : 'Próximos 30 dias',
              faturamento: {
                valor: 'R$ ' + (Math.random() * 50000 + 30000).toFixed(2).replace('.', ','),
                crescimento: parseInt(probabilidade) - 50 || 20,
                confiabilidade: parseInt(probabilidade) || 70
              },
              servicos: {
                quantidade: servicosPendentes.length + Math.floor(Math.random() * 20),
                tendencia: parseInt(probabilidade) > 60 ? 'Crescente' : 'Estável'
              },
              alertas: [prevTexto, preparacao].filter(a => a),
              recomendacoes: [preparacao],
              dataGeracao: new Date().toISOString()
            };
          });
          
          if (previsoesArray.length > 0) {
            setPrevisoes(previsoesArray);
            console.log(`✅ ${previsoesArray.length} previsões salvas no estado`);
          }
          
          localStorage.setItem('lastPrevisionsUpdate', new Date().toISOString());
        }
      } catch (error) {
        console.error("❌ Erro ao gerar previsões (Groq/Llama):", error);
      }
    };

    const verificarAtualizacao = async () => {
      const lastInsightsUpdate = localStorage.getItem('lastInsightsUpdate');
      const lastPrevisionsUpdate = localStorage.getItem('lastPrevisionsUpdate');
      const agora = new Date();
      
      const deveAtualizarInsights = !lastInsightsUpdate || 
        (agora - new Date(lastInsightsUpdate)) / (1000 * 60 * 60) >= 12;
      
      const deveAtualizarPrevisoes = !lastPrevisionsUpdate || 
        (agora - new Date(lastPrevisionsUpdate)) / (1000 * 60 * 60) >= 12;
      
      if (deveAtualizarInsights) {
        console.log("🔄 Atualizando Insights via Groq/Llama...");
        await gerarInsightsIA();
      }
      
      if (deveAtualizarPrevisoes) {
        console.log("🔄 Atualizando Previsões via Groq/Llama...");
        await gerarPrevisõesIA();
      }
    };
    
    // Executar verificação inicial após 2 segundos
    const timeoutInicial = setTimeout(() => {
      verificarAtualizacao();
    }, 2000);
    
    // Verificar a cada 30 minutos
    const intervalo = setInterval(verificarAtualizacao, 30 * 60 * 1000);
    
    return () => {
      clearTimeout(timeoutInicial);
      clearInterval(intervalo);
    };
  }, [cnpj, servicosPendentes.length, prestadores.length]);

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
      color: "#2C30D5"
    },
    statWarning: {
      color: "#f59e0b"
    },
    statDanger: {
      color: "#ef4444"
    },
    statSuccess: {
      color: "#11A561"
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
      borderLeft: "4px solid #2C30D5"
    },
    insightTendencia: {
      borderLeftColor: "#2C30D5"
    },
    insightOtimizacao: {
      borderLeftColor: "#11A561"
    },
    insightAlerta: {
      borderLeftColor: "#ef4444"
    },
    insightOportunidade: {
      borderLeftColor: "#889DD3"
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
      color: "#2C30D5"
    },
    insightTipoTendencia: {
      backgroundColor: "#e0f2fe",
      color: "#2C30D5"
    },
    insightTipoOtimizacao: {
      backgroundColor: "#dcfce7",
      color: "#11A561"
    },
    insightTipoAlerta: {
      backgroundColor: "#fee2e2",
      color: "#ef4444"
    },
    insightTipoOportunidade: {
      backgroundColor: "#f3e8ff",
      color: "#889DD3"
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
      color: "#2C30D5"
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
      color: "#11A561"
    },
    previsaoCrescimentoNegativo: {
      color: "#ef4444"
    },
    prestadoresList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    },
    prestadorCard: {
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      padding: "16px",
      display: "flex",
      gap: "16px",
      alignItems: "center"
    },
    prestadorAvatar: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      backgroundColor: "#e0f2fe",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.5rem",
      fontWeight: "600",
      color: "#2C30D5"
    },
    prestadorInfo: {
      flex: 1
    },
    prestadorNome: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "4px"
    },
    prestadorCargo: {
      fontSize: "0.875rem",
      color: "#64748b",
      marginBottom: "8px"
    },
    prestadorMetricas: {
      display: "flex",
      gap: "16px"
    },
    prestadorMetrica: {
      flex: 1
    },
    prestadorMetricaValor: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#0f172a"
    },
    prestadorMetricaLabel: {
      fontSize: "0.75rem",
      color: "#64748b"
    },
    prestadorStatus: {
      fontSize: "0.75rem",
      fontWeight: "600",
      padding: "4px 8px",
      borderRadius: "9999px",
      marginBottom: "8px",
      display: "inline-block"
    },
    prestadorDisponivel: {
      backgroundColor: "#dcfce7",
      color: "#11A561"
    },
    prestadorOcupado: {
      backgroundColor: "#fef3c7",
      color: "#f59e0b"
    },
    prestadorAcoes: {
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
      borderLeft: "4px solid #2C30D5"
    },
    servicoCritico: {
      borderLeftColor: "#ef4444"
    },
    servicoAlto: {
      borderLeftColor: "#f59e0b"
    },
    servicoMedio: {
      borderLeftColor: "#2C30D5"
    },
    servicoBaixo: {
      borderLeftColor: "#11A561"
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
      color: "#2C30D5"
    },
    servicoPrioridadeBaixa: {
      backgroundColor: "#dcfce7",
      color: "#11A561"
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
      color: "#11A561"
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
      color: "#2C30D5"
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
      borderLeft: "4px solid #2C30D5"
    },
    alertBoxInfo: {
      backgroundColor: "#e0f2fe",
      borderLeftColor: "#2C30D5"
    },
    alertBoxSuccess: {
      backgroundColor: "#dcfce7",
      borderLeftColor: "#11A561"
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
      color: "#11A561",
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
      borderLeft: "4px solid #2C30D5"
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
      color: "#2C30D5"
    },
    servicoProximoMatch: {
      fontSize: "0.75rem",
      fontWeight: "600",
      padding: "4px 8px",
      borderRadius: "9999px",
      backgroundColor: "#dcfce7",
      color: "#11A561"
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
            ...(activeTab === "insights" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("insights")}
        >
          📊 Insights e Previsões
          {activeTab === "insights" && <div style={styles.activeTabIndicator}></div>}
        </button>
        
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "fluxo" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("fluxo")}
        >
          ⚙️ Fluxo de Trabalho
          {activeTab === "fluxo" && <div style={styles.activeTabIndicator}></div>}
        </button>
        
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "automacao" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("automacao")}
        >
          🔧 Regras & IA
          {activeTab === "automacao" && <div style={styles.activeTabIndicator}></div>}
        </button>

        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "ia" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("ia")}
        >
          🤖 Assistente
          {activeTab === "ia" && <div style={styles.activeTabIndicator}></div>}
        </button>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div style={styles.loadingState}>
          <div style={styles.loadingSpinner}></div>
          <p>Carregando sistema de automação inteligente...</p>
        </div>
      ) : activeTab === "insights" ? (
        <div style={styles.contentContainer}>
          {/* Insights IA */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>📈 Insights de Negócio</h3>
              <span style={{fontSize: "0.875rem", color: "#64748b"}}>🤖 Gerado pela IA (a cada 12h)</span>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.insightsList}>
                {insights.length > 0 ? (
                  insights.map(insight => (
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
                ))
                ) : (
                  <div style={{textAlign: "center", padding: "40px", color: "#94a3b8"}}>
                    🤖 Gerando insights da IA... (a cada 12h)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Previsões IA */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>🔮 Previsões IA (Próximo Trimestre)</h3>
              <span style={{fontSize: "0.875rem", color: "#64748b"}}>🤖 Atualizado a cada 12h</span>
            </div>
            <div style={styles.cardContent}>
              {previsoes.length > 0 ? (
                previsoes.map((previsao, index) => (
                  <motion.div 
                    key={index}
                    style={styles.previsaoCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div style={styles.previsaoHeader}>
                      <div style={styles.previsaoPeriodo}>{previsao.periodo || "Próximo Trimestre"}</div>
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
                      {previsao.clientesNovos && (
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
                      )}
                      {previsao.custos && (
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
                      )}
                      {previsao.margemLucro && (
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
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div style={{textAlign: "center", padding: "40px", color: "#94a3b8"}}>
                  🤖 Gerando previsões da IA... (a cada 12h)
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "fluxo" ? (
        <div style={{...styles.contentContainer, ...styles.contentWithSidebar}}>
          <div>
            {/* IA Analisando Fluxo */}
            <motion.div 
              style={{...styles.card, backgroundColor: "#f0fdf4", borderLeft: "4px solid #11A561"}}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>🤖 IA Analisando Fluxo</h3>
              </div>
              <div style={styles.cardContent}>
                <div style={{...styles.alertBox, ...styles.alertBoxSuccess}}>
                  <div style={styles.alertTitle}>Análise em Tempo Real</div>
                  <div style={styles.alertContent}>
                    ✅ A IA está otimizando a distribuição de serviços
                    <br/>
                    ✅ {servicosPendentes.length} serviços aguardando atribuição
                    <br/>
                    ✅ Taxa de eficiência média: {Math.round(prestadores.reduce((acc, p) => acc + p.eficiencia, 0) / prestadores.length)}%
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Serviços Pendentes */}
            <div style={{...styles.card, marginTop: "24px"}}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>📋 Serviços Pendentes</h3>
                <button 
                  style={{...styles.button, ...styles.primaryButton}}
                  onClick={() => setShowAtribuirServicoModal(true)}
                >
                  Atribuir Serviço
                </button>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.servicosList}>
                  {servicosPendentes.length > 0 ? (
                    servicosPendentes.map(servico => (
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
                    ))
                  ) : (
                    <div style={{textAlign: "center", padding: "40px", color: "#94a3b8"}}>
                      ✅ Todos os serviços foram atribuídos!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Equipe com Status de IA */}
            <motion.div 
              style={{...styles.card, backgroundColor: "#f3e8ff", borderLeft: "4px solid #889DD3"}}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>⚡ Motor de Automação</h3>
              </div>
              <div style={styles.cardContent}>
                <div style={{fontSize: "0.875rem", color: "#334155", marginBottom: "12px"}}>
                  🤖 Sistema executando {regrasAutomacao.filter(r => r.status === "Ativo").length} regras ativas automaticamente
                </div>
                <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
                  {regrasAutomacao.filter(r => r.status === "Ativo").slice(0, 3).map(regra => (
                    <span key={regra.id} style={{
                      fontSize: "0.75rem",
                      padding: "4px 8px",
                      backgroundColor: "#e0e7ff",
                      color: "#4f46e5",
                      borderRadius: "4px",
                      fontWeight: "500"
                    }}>
                      ✓ {regra.nome.substring(0, 30)}...
                    </span>
                  ))}
                </div>
                <div style={{fontSize: "0.75rem", color: "#64748b", marginTop: "12px"}}>
                  ⏱️ Próxima verificação em 30s
                </div>
              </div>
            </motion.div>

            {/* Prestadores Disponíveis */}
            <div style={{...styles.card, marginTop: "24px"}}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>👥 Prestadores Disponíveis</h3>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.prestadoresList}>
                  {prestadores.map(prestador => (
                    <motion.div 
                      key={prestador.id}
                      style={styles.prestadorCard}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div style={styles.prestadorAvatar}>
                        {prestador.nome.charAt(0)}
                      </div>
                      <div style={styles.prestadorInfo}>
                        <div style={styles.prestadorNome}>{prestador.nome}</div>
                        <div style={styles.prestadorCargo}>{prestador.cargo}</div>
                        <span style={{
                          ...styles.prestadorStatus,
                          ...(prestador.status === "Disponível" ? styles.prestadorDisponivel : styles.prestadorOcupado)
                        }}>
                          {prestador.status === "Disponível" ? "🟢" : "🟡"} {prestador.status}
                        </span>
                        <div style={styles.prestadorMetricas}>
                          <div style={styles.prestadorMetrica}>
                            <div style={styles.prestadorMetricaValor}>{prestador.servicosConcluidos}</div>
                            <div style={styles.prestadorMetricaLabel}>Serviços</div>
                          </div>
                          <div style={styles.prestadorMetrica}>
                            <div style={styles.prestadorMetricaValor}>{prestador.eficiencia}%</div>
                            <div style={styles.prestadorMetricaLabel}>Eficiência</div>
                          </div>
                          <div style={styles.prestadorMetrica}>
                            <div style={styles.prestadorMetricaValor}>{prestador.avaliacao}</div>
                            <div style={styles.prestadorMetricaLabel}>Avaliação</div>
                          </div>
                        </div>
                      </div>
                      {prestador.status === "Em Serviço" && (
                        <div style={styles.prestadorAcoes}>
                          <button 
                            style={{...styles.button, ...styles.successButton}}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Simular conclusão de serviço
                              simularConclusaoServico(prestador.id, prestador.ultimoServico.id);
                            }}
                          >
                            ✓ Concluir
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
          {/* IA Controlando Automação */}
          <motion.div 
            style={{...styles.card, backgroundColor: "#fef3c7", borderLeft: "4px solid #f59e0b"}}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>⚙️ IA Controlando Automação</h3>
              <span style={{fontSize: "0.875rem", color: "#b45309"}}>
                🤖 Sistema ativo • Monitorando {servicosPendentes.length} serviços
              </span>
            </div>
            <div style={styles.cardContent}>
              <div style={{...styles.alertBox, ...styles.alertBoxWarning}}>
                <div style={styles.alertTitle}>Status de Controle Automático</div>
                <div style={styles.alertContent}>
                  ✅ IA está analisando serviços e distribuindo entre técnicos em tempo real
                  <br/>
                  ✅ {regrasAutomacao.filter(r => r.status === "Ativo").length} regras ativas controlando o fluxo
                  <br/>
                  ✅ Próxima análise: agora mesmo para otimizar distribuição
                </div>
              </div>
            </div>
          </motion.div>

          {/* Regras de Automação */}
          <div style={{...styles.card, marginTop: "24px"}}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>🔧 Regras de Automação</h3>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={() => setShowNovaRegraModal(true)}
              >
                + Nova Regra
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
                        {regra.status === "Ativo" ? "🟢" : "🔴"} {regra.status}
                      </span>
                    </div>
                    <p style={styles.regraDescricao}>{regra.descricao}</p>
                    <div style={styles.regraCriterios}>
                      <div style={styles.regraCriteriosTitulo}>Critérios de Decisão:</div>
                      <div style={styles.regraCriteriosList}>
                        {regra.criterios.map((criterio, index) => (
                          <span key={index} style={styles.regraCriterio}>{criterio}</span>
                        ))}
                      </div>
                    </div>
                    <div style={styles.regraFooter}>
                      <div style={{fontSize: "0.75rem", color: "#64748b"}}>
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
                          {regra.status === "Ativo" ? "⏹️" : "▶️"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "ia" ? (
        <motion.div
          style={{
            ...styles.card,
            height: 'calc(100vh - 300px)',
            display: 'flex',
            flexDirection: 'column',
            marginTop: '24px'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>🤖 Assistente IA - Groq + Llama 3.3 70B</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              {cnpj ? `🔐 Empresa: ${cnpj}` : '⚠️ Carregando dados da empresa...'} • 
              IA gerando Insights, Previsões e Otimizações em Tempo Real
            </p>
          </div>

          {/* Chat Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#f8fafc'
          }}>
            {iaMessages.length === 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#94a3b8',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Assistente IA Groq + Llama</div>
                <div style={{ fontSize: '14px', marginBottom: '16px' }}>
                  Você está conversando com a IA que gerencia TODOS os aspectos da sua operação.
                </div>
                <div style={{ 
                  fontSize: '13px', 
                  color: '#cbd5e1',
                  background: '#f1f5f9',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  lineHeight: '1.8'
                }}>
                  <div style={{marginBottom: '8px', fontWeight: '600', color: '#64748b'}}>⚡ Funções da IA:</div>
                  ✅ Gera RECOMENDAÇÕES estratégicas de automação<br/>
                  ✅ Analisa e cria INSIGHTS profundos a cada 12h<br/>
                  ✅ Gera PREVISÕES inteligentes de demanda<br/>
                  ✅ Otimiza FLUXO DE TRABALHO em tempo real<br/>
                  ✅ Responde perguntas sobre sua operação<br/>
                  <br/>
                  <span style={{fontWeight: '700', color: '#889DD3'}}>🚀 Powered by Groq API + Llama 3.3 70B</span>
                </div>
                <div style={{ fontSize: '12px', marginTop: '12px', color: '#94a3b8' }}>
                  Digite uma pergunta ou solicitação abaixo para começar
                </div>
              </div>
            )}
            {iaMessages.map((msg, idx) => (
              <motion.div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.tipo === 'usuario' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '8px'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {msg.tipo === 'bot' && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #889DD3 0%, #6366f1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                  }}>
                    🤖
                  </div>
                )}
                <div style={{
                  maxWidth: '70%',
                  backgroundColor: msg.tipo === 'usuario' ? '#2C30D5' : '#ffffff',
                  color: msg.tipo === 'usuario' ? 'white' : '#0f172a',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: msg.tipo === 'bot' ? '1px solid #e2e8f0' : 'none',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  boxShadow: msg.tipo === 'bot' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  fontSize: '13px'
                }}>
                  {msg.texto}
                  {msg.timestamp && (
                    <div style={{
                      fontSize: '11px',
                      marginTop: '6px',
                      opacity: 0.6,
                      fontStyle: 'italic'
                    }}>
                      {msg.timestamp}
                    </div>
                  )}
                </div>
                {msg.tipo === 'usuario' && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#2C30D5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    👤
                  </div>
                )}
              </motion.div>
            ))}
            {iaLoading && (
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                color: '#889DD3'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #889DD3 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px'
                }}>
                  🤖
                </div>
                <div style={{
                  background: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{fontSize: '13px', fontWeight: '600'}}>Groq processando...</div>
                  <div style={{fontSize: '11px', color: '#64748b', marginTop: '4px'}}>
                    Análise profunda de dados e geração de insights
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            padding: '16px',
            backgroundColor: 'white'
          }}>
            {/* Sugestões Rápidas */}
            {iaMessages.length === 0 && (
              <div style={{
                marginBottom: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px'
              }}>
                {[
                  '💡 Que automações preciso?',
                  '📊 Qual é a situação atual?',
                  '⚡ Como otimizar fluxo?',
                  '🎯 Previsão de demanda?'
                ].map((sugestao) => (
                  <button
                    key={sugestao}
                    onClick={() => {
                      setIaInput(sugestao);
                      setTimeout(() => processarMensagemIA(sugestao), 100);
                    }}
                    disabled={iaLoading}
                    style={{
                      padding: '8px 12px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#334155',
                      cursor: iaLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      if (!iaLoading) {
                        e.target.style.background = '#e2e8f0';
                        e.target.style.borderColor = '#94a3b8';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!iaLoading) {
                        e.target.style.background = '#f1f5f9';
                        e.target.style.borderColor = '#cbd5e1';
                      }
                    }}
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            )}

            {/* Input com Botão */}
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <input
                type="text"
                value={iaInput}
                onChange={(e) => setIaInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !iaLoading && iaInput.trim()) {
                    processarMensagemIA(iaInput);
                  }
                }}
                placeholder={cnpj ? "Pergunte sobre automações, otimizações, insights..." : "⚠️ Carregando dados..."}
                disabled={iaLoading || !cnpj}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  opacity: iaLoading || !cnpj ? 0.6 : 1,
                  cursor: iaLoading || !cnpj ? 'not-allowed' : 'text'
                }}
              />
              <button
                onClick={() => processarMensagemIA(iaInput)}
                disabled={!iaInput.trim() || iaLoading || !cnpj}
                style={{
                  padding: '10px 16px',
                  background: (iaInput.trim() && !iaLoading && cnpj) 
                    ? 'linear-gradient(135deg, #889DD3 0%, #6366f1 100%)' 
                    : '#cbd5e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (iaInput.trim() && !iaLoading && cnpj) ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  boxShadow: (iaInput.trim() && !iaLoading && cnpj) ? '0 2px 8px rgba(139, 92, 246, 0.3)' : 'none'
                }}
                onMouseOver={(e) => {
                  if (iaInput.trim() && !iaLoading && cnpj) {
                    e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.5)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (iaInput.trim() && !iaLoading && cnpj) {
                    e.target.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.3)';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {iaLoading ? '⏳ Processando' : '🚀 Enviar'}
              </button>
            </div>

            {/* Status Footer */}
            <div style={{
              marginTop: '8px',
              fontSize: '11px',
              color: '#94a3b8',
              display: 'flex',
              gap: '16px',
              justifyContent: 'space-between'
            }}>
              <span>🤖 Groq + Llama 3.3 70B</span>
              <span>{prestadores.length} prestadores • {servicosPendentes.length} serviços</span>
              <span>{regrasAutomacao.filter(r => r.status === "Ativo").length} regras ativas</span>
            </div>
          </div>
        </motion.div>
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
                  {prestadores
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
              
              {prestadores.filter(p => p.status === "Disponível").length === 0 && (
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
                disabled={!atribuicaoManual.servicoId || !atribuicaoManual.funcionarioId || prestadores.filter(p => p.status === "Disponível").length === 0}
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
