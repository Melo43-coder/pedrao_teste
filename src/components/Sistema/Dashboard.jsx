import React, { useState, useEffect } from "react";
import { NavLink, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OrdemServico from "./OrdemServico";
import Compras from "./Compras";
import Estoque from "./Estoque";
import Financeiro from "./Financeiro";
import CRM from "../../crm/CRM"; // Novo CRM completo com proteção ADMIN
import Chat from "./Chat";
import Automacao from "./Automacao";
import Configuracoes from "./Configuracoes";
import Home from "./Home";
import UserProfile from "./UserProfile"; // Novo componente para perfil do usuário
import UsersEdit from "./UsersEdit"; // Área de edição/cadastro/exclusão de usuários (admin/gerente)
import "../styles/Dashboard.css";
import "../../styles/responsive.css";
import "../../styles/sistema.css";

// small helper to format normalized CNPJ (only digits)
function formatCnpjDigits(value) {
  if (!value) return '';
  const s = value.replace(/\D/g, '');
  if (s.length !== 14) return value;
  return `${s.substring(0,2)}.${s.substring(2,5)}.${s.substring(5,8)}/${s.substring(8,12)}-${s.substring(12,14)}`;
}

// Ícones para cada rota/aba
const menu = [
  { label: "Dashboard", path: "home", icon: "📊", description: "Visão geral do sistema" },
  { label: "Ordem de Serviço", path: "os", icon: "📝", description: "Gestão de ordens e chamados" },
  { label: "Compras", path: "compras", icon: "🛒", description: "Cotações e fornecedores" },
  { label: "Estoque", path: "estoque", icon: "📦", description: "Controle de inventário" },
  { label: "Financeiro", path: "financeiro", icon: "💰", description: "Contas e fluxo de caixa" },
  { label: "CRM", path: "crm", icon: "👥", description: "Gestão de clientes" },
  { label: "Chat", path: "chat", icon: "💬", description: "Comunicação em tempo real" },
  { label: "Automação", path: "automacao", icon: "🤖", description: "Processos automatizados" },
  { label: "Configurações", path: "configuracoes", icon: "⚙️", description: "Checklists e Seguradoras" }
];

// Componente de Breadcrumb para melhorar a navegação
const Breadcrumb = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').filter(x => x);
  // Pegamos apenas o último segmento do caminho após "dashboard"
  const dashboardIndex = currentPath.findIndex(segment => segment === "dashboard");
  const activePath = dashboardIndex >= 0 && dashboardIndex + 1 < currentPath.length 
    ? currentPath[dashboardIndex + 1] 
    : "home";
  
  // Verificar se estamos na página de perfil
  if (activePath === "perfil") {
    return (
      <div className="breadcrumb">
        <span className="breadcrumb-home">SmartOps</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Meu Perfil</span>
      </div>
    );
  }
  
  const currentMenu = menu.find(item => item.path === activePath);

  return (
    <div className="breadcrumb">
      <span className="breadcrumb-home">SmartOps</span>
      <span className="breadcrumb-separator">/</span>
      {currentMenu && (
        <span className="breadcrumb-current">
          {currentMenu.label}
        </span>
      )}
    </div>
  );
};

// Componente de Tooltip para os itens do menu
const MenuTooltip = ({ children, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div 
      className="tooltip-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="tooltip">
          {tooltip}
        </div>
      )}
    </div>
  );
};

