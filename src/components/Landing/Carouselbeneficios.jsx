const BENEFICIOS = [
    { icone: "⚡", titulo: "Automação instantânea", desc: "Elimine tarefas repetitivas e ganhe velocidade." },
    { icone: "🔒", titulo: "Segurança garantida", desc: "Seus dados protegidos com criptografia avançada." },
    { icone: "📈", titulo: "Resultados visíveis", desc: "Dashboards e relatórios inteligentes." },
  ];
  
  export default function CarouselBeneficios() {
    return (
      <section style={{
        background: "linear-gradient(120deg,#f7fcfa 60%,#eafff6 100%)",
        padding: "50px 0"
      }}>
        <h2 style={{
          color: "#184e3a",
          textAlign: "center",
          fontWeight: 800,
          letterSpacing: ".07em",
          fontSize: "1.65rem",
          marginBottom: 38,
        }}>
          Por que escolher o ASSISTUS?
        </h2>
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "32px",
          flexWrap: "wrap",
          marginTop: "0"
        }}>
          {BENEFICIOS.map((b, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                minWidth: "218px",
                maxWidth: "256px",
                padding: "28px 20px 25px 20px",
                borderRadius: "14px",
                boxShadow: "0 3px 16px rgba(110,231,183,0.10)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "box-shadow .16s, transform .13s",
                cursor: "pointer",
                border: "1.1px solid #daf6e9"
              }}
              tabIndex={0}
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = "0 6px 22px rgba(110,231,183,0.18)";
                e.currentTarget.style.transform = "translateY(-5px) scale(1.033)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = "0 3px 16px rgba(110,231,183,0.10)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{
                fontSize: "2.4rem",
                marginBottom: "14px",
                color: "var(--primary, #6ee7b7)",
                filter: "drop-shadow(0 1px 0 #eafff6)"
              }}>{b.icone}</div>
              <h4 style={{
                color: "var(--primary, #6ee7b7)",
                fontWeight: 700,
                fontSize: "1.12rem",
                letterSpacing: ".07em",
                marginBottom: 10
              }}>{b.titulo}</h4>
              <p style={{
                color: "#39534d",
                fontSize: "0.98rem",
                lineHeight: 1.42,
                margin: 0,
                fontWeight: 400,
              }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }