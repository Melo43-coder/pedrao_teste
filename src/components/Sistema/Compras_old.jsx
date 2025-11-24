import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// MOCK DATA
const MOCK_FORNECEDORES = [
  { id: "1", nome: "Alpha Química", cnpj: "23.456.789/0001-10", categoria: "Insumos", ultimaCompra: "2025-04-01" },
  { id: "2", nome: "EletroSupreme", cnpj: "99.123.456/0002-90", categoria: "Eletrônicos", ultimaCompra: "2025-03-15" },
  { id: "3", nome: "Global Office", cnpj: "45.678.901/0003-45", categoria: "Material de Escritório", ultimaCompra: "2025-04-05" },
  { id: "4", nome: "Tech Solutions", cnpj: "12.345.678/0004-89", categoria: "Equipamentos", ultimaCompra: "2025-03-22" }
];

const MOCK_PEDIDOS = [
  { id: "1", numero: "PC-0114", fornecedorId: "1", fornecedor: "Alpha Química", valor: 1230.75, status: "Recebido", data: "2025-04-10", itens: 5 },
  { id: "2", numero: "PC-0113", fornecedorId: "2", fornecedor: "EletroSupreme", valor: 753.00, status: "Faturado", data: "2025-03-28", itens: 2 },
  { id: "3", numero: "PC-0112", fornecedorId: "1", fornecedor: "Alpha Química", valor: 287.41, status: "Processando", data: "2025-03-20", itens: 1 },
  { id: "4", numero: "PC-0111", fornecedorId: "3", fornecedor: "Global Office", valor: 542.30, status: "Recebido", data: "2025-03-15", itens: 8 },
  { id: "5", numero: "PC-0110", fornecedorId: "4", fornecedor: "Tech Solutions", valor: 1875.20, status: "Cancelado", data: "2025-03-10", itens: 3 }
];

const MOCK_PRODUTOS = [
  { id: "1", nome: "Reagente A-201", categoria: "Químicos", estoque: 15 },
  { id: "2", nome: "Cabo HDMI 2.1", categoria: "Eletrônicos", estoque: 23 },
  { id: "3", nome: "Papel A4 (Resma)", categoria: "Escritório", estoque: 42 },
  { id: "4", nome: "Toner HP M428", categoria: "Impressão", estoque: 7 },
  { id: "5", nome: "Mouse Wireless", categoria: "Informática", estoque: 12 }
];

const STATUS_COLORS = {
  "Recebido": { bg: "#e6f7ef", text: "#0d9f6f", icon: "✓" },
  "Faturado": { bg: "#fff8e6", text: "#e6a700", icon: "📋" },
  "Processando": { bg: "#e6f4ff", text: "#0091ea", icon: "⟳" },
  "Cancelado": { bg: "#ffe6e6", text: "#e63946", icon: "✕" },
  "Aguardando": { bg: "#f0f0f0", text: "#757575", icon: "⏱" }
};

