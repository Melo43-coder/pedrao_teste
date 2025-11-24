import React, { useEffect, useState } from 'react';
import UsersList from './UsersList';
import RegisterUser from './RegisterUser';
import firebase from '../services/firebase';
import { normalizeCnpj as normalizeCnpjUtil, validateCnpj } from '../utils/cnpj';

// Formata CNPJ enquanto digita: 00.000.000/0000-00
function formatCnpj(valor) {
  const apenasNumeros = (valor || '').replace(/\D/g, '').slice(0, 14);
  let c = apenasNumeros;
  if (c.length > 2) c = c.slice(0,2) + '.' + c.slice(2);
  if (c.length > 6) c = c.slice(0,6) + '.' + c.slice(6);
  if (c.length > 10) c = c.slice(0,10) + '/' + c.slice(10);
  if (c.length > 15) c = c.slice(0,15) + '-' + c.slice(15);
  // Ajuste final para ter o traço apenas quando existir dígitos suficientes
  const clean = apenasNumeros;
  if (clean.length <= 12) {
    // remove possíveis sufixos incorretos
    return c.replace(/\-$/, '');
  }
  // aplicar máscara completa se possível
  const padded = clean.padEnd(14, ' ');
  return `${padded.substring(0,2)}.${padded.substring(2,5)}.${padded.substring(5,8)}/${padded.substring(8,12)}-${padded.substring(12,14)}`.trim();
}



export default function AdminPanel() {
  const [companyCnpj, setCompanyCnpj] = useState('');
  const [cnpjInput, setCnpjInput] = useState('');
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all'); // all | active | inactive
  const [confirmModal, setConfirmModal] = useState({ open: false, userId: null, nextActive: null, username: '' });
  const [modalProcessing, setModalProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async (cnpj) => {
    setLoading(true);
    setError('');
    try {
      const list = await firebase.listCompanyUsers(cnpj);
      setUsers(list || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setUsers([]);
      // show the real error message when available to help debugging
      const msg = err && err.message ? err.message : 'Falha ao carregar usuários. Verifique a conexão.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('companyCnpj');
    if (saved) {
      setCompanyCnpj(saved);
      setCnpjInput(formatCnpj(saved));
      loadUsers(saved);
    }
  }, []);

  const handleCnpjChange = (e) => {
    const raw = e.target.value;
    const formatted = formatCnpj(raw);
    setCnpjInput(formatted);
  };

  const handleLoad = () => {
    const normalized = normalizeCnpjUtil(cnpjInput);
    // Provide clearer feedback showing digits and length to help debugging
    if (!normalized || !/^[0-9]+$/.test(normalized)) {
      setError('CNPJ vazio ou contém caracteres inválidos. Digite apenas números.');
      return;
    }
    if (normalized.length !== 14) {
      setError(`CNPJ inválido: encontrado ${normalized.length} dígitos (${normalized}). Use 14 dígitos.`);
      return;
    }
    if (!validateCnpj(normalized)) {
      setError(`CNPJ com formato inválido (cheque dígitos verificadores): ${normalized}`);
      return;
    }
    setCompanyCnpj(normalized);
    localStorage.setItem('companyCnpj', normalized);
    loadUsers(normalized);
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.active).length
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'active') return u.active;
    if (filter === 'inactive') return !u.active;
    return true;
  });

  const styles = {
    page: { padding: 20, fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { margin: 0, fontSize: 20 },
    cnpjBadge: { marginLeft: 12, padding: '6px 10px', borderRadius: 999, background: '#eef2ff', color: '#3730a3', fontWeight: 600, fontSize: 13 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' },
    left: { display: 'flex', flexDirection: 'column', gap: 12 },
    right: { display: 'flex', flexDirection: 'column', gap: 12 },
    card: { background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' },
    statsRow: { display: 'flex', gap: 12 },
    stat: { flex: 1, padding: 12, borderRadius: 8, background: 'linear-gradient(90deg,#f8fafc,#ffffff)', textAlign: 'center' },
    smallLabel: { fontSize: 12, color: '#6b7280' },
    bigValue: { fontSize: 20, fontWeight: 700, marginTop: 6 }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2 style={styles.title}>Painel CRM</h2>
              {companyCnpj && <div style={styles.cnpjBadge}>{formatCnpj(companyCnpj)}</div>}
            </div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>Gerencie usuários da empresa por CNPJ — carregue o CNPJ no topo.</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={cnpjInput}
            onChange={handleCnpjChange}
            placeholder="00.000.000/0000-00"
            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <button onClick={handleLoad} style={{ padding: '8px 12px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}>Carregar</button>
        </div>
      </div>

      {error && <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>}

      <div style={styles.grid}>
        <div style={styles.left}>
          <div style={styles.card}>
            <div style={styles.statsRow}>
              <div style={styles.stat}>
                <div style={styles.smallLabel}>Total de usuários</div>
                <div style={styles.bigValue}>{stats.totalUsers}</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.smallLabel}>Usuários ativos</div>
                <div style={styles.bigValue}>{stats.activeUsers}</div>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <RegisterUser companyCnpj={companyCnpj} onCreated={() => loadUsers(companyCnpj)} />
          </div>

          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ marginTop: 0 }}>Usuários</h3>
              <div>
                <label style={{ marginRight: 8, color: '#6b7280' }}>Filtrar:</label>
                <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '6px 8px', borderRadius: 6 }}>
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
            </div>
            {loading ? <p>Carregando...</p> : (
              <>
                <UsersList
                  users={filteredUsers}
                  onRequestToggleActive={(userId, nextActive, username) => setConfirmModal({ open: true, userId, nextActive, username })}
                  onChangeRole={async (userId, role) => {
                    try {
                      await firebase.updateUser(companyCnpj, userId, { role });
                      await loadUsers(companyCnpj);
                    } catch (err) {
                      console.error(err);
                      alert(err.message || 'Erro ao atualizar usuário');
                    }
                  }}
                />

                {confirmModal.open && (
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 420, boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}>
                      <h4 style={{ marginTop: 0 }}>{confirmModal.nextActive ? 'Confirmar ativação' : 'Confirmar desativação'}</h4>
                      <p>Tem certeza que deseja {confirmModal.nextActive ? 'ativar' : 'desativar'} o usuário <strong>{confirmModal.username}</strong>?</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                        <button onClick={() => setConfirmModal({ open: false, userId: null, nextActive: null, username: '' })} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff' }} disabled={modalProcessing}>Cancelar</button>
                        <button onClick={async () => {
                          setModalProcessing(true);
                          try {
                            await firebase.updateUser(companyCnpj, confirmModal.userId, { active: !!confirmModal.nextActive });
                            await loadUsers(companyCnpj);
                            setConfirmModal({ open: false, userId: null, nextActive: null, username: '' });
                          } catch (err) {
                            console.error(err);
                            alert(err.message || 'Erro ao atualizar usuário');
                          } finally {
                            setModalProcessing(false);
                          }
                        }} style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: '#10b981', color: '#fff' }} disabled={modalProcessing}>
                          {modalProcessing ? 'Processando...' : (confirmModal.nextActive ? 'Ativar' : 'Desativar')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <aside style={styles.right}>
          <div style={styles.card}>
            <h4 style={{ marginTop: 0 }}>Ações</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => { setUsers([]); setCompanyCnpj(''); setCnpjInput(''); localStorage.removeItem('companyCnpj'); }} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>Limpar seleção</button>
              <button onClick={() => loadUsers(companyCnpj)} disabled={!companyCnpj} style={{ padding: 10, borderRadius: 8, border: 'none', background: companyCnpj ? '#3b82f6' : '#9ca3af', color: '#fff', cursor: companyCnpj ? 'pointer' : 'not-allowed' }}>Recarregar usuários</button>
              {!companyCnpj && <div style={{ color: '#6b7280', fontSize: 12, marginTop: 8 }}>Carregue um CNPJ válido acima para habilitar ações.</div>}
            </div>
          </div>

          <div style={styles.card}>
            <h4 style={{ marginTop: 0 }}>Informações</h4>
            <div style={{ color: '#6b7280', fontSize: 13 }}>
              Use esse painel para visualizar e cadastrar usuários vinculados ao CNPJ informado.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
