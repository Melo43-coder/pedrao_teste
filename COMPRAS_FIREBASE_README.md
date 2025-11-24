# Módulo de Compras - Integração Firebase

## 📋 Visão Geral

O módulo de Compras foi completamente refatorado para usar Firebase Firestore como banco de dados, substituindo os dados mocka anteriores. Agora oferece:

✅ **Fornecedores** - CRUD completo com Firebase  
✅ **Pedidos de Compra** - Rastreamento completo de pedidos  
✅ **Cotações** - Solicitação e gerenciamento de cotações de fornecedores  
✅ **NF-e Import** - Importação de Notas Fiscais com parsing de XML  

---

## 🏗️ Estrutura do Banco de Dados

```
companies/{cnpj}/
├── suppliers/                    # Fornecedores
│   ├── {supplierId}
│   │   ├── nome: string
│   │   ├── cnpj: string
│   │   ├── categoria: string
│   │   ├── contato: string (opcional)
│   │   ├── email: string (opcional)
│   │   ├── telefone: string (opcional)
│   │   ├── status: string
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│
├── purchaseOrders/               # Pedidos de Compra
│   ├── {orderId}
│   │   ├── numero: string (auto-gerado PC-XXXXX)
│   │   ├── fornecedorId: string
│   │   ├── fornecedor: string
│   │   ├── valor: number
│   │   ├── status: string
│   │   ├── itens: number
│   │   ├── data: timestamp
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│
├── quotations/                   # Cotações
│   ├── {quotationId}
│   │   ├── numero: string (auto-gerado COT-XXXXX)
│   │   ├── produto: string
│   │   ├── fornecedorId: string
│   │   ├── fornecedor: string
│   │   ├── quantidade: number
│   │   ├── observacoes: string
│   │   ├── status: string (Aberta, Respondida, Fechada)
│   │   ├── dataAbertura: timestamp
│   │   ├── dataFechamento: timestamp (opcional)
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│
└── invoices/                     # Notas Fiscais
    ├── {invoiceId}
    │   ├── chaveAcesso: string
    │   ├── numero: string (opcional)
    │   ├── valor: number (opcional)
    │   ├── fornecedorId: string (opcional)
    │   ├── fornecedor: string (opcional)
    │   ├── dataEmissao: timestamp
    │   ├── status: string (Processando, Importada)
    │   ├── xmlContent: string (conteúdo XML completo, opcional)
    │   ├── createdAt: timestamp
    │   └── updatedAt: timestamp
```

---

## 🔧 Funções Firebase Disponíveis

### Fornecedores (Suppliers)

```javascript
import {
  createSupplier,      // Criar novo fornecedor
  listSuppliers,       // Listar todos os fornecedores
  updateSupplier,      // Atualizar dados do fornecedor
  deleteSupplier       // Deletar fornecedor
} from '../../services/firebase';

// Exemplo: Criar fornecedor
const supplier = await createSupplier(cnpj, {
  nome: "Empresa XYZ",
  cnpj: "12.345.678/0001-90",
  categoria: "Insumos",
  contato: "João Silva",
  email: "joao@empresa.com",
  telefone: "(11) 3000-0000"
});
```

### Pedidos de Compra (Purchase Orders)

```javascript
import {
  createPurchaseOrder,   // Criar novo pedido
  listPurchaseOrders,    // Listar todos os pedidos
  updatePurchaseOrder,   // Atualizar status/dados
  deletePurchaseOrder    // Deletar pedido
} from '../../services/firebase';

// Exemplo: Criar pedido
const order = await createPurchaseOrder(cnpj, {
  fornecedorId: "supplier123",
  fornecedor: "Empresa XYZ",
  valor: 1500.50,
  status: "Processando",
  itens: 5
});
```

### Cotações (Quotations)

```javascript
import {
  createQuotation,    // Criar nova cotação
  listQuotations,     // Listar cotações
  updateQuotation     // Atualizar cotação
} from '../../services/firebase';

// Exemplo: Solicitar cotação
const quotation = await createQuotation(cnpj, {
  produto: "Reagente A-201",
  fornecedorId: "supplier123",
  fornecedor: "Empresa XYZ",
  quantidade: 10,
  observacoes: "Entrega em 5 dias",
  status: "Aberta"
});
```

### NF-e (Invoices)

```javascript
import {
  createInvoice,     // Criar registro de NF-e
  listInvoices,      // Listar NF-es
  updateInvoice      // Atualizar NF-e
} from '../../services/firebase';

// Exemplo: Importar NF-e
const nfe = await createInvoice(cnpj, {
  chaveAcesso: "35210812345678000165550010000000011234567890",
  numero: "000001",
  valor: 2500.00,
  fornecedorId: "supplier123",
  fornecedor: "Empresa XYZ",
  status: "Importada",
  xmlContent: "<?xml version='1.0'?>..." // Conteúdo XML completo
});
```

---

## 🎨 Interface do Usuário

### Abas Principais

1. **Pedidos** - Listagem e gerenciamento de pedidos de compra
2. **Fornecedores** - Cadastro e manutenção de fornecedores

