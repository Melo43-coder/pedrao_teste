// EXEMPLOS DE USO - Módulo Compras com Firebase

import {
  createSupplier,
  listSuppliers,
  createPurchaseOrder,
  listPurchaseOrders,
  createProduct,
  listProducts,
  addToStock,
  removeFromStock,
  getStockLevel
} from "../../services/firebase";

/**
 * EXEMPLO 1: Criar um novo fornecedor
 */
async function exemplo1_CriarFornecedor() {
  const cnpj = localStorage.getItem("userCnpj");
  
  try {
    const novoFornecedor = {
      nome: "ChemiCorp Brasil",
      cnpj: "12.345.678/0001-90",
      categoria: "Químicos e Reagentes",
      contato: "João Silva",
      email: "joao@chemicorp.com.br",
      telefone: "(11) 3456-7890"
    };

    const resultado = await createSupplier(cnpj, novoFornecedor);
    console.log("✅ Fornecedor criado:", resultado);
    // Resultado:
    // {
    //   id: "auto-gerado-12345",
    //   nome: "ChemiCorp Brasil",
    //   cnpj: "12.345.678/0001-90",
    //   ...
    //   createdAt: "2025-04-15T10:30:00Z"
    // }
  } catch (error) {
    console.error("❌ Erro ao criar fornecedor:", error.message);
  }
}

/**
 * EXEMPLO 2: Listar todos os fornecedores
 */
async function exemplo2_ListarFornecedores() {
  const cnpj = localStorage.getItem("userCnpj");
  
  try {
    const fornecedores = await listSuppliers(cnpj);
    console.log("📋 Total de fornecedores:", fornecedores.length);
    
    fornecedores.forEach((f) => {
      console.log(`- ${f.nome} (${f.cnpj}) - ${f.categoria}`);
    });

    // Saída esperada:
    // 📋 Total de fornecedores: 3
    // - ChemiCorp Brasil (12.345.678/0001-90) - Químicos e Reagentes
    // - EletroSupreme (99.123.456/0002-90) - Eletrônicos
    // - Global Office (45.678.901/0003-45) - Material de Escritório
  } catch (error) {
    console.error("❌ Erro ao listar fornecedores:", error.message);
  }
}

/**
 * EXEMPLO 3: Criar um novo produto
 */
async function exemplo3_CriarProduto() {
  const cnpj = localStorage.getItem("userCnpj");
  
  try {
    const novoProduto = {
      nome: "Ácido Clorídrico 37% PA",
      categoria: "Químicos",
      preco: 85.50,
      estoque: 100
    };

    const resultado = await createProduct(cnpj, novoProduto);
    console.log("✅ Produto criado:", resultado);
    // Resultado:
    // {
    //   id: "auto-gerado-67890",
    //   nome: "Ácido Clorídrico 37% PA",
    //   categoria: "Químicos",
    //   preco: 85.50,
    //   estoque: 100,
    //   createdAt: "2025-04-15T10:35:00Z"
    // }
  } catch (error) {
    console.error("❌ Erro ao criar produto:", error.message);
  }
}

/**
 * EXEMPLO 4: Listar todos os produtos com estoque
 */
async function exemplo4_ListarProdutos() {
  const cnpj = localStorage.getItem("userCnpj");
  
  try {
    const produtos = await listProducts(cnpj);
    console.log("📦 Inventário:");
    
    produtos.forEach((p) => {
      const status = p.estoque > 10 ? "✅" : p.estoque > 0 ? "⚠️" : "❌";
      console.log(`${status} ${p.nome} - ${p.estoque} un - R$ ${p.preco.toFixed(2)}`);
    });

    // Saída esperada:
    // 📦 Inventário:
    // ✅ Ácido Clorídrico 37% PA - 100 un - R$ 85.50
    // ⚠️ Cabo HDMI 2.1 - 5 un - R$ 45.00
    // ❌ Papel A4 (Resma) - 0 un - R$ 35.00
  } catch (error) {
    console.error("❌ Erro ao listar produtos:", error.message);
  }
}

/**
 * EXEMPLO 5: Criar um novo pedido de compra
 */
