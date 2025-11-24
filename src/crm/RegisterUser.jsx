import React, { useState } from 'react';
import firebase from '../services/firebase';
import { normalizeCnpj as normalizeCnpjUtil, validateCnpj } from '../utils/cnpj';

export default function RegisterUser({ companyCnpj: propCnpj, onCreated }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [role, setRole] = useState('funcionario');
  const [active, setActive] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [emailField, setEmailField] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cnpjInput, setCnpjInput] = useState(propCnpj ? propCnpj : '');

  const formatCnpj = (valor) => {
    const apenasNumeros = (valor || '').replace(/\D/g, '').slice(0, 14);
    let c = apenasNumeros;
    if (c.length > 2) c = c.slice(0,2) + '.' + c.slice(2);
    if (c.length > 6) c = c.slice(0,6) + '.' + c.slice(6);
    if (c.length > 10) c = c.slice(0,10) + '/' + c.slice(10);
    if (c.length > 15) c = c.slice(0,15) + '-' + c.slice(15);
    return c;
  };

  const normalizeCnpj = (v) => normalizeCnpjUtil(v);
  const isValidCnpj = (v) => validateCnpj(v);

  const handleCreate = async () => {
    setError('');
    const cnpj = propCnpj || normalizeCnpj(cnpjInput);
    if (!cnpj) return setError('Defina o CNPJ primeiro');
    if (!/^[0-9]+$/.test(cnpj)) return setError(`CNPJ inválido: contém caracteres não-numéricos (${cnpj}).`);
    if (cnpj.length !== 14) return setError(`CNPJ inválido: encontrado ${cnpj.length} dígitos (${cnpj}). Use 14 dígitos.`);
    if (!isValidCnpj(cnpj)) return setError(`CNPJ com dígitos verificadores inválidos: ${cnpj}`);

    try {
      const cmp = await firebase.identifyCnpj(cnpj);
      if (!cmp || !cmp.exists) {
        if (!companyName) return setError('Empresa não encontrada. Informe o nome da empresa para cadastrar.');
        await firebase.createCompany(cnpj, { name: companyName });
      }
    } catch (err) {
      console.error('Erro ao verificar/criar empresa', err);
      return setError('Erro ao verificar/criar empresa');
    }

    if (!usuario || !senha) return setError('Preencha usuário e senha');
    if (emailField && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailField)) return setError('Email inválido');
    const phoneDigits = (phone || '').replace(/\D/g, '');

    setLoading(true);
    try {
      await firebase.registerUser({ cnpj, usuario, senha, displayName: nome, role, active, email: emailField, phone: phoneDigits, address, addressNumber });
      setUsuario(''); setSenha(''); setNome('');
      setRole('funcionario'); setActive(true);
      setEmailField(''); setPhone(''); setAddress(''); setAddressNumber('');
      if (!propCnpj) setCnpjInput('');
      if (onCreated) onCreated();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const normalizedCnpj = propCnpj || normalizeCnpj(cnpjInput);
  const cnpjIsNumeric = /^[0-9]+$/.test(normalizedCnpj || '');
  const cnpjLengthOk = (normalizedCnpj || '').length === 14;
  const cnpjValid = cnpjIsNumeric && cnpjLengthOk && isValidCnpj(normalizedCnpj);
  const canCreate = cnpjValid && usuario && senha && !loading;

  return (
    <div style={{ marginBottom: 18, padding: 14, border: '1px solid #eee', borderRadius: 10, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ marginTop: 0 }}>Cadastrar novo usuário</h4>
        {(propCnpj || cnpjInput) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>CNPJ alvo</div>
            <div style={{ marginTop: 6, padding: '6px 12px', borderRadius: 999, background: '#f1f5f9', color: '#0f172a', fontWeight: 600 }}>{formatCnpj(propCnpj || cnpjInput)}</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 8 }}>
        {!propCnpj && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>CNPJ da empresa</label>
            <input
              placeholder="00.000.000/0000-00"
              value={cnpjInput}
              onChange={e => setCnpjInput(formatCnpj(e.target.value))}
              onPaste={e => {
                const pasted = (e.clipboardData || window.clipboardData).getData('text') || '';
                const digits = pasted.replace(/\D/g, '').slice(0,14);
                setCnpjInput(formatCnpj(digits));
                e.preventDefault();
              }}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}
            />
          </div>
        )}

        {propCnpj && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>CNPJ selecionado</label>
            <input readOnly value={formatCnpj(propCnpj)} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb' }} />
            <small style={{ color: '#6b7280', marginTop: 6 }}>Usando CNPJ selecionado no painel. Para mudar, altere no Painel CRM.</small>
          </div>
        )}

        {!propCnpj && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>Nome da empresa</label>
            <input placeholder="Nome da empresa (preencha se a empresa não existir)" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 200 }} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>Nome</label>
          <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>Usuário</label>
          <input placeholder="Usuário" value={usuario} onChange={e => setUsuario(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>Senha</label>
          <input placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} type="password" style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>Nível</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <option value="prestador">prestador</option>
            <option value="admin">admin</option>
            <option value="funcionario">funcionario</option>
            <option value="gerente">gerente</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
            Ativo
          </label>
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>Email</label>
            <input placeholder="email@exemplo.com" value={emailField} onChange={e => setEmailField(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>Telefone</label>
            <input placeholder="(11) 91234-5678" value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>Endereço</label>
            <input placeholder="Rua, Bairro, Cidade - UF" value={address} onChange={e => setAddress(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>Número</label>
            <input placeholder="123" value={addressNumber} onChange={e => setAddressNumber(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={handleCreate} disabled={!canCreate} style={{ padding: '10px 16px', borderRadius: 8, background: canCreate ? '#10b981' : '#9ca3af', color: '#fff', border: 'none', cursor: canCreate ? 'pointer' : 'not-allowed', fontWeight: 600 }}>{loading ? 'Criando...' : 'Criar usuário'}</button>
          {!cnpjValid && <div style={{ color: '#6b7280', fontSize: 13 }}>Informe um CNPJ válido (14 dígitos) antes de criar o usuário.</div>}
        </div>
      </div>

      {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}

      {/* Success area: when not loading and no error and form was just submitted, show quick actions */}
      {/* We'll detect success by checking that loading is false and error is empty and some fields are empty (cleared after success) - simple heuristic */}
      {(!loading && !error && !usuario && !senha) && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700 }}>Usuário criado com sucesso</div>
            <div style={{ color: '#6b7280', marginTop: 4 }}>Você pode enviar as credenciais por e-mail ao usuário.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a
              href={`mailto:${emailField || ''}?subject=${encodeURIComponent('Conta criada')}&body=${encodeURIComponent(`Sua conta foi criada\nUsuário: ${usuario}\nNome: ${nome}\nSenha: ${senha}\nAcesse com seu usuário e senha.`)}`}
              onClick={(e) => {
                if (!emailField) {
                  e.preventDefault();
                  alert('Colete o e-mail antes de enviar.');
                }
              }}
              style={{ padding: '8px 12px', background: '#3b82f6', color: '#fff', borderRadius: 8, textDecoration: 'none' }}
            >Enviar e-mail</a>
            <button onClick={() => { navigator.clipboard && navigator.clipboard.writeText(`Usuário: ${usuario}\nSenha: ${senha}`); alert('Credenciais copiadas para a área de transferência'); }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>Copiar credenciais</button>
          </div>
        </div>
      )}
    </div>
  );
}