### Painéis Laterais (Sidebar)

1. **Nova Cotação** - Formulário para solicitar cotações
   - Produto/Serviço (texto livre)
   - Fornecedor (dropdown)
   - Quantidade
   - Observações

2. **Importar NF-e** - Importação de Notas Fiscais
   - Chave de Acesso (manual)
   - Arquivo XML (upload)
   - Auto-parsing de XML
   - Auto-criação de fornecedor se necessário

### Cards de Métricas

- **Pedidos Ativos** - Total de pedidos + tendência mensal
- **Cotações Abertas** - Cotações aguardando resposta
- **NF-e Pendentes** - Notas Fiscais em processamento
- **Fornecedores** - Total de fornecedores cadastrados

---

## 🚀 Recursos Implementados

### ✅ Fornecedores
- [x] Cadastro de novos fornecedores
- [x] Edição de informações
- [x] Remoção de fornecedores
- [x] Filtro por nome ou CNPJ
- [x] Persistência em Firestore

### ✅ Cotações
- [x] Solicitação de cotações
- [x] Seleção de fornecedor
- [x] Rastreamento de status
- [x] Auto-incremento de contador

### ✅ NF-e Import
- [x] Upload de arquivo XML
- [x] Entrada manual de chave de acesso
- [x] Parsing básico de XML:
  - Extração de número de nota
  - Extração de valor total
  - Identificação de fornecedor
  - Criação automática de fornecedor se novo
- [x] Armazenamento completo do conteúdo XML
- [x] Status de processamento

### ✅ Pedidos
- [x] Listagem de pedidos
- [x] Filtro por número ou fornecedor
- [x] Visualização de detalhes
- [x] Integração com dados de Firebase

### ✅ Dashboard
- [x] Cartões de estatísticas reais
- [x] Contadores dinâmicos baseados em Firebase
- [x] Atualização automática após ações

---

## 📝 Fluxos de Uso

### Fluxo 1: Cadastrar Fornecedor

```
1. Clique em "Novo Fornecedor" na aba Fornecedores
2. Preencha: Nome, CNPJ, Categoria (obrigatório)
3. Opcionalmente: Contato, Email, Telefone
4. Clique em "Cadastrar Fornecedor"
5. Fornecedor é criado e listado imediatamente
```

### Fluxo 2: Solicitar Cotação

```
1. No painel "Nova Cotação", preencha:
   - Produto/Serviço (ex: Reagente A-201)
   - Selecione um fornecedor
   - Quantidade
   - Observações (opcional)
2. Clique em "Solicitar Cotação"
3. Cotação é salva em Firebase com status "Aberta"
4. Contador de cotações é atualizado
```

### Fluxo 3: Importar NF-e

```
Opção A - Via Arquivo XML:
1. No painel "Importar NF-e", clique em "Selecionar arquivo XML"
2. Selecione arquivo .xml da NF-e
3. Clique em "Processar NF-e"
4. Sistema extrai dados do XML:
   - Se fornecedor existe: vincula à cotação
   - Se fornecedor novo: cria automaticamente
5. NF-e é salva em Firestore

Opção B - Via Chave de Acesso:
1. Insira a chave de acesso (44 dígitos)
2. Clique em "Processar NF-e"
3. NF-e é registrada como "Pendente"
```

---

## 🔒 Segurança e Dados

### Autenticação
- Requer CNPJ para acessar dados específicos da empresa
- Isolamento de dados por CNPJ em Firestore
- LocalStorage: armazena `userCnpj` para contexto

### Validação
- Campos obrigatórios validados antes de envio
- Chave de acesso limitada a 44 dígitos
- CNPJ validado no formato esperado

### Armazenamento
- Conteúdo XML completo armazenado para auditoria
- Timestamps automáticos (createdAt, updatedAt)
- Soft-delete possível via status

---

## 🐛 Troubleshooting

### NF-e não está sendo importada
- Verifique se o arquivo XML é válido
- Confira se o fornecedor existe ou será criado automaticamente
- Verifique se há permissões no Firestore para a coleção `invoices`

### Fornecedor não aparece no dropdown
- Certifique-se de que o fornecedor foi criado com sucesso
- Recarregue a página se necessário (F5)
- Verifique se o CNPJ está correto

### Erros de Firestore
- Confirme que os dados estão no CNPJ correto
- Verifique as regras de acesso Firestore
- Consulte o console do navegador para mensagens de erro

---

## 📚 Próximas Melhorias

- [ ] Webhook para recebimento automático de NF-es
- [ ] Integração com SEFAZ para validação de NF-e
- [ ] Histórico de cotações com comparação de preços
- [ ] Alertas de pedidos atrasados
- [ ] Relatórios financeiros e análise de gasto
- [ ] Integração com sistema de pagamentos
- [ ] Negociação de termos com fornecedores (na plataforma)

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação do Firebase: https://firebase.google.com/docs
- Console Firebase: https://console.firebase.google.com
- Documentação do projeto: README.md principal

