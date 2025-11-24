# 🏗️ Arquitetura - Módulo Compras + Firebase

## 📊 Diagrama de Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                    APLICAÇÃO REACT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Módulo: Compras.jsx                                    │  │
│  │  (1057 linhas)                                           │  │
│  │                                                          │  │
│  │  States:                                                │  │
│  │  • fornecedores[]         → Firebase/suppliers          │  │
│  │  • pedidos[]              → Firebase/purchaseOrders     │  │
│  │  • produtos[]             → Firebase/products           │  │
│  │  • showNewOrderForm       → Modal de Pedido             │  │
│  │  • showNewSupplierForm    → Modal de Fornecedor        │  │
│  │  • showNewProductForm     → Modal de Produto            │  │
│  │  • showStockModal         → Modal de Estoque            │  │
│  │                                                          │  │
│  │  Handlers:                                              │  │
│  │  • handleNovoPedido()     ──→ createPurchaseOrder()    │  │
│  │  • handleNovoFornecedor() ──→ createSupplier()         │  │
│  │  • handleNovoProduto()    ──→ createProduct()          │  │
│  │  • handleOperacaoEstoque() ──→ addToStock/removeFromStock│ │
│  │                                                          │  │
│  │  UI Elements:                                           │  │
│  │  ├─ Header (Título + Botões de Ação)                   │  │
│  │  ├─ Barra de Busca                                     │  │
│  │  ├─ Abas: Pedidos | Fornecedores | Produtos            │  │
│  │  └─ Tabelas com dados                                  │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│           ↓            ↓            ↓            ↓              │
│      Importa        Importa      Importa      Importa           │
│      Firebase      Firebase     Firebase     Firebase           │
│      Functions     Functions    Functions    Functions          │
│           ↓            ↓            ↓            ↓              │
└─────────────────────────────────────────────────────────────────┘
         ↓            ↓            ↓            ↓
    ┌────────────────────────────────────────────────┐
    │  firebase.js - Serviços de API                 │
    ├────────────────────────────────────────────────┤
    │                                                │
    │  FORNECEDORES:                                │
    │  • createSupplier(cnpj, data)                │
    │  • listSuppliers(cnpj)                       │
    │  • updateSupplier(cnpj, id, data)            │
    │  • deleteSupplier(cnpj, id)                  │
    │                                                │
    │  PEDIDOS:                                     │
    │  • createPurchaseOrder(cnpj, data)           │
    │  • listPurchaseOrders(cnpj)                  │
    │  • updatePurchaseOrder(cnpj, id, data)       │
    │  • deletePurchaseOrder(cnpj, id)             │
    │                                                │
    │  PRODUTOS:                                    │
    │  • createProduct(cnpj, data)                 │
    │  • listProducts(cnpj)                        │
    │  • updateProduct(cnpj, id, data)             │
    │  • deleteProduct(cnpj, id)                   │
    │                                                │
    │  ESTOQUE:                                     │
    │  • addToStock(cnpj, productId, qty)          │
    │  • removeFromStock(cnpj, productId, qty)     │
    │  • getStockLevel(cnpj, productId)            │
    │                                                │
    └─────────────────┬──────────────────────────────┘
                      │
                      ↓
    ┌────────────────────────────────────────────────┐
    │  Firebase SDK (firebaseConfig.js)              │
    ├────────────────────────────────────────────────┤
    │  • Authentication (signIn/signUp)             │
    │  • Firestore Database (read/write/update)     │
    │  • Collection References                      │
    │  • Document Queries                           │
    └─────────────────┬──────────────────────────────┘
                      │
                      ↓
    ┌────────────────────────────────────────────────┐
    │  FIRESTORE DATABASE (Google Cloud)             │
    ├────────────────────────────────────────────────┤
    │                                                │
    │  companies/{CNPJ}/                            │
    │  ├── suppliers/                               │
    │  │   ├── supplier-123                         │
    │  │   │   ├── id                              │
    │  │   │   ├── nome                            │
    │  │   │   ├── cnpj                            │
    │  │   │   ├── categoria                       │
    │  │   │   ├── email                           │
    │  │   │   ├── telefone                        │
    │  │   │   ├── contato                         │
    │  │   │   ├── createdAt                       │
    │  │   │   └── updatedAt                       │
    │  │   └── supplier-456                        │
    │  │                                            │
    │  ├── purchaseOrders/                         │
    │  │   ├── order-789                           │
    │  │   │   ├── id                              │
    │  │   │   ├── numero (PC-XXXXX)               │
    │  │   │   ├── fornecedorId                    │
    │  │   │   ├── fornecedorNome                  │
    │  │   │   ├── valor                           │
    │  │   │   ├── status                          │
    │  │   │   ├── itens                           │
    │  │   │   ├── data                            │
    │  │   │   ├── descricao                       │
    │  │   │   ├── createdAt                       │
    │  │   │   └── updatedAt                       │
    │  │   └── order-101                           │
    │  │                                            │
    │  ├── products/                               │
    │  │   ├── product-202                         │
    │  │   │   ├── id                              │
    │  │   │   ├── nome                            │
    │  │   │   ├── categoria                       │
    │  │   │   ├── preco                           │
    │  │   │   ├── estoque                         │
    │  │   │   ├── createdAt                       │
    │  │   │   └── updatedAt                       │
    │  │   └── product-303                         │
    │  │                                            │
    │  └── quotations/                             │
    │      └── (future expansion)                  │
    │                                                │
    └────────────────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida - Criar Novo Fornecedor

