import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    cargo: '',
    departamento: '',
    telefone: '',
    foto: null
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveStatus, setSaveStatus] = useState(null);
  
  // Carregar dados do usuário
  useEffect(() => {
    // Simulando dados do usuário
    const userName = localStorage.getItem("userName") || "Usuário";
    const userEmail = localStorage.getItem("userEmail") || "usuario@smartops.com";
    
    // Dados fictícios para demonstração
    const mockUserData = {
      nome: userName,
      email: userEmail,
      cargo: "Gerente de Operações",
      departamento: "Operações",
      telefone: "(11) 98765-4321",
      foto: null
    };
    
    setUserData(mockUserData);
    setFormData(mockUserData);
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          foto: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulando salvamento
    setSaveStatus('saving');
    
    setTimeout(() => {
      setUserData(formData);
      localStorage.setItem("userName", formData.nome);
      localStorage.setItem("userEmail", formData.email);
      
      setSaveStatus('success');
      setIsEditing(false);
      
      // Limpar status após alguns segundos
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }, 1500);
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
            {(userData.foto || formData.foto) ? (
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
                    <p>{userData.departamento}</p>
                  </div>
                </div>
                
                <div className="info-row">
                  <div className="info-group">
                    <label>Telefone</label>
                    <p>{userData.telefone}</p>
                  </div>
                </div>
              </div>
            )}
            
            {saveStatus === 'success' && (
              <div className="save-success">
                ✓ Alterações salvas com sucesso!
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
                <button className="secondary-button">Alterar</button>
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
    </div>
  );
};

export default UserProfile;