import * as firebase from './firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyCAShzEkAO5CMy5FF8NIczNEN4TtrKjsrw';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * Processa mensagens com IA inteligente usando Google Gemini
 * Acessa dados reais do Firebase e segue regras de automação
 */
export async function processarMensagemIAInteligente(mensagem, cnpj, regrasAutomacao = []) {
  if (!mensagem.trim() || !cnpj) return 'Erro: dados inválidos';

  try {
    // Buscar dados reais do Firebase
    const ordensServico = await firebase.listServiceOrders(cnpj);
    const avaliacoes = await firebase.getSatisfactionRatings(cnpj);
    const regrasAtivas = regrasAutomacao.filter(r => r.status === 'Ativo');

    // Análise inteligente baseada em dados reais
    const ordensCompletas = ordensServico.filter(o => o.status === 'Concluída').length;
    const ordensPendentes = ordensServico.filter(o => o.status === 'Pendente').length;
    const ordensAndamento = ordensServico.filter(o => o.status === 'Em andamento').length;
    const taxaConclusao = ordensServico.length > 0 ? ((ordensCompletas / ordensServico.length) * 100).toFixed(1) : 0;
    const mediaAvaliacao = avaliacoes.length > 0 
      ? (avaliacoes.reduce((a, b) => a + b.nota, 0) / avaliacoes.length).toFixed(1)
      : 'N/A';

    // Criar contexto para o Gemini com dados reais do negócio
    const contexto = `
Você é um Assistente IA Gestora da plataforma SmartOps. 
Você tem acesso aos dados reais do negócio do usuário:

📊 DADOS ATUAIS DO NEGÓCIO:
- Total de Ordens de Serviço: ${ordensServico.length}
- Ordens Concluídas: ${ordensCompletas}
- Ordens em Andamento: ${ordensAndamento}
- Ordens Pendentes: ${ordensPendentes}
- Taxa de Conclusão: ${taxaConclusao}%
- Satisfação do Cliente: ${mediaAvaliacao}/10
- Total de Avaliações: ${avaliacoes.length}

⚙️ AUTOMAÇÕES ATIVAS (${regrasAtivas.length}):
${regrasAtivas.map(r => `- ${r.nome}: ${r.descricao}`).join('\n')}

INSTRUÇÕES:
1. Sempre cite os dados reais do negócio quando responder
2. Faça recomendações baseadas nos números reais
3. Se questionado sobre automações, liste as regras ativas
4. Seja prático, direto e focado em soluções
5. Sempre use emojis para melhor visualização
6. Se não souber algo, seja honesto e pergunte mais

PERGUNTA DO USUÁRIO: ${mensagem}

Responda de forma prática, citando dados reais e oferecendo recomendações acionáveis.
    `;

    console.log('🤖 Enviando para Gemini:', contexto.substring(0, 200) + '...');

    // Chamar a API do Gemini
    const result = await model.generateContent(contexto);
    const response = await result.response;
    const resposta = response.text();

    console.log('✅ Resposta do Gemini recebida');
    return resposta;
  } catch (error) {
    console.error('❌ Erro na IA:', error);
    return `⚠️ Erro ao processar com IA: ${error.message}. Tente novamente.`;
  }
}
