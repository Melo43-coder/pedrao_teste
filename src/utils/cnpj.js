// Funcao para fazer upload de arquivos
export async function uploadFile(file, folder = 'uploads') {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Nenhum arquivo fornecido'));
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      reject(new Error('Arquivo muito grande. Tamanho maximo: 5MB'));
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      reject(new Error('Tipo de arquivo nao permitido. Use apenas imagens'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target.result;
      setTimeout(() => resolve(dataURL), 1000);
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
    reader.readAsDataURL(file);
  });
}

export function isValidImageURL(url) {
  if (!url) return false;
  if (url.startsWith('data:image/')) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Utilities for CNPJ normalization and validation
export function normalizeCnpj(value) {
  return (value || '').toString().replace(/\D/g, '');
}

// Validates CNPJ using modulus 11 algorithm
export function validateCnpj(value) {
  if (!value) return false;
  const cnpj = value.toString().replace(/\D/g, '');
  if (cnpj.length !== 14) return false;
  // Eliminate known invalid CNPJs
  if (/^(\d)\1+$/.test(cnpj)) return false;

  const calc = (cnpj, length) => {
    const numbers = cnpj.substring(0, length).split('').map(n => +n);
    const factors = length === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
    const sum = numbers.reduce((acc, num, idx) => acc + num * factors[idx], 0);
    const res = sum % 11;
    return res < 2 ? 0 : 11 - res;
  };

  const digit1 = calc(cnpj, 12);
  const digit2 = calc(cnpj, 13);
  return digit1 === parseInt(cnpj[12], 10) && digit2 === parseInt(cnpj[13], 10);
}

// Formats CNPJ with mask XX.XXX.XXX/XXXX-XX
export function formatCnpj(value) {
  const cnpj = normalizeCnpj(value);
  if (cnpj.length <= 2) return cnpj;
  if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
  if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
  if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
}

export default { normalizeCnpj, validateCnpj, formatCnpj };
