import React from 'react';

export default function UsersList({ users = [], onToggleActive, onChangeRole, onRequestToggleActive }) {
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
            <td style={{ padding: 8 }}>{u.displayName}</td>
            <td style={{ padding: 8 }}>
              <select value={u.role || 'user'} onChange={e => onChangeRole && onChangeRole(u.id, e.target.value)}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </td>
            <td style={{ padding: 8 }}>{u.active ? 'Sim' : 'Não'}</td>
            <td style={{ padding: 8 }}>{u.createdAt ? new Date(u.createdAt).toLocaleString('pt-BR') : ''}</td>
            <td style={{ padding: 8 }}>
              <button onClick={() => {
                if (onRequestToggleActive) return onRequestToggleActive(u.id, !u.active, u.username);
                return onToggleActive && onToggleActive(u.id, !u.active);
              }} style={{ marginRight: 8 }}>
                {u.active ? 'Desativar' : 'Ativar'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
