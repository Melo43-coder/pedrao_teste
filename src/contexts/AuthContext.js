import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  // Configurações de segurança
  const SESSION_TIMEOUT = parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 3600000; // 1 hora padrão
  const MAX_INACTIVITY = 900000; // 15 minutos de inatividade

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Verificar se o token ainda é válido
          const token = await user.getIdToken();
          const tokenResult = await user.getIdTokenResult();
          
          // Verificar expiração do token
          const expirationTime = new Date(tokenResult.expirationTime).getTime();
          const now = Date.now();
          
          if (expirationTime > now) {
            setCurrentUser(user);
            localStorage.setItem('authToken', token);
            localStorage.setItem('tokenExpiry', expirationTime.toString());
            
            // Verificar se há dados de sessão salvos
            const savedUserName = localStorage.getItem('userName');
            const savedCnpj = localStorage.getItem('companyCnpj');
            
            // Se não houver dados salvos, buscar do Firebase
            if (!savedUserName || !savedCnpj) {
              // Dados ausentes - pode ser necessário fazer login novamente
              console.warn('Dados de sessão incompletos. Mantendo autenticação do Firebase.');
            }
            
            // Configurar timeout de sessão
            setupSessionTimeout();
          } else {
            // Token expirado
            handleLogout();
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          handleLogout();
        }
      } else {
        setCurrentUser(null);
        clearAuthData();
      }
      setLoading(false);
    });

    // Verificar atividade do usuário
    setupActivityMonitoring();

    return () => {
      unsubscribe();
      clearTimeout(sessionTimeout);
    };
  }, []);

  const setupSessionTimeout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }

    const timeout = setTimeout(() => {
      handleLogout('Sessão expirada. Faça login novamente.');
    }, SESSION_TIMEOUT);

    setSessionTimeout(timeout);
  };

  const setupActivityMonitoring = () => {
    let lastActivity = Date.now();
    
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastActivity > MAX_INACTIVITY && currentUser) {
        handleLogout('Sessão encerrada por inatividade.');
      }
    };

    // Monitorar eventos de atividade
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    // Verificar inatividade a cada minuto
    const inactivityInterval = setInterval(checkInactivity, 60000);

    return () => {
      ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(inactivityInterval);
    };
  };

  const handleLogout = (message) => {
    auth.signOut();
    clearAuthData();
    if (message) {
      localStorage.setItem('logoutMessage', message);
    }
    window.location.href = '/sistema';
  };

  const clearAuthData = () => {
    // Limpar dados sensíveis do localStorage
    const keysToRemove = [
      'authToken', 
      'tokenExpiry',
      'userName',
      'userEmail',
      'userRole',
      'companyCnpj'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const refreshToken = async () => {
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken(true); // Force refresh
        localStorage.setItem('authToken', token);
        return token;
      } catch (error) {
        console.error('Erro ao renovar token:', error);
        handleLogout('Erro ao renovar sessão.');
        return null;
      }
    }
    return null;
  };

  const value = {
    currentUser,
    loading,
    refreshToken,
    logout: () => handleLogout()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
