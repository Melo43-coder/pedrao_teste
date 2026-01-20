export default function Footer() {
    return (
      <footer style={{
        background:"#222",color:"#eee",padding:"40px 0",marginTop:"40px",textAlign:"center",
        borderTop:"3px solid #38d39f"
      }}>
        <p>&copy; {new Date().getFullYear()} Zillo Assist Software • <a href="mailto:contato@zilloassist.com" style={{color:"#38d39f"}}>contato@zilloassist.com</a></p>
        <nav style={{marginTop:"10px"}}>
          <a href="#modulos" style={{color:"#fff",margin:"0 9px"}}>Módulos</a>
          <a href="#planos" style={{color:"#fff",margin:"0 9px"}}>Planos</a>
          <a href="#depoimentos" style={{color:"#fff",margin:"0 9px"}}>Depoimentos</a>
          <a href="#faq" style={{color:"#fff",margin:"0 9px"}}>FAQ</a>
        </nav>
      </footer>
    );
  }