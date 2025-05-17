import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Dados mock para demonstração
const MOCK_ITEMS = [
  { 
    id: "1", 
    nome: "Cabo HDMI 2.0", 
    categoria: "Cabos", 
    quantidade: 23, 
    unidade: "un", 
    valorUnitario: 45.90, 
    fornecedor: "TechSupply", 
    ultimaCompra: "2025-04-02",
    localizacao: "Prateleira A3",
    status: "Disponível",
    reservado: 3,
    minimo: 5
  },
  { 
    id: "2", 
    nome: "Conector RJ45", 
    categoria: "Conectores", 
    quantidade: 145, 
    unidade: "un", 
    valorUnitario: 1.25, 
    fornecedor: "NetParts", 
    ultimaCompra: "2025-03-15",
    localizacao: "Gaveta B2",
    status: "Disponível",
    reservado: 0,
    minimo: 50
  },
  { 
    id: "3", 
    nome: "Pasta Térmica 5g", 
    categoria: "Refrigeração", 
    quantidade: 8, 
    unidade: "un", 
    valorUnitario: 15.50, 
    fornecedor: "TechSupply", 
    ultimaCompra: "2025-03-28",
    localizacao: "Armário C1",
    status: "Baixo Estoque",
    reservado: 2,
    minimo: 10
  },
  { 
    id: "4", 
    nome: "Fonte ATX 500W", 
    categoria: "Componentes", 
    quantidade: 12, 
    unidade: "un", 
    valorUnitario: 220.00, 
    fornecedor: "PowerTech", 
    ultimaCompra: "2025-03-10",
    localizacao: "Prateleira D4",
    status: "Disponível",
    reservado: 1,
    minimo: 3
  },
  { 
    id: "5", 
    nome: "Álcool Isopropílico 1L", 
    categoria: "Limpeza", 
    quantidade: 2, 
    unidade: "un", 
    valorUnitario: 35.90, 
    fornecedor: "CleanTech", 
    ultimaCompra: "2025-02-20",
    localizacao: "Armário E2",
    status: "Baixo Estoque",
    reservado: 0,
    minimo: 5
  },
  { 
    id: "6", 
    nome: "Kit Ferramentas Precisão", 
    categoria: "Ferramentas", 
    quantidade: 7, 
    unidade: "kit", 
    valorUnitario: 89.90, 
    fornecedor: "ToolMaster", 
    ultimaCompra: "2025-03-05",
    localizacao: "Gaveta F1",
    status: "Disponível",
    reservado: 2,
    minimo: 3
  },
  { 
    id: "7", 
    nome: "SSD 480GB", 
    categoria: "Componentes", 
    quantidade: 0, 
    unidade: "un", 
    valorUnitario: 349.90, 
    fornecedor: "StorageTech", 
    ultimaCompra: "2025-02-15",
    localizacao: "Prateleira A1",
    status: "Indisponível",
    reservado: 0,
    minimo: 5
  }
];

const MOCK_MOVIMENTACOES = [
  { 
    id: "1", 
    tipo: "Entrada", 
    data: "2025-04-02", 
    item: "Cabo HDMI 2.0", 
    quantidade: 10, 
    responsavel: "Carlos Silva", 
    observacao: "Compra mensal" 
  },
  { 
    id: "2", 
    tipo: "Saída", 
    data: "2025-04-05", 
    item: "Cabo HDMI 2.0", 
    quantidade: 2, 
    responsavel: "Ana Oliveira", 
    observacao: "OS #4532 - Cliente XYZ" 
  },
  { 
    id: "3", 
    tipo: "Saída", 
    data: "2025-04-05", 
    item: "Pasta Térmica 5g", 
    quantidade: 1, 
    responsavel: "Ana Oliveira", 
    observacao: "OS #4533 - Manutenção preventiva" 
  },
  { 
    id: "4", 
    tipo: "Entrada", 
    data: "2025-04-06", 
    item: "Conector RJ45", 
    quantidade: 100, 
    responsavel: "Carlos Silva", 
    observacao: "Reposição de estoque" 
  },
  { 
    id: "5", 
    tipo: "Saída", 
    data: "2025-04-07", 
    item: "Fonte ATX 500W", 
    quantidade: 1, 
    responsavel: "Rafael Mendes", 
    observacao: "OS #4540 - Substituição" 
  }
];

const MOCK_CATEGORIAS = [
  "Todas",
  "Cabos",
  "Conectores",
  "Refrigeração",
  "Componentes",
  "Limpeza",
  "Ferramentas"
];

// Componente principal
export default function Estoque() {
  // Estados
  const [items, setItems] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [ordenacao, setOrdenacao] = useState("nome_asc");
  const [activeTab, setActiveTab] = useState("itens");
  const [isLoading, setIsLoading] = useState(true);
  const [showMovimentacaoModal, setShowMovimentacaoModal] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState("entrada");
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [quantidadeMovimentacao, setQuantidadeMovimentacao] = useState(1);
  const [observacaoMovimentacao, setObservacaoMovimentacao] = useState("");
  const [showItemModal, setShowItemModal] = useState(false);
  const [novoItem, setNovoItem] = useState({
    nome: "",
    categoria: "",
    quantidade: 0,
    unidade: "un",
    valorUnitario: 0,
    fornecedor: "",
    localizacao: "",
    minimo: 0
  });

  // Estatísticas
  const totalItens = items.reduce((acc, item) => acc + item.quantidade, 0);
  const totalValorEstoque = items.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);
  const itensBaixoEstoque = items.filter(item => item.quantidade <= item.minimo).length;
  const itensIndisponiveis = items.filter(item => item.quantidade === 0).length;

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulando chamada de API
        setTimeout(() => {
          setItems(MOCK_ITEMS);
          setMovimentacoes(MOCK_MOVIMENTACOES);
          setCategorias(MOCK_CATEGORIAS);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar itens
  const filtrarItens = () => {
    return items.filter(item => {
      // Filtro de categoria
      if (filtroCategoria !== "Todas" && item.categoria !== filtroCategoria) {
        return false;
      }
      
      // Filtro de status
      if (filtroStatus === "Baixo Estoque" && item.status !== "Baixo Estoque") {
        return false;
      } else if (filtroStatus === "Indisponível" && item.status !== "Indisponível") {
        return false;
      } else if (filtroStatus === "Disponível" && item.status !== "Disponível") {
        return false;
      }
      
      // Filtro de busca
      if (filtroBusca && !item.nome.toLowerCase().includes(filtroBusca.toLowerCase()) && 
          !item.fornecedor.toLowerCase().includes(filtroBusca.toLowerCase()) &&
          !item.localizacao.toLowerCase().includes(filtroBusca.toLowerCase())) {
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
        case "qtd_asc":
          return a.quantidade - b.quantidade;
        case "qtd_desc":
          return b.quantidade - a.quantidade;
        case "valor_asc":
          return a.valorUnitario - b.valorUnitario;
        case "valor_desc":
          return b.valorUnitario - a.valorUnitario;
        default:
          return 0;
      }
    });
  };

  // Handlers
  const handleNovaMovimentacao = (tipo) => {
    setTipoMovimentacao(tipo);
    setShowMovimentacaoModal(true);
  };

  const handleSalvarMovimentacao = () => {
    if (!itemSelecionado || quantidadeMovimentacao <= 0) {
      alert("Selecione um item e informe uma quantidade válida.");
      return;
    }

    // Atualizar estoque
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemSelecionado) {
          const novaQuantidade = tipoMovimentacao === "entrada" 
            ? item.quantidade + quantidadeMovimentacao 
            : Math.max(0, item.quantidade - quantidadeMovimentacao);
          
          // Atualizar status com base na nova quantidade
          let novoStatus = "Disponível";
          if (novaQuantidade === 0) {
            novoStatus = "Indisponível";
          } else if (novaQuantidade <= item.minimo) {
            novoStatus = "Baixo Estoque";
          }
          
          return { ...item, quantidade: novaQuantidade, status: novoStatus };
        }
        return item;
      });
    });

    // Adicionar movimentação
    const itemInfo = items.find(item => item.id === itemSelecionado);
    const novaMovimentacao = {
      id: Date.now().toString(),
      tipo: tipoMovimentacao === "entrada" ? "Entrada" : "Saída",
      data: new Date().toISOString().split('T')[0],
      item: itemInfo?.nome || "Item não encontrado",
      quantidade: quantidadeMovimentacao,
      responsavel: "Usuário Atual", // Idealmente, pegar do contexto de autenticação
      observacao: observacaoMovimentacao
    };

    setMovimentacoes(prev => [novaMovimentacao, ...prev]);
    
    // Limpar e fechar modal
    setItemSelecionado(null);
    setQuantidadeMovimentacao(1);
    setObservacaoMovimentacao("");
    setShowMovimentacaoModal(false);
  };

  const handleNovoItem = () => {
    setShowItemModal(true);
  };

  const handleSalvarItem = () => {
    if (!novoItem.nome || !novoItem.categoria) {
      alert("Nome e categoria são obrigatórios.");
      return;
    }

    // Definir status com base na quantidade
    let status = "Disponível";
    if (novoItem.quantidade === 0) {
      status = "Indisponível";
    } else if (novoItem.quantidade <= novoItem.minimo) {
      status = "Baixo Estoque";
    }

    // Adicionar novo item
    const item = {
      id: Date.now().toString(),
      ...novoItem,
      status,
      reservado: 0,
      ultimaCompra: new Date().toISOString().split('T')[0]
    };

    setItems(prev => [...prev, item]);
    
    // Limpar e fechar modal
    setNovoItem({
      nome: "",
      categoria: "",
      quantidade: 0,
      unidade: "un",
      valorUnitario: 0,
      fornecedor: "",
      localizacao: "",
      minimo: 0
    });
    setShowItemModal(false);
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
    actionBar: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "24px"
    },
    searchContainer: {
      display: "flex",
      gap: "12px"
    },
    searchInput: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      width: "280px",
      fontSize: "0.875rem"
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
      gap: "12px"
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
      gap: "8px"
    },
    primaryButton: {
      backgroundColor: "#0ea5e9",
      color: "white"
    },
    secondaryButton: {
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
    tableContainer: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      overflow: "hidden"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse"
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
    statusDisponivel: {
      backgroundColor: "#dcfce7",
      color: "#16a34a"
    },
    statusBaixo: {
      backgroundColor: "#fef3c7",
      color: "#d97706"
    },
    statusIndisponivel: {
      backgroundColor: "#fee2e2",
      color: "#dc2626"
    },
    actionButtons: {
      display: "flex",
      gap: "8px"
    },
    iconButton: {
      width: "28px",
      height: "28px",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
      color: "#64748b",
      transition: "background-color 0.2s"
    },
    iconButtonHover: {
      backgroundColor: "#f1f5f9"
    },
    movimentacaoEntrada: {
      color: "#16a34a"
    },
    movimentacaoSaida: {
      color: "#dc2626"
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
      maxWidth: "500px",
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
    }
  };

  // Componente
  return (
    <div style={styles.container}>
      {/* Cabeçalho */}
      <header style={styles.header}>
        <h1 style={styles.pageTitle}>Gestão de Estoque</h1>
        <p style={styles.pageSubtitle}>Controle de materiais e insumos para prestação de serviços</p>
      </header>

      {/* Cards de estatísticas */}
      <div style={styles.statsContainer}>
        <motion.div 
          style={styles.statCard}
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{...styles.statValue, ...styles.statHighlight}}>{totalItens}</div>
          <div style={styles.statLabel}>Itens em Estoque</div>
        </motion.div>

        <motion.div 
          style={styles.statCard}
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div style={styles.statValue}>{formatarMoeda(totalValorEstoque)}</div>
          <div style={styles.statLabel}>Valor Total em Estoque</div>
        </motion.div>

        <motion.div 
          style={styles.statCard}
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div style={{...styles.statValue, ...styles.statWarning}}>{itensBaixoEstoque}</div>
          <div style={styles.statLabel}>Itens com Estoque Baixo</div>
        </motion.div>

        <motion.div 
          style={styles.statCard}
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div style={{...styles.statValue, ...styles.statDanger}}>{itensIndisponiveis}</div>
          <div style={styles.statLabel}>Itens Indisponíveis</div>
        </motion.div>
      </div>

      {/* Barra de ações */}
      <div style={styles.actionBar}>
        <div style={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Buscar item, fornecedor, localização..." 
            style={styles.searchInput}
            value={filtroBusca}
            onChange={(e) => setFiltroBusca(e.target.value)}
          />
          
          <select 
            style={styles.select}
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
          
          <select 
            style={styles.select}
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="Todos">Todos os Status</option>
            <option value="Disponível">Disponível</option>
            <option value="Baixo Estoque">Baixo Estoque</option>
            <option value="Indisponível">Indisponível</option>
          </select>
          
          <select 
            style={styles.select}
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
          >
            <option value="nome_asc">Nome (A-Z)</option>
            <option value="nome_desc">Nome (Z-A)</option>
            <option value="qtd_asc">Quantidade (Menor-Maior)</option>
            <option value="qtd_desc">Quantidade (Maior-Menor)</option>
            <option value="valor_asc">Valor (Menor-Maior)</option>
            <option value="valor_desc">Valor (Maior-Menor)</option>
          </select>
        </div>
        
        <div style={styles.buttonGroup}>
          <button 
            style={{...styles.button, ...styles.primaryButton}}
            onClick={handleNovoItem}
          >
            ✚ Novo Item
          </button>
          
          <button 
            style={{...styles.button, ...styles.secondaryButton}}
            onClick={() => handleNovaMovimentacao("entrada")}
          >
            ↓ Entrada
          </button>
          
          <button 
            style={{...styles.button, ...styles.dangerButton}}
            onClick={() => handleNovaMovimentacao("saida")}
          >
            ↑ Saída
          </button>
          
          <button style={{...styles.button, ...styles.outlineButton}}>
            📊 Relatório
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button 
                    style={{
            ...styles.tab,
            ...(activeTab === "itens" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("itens")}
        >
          Itens em Estoque
          {activeTab === "itens" && <div style={styles.activeTabIndicator}></div>}
        </button>
        
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "movimentacoes" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("movimentacoes")}
        >
          Movimentações
          {activeTab === "movimentacoes" && <div style={styles.activeTabIndicator}></div>}
        </button>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div style={styles.loadingState}>
          <div style={styles.loadingSpinner}></div>
          <p>Carregando dados do estoque...</p>
        </div>
      ) : activeTab === "itens" ? (
        <div style={styles.tableContainer}>
          {filtrarItens().length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>📦</div>
              <p style={styles.emptyStateText}>
                Nenhum item encontrado com os filtros selecionados.
              </p>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={() => {
                  setFiltroBusca("");
                  setFiltroCategoria("Todas");
                  setFiltroStatus("Todos");
                }}
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Item</th>
                  <th style={styles.tableHeader}>Categoria</th>
                  <th style={styles.tableHeader}>Quantidade</th>
                  <th style={styles.tableHeader}>Valor Unitário</th>
                  <th style={styles.tableHeader}>Valor Total</th>
                  <th style={styles.tableHeader}>Localização</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrarItens().map(item => (
                  <motion.tr 
                    key={item.id}
                    style={styles.tableRow}
                    whileHover={styles.tableRowHover}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td style={{...styles.tableCell, ...styles.tableCellHighlight}}>
                      {item.nome}
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {item.fornecedor}
                      </div>
                    </td>
                    <td style={styles.tableCell}>{item.categoria}</td>
                    <td style={styles.tableCell}>
                      {item.quantidade} {item.unidade}
                      {item.reservado > 0 && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          ({item.reservado} reservados)
                        </div>
                      )}
                    </td>
                    <td style={styles.tableCell}>{formatarMoeda(item.valorUnitario)}</td>
                    <td style={styles.tableCell}>{formatarMoeda(item.quantidade * item.valorUnitario)}</td>
                    <td style={styles.tableCell}>{item.localizacao}</td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(item.status === "Disponível" ? styles.statusDisponivel : 
                           item.status === "Baixo Estoque" ? styles.statusBaixo : 
                           styles.statusIndisponivel)
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={styles.iconButton}
                          title="Visualizar detalhes"
                        >
                          👁️
                        </button>
                        <button 
                          style={styles.iconButton}
                          title="Editar item"
                        >
                          ✏️
                        </button>
                        <button 
                          style={styles.iconButton}
                          title="Mais opções"
                        >
                          ⋮
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div style={styles.tableContainer}>
          {movimentacoes.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>📋</div>
              <p style={styles.emptyStateText}>
                Nenhuma movimentação de estoque registrada.
              </p>
              <div style={styles.buttonGroup}>
                <button 
                  style={{...styles.button, ...styles.secondaryButton}}
                  onClick={() => handleNovaMovimentacao("entrada")}
                >
                  ↓ Registrar Entrada
                </button>
                <button 
                  style={{...styles.button, ...styles.dangerButton}}
                  onClick={() => handleNovaMovimentacao("saida")}
                >
                  ↑ Registrar Saída
                </button>
              </div>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Data</th>
                  <th style={styles.tableHeader}>Tipo</th>
                  <th style={styles.tableHeader}>Item</th>
                  <th style={styles.tableHeader}>Quantidade</th>
                  <th style={styles.tableHeader}>Responsável</th>
                  <th style={styles.tableHeader}>Observação</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map(mov => (
                  <motion.tr 
                    key={mov.id}
                    style={styles.tableRow}
                    whileHover={styles.tableRowHover}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td style={styles.tableCell}>{formatarData(mov.data)}</td>
                    <td style={styles.tableCell}>
                      <span style={{
                        fontWeight: "600",
                        ...(mov.tipo === "Entrada" ? styles.movimentacaoEntrada : styles.movimentacaoSaida)
                      }}>
                        {mov.tipo === "Entrada" ? "↓" : "↑"} {mov.tipo}
                      </span>
                    </td>
                    <td style={{...styles.tableCell, ...styles.tableCellHighlight}}>{mov.item}</td>
                    <td style={styles.tableCell}>{mov.quantidade}</td>
                    <td style={styles.tableCell}>{mov.responsavel}</td>
                    <td style={styles.tableCell}>{mov.observacao}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal de Movimentação */}
      {showMovimentacaoModal && (
        <div style={styles.modal}>
          <motion.div 
            style={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {tipoMovimentacao === "entrada" ? "Registrar Entrada" : "Registrar Saída"}
              </h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowMovimentacaoModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Item</label>
                <select 
                  style={styles.input}
                  value={itemSelecionado || ""}
                  onChange={(e) => setItemSelecionado(e.target.value)}
                  required
                >
                  <option value="">Selecione um item</option>
                  {items.map(item => (
                    <option 
                      key={item.id} 
                      value={item.id}
                      disabled={tipoMovimentacao === "saida" && item.quantidade === 0}
                    >
                      {item.nome} ({item.quantidade} {item.unidade} disponíveis)
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Quantidade</label>
                <input 
                  type="number"
                  style={styles.input}
                  value={quantidadeMovimentacao}
                  onChange={(e) => setQuantidadeMovimentacao(Math.max(1, parseInt(e.target.value) || 0))}
                  min="1"
                  required
                />
                {tipoMovimentacao === "saida" && itemSelecionado && (
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                    Máximo disponível: {items.find(i => i.id === itemSelecionado)?.quantidade || 0} unidades
                  </div>
                )}
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Observação</label>
                <textarea 
                  style={styles.textarea}
                  value={observacaoMovimentacao}
                  onChange={(e) => setObservacaoMovimentacao(e.target.value)}
                  placeholder={tipoMovimentacao === "entrada" ? "Ex: Compra de reposição, devolução de cliente..." : "Ex: Uso em OS #1234, consumo interno..."}
                />
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.button, ...styles.outlineButton}}
                onClick={() => setShowMovimentacaoModal(false)}
              >
                Cancelar
              </button>
              <button 
                style={{
                  ...styles.button, 
                  ...(tipoMovimentacao === "entrada" ? styles.secondaryButton : styles.dangerButton)
                }}
                onClick={handleSalvarMovimentacao}
              >
                {tipoMovimentacao === "entrada" ? "Registrar Entrada" : "Registrar Saída"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Novo Item */}
      {showItemModal && (
        <div style={styles.modal}>
          <motion.div 
            style={{...styles.modalContent, maxWidth: "600px"}}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Cadastrar Novo Item</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowItemModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome do Item *</label>
                <input 
                  type="text"
                  style={styles.input}
                  value={novoItem.nome}
                  onChange={(e) => setNovoItem({...novoItem, nome: e.target.value})}
                  placeholder="Ex: Cabo HDMI 2.0"
                  required
                />
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Categoria *</label>
                  <select 
                    style={styles.input}
                    value={novoItem.categoria}
                    onChange={(e) => setNovoItem({...novoItem, categoria: e.target.value})}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.filter(c => c !== "Todas").map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Fornecedor</label>
                  <input 
                    type="text"
                    style={styles.input}
                    value={novoItem.fornecedor}
                    onChange={(e) => setNovoItem({...novoItem, fornecedor: e.target.value})}
                    placeholder="Ex: TechSupply"
                  />
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantidade Inicial</label>
                  <input 
                    type="number"
                    style={styles.input}
                    value={novoItem.quantidade}
                    onChange={(e) => setNovoItem({...novoItem, quantidade: Math.max(0, parseInt(e.target.value) || 0)})}
                    min="0"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Unidade de Medida</label>
                  <select 
                    style={styles.input}
                    value={novoItem.unidade}
                    onChange={(e) => setNovoItem({...novoItem, unidade: e.target.value})}
                  >
                    <option value="un">Unidade (un)</option>
                    <option value="kg">Quilograma (kg)</option>
                    <option value="m">Metro (m)</option>
                    <option value="l">Litro (l)</option>
                    <option value="kit">Kit</option>
                    <option value="cx">Caixa (cx)</option>
                  </select>
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Valor Unitário (R$)</label>
                  <input 
                    type="number"
                    style={styles.input}
                    value={novoItem.valorUnitario}
                    onChange={(e) => setNovoItem({...novoItem, valorUnitario: Math.max(0, parseFloat(e.target.value) || 0)})}
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Estoque Mínimo</label>
                  <input 
                    type="number"
                    style={styles.input}
                    value={novoItem.minimo}
                    onChange={(e) => setNovoItem({...novoItem, minimo: Math.max(0, parseInt(e.target.value) || 0)})}
                    min="0"
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Localização no Estoque</label>
                <input 
                  type="text"
                  style={styles.input}
                  value={novoItem.localizacao}
                  onChange={(e) => setNovoItem({...novoItem, localizacao: e.target.value})}
                  placeholder="Ex: Prateleira A3, Gaveta B2"
                />
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.button, ...styles.outlineButton}}
                onClick={() => setShowItemModal(false)}
              >
                Cancelar
              </button>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={handleSalvarItem}
              >
                Cadastrar Item
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