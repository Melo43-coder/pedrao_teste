/**
 * EXEMPLOS DE USO - Módulo de Compras com Firebase
 * 
 * Este arquivo demonstra como usar as funções de Compras em Componentes React
 */

import React, { useState, useEffect } from 'react';
import {
  createSupplier,
  listSuppliers,
  updateSupplier,
  deleteSupplier,
  createPurchaseOrder,
  listPurchaseOrders,
  createQuotation,
  listQuotations,
  createInvoice,
  listInvoices
} from './services/firebase';

// ============================================================================
// EXEMPLO 1: Gerenciar Fornecedores
// ============================================================================

function FornecedoresExample() {
  const [fornecedores, setFornecedores] = useState([]);
  const cnpj = localStorage.getItem('userCnpj');

  // Carregar fornecedores ao montar
  useEffect(() => {
    const carregarFornecedores = async () => {
      try {
        const data = await listSuppliers(cnpj);
        setFornecedores(data);
      } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
      }
    };

    if (cnpj) carregarFornecedores();
  }, [cnpj]);

  // Criar novo fornecedor
  const handleCriarFornecedor = async (novoFornecedor) => {
    try {
      const resultado = await createSupplier(cnpj, {
        nome: novoFornecedor.nome,
        cnpj: novoFornecedor.cnpj,
        categoria: novoFornecedor.categoria,
        contato: novoFornecedor.contato,
        email: novoFornecedor.email,
        telefone: novoFornecedor.telefone
      });

      // Atualizar lista local
      setFornecedores([...fornecedores, resultado]);
      alert('Fornecedor criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      alert('Erro ao criar fornecedor');
    }
  };

  // Atualizar fornecedor existente
  const handleAtualizarFornecedor = async (fornecedorId, dadosAtualizados) => {
    try {
      await updateSupplier(cnpj, fornecedorId, dadosAtualizados);

      // Atualizar lista local
      const novaLista = fornecedores.map(f =>
        f.id === fornecedorId ? { ...f, ...dadosAtualizados } : f
      );
      setFornecedores(novaLista);
      alert('Fornecedor atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
    }
  };

  // Deletar fornecedor
  const handleDeletarFornecedor = async (fornecedorId) => {
    if (!confirm('Tem certeza que deseja deletar este fornecedor?')) return;

    try {
      await deleteSupplier(cnpj, fornecedorId);

      // Atualizar lista local
      const novaLista = fornecedores.filter(f => f.id !== fornecedorId);
      setFornecedores(novaLista);
      alert('Fornecedor deletado!');
    } catch (error) {
      console.error('Erro ao deletar fornecedor:', error);
    }
  };

  return (
    <div>
      <h2>Fornecedores ({fornecedores.length})</h2>
      <ul>
        {fornecedores.map(f => (
          <li key={f.id}>
            {f.nome} ({f.categoria})
            <button onClick={() => handleDeletarFornecedor(f.id)}>Deletar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// EXEMPLO 2: Gerenciar Pedidos de Compra
// ============================================================================

function PedidosExample() {
  const [pedidos, setPedidos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const cnpj = localStorage.getItem('userCnpj');

  useEffect(() => {
    const carregar = async () => {
      try {
        const [pedidosData, fornecedoresData] = await Promise.all([
          listPurchaseOrders(cnpj),
          listSuppliers(cnpj)
        ]);
        setPedidos(pedidosData);
        setFornecedores(fornecedoresData);
      } catch (error) {
        console.error('Erro ao carregar:', error);
      }
    };

    if (cnpj) carregar();
  }, [cnpj]);

  // Criar novo pedido
  const handleNovoPedido = async (dados) => {
    try {
      const novoPedido = await createPurchaseOrder(cnpj, {
        fornecedorId: dados.fornecedorId,
        fornecedor: dados.fornecedor,
        valor: dados.valor,
        status: 'Processando',
        itens: dados.itens
      });

      setPedidos([...pedidos, novoPedido]);
      alert('Pedido criado: ' + novoPedido.numero);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
    }
  };

  return (
    <div>
      <h2>Pedidos ({pedidos.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Fornecedor</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(p => (
            <tr key={p.id}>
              <td>{p.numero}</td>
              <td>{p.fornecedor}</td>
              <td>R$ {p.valor.toFixed(2)}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// EXEMPLO 3: Solicitar Cotações
// ============================================================================

function CotacoesExample() {
  const [cotacoes, setCotacoes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const cnpj = localStorage.getItem('userCnpj');

  useEffect(() => {
    const carregar = async () => {
      try {
        const [cotacoesData, fornecedoresData] = await Promise.all([
          listQuotations(cnpj),
          listSuppliers(cnpj)
        ]);
        setCotacoes(cotacoesData);
        setFornecedores(fornecedoresData);
      } catch (error) {
        console.error('Erro ao carregar:', error);
      }
    };

    if (cnpj) carregar();
  }, [cnpj]);

  // Solicitar nova cotação
  const handleSolicitarCotacao = async (dados) => {
    try {
      const fornecedor = fornecedores.find(f => f.id === dados.fornecedorId);

      const novaCotacao = await createQuotation(cnpj, {
        produto: dados.produto,
        fornecedorId: dados.fornecedorId,
        fornecedor: fornecedor.nome,
        quantidade: dados.quantidade,
        observacoes: dados.observacoes,
        status: 'Aberta',
        dataAbertura: new Date().toISOString()
      });

      setCotacoes([...cotacoes, novaCotacao]);
      alert('Cotação solicitada: ' + novaCotacao.numero);
    } catch (error) {
      console.error('Erro ao solicitar cotação:', error);
    }
  };

  // Filtrar cotações abertas
  const cotacoesAbertas = cotacoes.filter(c => c.status === 'Aberta');

  return (
    <div>
      <h2>Cotações</h2>
      <h3>Abertas ({cotacoesAbertas.length})</h3>
      <ul>
        {cotacoesAbertas.map(c => (
          <li key={c.id}>
            {c.numero}: {c.produto} - {c.quantidade} un. (Fornecedor: {c.fornecedor})
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// EXEMPLO 4: Importar NF-e
// ============================================================================

function ImportarNFeExample() {
  const [nfes, setNfes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const cnpj = localStorage.getItem('userCnpj');

  useEffect(() => {
    const carregar = async () => {
      try {
        const [nfesData, fornecedoresData] = await Promise.all([
          listInvoices(cnpj),
          listSuppliers(cnpj)
        ]);
        setNfes(nfesData);
        setFornecedores(fornecedoresData);
      } catch (error) {
        console.error('Erro ao carregar:', error);
      }
    };

    if (cnpj) carregar();
  }, [cnpj]);

  // Processar arquivo XML
  const handleProcessarXML = async (xmlFile) => {
    try {
      const xmlText = await xmlFile.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      // Extrair dados do XML
      const chaveAcesso = xmlDoc.querySelector("ide > dEmi")?.textContent || "Sem chave";
      const numero = xmlDoc.querySelector("ide > nNF")?.textContent || "";
      const valor = xmlDoc.querySelector("total > ICMSTot > vNF")?.textContent || "0";
      const fornecedorNome = xmlDoc.querySelector("emit > xNome")?.textContent || "Desconhecido";
      const fornecedorCnpjXML = xmlDoc.querySelector("emit > CNPJ")?.textContent || "";

      // Encontrar ou criar fornecedor
      let fornecedorId = fornecedores.find(
        f => f.cnpj?.replace(/\D/g, '') === fornecedorCnpjXML?.replace(/\D/g, '')
      )?.id;

      if (!fornecedorId) {
        const novoSupplier = await createSupplier(cnpj, {
          nome: fornecedorNome,
          cnpj: fornecedorCnpjXML,
          categoria: "Importado via NF-e",
          contato: "",
          email: "",
          telefone: ""
        });
        fornecedorId = novoSupplier.id;
      }

      // Criar registro de NF-e
      const novaInvoice = await createInvoice(cnpj, {
        chaveAcesso,
        numero,
        valor: parseFloat(valor),
        fornecedorId,
        fornecedor: fornecedorNome,
        status: 'Importada',
        xmlContent: xmlText
      });

      setNfes([...nfes, novaInvoice]);
      alert('NF-e importada com sucesso: ' + numero);
    } catch (error) {
      console.error('Erro ao processar NF-e:', error);
      alert('Erro ao processar NF-e: ' + error.message);
    }
  };

  return (
    <div>
      <h2>NF-es Importadas ({nfes.length})</h2>
      <input
        type="file"
        accept=".xml"
        onChange={(e) => {
          if (e.target.files[0]) {
            handleProcessarXML(e.target.files[0]);
          }
        }}
      />
      <table>
        <thead>
          <tr>
            <th>Chave</th>
            <th>Número</th>
            <th>Valor</th>
            <th>Fornecedor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {nfes.map(n => (
            <tr key={n.id}>
              <td>{n.chaveAcesso?.substring(0, 10)}...</td>
              <td>{n.numero}</td>
              <td>R$ {n.valor?.toFixed(2)}</td>
              <td>{n.fornecedor}</td>
              <td>{n.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// EXEMPLO COMPLETO: Dashboard de Compras
// ============================================================================

export function ComprasesDashboard() {
  const [stats, setStats] = useState({
    pedidos: 0,
    cotacoes: 0,
    nfes: 0,
    fornecedores: 0
  });

  const cnpj = localStorage.getItem('userCnpj');

  useEffect(() => {
    const carregarStats = async () => {
      try {
        const [
          pedidosData,
          cotacoesData,
          nfesData,
          fornecedoresData
        ] = await Promise.all([
          listPurchaseOrders(cnpj),
          listQuotations(cnpj),
          listInvoices(cnpj),
          listSuppliers(cnpj)
        ]);

        setStats({
          pedidos: pedidosData.length,
          cotacoes: cotacoesData.length,
          nfes: nfesData.length,
          fornecedores: fornecedoresData.length
        });
      } catch (error) {
        console.error('Erro ao carregar stats:', error);
      }
    };

    if (cnpj) carregarStats();
  }, [cnpj]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
      <div style={{ padding: '20px', backgroundColor: '#e6f7ef', borderRadius: '8px' }}>
        <h3>Pedidos</h3>
        <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{stats.pedidos}</p>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#fff8e6', borderRadius: '8px' }}>
        <h3>Cotações</h3>
        <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{stats.cotacoes}</p>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#e6f4ff', borderRadius: '8px' }}>
        <h3>NF-es</h3>
        <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{stats.nfes}</p>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h3>Fornecedores</h3>
        <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{stats.fornecedores}</p>
      </div>
    </div>
  );
}

export default {
  FornecedoresExample,
  PedidosExample,
  CotacoesExample,
  ImportarNFeExample,
  ComprasesDashboard
};
