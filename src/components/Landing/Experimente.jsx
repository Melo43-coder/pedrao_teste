export default function Experimente() {
    return (
      <section style={{background:"linear-gradient(90deg,#38d39f,#1abc9c)",padding:"52px 0",textAlign:"center",color:"#fff",marginTop:"-12px"}}>
        <h2 style={{fontWeight:"bold",fontSize:"2.1rem"}}>Pronto para transformar sua operação?</h2>
        <p style={{fontSize:"19px",margin:"10px 0 30px"}}>Cadastre-se agora e teste o SmartOps grátis por 14 dias. Sem cartão de crédito, sem compromisso!</p>
        <a href="/sistema" style={{
          background:"#fff",color:"#1abc9c",padding:"15px 36px",
          borderRadius:"9px",fontWeight:600,fontSize:"1.1rem",
          textDecoration:"none",transition:".2s"
        }}
        onMouseOver={e=>e.currentTarget.style.background="#eafff6"}
        onMouseOut={e=>e.currentTarget.style.background="#fff"}
        >Quero testar grátis</a>
      </section>
    );
  }