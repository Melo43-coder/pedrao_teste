import React from 'react';

export default function UsersList({ users = [], onToggleActive, onChangeRole, onRequestToggleActive, onEdit }) {
  if (!users.length) return <p>Nenhum usuário encontrado.</p>;

  const roles = ['prestador', 'admin', 'funcionario', 'gerente'];

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: 8 }}>Usuário</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Nome</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Nível</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Ativo</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Criado</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Ações</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id} style={{ borderTop: '1px solid #eee' }}>
            <td style={{ padding: 8 }}>{u.username}</td>
            <td style={{ padding: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {u.photoURL && (
                  <img src={u.photoURL} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                )}
                {u.displayName}
              </div>
            </td>
            <td style={{ padding: 8 }}>
              <select value={u.role || 'funcionario'} onChange={e => onChangeRole && onChangeRole(u.id, e.target.value)}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </td>
            <td style={{ padding: 8 }}>{u.active ? 'Sim' : 'Não'}</td>
            <td style={{ padding: 8 }}>{u.createdAt ? new Date(u.createdAt).toLocaleString('pt-BR') : ''}</td>
            <td style={{ padding: 8 }}>
              <button onClick={() => onEdit && onEdit(u)} style={{ marginRight: 8, padding: '4px 8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                ✏️ Editar
              </button>
              <button onClick={() => {
                if (onRequestToggleActive) return onRequestToggleActive(u.id, !u.active, u.username);
                return onToggleActive && onToggleActive(u.id, !u.active);
              }} style={{ padding: '4px 8px', background: u.active ? '#ef4444' : '#10b981', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                {u.active ? 'Desativar' : 'Ativar'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
