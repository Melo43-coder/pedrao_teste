import firebaseService from './firebase';
import { normalizeCnpj } from '../utils/cnpj';
const BASE_URL = process.env.REACT_APP_API_URL || '';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const opts = {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  };

  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  // Try parse JSON, otherwise return raw text
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export async function identifyCnpj(cnpj) {
  // POST /api/auth/identify { cnpj }
  try {
    return await request('/api/auth/identify', {
      method: 'POST',
      body: JSON.stringify({ cnpj })
    });
  } catch (err) {
    // If there is no backend or the endpoint fails, fall back to client-side Firebase lookup
    // Normalize CNPJ and try to identify company directly from Firestore
    const normalized = normalizeCnpj(cnpj);
    return firebaseService.identifyCnpj(normalized);
  }
}

export async function checkUser(cnpj, usuario) {
  // POST /api/auth/check-user { cnpj, usuario }
  try {
    return await request('/api/auth/check-user', {
      method: 'POST',
      body: JSON.stringify({ cnpj, usuario })
    });
  } catch (err) {
    // Fallback to Firebase client when backend is not available
    const normalized = normalizeCnpj(cnpj);
    return firebaseService.checkUser(normalized, usuario);
  }
}

export async function login({ cnpj, usuario, senha }) {
  // POST /api/auth/login { cnpj, usuario, senha }
  try {
    return await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ cnpj, usuario, senha })
    });
  } catch (err) {
    // Fallback to Firebase client when backend is not available
    const normalized = normalizeCnpj(cnpj);
    return firebaseService.login({ cnpj: normalized, usuario, senha });
  }
}

export async function recoverPassword(email) {
  // POST /api/auth/recover { email }
  return request('/api/auth/recover', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export default { identifyCnpj, checkUser, login, recoverPassword };
