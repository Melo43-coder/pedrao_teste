# 🛒 Integração Firebase - Módulo Compras

## ✅ Status da Integração

A partir de agora, o módulo **Compras** está **100% integrado com Firebase Firestore**!

### O que mudou:

- ❌ **Removido**: Todos os dados MOCK (MOCK_FORNECEDORES, MOCK_PEDIDOS, MOCK_PRODUTOS)
- ✅ **Adicionado**: Integração completa com Firebase Firestore
- ✅ **Novo**: Sistema de gerenciamento de estoque
- ✅ **Novo**: Modais para criar/editar fornecedores, pedidos e produtos

---

## 📊 Funcionalidades Principais

### 1. **Fornecedores (Suppliers)**
Cadastre e gerencie seus fornecedores.

**Operações disponíveis:**
- ➕ Criar novo fornecedor
- 👁️ Listar todos os fornecedores
- ✏️ Editar informações (em desenvolvimento)
- 🗑️ Deletar fornecedor (em desenvolvimento)

**Campos do Fornecedor:**
```javascript
{
  id: "auto-gerado",
  nome: "Nome da Empresa",
  cnpj: "XX.XXX.XXX/0001-XX",
  categoria: "Químicos, Eletrônicos, etc.",
  contato: "Nome do contato",
  email: "contato@empresa.com",
  telefone: "(XX) XXXXX-XXXX",
  createdAt: "2025-04-15T10:30:00Z",
  updatedAt: "2025-04-15T10:30:00Z"
}
```

---

### 2. **Pedidos de Compra (Purchase Orders)**
Crie e acompanhe pedidos de compra junto aos fornecedores.

**Operações disponíveis:**
- ➕ Criar novo pedido
- 👁️ Listar todos os pedidos
- ✏️ Alterar status do pedido (em desenvolvimento)
- 🗑️ Cancelar pedido (em desenvolvimento)

**Campos do Pedido:**
```javascript
{
  id: "auto-gerado",
  numero: "PC-XXXXX", // Auto-gerado
  fornecedorId: "id-do-fornecedor",
  fornecedorNome: "Nome do Fornecedor",
  valor: 1234.56,
  status: "Processando | Faturado | Recebido | Cancelado",
  itens: 5, // Quantidade de itens no pedido
  descricao: "Detalhes do pedido",
  data: "2025-04-15",
  createdAt: "2025-04-15T10:30:00Z",
  updatedAt: "2025-04-15T10:30:00Z"
}
```

**Status disponíveis:**
- 🔄 **Processando** - Pedido em preparação
- 📋 **Faturado** - NF-e emitida
- ✅ **Recebido** - Produtos recebidos
- ❌ **Cancelado** - Pedido cancelado

---

### 3. **Produtos (Products)**
Mantenha um catálogo de todos os seus produtos.

**Operações disponíveis:**
- ➕ Criar novo produto
- 👁️ Listar todos os produtos com estoque
- ✏️ Atualizar informações do produto (em desenvolvimento)
- 🗑️ Deletar produto (em desenvolvimento)

**Campos do Produto:**
```javascript
{
  id: "auto-gerado",
  nome: "Nome do Produto",
  categoria: "Químicos, Eletrônicos, etc.",
  preco: 99.90,
  estoque: 25, // Quantidade em estoque
  createdAt: "2025-04-15T10:30:00Z",
  updatedAt: "2025-04-15T10:30:00Z"
}
```

**Indicadores de Estoque:**
- 🟢 **Verde** (>10 unidades) - Estoque saudável
- 🟡 **Amarelo** (1-10 unidades) - Estoque baixo
- 🔴 **Vermelho** (0 unidades) - Sem estoque

---

### 4. **Gerenciamento de Estoque (Inventory)**
Adicione ou remova produtos do estoque.

**Operações disponíveis:**
- ➕ Adicionar quantidade ao estoque
- ➖ Remover quantidade do estoque
- 👁️ Ver nível de estoque atual

**Como usar:**
1. Clique no botão **"📦 Gerenciar Estoque"**
2. Selecione um produto
3. Escolha a operação (Adicionar/Remover)
4. Insira a quantidade
5. Clique em **"Atualizar Estoque"**

