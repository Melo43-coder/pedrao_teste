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

export default { normalizeCnpj, validateCnpj };
