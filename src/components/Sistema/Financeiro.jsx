import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Dados mock para demonstração
const MOCK_RECEITAS = [
  {
    id: "rec-001",
    cliente: "Empresa ABC Ltda",
    descricao: "Consultoria em TI - Projeto ERP",
    valor: 7500.00,
    dataEmissao: "2025-04-01T10:30:00",
    dataVencimento: "2025-04-15T23:59:59",
    dataPagamento: "2025-04-14T15:20:10",
    status: "Pago",
    formaPagamento: "Transferência",
    categoria: "Consultoria",
    contrato: "CT-2025-042",
    notaFiscal: "NF-e 1234",
    observacoes: ""
  },
  {
    id: "rec-002",
    cliente: "Clínica Saúde Total",
    descricao: "Manutenção mensal - Sistema de Gestão",
    valor: 2800.00,
    dataEmissao: "2025-04-05T14:20:00",
    dataVencimento: "2025-05-05T23:59:59",
    dataPagamento: null,
    status: "Pendente",
    formaPagamento: "Boleto",
    categoria: "Manutenção",
    contrato: "CT-2024-156",
    notaFiscal: "NF-e 1235",
    observacoes: "Mensalidade recorrente"
  },
  {
    id: "rec-003",
    cliente: "Escritório Jurídico Silva & Associados",
    descricao: "Desenvolvimento de website institucional",
    valor: 12000.00,
    dataEmissao: "2025-03-15T09:45:00",
    dataVencimento: "2025-04-15T23:59:59",
    dataPagamento: "2025-04-10T11:32:45",
    status: "Pago",
    formaPagamento: "Pix",
    categoria: "Desenvolvimento",
    contrato: "CT-2025-038",
    notaFiscal: "NF-e 1230",
    observacoes: "Pagamento da primeira parcela"
  },
  {
    id: "rec-004",
    cliente: "Restaurante Sabor & Arte",
    descricao: "Implementação de sistema de delivery",
    valor: 5400.00,
    dataEmissao: "2025-04-02T16:10:00",
    dataVencimento: "2025-05-02T23:59:59",
    dataPagamento: null,
    status: "Pendente",
    formaPagamento: "Boleto",
    categoria: "Implementação",
    contrato: "CT-2025-043",
    notaFiscal: "NF-e 1236",
    observacoes: ""
  },
  {
    id: "rec-005",
    cliente: "Academia Corpo em Forma",
    descricao: "Suporte técnico - Abril/2025",
    valor: 1200.00,
    dataEmissao: "2025-04-01T08:30:00",
    dataVencimento: "2025-04-10T23:59:59",
    dataPagamento: null,
    status: "Atrasado",
    formaPagamento: "Boleto",
    categoria: "Suporte",
    contrato: "CT-2024-089",
    notaFiscal: "NF-e 1237",
    observacoes: "Cliente solicitou prazo adicional"
  },
  {
    id: "rec-006",
    cliente: "Supermercados Estrela",
    descricao: "Consultoria em segurança de dados",
    valor: 8500.00,
    dataEmissao: "2025-03-25T13:15:00",
    dataVencimento: "2025-04-25T23:59:59",
    dataPagamento: "2025-04-20T14:22:38",
    status: "Pago",
    formaPagamento: "Transferência",
    categoria: "Consultoria",
    contrato: "CT-2025-040",
    notaFiscal: "NF-e 1232",
    observacoes: ""
  },
  {
    id: "rec-007",
    cliente: "Escola Futuro Brilhante",
    descricao: "Treinamento para equipe de professores",
    valor: 3600.00,
    dataEmissao: "2025-04-03T10:00:00",
    dataVencimento: "2025-05-03T23:59:59",
    dataPagamento: null,
    status: "Pendente",
    formaPagamento: "Boleto",
    categoria: "Treinamento",
    contrato: "CT-2025-044",
    notaFiscal: "NF-e 1238",
    observacoes: ""
  }
];

const MOCK_DESPESAS = [
  {
    id: "desp-001",
    descricao: "Aluguel do escritório - Abril/2025",
    valor: 3200.00,
    dataEmissao: "2025-04-01T00:00:00",
    dataVencimento: "2025-04-05T23:59:59",
    dataPagamento: "2025-04-05T10:15:22",
    status: "Pago",
    formaPagamento: "Transferência",
    categoria: "Infraestrutura",
    fornecedor: "Imobiliária Central",
    comprovante: "Recibo 4528",
    recorrente: true,
    observacoes: ""
  },
  {
    id: "desp-002",
    descricao: "Internet empresarial - Abril/2025",
    valor: 450.00,
    dataEmissao: "2025-04-02T00:00:00",
    dataVencimento: "2025-04-10T23:59:59",
    dataPagamento: "2025-04-10T16:30:45",
    status: "Pago",
    formaPagamento: "Débito Automático",
    categoria: "Infraestrutura",
    fornecedor: "NetSpeed Telecom",
    comprovante: "Fatura 87652",
    recorrente: true,
    observacoes: ""
  },
  {
    id: "desp-003",
    descricao: "Licenças de software - Adobe Creative Cloud",
    valor: 890.00,
    dataEmissao: "2025-04-03T00:00:00",
    dataVencimento: "2025-04-15T23:59:59",
    dataPagamento: null,
    status: "Pendente",
    formaPagamento: "Cartão de Crédito",
    categoria: "Software",
    fornecedor: "Adobe Inc.",
    comprovante: "Fatura 123456",
    recorrente: true,
    observacoes: "Licenças para equipe de design"
  },
  {
    id: "desp-004",
    descricao: "Energia elétrica - Abril/2025",
    valor: 720.00,
    dataEmissao: "2025-04-05T00:00:00",
    dataVencimento: "2025-04-20T23:59:59",
    dataPagamento: null,
    status: "Pendente",
    formaPagamento: "Boleto",
    categoria: "Infraestrutura",
    fornecedor: "Energia SA",
    comprovante: "Fatura 87542",
    recorrente: true,
    observacoes: ""
  },
  {
    id: "desp-005",
    descricao: "Serviços de contabilidade - Abril/2025",
    valor: 1200.00,
    dataEmissao: "2025-04-01T00:00:00",
    dataVencimento: "2025-04-10T23:59:59",
    dataPagamento: "2025-04-08T14:22:10",
    status: "Pago",
    formaPagamento: "Pix",
    categoria: "Serviços",
    fornecedor: "Contábil Express",
    comprovante: "NF 5421",
    recorrente: true,
    observacoes: ""
  },
  {
    id: "desp-006",
    descricao: "Material de escritório",
    valor: 350.00,
    dataEmissao: "2025-04-08T00:00:00",
    dataVencimento: "2025-04-08T23:59:59",
    dataPagamento: "2025-04-08T15:45:30",
    status: "Pago",
    formaPagamento: "Cartão de Débito",
    categoria: "Material",
    fornecedor: "Papelaria Central",
    comprovante: "NF 12458",
    recorrente: false,
    observacoes: ""
  },
  {
    id: "desp-007",
    descricao: "Servidor na nuvem - AWS",
    valor: 1850.00,
    dataEmissao: "2025-04-02T00:00:00",
    dataVencimento: "2025-04-15T23:59:59",
    dataPagamento: "2025-04-15T00:00:00",
    status: "Pago",
    formaPagamento: "Cartão de Crédito",
    categoria: "Infraestrutura",
    fornecedor: "Amazon Web Services",
    comprovante: "Fatura AWS-87542",
    recorrente: true,
    observacoes: "Serviços de hospedagem para clientes"
  },
  {
    id: "desp-008",
    descricao: "Manutenção de ar-condicionado",
    valor: 480.00,
    dataEmissao: "2025-04-10T00:00:00",
    dataVencimento: "2025-04-10T23:59:59",
    dataPagamento: "2025-04-10T17:20:15",
    status: "Pago",
    formaPagamento: "Pix",
    categoria: "Manutenção",
    fornecedor: "Clima Perfeito Ltda",
    comprovante: "NF 3254",
    recorrente: false,
    observacoes: "Manutenção preventiva semestral"
  }
];

const MOCK_IMPOSTOS = [
  {
    id: "imp-001",
    tipo: "ISS",
    descricao: "Imposto Sobre Serviços - Março/2025",
    valor: 1875.00,
    dataEmissao: "2025-04-01T00:00:00",
    dataVencimento: "2025-04-15T23:59:59",
    dataPagamento: "2025-04-14T11:30:22",
    status: "Pago",
    formaPagamento: "Transferência",
    aliquota: "5%",
    baseCalculo: 37500.00,
    documento: "Guia ISS-2025-03",
    observacoes: ""
  },
  {
    id: "imp-002",
    tipo: "PIS",
    descricao: "Programa de Integração Social - Março/2025",
    valor: 243.75,
    dataEmissao: "2025-04-01T00:00:00",
    dataVencimento: "2025-04-20T23:59:59",
    dataPagamento: null,
    status: "Pendente",
    formaPagamento: "Boleto",
    aliquota: "0.65%",
    baseCalculo: 37500.00,
    documento: "DARF-PIS-2025-03",
    observacoes: ""
  },
  {
    id: "imp-003",
    tipo: "COFINS",
    descricao: "Contribuição para Financiamento da Seguridade Social - Março/2025",
    valor: 1125.00,
    dataEmissao: "2025-04-01T00:00:00",
    dataVencimento: "2025-04-20T23:59:59",
    dataPagamento: null,
    status: "Pendente",
    formaPagamento: "Boleto",
    aliquota: "3%",
    baseCalculo: 37500.00,
    documento: "DARF-COFINS-2025-03",
    observacoes: ""
  },
  {
    id: "imp-004",
    tipo: "IRPJ",
    descricao: "Imposto de Renda Pessoa Jurídica - 1º Trimestre/2025",
    valor: 3750.00,
    dataEmissao: "2025-04-01T00:00:00",
    dataVencimento: "2025-04-30T23:59:59",
    dataPagamento: null,
    status: "Pendente",
    formaPagamento: "Boleto",
    aliquota: "15%",
    baseCalculo: 25000.00,
    documento: "DARF-IRPJ-2025-1T",
    observacoes: "Lucro Presumido"
  },
  {
    id: "imp-005",
    tipo: "CSLL",
    descricao: "Contribuição Social sobre Lucro Líquido - 1º Trimestre/2025",
    valor: 2250.00,
    dataEmissao: "2025-04-01T00:00:00",
    dataVencimento: "2025-04-30T23:59:59",
    dataPagamento: null,
    status: "Pendente",
    formaPagamento: "Boleto",
    aliquota: "9%",
    baseCalculo: 25000.00,
    documento: "DARF-CSLL-2025-1T",
    observacoes: "Lucro Presumido"
  }
];

