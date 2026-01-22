import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as api from '../../services/api';
import firebaseService from '../../services/firebase';
import { normalizeCnpj } from '../../utils/cnpj';

const USE_FIREBASE = true; // ✨ SEMPRE usar Firebase (não depende de .env)

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
          // Definir expiração do token (24 horas a partir de agora)
          const expiry = Date.now() + (24 * 60 * 60 * 1000);
          localStorage.setItem("tokenExpiry", expiry.toString());
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
          // 🖼️ Salvar foto do usuário se disponível
          if (res.user && res.user.photoURL) {
            localStorage.setItem("userPhoto", res.user.photoURL);
          } else {
            localStorage.removeItem("userPhoto"); // Remover se não houver foto
          }

          // Salvar role do usuário (usar dados do Firebase se disponível)
          if (res.user && res.user.role) {
            localStorage.setItem('userRole', res.user.role);
          } else {
            // Fallback baseado no username
            const demoRole = usuario === 'admin' ? 'admin' : (usuario === 'gerente' ? 'gerente' : 'user');
            localStorage.setItem('userRole', demoRole);
          }

          // ✅ Redirecionar para o dashboard
          setLoginStage(3);
          setTimeout(() => navigate("/dashboard"), 800);
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
          // Definir expiração do token (24 horas a partir de agora)
          const expiry = Date.now() + (24 * 60 * 60 * 1000);
          localStorage.setItem("tokenExpiry", expiry.toString());
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
              <span className="logo-text">Zillo Assist</span>
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
              <span className="highlight">Zillo Assist</span>
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
        
        <div className="card-brand">
          <div className="brand-logo">
            <span className="logo-text">Assistus</span>
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

