export default function Sobre() {
    return (
      <section id="sobre" style={{
        padding: "60px 0",
        background: "var(--bg)",
        maxWidth: "900px",
        margin: "0 auto"
      }}>
        <h2 style={{
          color: "var(--primary)",
          fontSize: "2.1rem",
          textAlign: "center",
          marginBottom: 22,
          fontWeight: 700
        }}>Sobre o Zillo Assist</h2>
        <p style={{
          color: "var(--text-primary)",
          fontSize: "1.17rem",
          lineHeight: 1.7,
          marginBottom: 32,
          textAlign: "center"
        }}>
          O <strong>Zillo</strong> é muito mais do que uma Plataforma de Gestão.<br />
          É a evolução da administração para negócios de serviços, integrando tecnologia, agilidade e inteligência em um ecossistema único.<br />
          Desenvolvido para pequenas, médias e grandes empresas, o Zillo elimina a complexidade dos processos do dia a dia, centralizando vendas, ordens de serviço, comercial, compras, estoque, financeiro e atendimento em um fluxo digital moderno e automatizado.
        </p>
  
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "32px",
          justifyContent: "center"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "14px",
            boxShadow: "0 3px 14px #38d39f0a",
            minWidth: "260px",
            flex: 1,
            padding: "28px 20px",
            maxWidth: "330px"
          }}>
            <h3 style={{
              color: "var(--secondary)",
              marginBottom: 10,
              fontSize: "1.2rem"
            }}>Missão</h3>
            <p style={{ color: "#354d46", fontSize: "1.02rem", lineHeight: 1.5 }}>
              Democratizar a inovação na gestão de serviços,<br />
              tornando operações mais inteligentes,<br />
              acessíveis e sustentáveis, para que empresas de todos os portes atinjam alta performance e excelência no atendimento.
            </p>
          </div>
          <div style={{
            background: "#fff",
            borderRadius: "14px",
            boxShadow: "0 3px 14px #38d39f0a",
            minWidth: "260px",
            flex: 1,
            padding: "28px 20px",
            maxWidth: "330px"
          }}>
            <h3 style={{
              color: "var(--secondary)",
              marginBottom: 10,
              fontSize: "1.2rem"
            }}>Visão</h3>
            <p style={{ color: "#354d46", fontSize: "1.02rem", lineHeight: 1.5 }}>
              Ser referência em soluções digitais para prestadores de serviço no Brasil e América Latina,<br />
              inspirando a transformação digital com ferramentas intuitivas, automação inteligente e atendimento próximo ao cliente.
            </p>
          </div>
        </div>
  
        <p style={{
          color: "#66a692",
          fontStyle: "italic",
          marginTop: 36,
          textAlign: "center",
          fontSize: "1.03rem"
        }}>
          Zillo Assist: do básico ao avançado, para quem quer crescer com tecnologia e simplicidade.<br />
          Um sistema, todas as respostas.
        </p>
      </section>
    );
  }