const MOCK_CLIENTES = [
  {
    id: "cli-001",
    nome: "Empresa ABC Ltda",
    cnpj: "12.345.678/0001-90",
    endereco: "Av. Paulista, 1000, São Paulo - SP",
    contato: "João Silva",
    email: "joao.silva@empresaabc.com.br",
    telefone: "(11) 3456-7890",
    categoria: "Grande Empresa",
    contratoAtivo: true,
    valorContrato: 7500.00,
    inicioContrato: "2024-01-15",
    fimContrato: "2025-12-31",
    observacoes: "Cliente desde 2024"
  },
  {
    id: "cli-002",
    nome: "Clínica Saúde Total",
    cnpj: "23.456.789/0001-01",
    endereco: "Rua das Flores, 500, Belo Horizonte - MG",
    contato: "Maria Oliveira",
    email: "maria@clinicasaudetotal.com.br",
    telefone: "(31) 4567-8901",
    categoria: "Médio Porte",
    contratoAtivo: true,
    valorContrato: 2800.00,
    inicioContrato: "2024-03-01",
    fimContrato: "2026-02-28",
    observacoes: "Contrato de manutenção mensal"
  },
  {
    id: "cli-003",
    nome: "Escritório Jurídico Silva & Associados",
    cnpj: "34.567.890/0001-12",
    endereco: "Av. Rio Branco, 250, Rio de Janeiro - RJ",
    contato: "Carlos Mendes",
    email: "carlos@silvaadvogados.com.br",
    telefone: "(21) 5678-9012",
    categoria: "Médio Porte",
    contratoAtivo: true,
    valorContrato: 12000.00,
    inicioContrato: "2025-03-15",
    fimContrato: "2025-06-15",
    observacoes: "Projeto de website com prazo de 3 meses"
  },
  {
    id: "cli-004",
    nome: "Restaurante Sabor & Arte",
    cnpj: "45.678.901/0001-23",
    endereco: "Rua Augusta, 800, São Paulo - SP",
    contato: "Ana Souza",
    email: "ana@saborearte.com.br",
    telefone: "(11) 6789-0123",
    categoria: "Pequeno Porte",
    contratoAtivo: true,
    valorContrato: 5400.00,
    inicioContrato: "2025-04-02",
    fimContrato: "2025-07-02",
    observacoes: "Implementação de sistema de delivery"
  },
  {
    id: "cli-005",
    nome: "Academia Corpo em Forma",
    cnpj: "56.789.012/0001-34",
    endereco: "Av. Rebouças, 500, São Paulo - SP",
    contato: "Fernando Almeida",
    email: "fernando@corpoemforma.com.br",
    telefone: "(11) 7890-1234",
    categoria: "Pequeno Porte",
    contratoAtivo: true,
    valorContrato: 1200.00,
    inicioContrato: "2024-08-01",
    fimContrato: "2025-07-31",
    observacoes: "Contrato de suporte técnico anual"
  }
];

const MOCK_FORNECEDORES = [
  {
    id: "forn-001",
    nome: "Imobiliária Central",
    cnpj: "12.345.678/0001-90",
    endereco: "Av. Paulista, 1500, São Paulo - SP",
    contato: "Roberto Santos",
    email: "roberto@imobiliariacentral.com.br",
    telefone: "(11) 2345-6789",
    categoria: "Infraestrutura",
    observacoes: "Locação do escritório"
  },
  {
    id: "forn-002",
    nome: "NetSpeed Telecom",
    cnpj: "23.456.789/0001-01",
    endereco: "Rua Augusta, 1000, São Paulo - SP",
    contato: "Carla Oliveira",
    email: "carla@netspeed.com.br",
    telefone: "(11) 3456-7890",
    categoria: "Infraestrutura",
    observacoes: "Provedor de internet empresarial"
  },
  {
    id: "forn-003",
    nome: "Adobe Inc.",
    cnpj: "34.567.890/0001-12",
    endereco: "Internacional",
    contato: "Suporte Adobe",
    email: "suporte@adobe.com",
    telefone: "+1 800-833-6687",
    categoria: "Software",
    observacoes: "Licenças de software para design"
  },
  {
    id: "forn-004",
    nome: "Contábil Express",
    cnpj: "45.678.901/0001-23",
    endereco: "Av. Brigadeiro Faria Lima, 1500, São Paulo - SP",
    contato: "Marcos Pereira",
    email: "marcos@contabilexpress.com.br",
    telefone: "(11) 4567-8901",
    categoria: "Serviços",
    observacoes: "Serviços de contabilidade mensal"
  },
  {
    id: "forn-005",
    nome: "Amazon Web Services",
    cnpj: "56.789.012/0001-34",
    endereco: "Internacional",
    contato: "Suporte AWS",
    email: "suporte@aws.amazon.com",
    telefone: "+1 206-266-7010",
    categoria: "Infraestrutura",
    observacoes: "Serviços de nuvem"
  }
];

const MOCK_CONTAS_BANCARIAS = [
  {
    id: "conta-001",
    banco: "Banco do Brasil",
    agencia: "1234",
    conta: "56789-0",
    tipo: "Corrente",
    saldoAtual: 42500.75,
    ultimaAtualizacao: "2025-04-15T18:30:00"
  },
  {
    id: "conta-002",
    banco: "Nubank",
    agencia: "0001",
    conta: "12345678-9",
    tipo: "Corrente",
    saldoAtual: 18750.42,
    ultimaAtualizacao: "2025-04-15T18:30:00"
  },
  {
    id: "conta-003",
    banco: "Caixa Econômica Federal",
    agencia: "4321",
    conta: "987654-3",
    tipo: "Poupança",
    saldoAtual: 35000.00,
    ultimaAtualizacao: "2025-04-15T18:30:00"
  }
];

