# 📱 Guia de Responsividade - SmartOps

## Como Usar Componentes Responsivos

### 1. Imports Necessários

```jsx
import { useResponsive, ResponsiveContainer, ResponsiveGrid, ResponsiveFlex } from '../Responsive';
import '../../styles/responsive.css';
import '../../styles/sistema.css';
```

### 2. Hook `useResponsive()`

Detecta tamanho da tela em tempo real:

```jsx
const { isMobile, isTablet, isDesktop, width, height, isLandscape } = useResponsive();

// Usar para condicionar renderização
{isMobile && <MobileComponent />}
{isTablet && <TabletComponent />}
{isDesktop && <DesktopComponent />}
```

### 3. ResponsiveContainer

Wrapper que garante overflow correto:

```jsx
<ResponsiveContainer>
  <div>Seu conteúdo aqui</div>
</ResponsiveContainer>
```

### 4. ResponsiveGrid

Grid que muda colunas baseado em viewport:

```jsx
<ResponsiveGrid
  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap={12}
>
  {items.map(item => <Card key={item.id} {...item} />)}
</ResponsiveGrid>
```

### 5. ResponsiveFlex

Flexbox que stacks em mobile:

```jsx
<ResponsiveFlex direction="row" wrap={true} gap={16}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</ResponsiveFlex>
```

### 6. ResponsiveTable

Tabelas que viram cards em mobile:

```jsx
<ResponsiveTable
  headers={['Nome', 'Email', 'Status']}
  rows={data.map(d => [d.name, d.email, d.status])}
/>
```

### 7. ResponsiveModal

Modal que redimensiona automaticamente:

```jsx
const [isOpen, setIsOpen] = useState(false);

<ResponsiveModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Meu Modal"
>
  <p>Conteúdo do modal</p>
</ResponsiveModal>
```

## Breakpoints

```
Mobile:        < 481px
Tablet:        481px - 1023px
Desktop:       1024px - 1439px
Large Desktop: 1440px - 1919px
XL Desktop:    >= 1920px
```

## Classes CSS Disponíveis

### Utilitários
- `.hide-on-mobile` - Esconde em mobile
- `.show-on-mobile` - Mostra apenas em mobile
- `.flex-responsive` - Flexbox responsivo
- `.text-responsive-sm` - Texto responsivo pequeno
- `.text-responsive-md` - Texto responsivo médio
- `.text-responsive-lg` - Texto responsivo grande
- `.text-responsive-xl` - Texto responsivo extra large
- `.text-responsive-2xl` - Texto responsivo 2x large

### Espaçamento
- `.padding-responsive` - Padding que adapta
- `.margin-responsive` - Margin que adapta

## Exemplo Completo - Chat Responsivo

```jsx
import { useResponsive, ResponsiveFlex } from '../Responsive';

export default function Chat() {
  const { isMobile, isTablet } = useResponsive();

  return (
    <ResponsiveFlex direction={isMobile ? 'column' : 'row'} gap={8}>
      {/* Lista de chats */}
      <div
        style={{
          flex: isMobile ? '0 0 30vh' : isTablet ? '0 0 200px' : '0 0 280px',
          borderRight: !isMobile ? '1px solid #e5e7eb' : 'none',
          borderBottom: isMobile ? '1px solid #e5e7eb' : 'none',
          overflow: 'auto',
        }}
      >
        {/* Chats aqui */}
      </div>

      {/* Mensagens */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Mensagens aqui */}
      </div>
    </ResponsiveFlex>
  );
}
```

## Media Queries Personalizadas

Se precisa de customização específica, use:

```css
/* Desktop */
@media (min-width: 1024px) {
  .meu-elemento {
    /* estilos desktop */
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .meu-elemento {
    /* estilos tablet */
  }
}

/* Mobile */
@media (max-width: 767px) {
  .meu-elemento {
    /* estilos mobile */
  }
}

/* Landscape */
@media (orientation: landscape) {
  .meu-elemento {
    /* estilos landscape */
  }
}
```

## Dicas Importantes

1. **Sempre use `min-width: 0` em flex items** para evitar overflow:
```jsx
<div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
```

2. **Use `clamp()` para texto responsivo**:
```css
font-size: clamp(12px, 2vw, 16px);
```

3. **Teste em diferentes breakpoints**:
- Use DevTools para simular diferentes tamanhos
- Teste em dispositivos reais

4. **Priorize mobile-first**:
- Comece com estilos mobile
- Use `@media` para aumentar para maiores

5. **Evite overflow-x**:
- Use `width: 100%` em containers
- Use `overflow-x: hidden` no body

## Componentes da Sistema que Já São Responsivos

✅ SistemaLayout - Sidebar colapsável em mobile
✅ Chat - Layout flex adaptativo
✅ Tables - Transformam em cards em mobile
✅ Forms - Grid responsivo
✅ Buttons - Tamanho touch-friendly
✅ Cards - Padding adaptativo

## Para Adicionar Responsividade em Novo Componente

1. Importe os hooks e CSS:
```jsx
import { useResponsive } from '../Responsive';
import '../../styles/responsive.css';
```

2. Use o hook:
```jsx
const { isMobile, isTablet, isDesktop } = useResponsive();
```

3. Adapte o layout:
```jsx
return (
  <div style={{
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr',
    gap: isMobile ? 8 : 16
  }}>
    {/* conteúdo */}
  </div>
);
```

## Testando Responsividade

### Chrome DevTools
1. F12 → Clique em dispositivo
2. Selecione diferentes dispositivos
3. Teste em modo landscape/portrait

### Testes Recomendados
- iPhone SE (375px)
- iPhone 12 (390px)
- iPhone 14 Pro Max (430px)
- iPad (768px)
- iPad Pro (1024px)
- Desktop 1366px
- Desktop 1920px

## Problemas Comuns e Soluções

### Problema: Layout quebra em tablet
**Solução**: Use `minWidth: 0` em flex items
```jsx
<div style={{ flex: 1, minWidth: 0 }}>
```

### Problema: Texto muito pequeno em mobile
**Solução**: Use `clamp()` ou `useResponsive`
```jsx
fontSize: isMobile ? 12 : 14
// ou
fontSize: 'clamp(12px, 2vw, 14px)'
```

### Problema: Sidebar cobre conteúdo
**Solução**: Use `z-index` correto e backdrop
```jsx
zIndex: 999 // Sidebar
// com backdrop z-index: 998
```

### Problema: Scrolling horizontal indesejado
**Solução**: Adicione ao container:
```jsx
style={{ overflow: 'hidden', width: '100vw' }}
```

## Performance

- Components responsivos não usam muita performance
- `useResponsive` usa `ResizeObserver` internamente
- Media queries são eficientes
- Teste com Lighthouse para verificar performance

---

**Mantendo todas as telas responsivas, seu sistema funcionará perfeitamente em qualquer dispositivo!** 🎉
