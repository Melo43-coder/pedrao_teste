import React, { useState } from "react";

const FAQS = [
  {
    pergunta: "Preciso instalar algo para usar o Zillo Assist?",
    resposta: "Não! O Zillo Assist é 100% online. Basta acessar pelo navegador."
  },
  {
    pergunta: "Posso mudar de plano depois?",
    resposta: "Sim. Você pode fazer upgrade ou downgrade do seu plano a qualquer momento."
  },
  {
    pergunta: "Como funciona a cobrança?",
    resposta: "Após o teste gratuito, você pode pagar via boleto, cartão ou pix (mensal ou anual)."
  },
  {
    pergunta: "Há treinamento ou suporte?",
    resposta: "Oferecemos onboarding e suporte técnico especializado para todos os planos."
  }
];

export default function FAQ() {
  const [ativa, setAtiva] = useState(null);

  return (
    <section id="faq" style={{
      background: "#fff",
      padding: "58px 0"
    }}>
      <h2 style={{
        textAlign: "center",
        color: "var(--primary)",
        marginBottom: "40px"
      }}>Perguntas Frequentes</h2>
      <div style={{
        maxWidth: 700, margin: "0 auto", display: "flex",
        flexDirection: "column", gap: 19
      }}>
        {FAQS.map((f, idx) => (
          <div
            key={idx}
            style={{
              background: "var(--bg)",
              border: "1px solid #e3f6f0",
              borderRadius: 11,
              boxShadow: ativa === idx ? "0 8px 20px #1abc9c13" : "none",
              padding: "18px 26px",
              cursor: "pointer",
              transition: "box-shadow .18s"
            }}
            onClick={() => setAtiva(ativa === idx ? null : idx)}
            tabIndex={0}
          >
            <div style={{
              display: "flex", alignItems: "center", fontWeight: 600,
              fontSize: "1.14rem", color: "var(--secondary)", justifyContent: "space-between"
            }}>
              {f.pergunta}
              <span style={{
                background: "var(--secondary)", color: "#fff",
                width: 34, height: 34, display: "flex", alignItems: "center",
                justifyContent: "center", borderRadius: "50%", fontSize: "1.2rem"
              }}>
                {ativa === idx ? "−" : "+"}
              </span>
            </div>
            {ativa === idx && (
              <div style={{
                marginTop: 12, color: "var(--text-primary)",
                fontSize: "1rem", lineHeight: 1.6, paddingRight: 23
              }}>
                {f.resposta}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}