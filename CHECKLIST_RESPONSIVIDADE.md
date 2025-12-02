# 🔧 Checklist de Responsividade por Componente

## ✅ Componentes já responsivos
- **SistemaLayout**: Sidebar colapsável, header responsivo
- **Dashboard**: CSS com media queries importado

## 🚀 Recomendações para cada tela

### 1️⃣ **Chat.jsx**
Já implementado com:
- ✅ Layout flexível
- ✅ Mensagens adaptativas
- ✅ Input responsivo

**Melhorias sugeridas:**
```jsx
// Adicionar useResponsive hook
const { isMobile, isTablet } = useResponsive();

// Adaptar tamanho de font em mensagens
fontSize: isMobile ? 12 : 14
```

---

### 2️⃣ **Dashboard.jsx**
Menu de navegação responsivo

**Para melhorar:**
```css
/* Mobile - menu em hamburger */
@media (max-width: 767px) {
  .menu {
    position: fixed;
    left: -100%;
    transition: left 0.3s;
  }
  
  .menu.active {
    left: 0;
  }
}
```

---

### 3️⃣ **Compras.jsx**
Tabela de compras e cotações

**Implementar:**
```jsx
import { ResponsiveTable } from '../Responsive';

// Trocar tabela por ResponsiveTable
<ResponsiveTable
  headers={['Fornecedor', 'Valor', 'Status']}
  rows={compras.map(c => [c.fornecedor, c.valor, c.status])}
/>
```

---

### 4️⃣ **Estoque.jsx**
Inventário e produtos

**Sugestão:**
```jsx
// Grid responsivo
const { isMobile } = useResponsive();

<div style={{
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: isMobile ? 8 : 16
}}>
  {produtos.map(p => <ProdutoCard {...p} />)}
</div>
```

---

### 5️⃣ **Financeiro.jsx**
Gráficos e dados financeiros

**Para gráficos:**
```jsx
// Usar ResponsiveContainer
<ResponsiveContainer>
  <ChartComponent
    width={isMobile ? window.innerWidth - 20 : 600}
    height={isMobile ? 300 : 400}
  />
</ResponsiveContainer>
```

---

### 6️⃣ **OrdemServico.jsx**
Formulários de ordens

**Aplicar:**
```jsx
// Usar form-group responsivo
<div className="form-row">
  <div className="form-group">
    <label>Campo 1</label>
    <input type="text" />
  </div>
  <div className="form-group">
    <label>Campo 2</label>
    <input type="text" />
  </div>
</div>
```

---

### 7️⃣ **CRM.jsx**
Gestão de clientes

**Implementar:**
```jsx
// Cards de clientes
<ResponsiveGrid
  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap={isMobile ? 8 : 16}
>
  {clientes.map(c => <ClienteCard {...c} />)}
</ResponsiveGrid>
```

---

### 8️⃣ **Automacao.jsx**
Fluxos e automações

**Para cards de fluxo:**
```jsx
// Lista de automações responsiva
{isMobile ? (
  <div>{automacoes.map(a => <AutomacaoCard {...a} />)}</div>
) : (
  <ResponsiveGrid>
    {automacoes.map(a => <AutomacaoCard {...a} />)}
  </ResponsiveGrid>
)}
```

---

### 9️⃣ **Home.jsx**
Dashboard home

**Para cards:**
```jsx
const { isMobile, isTablet, isDesktop } = useResponsive();

<ResponsiveGrid
  columns={{
    mobile: 1,
    tablet: 2,
    desktop: 4
  }}
  gap={isMobile ? 8 : 16}
>
  {cards.map(card => <Card {...card} />)}
</ResponsiveGrid>
```

---

### 🔟 **UserProfile.jsx**
Perfil do usuário

**Layout responsivo:**
```jsx
// Foto + dados em coluna em mobile, linha em desktop
<div style={{
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  gap: 16
}}>
  <img src={foto} style={{ width: isMobile ? 150 : 200 }} />
  <div style={{ flex: 1 }}>
    {/* Dados */}
  </div>
</div>
```

---