---

## 📁 Estrutura de Dados no Firebase

Todos os dados são organizados por empresa (CNPJ):

```
Firestore Database
├── companies
│   └── {CNPJ_NORMALIZADO}  (ex: 12345678000100)
│       ├── suppliers
│       │   ├── {supplierId}
│       │   ├── {supplierId}
│       │   └── ...
│       ├── purchaseOrders
│       │   ├── {orderId}
│       │   ├── {orderId}
│       │   └── ...
│       ├── products
│       │   ├── {productId}
│       │   ├── {productId}
│       │   └── ...
│       └── quotations
│           └── ...
```

---

## 🔧 Funções Firebase Disponíveis

### **Fornecedores**
```javascript
import { 
  createSupplier, 
  listSuppliers, 
  updateSupplier, 
  deleteSupplier 
} from "../../services/firebase";

// Criar fornecedor
await createSupplier(cnpj, {
  nome: "Alpha Química",
  cnpj: "23.456.789/0001-10",
  categoria: "Insumos",
  email: "contato@alpha.com"
});

// Listar todos
const suppliers = await listSuppliers(cnpj);

// Atualizar
await updateSupplier(cnpj, supplierId, { 
  telefone: "(11) 98765-4321" 
});

// Deletar
await deleteSupplier(cnpj, supplierId);
```

### **Pedidos de Compra**
```javascript
import { 
  createPurchaseOrder, 
  listPurchaseOrders, 
  updatePurchaseOrder, 
  deletePurchaseOrder 
} from "../../services/firebase";

// Criar pedido
await createPurchaseOrder(cnpj, {
  fornecedorId: "supplier-123",
  fornecedorNome: "Alpha Química",
  valor: 1230.75,
  status: "Processando",
  itens: 5
});

// Listar todos
const orders = await listPurchaseOrders(cnpj);

// Atualizar status
await updatePurchaseOrder(cnpj, orderId, { 
  status: "Recebido" 
});

// Deletar
await deletePurchaseOrder(cnpj, orderId);
```

### **Produtos**
```javascript
import { 
  createProduct, 
  listProducts, 
  updateProduct, 
  deleteProduct 
} from "../../services/firebase";

// Criar produto
await createProduct(cnpj, {
  nome: "Reagente A-201",
  categoria: "Químicos",
  preco: 45.50,
  estoque: 100
});

// Listar todos
const products = await listProducts(cnpj);

// Atualizar
await updateProduct(cnpj, productId, { 
  preco: 49.90 
});

// Deletar
await deleteProduct(cnpj, productId);
```

### **Estoque**
```javascript
import { 
  addToStock, 
  removeFromStock, 
  getStockLevel 
} from "../../services/firebase";

// Adicionar ao estoque
await addToStock(cnpj, productId, 50); // Adiciona 50 unidades

// Remover do estoque
await removeFromStock(cnpj, productId, 10); // Remove 10 unidades

// Ver nível de estoque
const nivel = await getStockLevel(cnpj, productId);
console.log(`Estoque: ${nivel} unidades`);
```

---

## 🚀 Como Usar a Interface

### **Criar um Novo Fornecedor**
1. Clique em **"➕ Novo Fornecedor"**
2. Preencha os campos obrigatórios (*):
   - Nome da Empresa
   - CNPJ
3. Preencha os campos opcionais (Contato, Email, Telefone, Categoria)
4. Clique em **"Criar Fornecedor"**
5. ✅ Fornecedor será adicionado ao banco de dados

### **Criar um Novo Pedido**
1. Clique em **"➕ Novo Pedido"**
2. Selecione um fornecedor da lista
3. Insira o valor em reais
4. Escolha o status inicial (padrão: Processando)
5. Indique quantidade de itens
6. (Opcional) Adicione uma descrição
7. Clique em **"Criar Pedido"**
8. ✅ Pedido será criado com número automático (PC-XXXXX)

### **Criar um Novo Produto**
1. Clique em **"➕ Novo Produto"**
2. Preencha os campos obrigatórios (*):
   - Nome do Produto
   - Categoria
3. (Opcional) Adicione preço unitário e estoque inicial
4. Clique em **"Criar Produto"**
5. ✅ Produto será adicionado e disponível para pedidos

