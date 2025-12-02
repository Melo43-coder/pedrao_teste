import React, { useState, useEffect } from "react";

const DEPOIMENTOS = [
  {
    nome: "João Ferreira",
    cargo: "CEO, TechServ",
    texto: "O Assistus revolucionou a rotina da minha empresa. Extremamente fácil e visual, recomendo!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    nome: "Mariana Perez",
    cargo: "Gestora, SaúdePro",
    texto: "Automação de tarefas salvou horas por dia. O suporte é excelente.",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    nome: "Carlos Melo",
    cargo: "Diretor, ConsertaMais",
    texto: "Depois do Assistus, nosso controle financeiro ficou simples e transparente. Os módulos falam entre si!",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg"
  },
  {
    nome: "Larissa Oliveira",
    cargo: "Supervisora de Operações, LimpaFácil",
    texto: "Ter todos os relatórios em um clique, inclusive pelo celular, traz paz nas auditorias.",
    avatar: "https://randomuser.me/api/portraits/women/43.jpg"
  },
  {
    nome: "Marcos Assis",
    cargo: "Sócio, Manutech Serviços",
    texto: "O CRM integrado nos ajudou a fidelizar clientes e crescer o faturamento.",
    avatar: "https://randomuser.me/api/portraits/men/51.jpg"
  }
];

const CAROUSEL_SIZE = 3;
const INTERVAL = 5500;

function getGroup(arr, start, size = 3) {
  // Retorna grupo de 'size' depoimentos, com loop (circular)
  const group = [];
  for (let i = 0; i < size; i++) {
    group.push(arr[(start + i) % arr.length]);
  }
  return group;
}

export default function Depoimentos() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  // Auto-rotação com efeito fade
  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((cur) => (cur + CAROUSEL_SIZE) % DEPOIMENTOS.length);
        setFade(true);
      }, 400);
    }, INTERVAL);
    return () => clearTimeout(timer);
  }, [current]);

  // Avança manual (com fade suave)
  const next = () => {
    setFade(false);
    setTimeout(() => {
      setCurrent((cur) => (cur + CAROUSEL_SIZE) % DEPOIMENTOS.length);
      setFade(true);
    }, 400);
  };

  // Volta manual (com fade suave)
  const prev = () => {
    setFade(false);
    setTimeout(() => {
      setCurrent((cur) =>
        (cur - CAROUSEL_SIZE + DEPOIMENTOS.length) % DEPOIMENTOS.length
      );
      setFade(true);
    }, 400);
  };

  const group = getGroup(DEPOIMENTOS, current, CAROUSEL_SIZE);

  return (
    <section
      id="depoimentos"
      style={{
        background: "var(--bg)",
        padding: "70px 0"
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "var(--primary)",
          marginBottom: "44px",
          fontWeight: "700"
        }}
      >
        Histórias de sucesso com o Assistus
      </h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16
        }}
      >
        <button
          onClick={prev}
          aria-label="Anterior"
          style={{
            background: "none",
            border: "none",
            fontSize: "2.2rem",
            color: "var(--primary)",
            cursor: "pointer",
            minHeight: 120,
            minWidth: 24,
            transition: "color 0.2s"
          }}
        >
          ‹
        </button>
        <div
          style={{
            display: "flex",
            gap: 28,
            transition: "opacity 0.4s",
            opacity: fade ? 1 : 0.11
          }}
        >
          {group.map((d, i) => (
            <div
              key={i + d.nome}
              style={{
                background: "#fff",
                borderRadius: "18px",
                padding: "37px 24px 26px 24px",
                width: "320px",
                minHeight: "240px",
                boxShadow: "0 8px 22px #1abc9c14",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                border: "2px solid #dcfff2",
                position: "relative",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer"
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = "translateY(-6px) scale(1.036)";
                e.currentTarget.style.boxShadow = "0 14px 34px #38d39f23";
                e.currentTarget.style.border = "2.5px solid var(--primary)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 8px 22px #1abc9c14";
                e.currentTarget.style.border = "2px solid #dcfff2";
              }}
              tabIndex={0}
            >
              <img
                src={d.avatar}
                alt={d.nome}
                style={{
                  width: "62px",
                  height: "62px",
                  borderRadius: "50%",
                  marginBottom: "13px",
                  border: "1.8px solid var(--primary)",
                  boxShadow: "0 2px 10px #1abc9c19"
                }}
              />
              <p
                style={{
                  fontStyle: "italic",
                  color: "#29423a",
                  fontSize: "1.07rem",
                  margin: "12px 0 21px"
                }}
              >
                “{d.texto}”
              </p>
              <strong
                style={{
                  color: "var(--secondary)",
                  fontSize: "1.09rem"
                }}
              >
                {d.nome}
              </strong>
              <div
                style={{
                  fontSize: "0.99rem",
                  color: "#7cc8b0",
                  marginTop: "1px"
                }}
              >
                {d.cargo}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={next}
          aria-label="Próximo"
          style={{
            background: "none",
            border: "none",
            fontSize: "2.2rem",
            color: "var(--primary)",
            cursor: "pointer",
            minHeight: 120,
            minWidth: 24,
            transition: "color 0.2s"
          }}
        >
          ›
        </button>
      </div>
      {/* Indicadores de grupo (dots) */}
      <div
        style={{
          display: "flex",
          gap: 6,
          justifyContent: "center",
          marginTop: 30
        }}
      >
        {Array.from(
          {
            length: Math.ceil(DEPOIMENTOS.length / CAROUSEL_SIZE)
          },
          (_, idx) => (
            <span
              key={idx}
              style={{
                width: 13,
                height: 13,
                borderRadius: "50%",
                display: "inline-block",
                background:
                  current / CAROUSEL_SIZE === idx
                    ? "var(--primary)"
                    : "#e5f9f2",
                border:
                  current / CAROUSEL_SIZE === idx
                    ? "2px solid #38d39f"
                    : "2px solid #e5f9f2",
                transition: "background 0.2s, border 0.2s",
                cursor: "pointer"
              }}
              onClick={() =>
                setCurrent(idx * CAROUSEL_SIZE)
              }
              aria-label={`Ver grupo de depoimentos ${idx + 1}`}
            ></span>
          )
        )}
      </div>
    </section>
  );
}