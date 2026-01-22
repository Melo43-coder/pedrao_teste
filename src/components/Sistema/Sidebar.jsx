import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import NotificationCenter from "../Notificacoes/NotificationCenter";
import { FiClipboard, FiShoppingCart, FiPackage, FiDollarSign, FiUsers, FiCpu, FiSettings } from 'react-icons/fi';

const allItems = [
  { rota:"os", nome:"Ordem de Serviço", icon: FiClipboard, allowedRoles: ['admin', 'gerente', 'funcionario', 'prestador'] },
  { rota:"compras", nome:"Compras", icon: FiShoppingCart, allowedRoles: ['admin', 'gerente', 'funcionario'] },
  { rota:"estoque", nome:"Estoque", icon: FiPackage, allowedRoles: ['admin', 'gerente', 'funcionario'] },
  { rota:"financeiro", nome:"Financeiro", icon: FiDollarSign, allowedRoles: ['admin', 'gerente'] },
  { rota:"crm", nome:"CRM", icon: FiUsers, allowedRoles: ['admin'] }, // ⚠️ SOMENTE ADMIN
  { rota:"automacao", nome:"Automação", icon: FiCpu, allowedRoles: ['admin', 'gerente'] },
  { rota:"configuracoes", nome:"Configurações", icon: FiSettings, allowedRoles: ['admin', 'gerente', 'funcionario', 'prestador'] },
];

export default function Sidebar() {
  const [userRole, setUserRole] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // 🔐 Obter role do localStorage (preenchido no login)
    const role = localStorage.getItem('userRole') || 'funcionario';
    setUserRole(role);

    // 🔐 Filtrar itens baseado na role do usuário
    const filteredItems = allItems.filter(item => {
      return item.allowedRoles.includes(role);
    });
    
    setItems(filteredItems);
  }, []);

  return (
    <nav style={{background:"#2C30D5",color:"#fff",height:"100vh",minWidth:"180px",padding:"28px 16px", position: "relative"}}>
      {/* NotificationCenter */}
      <div style={{ position: "absolute", top: "20px", right: "15px", zIndex: 100 }}>
        <NotificationCenter />
      </div>
      
      <ul style={{listStyle:"none",margin:0,padding:0}}>
        {items.map((it,i)=>(
          <li key={i} style={{marginBottom:"18px", paddingLeft: "12px"}}>
            <NavLink 
              to={`/dashboard/${it.rota}`} 
              style={({isActive})=>({
                color:isActive?"#fff":"#d4d8f7",
                textDecoration:"none",
                fontWeight:isActive?"bold":"normal",
                fontSize:"15px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 0",
                borderLeft: isActive ? "3px solid #fff" : "3px solid transparent",
                transition: "all 0.2s ease"
              })}
            >
              <it.icon size={20} style={{ minWidth: '20px' }} />
              <span>{it.nome}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      
      {/* 🔐 Badge de role (apenas para debug - remover em produção) */}
      {userRole && (
        <div style={{
          position: "absolute",
          bottom: "20px",
          left: "16px",
          right: "16px",
          padding: "8px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "6px",
          fontSize: "11px",
          textAlign: "center"
        }}>
          Role: {userRole}
        </div>
      )}
    </nav>
  );
}