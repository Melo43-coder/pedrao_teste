import * as firebase from './firebase';

export async function processarMensagemIAInteligente(mensagem, cnpj, regrasAutomacao = []) {
  // Validação de segurança - sem CNPJ, sem acesso aos dados
  if (!mensagem.trim() || !cnpj) {
    return '⚠️ Erro: CNPJ não fornecido. Não é possível acessar dados sem identificação da empresa.';
  }

  try {
    console.log(`🔐 IA Frontend - Processando para CNPJ: ${cnpj}`);

    // ✅ SEGURANÇA: Buscar APENAS dados do CNPJ configurado do Firebase
    const [
      ordensServico,
      avaliacoes,
      regrasAutomacaoFirebase,
      fluxoTrabalho,
      insights,
      previsoes,
      dashboardAutomacao
    ] = await Promise.all([
      firebase.listServiceOrders(cnpj),
      firebase.getSatisfactionRatings(cnpj),
      firebase.listarRegrasAutomacao(cnpj),
      firebase.listarFluxoTrabalho(cnpj),
      firebase.listarInsights(cnpj, 3),
      firebase.listarPrevisoes(cnpj, 3),
      firebase.obterDashboardAutomacao(cnpj)
    ]);

    // Análise inteligente baseada em dados reais
    const ordensCompletas = ordensServico.filter(o => o.status === 'Concluída').length;
    const ordensPendentes = ordensServico.filter(o => o.status === 'Pendente').length;
    const ordensAndamento = ordensServico.filter(o => o.status === 'Em andamento').length;
    const ordensAtraso = ordensServico.filter(o => {
      const dataLimite = new Date(o.dataAgendamento);
      return new Date() > dataLimite && o.status !== 'Concluída';
    }).length;
    
    const taxaConclusao = ordensServico.length > 0 
      ? ((ordensCompletas / ordensServico.length) * 100).toFixed(1) 
      : 0;
    
    const mediaAvaliacao = avaliacoes.length > 0 
      ? (avaliacoes.reduce((a, b) => a + b.nota, 0) / avaliacoes.length).toFixed(1)
      : 'Sem avaliações';

    console.log(`📤 Enviando para IA Backend...`);

    // ✅ Chamar endpoint backend seguro que processa com Gemini
    const backendResponse = await fetch('http://localhost:3001/api/ia/process-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mensagem: mensagem,
        cnpj: cnpj,
        context: {
          ordensServico: ordensServico.length,
          ordensCompletas: ordensCompletas,
          ordensPendentes: ordensPendentes,
          ordensAndamento: ordensAndamento,
          ordensAtraso: ordensAtraso,
          taxaConclusao: taxaConclusao,
          mediaAvaliacao: mediaAvaliacao,
          regrasAutomacao: regrasAutomacaoFirebase.length,
          fluxoTrabalho: fluxoTrabalho.length,
          insights: insights.length,
          previsoes: previsoes.length
        }
      })
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(errorData.error || 'Erro ao chamar IA Backend');
    }

    const data = await backendResponse.json();
    const resposta = data.response;

    console.log(`✅ Resposta gerada com sucesso para CNPJ: ${cnpj}`);
    
    // Opcional: Salvar insights gerados pela IA
    if (resposta.includes('insight') || resposta.includes('recomendação')) {
      try {
        await firebase.criarInsight(cnpj, {
          titulo: 'Insight da Conversa',
          descricao: resposta.substring(0, 200),
          conteudo: resposta,
          tipo: 'conversacional'
        });
      } catch (err) {
        console.warn('⚠️ Não foi possível salvar insight:', err);
      }
    }

    return resposta;

  } catch (error) {
    console.error(`❌ Erro ao processar IA para CNPJ ${cnpj}:`, error);
    return `⚠️ Não consegui processar sua solicitação no momento. Erro: ${error.message}. Certifique-se de que o servidor backend está rodando em http://localhost:3001`;
  }
}