### 1️⃣1️⃣ **UsersEdit.tsx**
Gestão de usuários (admin)

**Para lista de usuários:**
```jsx
// Em mobile, mostrar resumo
// Em desktop, tabela completa

{isMobile ? (
  <div>{usuarios.map(u => <UsuarioCard {...u} />)}</div>
) : (
  <ResponsiveTable headers={headers} rows={rows} />
)}
```

---

### 1️⃣2️⃣ **Sidebar.jsx**
Menu lateral

**Já responsivo com SistemaLayout**

---

### 1️⃣3️⃣ **Login.jsx**
Página de login

**Para formulário:**
```jsx
<div style={{
  maxWidth: isMobile ? '90vw' : '400px',
  margin: '0 auto',
  padding: isMobile ? 12 : 24
}}>
  {/* Formulário login */}
</div>
```

---

## 📋 Checklist Geral

Para cada componente, verifique:

- [ ] Funciona em 375px (mobile pequeno)
- [ ] Funciona em 768px (tablet)
- [ ] Funciona em 1024px (desktop)
- [ ] Funciona em 1920px (desktop grande)
- [ ] Sem scroll horizontal indesejado
- [ ] Botões com min 44px de altura
- [ ] Inputs com min 40px de altura
- [ ] Fonte legível (min 12px mobile)
- [ ] Espaçamento adequado
- [ ] Imagens responsivas
- [ ] Tabelas transformam em cards
- [ ] Modals não cobrem conteúdo
- [ ] Menus acessíveis em mobile
- [ ] Sem quebras de layout

---

## 🎨 Importações Necessárias

Cada componente deve ter:

```jsx
// No topo do arquivo
import { useResponsive } from '../Responsive';
import '../../styles/responsive.css';
import '../../styles/sistema.css';

// No componente
const { isMobile, isTablet, isDesktop, width } = useResponsive();
```

---

## 📱 Tamanhos de Teste Recomendados

```
Mobile:
- 320px (iPhone 5/SE)
- 375px (iPhone 6/7/8)
- 390px (iPhone 12/13)
- 430px (iPhone 14 Pro Max)

Tablet:
- 481px (Small tablet portrait)
- 600px (Tablet portrait)
- 768px (iPad portrait)
- 1024px (iPad landscape)

Desktop:
- 1366px (Desktop comum)
- 1440px (Desktop)
- 1920px (Full HD)
- 2560px (4K)
```

---

## 🔍 Como Testar

1. **Chrome DevTools:**
   - F12 → Toggle device toolbar
   - Selecionar dispositivo
   - Testar em portrait/landscape

2. **Firefox:**
   - F12 → Responsive Design Mode
   - Custom size input

3. **Safari (Mac):**
   - Cmd+Opt+I → Responsive Design Mode

4. **Real devices:**
   - iPhone, Android, iPad
   - Diferentes orientações

---

## ⚠️ Problemas Comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| Scroll horizontal | Width 100% + padding | Use `box-sizing: border-box` |
| Texto minúsculo | Font-size fixo | Use `clamp()` ou media queries |
| Sidebar cobre conteúdo | Z-index baixo | Aumentar z-index, usar backdrop |
| Botões pequenos | Padding insuficiente | Min 40px height/width |
| Tabela quebra | Sem overflow-x | Transformar em cards mobile |
| Modal quebra | Max-width não definido | Limitar a 95vw mobile |
| Conteúdo escondido | Flex/grid sem min-width | Adicionar `minWidth: 0` |

---

## 💡 Dicas Finais

1. **Mobile-first**: Comece pelo mobile, depois escale
2. **Flexbox over Grid**: Mais flexível para responsividade
3. **Use clamp()**: `font-size: clamp(12px, 2vw, 16px)`
4. **Teste real**: Sempre teste em dispositivos reais
5. **Performance**: Media queries não afetam performance
6. **Touch targets**: Min 44px para botões
7. **Espaçamento**: Mais espaço em mobile
8. **Tipografia**: Melhor legibilidade em telas pequenas

---

**Sistema 100% responsivo = Usuários felizes em qualquer dispositivo!** 🚀
