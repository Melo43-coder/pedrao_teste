import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiUserPlus, FiEdit2, FiTrash2, FiSave, FiX, FiShield, FiLock, FiMail, FiPhone, FiMapPin, FiCamera, FiEye, FiEyeOff } from 'react-icons/fi';
import firebase from '../services/firebase';
import { uploadFile } from '../utils/cnpj';

export default function CRM() {
  const [activeTab, setActiveTab] = useState('funcionarios');
  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const companyCnpj = localStorage.getItem('companyCnpj');
  const userRole = localStorage.getItem('userRole');
  
  // Formulário
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    senha: '',
    role: 'funcionario',
    email: '',
    phone: '',
    address: '',
    addressNumber: '',
    photoURL: '',
    active: true
  });

  // ✅ useEffect ANTES do early return (regra dos hooks)
  useEffect(() => {
    if (companyCnpj && userRole === 'admin') {
      loadData();
    }
  }, [companyCnpj, userRole]);

  // ⚠️ PROTEÇÃO: Apenas ADMIN pode acessar
  if (userRole !== 'admin') {
    return (
      <div style={styles.unauthorizedContainer}>
        <FiShield size={64} color="#ef4444" />
        <h2 style={styles.unauthorizedTitle}>Acesso Negado</h2>
        <p style={styles.unauthorizedText}>
          Esta área é restrita para Administradores.
        </p>
      </div>
    );
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const users = await firebase.listCompanyUsers(companyCnpj);
      
      // Separar funcionários (todos exceto clientes) e clientes
      const funcs = users.filter(u => u.role !== 'cliente');
      const clients = users.filter(u => u.role === 'cliente');
      
      setFuncionarios(funcs);
      setClientes(clients);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do CRM');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username || '',
        displayName: user.displayName || '',
        senha: '',
        role: user.role || 'funcionario',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        addressNumber: user.addressNumber || '',
        photoURL: user.photoURL || '',
        active: user.active !== false
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        displayName: '',
        senha: '',
        role: 'funcionario',
        email: '',
        phone: '',
        address: '',
        addressNumber: '',
        photoURL: '',
        active: true
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.username || !formData.displayName) {
      alert('Preencha usuário e nome');
      return;
    }

    if (!editingUser && !formData.senha) {
      alert('Senha é obrigatória para novos usuários');
      return;
    }

    setLoading(true);
    try {
      if (editingUser) {
        // Atualizar usuário existente
        const updateData = {
          displayName: formData.displayName,
          role: formData.role,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          addressNumber: formData.addressNumber,
          photoURL: formData.photoURL,
          active: formData.active
        };

        // Se mudou a senha, incluir
        if (formData.senha) {
          updateData.senha = formData.senha;
        }

        await firebase.updateUser(companyCnpj, editingUser.id, updateData);
        alert('✅ Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        await firebase.registerUser({
          cnpj: companyCnpj,
          usuario: formData.username,
          senha: formData.senha,
          displayName: formData.displayName,
          role: formData.role,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          addressNumber: formData.addressNumber,
          photoURL: formData.photoURL,
          active: formData.active
        });
        alert('✅ Usuário criado com sucesso!');
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (file) => {
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const photoURL = await uploadFile(file, 'user-photos');
      setFormData({ ...formData, photoURL });
      alert('✅ Foto carregada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('❌ Erro ao fazer upload da foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await firebase.deleteUser(companyCnpj, userId);
      alert('✅ Usuário excluído com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('❌ Erro ao excluir usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    setLoading(true);
    try {
      await firebase.updateUser(companyCnpj, userId, { active: !currentActive });
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('❌ Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const renderUserCard = (user, isCliente = false) => (
    <motion.div
      key={user.id}
      style={styles.userCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div style={styles.userCardHeader}>
        <div style={styles.userInfo}>
          <div style={styles.avatarContainer}>
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} style={styles.avatar} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            {!user.active && <div style={styles.inactiveBadge}>Inativo</div>}
          </div>
          
          <div style={styles.userDetails}>
            <h3 style={styles.userName}>{user.displayName || user.username}</h3>
            <p style={styles.userUsername}>@{user.username}</p>
            
            <div style={styles.roleBadge(user.role)}>
              <FiShield size={12} />
              <span>{user.role}</span>
            </div>
          </div>
        </div>

        <div style={styles.userActions}>
          <button
            style={styles.iconButton}
            onClick={() => handleOpenModal(user)}
            title="Editar"
          >
            <FiEdit2 size={18} />
          </button>
          
          <button
            style={{...styles.iconButton, ...styles.deleteButton}}
            onClick={() => handleDelete(user.id, user.username)}
            title="Excluir"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      <div style={styles.userCardBody}>
        {user.email && (
          <div style={styles.infoRow}>
            <FiMail size={16} color="#64748b" />
            <span>{user.email}</span>
          </div>
        )}
        
        {user.phone && (
          <div style={styles.infoRow}>
            <FiPhone size={16} color="#64748b" />
            <span>{user.phone}</span>
          </div>
        )}
        
        {user.address && (
          <div style={styles.infoRow}>
            <FiMapPin size={16} color="#64748b" />
            <span>{user.address}{user.addressNumber ? `, ${user.addressNumber}` : ''}</span>
          </div>
        )}
      </div>

      <div style={styles.userCardFooter}>
        <button
          style={user.active ? styles.statusButtonActive : styles.statusButtonInactive}
          onClick={() => handleToggleActive(user.id, user.active)}
        >
          {user.active ? 'Desativar' : 'Ativar'}
        </button>
        
        <span style={styles.createdAt}>
          Criado: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </motion.div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>CRM - Gestão Completa</h1>
          <p style={styles.subtitle}>Gerencie funcionários e clientes da sua empresa</p>
        </div>
        
        <button
          style={styles.addButton}
          onClick={() => handleOpenModal()}
        >
          <FiUserPlus size={20} />
          <span>Novo {activeTab === 'funcionarios' ? 'Funcionário' : 'Cliente'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'funcionarios' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('funcionarios')}
        >
          <FiUsers size={20} />
          <span>Funcionários ({funcionarios.length})</span>
        </button>
        
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'clientes' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('clientes')}
        >
          <FiUsers size={20} />
          <span>Clientes ({clientes.length})</span>
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Carregando...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'funcionarios' ? (
              <motion.div
                key="funcionarios"
                style={styles.grid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {funcionarios.length === 0 ? (
                  <div style={styles.emptyState}>
                    <FiUsers size={64} color="#cbd5e1" />
                    <p>Nenhum funcionário cadastrado</p>
                    <button style={styles.addButton} onClick={() => handleOpenModal()}>
                      <FiUserPlus size={20} />
                      <span>Adicionar Primeiro Funcionário</span>
                    </button>
                  </div>
                ) : (
                  funcionarios.map(user => renderUserCard(user))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="clientes"
                style={styles.grid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {clientes.length === 0 ? (
                  <div style={styles.emptyState}>
                    <FiUsers size={64} color="#cbd5e1" />
                    <p>Nenhum cliente cadastrado</p>
                    <button style={styles.addButton} onClick={() => handleOpenModal()}>
                      <FiUserPlus size={20} />
                      <span>Adicionar Primeiro Cliente</span>
                    </button>
                  </div>
                ) : (
                  clientes.map(user => renderUserCard(user, true))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              style={styles.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h2>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                <button style={styles.closeButton} onClick={() => setShowModal(false)}>
                  <FiX size={24} />
                </button>
              </div>

              <div style={styles.modalBody}>
                {/* Foto */}
                <div style={styles.photoSection}>
                  <div style={styles.photoPreview}>
                    {formData.photoURL ? (
                      <img src={formData.photoURL} alt="Preview" style={styles.photoImg} />
                    ) : (
                      <div style={styles.photoPlaceholder}>
                        <FiCamera size={32} color="#94a3b8" />
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.photoActions}>
                    <label style={styles.uploadButton}>
                      <FiCamera size={18} />
                      <span>{uploadingPhoto ? 'Enviando...' : 'Escolher Foto'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleUploadPhoto(e.target.files[0])}
                        disabled={uploadingPhoto}
                      />
                    </label>
                    
                    {formData.photoURL && (
                      <button
                        style={styles.removePhotoButton}
                        onClick={() => setFormData({ ...formData, photoURL: '' })}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>

                {/* Campos do formulário */}
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Usuário *</label>
                    <input
                      type="text"
                      style={styles.input}
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={editingUser}
                      placeholder="usuario123"
                    />
                    {editingUser && (
                      <small style={styles.helpText}>Usuário não pode ser alterado</small>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nome Completo *</label>
                    <input
                      type="text"
                      style={styles.input}
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="João Silva"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Senha {editingUser ? '(deixe vazio para não alterar)' : '*'}
                    </label>
                    <div style={styles.passwordContainer}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        style={styles.input}
                        value={formData.senha}
                        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                        placeholder={editingUser ? 'Nova senha' : 'Digite a senha'}
                      />
                      <button
                        type="button"
                        style={styles.passwordToggle}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FiShield size={16} style={{ marginRight: 6 }} />
                      Nível de Acesso
                    </label>
                    <select
                      style={styles.input}
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="funcionario">Funcionário</option>
                      <option value="prestador">Prestador</option>
                      <option value="gerente">Gerente</option>
                      <option value="admin">Administrador</option>
                      <option value="cliente">Cliente</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FiMail size={16} style={{ marginRight: 6 }} />
                      E-mail
                    </label>
                    <input
                      type="email"
                      style={styles.input}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FiPhone size={16} style={{ marginRight: 6 }} />
                      Telefone
                    </label>
                    <input
                      type="tel"
                      style={styles.input}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FiMapPin size={16} style={{ marginRight: 6 }} />
                      Endereço
                    </label>
                    <input
                      type="text"
                      style={styles.input}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Rua, Av..."
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Número</label>
                    <input
                      type="text"
                      style={styles.input}
                      value={formData.addressNumber}
                      onChange={(e) => setFormData({ ...formData, addressNumber: e.target.value })}
                      placeholder="123"
                    />
                  </div>
                </div>

                {/* Status Ativo */}
                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      style={styles.checkbox}
                    />
                    <span>Usuário ativo</span>
                  </label>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  style={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  <FiX size={18} />
                  <span>Cancelar</span>
                </button>
                
                <button
                  style={styles.saveButton}
                  onClick={handleSave}
                  disabled={loading}
                >
                  <FiSave size={18} />
                  <span>{loading ? 'Salvando...' : 'Salvar'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f8fafc'
  },
  unauthorizedContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
    padding: '24px'
  },
  unauthorizedTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  unauthorizedText: {
    fontSize: '1.125rem',
    color: '#64748b',
    textAlign: 'center',
    maxWidth: '500px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  subtitle: {
    fontSize: '1rem',
    color: '#64748b',
    marginTop: '4px'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '2px solid #e2e8f0'
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '-2px',
    transition: 'all 0.2s'
  },
  activeTab: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6'
  },
  content: {
    minHeight: '400px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px'
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.2s'
  },
  userCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  userInfo: {
    display: 'flex',
    gap: '12px',
    flex: 1
  },
  avatarContainer: {
    position: 'relative'
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  avatarPlaceholder: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '700'
  },
  inactiveBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '0.625rem',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600'
  },
  userDetails: {
    flex: 1
  },
  userName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#0f172a',
    margin: 0,
    marginBottom: '4px'
  },
  userUsername: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: 0,
    marginBottom: '8px'
  },
  roleBadge: (role) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: role === 'admin' ? '#fef3c7' : role === 'gerente' ? '#dbeafe' : role === 'prestador' ? '#e0e7ff' : '#f1f5f9',
    color: role === 'admin' ? '#f59e0b' : role === 'gerente' ? '#3b82f6' : role === 'prestador' ? '#6366f1' : '#64748b'
  }),
  userActions: {
    display: 'flex',
    gap: '8px'
  },
  iconButton: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    color: '#ef4444'
  },
  userCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    color: '#475569'
  },
  userCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0'
  },
  statusButtonActive: {
    padding: '6px 16px',
    backgroundColor: '#dcfce7',
    color: '#16a34a',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  statusButtonInactive: {
    padding: '6px 16px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  createdAt: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    gap: '16px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e2e8f0',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  emptyState: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    gap: '16px',
    backgroundColor: 'white',
    borderRadius: '12px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #e2e8f0'
  },
  closeButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  modalBody: {
    padding: '24px'
  },
  photoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e2e8f0'
  },
  photoPreview: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid #e2e8f0'
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  photoActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  removePhotoButton: {
    padding: '8px 20px',
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#475569'
  },
  input: {
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s'
  },
  passwordContainer: {
    position: 'relative'
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px'
  },
  helpText: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  checkboxGroup: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '24px',
    borderTop: '1px solid #e2e8f0'
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
