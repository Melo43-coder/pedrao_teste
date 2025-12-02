import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './styles/responsive.css'; // Importar CSS responsivo

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

// Verificação simples de autenticação
const ProtectedRoute = ({ children }) => {
  // Verificar se o usuário está autenticado (exemplo simples)
  const isAuthenticated = localStorage.getItem("authToken") !== null;
  
  // Redirecionar para login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/sistema" replace />;
  }
  
  return children;
};

export default function App() {
  return (
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
  );
}