```
┌─────────────────────────────────┐
│   USUÁRIO CLICA BOTÃO           │
│  "➕ Novo Fornecedor"           │
└──────────────┬──────────────────┘
               │
               ↓
    ┌──────────────────────────┐
    │ setShowNewSupplierForm   │
    │      (true)              │
    └──────────────┬───────────┘
                   │
                   ↓
         ┌─────────────────────┐
         │  MODAL APARECE      │
         │ (formulário exibido)│
         └──────────┬──────────┘
                    │
                    ↓
      ┌─────────────────────────────┐
      │  USUÁRIO PREENCHE FORM      │
      │  • Nome                     │
      │  • CNPJ                     │
      │  • Categoria (opcional)     │
      │  • Email (opcional)         │
      │  • Telefone (opcional)      │
      └──────────────┬──────────────┘
                     │
                     ↓
         ┌─────────────────────────┐
         │  CLICA "Criar Fornecedor"│
         └────────────┬────────────┘
                      │
                      ↓
            ┌──────────────────────┐
            │ handleNovoFornecedor │
            │   (e.preventDefault)│
            └────────────┬─────────┘
                         │
                         ↓
         ┌───────────────────────────────┐
         │ Validação de Campos           │
         │ • Nome obrigatório?           │
         │ • CNPJ obrigatório?           │
         └─────────────┬─────────────────┘
                       │
                 ┌─────┴─────┐
                 │           │
               SIM            NÃO
                 │           │
                 ↓           ↓
         ┌──────────────┐  ┌─────────────────────┐
         │Continua      │  │ setError()          │
         │              │  │ Exibe mensagem      │
         │              │  │ "Nome e CNPJ..." │
         └────────┬─────┘  └──────────────────────┘
                  │
                  ↓
         ┌────────────────────────────┐
         │ setIsLoading(true)         │
         │ "Criando..."               │
         └────────────┬───────────────┘
                      │
                      ↓
      ┌─────────────────────────────────┐
      │ await createSupplier()          │
      │ (chama Firebase)                │
      └────────────┬────────────────────┘
                   │
                   ↓
    ┌──────────────────────────────────┐
    │ Firebase.addDoc()                │
    │ • Normaliza CNPJ                 │
    │ • Cria ID único                  │
    │ • Adiciona timestamps            │
    │ • Salva em Firestore             │
    └────────────┬─────────────────────┘
                 │
                 ↓
      ┌──────────────────────────┐
      │ Novo documento criado ✅ │
      └────────────┬─────────────┘
                   │
                   ↓
         ┌─────────────────────────────┐
         │ Limpa formulário             │
         │ setNovoFornecedor({})        │
         └──────────────┬──────────────┘
                        │
                        ↓
         ┌──────────────────────────────┐
         │ Fecha modal                   │
         │ setShowNewSupplierForm(false) │
         └──────────────┬───────────────┘
                        │
                        ↓
         ┌────────────────────────────┐
         │ Recarrega dados             │
         │ loadAllData(cnpj)           │
         │ • listSuppliers()           │
         │ • listPurchaseOrders()      │
         │ • listProducts()            │
         └──────────────┬──────────────┘
                        │
                        ↓
         ┌───────────────────────────────┐
         │ setIsLoading(false)           │
         │ Dados carregados do Firebase  │
         └──────────────┬────────────────┘
                        │
                        ↓
         ┌──────────────────────────────┐
         │ UI RENDERIZA DADOS           │
         │ Novo fornecedor aparece na   │
         │ aba "Fornecedores"           │
         └──────────────────────────────┘
```

