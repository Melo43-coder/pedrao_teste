import React, { useState, useEffect } from 'react';
import firebase from '../../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export default function Configuracoes() {
  // Estados - Checklists
  const [checklists, setChecklists] = useState([]);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [novaChecklist, setNovaChecklist] = useState({
    nome: '',
    descricao: '',
    categoria: 'Geral',
    prestador: '',
    itens: [],
    permitirAssinatura: true,
    permitirFotos: true,
    permitirPDF: true,
    permitirAnotacoes: true,
    obrigatorio: false,
    tempoEstimado: 30,
    instrucoes: '',
    clienteVe: false,
    logoBase64: '' // Logo para aparecer no PDF
  });
  const [checklistItemInput, setChecklistItemInput] = useState('');
  const [checklistItemTipo, setChecklistItemTipo] = useState('texto');

  // Estados - Seguradoras
  const [seguradoras, setSeguradoras] = useState([]);
  const [showSeguradoraModal, setShowSeguradoraModal] = useState(false);
  const [novaSeguradora, setNovaSeguradora] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    contato: '',
    cobertura: '',
    status: 'Ativa'
  });

  // Estados Gerais
  const [isLoading, setIsLoading] = useState(true);
  const [cnpj, setCnpj] = useState('');
  const [editingChecklistId, setEditingChecklistId] = useState(null);
  const [editingSeguradoraId, setEditingSeguradoraId] = useState(null);
  const [activeTab, setActiveTab] = useState('checklists');
  const [multiplaEscolhaOpcoes, setMultiplaEscolhaOpcoes] = useState('');
  const [showOpcoesInput, setShowOpcoesInput] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  // Carregar CNPJ
  useEffect(() => {
    const cnpjArmazenado = localStorage.getItem('companyCnpj');
    if (cnpjArmazenado) {
      setCnpj(cnpjArmazenado);
      carregarChecklists(cnpjArmazenado);
      carregarSeguradoras(cnpjArmazenado);
    }
    setIsLoading(false);
  }, []);

  // ============ CHECKLISTS ============

  const carregarChecklists = async (cnpjEmpresa) => {
    try {
      console.log(`📋 Carregando checklists do Firebase para CNPJ: ${cnpjEmpresa}`);
      const checklistsDb = await firebase.listarChecklists(cnpjEmpresa).catch(() => []);
      setChecklists(checklistsDb);
      console.log(`✅ ${checklistsDb.length} checklists carregadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar checklists:', error);
    }
  };

  const adicionarItemChecklist = () => {
    if (checklistItemInput.trim()) {
      const novoItem = { 
        id: Date.now(),
        texto: checklistItemInput, 
        tipo: checklistItemTipo,
        obrigatorio: false,
        dica: ''
      };

      // Se for múltipla escolha, adicionar as opções
      if (checklistItemTipo === 'multipla_escolha') {
        if (!multiplaEscolhaOpcoes.trim()) {
          alert('❌ Adicione as opções para múltipla escolha (separadas por vírgula)');
          return;
        }
        novoItem.opcoes = multiplaEscolhaOpcoes.split(',').map(op => op.trim()).filter(op => op);
      }

      setNovaChecklist({
        ...novaChecklist,
        itens: [...novaChecklist.itens, novoItem]
      });
      setChecklistItemInput('');
      setChecklistItemTipo('texto');
      setMultiplaEscolhaOpcoes('');
      setShowOpcoesInput(false);
    }
  };

  const removerItemChecklist = (itemId) => {
    setNovaChecklist({
      ...novaChecklist,
      itens: novaChecklist.itens.filter(item => item.id !== itemId)
    });
  };

  // Funções de Drag and Drop para reordenar itens
  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetItem) => {
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const items = [...novaChecklist.itens];
    const draggedIndex = items.findIndex(item => item.id === draggedItem.id);
    const targetIndex = items.findIndex(item => item.id === targetItem.id);

    // Remove o item da posição original
    const [removed] = items.splice(draggedIndex, 1);
    // Insere na nova posição
    items.splice(targetIndex, 0, removed);

    setNovaChecklist({
      ...novaChecklist,
      itens: items
    });
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const salvarChecklist = async () => {
    if (!novaChecklist.nome.trim()) {
      alert('❌ Nome da checklist é obrigatório!');
      return;
    }

    if (!novaChecklist.descricao.trim()) {
      alert('❌ Descrição é obrigatória!');
      return;
    }

    if (novaChecklist.itens.length === 0) {
      alert('❌ Adicione pelo menos um item à checklist!');
      return;
    }

    try {
      if (editingChecklistId) {
        await firebase.atualizarChecklist(cnpj, editingChecklistId, novaChecklist);
        console.log(`✅ Checklist atualizada: ${novaChecklist.nome}`);
      } else {
        await firebase.criarChecklist(cnpj, {
          ...novaChecklist,
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString()
        });
        console.log(`✅ Checklist criada: ${novaChecklist.nome}`);
      }

      await carregarChecklists(cnpj);
      resetarFormularioChecklist();
    } catch (error) {
      console.error('❌ Erro ao salvar checklist:', error);
      alert('Erro ao salvar checklist');
    }
  };

  const resetarFormularioChecklist = () => {
    setNovaChecklist({
      nome: '',
      descricao: '',
      categoria: 'Geral',
      prestador: '',
      itens: [],
      permitirAssinatura: true,
      permitirFotos: true,
      permitirPDF: true,
      permitirAnotacoes: true,
      obrigatorio: false,
      tempoEstimado: 30,
      instrucoes: '',
      clienteVe: false,
      logoBase64: ''
    });
    setEditingChecklistId(null);
    setShowChecklistModal(false);
  };

  // Função para fazer upload da logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('❌ Por favor, selecione apenas arquivos de imagem (PNG, JPG, etc.)');
      return;
    }

    // Validar tamanho (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('❌ A imagem deve ter no máximo 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNovaChecklist({ ...novaChecklist, logoBase64: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const editarChecklist = (checklist) => {
    setNovaChecklist(checklist);
    setEditingChecklistId(checklist.id);
    setShowChecklistModal(true);
  };

  const deletarChecklist = async (checklistId) => {
    if (window.confirm('Tem certeza que deseja deletar esta checklist?')) {
      try {
        await firebase.deletarChecklist(cnpj, checklistId);
        console.log(`✅ Checklist deletada`);
        await carregarChecklists(cnpj);
      } catch (error) {
        console.error('❌ Erro ao deletar checklist:', error);
      }
    }
  };

  // ============ SEGURADORAS ============

  const carregarSeguradoras = async (cnpjEmpresa) => {
    try {
      console.log(`🏢 Carregando seguradoras do Firebase para CNPJ: ${cnpjEmpresa}`);
      const seguradoresDb = await firebase.listarSeguradoras(cnpjEmpresa).catch(() => []);
      setSeguradoras(seguradoresDb);
      console.log(`✅ ${seguradoresDb.length} seguradoras carregadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar seguradoras:', error);
    }
  };

  const salvarSeguradora = async () => {
    if (!novaSeguradora.nome.trim() || !novaSeguradora.cnpj.trim()) {
      alert('❌ Nome e CNPJ são obrigatórios!');
      return;
    }

    try {
      if (editingSeguradoraId) {
        await firebase.atualizarSeguradora(cnpj, editingSeguradoraId, novaSeguradora);
        console.log(`✅ Seguradora atualizada: ${novaSeguradora.nome}`);
      } else {
        await firebase.criarSeguradora(cnpj, {
          ...novaSeguradora,
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString()
        });
        console.log(`✅ Seguradora criada: ${novaSeguradora.nome}`);
      }

      await carregarSeguradoras(cnpj);
      resetarFormularioSeguradora();
    } catch (error) {
      console.error('❌ Erro ao salvar seguradora:', error);
      alert('Erro ao salvar seguradora');
    }
  };

  const resetarFormularioSeguradora = () => {
    setNovaSeguradora({
      nome: '',
      cnpj: '',
      telefone: '',
      email: '',
      contato: '',
      cobertura: '',
      status: 'Ativa'
    });
    setEditingSeguradoraId(null);
    setShowSeguradoraModal(false);
  };

  const editarSeguradora = (seguradora) => {
    setNovaSeguradora(seguradora);
    setEditingSeguradoraId(seguradora.id);
    setShowSeguradoraModal(true);
  };

  const deletarSeguradora = async (seguradoraId) => {
    if (window.confirm('Tem certeza que deseja deletar esta seguradora?')) {
      try {
        await firebase.deletarSeguradora(cnpj, seguradoraId);
        console.log(`✅ Seguradora deletada`);
        await carregarSeguradoras(cnpj);
      } catch (error) {
        console.error('❌ Erro ao deletar seguradora:', error);
      }
    }
  };

  // ============ RENDER ============

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
        ⏳ Carregando configurações...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '30px' }}
      >
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>
          ⚙️ Configurações do Sistema
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Gerencie checklists personalizadas e seguradoras da sua empresa
        </p>
      </motion.div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('checklists')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'checklists' ? '#2C30D5' : 'transparent',
            color: activeTab === 'checklists' ? '#fff' : '#64748b',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          📋 Checklists
        </button>
        <button
          onClick={() => setActiveTab('seguradoras')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'seguradoras' ? '#11A561' : 'transparent',
            color: activeTab === 'seguradoras' ? '#fff' : '#64748b',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          🏢 Seguradoras
        </button>
      </div>

      {/* Conteúdo Abas */}
      <AnimatePresence mode="wait">
        {activeTab === 'checklists' ? (
          <motion.div
            key="checklists"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Botão Criar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>
                Checklists Disponíveis
              </h2>
              <button
                onClick={() => {
                  resetarFormularioChecklist();
                  setShowChecklistModal(true);
                }}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #2C30D5 0%, #889DD3 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                }}
              >
                + Criar Nova Checklist
              </button>
            </div>

            {/* Lista de Checklists */}
            {checklists.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: '#fff',
                  borderRadius: '12px',
                  color: '#94a3b8'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  Nenhuma checklist criada
                </p>
                <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
                  Crie sua primeira checklist para os prestadores utilizarem com os clientes
                </p>
              </motion.div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {checklists.map((checklist) => (
                  <motion.div
                    key={checklist.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      background: '#fff',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{ boxShadow: '0 8px 16px rgba(102, 126, 234, 0.15)', y: -4 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
                          {checklist.nome}
                        </h3>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                          {checklist.categoria}
                        </p>
                      </div>
                      <span style={{
                        background: checklist.obrigatorio ? '#fee2e2' : '#dcfce7',
                        color: checklist.obrigatorio ? '#dc2626' : '#166534',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {checklist.obrigatorio ? '🔒 Obrigatória' : '✓ Opcional'}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                      {checklist.descricao}
                    </p>

                    <div style={{
                      background: '#f8fafc',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                      fontSize: '12px'
                    }}>
                      <div>
                        <span style={{ color: '#94a3b8', fontWeight: '600' }}>📋 Itens:</span>
                        <div style={{ color: '#0f172a', fontWeight: '700' }}>{checklist.itens.length}</div>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', fontWeight: '600' }}>⏱️ Tempo:</span>
                        <div style={{ color: '#0f172a', fontWeight: '700' }}>{checklist.tempoEstimado} min</div>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', fontWeight: '600' }}>👤 Para:</span>
                        <div style={{ color: '#0f172a', fontWeight: '700' }}>{checklist.prestador || 'Todos'}</div>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', fontWeight: '600' }}>👁️ Cliente vê:</span>
                        <div style={{ color: '#0f172a', fontWeight: '700' }}>{checklist.clienteVe ? 'Sim' : 'Não'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {checklist.permitirAssinatura && <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>✍️ Assinatura</span>}
                      {checklist.permitirFotos && <span style={{ background: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>📷 Fotos</span>}
                      {checklist.permitirPDF && <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>📄 PDF</span>}
                      {checklist.permitirAnotacoes && <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>📝 Anotações</span>}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => editarChecklist(checklist)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: '#dbeafe',
                          color: '#0284c7',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => deletarChecklist(checklist.id)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        🗑️ Deletar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="seguradoras"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Botão Criar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>
                Seguradoras Cadastradas
              </h2>
              <button
                onClick={() => {
                  resetarFormularioSeguradora();
                  setShowSeguradoraModal(true);
                }}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #2C30D5 0%, #889DD3 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
              >
                + Adicionar Seguradora
              </button>
            </div>

            {/* Lista de Seguradoras */}
            {seguradoras.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: '#fff',
                  borderRadius: '12px',
                  color: '#94a3b8'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  Nenhuma seguradora cadastrada
                </p>
                <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
                  Adicione seguradoras para associá-las aos seus clientes
                </p>
              </motion.div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}>
                {seguradoras.map((seguradora) => (
                  <motion.div
                    key={seguradora.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{ boxShadow: '0 8px 16px rgba(16, 185, 129, 0.15)', y: -4 }}
                  >
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'start' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '8px',
                        background: '#dbeafe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#0284c7'
                      }}>
                        {seguradora.nome.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                          {seguradora.nome}
                        </h3>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                          CNPJ: {seguradora.cnpj}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      paddingTop: '12px',
                      borderTop: '1px solid #cbd5e1'
                    }}>
                      {seguradora.telefone && (
                        <div style={{ fontSize: '12px', color: '#475569' }}>
                          <span style={{ fontWeight: '600', color: '#64748b' }}>📞</span> {seguradora.telefone}
                        </div>
                      )}
                      {seguradora.email && (
                        <div style={{ fontSize: '12px', color: '#475569', wordBreak: 'break-all' }}>
                          <span style={{ fontWeight: '600', color: '#64748b' }}>📧</span> {seguradora.email}
                        </div>
                      )}
                      {seguradora.contato && (
                        <div style={{ fontSize: '12px', color: '#475569' }}>
                          <span style={{ fontWeight: '600', color: '#64748b' }}>👤</span> {seguradora.contato}
                        </div>
                      )}
                    </div>

                    <span style={{
                      display: 'inline-block',
                      marginTop: '12px',
                      background: seguradora.status === 'Ativa' ? '#dcfce7' : '#fee2e2',
                      color: seguradora.status === 'Ativa' ? '#166534' : '#991b1b',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {seguradora.status === 'Ativa' ? '✅ Ativa' : '❌ Inativa'}
                    </span>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        onClick={() => editarSeguradora(seguradora)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: '#dbeafe',
                          color: '#0284c7',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => deletarSeguradora(seguradora.id)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        🗑️ Deletar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ MODAL CHECKLIST AVANÇADO ============ */}
      <AnimatePresence>
        {showChecklistModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowChecklistModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
              }}
            >
              {/* Header */}
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #2C30D5 0%, #889DD3 100%)',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  {editingChecklistId ? '✏️ Editar Checklist' : '📋 Criar Nova Checklist'}
                </h2>
                <button
                  onClick={() => setShowChecklistModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '24px',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '24px' }}>
                {/* Seção 1: Informações Básicas */}
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                    📝 Informações Básicas
                  </h3>

                  {/* Logo/Imagem para o PDF */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                      🖼️ Logo/Imagem (aparecerá no cabeçalho do PDF)
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      gap: '16px', 
                      alignItems: 'center',
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '2px dashed #cbd5e1'
                    }}>
                      {novaChecklist.logoBase64 ? (
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                          <img 
                            src={novaChecklist.logoBase64} 
                            alt="Logo Preview" 
                            style={{ 
                              width: '80px', 
                              height: '80px', 
                              objectFit: 'contain',
                              borderRadius: '8px',
                              background: '#fff',
                              padding: '8px',
                              border: '1px solid #e2e8f0'
                            }} 
                          />
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>
                              ✅ Logo carregada com sucesso
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                              Esta imagem aparecerá no topo do PDF da checklist
                            </p>
                          </div>
                          <button
                            onClick={() => setNovaChecklist({ ...novaChecklist, logoBase64: '' })}
                            style={{
                              padding: '8px 16px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️ Remover
                          </button>
                        </div>
                      ) : (
                        <div style={{ flex: 1 }}>
                          <label 
                            htmlFor="logo-upload"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '20px',
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}
                          >
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                            <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                              Clique para selecionar uma imagem
                            </p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                              PNG, JPG ou GIF (máx. 2MB)
                            </p>
                          </label>
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            style={{ display: 'none' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                      Nome da Checklist *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Manutenção Preventiva"
                      value={novaChecklist.nome}
                      onChange={(e) => setNovaChecklist({ ...novaChecklist, nome: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                      Descrição *
                    </label>
                    <textarea
                      placeholder="Descreva o propósito e benefícios desta checklist..."
                      value={novaChecklist.descricao}
                      onChange={(e) => setNovaChecklist({ ...novaChecklist, descricao: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        minHeight: '80px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                        Categoria
                      </label>
                      <select
                        value={novaChecklist.categoria}
                        onChange={(e) => setNovaChecklist({ ...novaChecklist, categoria: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="Geral">Geral</option>
                        <option value="Manutenção">Manutenção</option>
                        <option value="Instalação">Instalação</option>
                        <option value="Inspeção">Inspeção</option>
                        <option value="Reparação">Reparação</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                        Tempo Estimado (min)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={novaChecklist.tempoEstimado}
                        onChange={(e) => setNovaChecklist({ ...novaChecklist, tempoEstimado: parseInt(e.target.value) || 30 })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 2: Instruções e Visibilidade */}
                <div style={{ marginBottom: '28px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                    📋 Instruções e Visibilidade
                  </h3>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                      Instruções para o Prestador
                    </label>
                    <textarea
                      placeholder="Instruções detalhadas sobre como preencher esta checklist..."
                      value={novaChecklist.instrucoes}
                      onChange={(e) => setNovaChecklist({ ...novaChecklist, instrucoes: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        minHeight: '70px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}>
                      <input
                        type="checkbox"
                        checked={novaChecklist.clienteVe}
                        onChange={(e) => setNovaChecklist({ ...novaChecklist, clienteVe: e.target.checked })}
                      />
                      <span>👁️ Cliente vê a checklist?</span>
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}>
                      <input
                        type="checkbox"
                        checked={novaChecklist.obrigatorio}
                        onChange={(e) => setNovaChecklist({ ...novaChecklist, obrigatorio: e.target.checked })}
                      />
                      <span>🔒 Checklist obrigatória?</span>
                    </label>
                  </div>
                </div>

                {/* Seção 3: Funcionalidades Permitidas */}
                <div style={{ marginBottom: '28px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                    🛠️ Funcionalidades Permitidas
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: novaChecklist.permitirAssinatura ? '#dcfce7' : '#f8fafc',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      <input
                        type="checkbox"
                        checked={novaChecklist.permitirAssinatura}
                        onChange={(e) => setNovaChecklist({ ...novaChecklist, permitirAssinatura: e.target.checked })}
                      />
                      <span>✍️ Assinatura Digital</span>
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: novaChecklist.permitirFotos ? '#dcfce7' : '#f8fafc',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      <input
                        type="checkbox"
                        checked={novaChecklist.permitirFotos}
                        onChange={(e) => setNovaChecklist({ ...novaChecklist, permitirFotos: e.target.checked })}
                      />
                      <span>📷 Fotos/Imagens</span>
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: novaChecklist.permitirPDF ? '#dcfce7' : '#f8fafc',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      <input
                        type="checkbox"
                        checked={novaChecklist.permitirPDF}
                        onChange={(e) => setNovaChecklist({ ...novaChecklist, permitirPDF: e.target.checked })}
                      />
                      <span>📄 Arquivos PDF</span>
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: novaChecklist.permitirAnotacoes ? '#dcfce7' : '#f8fafc',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      <input
                        type="checkbox"
                        checked={novaChecklist.permitirAnotacoes}
                        onChange={(e) => setNovaChecklist({ ...novaChecklist, permitirAnotacoes: e.target.checked })}
                      />
                      <span>📝 Anotações Livres</span>
                    </label>
                  </div>
                </div>

                {/* Seção 4: Itens da Checklist */}
                <div style={{ paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                    ✓ Itens da Checklist *
                  </h3>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <input
                      type="text"
                      placeholder="Descrição do item..."
                      value={checklistItemInput}
                      onChange={(e) => setChecklistItemInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && adicionarItemChecklist()}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontFamily: 'inherit'
                      }}
                    />
                    <select
                      value={checklistItemTipo}
                      onChange={(e) => {
                        setChecklistItemTipo(e.target.value);
                        setShowOpcoesInput(e.target.value === 'multipla_escolha');
                      }}
                      style={{
                        padding: '10px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontFamily: 'inherit'
                      }}
                    >
                      <option value="texto">📝 Texto</option>
                      <option value="foto">📷 Foto</option>
                      <option value="assinatura">✍️ Assinatura</option>
                      <option value="numero">🔢 Número</option>
                      <option value="data">📅 Data</option>
                      <option value="observacao">💬 Observação</option>
                      <option value="multipla_escolha">☑️ Múltipla Escolha</option>
                    </select>
                    <button
                      onClick={adicionarItemChecklist}
                      style={{
                        padding: '10px 16px',
                        background: '#2C30D5',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      + Adicionar
                    </button>
                  </div>

                  {/* Input para opções de múltipla escolha */}
                  {showOpcoesInput && (
                    <div style={{
                      marginBottom: '16px',
                      padding: '12px',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '8px'
                    }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                        ☑️ Opções da Múltipla Escolha (separe por vírgula)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Opção 1, Opção 2, Opção 3"
                        value={multiplaEscolhaOpcoes}
                        onChange={(e) => setMultiplaEscolhaOpcoes(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #bae6fd',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      />
                      <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                        💡 Digite as opções separadas por vírgula. Ex: "Sim, Não, Não se aplica"
                      </p>
                    </div>
                  )}

                  {novaChecklist.itens.length === 0 ? (
                    <div style={{
                      padding: '24px',
                      textAlign: 'center',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      color: '#94a3b8',
                      fontSize: '13px'
                    }}>
                      Nenhum item adicionado. Comece adicionando os itens desta checklist.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {novaChecklist.itens.map((item, idx) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => handleDragStart(item)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(item)}
                          onDragEnd={handleDragEnd}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            padding: '16px',
                            background: draggedItem?.id === item.id ? '#e0e7ff' : (item.obrigatorio ? '#fef3c7' : '#f8fafc'),
                            border: draggedItem?.id === item.id ? '2px dashed #2C30D5' : (item.obrigatorio ? '2px solid #f59e0b' : '1px solid #e2e8f0'),
                            borderRadius: '8px',
                            transition: 'all 0.2s',
                            cursor: 'grab',
                            opacity: draggedItem?.id === item.id ? 0.5 : 1
                          }}
                        >
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            {/* Ícone de arrastar */}
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              gap: '2px',
                              cursor: 'grab',
                              padding: '4px',
                              color: '#94a3b8'
                            }}>
                              <div style={{ width: '16px', height: '2px', background: 'currentColor', borderRadius: '1px' }}></div>
                              <div style={{ width: '16px', height: '2px', background: 'currentColor', borderRadius: '1px' }}></div>
                              <div style={{ width: '16px', height: '2px', background: 'currentColor', borderRadius: '1px' }}></div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                color: '#0f172a', 
                                marginBottom: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span style={{
                                  display: 'inline-block',
                                  width: '24px',
                                  height: '24px',
                                  background: item.obrigatorio ? '#f59e0b' : '#94a3b8',
                                  color: 'white',
                                  borderRadius: '50%',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {idx + 1}
                                </span>
                                {item.texto}
                                {item.obrigatorio && <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '700' }}>★ OBRIGATÓRIO</span>}
                              </div>
                              <div style={{ 
                                fontSize: '12px', 
                                color: '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                flexWrap: 'wrap'
                              }}>
                                <span style={{
                                  padding: '2px 8px',
                                  background: '#e0e7ff',
                                  color: '#4f46e5',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}>
                                  {item.tipo === 'texto' && '📝 Texto'}
                                  {item.tipo === 'foto' && '📷 Foto'}
                                  {item.tipo === 'assinatura' && '✍️ Assinatura'}
                                  {item.tipo === 'numero' && '🔢 Número'}
                                  {item.tipo === 'data' && '📅 Data'}
                                  {item.tipo === 'observacao' && '💬 Observação'}
                                  {item.tipo === 'multipla_escolha' && '☑️ Múltipla Escolha'}
                                </span>
                              </div>
                              {item.tipo === 'multipla_escolha' && item.opcoes && (
                                <div style={{
                                  marginTop: '8px',
                                  padding: '8px',
                                  background: '#f0f9ff',
                                  border: '1px solid #bae6fd',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  color: '#0369a1'
                                }}>
                                  <strong>Opções:</strong> {item.opcoes.join(', ')}
                                </div>
                              )}
                              {item.dica && (
                                <div style={{
                                  marginTop: '8px',
                                  padding: '8px',
                                  background: '#e0f2fe',
                                  borderLeft: '3px solid #2C30D5',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  color: '#0c4a6e'
                                }}>
                                  💡 {item.dica}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => removerItemChecklist(item.id)}
                              style={{
                                padding: '8px 12px',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              🗑️ Remover
                            </button>
                          </div>

                          {/* Controles de personalização */}
                          <div style={{
                            display: 'flex',
                            gap: '12px',
                            flexWrap: 'wrap',
                            paddingTop: '12px',
                            borderTop: '1px solid #e2e8f0'
                          }}>
                            <label style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '13px',
                              color: '#64748b',
                              cursor: 'pointer',
                              padding: '6px 12px',
                              background: item.obrigatorio ? '#fef3c7' : '#fff',
                              border: item.obrigatorio ? '1px solid #f59e0b' : '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontWeight: item.obrigatorio ? '600' : '500',
                              transition: 'all 0.2s'
                            }}>
                              <input
                                type="checkbox"
                                checked={item.obrigatorio}
                                onChange={(e) => {
                                  const novoItens = [...novaChecklist.itens];
                                  const itemIdx = novoItens.findIndex(i => i.id === item.id);
                                  novoItens[itemIdx].obrigatorio = e.target.checked;
                                  setNovaChecklist({ ...novaChecklist, itens: novoItens });
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                              {item.obrigatorio ? '★ Campo Obrigatório' : '☆ Tornar Obrigatório'}
                            </label>

                            <input
                              type="text"
                              placeholder="💡 Adicionar dica para o prestador..."
                              value={item.dica || ''}
                              onChange={(e) => {
                                const novoItens = [...novaChecklist.itens];
                                const itemIdx = novoItens.findIndex(i => i.id === item.id);
                                novoItens[itemIdx].dica = e.target.value;
                                setNovaChecklist({ ...novaChecklist, itens: novoItens });
                              }}
                              style={{
                                flex: 1,
                                padding: '6px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                minWidth: '200px'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: '20px 24px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setShowChecklistModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#e2e8f0',
                    color: '#334155',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarChecklist}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #2C30D5 0%, #889DD3 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  💾 {editingChecklistId ? 'Atualizar' : 'Criar'} Checklist
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ MODAL SEGURADORA ============ */}
      <AnimatePresence>
        {showSeguradoraModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSeguradoraModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
              }}
            >
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #2C30D5 0%, #889DD3 100%)',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  {editingSeguradoraId ? '✏️ Editar Seguradora' : '🏢 Nova Seguradora'}
                </h2>
                <button
                  onClick={() => setShowSeguradoraModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '24px',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                    Nome da Seguradora *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Allianz Seguros"
                    value={novaSeguradora.nome}
                    onChange={(e) => setNovaSeguradora({ ...novaSeguradora, nome: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                      CNPJ *
                    </label>
                    <input
                      type="text"
                      placeholder="XX.XXX.XXX/0001-XX"
                      value={novaSeguradora.cnpj}
                      onChange={(e) => setNovaSeguradora({ ...novaSeguradora, cnpj: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                      Telefone
                    </label>
                    <input
                      type="tel"
                      placeholder="(XX) XXXXX-XXXX"
                      value={novaSeguradora.telefone}
                      onChange={(e) => setNovaSeguradora({ ...novaSeguradora, telefone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="contato@seguradora.com"
                    value={novaSeguradora.email}
                    onChange={(e) => setNovaSeguradora({ ...novaSeguradora, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                    Contato (Responsável)
                  </label>
                  <input
                    type="text"
                    placeholder="Nome do representante"
                    value={novaSeguradora.contato}
                    onChange={(e) => setNovaSeguradora({ ...novaSeguradora, contato: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                    Cobertura
                  </label>
                  <textarea
                    placeholder="Descreva os tipos de cobertura..."
                    value={novaSeguradora.cobertura}
                    onChange={(e) => setNovaSeguradora({ ...novaSeguradora, cobertura: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      minHeight: '60px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                    Status
                  </label>
                  <select
                    value={novaSeguradora.status}
                    onChange={(e) => setNovaSeguradora({ ...novaSeguradora, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Ativa">✅ Ativa</option>
                    <option value="Inativa">❌ Inativa</option>
                  </select>
                </div>
              </div>

              <div style={{
                padding: '20px 24px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setShowSeguradoraModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#e2e8f0',
                    color: '#334155',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarSeguradora}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #2C30D5 0%, #889DD3 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  💾 {editingSeguradoraId ? 'Atualizar' : 'Adicionar'} Seguradora
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
