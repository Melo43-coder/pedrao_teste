export default function Hero() {
    return (
      <section style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(120deg,#f3fcfa 70%,#eafff6 100%)",
        paddingTop: "110px",
        boxSizing: "border-box"
      }}>
        <h1 style={{
          fontSize: "2.7rem",
          color: "var(--primary, #6ee7b7)",
          fontWeight: 800,
          marginBottom: "18px",
          letterSpacing: "-0.7px",
          textAlign: "center",
          maxWidth: 740
        }}>
          O jeito inteligente e sustentável<br />
          de gerenciar serviços
        </h1>
        <p style={{
          fontSize: "1.22rem",
          color: "#39534d",
          marginBottom: "38px",
          fontWeight: 400,
          lineHeight: 1.45,
          maxWidth: 700,
          textAlign: "center"
        }}>
          Transforme o seu negócio com tecnologia intuitiva, automação real e uma experiência digital completa.<br />
          Faça parte da nova geração de empresas eficientes no Brasil.
        </p>
        <a
          href="#planos"
          style={{
            padding: "14px 43px",
            background: "var(--primary, #6ee7b7)",
            color: "#14553c",
            fontSize: "1.18rem",
            borderRadius: "11px",
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 6px 20px rgba(110,231,183,0.14)",
            transition: "background 0.14s, color 0.14s, box-shadow .14s, transform .10s",
            border: "none",
            outline: "none",
            display: "inline-block",
            letterSpacing: ".04em",
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = "#89f2c8";
            e.currentTarget.style.color = "#083d2b";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(110,231,183,0.19)";
            e.currentTarget.style.transform = "scale(1.038)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = "var(--primary, #6ee7b7)";
            e.currentTarget.style.color = "#14553c";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(110,231,183,0.14)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Teste grátis por 14 dias
        </a>
      </section>
    );
  }