// Estilos inline
const styles = {
  container: {
    width: "100%",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#333",
    backgroundColor: "#f9fafb",
    padding: "20px",
    boxSizing: "border-box"
  },
  dashboardHeader: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    padding: "24px",
    marginBottom: "24px"
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  headerTitleSection: {
    flex: 1
  },
  pageTitle: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 4px 0"
  },
  pageSubtitle: {
    color: "#6b7280",
    margin: 0,
    fontSize: "0.95rem"
  },
  headerActions: {
    display: "flex",
    gap: "12px"
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "none"
  },
  actionButtonPrimary: {
    backgroundColor: "#0ea5e9",
    color: "white"
  },
  actionButtonSecondary: {
    backgroundColor: "#f59e0b",
    color: "white"
  },
  actionButtonOutline: {
    backgroundColor: "transparent",
    border: "1px solid #d1d5db",
    color: "#4b5563"
  },
  searchContainer: {
    position: "relative"
  },
  searchInput: {
    padding: "10px 16px 10px 36px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    width: "250px",
    fontSize: "0.9rem",
    transition: "all 0.2s ease"
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    fontSize: "0.9rem"
  },
  statsCards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px"
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease"
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    marginRight: "16px"
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 4px 0"
  },
  statLabel: {
    color: "#6b7280",
    fontSize: "0.85rem",
    margin: 0
  },
  statTrend: {
    fontSize: "0.8rem",
    color: "#6b7280",
    marginTop: "8px"
  },
  statTrendPositive: {
    color: "#10b981"
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px"
  },
  tabNavigation: {
    display: "flex",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "16px"
  },
  tabButton: {
    padding: "12px 20px",
    background: "transparent",
    border: "none",
    fontWeight: 600,
    color: "#6b7280",
    cursor: "pointer",
    position: "relative",
    transition: "all 0.2s ease"
  },
  tabButtonActive: {
    color: "#0ea5e9"
  },
  tabButtonActiveLine: {
    content: "''",
    position: "absolute",
    bottom: "-1px",
    left: 0,
    width: "100%",
    height: "2px",
    backgroundColor: "#0ea5e9"
  },
  tabContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    overflow: "hidden"
  },
  tableContainer: {
    overflowX: "auto"
  },
  dataTable: {
    width: "100%",
    borderCollapse: "collapse"
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: 600,
    color: "#4b5563",
    fontSize: "0.85rem",
    borderBottom: "1px solid #e5e7eb"
  },
  dataRow: {
    cursor: "pointer",
    transition: "background-color 0.2s ease"
  },
  tableCell: {
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "0.9rem",
    color: "#4b5563"
  },
  emphasisCell: {
    fontWeight: 600,
    color: "#111827"
  },
  currencyCell: {
    fontFamily: "'Roboto Mono', monospace",
    color: "#059669"
  },
  centerCell: {
    textAlign: "center"
  },
  loadingCell: {
    padding: "32px",
    textAlign: "center",
    color: "#6b7280"
  },
  emptyCell: {
    padding: "32px",
    textAlign: "center",
    color: "#6b7280"
  },
  loadingSpinner: {
    display: "inline-block",
    width: "20px",
    height: "20px",
    border: "2px solid rgba(156, 163, 175, 0.3)",
    borderRadius: "50%",
    borderTopColor: "#0ea5e9",
    animation: "spin 1s linear infinite",
    marginRight: "8px",
    verticalAlign: "middle"
  },
  statusBadge: (status) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: 600,
    backgroundColor: STATUS_COLORS[status]?.bg || "#f0f0f0",
    color: STATUS_COLORS[status]?.text || "#6b7280"
  }),
  statusIcon: {
    marginRight: "4px",
    fontSize: "0.9rem"
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    justifyContent: "center"
  },
  iconButton: {
    background: "transparent",
    border: "none",
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.9rem"
  },
  actionBar: {
    padding: "16px",
    display: "flex",
    gap: "12px",
    borderTop: "1px solid #e5e7eb"
  },
  estoqueCell: {
    position: "relative"
  },
  lowStock: {
    color: "#ef4444"
  },
  lowStockBadge: {
    display: "inline-block",
    backgroundColor: "#fee2e2",
    color: "#ef4444",
    fontSize: "0.7rem",
    fontWeight: 600,
    padding: "2px 6px",
    borderRadius: "4px",
    marginLeft: "8px"
  },
  actionCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
    marginBottom: "24px"
  },
  actionCardSecondary: {
    backgroundColor: "#fffbeb"
  },
  actionCardInfo: {
    backgroundColor: "#f0f9ff"
  },
  cardHeader: {
    padding: "20px 20px 0"
  },
  cardHeaderWithClose: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  closeButton: {
    background: "transparent",
    border: "none",
    fontSize: "1.5rem",
    lineHeight: 1,
    color: "#9ca3af",
    cursor: "pointer",
    padding: 0
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 4px 0"
  },
  cardSubtitle: {
    color: "#6b7280",
    fontSize: "0.85rem",
    margin: "0 0 16px 0"
  },
  cardForm: {
    padding: "0 20px 20px"
  },
  formGroup: {
    marginBottom: "16px"
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px"
  },
  formLabel: {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#4b5563",
    marginBottom: "6px"
  },
  formInput: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
    backgroundColor: "white"
  },
  formSelect: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
    backgroundColor: "white"
  },
  formTextarea: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
    backgroundColor: "white",
    minHeight: "80px",
    resize: "vertical"
  },
  submitButton: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#0ea5e9",
    color: "white",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  submitButtonSecondary: {
    backgroundColor: "#f59e0b"
  },
  buttonSpinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "50%",
    borderTopColor: "white",
    animation: "spin 1s linear infinite"
  },
  fileUpload: {
    position: "relative"
  },
  fileInput: {
    position: "absolute",
    left: "-9999px"
  },
  fileLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    border: "1px dashed #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "#f9fafb"
  },
  fileIcon: {
    fontSize: "1.1rem"
  },
  pedidoDetails: {
    padding: "0 20px"
  },
  detailRow: {
    display: "flex",
    marginBottom: "12px",
    fontSize: "0.9rem"
  },
  detailLabel: {
    width: "120px",
    fontWeight: 600,
    color: "#4b5563"
  },
  detailValue: {
    flex: 1,
    color: "#111827"
  },
  detailValueHighlight: {
    color: "#059669",
    fontWeight: 600
  },
  cardActions: {
    display: "flex",
    gap: "12px",
    padding: "16px 20px 20px",
    borderTop: "1px solid #e5e7eb",
    marginTop: "16px"
  },
  modalOverlay: {
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
    maxWidth: "800px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  },
  modalHeader: {
    padding: "20px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  modalHeaderTitle: {
    margin: 0,
    fontSize: "1.25rem",
    color: "#111827"
  },
  modalBody: {
    padding: "20px"
  },
  modalFooter: {
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px"
  },
  orderItems: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "16px"
  },
  orderItemHeader: {
    display: "grid",
    gridTemplateColumns: "3fr 1fr 2fr 60px",
    gap: "12px",
    backgroundColor: "#f9fafb",
    padding: "12px",
    fontWeight: 600,
    fontSize: "0.85rem",
    color: "#4b5563"
  },
  orderItem: {
    display: "grid",
    gridTemplateColumns: "3fr 1fr 2fr 60px",
    gap: "12px",
    padding: "12px",
    borderTop: "1px solid #e5e7eb",
    alignItems: "center"
  },
  addItemButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px",
    backgroundColor: "#f9fafb",
    border: "none",
    borderTop: "1px solid #e5e7eb",
    width: "100%",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#0ea5e9",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  removeItem: {
    color: "#ef4444"
  },
  orderSummary: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "16px",
    marginTop: "24px"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "0.9rem"
  },
  summaryRowTotal: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #e5e7eb",
    fontWeight: 700,
    fontSize: "1rem"
  },
  summaryLabel: {
    color: "#4b5563"
  },
  summaryValue: {
    color: "#111827"
  }
};