async function exemplo5_CriarPedido() {
  const cnpj = localStorage.getItem("userCnpj");
  
  try {
    const novoPedido = {
      fornecedorId: "supplier-12345",
      fornecedorNome: "ChemiCorp Brasil",
      valor: 4250.00,
      status: "Processando",
      itens: 50,
      descricao: "50 L de Ácido Clorídrico 37% PA"
    };

    const resultado = await createPurchaseOrder(cnpj, novoPedido);
    console.log("✅ Pedido criado:", resultado);
    // Resultado:
    // {
    //   id: "auto-gerado-11111",
    //   numero: "PC-35847", // Número automático
    //   fornecedorId: "supplier-12345",
    //   fornecedorNome: "ChemiCorp Brasil",
    //   valor: 4250.00,
    //   status: "Processando",
    //   itens: 50,
    //   data: "2025-04-15",
    //   descricao: "50 L de Ácido Clorídrico 37% PA",
    //   createdAt: "2025-04-15T10:40:00Z"
    // }
  } catch (error) {
    console.error("❌ Erro ao criar pedido:", error.message);
  }
}

/**
 * EXEMPLO 6: Listar todos os pedidos
 */
async function exemplo6_ListarPedidos() {
  const cnpj = localStorage.getItem("userCnpj");
  
  try {
    const pedidos = await listPurchaseOrders(cnpj);
    console.log("🛒 Pedidos de Compra:");
    
    pedidos.forEach((p) => {
      console.log(`${p.numero} - ${p.fornecedorNome} - R$ ${p.valor.toFixed(2)} - ${p.status}`);
    });

    // Saída esperada:
    // 🛒 Pedidos de Compra:
    // PC-35847 - ChemiCorp Brasil - R$ 4250.00 - Processando
    // PC-35846 - EletroSupreme - R$ 1500.00 - Faturado
    // PC-35845 - Global Office - R$ 850.00 - Recebido
  } catch (error) {
    console.error("❌ Erro ao listar pedidos:", error.message);
  }
}

/**
 * EXEMPLO 7: Adicionar produto ao estoque
 */
async function exemplo7_AdicionarEstoque() {
  const cnpj = localStorage.getItem("userCnpj");
  const productId = "product-67890";
  
  try {
    const resultado = await addToStock(cnpj, productId, 50);
    console.log("✅ Estoque atualizado:", resultado);
    // Resultado:
    // {
    //   id: "product-67890",
    //   estoque: 150 // (100 + 50)
    // }
  } catch (error) {
    console.error("❌ Erro ao adicionar estoque:", error.message);
  }
}

/**
 * EXEMPLO 8: Remover produto do estoque
 */
async function exemplo8_RemoverEstoque() {
  const cnpj = localStorage.getItem("userCnpj");
  const productId = "product-67890";
  
  try {
    const resultado = await removeFromStock(cnpj, productId, 25);
    console.log("✅ Estoque atualizado:", resultado);
    // Resultado:
    // {
    //   id: "product-67890",
    //   estoque: 125 // (150 - 25)
    // }
  } catch (error) {
    console.error("❌ Erro ao remover estoque:", error.message);
  }
}

/**
 * EXEMPLO 9: Consultar nível de estoque
 */
async function exemplo9_ConsultarEstoque() {
  const cnpj = localStorage.getItem("userCnpj");
  const productId = "product-67890";
  
  try {
    const nivel = await getStockLevel(cnpj, productId);
    console.log(`📦 Nível de estoque do produto: ${nivel} unidades`);
    
    if (nivel > 10) {
      console.log("✅ Estoque OK");
    } else if (nivel > 0) {
      console.log("⚠️ Estoque baixo! Fazer novo pedido.");
    } else {
      console.log("❌ Sem estoque!");
    }
  } catch (error) {
    console.error("❌ Erro ao consultar estoque:", error.message);
  }
}

/**
 * EXEMPLO 10: Fluxo Completo - Importar Lote de Produtos
 */
