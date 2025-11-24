import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as api from '../../services/api';
import firebaseService from '../../services/firebase';
import { normalizeCnpj } from '../../utils/cnpj';

const USE_FIREBASE = process.env.REACT_APP_USE_FIREBASE === 'true';

// Dados fictícios para demonstração (fallback quando backend não estiver disponível)
const MOCK_USERS = [
  { cnpj: "12.345.678/0001-90", usuario: "admin", senha: "admin123", nome: "Administrador" },
  { cnpj: "98.765.432/0001-10", usuario: "gerente", senha: "gerente123", nome: "Gerente" },
  { cnpj: "45.678.901/0001-23", usuario: "usuario", senha: "usuario123", nome: "Usuário Padrão" }
];

export default function Login({ recoveryMode = false }) {
  const [cnpj, setCnpj] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [recuperacaoEnviada, setRecuperacaoEnviada] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [loginStage, setLoginStage] = useState(0); // 0: CNPJ, 1: Usuário, 2: Senha
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const navigate = useNavigate();

  // Carregar credenciais salvas
  useEffect(() => {
    const savedCnpj = localStorage.getItem("savedCnpj");
    const savedUsuario = localStorage.getItem("savedUsuario");
    const savedLembrar = localStorage.getItem("savedLembrar") === "true";
    
    if (savedLembrar && savedCnpj && savedUsuario) {
      // savedCnpj is stored normalized (digits only) — format it for display
      setCnpj(formatarCNPJ(savedCnpj));
      setUsuario(savedUsuario);
      setLembrar(true);
      setLoginStage(2); // Ir direto para senha
    }
    
    // Animação de partículas de fundo
    initParticles();
    
    return () => {
      // Limpar canvas de partículas ao desmontar
      const canvas = document.getElementById('particles-canvas');
      if (canvas) {
        canvas.remove();
      }
    };
  }, []);

  // Inicializar animação de partículas
  const initParticles = () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    document.querySelector('.login-container').appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    // Criar partículas
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: `rgba(110, 231, 183, ${Math.random() * 0.5 + 0.1})`,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25
      });
    }
    
    // Animar partículas
    function animate() {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Mover partículas
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Rebater nas bordas
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      });
    }
    
    animate();
    
    // Ajustar tamanho do canvas quando a janela for redimensionada
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  };

  // Formatar CNPJ enquanto digita
  const formatarCNPJ = (valor) => {
    // Remove caracteres não numéricos
    const apenasNumeros = valor.replace(/\D/g, '');
    
    // Aplica a máscara do CNPJ
    let cnpjFormatado = apenasNumeros;
    if (apenasNumeros.length > 2) {
      cnpjFormatado = `${apenasNumeros.substring(0, 2)}.${apenasNumeros.substring(2)}`;
    }
    if (apenasNumeros.length > 5) {
      cnpjFormatado = `${cnpjFormatado.substring(0, 6)}.${cnpjFormatado.substring(6)}`;
    }
    if (apenasNumeros.length > 8) {
      cnpjFormatado = `${cnpjFormatado.substring(0, 10)}/`;
      cnpjFormatado += apenasNumeros.substring(8, 12);
    }
    if (apenasNumeros.length > 12) {
      cnpjFormatado = `${cnpjFormatado.substring(0, 15)}-${apenasNumeros.substring(12, 14)}`;
    }
    
    return cnpjFormatado;
  };

  const handleCnpjChange = (e) => {
    const valor = e.target.value;
    setCnpj(formatarCNPJ(valor));
    setErro("");
  };

  const handleNextStage = (e) => {
    e.preventDefault();
    
    if (loginStage === 0) {
      // Validar CNPJ via backend (com fallback ao mock)
      setCarregando(true);
      const normalized = normalizeCnpj(cnpj);
      const call = USE_FIREBASE ? firebaseService.identifyCnpj(normalized) : api.identifyCnpj(normalized);
      Promise.resolve(call)
        .then((res) => {
          // espera-se { exists: true } ou detalhes da empresa
          if (res && (res.exists === true || res.company)) {
            setErro("");
            setLoginStage(1);
          } else {
            setErro("CNPJ não encontrado. Verifique e tente novamente.");
          }
        })
        .catch(() => {
          // Fallback local (compare normalized values)
          const cnpjValido = MOCK_USERS.some(user => normalizeCnpj(user.cnpj) === normalizeCnpj(cnpj));
          if (cnpjValido) {
            setErro("");
            setLoginStage(1);
          } else {
            setErro("CNPJ não encontrado. Verifique e tente novamente.");
          }
        })
        .finally(() => setCarregando(false));
    } else if (loginStage === 1) {
      // Validar usuário para o CNPJ via backend (com fallback ao mock)
      setCarregando(true);
      const normalized = normalizeCnpj(cnpj);
      const call = USE_FIREBASE ? firebaseService.checkUser(normalized, usuario) : api.checkUser(normalized, usuario);
      Promise.resolve(call)
        .then((res) => {
          if (res && (res.exists === true || res.user)) {
            setErro("");
            setLoginStage(2);
          } else {
            setErro("Usuário não encontrado para este CNPJ.");
          }
        })
        .catch(() => {
          const usuarioValido = MOCK_USERS.some(user => normalizeCnpj(user.cnpj) === normalizeCnpj(cnpj) && user.usuario === usuario);
          if (usuarioValido) {
            setErro("");
            setLoginStage(2);
          } else {
            setErro("Usuário não encontrado para este CNPJ.");
          }
        })
        .finally(() => setCarregando(false));
    }
  };

  const handlePrevStage = () => {
    setErro("");
    setLoginStage(prevStage => prevStage - 1);
  };

  const handleLogin = e => {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    // Chamar backend (ou Firebase) para autenticar (com fallback ao mock)
    const call = USE_FIREBASE ? firebaseService.login({ cnpj, usuario, senha }) : api.login({ cnpj, usuario, senha });
    Promise.resolve(call)
      .then((res) => {
        // espera-se { token, userName, company }
        if (res && res.token) {
          const normalized = normalizeCnpj(cnpj);
          if (lembrar) {
            localStorage.setItem("savedCnpj", normalized);
            localStorage.setItem("savedUsuario", usuario);
            localStorage.setItem("savedLembrar", "true");
          } else {
            localStorage.removeItem("savedCnpj");
            localStorage.removeItem("savedUsuario");
            localStorage.removeItem("savedLembrar");
          }

          localStorage.setItem("authToken", res.token);
          if (res.userName) localStorage.setItem("userName", res.userName);
          // save a sensible companyCnpj normalized so other parts of the app can read it
          if (res.company && res.company.cnpj) {
            localStorage.setItem("companyCnpj", normalizeCnpj(res.company.cnpj));
          } else {
            // ensure we save the normalized cnpj typed by user (fallback)
            localStorage.setItem("companyCnpj", normalized);
          }
          // Try to save an email if backend returned one
          if (res.user && res.user.email) {
            localStorage.setItem("userEmail", res.user.email);
          } else if (res.userEmail) {
            localStorage.setItem("userEmail", res.userEmail);
          } else {
            // synthetic fallback email for display
            localStorage.setItem("userEmail", `${usuario}@${normalizeCnpj(cnpj)}.local`);
          }

          // Attempt to fetch the user profile (role and displayName) so the dashboard shows correct name
          const profileCall = api.checkUser(normalized, usuario);
          Promise.resolve(profileCall)
            .then(profileRes => {
              const role = (profileRes && profileRes.user && profileRes.user.role) ? profileRes.user.role : 'user';
              const displayName = (profileRes && profileRes.user && profileRes.user.displayName) ? profileRes.user.displayName : usuario;
              localStorage.setItem('userRole', role);
              // Override userName with the correct displayName from profile
              localStorage.setItem('userName', displayName);
            })
            .catch(() => {
              // If profile fetch fails, fallback to demo account roles
              const demoRole = usuario === 'admin' ? 'admin' : (usuario === 'gerente' ? 'gerente' : 'user');
              localStorage.setItem('userRole', demoRole);
            })
            .finally(() => {
              setLoginStage(3);
              setTimeout(() => navigate("/dashboard"), 800);
            });
        } else {
          setErro((res && res.message) || "Credenciais inválidas. Tente novamente.");
        }
      })
        .catch(() => {
        // Fallback local mock
        const usuarioEncontrado = MOCK_USERS.find(
          user => normalizeCnpj(user.cnpj) === normalizeCnpj(cnpj) && user.usuario === usuario && user.senha === senha
        );
        
        if (usuarioEncontrado) {
          const normalized = normalizeCnpj(cnpj);
          if (lembrar) {
            localStorage.setItem("savedCnpj", normalized);
            localStorage.setItem("savedUsuario", usuario);
            localStorage.setItem("savedLembrar", "true");
          } else {
            localStorage.removeItem("savedCnpj");
            localStorage.removeItem("savedUsuario");
            localStorage.removeItem("savedLembrar");
          }

          localStorage.setItem("authToken", "token-jwt-ficticio-" + Date.now());
          localStorage.setItem("userName", usuarioEncontrado.nome);
          localStorage.setItem("companyCnpj", normalized);
          localStorage.setItem("userEmail", `${usuario}@${normalized}.local`);
          // Set a default role for demo accounts (admin for 'admin' user)
          const demoRole = usuario === 'admin' ? 'admin' : (usuario === 'gerente' ? 'gerente' : 'user');
          localStorage.setItem('userRole', demoRole);
          setLoginStage(3);
          setTimeout(() => navigate("/dashboard"), 800);
        } else {
          setErro("Senha incorreta. Tente novamente.");
        }
      })
      .finally(() => setCarregando(false));
  };

  const handleRecuperarSenha = (e) => {
    e.preventDefault();
    setCarregando(true);
    // Tenta chamar backend ou Firebase para recuperação
    const call = USE_FIREBASE ? firebaseService.recoverPassword(emailRecuperacao, null) : api.recoverPassword(emailRecuperacao);
    Promise.resolve(call)
      .then(() => setRecuperacaoEnviada(true))
      .catch(() => {
        setRecuperacaoEnviada(true);
      })
      .finally(() => setCarregando(false));
  };

  const handleDemoAccountClick = (account) => {
    setCnpj(account.cnpj);
    setUsuario(account.usuario);
    setSenha(account.senha);
    setLoginStage(2);
    setShowDemoAccounts(false);
  };

  // Variantes para animações
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 20
      } 
    }
  };

  // Formulário de recuperação de senha
  if (recoveryMode) {
    return (
      <div className="login-container">
        <motion.div 
          className="login-card recovery-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="card-decoration">
            <div className="decoration-circle"></div>
            <div className="decoration-line"></div>
          </div>
          
          <div className="login-header">
            <h2>Recuperar Acesso</h2>
            <p className="login-subtitle">Informe seu e-mail para receber as instruções</p>
          </div>
          
          {recuperacaoEnviada ? (
            <motion.div 
              className="recovery-success"
              initial="hidden"
              animate="visible"
              variants={successVariants}
            >
              <div className="success-icon">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3>E-mail enviado!</h3>
              <p>Verifique sua caixa de entrada para redefinir sua senha.</p>
              <Link to="/sistema" className="back-link">
                <span>Voltar para o login</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </motion.div>
          ) : (
            <motion.form 
              onSubmit={handleRecuperarSenha}
              initial="hidden"
              animate="visible"
              variants={formVariants}
            >
              <div className="form-group">
                <label htmlFor="email">E-mail cadastrado:</label>
                <div className={`input-container ${activeInput === 'email' ? 'active' : ''}`}>
                  <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                  </svg>
                  <input
                    id="email"
                    type="email"
                    value={emailRecuperacao}
                    onChange={(e) => setEmailRecuperacao(e.target.value)}
                    required
                    placeholder="seu.email@empresa.com.br"
                    className="form-input"
                    onFocus={() => setActiveInput('email')}
                    onBlur={() => setActiveInput(null)}
                  />
                </div>
              </div>
              
              <motion.button 
                type="submit" 
                className="login-button"
                disabled={carregando || !emailRecuperacao}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {carregando ? (
                  <div className="loader-container">
                    <div className="loader"></div>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  <>
                    <span>Enviar instruções</span>
                    <svg className="button-icon" viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
                    </svg>
                  </>
                )}
              </motion.button>
              
              <div className="recovery-footer">
                <Link to="/sistema" className="back-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Voltar para o login</span>
                </Link>
              </div>
            </motion.form>
          )}
          
          <div className="card-brand">
            <div className="brand-logo">
              <span className="logo-text">SmartOps</span>
            </div>
          </div>
        </motion.div>
        <style>{getStyles()}</style>
      </div>
    );
  }

  // Formulário de login por estágios
  return (
    <div className="login-container">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="card-decoration">
          <div className="decoration-circle"></div>
          <div className="decoration-line"></div>
        </div>
        
        <div className="login-header">
          <motion.div 
            className="logo-container"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path fill="currentColor" d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
              </svg>
            </div>
            <h2>
              <span>Acesse o </span>
              <span className="highlight">SmartOps</span>
            </h2>
          </motion.div>
          
          <motion.p 
            className="login-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {loginStage === 0 && "Informe o CNPJ da sua empresa"}
            {loginStage === 1 && "Agora, digite seu nome de usuário"}
            {loginStage === 2 && "Por fim, digite sua senha"}
            {loginStage === 3 && "Login realizado com sucesso!"}
          </motion.p>
        </div>
        
        <AnimatePresence mode="wait">
          {erro && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="error-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
              </svg>
              <span>{erro}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          {loginStage === 3 ? (
            <motion.div 
              className="login-success"
              initial="hidden"
              animate="visible"
              variants={successVariants}
              key="success"
            >
              <div className="success-icon">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3>Login bem-sucedido!</h3>
              <p>Redirecionando para o dashboard...</p>
              <div className="redirect-loader">
                <div className="loader"></div>
              </div>
            </motion.div>
          ) : (
            <motion.form 
              onSubmit={loginStage < 2 ? handleNextStage : handleLogin}
              key={`stage-${loginStage}`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formVariants}
            >
              {loginStage === 0 && (
                <div className="form-group">
                  <label htmlFor="cnpj">CNPJ da empresa:</label>
                  <div className={`input-container ${activeInput === 'cnpj' ? 'active' : ''}`}>
                    <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M12,7V3H2V21H22V7H12M10,19H4V17H10V19M10,15H4V13H10V15M10,11H4V9H10V11M10,7H4V5H10V7M20,19H12V17H20V19M20,15H12V13H20V15M20,11H12V9H20V11Z" />
                    </svg>
                    <input
                      id="cnpj"
                      value={cnpj}
                      onChange={handleCnpjChange}
                      required
                      type="text"
                      placeholder="00.000.000/0000-00"
                      className="form-input"
                      maxLength="18"
                      onFocus={() => setActiveInput('cnpj')}
                      onBlur={() => setActiveInput(null)}
                    />
                  </div>
                </div>
              )}
              
              {loginStage === 1 && (
                <div className="form-group">
                  <label htmlFor="usuario">Usuário:</label>
                  <div className={`input-container ${activeInput === 'usuario' ? 'active' : ''}`}>
                    <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                    </svg>
                    <input
                      id="usuario"
                      value={usuario}
                      onChange={e => {
                        setUsuario(e.target.value);
                        setErro("");
                      }}
                      required
                      type="text"
                      placeholder="Seu usuário"
                      className="form-input"
                      onFocus={() => setActiveInput('usuario')}
                      onBlur={() => setActiveInput(null)}
                    />
                  </div>
                </div>
              )}
              
              {loginStage === 2 && (
                <>
                  <div className="form-group">
                    <label htmlFor="senha">Senha:</label>
                    <div className={`input-container ${activeInput === 'senha' ? 'active' : ''}`}>
                      <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
                      </svg>
                      <input
                        id="senha"
                        value={senha}
                        onChange={e => {
                          setSenha(e.target.value);
                          setErro("");
                        }}
                        required
                        type={mostrarSenha ? "text" : "password"}
                        placeholder="Sua senha"
                        className="form-input"
                        onFocus={() => setActiveInput('senha')}
                        onBlur={() => setActiveInput(null)}
                      />
                      <button 
                        type="button" 
                        className="toggle-password"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {mostrarSenha ? (
                          <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="currentColor" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="currentColor" d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-options">
                    <div className="remember-me">
                      <label className="checkbox-container">
                        <input 
                          type="checkbox" 
                          id="lembrar" 
                          checked={lembrar}
                          onChange={e => setLembrar(e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        <span>Lembrar-me</span>
                      </label>
                    </div>
                    <Link to="/sistema/recuperar-senha" className="forgot-password">
                      Esqueceu a senha?
                    </Link>
                  </div>
                </>
              )}
              
              <div className="form-actions">
                {loginStage > 0 && (
                  <motion.button 
                    type="button" 
                    className="back-button"
                    onClick={handlePrevStage}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
                    </svg>
                    <span>Voltar</span>
                  </motion.button>
                )}
                
                <motion.button 
                  type="submit" 
                  className="login-button"
                  disabled={carregando || 
                    (loginStage === 0 && !cnpj) || 
                    (loginStage === 1 && !usuario) || 
                    (loginStage === 2 && !senha)
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {carregando ? (
                    <div className="loader-container">
                      <div className="loader"></div>
                      <span>Processando...</span>
                    </div>
                  ) : (
                    <>
                      <span>
                        {loginStage < 2 ? "Continuar" : "Entrar"}
                      </span>
                      <svg className="button-icon" viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
                      </svg>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        
        <div className="login-footer">
                   <motion.button 
            className="demo-accounts-toggle"
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" />
            </svg>
            <span>Contas de demonstração</span>
            <svg className={`arrow-icon ${showDemoAccounts ? 'open' : ''}`} viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
            </svg>
          </motion.button>
          
          <AnimatePresence>
            {showDemoAccounts && (
              <motion.div 
                className="demo-accounts-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p>Selecione uma conta para teste:</p>
                <div className="account-list">
                  {MOCK_USERS.map((account, index) => (
                    <motion.div 
                      key={account.usuario}
                      className="account-item"
                      onClick={() => handleDemoAccountClick(account)}
                      whileHover={{ scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="account-avatar">
                        {account.nome.charAt(0)}
                      </div>
                      <div className="account-info">
                        <div className="account-name">{account.nome}</div>
                        <div className="account-credentials">
                          <span>Usuário: <strong>{account.usuario}</strong></span>
                          <span>Senha: <strong>{account.senha}</strong></span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="card-brand">
          <div className="brand-logo">
            <span className="logo-text">SmartOps</span>
          </div>
        </div>
        
        <div className="login-progress">
          {[0, 1, 2].map((step) => (
            <div 
              key={step} 
              className={`progress-step ${loginStage >= step ? 'active' : ''} ${loginStage > step ? 'completed' : ''}`}
              onClick={() => {
                if (loginStage > step) {
                  setLoginStage(step);
                }
              }}
            >
              {loginStage > step ? (
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                </svg>
              ) : (
                step + 1
              )}
            </div>
          ))}
        </div>
      </motion.div>
      <style>{getStyles()}</style>
    </div>
  );
}

// Função para retornar os estilos CSS aprimorados
function getStyles() {
  return `
    .login-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1a2e25 0%, #1d3229 50%, #162720 100%);
      padding: 20px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      position: relative;
      overflow: hidden;
    }
    
    .login-card {
      padding: 42px 36px;
      background: linear-gradient(145deg, #273a33 0%, #1f2e28 100%);
      border-radius: 24px;
      box-shadow: 0 12px 40px rgba(15, 24, 20, 0.35), 0 2px 8px rgba(26, 32, 29, 0.4);
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      border: 1px solid rgba(110, 231, 183, 0.1);
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      z-index: 10;
    }
    
    .card-decoration {
      position: absolute;
      top: 0;
      right: 0;
      width: 180px;
      height: 180px;
      overflow: hidden;
      z-index: -1;
    }
    
    .decoration-circle {
      position: absolute;
      top: -80px;
      right: -80px;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(110, 231, 183, 0.2), rgba(49, 151, 149, 0.1));
      opacity: 0.6;
    }
    
    .decoration-line {
      position: absolute;
      top: 30px;
      right: 30px;
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(110, 231, 183, 0.5));
      transform: rotate(-45deg);
    }
    
    .recovery-card {
      max-width: 480px;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 10px;
    }
    
    .logo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .logo-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #49e7b6, #17b98a);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0f2318;
      margin-bottom: 8px;
      box-shadow: 0 4px 12px rgba(73, 231, 182, 0.3);
    }
    
    .login-header h2 {
      color: #f7f7f7;
      margin-bottom: 10px;
      font-weight: 700;
      letter-spacing: .02em;
      font-size: 1.8rem;
      line-height: 1.3;
    }
    
    .login-subtitle {
      color: #a0c5b9;
      font-size: 0.95rem;
      margin-top: 0;
      transition: all 0.3s ease;
    }
    
    .highlight {
      color: #6ee7b7;
      font-weight: 800;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 22px;
    }
    
    .form-group label {
      font-weight: 600;
      color: #b6d9ce;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .input-container {
      position: relative;
      display: flex;
      align-items: center;
      border-radius: 12px;
      border: 1.5px solid rgba(110, 231, 183, 0.15);
      background: rgba(35, 46, 40, 0.5);
      transition: all 0.2s ease;
      overflow: hidden;
    }
    
    .input-container.active {
      border-color: #5cf6ba;
      box-shadow: 0 0 0 2px rgba(92, 246, 186, 0.2);
      background: rgba(35, 46, 40, 0.8);
    }
    
    .input-icon {
      margin-left: 16px;
      color: #6ee7b7;
      opacity: 0.8;
    }
    
    .form-input {
      width: 100%;
      padding: 16px;
      border: none;
      background: transparent;
      font-size: 1.05rem;
      outline: none;
      color: #e1ece7;
      box-sizing: border-box;
      transition: all 0.2s ease;
    }
    
    .form-input::placeholder {
      color: rgba(160, 197, 185, 0.5);
    }
    
    .toggle-password {
      position: absolute;
      right: 16px;
      background: transparent;
      border: none;
      color: #a0c5b9;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .toggle-password:hover {
      color: #6ee7b7;
    }
    
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      font-size: 0.9rem;
    }
    
    .remember-me {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #a0c5b9;
    }
    
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
    
    .checkbox-container input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }
    
    .checkmark {
      position: relative;
      height: 18px;
      width: 18px;
      background-color: rgba(35, 46, 40, 0.8);
      border: 1.5px solid rgba(110, 231, 183, 0.3);
      border-radius: 4px;
      transition: all 0.2s ease;
    }
    
    .checkbox-container:hover .checkmark {
      border-color: rgba(110, 231, 183, 0.6);
    }
    
    .checkbox-container input:checked ~ .checkmark {
      background-color: #6ee7b7;
      border-color: #6ee7b7;
    }
    
    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
    }
    
    .checkbox-container input:checked ~ .checkmark:after {
      display: block;
    }
    
    .checkbox-container .checkmark:after {
      left: 6px;
      top: 2px;
      width: 4px;
      height: 8px;
      border: solid #151d18;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    
    .forgot-password {
      color: #6ee7b7;
      text-decoration: none;
      transition: all 0.2s ease;
      font-weight: 600;
      position: relative;
    }
    
    .forgot-password:after {
      content: '';
      position: absolute;
      width: 0;
      height: 1.5px;
      bottom: -2px;
      left: 0;
      background-color: #6ee7b7;
      transition: width 0.2s ease;
    }
    
    .forgot-password:hover:after {
      width: 100%;
    }
    
    .form-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
    }
    
    .back-button {
      background: rgba(35, 46, 40, 0.8);
      color: #a0c5b9;
      border-radius: 12px;
      border: 1.5px solid rgba(110, 231, 183, 0.15);
      font-weight: 600;
      padding: 0 16px;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .back-button:hover {
      background: rgba(35, 46, 40, 1);
      border-color: rgba(110, 231, 183, 0.3);
    }
    
    .login-button {
      flex: 1;
      background: linear-gradient(90deg, #49e7b6 0%, #38d4aa 100%);
      color: #0f2318;
      border-radius: 12px;
      border: none;
      font-weight: 700;
      letter-spacing: .02em;
      padding: 16px 24px;
      font-size: 1rem;
      box-shadow: 0 4px 12px rgba(56, 211, 159, 0.2);
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .login-button:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: all 0.6s ease;
    }
    
    .login-button:hover:before {
      left: 100%;
    }
    
    .login-button:hover {
      background: linear-gradient(90deg, #38d4aa 0%, #27c398 100%);
      box-shadow: 0 6px 16px rgba(56, 211, 159, 0.3);
      transform: translateY(-2px);
    }
    
    .login-button:active {
      transform: translateY(0);
    }
    
    .login-button:disabled {
      background: linear-gradient(90deg, #2a6a56 0%, #235347 100%);
      color: rgba(160, 197, 185, 0.7);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    .login-button:disabled:before {
      display: none;
    }
    
    .button-icon {
      transition: transform 0.3s ease;
    }
    
    .login-button:hover .button-icon {
      transform: translateX(4px);
    }
    
    .error-message {
      background-color: rgba(239, 68, 68, 0.1);
      color: #fca5a5;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 10px;
      border-left: 3px solid #ef4444;
      margin-bottom: 20px;
    }
    
    .error-icon {
      color: #ef4444;
      flex-shrink: 0;
    }
    
    .login-footer {
      margin-top: 10px;
      padding-top: 16px;
      border-top: 1px solid rgba(110, 231, 183, 0.1);
    }
    
    .demo-accounts-toggle {
      width: 100%;
      background: transparent;
      border: none;
      color: #a0c5b9;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 0.9rem;
      cursor: pointer;
      padding: 8px;
      transition: all 0.2s ease;
    }
    
    .demo-accounts-toggle:hover {
      color: #6ee7b7;
    }
    
    .arrow-icon {
      transition: transform 0.3s ease;
    }
    
    .arrow-icon.open {
      transform: rotate(180deg);
    }
    
    .demo-accounts-panel {
      overflow: hidden;
      margin-top: 12px;
    }
    
    .demo-accounts-panel p {
      margin-top: 0;
      margin-bottom: 12px;
      text-align: center;
      font-size: 0.9rem;
      color: #a0c5b9;
    }
    
    .account-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .account-item {
      background: rgba(35, 46, 40, 0.5);
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid rgba(110, 231, 183, 0.05);
    }
    
    .account-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #49e7b6, #17b98a);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #0f2318;
      flex-shrink: 0;
    }
    
    .account-info {
      flex: 1;
    }
    
    .account-name {
      font-weight: 600;
      color: #e1ece7;
      margin-bottom: 4px;
    }
    
    .account-credentials {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      color: #a0c5b9;
      font-size: 0.85rem;
    }
    
    .account-credentials strong {
      color: #6ee7b7;
    }
    
    .card-brand {
      position: absolute;
      bottom: 20px;
      right: 20px;
      opacity: 0.3;
      transition: opacity 0.3s ease;
    }
    
    .login-card:hover .card-brand {
      opacity: 0.6;
    }
    
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .logo-text {
      font-weight: 800;
      font-size: 1rem;
      letter-spacing: 0.05em;
      color: #6ee7b7;
    }
    
    .login-progress {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 8px;
    }
    
    .progress-step {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(35, 46, 40, 0.8);
      border: 1.5px solid rgba(110, 231, 183, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      color: #a0c5b9;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .progress-step.active {
      background: rgba(110, 231, 183, 0.1);
      border-color: rgba(110, 231, 183, 0.4);
      color: #6ee7b7;
    }
    
    .progress-step.completed {
      background: #6ee7b7;
      border-color: #6ee7b7;
      color: #0f2318;
    }
    
    .loader-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    
    .loader {
      width: 18px;
      height: 18px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    .login-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 20px 0;
    }
    
    .success-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #49e7b6, #17b98a);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0f2318;
      margin-bottom: 20px;
      box-shadow: 0 6px 16px rgba(56, 211, 159, 0.3);
    }
    
    .login-success h3 {
      color: #f7f7f7;
      margin-bottom: 10px;
      font-size: 1.4rem;
    }
    
    .login-success p {
      color: #a0c5b9;
      margin-bottom: 24px;
    }
    
    .redirect-loader {
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }
    
    .recovery-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 20px 0;
    }
    
    .recovery-success h3 {
      color: #f7f7f7;
      margin-bottom: 10px;
      font-size: 1.4rem;
    }
    
    .recovery-success p {
      color: #a0c5b9;
      margin-bottom: 24px;
    }
    
    .back-link {
      color: #6ee7b7;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .back-link:hover {
      color: #49e7b6;
    }
    
    .recovery-footer {
      text-align: center;
      margin-top: 16px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 600px) {
      .login-card {
        width: 100%;
        max-width: 100%;
        padding: 30px 24px;
        border-radius: 20px;
      }
      
      .form-options {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .back-button {
        width: 100%;
        justify-content: center;
        padding: 14px;
      }
      
      .account-credentials {
        flex-direction: column;
        gap: 4px;
      }
    }
  `;
}