// Função para retornar os estilos CSS modernos e dinâmicos
function getStyles() {
  return `
    .login-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      padding: 20px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      position: relative;
      overflow: hidden;
    }
    
    .login-container::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: 
        radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 90%, rgba(16, 185, 129, 0.08) 0%, transparent 50%);
      animation: gradientMove 20s ease infinite;
      pointer-events: none;
    }
    
    @keyframes gradientMove {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(10%, -10%) rotate(90deg); }
      50% { transform: translate(-5%, 5%) rotate(180deg); }
      75% { transform: translate(-10%, 10%) rotate(270deg); }
    }
    
    .login-card {
      padding: 48px 40px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(20px) saturate(180%);
      border-radius: 28px;
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      width: 100%;
      max-width: 460px;
      display: flex;
      flex-direction: column;
      gap: 28px;
      position: relative;
      overflow: hidden;
      z-index: 10;
    }
    
    .card-decoration {
      position: absolute;
      top: 0;
      right: 0;
      width: 250px;
      height: 250px;
      overflow: hidden;
      z-index: -1;
      opacity: 0.4;
    }
    
    .decoration-circle {
      position: absolute;
      top: -120px;
      right: -120px;
      width: 240px;
      height: 240px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.2));
      animation: pulse 4s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.1); opacity: 0.6; }
    }
    
    .decoration-line {
      position: absolute;
      top: 40px;
      right: 40px;
      width: 80px;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.6), transparent);
      transform: rotate(-45deg);
      animation: shine 3s ease-in-out infinite;
    }
    
    @keyframes shine {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
    
    .recovery-card {
      max-width: 480px;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 12px;
    }
    
    .logo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .logo-icon {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: linear-gradient(135deg, #2C30D5 0%, #889DD3 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 
        0 8px 24px rgba(44, 48, 213, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    
    .login-header h2 {
      color: #f8fafc;
      margin: 0 0 12px 0;
      font-weight: 700;
      letter-spacing: -0.02em;
      font-size: 2rem;
      line-height: 1.2;
    }
    
    .login-subtitle {
      color: #94a3b8;
      font-size: 1rem;
      margin: 0;
      transition: all 0.3s ease;
      font-weight: 400;
    }
    
    .highlight {
      background: linear-gradient(135deg, #2C30D5 0%, #889DD3 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 800;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 26px;
    }
    
    .form-group label {
      font-weight: 600;
      color: #cbd5e1;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 4px;
      transition: all 0.3s ease;
    }
    
    .form-group:hover label {
      color: #f1f5f9;
    }
    
    .input-container {
      position: relative;
      display: flex;
      align-items: center;
      border-radius: 16px;
      border: 2px solid rgba(148, 163, 184, 0.15);
      background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8));
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
    
    .input-container::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(135deg, #2C30D5, #889DD3, #32DAF3);
      border-radius: 16px;
      opacity: 0;
      transition: opacity 0.4s ease;
      z-index: -1;
    }
    
    .input-container::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.6s ease;
    }
    
    .input-container:hover::after {
      left: 100%;
    }
    
    .input-container.active::before {
      opacity: 1;
      animation: borderGlow 2s ease-in-out infinite;
    }
    
    @keyframes borderGlow {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    
    .input-container.active {
      border-color: transparent;
      background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
      box-shadow: 
        0 0 0 4px rgba(59, 130, 246, 0.1),
        0 8px 24px rgba(59, 130, 246, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
    
    .input-icon {
      margin-left: 20px;
      color: #2C30D5;
      opacity: 0.7;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 0 4px rgba(44, 48, 213, 0.3));
    }
    
    .input-container.active .input-icon {
      opacity: 1;
      transform: scale(1.15) rotate(5deg);
      filter: drop-shadow(0 0 8px rgba(44, 48, 213, 0.6));
    }
    
    .form-input {
      width: 100%;
      padding: 18px 20px;
      border: none;
      background: transparent;
      font-size: 1.05rem;
      outline: none;
      color: #f1f5f9;
      box-sizing: border-box;
      transition: all 0.3s ease;
      font-weight: 500;
      letter-spacing: 0.01em;
    }
    
    .form-input::placeholder {
      color: rgba(148, 163, 184, 0.4);
      font-weight: 400;
      transition: all 0.3s ease;
    }
    
    .input-container.active .form-input::placeholder {
      color: rgba(148, 163, 184, 0.6);
      transform: translateX(2px);
    }
    
    .toggle-password {
      position: absolute;
      right: 18px;
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      border-radius: 8px;
    }
    
    .toggle-password:hover {
      color: #2C30D5;
      background: rgba(44, 48, 213, 0.1);
    }
    
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      font-size: 0.9rem;
    }
    
    .remember-me {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #cbd5e1;
    }
    
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
    }
    
    .checkbox-container:hover {
      color: #f1f5f9;
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
      height: 20px;
      width: 20px;
      background: rgba(30, 41, 59, 0.8);
      border: 2px solid rgba(148, 163, 184, 0.3);
      border-radius: 6px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .checkbox-container:hover .checkmark {
      border-color: #2C30D5;
      background: rgba(44, 48, 213, 0.1);
    }
    
    .checkbox-container input:checked ~ .checkmark {
      background: linear-gradient(135deg, #2C30D5, #889DD3);
      border-color: transparent;
      transform: scale(1.05);
    }
    
    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
    }
    
    .checkbox-container input:checked ~ .checkmark:after {
      display: block;
      animation: checkPop 0.3s ease;
    }
    
    @keyframes checkPop {
      0% { transform: scale(0) rotate(45deg); }
      50% { transform: scale(1.2) rotate(45deg); }
      100% { transform: scale(1) rotate(45deg); }
    }
    
    .checkbox-container .checkmark:after {
      left: 6px;
      top: 2px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2.5px 2.5px 0;
      transform: rotate(45deg);
    }
    
    .forgot-password {
      color: #2C30D5;
      text-decoration: none;
      transition: all 0.2s ease;
      font-weight: 600;
      position: relative;
    }
    
    .forgot-password:after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -3px;
      left: 0;
      background: linear-gradient(90deg, #2C30D5, #889DD3);
      transition: width 0.3s ease;
    }
    
    .forgot-password:hover {
      color: #60a5fa;
    }
    
    .forgot-password:hover:after {
      width: 100%;
    }
    
    .form-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .back-button {
      background: rgba(30, 41, 59, 0.8);
      color: #cbd5e1;
      border-radius: 14px;
      border: 2px solid rgba(148, 163, 184, 0.2);
      font-weight: 600;
      padding: 0 20px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .back-button:hover {
      background: rgba(30, 41, 59, 1);
      border-color: rgba(148, 163, 184, 0.4);
      transform: translateX(-4px);
      color: #f1f5f9;
    }
    
    .login-button {
      flex: 1;
      background: linear-gradient(135deg, #2C30D5 0%, #889DD3 100%);
      color: #ffffff;
      border-radius: 14px;
      border: none;
      font-weight: 700;
      letter-spacing: 0.01em;
      padding: 16px 28px;
      font-size: 1.05rem;
      box-shadow: 
        0 4px 14px rgba(44, 48, 213, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    
    .login-button:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: all 0.6s ease;
    }
    
    .login-button:hover:before {
      left: 100%;
    }
    
    .login-button:hover {
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      box-shadow: 
        0 6px 20px rgba(59, 130, 246, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
    
    .login-button:active {
      transform: translateY(0);
    }
    
    .login-button:disabled {
      background: linear-gradient(135deg, #475569 0%, #64748b 100%);
      color: rgba(148, 163, 184, 0.7);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
      opacity: 0.6;
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
      background: rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      padding: 14px 18px;
      border-radius: 14px;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 12px;
      border-left: 3px solid #ef4444;
      margin-bottom: 20px;
      backdrop-filter: blur(10px);
      animation: slideDown 0.3s ease;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .error-icon {
      color: #ef4444;
      flex-shrink: 0;
      animation: shake 0.5s ease;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    
    .card-brand {
      position: absolute;
      bottom: 20px;
      right: 24px;
      opacity: 0.25;
      transition: opacity 0.3s ease;
    }
    
    .login-card:hover .card-brand {
      opacity: 0.5;
    }
    
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .logo-text {
      font-weight: 800;
      font-size: 1.1rem;
      letter-spacing: 0.05em;
      background: linear-gradient(135deg, #2C30D5, #889DD3);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .login-progress {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 12px;
    }
    
    .progress-step {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(30, 41, 59, 0.8);
      border: 2px solid rgba(148, 163, 184, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #94a3b8;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }
    
    .progress-step.active {
      background: rgba(44, 48, 213, 0.2);
      border-color: #2C30D5;
      color: #2C30D5;
      transform: scale(1.15);
      box-shadow: 0 0 0 3px rgba(44, 48, 213, 0.1);
    }
    
    .progress-step.completed {
      background: linear-gradient(135deg, #2C30D5, #889DD3);
      border-color: transparent;
      color: #ffffff;
    }
    
    .loader-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    
    .loader {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    .login-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 32px 0;
    }
    
    .success-icon {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #11A561, #0d8550);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      margin-bottom: 24px;
      box-shadow: 
        0 8px 24px rgba(17, 165, 97, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      animation: successPulse 1s ease infinite;
    }
    
    @keyframes successPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .login-success h3 {
      color: #f8fafc;
      margin-bottom: 12px;
      font-size: 1.6rem;
      font-weight: 700;
    }
    
    .login-success p {
      color: #94a3b8;
      margin-bottom: 28px;
      font-size: 1rem;
    }
    
    .redirect-loader {
      display: flex;
      justify-content: center;
      margin-top: 12px;
    }
    
    .recovery-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 32px 0;
    }
    
    .recovery-success h3 {
      color: #f8fafc;
      margin-bottom: 12px;
      font-size: 1.6rem;
      font-weight: 700;
    }
    
    .recovery-success p {
      color: #94a3b8;
      margin-bottom: 28px;
      font-size: 1rem;
    }
    
    .back-link {
      color: #2C30D5;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .back-link:hover {
      color: #60a5fa;
      transform: translateX(-4px);
    }
    
    .recovery-footer {
      text-align: center;
      margin-top: 20px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 600px) {
      .login-container {
        padding: 16px;
      }
      
      .login-card {
        width: 100%;
        max-width: 100%;
        padding: 32px 24px;
        border-radius: 24px;
        gap: 24px;
      }
      
      .login-header h2 {
        font-size: 1.6rem;
      }
      
      .login-subtitle {
        font-size: 0.9rem;
      }
      
      .logo-icon {
        width: 56px;
        height: 56px;
      }
      
      .form-group {
        margin-bottom: 22px;
      }
      
      .form-input {
        padding: 16px 18px;
        font-size: 1rem;
      }
      
      .input-icon {
        margin-left: 16px;
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
        padding: 15px;
      }
      
      .login-button {
        width: 100%;
        padding: 15px 24px;
      }
      
      .progress-step {
        width: 32px;
        height: 32px;
      }
      
      .card-brand {
        position: static;
        display: flex;
        justify-content: center;
        margin-top: 20px;
        opacity: 0.4;
      }
    }
    
    @media (max-width: 400px) {
      .login-card {
        padding: 28px 20px;
      }
      
      .login-header h2 {
        font-size: 1.4rem;
      }
      
      .form-input {
        font-size: 0.95rem;
      }
    }
    
    @media (min-width: 601px) and (max-width: 900px) {
      .login-card {
        max-width: 480px;
      }
    }
  `;
}
