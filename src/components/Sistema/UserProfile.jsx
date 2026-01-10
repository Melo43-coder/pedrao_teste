import React, { useState, useEffect } from 'react';
import firebase from '../../services/firebase';
import { uploadFile } from '../../utils/cnpj';

const UserProfile = () => {
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    cargo: '',
    departamento: '',
    telefone: '',
    foto: null,
    address: '',
    addressNumber: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveStatus, setSaveStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Carregar dados reais do usuário
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userName = localStorage.getItem("userName");
      const userEmail = localStorage.getItem("userEmail");
      const companyCnpj = localStorage.getItem("companyCnpj");
      
      console.log('🔍 Carregando perfil - userName:', userName, '| email:', userEmail);
      
      if (!companyCnpj) {
        console.error('CNPJ não encontrado');
        return;
      }

      // Buscar dados do usuário no Firebase
      const users = await firebase.listCompanyUsers(companyCnpj);
      console.log('👥 Usuários disponíveis:', users.map(u => ({ username: u.username, email: u.email })));
      
      // Tentar encontrar por username primeiro, depois por email
      let currentUser = users.find(u => u.username === userName);
      
      if (!currentUser && userEmail) {
        console.log('⚠️ Usuário não encontrado por username, tentando por email...');
        currentUser = users.find(u => u.email === userEmail);
      }
      
      if (!currentUser && users.length > 0) {
        console.log('⚠️ Usando primeiro usuário como fallback');
        currentUser = users[0];
      }
      
      if (currentUser) {
        console.log('✅ Usuário encontrado:', currentUser.username);
        
        // Atualizar localStorage com o username correto
        if (currentUser.username !== userName) {
          console.log('🔄 Atualizando localStorage com username correto:', currentUser.username);
          localStorage.setItem("userName", currentUser.username);
        }
        
        const userDataLoaded = {
          nome: currentUser.displayName || currentUser.username,
          email: currentUser.email || '',
          cargo: currentUser.role === 'admin' ? 'Administrador' : 
                 currentUser.role === 'funcionario' ? 'Funcionário' : 'Prestador',
          departamento: currentUser.departamento || 'Não definido',
          telefone: currentUser.phone || '',
          foto: currentUser.photoURL || null,
          address: currentUser.address || '',
          addressNumber: currentUser.addressNumber || '',
          role: currentUser.role,
          username: currentUser.username,
          documentId: currentUser.id // Guardar o ID real do documento
        };
        
        setUserData(userDataLoaded);
        setFormData(userDataLoaded);
      } else {
        console.error('❌ Nenhum usuário encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploadingPhoto(true);
        const photoURL = await uploadFile(file, 'profile-photos');
        setFormData({
          ...formData,
          foto: photoURL
        });
      } catch (error) {
        console.error('Erro ao fazer upload da foto:', error);
        alert('Erro ao fazer upload da foto: ' + error.message);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaveStatus('saving');
      const companyCnpj = localStorage.getItem("companyCnpj");
      
      // Usar o username que foi carregado dos dados do usuário
      const userName = userData.username || localStorage.getItem("userName");
      
      console.log('🔍 Salvando perfil do usuário:', userName);
      console.log('📊 Dados a atualizar:', {
        displayName: formData.nome,
        email: formData.email,
        phone: formData.telefone,
        departamento: formData.departamento
      });
      
      // Preparar dados para atualização
      const updateData = {
        displayName: formData.nome,
        email: formData.email,
        phone: formData.telefone,
        address: formData.address,
        addressNumber: formData.addressNumber,
        departamento: formData.departamento,
        photoURL: formData.foto
      };
      
      // Atualizar no Firebase
      await firebase.updateUser(companyCnpj, userName, updateData);
      
      console.log('✅ Perfil atualizado com sucesso');
      
      // Atualizar localStorage
      localStorage.setItem("userEmail", formData.email);
      if (formData.nome) {
  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner" style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '20px' }}>Carregando perfil...</p>
        </div>
      </div>
    );
  }

        localStorage.setItem("displayName", formData.nome);
      }
      
      // Atualizar estado local
      setUserData(formData);
      setSaveStatus('success');
      setIsEditing(false);
      
      // Limpar status após alguns segundos
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setSaveStatus('error');
      alert('Erro ao salvar perfil: ' + error.message);
      
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }
    
    try {
      const companyCnpj = localStorage.getItem("companyCnpj");
      const userName = localStorage.getItem("userName");
      
      // Atualizar senha no Firebase
      await firebase.updateUser(companyCnpj, userName, {
        senha: passwordData.newPassword
      });
      
      alert('Senha alterada com sucesso!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha: ' + error.message);
    }
  };
  
  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };
  
  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações pessoais e configurações da conta</p>
      </div>
      
      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-photo-container">
            {(isEditing ? formData.foto : userData.foto) ? (
              <img 
                src={isEditing ? formData.foto : userData.foto} 
                alt="Foto de perfil" 
                className="profile-photo" 
              />
            ) : (
              <div className="profile-photo-placeholder">
                {userData.nome.charAt(0).toUpperCase()}
              </div>
            )}
            
            {isEditing && (
              <label className="change-photo-button">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
                Alterar foto
              </label>
            )}
          </div>
          
          <div className="profile-info-summary">
            <h2>{userData.nome}</h2>
            <p className="user-role">{userData.cargo}</p>
            <p className="user-department">{userData.departamento}</p>
          </div>
          
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                className="edit-profile-button"
                onClick={() => setIsEditing(true)}
              >
                Editar Perfil
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="cancel-button"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-details">
          <div className="profile-section">
            <h3>Informações Pessoais</h3>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nome">Nome Completo</label>
                    <input 
                      type="text" 
                      id="nome" 
                      name="nome" 
                      value={formData.nome || ''} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email || ''} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cargo">Cargo</label>
                    <input 
                      type="text" 
                      id="cargo" 
                      name="cargo" 
                      value={formData.cargo || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="departamento">Departamento</label>
                    <input 
                      type="text" 
                      id="departamento" 
                      name="departamento" 
                      value={formData.departamento || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="telefone">Telefone</label>
                    <input 
                      type="tel" 
                      id="telefone" 
                      name="telefone" 
                      value={formData.telefone || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address">Endereço</label>
                    <input 
                      type="text" 
                      id="address" 
                      name="address" 
                      value={formData.address || ''} 
                      onChange={handleInputChange} 
                      placeholder="Rua, Avenida..."
                    />
                  </div>
                  
                  <div className="form-group" style={{ maxWidth: '150px' }}>
                    <label htmlFor="addressNumber">Número</label>
                    <input 
                      type="text" 
                      id="addressNumber" 
                      name="addressNumber" 
                      value={formData.addressNumber || ''} 
                      onChange={handleInputChange} 
                      placeholder="123"
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  {saveStatus === 'saving' ? (
                    <button type="button" className="save-button saving" disabled>
                      <span className="spinner"></span> Salvando...
                    </button>
                  ) : (
                    <button type="submit" className="save-button">
                      Salvar Alterações
                    </button>
                  )}
                  <button type="button" className="cancel-button" onClick={handleCancel}>
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-row">
                  <div className="info-group">
                    <label>Nome Completo</label>
                    <p>{userData.nome}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>E-mail</label>
                    <p>{userData.email}</p>
                  </div>
                </div>
                
                <div className="info-row">
                  <div className="info-group">
                    <label>Cargo</label>
                    <p>{userData.cargo}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Departamento</label>
                    <p>{userData.departamento || 'Não definido'}</p>
                  </div>
                </div>
                
                <div className="info-row">
                  <div className="info-group">
                    <label>Telefone</label>
                    <p>{userData.telefone || 'Não informado'}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Endereço</label>
                    <p>{userData.address ? `${userData.address}, ${userData.addressNumber || 'S/N'}` : 'Não informado'}</p>
                  </div>
                </div>
              </div>
            )}
            
            {saveStatus === 'success' && (
              <div className="save-success" style={{
                padding: '15px',
                backgroundColor: '#d4edda',
                color: '#155724',
                borderRadius: '8px',
                marginTop: '15px',
                border: '1px solid #c3e6cb'
              }}>
                ✓ Alterações salvas com sucesso!
              </div>
            )}
            
            {saveStatus === 'error' && (
              <div className="save-error" style={{
                padding: '15px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '8px',
                marginTop: '15px',
                border: '1px solid #f5c6cb'
              }}>
                ✗ Erro ao salvar alterações. Tente novamente.
              </div>
            )}
          </div>
          
          <div className="profile-section">
            <h3>Segurança</h3>
            <div className="security-options">
              <div className="security-option">
                <div className="security-option-info">
                  <h4>Alterar Senha</h4>
                  <p>Atualize sua senha para manter sua conta segura</p>
                </div>
                <button 
                  className="secondary-button"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Alterar
                </button>
              </div>
              
              <div className="security-option">
                <div className="security-option-info">
                  <h4>Autenticação em Dois Fatores</h4>
                  <p>Adicione uma camada extra de segurança à sua conta</p>
                </div>
                <button className="secondary-button">Configurar</button>
              </div>
              
              <div className="security-option">
                <div className="security-option-info">
                  <h4>Sessões Ativas</h4>
                  <p>Gerencie dispositivos conectados à sua conta</p>
                </div>
                <button className="secondary-button">Visualizar</button>
              </div>
            </div>
          </div>
          
          <div className="profile-section">
            <h3>Preferências</h3>
            <div className="preferences-options">
              <div className="preference-option">
                <div className="preference-info">
                  <h4>Notificações</h4>
                  <p>Gerencie como você recebe alertas e notificações</p>
                </div>
                <button className="secondary-button">Configurar</button>
              </div>
              
              <div className="preference-option">
                <div className="preference-info">
                  <h4>Idioma e Região</h4>
                  <p>Defina seu idioma preferido e formato de data/hora</p>
                </div>
                <button className="secondary-button">Configurar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Alterar Senha */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{ marginBottom: '20px' }}>Alterar Senha</h2>
            
            <form onSubmit={handlePasswordChange}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="currentPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Senha Atual
                </label>
                <input 
                  type="password" 
                  id="currentPassword" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Nova Senha
                </label>
                <input 
                  type="password" 
                  id="newPassword" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                  minLength={6}
                  required
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Confirmar Nova Senha
                </label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                  minLength={6}
                  required
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#007bff',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Alterar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;