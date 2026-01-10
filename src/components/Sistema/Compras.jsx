import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  createSupplier,
  listSuppliers,
  updateSupplier,
  deleteSupplier,
  createPurchaseOrder,
  listPurchaseOrders,
  updatePurchaseOrder,
  deletePurchaseOrder,
  createProduct,
  listProducts,
  updateProduct,
  deleteProduct,
  addToStock,
  removeFromStock,
  notifyAllUsers
} from "../../services/firebase";
import { formatCnpj, normalizeCnpj } from "../../utils/cnpj";

const STATUS_COLORS = {
  "Recebido": { bg: "#e6f7ef", text: "#0d9f6f", icon: "✓" },
  "Faturado": { bg: "#fff8e6", text: "#e6a700", icon: "📋" },
  "Processando": { bg: "#e6f4ff", text: "#0091ea", icon: "⟳" },
  "Cancelado": { bg: "#ffe6e6", text: "#e63946", icon: "✕" },
  "Aguardando": { bg: "#f0f0f0", text: "#757575", icon: "⏱" }
};

export default function Compras() {
  // Estados principais
  const [fornecedores, setFornecedores] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pedidos");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCnpj, setCurrentCnpj] = useState("");

  // Modais
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);

  // Formulários
  const [novoFornecedor, setNovoFornecedor] = useState({
    nome: "",
    cnpj: "",
    categoria: "",
    contato: "",
    email: "",
    telefone: ""
  });

  const [novoPedido, setNovoPedido] = useState({
    fornecedorId: "",
    valor: 0,
    status: "Processando",
    itens: 1,
    descricao: ""
  });

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    categoria: "",
    estoque: 0,
    preco: 0
  });

  const [stockOperation, setStockOperation] = useState({
    quantidade: 0,
    tipo: "adicionar"
  });

  // Carregar CNPJ do localStorage e buscar dados
  useEffect(() => {
    const cnpj = localStorage.getItem("companyCnpj");
    if (cnpj) {
      setCurrentCnpj(cnpj);
      loadAllData(cnpj);
    } else {
      setError("CNPJ não encontrado. Faça login novamente.");
    }
  }, []);

  // Função para carregar todos os dados
  const loadAllData = useCallback(async (cnpj) => {
    setIsLoading(true);
    setError(null);
    try {
      const [fornecedoresData, pedidosData, produtosData] = await Promise.all([
        listSuppliers(cnpj),
        listPurchaseOrders(cnpj),
        listProducts(cnpj)
      ]);
      
      setFornecedores(fornecedoresData || []);
      setPedidos(pedidosData || []);
      setProdutos(produtosData || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados do banco de dados");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handler para criar novo fornecedor
  const handleNovoFornecedor = async (e) => {
    e.preventDefault();
    if (!novoFornecedor.nome || !novoFornecedor.cnpj) {
      setError("Nome e CNPJ são obrigatórios");
      return;
    }

    try {
      setIsLoading(true);
      // Normalizar CNPJ antes de enviar (remover formatação)
      const fornecedorData = {
        ...novoFornecedor,
        cnpj: normalizeCnpj(novoFornecedor.cnpj)
      };
      await createSupplier(currentCnpj, fornecedorData);
      setNovoFornecedor({
        nome: "",
        cnpj: "",
        categoria: "",
        contato: "",
        email: "",
        telefone: ""
      });
      setShowNewSupplierForm(false);
      await loadAllData(currentCnpj);
    } catch (err) {
      console.error("Erro ao criar fornecedor:", err);
      setError("Erro ao criar fornecedor");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para criar novo pedido
  const handleNovoPedido = async (e) => {
    e.preventDefault();
    if (!novoPedido.fornecedorId || !novoPedido.valor) {
      setError("Fornecedor e valor são obrigatórios");
      return;
    }

    try {
      setIsLoading(true);
      const fornecedor = fornecedores.find(f => f.id === novoPedido.fornecedorId);
      await createPurchaseOrder(currentCnpj, {
        ...novoPedido,
        fornecedorNome: fornecedor?.nome || "Desconhecido",
        data: new Date().toISOString().split('T')[0]
      });
      setNovoPedido({
        fornecedorId: "",
        valor: 0,
        status: "Processando",
        itens: 1,
        descricao: ""
      });
      setShowNewOrderForm(false);
      await loadAllData(currentCnpj);
    } catch (err) {
      console.error("Erro ao criar pedido:", err);
      setError("Erro ao criar pedido");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para criar novo produto
  const handleNovoProduto = async (e) => {
    e.preventDefault();
    if (!novoProduto.nome || !novoProduto.categoria) {
      setError("Nome e categoria são obrigatórios");
      return;
    }

    try {
      setIsLoading(true);
      await createProduct(currentCnpj, novoProduto);
      setNovoProduto({
        nome: "",
        categoria: "",
        estoque: 0,
        preco: 0
      });
      setShowNewProductForm(false);
      await loadAllData(currentCnpj);
    } catch (err) {
      console.error("Erro ao criar produto:", err);
      setError("Erro ao criar produto");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para operação de estoque
  const handleOperacaoEstoque = async (e) => {
    e.preventDefault();
    if (!selectedProductForStock || !stockOperation.quantidade) {
      setError("Selecione um produto e insira a quantidade");
      return;
    }

    try {
      setIsLoading(true);
      const produtoAtualizado = produtos.find(p => p.id === selectedProductForStock);
      const estoqueAnterior = produtoAtualizado?.estoque || 0;
      let novoEstoque = estoqueAnterior;
      
      if (stockOperation.tipo === "adicionar") {
        await addToStock(currentCnpj, selectedProductForStock, stockOperation.quantidade);
        novoEstoque = estoqueAnterior + stockOperation.quantidade;
      } else {
        await removeFromStock(currentCnpj, selectedProductForStock, stockOperation.quantidade);
        novoEstoque = Math.max(0, estoqueAnterior - stockOperation.quantidade);
      }
      
      // Verificar se estoque ficou baixo (< 10 unidades)
      if (novoEstoque < 10 && novoEstoque > 0) {
        await notifyAllUsers(currentCnpj, {
          type: 'estoque_baixo',
          titulo: 'Aviso: Estoque Baixo',
          mensagem: `Produto "${produtoAtualizado?.nome}" está com apenas ${novoEstoque} unidades em estoque!`,
          produtoInfo: {
            nome: produtoAtualizado?.nome,
            categoria: produtoAtualizado?.categoria,
            estoque: novoEstoque
          }
        }, ['gerente', 'admin']);
        if (window.showHeaderNotification) {
          window.showHeaderNotification('⚠️ Estoque Baixo', `${produtoAtualizado?.nome} está com apenas ${novoEstoque} unidades!`, 'warning');
        }
      } else if (novoEstoque === 0) {
        // Estoque zerado - notificar também funcionários
        await notifyAllUsers(currentCnpj, {
          type: 'estoque_baixo',
          titulo: '⛔ SEM ESTOQUE',
          mensagem: `Produto "${produtoAtualizado?.nome}" ficou SEM ESTOQUE! Fazer novo pedido urgentemente.`,
          produtoInfo: {
            nome: produtoAtualizado?.nome,
            categoria: produtoAtualizado?.categoria,
            estoque: 0
          }
        }, ['funcionario', 'gerente', 'admin']);
        if (window.showHeaderNotification) {
          window.showHeaderNotification('🚨 SEM ESTOQUE', `${produtoAtualizado?.nome} ficou sem estoque!`, 'critical');
        }
      } else if (stockOperation.tipo === 'adicionar') {
        if (window.showHeaderNotification) {
          window.showHeaderNotification('✅ Estoque Atualizado', `${produtoAtualizado?.nome} agora tem ${novoEstoque} unidades`, 'success');
        }
      }
      
      setStockOperation({ quantidade: 0, tipo: "adicionar" });
      setSelectedProductForStock(null);
      setShowStockModal(false);
      await loadAllData(currentCnpj);
    } catch (err) {
      console.error("Erro ao atualizar estoque:", err);
      setError("Erro ao atualizar estoque");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar dados por busca
  const fornecedoresFiltrados = fornecedores.filter(f =>
    f.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cnpj?.includes(searchTerm)
  );

  const pedidosFiltrados = pedidos.filter(p =>
    p.numero?.includes(searchTerm) ||
    p.fornecedorNome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const produtosFiltrados = produtos.filter(p =>
    p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estilos
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
    pageTitle: {
      fontSize: "1.75rem",
      fontWeight: 700,
      color: "#111827",
      margin: "0 0 8px 0"
    },
    pageSubtitle: {
      color: "#6b7280",
      margin: 0,
      fontSize: "0.95rem"
    },
    headerActions: {
      display: "flex",
      gap: "12px",
      marginTop: "16px",
      flexWrap: "wrap"
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
      border: "none",
      backgroundColor: "#0ea5e9",
      color: "white"
    },
    tabsContainer: {
      display: "flex",
      gap: "12px",
      marginBottom: "24px",
      borderBottom: "1px solid #e5e7eb"
    },
    tab: {
      padding: "12px 16px",
      cursor: "pointer",
      fontSize: "0.95rem",
      fontWeight: 500,
      color: "#6b7280",
      borderBottom: "3px solid transparent",
      transition: "all 0.2s ease"
    },
    tabActive: {
      color: "#0ea5e9",
      borderBottomColor: "#0ea5e9"
    },
    card: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      padding: "16px",
      marginBottom: "16px"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse"
    },
    tableHeader: {
      borderBottom: "2px solid #e5e7eb",
      backgroundColor: "#f9fafb"
    },
    tableHeaderCell: {
      padding: "12px",
      textAlign: "left",
      fontWeight: 600,
      fontSize: "0.85rem",
      color: "#6b7280"
    },
    tableRow: {
      borderBottom: "1px solid #e5e7eb"
    },
    tableCell: {
      padding: "12px",
      fontSize: "0.9rem"
    },
    statusBadge: (status) => ({
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "0.8rem",
      fontWeight: 600,
      backgroundColor: STATUS_COLORS[status]?.bg || "#f3f4f6",
      color: STATUS_COLORS[status]?.text || "#6b7280"
    }),
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
    modal: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      maxWidth: "500px",
      width: "90%",
      maxHeight: "90vh",
      overflowY: "auto"
    },
    formGroup: {
      marginBottom: "16px"
    },
    label: {
      display: "block",
      marginBottom: "6px",
      fontWeight: 500,
      color: "#374151"
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      fontSize: "0.95rem",
      boxSizing: "border-box",
      fontFamily: "inherit"
    },
    select: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      fontSize: "0.95rem",
      boxSizing: "border-box",
      fontFamily: "inherit"
    },
    formActions: {
      display: "flex",
      gap: "12px",
      marginTop: "24px"
    },
    submitButton: {
      flex: 1,
      padding: "10px 16px",
      backgroundColor: "#0ea5e9",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease"
    },
    cancelButton: {
      flex: 1,
      padding: "10px 16px",
      backgroundColor: "#f3f4f6",
      color: "#374151",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease"
    },
    searchBox: {
      marginBottom: "16px"
    },
    searchInput: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      fontSize: "0.95rem",
      boxSizing: "border-box"
    },
    errorMessage: {
      backgroundColor: "#fee2e2",
      color: "#dc2626",
      padding: "12px",
      borderRadius: "6px",
      marginBottom: "16px",
      fontSize: "0.9rem"
    },
    loadingSpinner: {
      display: "inline-block",
      width: "20px",
      height: "20px",
      border: "3px solid #f3f4f6",
      borderTop: "3px solid #0ea5e9",
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>

      {/* Header */}
      <div style={styles.dashboardHeader}>
        <h1 style={styles.pageTitle}>Gestão de Compras</h1>
        <p style={styles.pageSubtitle}>Gerencie fornecedores, pedidos e produtos</p>
        
        <div style={styles.headerActions}>
          <button
            style={styles.actionButton}
            onClick={() => setShowNewOrderForm(true)}
          >
            ➕ Novo Pedido
          </button>
          <button
            style={{ ...styles.actionButton, backgroundColor: "#f59e0b" }}
            onClick={() => setShowNewSupplierForm(true)}
          >
            ➕ Novo Fornecedor
          </button>
          <button
            style={{ ...styles.actionButton, backgroundColor: "#10b981" }}
            onClick={() => setShowNewProductForm(true)}
          >
            ➕ Novo Produto
          </button>
          <button
            style={{ ...styles.actionButton, backgroundColor: "#8b5cf6" }}
            onClick={() => setShowStockModal(true)}
          >
            📦 Gerenciar Estoque
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          ❌ {error}
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: "8px",
              background: "none",
              border: "none",
              color: "#dc2626",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Search Box */}
      <div style={styles.card}>
        <input
          type="text"
          placeholder="🔍 Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <div
          style={{
            ...styles.tab,
            ...(activeTab === "pedidos" ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab("pedidos")}
        >
          Pedidos ({pedidos.length})
        </div>
        <div
          style={{
            ...styles.tab,
            ...(activeTab === "fornecedores" ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab("fornecedores")}
        >
          Fornecedores ({fornecedores.length})
        </div>
        <div
          style={{
            ...styles.tab,
            ...(activeTab === "produtos" ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab("produtos")}
        >
          Produtos ({produtos.length})
        </div>
      </div>

      {/* Loading State */}
      {isLoading && activeTab === "pedidos" && (
        <div style={styles.card}>
          <div style={styles.loadingSpinner}></div> Carregando pedidos...
        </div>
      )}

      {/* Pedidos Tab */}
      {activeTab === "pedidos" && !isLoading && (
        <div>
          {pedidosFiltrados.length === 0 ? (
            <div style={styles.card}>
              <p style={{ color: "#6b7280", textAlign: "center" }}>
                Nenhum pedido encontrado
              </p>
            </div>
          ) : (
            <div style={styles.card}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Número</th>
                    <th style={styles.tableHeaderCell}>Fornecedor</th>
                    <th style={styles.tableHeaderCell}>Valor</th>
                    <th style={styles.tableHeaderCell}>Status</th>
                    <th style={styles.tableHeaderCell}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{pedido.numero}</td>
                      <td style={styles.tableCell}>{pedido.fornecedorNome}</td>
                      <td style={styles.tableCell}>
                        R$ {parseFloat(pedido.valor || 0).toFixed(2)}
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.statusBadge(pedido.status)}>
                          {pedido.status}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        {new Date(pedido.data).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Fornecedores Tab */}
      {activeTab === "fornecedores" && !isLoading && (
        <div>
          {fornecedoresFiltrados.length === 0 ? (
            <div style={styles.card}>
              <p style={{ color: "#6b7280", textAlign: "center" }}>
                Nenhum fornecedor encontrado
              </p>
            </div>
          ) : (
            <div style={styles.card}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Nome</th>
                    <th style={styles.tableHeaderCell}>CNPJ</th>
                    <th style={styles.tableHeaderCell}>Categoria</th>
                    <th style={styles.tableHeaderCell}>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedoresFiltrados.map((fornecedor) => (
                    <tr key={fornecedor.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{fornecedor.nome}</td>
                      <td style={styles.tableCell}>{fornecedor.cnpj}</td>
                      <td style={styles.tableCell}>{fornecedor.categoria}</td>
                      <td style={styles.tableCell}>{fornecedor.email || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Produtos Tab */}
      {activeTab === "produtos" && !isLoading && (
        <div>
          {produtosFiltrados.length === 0 ? (
            <div style={styles.card}>
              <p style={{ color: "#6b7280", textAlign: "center" }}>
                Nenhum produto encontrado
              </p>
            </div>
          ) : (
            <div style={styles.card}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Nome</th>
                    <th style={styles.tableHeaderCell}>Categoria</th>
                    <th style={styles.tableHeaderCell}>Preço</th>
                    <th style={styles.tableHeaderCell}>Estoque</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosFiltrados.map((produto) => (
                    <tr key={produto.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{produto.nome}</td>
                      <td style={styles.tableCell}>{produto.categoria}</td>
                      <td style={styles.tableCell}>
                        R$ {parseFloat(produto.preco || 0).toFixed(2)}
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{
                          padding: "4px 8px",
                          backgroundColor: produto.estoque > 10 ? "#e6f7ef" : produto.estoque > 0 ? "#fff8e6" : "#ffe6e6",
                          color: produto.estoque > 10 ? "#0d9f6f" : produto.estoque > 0 ? "#e6a700" : "#e63946",
                          borderRadius: "4px",
                          fontWeight: 600
                        }}>
                          {produto.estoque} un
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal - Novo Pedido */}
      {showNewOrderForm && (
        <div style={styles.modalOverlay} onClick={() => setShowNewOrderForm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Novo Pedido de Compra</h2>
            <form onSubmit={handleNovoPedido}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Fornecedor *</label>
                <select
                  style={styles.select}
                  value={novoPedido.fornecedorId}
                  onChange={(e) =>
                    setNovoPedido({ ...novoPedido, fornecedorId: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione um fornecedor</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  style={styles.input}
                  value={novoPedido.valor}
                  onChange={(e) =>
                    setNovoPedido({ ...novoPedido, valor: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select
                  style={styles.select}
                  value={novoPedido.status}
                  onChange={(e) =>
                    setNovoPedido({ ...novoPedido, status: e.target.value })
                  }
                >
                  <option value="Processando">Processando</option>
                  <option value="Faturado">Faturado</option>
                  <option value="Recebido">Recebido</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Quantidade de Itens</label>
                <input
                  type="number"
                  min="1"
                  style={styles.input}
                  value={novoPedido.itens}
                  onChange={(e) =>
                    setNovoPedido({ ...novoPedido, itens: parseInt(e.target.value) })
                  }
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Descrição</label>
                <textarea
                  style={{ ...styles.input, minHeight: "80px" }}
                  value={novoPedido.descricao}
                  onChange={(e) =>
                    setNovoPedido({ ...novoPedido, descricao: e.target.value })
                  }
                  placeholder="Descreva os itens do pedido..."
                />
              </div>

              <div style={styles.formActions}>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Criando..." : "Criar Pedido"}
                </button>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setShowNewOrderForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Novo Fornecedor */}
      {showNewSupplierForm && (
        <div style={styles.modalOverlay} onClick={() => setShowNewSupplierForm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Novo Fornecedor</h2>
            <form onSubmit={handleNovoFornecedor}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome da Empresa *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={novoFornecedor.nome}
                  onChange={(e) =>
                    setNovoFornecedor({ ...novoFornecedor, nome: e.target.value })
                  }
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>CNPJ *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={novoFornecedor.cnpj}
                  onChange={(e) => {
                    const formatted = formatCnpj(e.target.value);
                    setNovoFornecedor({ ...novoFornecedor, cnpj: formatted });
                  }}
                  placeholder="XX.XXX.XXX/0001-XX"
                  maxLength={18}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Categoria</label>
                <input
                  type="text"
                  style={styles.input}
                  value={novoFornecedor.categoria}
                  onChange={(e) =>
                    setNovoFornecedor({ ...novoFornecedor, categoria: e.target.value })
                  }
                  placeholder="Ex: Químicos, Eletrônicos..."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Contato</label>
                <input
                  type="text"
                  style={styles.input}
                  value={novoFornecedor.contato}
                  onChange={(e) =>
                    setNovoFornecedor({ ...novoFornecedor, contato: e.target.value })
                  }
                  placeholder="Nome do contato"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  style={styles.input}
                  value={novoFornecedor.email}
                  onChange={(e) =>
                    setNovoFornecedor({ ...novoFornecedor, email: e.target.value })
                  }
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Telefone</label>
                <input
                  type="text"
                  style={styles.input}
                  value={novoFornecedor.telefone}
                  onChange={(e) =>
                    setNovoFornecedor({ ...novoFornecedor, telefone: e.target.value })
                  }
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>

              <div style={styles.formActions}>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Criando..." : "Criar Fornecedor"}
                </button>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setShowNewSupplierForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Novo Produto */}
      {showNewProductForm && (
        <div style={styles.modalOverlay} onClick={() => setShowNewProductForm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Novo Produto</h2>
            <form onSubmit={handleNovoProduto}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome do Produto *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={novoProduto.nome}
                  onChange={(e) =>
                    setNovoProduto({ ...novoProduto, nome: e.target.value })
                  }
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Categoria *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={novoProduto.categoria}
                  onChange={(e) =>
                    setNovoProduto({ ...novoProduto, categoria: e.target.value })
                  }
                  placeholder="Ex: Químicos, Eletrônicos..."
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  style={styles.input}
                  value={novoProduto.preco}
                  onChange={(e) =>
                    setNovoProduto({ ...novoProduto, preco: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Estoque Inicial</label>
                <input
                  type="number"
                  min="0"
                  style={styles.input}
                  value={novoProduto.estoque}
                  onChange={(e) =>
                    setNovoProduto({ ...novoProduto, estoque: parseInt(e.target.value) })
                  }
                />
              </div>

              <div style={styles.formActions}>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Criando..." : "Criar Produto"}
                </button>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setShowNewProductForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Gerenciar Estoque */}
      {showStockModal && (
        <div style={styles.modalOverlay} onClick={() => setShowStockModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Gerenciar Estoque</h2>
            <form onSubmit={handleOperacaoEstoque}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Produto *</label>
                <select
                  style={styles.select}
                  value={selectedProductForStock || ""}
                  onChange={(e) => setSelectedProductForStock(e.target.value)}
                  required
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (Estoque: {p.estoque})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Operação *</label>
                <select
                  style={styles.select}
                  value={stockOperation.tipo}
                  onChange={(e) =>
                    setStockOperation({ ...stockOperation, tipo: e.target.value })
                  }
                >
                  <option value="adicionar">Adicionar ao Estoque</option>
                  <option value="remover">Remover do Estoque</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Quantidade *</label>
                <input
                  type="number"
                  min="1"
                  style={styles.input}
                  value={stockOperation.quantidade}
                  onChange={(e) =>
                    setStockOperation({
                      ...stockOperation,
                      quantidade: parseInt(e.target.value) || 0
                    })
                  }
                  required
                />
              </div>

              <div style={styles.formActions}>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Atualizando..." : "Atualizar Estoque"}
                </button>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setShowStockModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