---

## 📂 Estrutura de Pastas

```
pedrao_teste/
├── src/
│   ├── components/
│   │   └── Sistema/
│   │       ├── Compras.jsx                        ✅ NOVO - Firebase integrado
│   │       ├── Compras_old.jsx                    📦 Backup da versão anterior
│   │       ├── COMPRAS_FIREBASE_INTEGRATION.md    📖 Documentação completa
│   │       ├── MUDANCAS_RESUMO.md                 📖 Resumo das mudanças
│   │       ├── EXEMPLOS_COMPRAS_FIREBASE.js       💡 10 exemplos de uso
│   │       ├── Dashboard.jsx
│   │       ├── Sidebar.jsx
│   │       └── [outros componentes...]
│   │
│   └── services/
│       └── firebase.js                             ✅ ATUALIZADO - 7 funções novas
│
└── [outros arquivos...]
```

---

## 🔐 Regras de Segurança Firestore (Recomendadas)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Aplicar regras por CNPJ da empresa
    
    match /companies/{cnpj}/suppliers/{supplierId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.createdBy;
    }
    
    match /companies/{cnpj}/purchaseOrders/{orderId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.createdBy;
    }
    
    match /companies/{cnpj}/products/{productId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.createdBy;
    }
  }
}
```

---

## 📈 Performance & Escalabilidade

### **Indexação Firestore (Recomendada)**

Para melhor performance em buscas, crie índices:

```
Collection: companies/{cnpj}/suppliers
Fields to index:
├── nome (Ascending)
└── categoria (Ascending)

Collection: companies/{cnpj}/purchaseOrders
Fields to index:
├── status (Ascending)
├── data (Descending)
└── fornecedorId (Ascending)

Collection: companies/{cnpj}/products
Fields to index:
├── categoria (Ascending)
├── estoque (Ascending)
└── preco (Ascending)
```

### **Limites e Quotas Firebase**

- **Writes por segundo**: Até 1 write/segundo por documento
- **Reads por segundo**: Unlimited
- **Deletions**: Até 1 delete/segundo por documento
- **Tamanho máximo do documento**: 1 MB

---

## 🔗 Integração com Outros Módulos

### **Dashboard**
```javascript
// Pode importar dados de Compras
import { listPurchaseOrders } from "../../services/firebase";

// Mostrar resumo de pedidos recentes
const pedidosRecentes = await listPurchaseOrders(cnpj);
const totalGasto = pedidosRecentes.reduce((sum, p) => sum + p.valor, 0);
```

### **Estoque (Futuro)**
```javascript
// Sincronizar com sistema de estoque
import { getStockLevel, removeFromStock } from "../../services/firebase";

// Quando vender um produto
await removeFromStock(cnpj, productId, quantidadeVendida);
```

### **Financeiro (Futuro)**
```javascript
// Integrar com sistema de pagamentos
import { listPurchaseOrders } from "../../services/firebase";

// Gerar relatório de despesas
const pedidos = await listPurchaseOrders(cnpj);
const despesaPorMes = agruparPorData(pedidos);
```

---

## ✅ Checklist de Implementação

- [x] Firebase functions criadas
- [x] Compras.jsx refatorado
- [x] Estados gerenciados com hooks
- [x] Modais implementados
- [x] Formulários validados
- [x] Integração com Firestore
- [x] Busca e filtros funcionando
- [x] Tratamento de erros
- [x] Loading states
- [x] Documentação completa
- [x] Exemplos de código
- [ ] Testes unitários (Future)
- [ ] End-to-end tests (Future)
- [ ] Performance optimization (Future)
- [ ] Offline mode (Future)

---

## 📞 Próximas Etapas

1. **Expandir Compras**
   - Adicionar edit/delete com confirmação
   - Importação de NF-e XML
   - Cotações de fornecedores

2. **Integrar com Outros Módulos**
   - Dashboard: Resumo de compras
   - Estoque: Sincronização automática
   - Financeiro: Análise de despesas

3. **Melhorias**
   - Histórico de transações
   - Relatórios PDF
   - Notificações em tempo real
   - Alertas de estoque baixo

---

**Versão**: 1.0.0  
**Última atualização**: 15/04/2025