export default function Compras() {
  // Estados
  const [fornecedores, setFornecedores] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [cotacoesAbertas, setCotacoesAbertas] = useState(3);
  const [nfePendentes, setNfePendentes] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pedidos");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  
  const [cotacao, setCotacao] = useState({
    produto: "",
    fornecedorId: "",
    quantidade: 1,
    observacoes: ""
  });

  // Efeito para carregar dados
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulando resposta da API com os dados mock
        setFornecedores(MOCK_FORNECEDORES);
        setPedidos(MOCK_PEDIDOS);
        setProdutos(MOCK_PRODUTOS);
        
        // Inicializa o form com o primeiro fornecedor
        if (MOCK_FORNECEDORES.length > 0) {
          setCotacao(prev => ({ ...prev, fornecedorId: MOCK_FORNECEDORES[0].id }));
        }
      } catch (err) {
        setError("Erro ao carregar dados. Tente novamente mais tarde.");
        console.error("Erro ao buscar dados:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtragem de dados baseada na busca
  const filteredPedidos = pedidos.filter(pedido => 
    pedido.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pedido.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFornecedores = fornecedores.filter(fornecedor => 
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.cnpj.includes(searchTerm)
  );

  // Handlers
  const handleNovaCotacao = async (e) => {
    e.preventDefault();
    
    if (!cotacao.produto || !cotacao.fornecedorId || cotacao.quantidade < 1) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulação de sucesso
      setTimeout(() => {
        setCotacoesAbertas(prev => prev + 1);
        alert("Cotação enviada com sucesso!");
        setCotacao({
          produto: "",
          fornecedorId: fornecedores[0]?.id || "",
          quantidade: 1,
          observacoes: ""
        });
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Erro ao enviar cotação:", err);
      alert("Erro ao enviar cotação. Tente novamente.");
      setIsLoading(false);
    }
  };

  const handleImportarNFe = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação de processamento
    setTimeout(() => {
      setNfePendentes(prev => Math.max(0, prev - 1));
      alert("NF-e importada com sucesso!");
      setIsLoading(false);
      
      // Limpar o formulário
      e.target.reset();
    }, 1500);
  };

  const handlePedidoClick = (pedido) => {
    setSelectedPedido(pedido);
  };

  const handleNewOrder = () => {
    setShowNewOrderForm(!showNewOrderForm);
  };

  // Formatador de data
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      return dateString;
    }
  };

  // Formatador de valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div style={styles.container}>
      {/* Header com estatísticas */}
      <div style={styles.dashboardHeader}>
        <div style={styles.headerContent}>
          <div style={styles.headerTitleSection}>
            <h1 style={styles.pageTitle}>Gestão de Compras</h1>
            <p style={styles.pageSubtitle}>Controle de pedidos, cotações e fornecedores</p>
          </div>
          
          <div style={styles.headerActions}>
            <button 
              style={{...styles.actionButton, ...styles.actionButtonPrimary}} 
              onClick={handleNewOrder}
            >
              <span>+</span> Novo Pedido
            </button>
            
            <div style={styles.searchContainer}>
              <input 
                type="text" 
                style={styles.searchInput} 
                placeholder="Buscar pedidos, fornecedores..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span style={styles.searchIcon}>🔍</span>
            </div>
          </div>
        </div>
        
        <div style={styles.statsCards}>
          <motion.div 
            style={styles.statCard}
            whileHover={{ y: -5, boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{...styles.statIcon, backgroundColor: "#e6f7ef"}}>📊</div>
            <div style={styles.statContent}>
              <h3 style={styles.statValue}>{pedidos.length}</h3>
              <p style={styles.statLabel}>Pedidos Ativos</p>
            </div>
            <div style={{...styles.statTrend, ...styles.statTrendPositive}}>+12% este mês</div>
          </motion.div>
          
          <motion.div 
            style={styles.statCard}
            whileHover={{ y: -5, boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div style={{...styles.statIcon, backgroundColor: "#fff8e6"}}>📝</div>
            <div style={styles.statContent}>
              <h3 style={styles.statValue}>{cotacoesAbertas}</h3>
              <p style={styles.statLabel}>Cotações Abertas</p>
            </div>
            <div style={styles.statTrend}>2 aguardando resposta</div>
          </motion.div>
          
          <motion.div 
            style={styles.statCard}
            whileHover={{ y: -5, boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div style={{...styles.statIcon, backgroundColor: "#e6f4ff"}}>📤</div>
            <div style={styles.statContent}>
              <h3 style={styles.statValue}>{nfePendentes}</h3>
              <p style={styles.statLabel}>NF-e Pendentes</p>
            </div>
            <div style={styles.statTrend}>Aguardando importação</div>
          </motion.div>
          
          <motion.div 
            style={styles.statCard}
            whileHover={{ y: -5, boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
                        <div style={{...styles.statIcon, backgroundColor: "#f0f0f0"}}>🏪</div>
            <div style={styles.statContent}>
              <h3 style={styles.statValue}>{fornecedores.length}</h3>
              <p style={styles.statLabel}>Fornecedores</p>
            </div>
            <div style={styles.statTrend}>3 novos este mês</div>
          </motion.div>
        </div>
      </div>
      
      <div style={styles.mainContent}>
        <div>
          {/* Tabs de navegação */}
          <div style={styles.tabNavigation}>
            <button 
              style={{
                ...styles.tabButton,
                ...(activeTab === 'pedidos' ? styles.tabButtonActive : {})
              }}
              onClick={() => setActiveTab('pedidos')}
            >
              Pedidos
              {activeTab === 'pedidos' && <div style={styles.tabButtonActiveLine}></div>}
            </button>
            <button 
              style={{
                ...styles.tabButton,
                ...(activeTab === 'fornecedores' ? styles.tabButtonActive : {})
              }}
              onClick={() => setActiveTab('fornecedores')}
            >
              Fornecedores
              {activeTab === 'fornecedores' && <div style={styles.tabButtonActiveLine}></div>}
            </button>
            <button 
              style={{
                ...styles.tabButton,
                ...(activeTab === 'produtos' ? styles.tabButtonActive : {})
              }}
              onClick={() => setActiveTab('produtos')}
            >
              Produtos
              {activeTab === 'produtos' && <div style={styles.tabButtonActiveLine}></div>}
            </button>
          </div>
          
          {/* Conteúdo da Tab de Pedidos */}
          {activeTab === 'pedidos' && (
            <motion.div 
              style={styles.tabContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.tableContainer}>
                <table style={styles.dataTable}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Número</th>
                      <th style={styles.tableHeader}>Fornecedor</th>
                      <th style={styles.tableHeader}>Valor</th>
                      <th style={styles.tableHeader}>Itens</th>
                      <th style={styles.tableHeader}>Status</th>
                      <th style={styles.tableHeader}>Data</th>
                      <th style={styles.tableHeader}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="7" style={styles.loadingCell}>
                          <div style={styles.loadingSpinner}></div>
                          <span>Carregando pedidos...</span>
                        </td>
                      </tr>
                    ) : filteredPedidos.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={styles.emptyCell}>
                          Nenhum pedido encontrado com o termo "{searchTerm}"
                        </td>
                      </tr>
                    ) : (
                      filteredPedidos.map((pedido) => (
                        <motion.tr 
                          key={pedido.id}
                          style={styles.dataRow}
                          whileHover={{ backgroundColor: "#f9f9f9" }}
                          onClick={() => handlePedidoClick(pedido)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td style={{...styles.tableCell, ...styles.emphasisCell}}>{pedido.numero}</td>
                          <td style={styles.tableCell}>{pedido.fornecedor}</td>
                          <td style={{...styles.tableCell, ...styles.currencyCell}}>{formatCurrency(pedido.valor)}</td>
                          <td style={{...styles.tableCell, ...styles.centerCell}}>{pedido.itens}</td>
                          <td style={styles.tableCell}>
                            <span style={styles.statusBadge(pedido.status)}>
                              <span style={styles.statusIcon}>{STATUS_COLORS[pedido.status]?.icon}</span>
                              {pedido.status}
                            </span>
                          </td>
                          <td style={styles.tableCell}>{formatDate(pedido.data)}</td>
                          <td style={styles.tableCell}>
                            <div style={styles.actionButtons}>
                              <button style={styles.iconButton} title="Visualizar detalhes">
                                👁️
                              </button>
                              <button style={styles.iconButton} title="Editar pedido">
                                ✏️
                              </button>
                              <button style={styles.iconButton} title="Mais opções">
                                ⋮
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
          
          {/* Conteúdo da Tab de Fornecedores */}
          {activeTab === 'fornecedores' && (
            <motion.div 
              style={styles.tabContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.tableContainer}>
                <table style={styles.dataTable}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Nome</th>
                      <th style={styles.tableHeader}>CNPJ</th>
                      <th style={styles.tableHeader}>Categoria</th>
                      <th style={styles.tableHeader}>Última Compra</th>
                      <th style={styles.tableHeader}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" style={styles.loadingCell}>
                          <div style={styles.loadingSpinner}></div>
                          <span>Carregando fornecedores...</span>
                        </td>
                      </tr>
                    ) : filteredFornecedores.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={styles.emptyCell}>
                          Nenhum fornecedor encontrado com o termo "{searchTerm}"
                        </td>
                      </tr>
                    ) : (
                      filteredFornecedores.map((fornecedor) => (
                        <motion.tr 
                          key={fornecedor.id}
                          style={styles.dataRow}
                          whileHover={{ backgroundColor: "#f9f9f9" }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td style={{...styles.tableCell, ...styles.emphasisCell}}>{fornecedor.nome}</td>
                          <td style={styles.tableCell}>{fornecedor.cnpj}</td>
                          <td style={styles.tableCell}>{fornecedor.categoria}</td>
                          <td style={styles.tableCell}>{formatDate(fornecedor.ultimaCompra)}</td>
                          <td style={styles.tableCell}>
                            <div style={styles.actionButtons}>
                              <button style={styles.iconButton} title="Visualizar detalhes">
                                👁️
                              </button>
                              <button style={styles.iconButton} title="Editar fornecedor">
                                ✏️
                              </button>
                              <button style={styles.iconButton} title="Mais opções">
                                ⋮
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div style={styles.actionBar}>
                <button style={{...styles.actionButton, ...styles.actionButtonSecondary}}>
                  <span>+</span> Novo Fornecedor
                </button>
                <button style={{...styles.actionButton, ...styles.actionButtonOutline}}>
                  <span>📊</span> Relatório de Fornecedores
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Conteúdo da Tab de Produtos */}
          {activeTab === 'produtos' && (
            <motion.div 
              style={styles.tabContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.tableContainer}>
                <table style={styles.dataTable}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Nome</th>
                      <th style={styles.tableHeader}>Categoria</th>
                      <th style={styles.tableHeader}>Estoque</th>
                      <th style={styles.tableHeader}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="4" style={styles.loadingCell}>
                          <div style={styles.loadingSpinner}></div>
                          <span>Carregando produtos...</span>
                        </td>
                      </tr>
                    ) : (
                      produtos.map((produto) => (
                        <motion.tr 
                          key={produto.id}
                          style={styles.dataRow}
                          whileHover={{ backgroundColor: "#f9f9f9" }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td style={{...styles.tableCell, ...styles.emphasisCell}}>{produto.nome}</td>
                          <td style={styles.tableCell}>{produto.categoria}</td>
                          <td style={{...styles.tableCell, ...(produto.estoque < 10 ? styles.lowStock : {})}}>
                            {produto.estoque} unid.
                            {produto.estoque < 10 && <span style={styles.lowStockBadge}>Baixo</span>}
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.actionButtons}>
                              <button style={styles.iconButton} title="Visualizar detalhes">
                                👁️
                              </button>
                              <button style={styles.iconButton} title="Comprar">
                                🛒
                              </button>
                              <button style={styles.iconButton} title="Mais opções">
                                ⋮
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
        
        <div>
          {/* Formulário de Nova Cotação */}
          <motion.div 
            style={styles.actionCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Nova Cotação</h3>
              <p style={styles.cardSubtitle}>Solicite preços rapidamente</p>
            </div>
            
            <form style={styles.cardForm} onSubmit={handleNovaCotacao}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel} htmlFor="produto">Produto ou Serviço</label>
                <input
                  id="produto"
                  type="text"
                  style={styles.formInput}
                  placeholder="Ex: Reagente A-201"
                  value={cotacao.produto}
                  onChange={(e) => setCotacao(prev => ({ ...prev, produto: e.target.value }))}
                  required
                />
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="fornecedor">Fornecedor</label>
                  <select
                    id="fornecedor"
                    style={styles.formSelect}
                    value={cotacao.fornecedorId}
                    onChange={(e) => setCotacao(prev => ({ ...prev, fornecedorId: e.target.value }))}
                    required
                  >
                    {fornecedores.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="quantidade">Quantidade</label>
                  <input
                    id="quantidade"
                    type="number"
                    style={styles.formInput}
                    min={1}
                    value={cotacao.quantidade}
                    onChange={(e) => setCotacao(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
                    required
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel} htmlFor="observacoes">Observações</label>
                <textarea
                  id="observacoes"
                  style={styles.formTextarea}
                  placeholder="Detalhes adicionais, especificações..."
                  value={cotacao.observacoes}
                  onChange={(e) => setCotacao(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={3}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                style={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div style={styles.buttonSpinner}></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>Solicitar Cotação</>
                )}
              </button>
            </form>
          </motion.div>
          
          {/* Importação de NF-e */}
          <motion.div 
            style={{...styles.actionCard, ...styles.actionCardSecondary}}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Importar NF-e</h3>
              <p style={styles.cardSubtitle}>Processe notas fiscais recebidas</p>
            </div>
            
            <form style={styles.cardForm} onSubmit={handleImportarNFe}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel} htmlFor="chave-nfe">Chave de Acesso</label>
                <input
                  id="chave-nfe"
                  type="text"
                  style={styles.formInput}
                  placeholder="Digite a chave da NF-e"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Arquivo XML</label>
                <div style={styles.fileUpload}>
                  <input
                    type="file"
                    id="xml-file"
                    accept=".xml,application/xml"
                    style={styles.fileInput}
                  />
                  <label htmlFor="xml-file" style={styles.fileLabel}>
                    <span style={styles.fileIcon}>📎</span>
                    <span>Selecionar arquivo XML</span>
                  </label>
                </div>
              </div>
              
              <button 
                type="submit" 
                style={{...styles.submitButton, ...styles.submitButtonSecondary}}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div style={styles.buttonSpinner}></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>Processar NF-e</>
                )}
              </button>
            </form>
          </motion.div>
          
          {/* Detalhes do Pedido Selecionado */}
          {selectedPedido && (
            <motion.div 
              style={{...styles.actionCard, ...styles.actionCardInfo}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{...styles.cardHeader, ...styles.cardHeaderWithClose}}>
                <div>
                  <h3 style={styles.cardTitle}>Detalhes do Pedido</h3>
                  <p style={styles.cardSubtitle}>{selectedPedido.numero}</p>
                </div>
                <button 
                  style={styles.closeButton} 
                  onClick={() => setSelectedPedido(null)}
                >
                  ×
                </button>
              </div>
              
              <div style={styles.pedidoDetails}>
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Fornecedor:</div>
                  <div style={styles.detailValue}>{selectedPedido.fornecedor}</div>
                </div>
                
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Valor Total:</div>
                  <div style={{...styles.detailValue, ...styles.detailValueHighlight}}>
                    {formatCurrency(selectedPedido.valor)}
                  </div>
                </div>
                
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Status:</div>
                  <div style={styles.detailValue}>
                    <span style={styles.statusBadge(selectedPedido.status)}>
                      <span style={styles.statusIcon}>{STATUS_COLORS[selectedPedido.status]?.icon}</span>
                      {selectedPedido.status}
                    </span>
                  </div>
                </div>
                
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Data:</div>
                  <div style={styles.detailValue}>{formatDate(selectedPedido.data)}</div>
                </div>
                
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Itens:</div>
                  <div style={styles.detailValue}>{selectedPedido.itens} produtos</div>
                </div>
              </div>
              
              <div style={styles.cardActions}>
                <button style={{...styles.actionButton, ...styles.actionButtonOutline}}>Ver Completo</button>
                <button style={{...styles.actionButton, ...styles.actionButtonSecondary}}>
                  Atualizar Status
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Formulário de Novo Pedido (Modal) */}
      {showNewOrderForm && (
        <div style={styles.modalOverlay}>
          <motion.div 
            style={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalHeaderTitle}>Novo Pedido de Compra</h2>
              <button style={styles.closeButton} onClick={handleNewOrder}>×</button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="new-order-fornecedor">Fornecedor</label>
                  <select id="new-order-fornecedor" style={styles.formSelect} required>
                    <option value="">Selecione um fornecedor</option>
                    {fornecedores.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="new-order-data">Data do Pedido</label>
                  <input 
                    type="date" 
                    id="new-order-data" 
                    style={styles.formInput}
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Itens do Pedido</label>
                <div style={styles.orderItems}>
                  <div style={styles.orderItemHeader}>
                    <div>Produto</div>
                    <div>Quantidade</div>
                    <div>Valor Unitário</div>
                    <div>Ações</div>
                  </div>
                  
                  <div style={styles.orderItem}>
                    <div>
                      <select style={styles.formSelect}>
                        <option value="">Selecione um produto</option>
                        {produtos.map(p => (
                          <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input type="number" style={styles.formInput} min="1" defaultValue="1" />
                    </div>
                    <div>
                      <input type="number" style={styles.formInput} min="0" step="0.01" placeholder="0,00" />
                    </div>
                    <div>
                      <button type="button" style={{...styles.iconButton, ...styles.removeItem}}>
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <button type="button" style={styles.addItemButton}>
                    <span>+</span> Adicionar Item
                  </button>
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel} htmlFor="new-order-obs">Observações</label>
                <textarea 
                  id="new-order-obs" 
                  style={styles.formTextarea}
                  placeholder="Informações adicionais sobre o pedido..."
                ></textarea>
              </div>
              
              <div style={styles.orderSummary}>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Subtotal:</div>
                  <div style={styles.summaryValue}>R$ 0,00</div>
                </div>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Impostos:</div>
                  <div style={styles.summaryValue}>R$ 0,00</div>
                </div>
                <div style={{...styles.summaryRow, ...styles.summaryRowTotal}}>
                  <div style={styles.summaryLabel}>Total:</div>
                  <div style={styles.summaryValue}>R$ 0,00</div>
                </div>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                type="button" 
                style={{...styles.actionButton, ...styles.actionButtonOutline}} 
                onClick={handleNewOrder}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                style={{...styles.actionButton, ...styles.actionButtonPrimary}}
              >
                Criar Pedido
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