### **Gerenciar Estoque**
1. Clique em **"📦 Gerenciar Estoque"**
2. Selecione um produto da lista
3. Escolha a operação:
   - **Adicionar ao Estoque** - Aumenta a quantidade
   - **Remover do Estoque** - Diminui a quantidade
4. Insira a quantidade
5. Clique em **"Atualizar Estoque"**
6. ✅ Estoque será atualizado em tempo real

### **Buscar Dados**
1. Use a **barra de pesquisa** no topo
2. Digite para filtrar por:
   - Nome (fornecedores/produtos)
   - CNPJ (fornecedores)
   - Número (pedidos)

### **Visualizar em Abas**
- **Pedidos** - Lista de todos os pedidos de compra
- **Fornecedores** - Lista de todos os fornecedores cadastrados
- **Produtos** - Lista de todos os produtos com níveis de estoque

---

## ⚙️ Configuração Técnica

### **Dependências**
```json
{
  "firebase": "^10.0.0 ou superior",
  "react": "^18.0.0 ou superior",
  "framer-motion": "^10.0.0 ou superior"
}
```

### **Variáveis de Ambiente**
O Firebase está configurado em `src/firebase/firebaseConfig.js`:
```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

### **Autenticação**
- CNPJ é recuperado do localStorage: `localStorage.getItem("userCnpj")`
- Todos os dados são isolados por CNPJ (multi-tenancy)
- As funções normalizam CNPJ removendo caracteres especiais

---

## 🛡️ Segurança

### **Regras de Firestore (Recomendadas)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /companies/{cnpj}/suppliers/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /companies/{cnpj}/purchaseOrders/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /companies/{cnpj}/products/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🐛 Troubleshooting

### **"CNPJ não encontrado"**
- ❓ Problema: Você não fez login
- ✅ Solução: Faça login com suas credenciais

### **"Erro ao carregar dados"**
- ❓ Problema: Conexão com Firebase falhou
- ✅ Solução: Verifique sua conexão de internet e credenciais do Firebase

### **"Erro ao criar fornecedor"**
- ❓ Problema: Campos obrigatórios não preenchidos
- ✅ Solução: Preencha Nome e CNPJ

### **Estoque não atualiza**
- ❓ Problema: Produto não selecionado
- ✅ Solução: Selecione um produto válido no modal de estoque

---

## 📝 Exemplo de Fluxo Completo

### Cenário: Importar novos produtos de um fornecedor

1. **Adicionar Fornecedor**
   - Clique em "➕ Novo Fornecedor"
   - Insira: "ChemiCorp" | CNPJ: "12.345.678/0001-90"
   - Categoria: "Químicos"

2. **Criar Produtos**
   - Clique em "➕ Novo Produto"
   - Crie: "Ácido Clorídrico 37%" | Categoria: "Químicos" | Preço: R$ 85.00 | Estoque: 50

3. **Criar Pedido**
   - Clique em "➕ Novo Pedido"
   - Selecione: ChemiCorp
   - Valor: R$ 4.250.00
   - Itens: 50 unidades

4. **Gerenciar Estoque**
   - Clique em "📦 Gerenciar Estoque"
   - Selecione: Ácido Clorídrico 37%
   - Operação: Adicionar
   - Quantidade: 50

5. **Visualizar**
   - Verifique na aba "Pedidos" o novo pedido
   - Verifique na aba "Fornecedores" o novo fornecedor
   - Verifique na aba "Produtos" o novo produto com 100 un. em estoque

---

## 🎯 Próximas Funcionalidades (Planejado)

- [ ] Importação de NF-e (XML)
- [ ] Relatórios de compras
- [ ] Cotações de fornecedores
- [ ] Histórico de transações de estoque
- [ ] Alertas de estoque baixo
- [ ] Análise de gasto por fornecedor
- [ ] Integração com contabilidade

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique as credenciais do Firebase
2. Confirme que está logado (CNPJ armazenado)
3. Verifique a conexão de internet
4. Limpe o cache do navegador

---

**Versão**: 1.0.0  
**Data**: 15/04/2025  
**Status**: ✅ Produção
