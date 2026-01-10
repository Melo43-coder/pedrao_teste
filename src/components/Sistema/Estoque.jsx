import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import firebase from "../../services/firebase";

// Componente principal
export default function Estoque() {
  // Estados
  const [items, setItems] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [categorias, setCategorias] = useState(["Todas"]);
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [ordenacao, setOrdenacao] = useState("nome_asc");
  const [activeTab, setActiveTab] = useState("itens");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMovimentacaoModal, setShowMovimentacaoModal] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState("entrada");
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [quantidadeMovimentacao, setQuantidadeMovimentacao] = useState(1);
  const [observacaoMovimentacao, setObservacaoMovimentacao] = useState("");
  const [showItemModal, setShowItemModal] = useState(false);
  const [currentCnpj, setCurrentCnpj] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState("");
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
  const [itemEmEdicao, setItemEmEdicao] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Carregar CNPJ e dados
  useEffect(() => {
    const cnpj = localStorage.getItem("companyCnpj");
    if (cnpj) {
      setCurrentCnpj(cnpj);
      loadAllData(cnpj);
    } else {
      setError("CNPJ não encontrado. Faça login novamente.");
      setIsLoading(false);
    }
  }, []);

  // Carregar todos os dados
  const loadAllData = async (cnpj) => {
    setIsLoading(true);
    setError(null);
    try {
      const produtosData = await firebase.listProducts(cnpj);
      setItems(produtosData || []);

      // Carregar categorias do Firebase
      const categoriasData = await firebase.listCategories(cnpj);
      setCategorias(categoriasData);

      // Carregar movimentações do Firebase
      const movimentacoesData = await firebase.listAllMovements(cnpj);
      setMovimentacoes(movimentacoesData || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados do estoque");
    } finally {
      setIsLoading(false);
    }
  };

  // Estatísticas
  const totalItens = items.reduce((acc, item) => acc + item.quantidade, 0);
  const totalValorEstoque = items.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);
  const itensBaixoEstoque = items.filter(item => item.quantidade <= item.minimo && item.quantidade > 0).length;
  const itensIndisponiveis = items.filter(item => item.quantidade === 0).length;

  // Determinar status do item
  const getItemStatus = (item) => {
    if (item.quantidade === 0) return "Indisponível";
    if (item.quantidade <= item.minimo) return "Baixo Estoque";
    return "Disponível";
  };

  // Filtrar itens
  const filtrarItens = () => {
    return items.filter(item => {
      if (filtroCategoria !== "Todas" && item.categoria !== filtroCategoria) {
        return false;
      }

      const status = getItemStatus(item);
      if (filtroStatus === "Baixo Estoque" && !(item.quantidade <= item.minimo && item.quantidade > 0)) {
        return false;
      } else if (filtroStatus === "Indisponível" && item.quantidade !== 0) {
        return false;
      } else if (filtroStatus === "Disponível" && (item.quantidade === 0 || item.quantidade <= item.minimo)) {
        return false;
      }

      if (filtroBusca && !item.nome.toLowerCase().includes(filtroBusca.toLowerCase()) && 
          !item.fornecedor.toLowerCase().includes(filtroBusca.toLowerCase()) &&
          !item.localizacao.toLowerCase().includes(filtroBusca.toLowerCase())) {
        return false;
      }

      return true;
    }).sort((a, b) => {
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
  // Handlers
  const handleNovaMovimentacao = (tipo) => {
    setTipoMovimentacao(tipo);
    setShowMovimentacaoModal(true);
  };

  const handleSalvarMovimentacao = async () => {
    if (!itemSelecionado || quantidadeMovimentacao <= 0) {
      setError("Selecione um item e informe uma quantidade válida.");
      return;
    }

    try {
      setIsLoading(true);
      const produtoAtual = items.find(p => p.id === itemSelecionado);

      if (!produtoAtual) {
        setError("Produto não encontrado");
        return;
      }

      const quantidadeNumero = parseFloat(quantidadeMovimentacao) || 0;
      const quantidadeAtual = parseFloat(produtoAtual.quantidade) || 0;
      let novaQuantidade = quantidadeAtual;

      if (tipoMovimentacao === "entrada") {
        await firebase.addToStock(currentCnpj, itemSelecionado, quantidadeNumero);
        novaQuantidade = quantidadeAtual + quantidadeNumero;
      } else {
        if (quantidadeNumero > quantidadeAtual) {
          setError(`Quantidade insuficiente. Disponível: ${quantidadeAtual}`);
          return;
        }
        await firebase.removeFromStock(currentCnpj, itemSelecionado, quantidadeNumero);
        novaQuantidade = Math.max(0, quantidadeAtual - quantidadeNumero);
      }

      // Atualizar lista local
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemSelecionado 
            ? { ...item, quantidade: novaQuantidade }
            : item
        )
      );

      // Registrar movimentação no Firebase
      const novaMovimentacao = {
        tipo: tipoMovimentacao === "entrada" ? "Entrada" : "Saída",
        data: new Date().toISOString().split('T')[0],
        item: produtoAtual.nome,
        itemId: itemSelecionado,
        quantidade: quantidadeNumero,
        responsavel: localStorage.getItem("userName") || "Usuário",
        observacao: observacaoMovimentacao
      };

      await firebase.createMovementRecord(currentCnpj, itemSelecionado, novaMovimentacao);
      
      // Adicionar à lista local
      setMovimentacoes(prev => [{
        ...novaMovimentacao,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      }, ...prev]);

      // Mostrar notificação
      if (window.showHeaderNotification) {
        window.showHeaderNotification(
          tipoMovimentacao === "entrada" ? '📥 Entrada Registrada' : '📤 Saída Registrada',
          `${produtoAtual.nome} - ${quantidadeNumero} ${produtoAtual.unidade}`,
          'success'
        );
      }

      // Resetar campos
      setItemSelecionado(null);
      setQuantidadeMovimentacao(1);
      setObservacaoMovimentacao("");
      setShowMovimentacaoModal(false);

    } catch (err) {
      console.error("Erro ao registrar movimentação:", err);
      setError("Erro ao registrar movimentação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNovoItem = () => {
    setModoEdicao(false);
    setItemEmEdicao(null);
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
    setShowItemModal(true);
  };

  const handleEditarItem = (item) => {
    setModoEdicao(true);
    setItemEmEdicao(item.id);
    setNovoItem({
      nome: item.nome,
      categoria: item.categoria,
      quantidade: item.quantidade,
      unidade: item.unidade,
      valorUnitario: item.valorUnitario,
      fornecedor: item.fornecedor,
      localizacao: item.localizacao,
      minimo: item.minimo
    });
    setShowItemModal(true);
  };

  const handleDeletarItem = async (itemId) => {
    if (!window.confirm('Tem certeza que deseja deletar este item?')) {
      return;
    }

    try {
      setIsLoading(true);
      await firebase.deleteProduct(currentCnpj, itemId);
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      
      if (window.showHeaderNotification) {
        window.showHeaderNotification('✅ Item Deletado', 'Item removido com sucesso do estoque', 'success');
      }
    } catch (err) {
      console.error('Erro ao deletar item:', err);
      setError('Erro ao deletar item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletarMovimentacao = async (movimentacaoId) => {
    if (!window.confirm('Tem certeza que deseja deletar esta movimentação?')) {
      return;
    }

    try {
      setIsLoading(true);
      await firebase.deleteMovementRecord(currentCnpj, movimentacaoId);
      setMovimentacoes(prevMov => prevMov.filter(mov => mov.id !== movimentacaoId));
      
      if (window.showHeaderNotification) {
        window.showHeaderNotification('✅ Movimentação Deletada', 'Registro removido com sucesso', 'success');
      }
    } catch (err) {
      console.error('Erro ao deletar movimentação:', err);
      setError('Erro ao deletar movimentação');
    } finally {
      setIsLoading(false);
    }
  };

  const gerarPDFMovimentacoes = () => {
    if (movimentacoes.length === 0) {
      setError("Nenhuma movimentação para gerar PDF");
      return;
    }

    // Criar conteúdo HTML para PDF
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório de Movimentações</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .entrada { color: #16a34a; font-weight: bold; }
            .saida { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Relatório de Movimentações de Estoque</h1>
          <p><strong>Data do Relatório:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Item</th>
                <th>Quantidade</th>
                <th>Responsável</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              ${movimentacoes.map(mov => `
                <tr>
                  <td>${formatarData(mov.data)}</td>
                  <td class="${mov.tipo === 'Entrada' ? 'entrada' : 'saida'}">${mov.tipo}</td>
                  <td>${mov.item}</td>
                  <td>${mov.quantidade}</td>
                  <td>${mov.responsavel}</td>
                  <td>${mov.observacao || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Usar uma abordagem simples com window.print() ou criar arquivo
    const win = window.open('', '', 'height=400,width=800');
    win.document.write(htmlContent);
    win.document.close();
    win.print();
  };

  const handleSalvarItem = async () => {
    if (!novoItem.nome || !novoItem.categoria) {
      setError("Nome e categoria são obrigatórios.");
      return;
    }

    try {
      setIsLoading(true);
      const novoItemData = {
        ...novoItem,
        status: getItemStatus(novoItem)
      };

      if (modoEdicao && itemEmEdicao) {
        // Modo edição - atualizar item existente
        await firebase.updateProduct(currentCnpj, itemEmEdicao, novoItemData);
        
        // Atualizar lista local
        setItems(prev => prev.map(item => 
          item.id === itemEmEdicao 
            ? { id: itemEmEdicao, ...novoItemData }
            : item
        ));

        if (window.showHeaderNotification) {
          window.showHeaderNotification('✅ Item Atualizado', `${novoItem.nome} foi atualizado com sucesso`, 'success');
        }
      } else {
        // Modo novo - criar novo item
        const produtoId = await firebase.createProduct(currentCnpj, novoItemData);

        // Adicionar à lista local
        setItems(prev => [{ id: produtoId, ...novoItemData }, ...prev]);

        if (window.showHeaderNotification) {
          window.showHeaderNotification('✅ Item Cadastrado', `${novoItem.nome} adicionado ao estoque`, 'success');
        }
      }

      // Atualizar categorias
      if (!categorias.includes(novoItem.categoria)) {
        setCategorias(prev => [...prev, novoItem.categoria]);
      }

      // Resetar form
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
      setModoEdicao(false);
      setItemEmEdicao(null);
      setShowItemModal(false);

    } catch (err) {
      console.error("Erro ao salvar item:", err);
      setError("Erro ao salvar item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalvarCategoria = async () => {
    if (!novaCategoria.trim()) {
      setError("Nome da categoria não pode estar vazio.");
      return;
    }

    if (categorias.includes(novaCategoria)) {
      setError("Esta categoria já existe.");
      return;
    }

    try {
      setIsLoading(true);
      
      // Salvar no Firebase
      await firebase.createCategory(currentCnpj, novaCategoria);

      // Adicionar à lista local
      setCategorias(prev => [...prev, novaCategoria]);

      // Mostrar notificação
      if (window.showHeaderNotification) {
        window.showHeaderNotification('✅ Categoria Criada', `${novaCategoria} foi adicionada com sucesso`, 'success');
      }

      // Resetar e fechar modal
      setNovaCategoria("");
      setShowCategoryModal(false);

    } catch (err) {
      console.error("Erro ao criar categoria:", err);
      setError(err.message || "Erro ao criar categoria");
    } finally {
      setIsLoading(false);
    }
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
      padding: "clamp(12px, 3vw, 24px)",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      maxWidth: "100%",
      overflow: "hidden"
    },
    header: {
      marginBottom: "clamp(16px, 3vw, 24px)"
    },
    pageTitle: {
      fontSize: "clamp(1.25rem, 2.5vw, 1.875rem)",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 8px 0"
    },
    pageSubtitle: {
      fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
      color: "#64748b",
      margin: 0
    },
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "clamp(12px, 2vw, 16px)",
      marginBottom: "clamp(16px, 3vw, 24px)"
    },
    statCard: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "clamp(16px, 2.5vw, 20px)",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      display: "flex",
      flexDirection: "column"
    },
    statValue: {
      fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "4px"
    },
    statLabel: {
      fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
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
      flexWrap: "wrap",
      gap: "12px",
      justifyContent: "space-between",
      marginBottom: "clamp(16px, 3vw, 24px)"
    },
    searchContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
      flex: "1 1 auto"
    },
    searchInput: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      minWidth: "200px",
      maxWidth: "100%",
      fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
      flex: "1 1 auto"
    },
    select: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      backgroundColor: "white",
      fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
      minWidth: "120px"
    },
    buttonGroup: {
      display: "flex",
      flexWrap: "wrap",
      gap: "12px"
    },
    button: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "none",
      fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      whiteSpace: "nowrap"
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
      marginBottom: "clamp(16px, 3vw, 24px)",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      gap: "clamp(12px, 3vw, 24px)",
      overflowX: "auto"
    },
    tab: {
      padding: "12px 4px",
      fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
      fontWeight: "600",
      color: "#64748b",
      cursor: "pointer",
      position: "relative",
      border: "none",
      backgroundColor: "transparent",
      whiteSpace: "nowrap"
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
      overflow: "auto",
      maxWidth: "100%",
      WebkitOverflowScrolling: "touch"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "800px"
    },
    tableHeader: {
      backgroundColor: "#f8fafc",
      padding: "clamp(8px, 1.5vw, 12px) clamp(6px, 1vw, 10px)",
      fontSize: "clamp(0.625rem, 1vw, 0.7rem)",
      fontWeight: "600",
      color: "#64748b",
      textAlign: "left",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: "1px solid #e2e8f0",
      whiteSpace: "nowrap"
    },
    tableRow: {
      borderBottom: "1px solid #e2e8f0",
      transition: "background-color 0.2s"
    },
    tableRowHover: {
      backgroundColor: "#f1f5f9"
    },
    tableCell: {
      padding: "clamp(8px, 1.5vw, 10px) clamp(6px, 1vw, 8px)",
      fontSize: "clamp(0.7rem, 1.1vw, 0.8rem)",
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
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Cabeçalho */}
      <header style={styles.header}>
        <h1 style={styles.pageTitle}>Gestão de Estoque</h1>
        <p style={styles.pageSubtitle}>Controle de materiais e insumos para prestação de serviços</p>
      </header>

      {/* Erro */}
      {error && (
        <div style={{
          backgroundColor: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          ❌ {error}
          <button
            onClick={() => setError(null)}
            style={{
              backgroundColor: "transparent",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
              color: "#dc2626"
            }}
          >
            ×
          </button>
        </div>
      )}

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
            disabled={isLoading}
          >
            ✚ Novo Item
          </button>
          
          <button 
            style={{...styles.button, ...styles.secondaryButton}}
            onClick={() => handleNovaMovimentacao("entrada")}
            disabled={isLoading}
          >
            📥 Entrada
          </button>
          
          <button 
            style={{...styles.button, ...styles.dangerButton}}
            onClick={() => handleNovaMovimentacao("saida")}
            disabled={isLoading}
          >
            📤 Saída
          </button>

          <button 
            style={{...styles.button, ...styles.outlineButton}}
            onClick={() => setShowCategoryModal(true)}
            disabled={isLoading}
          >
            🏷️ Categorias
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
                  <th style={{...styles.tableHeader, textAlign: 'center', padding: '12px 4px'}}>Ações</th>
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
                        ...(getItemStatus(item) === "Disponível" ? styles.statusDisponivel : 
                           getItemStatus(item) === "Baixo Estoque" ? styles.statusBaixo : 
                           styles.statusIndisponivel)
                      }}>
                        {getItemStatus(item)}
                      </span>
                    </td>
                    <td style={{...styles.tableCell, padding: '8px 4px'}}>
                      <div style={{display: 'flex', gap: '3px', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap'}}>
                        <motion.button
                          style={{
                            padding: '3px 6px',
                            fontSize: '0.65rem',
                            border: 'none',
                            borderRadius: '3px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '500',
                            whiteSpace: 'nowrap'
                          }}
                          whileHover={{ backgroundColor: '#2563eb' }}
                          onClick={() => handleEditarItem(item)}
                        >
                          ✏️ Editar
                        </motion.button>
                        <motion.button
                          style={{
                            padding: '3px 6px',
                            fontSize: '0.65rem',
                            border: 'none',
                            borderRadius: '3px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '500',
                            whiteSpace: 'nowrap'
                          }}
                          whileHover={{ backgroundColor: '#dc2626' }}
                          onClick={() => handleDeletarItem(item.id)}
                        >
                          🗑️ Deletar
                        </motion.button>
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
            <div>
              <div style={{display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'flex-end'}}>
                <button 
                  style={{...styles.button, ...styles.primaryButton}}
                  onClick={gerarPDFMovimentacoes}
                  disabled={isLoading}
                >
                  📥 Baixar PDF
                </button>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Data</th>
                    <th style={styles.tableHeader}>Tipo</th>
                    <th style={styles.tableHeader}>Item</th>
                    <th style={styles.tableHeader}>Quantidade</th>
                    <th style={styles.tableHeader}>Responsável</th>
                    <th style={styles.tableHeader}>Observação</th>
                    <th style={{...styles.tableHeader, textAlign: 'center', padding: '12px 4px'}}>Ações</th>
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
                      <td style={styles.tableCell}>{mov.observacao || '-'}</td>
                      <td style={{...styles.tableCell, padding: '8px 4px'}}>
                        <div style={{display: 'flex', gap: '3px', justifyContent: 'center', alignItems: 'center'}}>
                          <motion.button
                            style={{
                              padding: '3px 6px',
                              fontSize: '0.65rem',
                              border: 'none',
                              borderRadius: '3px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              cursor: 'pointer',
                              fontWeight: '500',
                              whiteSpace: 'nowrap'
                            }}
                            whileHover={{ backgroundColor: '#dc2626' }}
                            onClick={() => handleDeletarMovimentacao(mov.id)}
                          >
                            🗑️ Deletar
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                disabled={isLoading}
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
              <h2 style={styles.modalTitle}>
                {modoEdicao ? '✏️ Editar Item' : '✚ Cadastrar Novo Item'}
              </h2>
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
                disabled={isLoading}
              >
                {modoEdicao ? '💾 Salvar Alterações' : '✚ Cadastrar Item'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Categorias */}
      {showCategoryModal && (
        <div style={styles.modal}>
          <motion.div 
            style={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>🏷️ Gerenciar Categorias</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowCategoryModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nova Categoria</label>
                <input 
                  type="text"
                  style={styles.input}
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  placeholder="Ex: Eletrônicos, Peças, Acessórios..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSalvarCategoria();
                    }
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={styles.label}>Categorias Existentes</label>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px"
                }}>
                  {categorias
                    .filter(cat => cat !== "Todas")
                    .map(categoria => (
                    <div
                      key={categoria}
                      style={{
                        backgroundColor: "#e0f2fe",
                        border: "1px solid #0284c7",
                        color: "#0c4a6e",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      {categoria}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.button, ...styles.outlineButton}}
                onClick={() => {
                  setNovaCategoria("");
                  setShowCategoryModal(false);
                }}
              >
                Fechar
              </button>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={handleSalvarCategoria}
                disabled={isLoading || !novaCategoria.trim()}
              >
                ➕ Adicionar Categoria
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