// Componente da Barra Lateral
function Sidebar({ isMobileMenuOpen, toggleMobileMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Usuário";
  const userEmail = localStorage.getItem("userEmail") || "usuario@smartops.com";
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = localStorage.getItem('userRole') || 'user';
  const companyCnpj = localStorage.getItem('companyCnpj') || '';
  const companyBadge = companyCnpj ? formatCnpjDigits(companyCnpj) : '';
  
  // Fechar menu móvel ao mudar de rota
  useEffect(() => {
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleProfileClick = () => {
    // Navegação absoluta para evitar acumulação de caminhos
    navigate("/dashboard/perfil");
  };

  return (
    <aside className={`sidebar ${isMobileMenuOpen ? "open" : ""}`}>
      <div className="logo-container">
        <h1 className="logo">
          <span className="logo-icon">S</span>
          SmartOps
        </h1>
      </div>
      
      <div className="menu-section">
        <div className="menu-title">
          Menu Principal
        </div>
      </div>
      
      <nav className="main-nav">
        <ul className="nav-list">
          {menu.map(item => (
            <li key={item.path} className="nav-item">
              <MenuTooltip tooltip={item.description}>
                <NavLink
                  to={`/dashboard/${item.path}`} // Caminho absoluto para evitar acumulação
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  end
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="menu-text">{item.label}</span>
                </NavLink>
              </MenuTooltip>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="menu-section support-section">
        <div className="menu-title">
          Suporte
        </div>
      </div>
      
      <div className="support-container">
        <a href="#help" className="support-link">
          <span className="support-icon">❓</span>
          <span className="menu-text">Ajuda e Suporte</span>
        </a>
      </div>
      {/* Admin-only link to manage company users */}
      {userRole === 'admin' && (
        <div style={{ padding: '8px 20px' }}>
          <NavLink to="/dashboard/crm" className="menu-link crm-link">
            Usuários (empresa){companyBadge ? <span className="company-badge">{companyBadge}</span> : null}
          </NavLink>
        </div>
      )}
      {(userRole === 'admin' || userRole === 'gerente') && (
        <div style={{ padding: '4px 20px 12px' }}>
          <NavLink to="/dashboard/users-edit" className="menu-link crm-link">
            Gerenciar Usuários
          </NavLink>
        </div>
      )}
      
      <div className="user-profile">
        <div className="profile-card" onClick={handleProfileClick}>
          <div className="avatar">{userInitial}</div>
          <div className="user-info">
            <div className="user-name">{userName}</div>
            <div className="user-email">{userEmail}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Componente de menu dropdown do usuário
const UserDropdown = ({ isOpen, onClose, onLogout, onProfileClick }) => {
  if (!isOpen) return null;
  
  return (
    <div className="user-dropdown">
      <div className="dropdown-arrow"></div>
      <ul className="dropdown-menu">
        <li className="dropdown-item" onClick={onProfileClick}>
          <span className="dropdown-icon">👤</span>
          Meu Perfil
        </li>
        <li className="dropdown-item">
          <span className="dropdown-icon">⚙️</span>
          Configurações
        </li>
        <li className="dropdown-divider"></li>
        <li className="dropdown-item logout-item" onClick={onLogout}>
          <span className="dropdown-icon">🚪</span>
          Sair
        </li>
      </ul>
    </div>
  );
};

// Componente de Header com controles de navegação
const Header = ({ toggleMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);
  const [notificacoes, setNotificacoes] = useState([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  
  const companyCnpj = localStorage.getItem('companyCnpj') || '';
  const userName = localStorage.getItem('userName') || 'Usuário';
  
  // Extrair o caminho ativo após "dashboard"
  const currentPath = location.pathname.split('/').filter(x => x);
  const dashboardIndex = currentPath.findIndex(segment => segment === "dashboard");
  const activePath = dashboardIndex >= 0 && dashboardIndex + 1 < currentPath.length 
    ? currentPath[dashboardIndex + 1] 
    : "home";
  
  // Verificar se estamos na página de perfil
  const isProfilePage = activePath === "perfil";
  const pageTitle = isProfilePage ? "Meu Perfil" : (menu.find(item => item.path === activePath)?.label || "");
  const pageIcon = isProfilePage ? "👤" : (menu.find(item => item.path === activePath)?.icon || "");
  
  const userInitial = userName.charAt(0).toUpperCase();

  // Função para tocar som de sino
  const playBellSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  };

  // Função para exibir notificação com som
  const showNotification = (title, message, type = 'success') => {
    playBellSound();
    setToastNotification({ title, message, type });
    setTimeout(() => setToastNotification(null), 4000);
  };

  // Expor função globalmente para uso em outros componentes
  useEffect(() => {
    window.showHeaderNotification = showNotification;
    return () => delete window.showHeaderNotification;
  }, []);

  // 🔥 Carregar notificações em tempo real
  useEffect(() => {
    if (!companyCnpj) return;

    const carregarNotificacoes = async () => {
      try {
        // Importar firebase dinamicamente
        const firebase = await import('../../services/firebase');
        
        const notifs = [];
        
        // 1. Chat - Mensagens não lidas
        const chats = await firebase.listChats(companyCnpj, userName);
        const chatsComMensagensNovas = chats?.filter(chat => chat.unreadCount > 0) || [];
        chatsComMensagensNovas.forEach(chat => {
          notifs.push({
            id: `chat-${chat.id}`,
            tipo: 'chat',
            titulo: '💬 Nova mensagem no chat',
            mensagem: `${chat.titulo || 'Conversa'}: ${chat.unreadCount} mensagem(ns) não lida(s)`,
            timestamp: new Date().toISOString(),
            lida: false,
            link: '/dashboard/chat'
          });
        });

        // 2. Estoque - Itens com baixo estoque
        const produtos = await firebase.listProducts(companyCnpj);
        const produtosBaixoEstoque = produtos?.filter(p => p.quantidade <= p.minimo && p.quantidade > 0) || [];
        produtosBaixoEstoque.forEach(produto => {
          notifs.push({
            id: `estoque-${produto.id}`,
            tipo: 'estoque',
            titulo: '⚠️ Estoque baixo',
            mensagem: `${produto.nome}: apenas ${produto.quantidade} ${produto.unidade} restante(s)`,
            timestamp: new Date().toISOString(),
            lida: false,
            link: '/dashboard/estoque'
          });
        });

        // 3. Ordens de Serviço - Pendentes
        const ordens = await firebase.listServiceOrders(companyCnpj);
        const ordensPendentes = ordens?.filter(os => os.status === 'Pendente') || [];
        if (ordensPendentes.length > 0) {
          notifs.push({
            id: 'os-pendentes',
            tipo: 'os',
            titulo: '📋 Ordens de Serviço Pendentes',
            mensagem: `${ordensPendentes.length} OS aguardando atendimento`,
            timestamp: new Date().toISOString(),
            lida: false,
            link: '/dashboard/os'
          });
        }

        // 4. Compras - Pedidos recentes
        const pedidos = await firebase.listPurchaseOrders(companyCnpj);
        const pedidosPendentes = pedidos?.filter(p => p.status === 'Pendente' || p.status === 'Aprovado') || [];
        if (pedidosPendentes.length > 0) {
          notifs.push({
            id: 'compras-pendentes',
            tipo: 'compras',
            titulo: '🛒 Pedidos de Compra',
            mensagem: `${pedidosPendentes.length} pedido(s) em andamento`,
            timestamp: new Date().toISOString(),
            lida: false,
            link: '/dashboard/compras'
          });
        }

        // Ordenar por timestamp (mais recente primeiro)
        notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setNotificacoes(notifs);
        setNotificacoesNaoLidas(notifs.filter(n => !n.lida).length);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }
    };

    carregarNotificacoes();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(carregarNotificacoes, 30000);
    
    return () => clearInterval(interval);
  }, [companyCnpj, userName]);
  
  // Marcar notificação como lida
  const marcarComoLida = (notifId) => {
    setNotificacoes(prev => prev.map(n => 
      n.id === notifId ? { ...n, lida: true } : n
    ));
    setNotificacoesNaoLidas(prev => Math.max(0, prev - 1));
  };

  // Marcar todas como lidas
  const marcarTodasComoLidas = () => {
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    setNotificacoesNaoLidas(0);
  };

  // Navegar para notificação
  const abrirNotificacao = (notif) => {
    marcarComoLida(notif.id);
    setNotificationsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };
  
  const handleLogout = () => {
    // Limpar dados de autenticação
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    
    // Redirecionar para a página de login
    navigate("/sistema");
  };
  
  const handleProfileClick = () => {
    setUserMenuOpen(false);
    // Navegação absoluta para evitar acumulação de caminhos
    navigate("/dashboard/perfil");
  };
  
  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      const userMenu = document.querySelector('.user-menu-container');
      const notificationButton = document.querySelector('.notification-button');
      
      if (userMenuOpen && userMenu && !userMenu.contains(event.target)) {
        setUserMenuOpen(false);
      }
      
      if (notificationsOpen && notificationButton && !notificationButton.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen, notificationsOpen]);
  
  return (
    <>
      {/* Toast Notification */}
      {toastNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '350px',
            backgroundColor: toastNotification.type === 'critical' ? '#ef4444' : 
                            toastNotification.type === 'warning' ? '#f59e0b' : '#10b981',
            color: 'white',
            fontWeight: '600',
            fontSize: '14px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI'",
          }}
        >
          <span style={{ fontSize: '22px' }}>
            {toastNotification.type === 'critical' ? '🔔' : 
             toastNotification.type === 'warning' ? '⚠️' : '✅'}
          </span>
          <div>
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>{toastNotification.title}</div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>{toastNotification.message}</div>
          </div>
        </motion.div>
      )}
    
    <header className="main-header">
      <div className="header-title-section">
        <h2 className="page-title">
          <span className="page-icon">{pageIcon}</span>
          {pageTitle}
        </h2>
        <Breadcrumb />
      </div>
      
      <div className="header-actions">
        <div className="notification-container">
          <button 
            className="action-button notification-button" 
            aria-label="Notificações"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            🔔
            {notificacoesNaoLidas > 0 && (
              <span className="notification-badge">{notificacoesNaoLidas}</span>
            )}
          </button>
          
          {notificationsOpen && (
            <div className="notifications-dropdown">
              <div className="dropdown-arrow"></div>
              <div className="notifications-header">
                <h3>Notificações</h3>
                {notificacoesNaoLidas > 0 && (
                  <button className="mark-all-read" onClick={marcarTodasComoLidas}>
                    Marcar todas como lidas
                  </button>
                )}
              </div>
              <ul className="notifications-list">
                {notificacoes.length === 0 ? (
                  <li className="notification-item" style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔔</div>
                    <p>Nenhuma notificação</p>
                  </li>
                ) : (
                  notificacoes.map(notif => (
                    <li 
                      key={notif.id} 
                      className={`notification-item ${!notif.lida ? 'unread' : ''}`}
                      onClick={() => abrirNotificacao(notif)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="notification-icon">
                        {notif.tipo === 'chat' && '💬'}
                        {notif.tipo === 'estoque' && '📦'}
                        {notif.tipo === 'os' && '📋'}
                        {notif.tipo === 'compras' && '🛒'}
                        {notif.tipo === 'ia' && '🤖'}
                      </div>
                      <div className="notification-content">
                        <p className="notification-text" style={{ fontWeight: !notif.lida ? '600' : '400' }}>
                          {notif.mensagem}
                        </p>
                        <p className="notification-time">
                          {new Date(notif.timestamp).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
              {notificacoes.length > 0 && (
                <div className="notifications-footer">
                  <button 
                    onClick={() => { setNotificationsOpen(false); marcarTodasComoLidas(); }}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#667eea', 
                      cursor: 'pointer',
                      padding: '8px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Limpar todas
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="user-menu-container">
          <button 
            className="user-menu-button" 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-label="Menu do usuário"
          >
            <div className="user-avatar-small">{userInitial}</div>
            <span className="user-name-small">{userName}</span>
            <span className="dropdown-arrow-icon">▼</span>
          </button>
          
          <UserDropdown 
            isOpen={userMenuOpen} 
            onClose={() => setUserMenuOpen(false)}
            onLogout={handleLogout}
            onProfileClick={handleProfileClick}
          />
        </div>
        
        <button 
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Menu"
        >
          ☰
        </button>
      </div>
    </header>
    </>
  );
};

// Componente principal do Dashboard
export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Verificar autenticação ao carregar
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      navigate("/sistema");
    }
  }, [navigate]);
  
  // Redirecionar para a rota correta se estiver na raiz do dashboard
  useEffect(() => {
    if (location.pathname === "/dashboard") {
      navigate("/dashboard/home");
    }
  }, [location.pathname, navigate]);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fechar menu ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar');
      const menuButton = document.querySelector('.mobile-menu-button');
      
      if (
        isMobileMenuOpen && 
        sidebar && 
        !sidebar.contains(event.target) && 
        menuButton && 
        !menuButton.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Impedir scrolling quando menu móvel está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="dashboard-container">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />
      
      <div className={`main-content ${isMobileMenuOpen ? "shifted" : ""}`}>
        <Header toggleMobileMenu={toggleMobileMenu} />
        
        <div className="content-wrapper">
          <Routes>
            {/* Rotas com caminhos absolutos para evitar acumulação */}
            <Route path="/" element={<Navigate to="/dashboard/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/os" element={<OrdemServico />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/automacao" element={<Automacao />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/users-edit" element={<UsersEdit />} />
            <Route path="/perfil" element={<UserProfile />} />
            {/* Rota de fallback para redirecionamento */}
            <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
          </Routes>
        </div>
      </div>
      
      {/* Overlay para quando o menu móvel está aberto */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={toggleMobileMenu}
        />
      )}
    </div>
  );
}