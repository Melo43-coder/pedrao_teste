import React from "react";

// Verde clarinho sugerido: #6ee7b7. Se quiser outra cor, mude os valores.
// Garanta que --primary está definida no CSS global, ex: :root { --primary: #6ee7b7; }

export default function Header() {
  return (
    <header
      style={{
        background: "rgba(246, 255, 251, 0.95)",
        boxShadow: "0 2px 12px rgba(110, 231, 183, 0.07)", // sombra verdinha bem clara
        position: "fixed",
        zIndex: 10,
        top: 0,
        width: "100%",
        backdropFilter: "blur(9px)",
        padding: 0,
        transition: "box-shadow 0.18s"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 1160,
          margin: "0 auto",
          height: 64,
          padding: "0 22px"
        }}
      >
        {/* Logo */}
        <a href="/" style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none"
        }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: "1.55rem",
              letterSpacing: "0.7px",
              color: "var(--primary, #6ee7b7)", // Aplica o verde clarinho
              opacity: 0.95,
              marginRight: 5,
              userSelect: "none"
            }}
          >
            Zillo Assist
          </span>
          {/* Se tiver SVG da logo, coloque aqui com filtro verde, ex:
          <img src="/logo.svg" style={{height: 34, filter: "brightness(0) saturate(100%) invert(80%) sepia(12%) saturate(1000%) hue-rotate(90deg)" }}/>
          */}
        </a>
        {/* Menu */}
        <nav
          style={{
            display: "flex",
            gap: 21,
            alignItems: "center"
          }}
        >
          <a
            href="#modulos"
            style={{
              color: "#39534d",
              fontWeight: 500,
              opacity: 0.79,
              textDecoration: "none",
              fontSize: "1rem",
              padding: "3px 10px",
              transition: "color 0.13s",
            }}
          >Módulos</a>
          <a
            href="#planos"
            style={{
              color: "#39534d",
              fontWeight: 500,
              opacity: 0.79,
              textDecoration: "none",
              fontSize: "1rem",
              padding: "3px 10px"
            }}
          >Planos</a>
          <a
            href="#faq"
            style={{
              color: "#39534d",
              fontWeight: 500,
              opacity: 0.79,
              textDecoration: "none",
              fontSize: "1rem",
              padding: "3px 10px"
            }}
          >FAQ</a>
          <a
            href="/sistema"
            style={{
              background: "var(--primary, #6ee7b7)", // Usa o verde claro
              color: "#1d4338", // Verde escuro ou à sua escolha para contraste
              padding: "7px 22px",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: "1rem",
              boxShadow: "0 1px 5px rgba(110, 231, 183, 0.18)",
              marginLeft: 12,
              textDecoration: "none",
              border: "none",
              outline: "none",
              transition: "background .14s, color .14s, box-shadow .14s",
              display: "inline-block",
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = "#86f1c4"; // Um verde claro num tom acima
              e.currentTarget.style.color = "#124839"; // Mais escuro ainda
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(110, 231, 183, 0.27)";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "var(--primary, #6ee7b7)";
              e.currentTarget.style.color = "#1d4338";
              e.currentTarget.style.boxShadow = "0 1px 5px rgba(110, 231, 183, 0.18)";
            }}
          >
            Acessar
          </a>
        </nav>
      </div>
    </header>
  );
}