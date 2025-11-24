import React, { useEffect, useState, useCallback } from 'react';
import firebase from '../../services/firebase';
import { normalizeCnpj } from '../../utils/cnpj';

const roleOptions = ['admin','gerente','funcionario','prestador','user'];

export default function UsersEdit() {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [companyCnpj, setCompanyCnpj] = useState('');
  const [form, setForm] = useState({ username: '', senha: '', displayName: '', role: 'user', active: true, email: '', phone: '' });
  const [editingId, setEditingId] = useState(null);
  const [editCache, setEditCache] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  const userRole = localStorage.getItem('userRole') || 'user';
  const storedCnpj = localStorage.getItem('companyCnpj') || '';

  useEffect(() => {
    setCompanyCnpj(storedCnpj);
  }, [storedCnpj]);

  const canAccess = userRole === 'admin' || userRole === 'gerente';

  const loadUsers = useCallback(async () => {
    if (!companyCnpj) return;
    setLoading(true);
    setError('');
    try {
      const list = await firebase.listCompanyUsers(companyCnpj);
      setUsers(list.sort((a,b)=> (a.username||'').localeCompare(b.username||'')));
    } catch (e) {
      setError(e.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [companyCnpj]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!companyCnpj) { setError('CNPJ não disponível'); return; }
    if (!form.username || !form.senha) { setError('Usuário e senha são obrigatórios'); return; }
    setCreating(true);
    setError('');
    try {
      await firebase.registerUser({
        cnpj: companyCnpj,
        usuario: form.username,
        senha: form.senha,
        displayName: form.displayName || form.username,
        role: form.role,
        active: form.active,
        email: form.email || undefined,
        phone: form.phone || undefined
      });
      setForm({ username: '', senha: '', displayName: '', role: 'user', active: true, email: '', phone: '' });
      setShowCreate(false);
      await loadUsers();
    } catch (e) {
      setError(e.message || 'Erro ao criar usuário');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (id) => {
    setEditingId(id);
    const u = users.find(u=>u.id===id);
    if (u) setEditCache(prev => ({ ...prev, [id]: { displayName: u.displayName, role: u.role, active: u.active, email: u.email, phone: u.phone } }));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    const data = editCache[id];
    if (!data) { setEditingId(null); return; }
    setLoading(true);
    setError('');
    try {
      await firebase.updateUser(companyCnpj, id, {
        displayName: data.displayName,
        role: data.role,
        active: data.active,
        email: data.email || null,
        phone: data.phone || null
      });
      setEditingId(null);
      await loadUsers();
    } catch (e) {
      setError(e.message || 'Erro ao salvar edição');
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (id, username) => {
    setConfirmDelete({ id, username });
  };

  const performDelete = async () => {
    if (!confirmDelete) return;
    setLoading(true);
    setError('');
    try {
      await firebase.deleteUser(companyCnpj, confirmDelete.id);
      setConfirmDelete(null);
      await loadUsers();
    } catch (e) {
      setError(e.message || 'Erro ao excluir usuário');
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const matchFilter = filter ? (u.username?.toLowerCase().includes(filter.toLowerCase()) || u.displayName?.toLowerCase().includes(filter.toLowerCase())) : true;
    const matchRole = roleFilter ? u.role === roleFilter : true;
    return matchFilter && matchRole;
  });

  if (!canAccess) {
    return (
      <div style={styles.container}> 
        <h2 style={styles.title}>Gerenciamento de Usuários</h2>
        <p style={styles.restricted}>Acesso restrito. Apenas usuários com nível <strong>admin</strong> ou <strong>gerente</strong> podem visualizar esta página.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Gerenciamento de Usuários</h2>
        {companyCnpj && <span style={styles.badge}>CNPJ: {formatCnpj(companyCnpj)}</span>}
      </div>

      <div style={styles.actionsRow}>
        <div style={styles.filters}>
          <input style={styles.input} placeholder="Buscar por nome ou usuário" value={filter} onChange={e=>setFilter(e.target.value)} />
          <select style={styles.select} value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
            <option value="">Todos os papéis</option>
            {roleOptions.map(r=> <option key={r} value={r}>{r}</option>)}
          </select>
          <button style={styles.secondaryBtn} onClick={loadUsers} disabled={loading}>Recarregar</button>
        </div>
        <button style={styles.primaryBtn} onClick={()=>setShowCreate(p=>!p)}>{showCreate? 'Cancelar' : 'Novo Usuário'}</button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showCreate && (
        <form onSubmit={handleCreate} style={styles.card}>
          <h3 style={styles.subtitle}>Cadastrar Usuário</h3>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Usuário *</label>
              <input style={styles.input} value={form.username} onChange={e=>setForm({...form, username:e.target.value})} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Senha *</label>
              <input style={styles.input} type="password" value={form.senha} onChange={e=>setForm({...form, senha:e.target.value})} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nome</label>
              <input style={styles.input} value={form.displayName} onChange={e=>setForm({...form, displayName:e.target.value})} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>E-mail</label>
              <input style={styles.input} type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Telefone</label>
              <input style={styles.input} value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Papel</label>
              <select style={styles.select} value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
                {roleOptions.map(r=> <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Ativo</label>
              <input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})} />
            </div>
          </div>
          <div style={styles.buttonRow}>
            <button type="submit" style={styles.primaryBtn} disabled={creating}>{creating ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      )}

      <div style={styles.card}>
        <h3 style={styles.subtitle}>Usuários ({filtered.length})</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Usuário</th>
                <th style={styles.th}>Nome</th>
                <th style={styles.th}>Papel</th>
                <th style={styles.th}>E-mail</th>
                <th style={styles.th}>Ativo</th>
                <th style={styles.th}>Criado</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const isEditing = editingId === u.id;
                const cache = editCache[u.id] || {};
                return (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>{u.username}</td>
                    <td style={styles.td}>
                      {isEditing ? (
                        <input style={styles.inputSmall} value={cache.displayName ?? ''} onChange={e=>setEditCache(p=>({...p,[u.id]:{...p[u.id],displayName:e.target.value}}))} />
                      ) : (u.displayName || '-')}
                    </td>
                    <td style={styles.td}>
                      {isEditing ? (
                        <select style={styles.selectSmall} value={cache.role ?? u.role} onChange={e=>setEditCache(p=>({...p,[u.id]:{...p[u.id],role:e.target.value}}))}>
                          {roleOptions.map(r=> <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (u.role || '-')}
                    </td>
                    <td style={styles.td}>
                      {isEditing ? (
                        <input style={styles.inputSmall} type="email" value={cache.email ?? ''} onChange={e=>setEditCache(p=>({...p,[u.id]:{...p[u.id],email:e.target.value}}))} />
                      ) : (u.email || '-')}
                    </td>
                    <td style={styles.tdCenter}>
                      {isEditing ? (
                        <input type="checkbox" checked={cache.active ?? !!u.active} onChange={e=>setEditCache(p=>({...p,[u.id]:{...p[u.id],active:e.target.checked}}))} />
                      ) : (u.active ? '✔' : '✖')}
                    </td>
                    <td style={styles.td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                    <td style={styles.td}>
                      {!isEditing && (
                        <>
                          <button style={styles.smallBtn} onClick={()=>startEdit(u.id)}>Editar</button>{' '}
                          <button style={{...styles.smallBtn, ...styles.dangerBtn}} onClick={()=>requestDelete(u.id,u.username)}>Excluir</button>
                        </>
                      )}
                      {isEditing && (
                        <>
                          <button style={styles.smallBtn} onClick={()=>saveEdit(u.id)}>Salvar</button>{' '}
                          <button style={{...styles.smallBtn, ...styles.secondarySmall}} onClick={cancelEdit}>Cancelar</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td style={styles.emptyTd} colSpan={7}>Nenhum usuário encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h4 style={styles.modalTitle}>Confirmar exclusão</h4>
            <p style={styles.modalText}>Deseja realmente excluir o usuário <strong>{confirmDelete.username}</strong>?</p>
            <div style={styles.modalActions}>
              <button style={styles.secondaryBtn} onClick={()=>setConfirmDelete(null)}>Cancelar</button>
              <button style={styles.dangerBtn} onClick={performDelete} disabled={loading}>{loading? 'Excluindo...' : 'Excluir'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCnpj(value) {
  const v = normalizeCnpj(value);
  if (v.length !== 14) return value;
  return `${v.substring(0,2)}.${v.substring(2,5)}.${v.substring(5,8)}/${v.substring(8,12)}-${v.substring(12,14)}`;
}

const styles = {
  container: { maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 },
  title: { margin: 0, fontSize: '1.6rem', fontWeight: 700 },
  headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  badge: { background: '#eff6ff', color: '#0f4aa3', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #dbeafe' },
  actionsRow: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  filters: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  input: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, minWidth: 220 },
  inputSmall: { padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, minWidth: 120 },
  select: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 },
  selectSmall: { padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 },
  primaryBtn: { background: '#0ea5e9', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
  secondaryBtn: { background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', padding: '10px 16px', borderRadius: 8, fontWeight: 500, cursor: 'pointer' },
  smallBtn: { background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', marginBottom: 4 },
  secondarySmall: { background: '#fff' },
  dangerBtn: { background: '#dc2626', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  error: { background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, fontSize: 13 },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  subtitle: { margin: 0, fontSize: '1.1rem', fontWeight: 600 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: '#374151' },
  buttonRow: { display: 'flex', justifyContent: 'flex-end' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '8px 8px', verticalAlign: 'middle' },
  tdCenter: { padding: '8px 8px', textAlign: 'center', verticalAlign: 'middle' },
  emptyTd: { padding: 18, textAlign: 'center', color: '#64748b', fontSize: 13 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modal: { background: '#fff', padding: 24, borderRadius: 12, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' },
  modalTitle: { margin: 0, fontSize: '1.1rem', fontWeight: 700 },
  modalText: { margin: 0, fontSize: 14, color: '#374151' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 12 },
  restricted: { background: '#fffbeb', padding: '12px 16px', borderRadius: 8, fontSize: 14, color: '#92400e', border: '1px solid #fcd34d' }
};