async function exemplo10_FluxoCompleto() {
  const cnpj = localStorage.getItem("userCnpj");
  
  try {
    console.log("🚀 Iniciando fluxo completo...\n");

    // PASSO 1: Criar fornecedor
    console.log("1️⃣ Criando fornecedor...");
    const fornecedor = await createSupplier(cnpj, {
      nome: "Química Industrial LTDA",
      cnpj: "98.765.432/0001-50",
      categoria: "Químicos Industriais",
      email: "vendas@quimica-ind.com.br",
      contato: "Maria Silva"
    });
    console.log(`✅ Fornecedor criado: ${fornecedor.nome}\n`);

    // PASSO 2: Criar produtos
    console.log("2️⃣ Criando produtos...");
    const produtos = [
      { nome: "Sulfato de Potássio", categoria: "Sais", preco: 45.00, estoque: 200 },
      { nome: "Nitrato de Amônia", categoria: "Nitratos", preco: 55.00, estoque: 150 },
      { nome: "Hidróxido de Sódio", categoria: "Bases", preco: 65.00, estoque: 100 }
    ];

    const produtosIds = [];
    for (const prod of produtos) {
      const resultado = await createProduct(cnpj, prod);
      produtosIds.push(resultado.id);
      console.log(`✅ Produto criado: ${resultado.nome}`);
    }
    console.log();

    // PASSO 3: Criar pedido para o novo fornecedor
    console.log("3️⃣ Criando pedido de compra...");
    const pedido = await createPurchaseOrder(cnpj, {
      fornecedorId: fornecedor.id,
      fornecedorNome: fornecedor.nome,
      valor: 20500.00,
      status: "Processando",
      itens: 450,
      descricao: "Importação de 450 unidades de produtos químicos"
    });
    console.log(`✅ Pedido criado: ${pedido.numero} - R$ ${pedido.valor.toFixed(2)}\n`);

    // PASSO 4: Adicionar estoque
    console.log("4️⃣ Atualizando estoque...");
    for (let i = 0; i < produtosIds.length; i++) {
      const resultado = await addToStock(cnpj, produtosIds[i], 50);
      console.log(`✅ Estoque atualizado: ${resultado.estoque} unidades`);
    }
    console.log();

    // PASSO 5: Listar tudo para confirmar
    console.log("5️⃣ Confirmando dados no banco...");
    const todosOsProdutos = await listProducts(cnpj);
    console.log(`📦 Total de produtos: ${todosOsProdutos.length}`);
    
    const todosPedidos = await listPurchaseOrders(cnpj);
    console.log(`📋 Total de pedidos: ${todosPedidos.length}`);
    
    console.log("\n✅ Fluxo completo executado com sucesso!");

  } catch (error) {
    console.error("❌ Erro no fluxo:", error.message);
  }
}

// EXPORTAR EXEMPLOS PARA USO
export {
  exemplo1_CriarFornecedor,
  exemplo2_ListarFornecedores,
  exemplo3_CriarProduto,
  exemplo4_ListarProdutos,
  exemplo5_CriarPedido,
  exemplo6_ListarPedidos,
  exemplo7_AdicionarEstoque,
  exemplo8_RemoverEstoque,
  exemplo9_ConsultarEstoque,
  exemplo10_FluxoCompleto
};

/**
 * COMO EXECUTAR OS EXEMPLOS
 * 
 * 1. No console do navegador (F12 > Console):
 *    > import * as exemplos from './EXEMPLOS_COMPRAS_FIREBASE.js'
 *    > await exemplos.exemplo1_CriarFornecedor()
 *    > await exemplos.exemplo10_FluxoCompleto()
 * 
 * 2. Ou em um componente React:
 *    > import { exemplo10_FluxoCompleto } from './EXEMPLOS_COMPRAS_FIREBASE.js'
 *    > async function teste() { await exemplo10_FluxoCompleto(); }
 *    > teste();
 * 
 * DICAS:
 * - Todos os exemplos precisam de um CNPJ armazenado no localStorage
 * - Use await ao chamar as funções async
 * - Verifique o console para ver os resultados
 * - Cada exemplo é independente e pode ser executado separadamente
 */
