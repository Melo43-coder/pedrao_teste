import React from "react";
import { NavLink } from "react-router-dom";
const items = [
  { rota:"os", nome:"Ordem de Serviço" },
  { rota:"compras", nome:"Compras" },
  { rota:"estoque", nome:"Estoque" },
  { rota:"financeiro", nome:"Financeiro" },
  { rota:"crm", nome:"CRM" },
  { rota:"automacao", nome:"Automação" },
];
export default function Sidebar() {
  return (
    <nav style={{background:"#e86c00",color:"#fff",height:"100vh",minWidth:"180px",padding:"28px 0"}}>
      <ul style={{listStyle:"none",margin:0,padding:0}}>
        {items.map((it,i)=>(
          <li key={i} style={{marginBottom:"18px"}}>
            <NavLink to={`/dashboard/${it.rota}`} style={({isActive})=>({color:isActive?"#fff":"#ffe3ca",textDecoration:"none",fontWeight:isActive?"bold":"normal",fontSize:"17px"})}>{it.nome}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}