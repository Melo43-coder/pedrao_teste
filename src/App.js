import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './styles/responsive.css'; // Importar CSS responsivo
import { AuthProvider } from './contexts/AuthContext';

// Landing Page Components
import Header from "./components/Landing/Header";
import Hero from "./components/Landing/Hero";
import Sobre from "./components/Landing/Sobre";
import Modulos from "./components/Landing/Modulos";
import Planos from "./components/Landing/Planos";
import FAQ from "./components/Landing/FAQ";
import Footer from "./components/Landing/Footer";
import Experimente from "./components/Landing/Experimente";
import Depoimentos from "./components/Landing/Depoimento";
import CarouselBeneficios from "./components/Landing/Carouselbeneficios";

// Sistema Components
import Login from "./components/Sistema/Login";
import Dashboard from "./components/Sistema/Dashboard";
import AdminPanel from "./crm/AdminPanel";

// Layout para Landing Page
const LandingLayout = () => (
  <>
    <Header />
    <Hero />
    <CarouselBeneficios />
    <Sobre />
    <Modulos />
    <Depoimentos />
    <Planos />
    <Experimente />
    <FAQ />
    <Footer />
  </>
);

// Componente para rota não encontrada
const NotFound = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    padding: '20px'
  }}>
    <h1>404 - Página não encontrada</h1>
    <p>A página que você está procurando não existe ou foi movida.</p>
    <a href="/" style={{
      marginTop: '20px',
      padding: '10px 20px',
      background: '#0ea5e9',
      color: 'white',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: 'bold'
    }}>Voltar para a página inicial</a>
  </div>
);

// Verificação segura de autenticação com Firebase Auth
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        // Primeiro verificar se há dados no localStorage
        const token = localStorage.getItem("authToken");
        const userName = localStorage.getItem("userName");
        const companyCnpj = localStorage.getItem("companyCnpj");
        const tokenExpiry = localStorage.getItem("tokenExpiry");
        
        // Se não tiver dados básicos, não está autenticado
        if (!token || !userName || !companyCnpj) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Verificar se o token expirou
        if (tokenExpiry) {
          const expiryTime = parseInt(tokenExpiry);
          const now = Date.now();
          
          if (now >= expiryTime) {
            // Token expirado - limpar dados
            const keysToRemove = ['authToken', 'tokenExpiry', 'userName', 'companyCnpj', 'userEmail', 'userRole'];
            keysToRemove.forEach(key => localStorage.removeItem(key));
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
        }

        // Se passou por todas as verificações, está autenticado
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f3f4f6'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #e5e7eb',
            borderTop: '5px solid #0ea5e9',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 15px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Carregando...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/sistema" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Página principal (Landing Page) */}
          <Route path="/" element={<LandingLayout />} />

          {/* Rotas de autenticação */}
          <Route path="/sistema" element={<Login />} />
          <Route path="/sistema/recuperar-senha" element={<Login recoveryMode={true} />} />

          {/* Rotas protegidas do sistema */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Painel CRM (admin) */}
          <Route
            path="/crm"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Redirecionamentos */}
          <Route path="/login" element={<Navigate to="/sistema" replace />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          
          {/* Rota para página não encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}