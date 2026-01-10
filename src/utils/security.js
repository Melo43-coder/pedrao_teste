// Utility functions for input validation and sanitization

/**
 * Sanitiza entrada de texto removendo caracteres perigosos
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove tags HTML e scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

/**
 * Valida formato de email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida formato de CNPJ
 */
export const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;
  
  // Remove caracteres não numéricos
  const numbers = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (numbers.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Validação dos dígitos verificadores
  let length = numbers.length - 2;
  let nums = numbers.substring(0, length);
  const digits = numbers.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += nums.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result != digits.charAt(0)) return false;
  
  length = length + 1;
  nums = numbers.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += nums.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result != digits.charAt(1)) return false;
  
  return true;
};

/**
 * Valida força da senha
 */
export const validatePasswordStrength = (password) => {
  if (!password) return { valid: false, message: 'Senha é obrigatória' };
  
  if (password.length < 8) {
    return { valid: false, message: 'Senha deve ter no mínimo 8 caracteres' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (strength < 3) {
    return { 
      valid: false, 
      message: 'Senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais' 
    };
  }
  
  return { valid: true, strength };
};

/**
 * Previne XSS em URLs
 */
export const sanitizeURL = (url) => {
  if (!url) return '';
  
  // Remove javascript: e outros protocolos perigosos
  const dangerous = /^(javascript|data|vbscript|file):/i;
  if (dangerous.test(url)) {
    return '';
  }
  
  return url;
};

/**
 * Valida e sanitiza número de telefone
 */
export const validatePhone = (phone) => {
  if (!phone) return { valid: false, sanitized: '' };
  
  const sanitized = phone.replace(/\D/g, '');
  
  // Aceita telefones com 10 ou 11 dígitos (com ou sem DDD)
  if (sanitized.length < 10 || sanitized.length > 11) {
    return { valid: false, sanitized };
  }
  
  return { valid: true, sanitized };
};

/**
 * Rate limiting simples para prevenir brute force
 */
export class RateLimiter {
  constructor(maxAttempts = 5, timeWindow = 900000) { // 15 minutos
    this.maxAttempts = maxAttempts;
    this.timeWindow = timeWindow;
    this.attempts = new Map();
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove tentativas antigas
    const recentAttempts = userAttempts.filter(time => now - time < this.timeWindow);
    
    if (recentAttempts.length >= this.maxAttempts) {
      const oldestAttempt = recentAttempts[0];
      const timeUntilReset = this.timeWindow - (now - oldestAttempt);
      return { 
        allowed: false, 
        timeUntilReset: Math.ceil(timeUntilReset / 1000 / 60) // em minutos
      };
    }
    
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return { allowed: true, attemptsLeft: this.maxAttempts - recentAttempts.length };
  }
  
  reset(identifier) {
    this.attempts.delete(identifier);
  }
}

/**
 * Encripta dados sensíveis antes de armazenar (simples)
 */
export const encryptData = (data) => {
  try {
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao encriptar dados:', error);
    return null;
  }
};

/**
 * Decripta dados
 */
export const decryptData = (encrypted) => {
  try {
    return JSON.parse(atob(encrypted));
  } catch (error) {
    console.error('Erro ao decriptar dados:', error);
    return null;
  }
};

/**
 * Valida se string contém SQL injection
 */
export const detectSQLInjection = (input) => {
  if (typeof input !== 'string') return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\#|\/\*|\*\/)/,
    /(\bOR\b.*=.*|1=1|'=')/i,
    /(\bUNION\b.*\bSELECT\b)/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Gera token CSRF
 */
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export default {
  sanitizeInput,
  validateEmail,
  validateCNPJ,
  validatePasswordStrength,
  sanitizeURL,
  validatePhone,
  RateLimiter,
  encryptData,
  decryptData,
  detectSQLInjection,
  generateCSRFToken
};