// Componente principal
export default function GestaoFinanceira() {
  // Estados
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [impostos, setImpostos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [contasBancarias, setContasBancarias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [ordenacao, setOrdenacao] = useState("data_desc");
  const [showNovaReceitaModal, setShowNovaReceitaModal] = useState(false);
  const [showNovaDespesaModal, setShowNovaDespesaModal] = useState(false);
  const [showNovoImpostoModal, setShowNovoImpostoModal] = useState(false);
  const [novaReceita, setNovaReceita] = useState({
    cliente: "",
    descricao: "",
    valor: "",
    dataEmissao: "",
    dataVencimento: "",
    categoria: "",
    formaPagamento: "Transferência",
    notaFiscal: "",
    observacoes: ""
  });
  const [novaDespesa, setNovaDespesa] = useState({
    descricao: "",
    valor: "",
    dataEmissao: "",
    dataVencimento: "",
    categoria: "",
    fornecedor: "",
    formaPagamento: "Transferência",
    recorrente: false,
    observacoes: ""
  });
  const [novoImposto, setNovoImposto] = useState({
    tipo: "",
    descricao: "",
    valor: "",
    dataEmissao: "",
    dataVencimento: "",
    aliquota: "",
    baseCalculo: "",
    documento: "",
    observacoes: ""
  });
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [tipoItemSelecionado, setTipoItemSelecionado] = useState("");

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulando chamada de API
        setTimeout(() => {
          setReceitas(MOCK_RECEITAS);
          setDespesas(MOCK_DESPESAS);
          setImpostos(MOCK_IMPOSTOS);
          setClientes(MOCK_CLIENTES);
          setFornecedores(MOCK_FORNECEDORES);
          setContasBancarias(MOCK_CONTAS_BANCARIAS);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Funções auxiliares
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

  const calcularTotalReceitas = (periodo = "todos") => {
    if (receitas.length === 0) return 0;
    
    let total = 0;
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    
    receitas.forEach(receita => {
      const dataReceita = new Date(receita.dataEmissao);
      
      if (
        (periodo === "todos") ||
        (periodo === "mes" && dataReceita >= inicioMes) ||
        (periodo === "ano" && dataReceita >= inicioAno)
      ) {
        if (receita.status === "Pago") {
          total += receita.valor;
        }
      }
    });
    
    return total;
  };

  const calcularTotalDespesas = (periodo = "todos") => {
    if (despesas.length === 0) return 0;
    
    let total = 0;
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    
    despesas.forEach(despesa => {
      const dataDespesa = new Date(despesa.dataEmissao);
      
      if (
        (periodo === "todos") ||
        (periodo === "mes" && dataDespesa >= inicioMes) ||
        (periodo === "ano" && dataDespesa >= inicioAno)
      ) {
        if (despesa.status === "Pago") {
          total += despesa.valor;
        }
      }
    });
    
    return total;
  };

  const calcularTotalImpostos = (periodo = "todos") => {
    if (impostos.length === 0) return 0;
    
    let total = 0;
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    
    impostos.forEach(imposto => {
      const dataImposto = new Date(imposto.dataEmissao);
      
      if (
        (periodo === "todos") ||
        (periodo === "mes" && dataImposto >= inicioMes) ||
        (periodo === "ano" && dataImposto >= inicioAno)
      ) {
        if (imposto.status === "Pago") {
          total += imposto.valor;
        }
      }
    });
    
    return total;
  };

  const calcularLucroLiquido = (periodo = "todos") => {
    const totalReceitas = calcularTotalReceitas(periodo);
    const totalDespesas = calcularTotalDespesas(periodo);
    const totalImpostos = calcularTotalImpostos(periodo);
    
    return totalReceitas - totalDespesas - totalImpostos;
  };

  const calcularTotalPendente = () => {
    let total = 0;
    
    receitas.forEach(receita => {
      if (receita.status === "Pendente" || receita.status === "Atrasado") {
        total += receita.valor;
      }
    });
    
    return total;
  };

  const calcularTotalAPagar = () => {
    let total = 0;
    
    despesas.forEach(despesa => {
      if (despesa.status === "Pendente" || despesa.status === "Atrasado") {
        total += despesa.valor;
      }
    });
    
    impostos.forEach(imposto => {
      if (imposto.status === "Pendente" || imposto.status === "Atrasado") {
        total += imposto.valor;
      }
    });
    
    return total;
  };

  const calcularSaldoTotal = () => {
    let total = 0;
    
    contasBancarias.forEach(conta => {
      total += conta.saldoAtual;
    });
    
    return total;
  };

  const filtrarReceitas = () => {
    let receitasFiltradas = [...receitas];
    
    // Filtro por status
    if (filtroStatus !== "Todos") {
      receitasFiltradas = receitasFiltradas.filter(receita => receita.status === filtroStatus);
    }
    
    // Filtro por categoria
    if (filtroCategoria !== "Todas") {
      receitasFiltradas = receitasFiltradas.filter(receita => receita.categoria === filtroCategoria);
    }
    
        // Ordenação
    if (ordenacao === "data_desc") {
      receitasFiltradas.sort((a, b) => new Date(b.dataEmissao) - new Date(a.dataEmissao));
    } else if (ordenacao === "data_asc") {
      receitasFiltradas.sort((a, b) => new Date(a.dataEmissao) - new Date(b.dataEmissao));
    } else if (ordenacao === "valor_desc") {
      receitasFiltradas.sort((a, b) => b.valor - a.valor);
    } else if (ordenacao === "valor_asc") {
      receitasFiltradas.sort((a, b) => a.valor - b.valor);
    }
    
    return receitasFiltradas;
  };

  const filtrarDespesas = () => {
    let despesasFiltradas = [...despesas];
    
    // Filtro por status
    if (filtroStatus !== "Todos") {
      despesasFiltradas = despesasFiltradas.filter(despesa => despesa.status === filtroStatus);
    }
    
    // Filtro por categoria
    if (filtroCategoria !== "Todas") {
      despesasFiltradas = despesasFiltradas.filter(despesa => despesa.categoria === filtroCategoria);
    }
    
    // Ordenação
    if (ordenacao === "data_desc") {
      despesasFiltradas.sort((a, b) => new Date(b.dataEmissao) - new Date(a.dataEmissao));
    } else if (ordenacao === "data_asc") {
      despesasFiltradas.sort((a, b) => new Date(a.dataEmissao) - new Date(a.dataEmissao));
    } else if (ordenacao === "valor_desc") {
      despesasFiltradas.sort((a, b) => b.valor - a.valor);
    } else if (ordenacao === "valor_asc") {
      despesasFiltradas.sort((a, b) => a.valor - b.valor);
    }
    
    return despesasFiltradas;
  };

  const filtrarImpostos = () => {
    let impostosFiltrados = [...impostos];
    
    // Filtro por status
    if (filtroStatus !== "Todos") {
      impostosFiltrados = impostosFiltrados.filter(imposto => imposto.status === filtroStatus);
    }
    
    // Ordenação
    if (ordenacao === "data_desc") {
      impostosFiltrados.sort((a, b) => new Date(b.dataEmissao) - new Date(a.dataEmissao));
    } else if (ordenacao === "data_asc") {
      impostosFiltrados.sort((a, b) => new Date(a.dataEmissao) - new Date(a.dataEmissao));
    } else if (ordenacao === "valor_desc") {
      impostosFiltrados.sort((a, b) => b.valor - a.valor);
    } else if (ordenacao === "valor_asc") {
      impostosFiltrados.sort((a, b) => a.valor - b.valor);
    }
    
    return impostosFiltrados;
  };

  const adicionarNovaReceita = () => {
    if (!novaReceita.cliente || !novaReceita.descricao || !novaReceita.valor || !novaReceita.dataEmissao || !novaReceita.dataVencimento) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    const novaReceitaObj = {
      id: `rec-${Date.now()}`,
      cliente: novaReceita.cliente,
      descricao: novaReceita.descricao,
      valor: parseFloat(novaReceita.valor),
      dataEmissao: new Date(novaReceita.dataEmissao).toISOString(),
      dataVencimento: new Date(novaReceita.dataVencimento).toISOString(),
      dataPagamento: null,
      status: "Pendente",
      formaPagamento: novaReceita.formaPagamento,
      categoria: novaReceita.categoria,
      contrato: "",
      notaFiscal: novaReceita.notaFiscal,
      observacoes: novaReceita.observacoes
    };
    
    setReceitas([novaReceitaObj, ...receitas]);
    setShowNovaReceitaModal(false);
    setNovaReceita({
      cliente: "",
      descricao: "",
      valor: "",
      dataEmissao: "",
      dataVencimento: "",
      categoria: "",
      formaPagamento: "Transferência",
      notaFiscal: "",
      observacoes: ""
    });
  };

  const adicionarNovaDespesa = () => {
    if (!novaDespesa.descricao || !novaDespesa.valor || !novaDespesa.dataEmissao || !novaDespesa.dataVencimento || !novaDespesa.categoria) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    const novaDespesaObj = {
      id: `desp-${Date.now()}`,
      descricao: novaDespesa.descricao,
      valor: parseFloat(novaDespesa.valor),
      dataEmissao: new Date(novaDespesa.dataEmissao).toISOString(),
      dataVencimento: new Date(novaDespesa.dataVencimento).toISOString(),
      dataPagamento: null,
      status: "Pendente",
      formaPagamento: novaDespesa.formaPagamento,
      categoria: novaDespesa.categoria,
      fornecedor: novaDespesa.fornecedor,
      comprovante: "",
      recorrente: novaDespesa.recorrente,
      observacoes: novaDespesa.observacoes
    };
    
    setDespesas([novaDespesaObj, ...despesas]);
    setShowNovaDespesaModal(false);
    setNovaDespesa({
      descricao: "",
      valor: "",
      dataEmissao: "",
      dataVencimento: "",
      categoria: "",
      fornecedor: "",
      formaPagamento: "Transferência",
      recorrente: false,
      observacoes: ""
    });
  };

  const adicionarNovoImposto = () => {
    if (!novoImposto.tipo || !novoImposto.descricao || !novoImposto.valor || !novoImposto.dataEmissao || !novoImposto.dataVencimento) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    const novoImpostoObj = {
      id: `imp-${Date.now()}`,
      tipo: novoImposto.tipo,
      descricao: novoImposto.descricao,
      valor: parseFloat(novoImposto.valor),
      dataEmissao: new Date(novoImposto.dataEmissao).toISOString(),
      dataVencimento: new Date(novoImposto.dataVencimento).toISOString(),
      dataPagamento: null,
      status: "Pendente",
      formaPagamento: "Boleto",
      aliquota: novoImposto.aliquota,
      baseCalculo: parseFloat(novoImposto.baseCalculo),
      documento: novoImposto.documento,
      observacoes: novoImposto.observacoes
    };
    
    setImpostos([novoImpostoObj, ...impostos]);
    setShowNovoImpostoModal(false);
    setNovoImposto({
      tipo: "",
      descricao: "",
      valor: "",
      dataEmissao: "",
      dataVencimento: "",
      aliquota: "",
      baseCalculo: "",
      documento: "",
      observacoes: ""
    });
  };

  const marcarComoPago = (id, tipo) => {
    const dataAtual = new Date().toISOString();
    
    if (tipo === "receita") {
      const novasReceitas = receitas.map(receita => {
        if (receita.id === id) {
          return {
            ...receita,
            status: "Pago",
            dataPagamento: dataAtual
          };
        }
        return receita;
      });
      setReceitas(novasReceitas);
    } else if (tipo === "despesa") {
      const novasDespesas = despesas.map(despesa => {
        if (despesa.id === id) {
          return {
            ...despesa,
            status: "Pago",
            dataPagamento: dataAtual
          };
        }
        return despesa;
      });
      setDespesas(novasDespesas);
    } else if (tipo === "imposto") {
      const novosImpostos = impostos.map(imposto => {
        if (imposto.id === id) {
          return {
            ...imposto,
            status: "Pago",
            dataPagamento: dataAtual
          };
        }
        return imposto;
      });
      setImpostos(novosImpostos);
    }
    
    setShowDetalhesModal(false);
  };

  const verDetalhes = (item, tipo) => {
    setItemSelecionado(item);
    setTipoItemSelecionado(tipo);
    setShowDetalhesModal(true);
  };

  // Obter categorias únicas
  const obterCategorias = () => {
    const categoriasReceitas = receitas.map(receita => receita.categoria);
    const categoriasDespesas = despesas.map(despesa => despesa.categoria);
    const todasCategorias = [...new Set([...categoriasReceitas, ...categoriasDespesas])];
    return todasCategorias.sort();
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
    statPositive: {
      color: "#11A561"
    },
    statNegative: {
      color: "#ef4444"
    },
    statNeutral: {
      color: "#2C30D5"
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
    filterBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      flexWrap: "wrap",
      gap: "16px"
    },
    filterGroup: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    filterLabel: {
      fontSize: "0.875rem",
      color: "#64748b"
    },
    select: {
      padding: "8px 12px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      fontSize: "0.875rem",
      color: "#0f172a",
      backgroundColor: "white"
    },
    card: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      marginBottom: "24px"
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
    tableContainer: {
      overflowX: "auto"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "0.875rem"
    },
    tableHeader: {
      textAlign: "left",
      padding: "12px 16px",
      borderBottom: "1px solid #e2e8f0",
      color: "#64748b",
      fontWeight: "600",
      backgroundColor: "#f8fafc"
    },
    tableRow: {
      borderBottom: "1px solid #e2e8f0",
      cursor: "pointer",
      transition: "background-color 0.2s"
    },
    tableRowHover: {
      backgroundColor: "#f1f5f9"
    },
    tableCell: {
      padding: "12px 16px",
      color: "#334155"
    },
    tableCellHighlight: {
      color: "#0f172a",
      fontWeight: "500"
    },
    statusBadge: {
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: "600"
    },
    statusPago: {
      backgroundColor: "#dcfce7",
      color: "#11A561"
    },
    statusPendente: {
      backgroundColor: "#e0f2fe",
      color: "#2C30D5"
    },
    statusAtrasado: {
      backgroundColor: "#fee2e2",
      color: "#ef4444"
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
    successButton: {
      backgroundColor: "#11A561",
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
    checkboxItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginTop: "8px"
    },
    checkbox: {
      width: "16px",
      height: "16px"
    },
    checkboxLabel: {
      fontSize: "0.875rem",
      color: "#334155"
    },
    detailsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      marginBottom: "20px"
    },
    detailsSection: {
      marginBottom: "16px"
    },
    detailsLabel: {
      fontSize: "0.75rem",
      color: "#64748b",
      marginBottom: "4px"
    },
    detailsValue: {
      fontSize: "0.875rem",
      color: "#0f172a",
      fontWeight: "500"
    },
    detailsDivider: {
      height: "1px",
      backgroundColor: "#e2e8f0",
      margin: "16px 0"
    },
    gridContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "24px"
    },
    contaBancaria: {
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "16px"
    },
    contaBancariaHeader: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "12px"
    },
    contaBancariaNome: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#0f172a"
    },
    contaBancariaTipo: {
      fontSize: "0.75rem",
      fontWeight: "600",
      padding: "2px 8px",
      borderRadius: "9999px",
      backgroundColor: "#e0f2fe",
      color: "#2C30D5"
    },
    contaBancariaInfo: {
      fontSize: "0.875rem",
      color: "#64748b",
      marginBottom: "12px"
    },
    contaBancariaSaldo: {
      fontSize: "1.25rem",
      fontWeight: "700",
      color: "#11A561"
    },
    contaBancariaAtualizacao: {
      fontSize: "0.75rem",
      color: "#64748b",
      marginTop: "4px"
    },
    emptyState: {
      padding: "48px 24px",
      textAlign: "center",
      color: "#64748b"
    },
    emptyStateIcon: {
      fontSize: "3rem",
      marginBottom: "16px",
      color: "#cbd5e1"
    },
    emptyStateText: {
      fontSize: "1rem",
      marginBottom: "24px"
    },
    periodoSelector: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "24px"
    },
    periodoButton: {
      padding: "6px 12px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      fontSize: "0.875rem",
      fontWeight: "500",
      backgroundColor: "white",
      color: "#64748b",
      cursor: "pointer"
    },
    periodoButtonActive: {
      backgroundColor: "#2C30D5",
      color: "white",
      borderColor: "#2C30D5"
    },
    relatorioCard: {
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "16px"
    },
    relatorioHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px"
    },
    relatorioTitulo: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#0f172a"
    },
    relatorioData: {
      fontSize: "0.875rem",
      color: "#64748b"
    },
    relatorioGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "16px",
      marginBottom: "16px"
    },
    relatorioItem: {
      textAlign: "center"
    },
    relatorioValor: {
      fontSize: "1.25rem",
      fontWeight: "700",
      marginBottom: "4px"
    },
    relatorioLabel: {
      fontSize: "0.75rem",
      color: "#64748b"
    },
    relatorioDivider: {
      height: "1px",
      backgroundColor: "#e2e8f0",
      margin: "16px 0"
    },
    relatorioFooter: {
      display: "flex",
      justifyContent: "flex-end"
    }
  };

  // Componente
  return (
    <div style={styles.container}>
      {/* Cabeçalho */}
      <header style={styles.header}>
        <h1 style={styles.pageTitle}>Gestão Financeira</h1>
        <p style={styles.pageSubtitle}>Controle completo das finanças do seu negócio</p>
      </header>

      {/* Seletor de período para o dashboard */}
      {activeTab === "dashboard" && (
        <div style={styles.periodoSelector}>
          <button 
            style={{
              ...styles.periodoButton,
              ...(periodoSelecionado === "mes" ? styles.periodoButtonActive : {})
            }}
            onClick={() => setPeriodoSelecionado("mes")}
          >
            Mês Atual
          </button>
          <button 
            style={{
              ...styles.periodoButton,
              ...(periodoSelecionado === "ano" ? styles.periodoButtonActive : {})
            }}
            onClick={() => setPeriodoSelecionado("ano")}
          >
            Ano Atual
          </button>
          <button 
            style={{
              ...styles.periodoButton,
              ...(periodoSelecionado === "todos" ? styles.periodoButtonActive : {})
            }}
            onClick={() => setPeriodoSelecionado("todos")}
          >
            Todo Período
          </button>
        </div>
      )}

      {/* Cards de estatísticas */}
      {activeTab === "dashboard" && (
        <div style={styles.statsContainer}>
          <motion.div 
            style={styles.statCard}
            whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{...styles.statValue, ...styles.statPositive}}>
              {formatarMoeda(calcularTotalReceitas(periodoSelecionado))}
            </div>
            <div style={styles.statLabel}>Receitas</div>
          </motion.div>

          <motion.div 
            style={styles.statCard}
            whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div style={{...styles.statValue, ...styles.statNegative}}>
              {formatarMoeda(calcularTotalDespesas(periodoSelecionado) + calcularTotalImpostos(periodoSelecionado))}
            </div>
            <div style={styles.statLabel}>Despesas + Impostos</div>
          </motion.div>

          <motion.div 
            style={styles.statCard}
            whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div style={{
              ...styles.statValue, 
              ...(calcularLucroLiquido(periodoSelecionado) >= 0 ? styles.statPositive : styles.statNegative)
            }}>
              {formatarMoeda(calcularLucroLiquido(periodoSelecionado))}
            </div>
            <div style={styles.statLabel}>Lucro Líquido</div>
          </motion.div>

          <motion.div 
            style={styles.statCard}
            whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div style={{...styles.statValue, ...styles.statNeutral}}>
              {formatarMoeda(calcularSaldoTotal())}
            </div>
            <div style={styles.statLabel}>Saldo em Contas</div>
          </motion.div>
        </div>
      )}

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
            ...(activeTab === "receitas" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("receitas")}
        >
          Receitas
          {activeTab === "receitas" && <div style={styles.activeTabIndicator}></div>}
        </button>
        
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "despesas" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("despesas")}
        >
          Despesas
          {activeTab === "despesas" && <div style={styles.activeTabIndicator}></div>}
        </button>
        
        <button 
                    style={{
            ...styles.tab,
            ...(activeTab === "impostos" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("impostos")}
        >
          Impostos
          {activeTab === "impostos" && <div style={styles.activeTabIndicator}></div>}
        </button>
        
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "contas" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("contas")}
        >
          Contas Bancárias
          {activeTab === "contas" && <div style={styles.activeTabIndicator}></div>}
        </button>
        
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "relatorios" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("relatorios")}
        >
          Relatórios
          {activeTab === "relatorios" && <div style={styles.activeTabIndicator}></div>}
        </button>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div style={styles.loadingState}>
          <div style={styles.loadingSpinner}></div>
          <p>Carregando dados financeiros...</p>
        </div>
      ) : activeTab === "dashboard" ? (
        <>
          {/* Contas Bancárias */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Contas Bancárias</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.gridContainer}>
                {contasBancarias.map(conta => (
                  <motion.div 
                    key={conta.id}
                    style={styles.contaBancaria}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={styles.contaBancariaHeader}>
                      <div style={styles.contaBancariaNome}>{conta.banco}</div>
                      <div style={styles.contaBancariaTipo}>{conta.tipo}</div>
                    </div>
                    <div style={styles.contaBancariaInfo}>
                      Agência: {conta.agencia} • Conta: {conta.conta}
                    </div>
                    <div style={styles.contaBancariaSaldo}>{formatarMoeda(conta.saldoAtual)}</div>
                    <div style={styles.contaBancariaAtualizacao}>
                      Atualizado em {formatarDataHora(conta.ultimaAtualizacao)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Próximos Pagamentos */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Próximos Pagamentos</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Descrição</th>
                      <th style={styles.tableHeader}>Tipo</th>
                      <th style={styles.tableHeader}>Valor</th>
                      <th style={styles.tableHeader}>Vencimento</th>
                      <th style={styles.tableHeader}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...despesas, ...impostos]
                      .filter(item => item.status === "Pendente" || item.status === "Atrasado")
                      .sort((a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento))
                      .slice(0, 5)
                      .map(item => (
                        <motion.tr 
                          key={item.id}
                          style={styles.tableRow}
                          whileHover={styles.tableRowHover}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => verDetalhes(item, item.tipo ? "imposto" : "despesa")}
                        >
                          <td style={{...styles.tableCell, ...styles.tableCellHighlight}}>{item.descricao}</td>
                          <td style={styles.tableCell}>{item.tipo || item.categoria}</td>
                          <td style={styles.tableCell}>{formatarMoeda(item.valor)}</td>
                          <td style={styles.tableCell}>{formatarData(item.dataVencimento)}</td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              ...(item.status === "Pago" ? styles.statusPago : 
                                 item.status === "Pendente" ? styles.statusPendente : 
                                 styles.statusAtrasado)
                            }}>
                              {item.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Próximos Recebimentos */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Próximos Recebimentos</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Cliente</th>
                      <th style={styles.tableHeader}>Descrição</th>
                      <th style={styles.tableHeader}>Valor</th>
                      <th style={styles.tableHeader}>Vencimento</th>
                      <th style={styles.tableHeader}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receitas
                      .filter(receita => receita.status === "Pendente" || receita.status === "Atrasado")
                      .sort((a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento))
                      .slice(0, 5)
                      .map(receita => (
                        <motion.tr 
                          key={receita.id}
                          style={styles.tableRow}
                          whileHover={styles.tableRowHover}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => verDetalhes(receita, "receita")}
                        >
                          <td style={{...styles.tableCell, ...styles.tableCellHighlight}}>{receita.cliente}</td>
                          <td style={styles.tableCell}>{receita.descricao}</td>
                          <td style={styles.tableCell}>{formatarMoeda(receita.valor)}</td>
                          <td style={styles.tableCell}>{formatarData(receita.dataVencimento)}</td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              ...(receita.status === "Pago" ? styles.statusPago : 
                                 receita.status === "Pendente" ? styles.statusPendente : 
                                 styles.statusAtrasado)
                            }}>
                              {receita.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Resumo Financeiro</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.gridContainer}>
                <div>
                  <h4 style={{fontSize: "1rem", fontWeight: "600", marginBottom: "16px"}}>A Receber</h4>
                  <div style={{...styles.statValue, ...styles.statPositive, fontSize: "1.25rem", marginBottom: "8px"}}>
                    {formatarMoeda(calcularTotalPendente())}
                  </div>
                  <p style={{fontSize: "0.875rem", color: "#64748b", marginBottom: "16px"}}>
                    Valor total a receber de clientes
                  </p>
                  
                  <div style={styles.detailsSection}>
                    <div style={styles.detailsLabel}>Pendentes</div>
                    <div style={styles.detailsValue}>
                      {receitas.filter(r => r.status === "Pendente").length} faturas
                    </div>
                  </div>
                  
                  <div style={styles.detailsSection}>
                    <div style={styles.detailsLabel}>Atrasados</div>
                    <div style={styles.detailsValue}>
                      {receitas.filter(r => r.status === "Atrasado").length} faturas
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 style={{fontSize: "1rem", fontWeight: "600", marginBottom: "16px"}}>A Pagar</h4>
                  <div style={{...styles.statValue, ...styles.statNegative, fontSize: "1.25rem", marginBottom: "8px"}}>
                    {formatarMoeda(calcularTotalAPagar())}
                  </div>
                  <p style={{fontSize: "0.875rem", color: "#64748b", marginBottom: "16px"}}>
                    Valor total a pagar (despesas e impostos)
                  </p>
                  
                  <div style={styles.detailsSection}>
                    <div style={styles.detailsLabel}>Despesas Pendentes</div>
                    <div style={styles.detailsValue}>
                      {despesas.filter(d => d.status === "Pendente" || d.status === "Atrasado").length} itens
                    </div>
                  </div>
                  
                  <div style={styles.detailsSection}>
                    <div style={styles.detailsLabel}>Impostos Pendentes</div>
                    <div style={styles.detailsValue}>
                      {impostos.filter(i => i.status === "Pendente" || i.status === "Atrasado").length} itens
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === "receitas" ? (
        <div>
          {/* Filtros e botões */}
          <div style={styles.filterBar}>
            <div style={styles.filterGroup}>
              <div style={styles.filterLabel}>Status:</div>
              <select 
                style={styles.select}
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="Todos">Todos</option>
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
                <option value="Atrasado">Atrasado</option>
              </select>
              
              <div style={styles.filterLabel}>Categoria:</div>
              <select 
                style={styles.select}
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <option value="Todas">Todas</option>
                {obterCategorias().map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
              
              <div style={styles.filterLabel}>Ordenar por:</div>
              <select 
                style={styles.select}
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
              >
                <option value="data_desc">Data (mais recente)</option>
                <option value="data_asc">Data (mais antiga)</option>
                <option value="valor_desc">Valor (maior)</option>
                <option value="valor_asc">Valor (menor)</option>
              </select>
            </div>
            
            <button 
              style={{...styles.button, ...styles.primaryButton}}
              onClick={() => setShowNovaReceitaModal(true)}
            >
              Nova Receita
            </button>
          </div>
          
          {/* Tabela de Receitas */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Receitas</h3>
            </div>
            <div style={styles.cardContent}>
              {filtrarReceitas().length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyStateIcon}>💰</div>
                  <p style={styles.emptyStateText}>
                    Nenhuma receita encontrada com os filtros selecionados.
                  </p>
                  <button 
                    style={{...styles.button, ...styles.primaryButton}}
                    onClick={() => setShowNovaReceitaModal(true)}
                  >
                    Registrar Nova Receita
                  </button>
                </div>
              ) : (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Cliente</th>
                        <th style={styles.tableHeader}>Descrição</th>
                        <th style={styles.tableHeader}>Valor</th>
                        <th style={styles.tableHeader}>Emissão</th>
                        <th style={styles.tableHeader}>Vencimento</th>
                        <th style={styles.tableHeader}>Categoria</th>
                        <th style={styles.tableHeader}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrarReceitas().map(receita => (
                        <motion.tr 
                          key={receita.id}
                          style={styles.tableRow}
                          whileHover={styles.tableRowHover}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => verDetalhes(receita, "receita")}
                        >
                          <td style={{...styles.tableCell, ...styles.tableCellHighlight}}>{receita.cliente}</td>
                          <td style={styles.tableCell}>{receita.descricao}</td>
                          <td style={styles.tableCell}>{formatarMoeda(receita.valor)}</td>
                          <td style={styles.tableCell}>{formatarData(receita.dataEmissao)}</td>
                          <td style={styles.tableCell}>{formatarData(receita.dataVencimento)}</td>
                          <td style={styles.tableCell}>{receita.categoria}</td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              ...(receita.status === "Pago" ? styles.statusPago : 
                                 receita.status === "Pendente" ? styles.statusPendente : 
                                 styles.statusAtrasado)
                            }}>
                              {receita.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "despesas" ? (
        <div>
          {/* Filtros e botões */}
          <div style={styles.filterBar}>
            <div style={styles.filterGroup}>
              <div style={styles.filterLabel}>Status:</div>
              <select 
                style={styles.select}
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="Todos">Todos</option>
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
                <option value="Atrasado">Atrasado</option>
              </select>
              
              <div style={styles.filterLabel}>Categoria:</div>
              <select 
                style={styles.select}
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <option value="Todas">Todas</option>
                {obterCategorias().map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
              
              <div style={styles.filterLabel}>Ordenar por:</div>
              <select 
                style={styles.select}
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
              >
                <option value="data_desc">Data (mais recente)</option>
                <option value="data_asc">Data (mais antiga)</option>
                <option value="valor_desc">Valor (maior)</option>
                <option value="valor_asc">Valor (menor)</option>
              </select>
            </div>
            
            <button 
              style={{...styles.button, ...styles.primaryButton}}
              onClick={() => setShowNovaDespesaModal(true)}
            >
              Nova Despesa
            </button>
          </div>
          
          {/* Tabela de Despesas */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Despesas</h3>
            </div>
            <div style={styles.cardContent}>
              {filtrarDespesas().length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyStateIcon}>💸</div>
                  <p style={styles.emptyStateText}>
                    Nenhuma despesa encontrada com os filtros selecionados.
                  </p>
                  <button 
                    style={{...styles.button, ...styles.primaryButton}}
                    onClick={() => setShowNovaDespesaModal(true)}
                  >
                    Registrar Nova Despesa
                  </button>
                </div>
              ) : (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Descrição</th>
                        <th style={styles.tableHeader}>Fornecedor</th>
                        <th style={styles.tableHeader}>Valor</th>
                        <th style={styles.tableHeader}>Emissão</th>
                        <th style={styles.tableHeader}>Vencimento</th>
                        <th style={styles.tableHeader}>Categoria</th>
                        <th style={styles.tableHeader}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrarDespesas().map(despesa => (
                        <motion.tr 
                          key={despesa.id}
                          style={styles.tableRow}
                          whileHover={styles.tableRowHover}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => verDetalhes(despesa, "despesa")}
                        >
                          <td style={{...styles.tableCell, ...styles.tableCellHighlight}}>{despesa.descricao}</td>
                          <td style={styles.tableCell}>{despesa.fornecedor}</td>
                          <td style={styles.tableCell}>{formatarMoeda(despesa.valor)}</td>
                          <td style={styles.tableCell}>{formatarData(despesa.dataEmissao)}</td>
                          <td style={styles.tableCell}>{formatarData(despesa.dataVencimento)}</td>
                          <td style={styles.tableCell}>{despesa.categoria}</td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              ...(despesa.status === "Pago" ? styles.statusPago : 
                                 despesa.status === "Pendente" ? styles.statusPendente : 
                                 styles.statusAtrasado)
                            }}>
                              {despesa.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "impostos" ? (
        <div>
          {/* Filtros e botões */}
          <div style={styles.filterBar}>
            <div style={styles.filterGroup}>
              <div style={styles.filterLabel}>Status:</div>
              <select 
                style={styles.select}
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="Todos">Todos</option>
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
                <option value="Atrasado">Atrasado</option>
              </select>
              
              <div style={styles.filterLabel}>Ordenar por:</div>
              <select 
                style={styles.select}
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
              >
                <option value="data_desc">Data (mais recente)</option>
                <option value="data_asc">Data (mais antiga)</option>
                <option value="valor_desc">Valor (maior)</option>
                <option value="valor_asc">Valor (menor)</option>
              </select>
            </div>
            
            <button 
              style={{...styles.button, ...styles.primaryButton}}
              onClick={() => setShowNovoImpostoModal(true)}
            >
              Novo Imposto
            </button>
          </div>
          
          {/* Tabela de Impostos */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Impostos</h3>
            </div>
            <div style={styles.cardContent}>
              {filtrarImpostos().length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyStateIcon}>📊</div>
                  <p style={styles.emptyStateText}>
                    Nenhum imposto encontrado com os filtros selecionados.
                  </p>
                  <button 
                    style={{...styles.button, ...styles.primaryButton}}
                    onClick={() => setShowNovoImpostoModal(true)}
                  >
                    Registrar Novo Imposto
                  </button>
                </div>
              ) : (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Tipo</th>
                        <th style={styles.tableHeader}>Descrição</th>
                        <th style={styles.tableHeader}>Valor</th>
                        <th style={styles.tableHeader}>Alíquota</th>
                        <th style={styles.tableHeader}>Base de Cálculo</th>
                        <th style={styles.tableHeader}>Vencimento</th>
                        <th style={styles.tableHeader}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrarImpostos().map(imposto => (
                        <motion.tr 
                          key={imposto.id}
                          style={styles.tableRow}
                          whileHover={styles.tableRowHover}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => verDetalhes(imposto, "imposto")}
                        >
                          <td style={{...styles.tableCell, ...styles.tableCellHighlight}}>{imposto.tipo}</td>
                          <td style={styles.tableCell}>{imposto.descricao}</td>
                          <td style={styles.tableCell}>{formatarMoeda(imposto.valor)}</td>
                          <td style={styles.tableCell}>{imposto.aliquota}</td>
                          <td style={styles.tableCell}>{formatarMoeda(imposto.baseCalculo)}</td>
                          <td style={styles.tableCell}>{formatarData(imposto.dataVencimento)}</td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              ...(imposto.status === "Pago" ? styles.statusPago : 
                                 imposto.status === "Pendente" ? styles.statusPendente : 
                                 styles.statusAtrasado)
                            }}>
                              {imposto.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "contas" ? (
        <div>
          {/* Contas Bancárias */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Contas Bancárias</h3>
              <button 
                style={{...styles.button, ...styles.outlineButton}}
              >
                Nova Conta
              </button>
            </div>
            <div style={styles.cardContent}>
              {contasBancarias.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyStateIcon}>🏦</div>
                  <p style={styles.emptyStateText}>
                    Nenhuma conta bancária cadastrada.
                  </p>
                  <button 
                    style={{...styles.button, ...styles.primaryButton}}
                  >
                    Adicionar Conta Bancária
                  </button>
                </div>
              ) : (
                <div>
                  {contasBancarias.map(conta => (
                    <motion.div 
                      key={conta.id}
                      style={{
                        ...styles.contaBancaria,
                        padding: "20px",
                        marginBottom: "20px"
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div style={styles.contaBancariaHeader}>
                        <div style={styles.contaBancariaNome}>{conta.banco}</div>
                        <div style={styles.contaBancariaTipo}>{conta.tipo}</div>
                      </div>
                      <div style={styles.detailsGrid}>
                        <div>
                          <div style={styles.detailsLabel}>Agência</div>
                          <div style={styles.detailsValue}>{conta.agencia}</div>
                        </div>
                        <div>
                          <div style={styles.detailsLabel}>Conta</div>
                          <div style={styles.detailsValue}>{conta.conta}</div>
                        </div>
                      </div>
                      <div style={styles.detailsDivider}></div>
                      <div style={styles.detailsGrid}>
                        <div>
                          <div style={styles.detailsLabel}>Saldo Atual</div>
                          <div style={{
                            ...styles.detailsValue, 
                            fontSize: "1.25rem", 
                            fontWeight: "700",
                            color: conta.saldoAtual >= 0 ? "#11A561" : "#ef4444"
                          }}>
                            {formatarMoeda(conta.saldoAtual)}
                          </div>
                        </div>
                        <div>
                          <div style={styles.detailsLabel}>Última Atualização</div>
                          <div style={styles.detailsValue}>{formatarDataHora(conta.ultimaAtualizacao)}</div>
                        </div>
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: "16px",
                        gap: "8px"
                      }}>
                        <button style={{...styles.button, ...styles.outlineButton}}>
                          Extrato
                        </button>
                        <button style={{...styles.button, ...styles.outlineButton}}>
                          Atualizar Saldo
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "relatorios" ? (
        <div>
          {/* Seletor de período */}
          <div style={styles.periodoSelector}>
            <button 
              style={{
                ...styles.periodoButton,
                ...(periodoSelecionado === "mes" ? styles.periodoButtonActive : {})
              }}
              onClick={() => setPeriodoSelecionado("mes")}
            >
              Mês Atual
            </button>
            <button 
              style={{
                ...styles.periodoButton,
                ...(periodoSelecionado === "ano" ? styles.periodoButtonActive : {})
              }}
              onClick={() => setPeriodoSelecionado("ano")}
            >
              Ano Atual
            </button>
            <button 
              style={{
                                ...styles.periodoButton,
                ...(periodoSelecionado === "todos" ? styles.periodoButtonActive : {})
              }}
              onClick={() => setPeriodoSelecionado("todos")}
            >
              Todo Período
            </button>
          </div>
          
          {/* Relatório de Resultados */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Relatório de Resultados</h3>
              <button 
                style={{...styles.button, ...styles.outlineButton}}
              >
                Exportar PDF
              </button>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.relatorioCard}>
                <div style={styles.relatorioHeader}>
                  <div style={styles.relatorioTitulo}>Resumo Financeiro</div>
                  <div style={styles.relatorioData}>
                    {periodoSelecionado === "mes" ? "Mês Atual" : 
                     periodoSelecionado === "ano" ? "Ano Atual" : 
                     "Todo o Período"}
                  </div>
                </div>
                
                <div style={styles.relatorioGrid}>
                  <div style={styles.relatorioItem}>
                    <div style={{...styles.relatorioValor, color: "#11A561"}}>
                      {formatarMoeda(calcularTotalReceitas(periodoSelecionado))}
                    </div>
                    <div style={styles.relatorioLabel}>Receitas Totais</div>
                  </div>
                  
                  <div style={styles.relatorioItem}>
                    <div style={{...styles.relatorioValor, color: "#ef4444"}}>
                      {formatarMoeda(calcularTotalDespesas(periodoSelecionado))}
                    </div>
                    <div style={styles.relatorioLabel}>Despesas Totais</div>
                  </div>
                  
                  <div style={styles.relatorioItem}>
                    <div style={{...styles.relatorioValor, color: "#ef4444"}}>
                      {formatarMoeda(calcularTotalImpostos(periodoSelecionado))}
                    </div>
                    <div style={styles.relatorioLabel}>Impostos Totais</div>
                  </div>
                </div>
                
                <div style={styles.relatorioDivider}></div>
                
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <div style={{fontSize: "0.875rem", color: "#64748b", marginBottom: "4px"}}>
                      Resultado Líquido
                    </div>
                    <div style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: calcularLucroLiquido(periodoSelecionado) >= 0 ? "#11A561" : "#ef4444"
                    }}>
                      {formatarMoeda(calcularLucroLiquido(periodoSelecionado))}
                    </div>
                  </div>
                  
                  <div style={{
                    backgroundColor: calcularLucroLiquido(periodoSelecionado) >= 0 ? "#dcfce7" : "#fee2e2",
                    color: calcularLucroLiquido(periodoSelecionado) >= 0 ? "#11A561" : "#ef4444",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "0.875rem"
                  }}>
                    {calcularLucroLiquido(periodoSelecionado) >= 0 ? "Lucro" : "Prejuízo"}
                  </div>
                </div>
              </div>
              
              {/* Relatório por Categoria */}
              <div style={styles.relatorioCard}>
                <div style={styles.relatorioHeader}>
                  <div style={styles.relatorioTitulo}>Despesas por Categoria</div>
                </div>
                
                <div style={{marginBottom: "16px"}}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Categoria</th>
                        <th style={styles.tableHeader}>Valor</th>
                        <th style={styles.tableHeader}>% do Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {obterCategorias()
                        .filter(categoria => {
                          // Verificar se há despesas nesta categoria
                          const despesasCategoria = despesas.filter(d => d.categoria === categoria && d.status === "Pago");
                          return despesasCategoria.length > 0;
                        })
                        .map(categoria => {
                          const despesasCategoria = despesas.filter(d => d.categoria === categoria && d.status === "Pago");
                          const totalCategoria = despesasCategoria.reduce((sum, d) => sum + d.valor, 0);
                          const percentual = (totalCategoria / calcularTotalDespesas(periodoSelecionado)) * 100;
                          
                          return (
                            <tr key={categoria} style={styles.tableRow}>
                              <td style={{...styles.tableCell, ...styles.tableCellHighlight}}>{categoria}</td>
                              <td style={styles.tableCell}>{formatarMoeda(totalCategoria)}</td>
                              <td style={styles.tableCell}>{percentual.toFixed(2)}%</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Relatório de Impostos */}
              <div style={styles.relatorioCard}>
                <div style={styles.relatorioHeader}>
                  <div style={styles.relatorioTitulo}>Impostos Pagos</div>
                </div>
                
                <div style={{marginBottom: "16px"}}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Tipo</th>
                        <th style={styles.tableHeader}>Valor</th>
                        <th style={styles.tableHeader}>% do Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {impostos
                        .filter(imposto => imposto.status === "Pago")
                        .reduce((acc, imposto) => {
                          const existingType = acc.find(i => i.tipo === imposto.tipo);
                          if (existingType) {
                            existingType.valor += imposto.valor;
                          } else {
                            acc.push({
                              tipo: imposto.tipo,
                              valor: imposto.valor
                            });
                          }
                          return acc;
                        }, [])
                        .sort((a, b) => b.valor - a.valor)
                        .map(item => {
                          const percentual = (item.valor / calcularTotalImpostos(periodoSelecionado)) * 100;
                          
                          return (
                            <tr key={item.tipo} style={styles.tableRow}>
                              <td style={{...styles.tableCell, ...styles.tableCellHighlight}}>{item.tipo}</td>
                              <td style={styles.tableCell}>{formatarMoeda(item.valor)}</td>
                              <td style={styles.tableCell}>{percentual.toFixed(2)}%</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal de Nova Receita */}
      {showNovaReceitaModal && (
        <div style={styles.modal}>
          <motion.div 
            style={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nova Receita</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowNovaReceitaModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Cliente *</label>
                <select 
                  style={styles.input}
                  value={novaReceita.cliente}
                  onChange={(e) => setNovaReceita({...novaReceita, cliente: e.target.value})}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.nome}>{cliente.nome}</option>
                  ))}
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Descrição *</label>
                <input 
                  type="text"
                  style={styles.input}
                  value={novaReceita.descricao}
                  onChange={(e) => setNovaReceita({...novaReceita, descricao: e.target.value})}
                  placeholder="Ex: Consultoria em TI - Projeto ERP"
                  required
                />
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Valor (R$) *</label>
                  <input 
                    type="number"
                    style={styles.input}
                    value={novaReceita.valor}
                    onChange={(e) => setNovaReceita({...novaReceita, valor: e.target.value})}
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Categoria *</label>
                  <select 
                    style={styles.input}
                    value={novaReceita.categoria}
                    onChange={(e) => setNovaReceita({...novaReceita, categoria: e.target.value})}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Consultoria">Consultoria</option>
                    <option value="Desenvolvimento">Desenvolvimento</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Suporte">Suporte</option>
                    <option value="Treinamento">Treinamento</option>
                    <option value="Implementação">Implementação</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Data de Emissão *</label>
                  <input 
                    type="date"
                    style={styles.input}
                    value={novaReceita.dataEmissao}
                    onChange={(e) => setNovaReceita({...novaReceita, dataEmissao: e.target.value})}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Data de Vencimento *</label>
                  <input 
                    type="date"
                    style={styles.input}
                    value={novaReceita.dataVencimento}
                    onChange={(e) => setNovaReceita({...novaReceita, dataVencimento: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Forma de Pagamento</label>
                  <select 
                    style={styles.input}
                    value={novaReceita.formaPagamento}
                    onChange={(e) => setNovaReceita({...novaReceita, formaPagamento: e.target.value})}
                  >
                    <option value="Transferência">Transferência</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nota Fiscal</label>
                  <input 
                    type="text"
                    style={styles.input}
                    value={novaReceita.notaFiscal}
                    onChange={(e) => setNovaReceita({...novaReceita, notaFiscal: e.target.value})}
                    placeholder="Ex: NF-e 1234"
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Observações</label>
                <textarea 
                  style={styles.textarea}
                  value={novaReceita.observacoes}
                  onChange={(e) => setNovaReceita({...novaReceita, observacoes: e.target.value})}
                  placeholder="Informações adicionais sobre esta receita..."
                ></textarea>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.button, ...styles.outlineButton}}
                onClick={() => setShowNovaReceitaModal(false)}
              >
                Cancelar
              </button>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={adicionarNovaReceita}
              >
                Salvar Receita
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Nova Despesa */}
      {showNovaDespesaModal && (
        <div style={styles.modal}>
          <motion.div 
            style={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nova Despesa</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowNovaDespesaModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Descrição *</label>
                <input 
                  type="text"
                  style={styles.input}
                  value={novaDespesa.descricao}
                  onChange={(e) => setNovaDespesa({...novaDespesa, descricao: e.target.value})}
                  placeholder="Ex: Aluguel do escritório - Abril/2025"
                  required
                />
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Valor (R$) *</label>
                  <input 
                    type="number"
                    style={styles.input}
                    value={novaDespesa.valor}
                    onChange={(e) => setNovaDespesa({...novaDespesa, valor: e.target.value})}
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Categoria *</label>
                  <select 
                    style={styles.input}
                    value={novaDespesa.categoria}
                    onChange={(e) => setNovaDespesa({...novaDespesa, categoria: e.target.value})}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Infraestrutura">Infraestrutura</option>
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Material">Material</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Pessoal">Pessoal</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Data de Emissão *</label>
                  <input 
                    type="date"
                    style={styles.input}
                    value={novaDespesa.dataEmissao}
                    onChange={(e) => setNovaDespesa({...novaDespesa, dataEmissao: e.target.value})}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Data de Vencimento *</label>
                  <input 
                    type="date"
                    style={styles.input}
                    value={novaDespesa.dataVencimento}
                    onChange={(e) => setNovaDespesa({...novaDespesa, dataVencimento: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Fornecedor</label>
                  <select 
                    style={styles.input}
                    value={novaDespesa.fornecedor}
                    onChange={(e) => setNovaDespesa({...novaDespesa, fornecedor: e.target.value})}
                  >
                    <option value="">Selecione um fornecedor</option>
                    {fornecedores.map(fornecedor => (
                      <option key={fornecedor.id} value={fornecedor.nome}>{fornecedor.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Forma de Pagamento</label>
                  <select 
                    style={styles.input}
                    value={novaDespesa.formaPagamento}
                    onChange={(e) => setNovaDespesa({...novaDespesa, formaPagamento: e.target.value})}
                  >
                    <option value="Transferência">Transferência</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Débito Automático">Débito Automático</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
              </div>
              
              <div style={styles.checkboxItem}>
                <input 
                  type="checkbox" 
                  id="despesa-recorrente" 
                  style={styles.checkbox}
                  checked={novaDespesa.recorrente}
                  onChange={(e) => setNovaDespesa({...novaDespesa, recorrente: e.target.checked})}
                />
                <label style={styles.checkboxLabel} htmlFor="despesa-recorrente">
                  Despesa recorrente (mensal)
                </label>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Observações</label>
                <textarea 
                  style={styles.textarea}
                  value={novaDespesa.observacoes}
                  onChange={(e) => setNovaDespesa({...novaDespesa, observacoes: e.target.value})}
                  placeholder="Informações adicionais sobre esta despesa..."
                ></textarea>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.button, ...styles.outlineButton}}
                onClick={() => setShowNovaDespesaModal(false)}
              >
                Cancelar
              </button>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={adicionarNovaDespesa}
              >
                Salvar Despesa
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Novo Imposto */}
      {showNovoImpostoModal && (
        <div style={styles.modal}>
          <motion.div 
            style={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Novo Imposto</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowNovoImpostoModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tipo de Imposto *</label>
                  <select 
                    style={styles.input}
                    value={novoImposto.tipo}
                    onChange={(e) => setNovoImposto({...novoImposto, tipo: e.target.value})}
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="ISS">ISS</option>
                    <option value="PIS">PIS</option>
                    <option value="COFINS">COFINS</option>
                    <option value="IRPJ">IRPJ</option>
                    <option value="CSLL">CSLL</option>
                    <option value="INSS">INSS</option>
                    <option value="FGTS">FGTS</option>
                    <option value="ICMS">ICMS</option>
                    <option value="IPI">IPI</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Alíquota *</label>
                  <input 
                    type="text"
                    style={styles.input}
                    value={novoImposto.aliquota}
                    onChange={(e) => setNovoImposto({...novoImposto, aliquota: e.target.value})}
                    placeholder="Ex: 5%"
                    required
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Descrição *</label>
                <input 
                  type="text"
                  style={styles.input}
                  value={novoImposto.descricao}
                  onChange={(e) => setNovoImposto({...novoImposto, descricao: e.target.value})}
                  placeholder="Ex: Imposto Sobre Serviços - Março/2025"
                  required
                />
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Base de Cálculo (R$) *</label>
                  <input 
                    type="number"
                    style={styles.input}
                    value={novoImposto.baseCalculo}
                    onChange={(e) => setNovoImposto({...novoImposto, baseCalculo: e.target.value})}
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Valor a Pagar (R$) *</label>
                  <input 
                    type="number"
                    style={styles.input}
                    value={novoImposto.valor}
                    onChange={(e) => setNovoImposto({...novoImposto, valor: e.target.value})}
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Data de Emissão *</label>
                  <input 
                    type="date"
                    style={styles.input}
                    value={novoImposto.dataEmissao}
                    onChange={(e) => setNovoImposto({...novoImposto, dataEmissao: e.target.value})}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Data de Vencimento *</label>
                  <input 
                    type="date"
                    style={styles.input}
                    value={novoImposto.dataVencimento}
                    onChange={(e) => setNovoImposto({...novoImposto, dataVencimento: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Documento/Guia</label>
                <input 
                  type="text"
                  style={styles.input}
                  value={novoImposto.documento}
                  onChange={(e) => setNovoImposto({...novoImposto, documento: e.target.value})}
                  placeholder="Ex: DARF-PIS-2025-03"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Observações</label>
                <textarea 
                  style={styles.textarea}
                  value={novoImposto.observacoes}
                  onChange={(e) => setNovoImposto({...novoImposto, observacoes: e.target.value})}
                  placeholder="Informações adicionais sobre este imposto..."
                ></textarea>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.button, ...styles.outlineButton}}
                onClick={() => setShowNovoImpostoModal(false)}
              >
                Cancelar
              </button>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={adicionarNovoImposto}
              >
                Salvar Imposto
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetalhesModal && itemSelecionado && (
        <div style={styles.modal}>
          <motion.div 
            style={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {tipoItemSelecionado === "receita" ? "Detalhes da Receita" :
                 tipoItemSelecionado === "despesa" ? "Detalhes da Despesa" :
                 "Detalhes do Imposto"}
              </h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowDetalhesModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              {tipoItemSelecionado === "receita" && (
                <>
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Cliente</div>
                      <div style={styles.detailsValue}>{itemSelecionado.cliente}</div>
                    </div>
                    <div>
                      <div style={styles.detailsLabel}>Categoria</div>
                      <div style={styles.detailsValue}>{itemSelecionado.categoria}</div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsSection}>
                    <div style={styles.detailsLabel}>Descrição</div>
                    <div style={styles.detailsValue}>{itemSelecionado.descricao}</div>
                  </div>
                  
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Valor</div>
                      <div style={{...styles.detailsValue, color: "#11A561", fontWeight: "700"}}>
                        {formatarMoeda(itemSelecionado.valor)}
                      </div>
                    </div>
                    <div>
                      <div style={styles.detailsLabel}>Status</div>
                      <div>
                                                <span style={{
                          ...styles.statusBadge,
                          ...(itemSelecionado.status === "Pago" ? styles.statusPago : 
                             itemSelecionado.status === "Pendente" ? styles.statusPendente : 
                             styles.statusAtrasado)
                        }}>
                          {itemSelecionado.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsDivider}></div>
                  
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Data de Emissão</div>
                      <div style={styles.detailsValue}>{formatarData(itemSelecionado.dataEmissao)}</div>
                    </div>
                    <div>
                      <div style={styles.detailsLabel}>Data de Vencimento</div>
                      <div style={styles.detailsValue}>{formatarData(itemSelecionado.dataVencimento)}</div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Forma de Pagamento</div>
                      <div style={styles.detailsValue}>{itemSelecionado.formaPagamento}</div>
                    </div>
                    <div>
                      <div style={styles.detailsLabel}>Data de Pagamento</div>
                      <div style={styles.detailsValue}>
                        {itemSelecionado.dataPagamento ? formatarData(itemSelecionado.dataPagamento) : "-"}
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsDivider}></div>
                  
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Nota Fiscal</div>
                      <div style={styles.detailsValue}>{itemSelecionado.notaFiscal || "-"}</div>
                    </div>
                    <div>
                      <div style={styles.detailsLabel}>Contrato</div>
                      <div style={styles.detailsValue}>{itemSelecionado.contrato || "-"}</div>
                    </div>
                  </div>
                  
                  {itemSelecionado.observacoes && (
                    <div style={styles.detailsSection}>
                      <div style={styles.detailsLabel}>Observações</div>
                      <div style={styles.detailsValue}>{itemSelecionado.observacoes}</div>
                    </div>
                  )}
                </>
              )}
              
              {tipoItemSelecionado === "despesa" && (
                <>
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Fornecedor</div>
                      <div style={styles.detailsValue}>{itemSelecionado.fornecedor}</div>
                    </div>
                    <div>
                      <div style={styles.detailsLabel}>Categoria</div>
                      <div style={styles.detailsValue}>{itemSelecionado.categoria}</div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsSection}>
                    <div style={styles.detailsLabel}>Descrição</div>
                    <div style={styles.detailsValue}>{itemSelecionado.descricao}</div>
                  </div>
                  
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Valor</div>
                      <div style={{...styles.detailsValue, color: "#ef4444", fontWeight: "700"}}>
                        {formatarMoeda(itemSelecionado.valor)}
                      </div>
                    </div>
                    <div>
                      <div style={styles.detailsLabel}>Status</div>
                      <div>
                        <span style={{
                          ...styles.statusBadge,
                          ...(itemSelecionado.status === "Pago" ? styles.statusPago : 
                             itemSelecionado.status === "Pendente" ? styles.statusPendente : 
                             styles.statusAtrasado)
                        }}>
                          {itemSelecionado.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsDivider}></div>
                  
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Data de Emissão</div>
                      <div style={styles.detailsValue}>{formatarData(itemSelecionado.dataEmissao)}</div>
                    </div>
                    <div>
                      <div style={styles.detailsLabel}>Data de Vencimento</div>
                      <div style={styles.detailsValue}>{formatarData(itemSelecionado.dataVencimento)}</div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Forma de Pagamento</div>
                      <div style={styles.detailsValue}>{itemSelecionado.formaPagamento}</div>
                    </div>
                    <div>
                      <div style={styles.detailsLabel}>Data de Pagamento</div>
                      <div style={styles.detailsValue}>
                        {itemSelecionado.dataPagamento ? formatarData(itemSelecionado.dataPagamento) : "-"}
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsDivider}></div>
                  
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Comprovante</div>
                      <div style={styles.detailsValue}>{itemSelecionado.comprovante || "-"}</div>
                    </div>
                    <div>
                      <div style={styles.detailsLabel}>Recorrente</div>
                      <div style={styles.detailsValue}>{itemSelecionado.recorrente ? "Sim" : "Não"}</div>
                    </div>
                  </div>
                  
                  {itemSelecionado.observacoes && (
                    <div style={styles.detailsSection}>
                      <div style={styles.detailsLabel}>Observações</div>
                      <div style={styles.detailsValue}>{itemSelecionado.observacoes}</div>
                    </div>
                  )}
                </>
              )}
              
              {tipoItemSelecionado === "imposto" && (
                <>
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Tipo de Imposto</div>
                      <div style={styles.detailsValue}>{itemSelecionado.tipo}</div>
                    </div>
                    <div>
                      <div style={styles.detailsLabel}>Alíquota</div>
                      <div style={styles.detailsValue}>{itemSelecionado.aliquota}</div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsSection}>
                    <div style={styles.detailsLabel}>Descrição</div>
                    <div style={styles.detailsValue}>{itemSelecionado.descricao}</div>
                  </div>
                  
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Base de Cálculo</div>
                      <div style={styles.detailsValue}>{formatarMoeda(itemSelecionado.baseCalculo)}</div>
                    </div>
                    <div>
                      <div style={styles.detailsLabel}>Valor</div>
                      <div style={{...styles.detailsValue, color: "#ef4444", fontWeight: "700"}}>
                        {formatarMoeda(itemSelecionado.valor)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Status</div>
                      <div>
                        <span style={{
                          ...styles.statusBadge,
                          ...(itemSelecionado.status === "Pago" ? styles.statusPago : 
                             itemSelecionado.status === "Pendente" ? styles.statusPendente : 
                             styles.statusAtrasado)
                        }}>
                          {itemSelecionado.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsDivider}></div>
                  
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Data de Emissão</div>
                      <div style={styles.detailsValue}>{formatarData(itemSelecionado.dataEmissao)}</div>
                    </div>
                    <div>
                      <div style={styles.detailsLabel}>Data de Vencimento</div>
                      <div style={styles.detailsValue}>{formatarData(itemSelecionado.dataVencimento)}</div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsGrid}>
                    <div>
                      <div style={styles.detailsLabel}>Forma de Pagamento</div>
                      <div style={styles.detailsValue}>{itemSelecionado.formaPagamento}</div>
                    </div>
                    <div>
                      <div style={styles.detailsLabel}>Data de Pagamento</div>
                      <div style={styles.detailsValue}>
                        {itemSelecionado.dataPagamento ? formatarData(itemSelecionado.dataPagamento) : "-"}
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.detailsDivider}></div>
                  
                  <div style={styles.detailsSection}>
                    <div style={styles.detailsLabel}>Documento/Guia</div>
                    <div style={styles.detailsValue}>{itemSelecionado.documento || "-"}</div>
                  </div>
                  
                  {itemSelecionado.observacoes && (
                    <div style={styles.detailsSection}>
                      <div style={styles.detailsLabel}>Observações</div>
                      <div style={styles.detailsValue}>{itemSelecionado.observacoes}</div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.button, ...styles.outlineButton}}
                onClick={() => setShowDetalhesModal(false)}
              >
                Fechar
              </button>
              
              {itemSelecionado.status !== "Pago" && (
                <button 
                  style={{...styles.button, ...styles.successButton}}
                  onClick={() => marcarComoPago(
                    itemSelecionado.id, 
                    tipoItemSelecionado
                  )}
                >
                  Marcar como Pago
                </button>
              )}
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
