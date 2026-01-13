const MODULOS = [
    { nome: "Ordem de Serviço", desc: "Emissão, controle e agenda de ordens com status automático, checklist por etapas e alertas em tempo real.", icone: "📝" },
    { nome: "Compras", desc: "Cotação simplificada, entrada e leitura de NF-e, gestão de fornecedores e automação de pedidos.", icone: "🛒" },
    { nome: "Estoque", desc: "Multi depósitos, níveis mínimos, movimentações, inventários digitais e rastreamento completo.", icone: "📦" },
    { nome: "Financeiro", desc: "Contas a pagar/receber, fluxo de caixa, repasses automáticos, boletos e integração bancária.", icone: "💰" },
    { nome: "CRM", desc: "Gestão total do relacionamento, contatos centralizados, chat omnichannel e integração WhatsApp.", icone: "💬" },
    { nome: "Automação", desc: "Robôs de atendimento, automações comerciais, integrações externas e tarefas inteligentes.", icone: "🤖" }
  ];
  
  export default function Modulos() {
    return (
      <section id="modulos" style={{
        padding: "50px 0",
        background: "linear-gradient(120deg, #f6f9f8 60%, #eafff6 100%)"
      }}>
        <h2 style={{
          textAlign: "center",
          color: "#222",
          fontWeight: 800,
          fontSize: "2rem",
          marginBottom: 38,
          letterSpacing: "0.2px"
        }}>
          Principais módulos do Zillo Assist
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "26px",
          justifyContent: "center",
          maxWidth: 920,
          margin: "0 auto"
        }}>
          {MODULOS.map((mod, i) => (
            <div
              key={i}
              style={{
                background: "linear-gradient(135deg, #ffffff 85%, #eafff6 100%)",
                border: "2.2px solid #222",
                borderRadius: "18px",
                boxShadow: "0 2px 9px rgba(34, 34, 34, 0.08)",
                padding: "28px 20px 20px 20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "border-color 0.18s, box-shadow 0.19s, transform 0.16s",
                position: "relative",
                minHeight: 212,
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = "#6ee7b7";
                e.currentTarget.style.boxShadow = "0 8px 24px #6ee7b750, 0 0 0 3px #caffee66";
                e.currentTarget.style.transform = "translateY(-7px) scale(1.035)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = "#222";
                e.currentTarget.style.boxShadow = "0 2px 9px rgba(34, 34, 34, 0.08)";
                e.currentTarget.style.transform = "none";
              }}
              tabIndex={0}
            >
              {/* Ícone no círculo */}
              <div style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #eafff6 60%, #caffee 100%)",
                boxShadow: "0 3px 12px #6ee7b71c, 0 0px 0px #222",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
                marginTop: -40,
                border: "1.7px solid #6ee7b7",
                position: "absolute",
                left: "50%",
                transform: "translate(-50%, -35%)",
                fontSize: "2.22rem",
                color: "#38d39f",
                zIndex: 2,
                transition: "box-shadow .18s"
              }}>
                {mod.icone}
              </div>
              {/* card content with padding top for the icon overlap */}
              <div style={{ paddingTop: 44 }}>
                <h4 style={{
                  color: "#15c2a0",
                  fontWeight: 800,
                  fontSize: "1.14rem",
                  marginBottom: "11px",
                  letterSpacing: "0.3px",
                  textTransform: "uppercase"
                }}>{mod.nome}</h4>
                <p style={{
                  fontSize: "0.98rem",
                  color: "#38433d",
                  lineHeight: 1.38,
                  margin: 0,
                  opacity: .95
                }}>{mod.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }