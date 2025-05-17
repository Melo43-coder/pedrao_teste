import React from "react";

const PLANOS = [
  {
    nome: "Starter",
    preco: "R$ 59,90/mês",
    destaque: false,
    recursos: [
      "Controle básico de ordens de serviço",
      "Emissão de NFS-e simplificada",
      "Estoque essencial",
      "Suporte online"
    ]
  },
  {
    nome: "Smart",
    preco: "R$ 129,90/mês",
    destaque: true,
    recursos: [
      "Todos recursos Starter",
      "Gestão de compras",
      "Financeiro integrado",
      "Agenda inteligente",
      "Módulo CRM"
    ]
  },
  {
    nome: "Ultimate",
    preco: "R$ 219,90/mês",
    destaque: false,
    recursos: [
      "Todos recursos Smart",
      "Automação com robôs IA",
      "Integração WhatsApp",
      "Acesso a API / integrações",
      "Suporte premium"
    ]
  }
];

export default function Planos() {
  return (
    <section id="planos" style={{
      background: "var(--bg, #f6f9f8)",
      padding: "60px 0",
    }}>
      <h2 style={{
        textAlign: "center",
        fontSize: "2rem",
        color: "#222", // título preto
        fontWeight: 700,
        marginBottom: 40,
        letterSpacing: "0.2px"
      }}>
        Planos Flexíveis
      </h2>
      <div style={{
        display: "flex",
        gap: 35,
        justifyContent: "center",
        flexWrap: "wrap"
      }}>
        {PLANOS.map((p, i) => (
          <div key={i} style={{
            background: p.destaque
              ? "linear-gradient(120deg,#ebfff6 78%,#e0fbf0 100%)"
              : "#fff",
            border: p.destaque
              ? "2.1px solid var(--primary, #6ee7b7)"
              : "1.2px solid #e2f4ef",
            borderRadius: 20,
            boxShadow: "0 3px 16px rgba(87,183,143,.10)",
            minWidth: 270,
            maxWidth: 290,
            padding: "34px 20px 32px 20px",
            marginTop: p.destaque ? -12 : 16,
            position: "relative",
            transition: "transform .2s, box-shadow .18s",
            transform: p.destaque ? "scale(1.045)" : "scale(1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
            {p.destaque && <span style={{
              position: "absolute",
              top: 19, right: 22,
              background: "var(--primary, #6ee7b7)",
              color: "#fff",
              padding: "3px 17px",
              borderRadius: "6.5px",
              fontSize: "0.94rem",
              letterSpacing: ".9px",
              fontWeight: 600,
              boxShadow: "0 1px 7px rgba(105,231,183,.14)"
            }}>Recomendado</span>}

            <h4 style={{
              color: "var(--secondary, #44bfa3)",
              fontWeight: 700,
              letterSpacing: ".25px",
              fontSize: "1.15rem",
              marginBottom: 18
            }}>{p.nome}</h4>

            <div style={{
              margin: "6px 0 24px",
              fontSize: "2.08rem",
              color: "var(--primary, #6ee7b7)",
              fontWeight: 600,
              letterSpacing: "-1.5px"
            }}>{p.preco}</div>

            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              marginBottom: 26,
              width: "100%"
            }}>
              {p.recursos.map((r, ii) => (
                <li key={ii} style={{
                  fontSize: "1.04rem",
                  color: "var(--text-secondary, #537269)",
                  margin: "12px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <span role="img" aria-label="check" style={{
                    color: "var(--primary, #6ee7b7)",
                    fontWeight: 700,
                    fontSize: "1.12em"
                  }}>✓</span>
                  {r}
                </li>
              ))}
            </ul>

            {/* Botão centralizado */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}>
              <a
                href="/sistema"
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "center",
                  textDecoration: "none",
                  background: "var(--primary, #6ee7b7)",
                  color: "#174d3c",
                  padding: "12px 0",
                  borderRadius: 9,
                  fontWeight: 700,
                  fontSize: "1.11rem",
                  letterSpacing: ".16px",
                  border: "none",
                  boxShadow: "0 1px 8px rgba(47,183,145,.09)",
                  outline: "none",
                  transition: "background 0.14s, color 0.14s, box-shadow 0.14s, transform .11s",
                  cursor: "pointer"
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = "#8ff3cb";
                  e.currentTarget.style.color = "#0a2c1a";
                  e.currentTarget.style.boxShadow = "0 3px 20px rgba(110,231,183,0.19)";
                  e.currentTarget.style.transform = "scale(1.04)";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = "var(--primary, #6ee7b7)";
                  e.currentTarget.style.color = "#174d3c";
                  e.currentTarget.style.boxShadow = "0 1px 8px rgba(47,183,145,.09)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Experimente
              </a>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        textAlign: "center",
        marginTop: 38,
        color: "#97b3ab",
        fontSize: "1rem",
        fontStyle: "italic"
      }}>
        * Experimente qualquer plano gratuitamente por 14 dias. Sem cartão.
      </div>
    </section>
  );
}