const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 🤖 ZOÉ - Assistente IA para WhatsApp
 * 
 * Personalidade:
 * - Nome: Zoé
 * - Função: Atender clientes no WhatsApp enquanto esperam resposta do prestador
 * - Tom: Atenciosa, humana, acolhedora, profissional mas amigável
 * - Objetivo: Manter conversa natural, tirar dúvidas, dar informações
 */

const PERSONALIDADE_ZOE = `Você é Zoé, uma assistente de IA amigável e atenciosa da Assistus.

INSTRUÇÕES IMPORTANTES:
1. 🎯 SEMPRE se apresente na primeira mensagem como: "Olá! 👋 Sou a Zoé, assistente de atendimento da Assistus. Como posso ajudá-lo enquanto aguarda resposta do nosso prestador?"
2. 💬 Mantenha uma conversa natural, humana e acolhedora
3. 🕐 Informe o cliente sobre tempo estimado de resposta do prestador quando apropriado
4. 📋 Ofereça informações sobre:
   - Status da ordem de serviço (se disponível no contexto)
   - Tempo estimado de chegada do prestador
   - Informações sobre o serviço solicitado
   - Dúvidas gerais sobre o atendimento
5. 😊 Seja empática e compreensiva - o cliente pode estar esperando/ansioso
6. ❌ NUNCA forneça dados confidenciais de outras pessoas
7. ✅ SEMPRE seja honesta - se não souber algo, diga que vai verificar com o time
8. 🎭 Use emojis moderadamente para expressar warmth
9. 📱 Mantenha respostas concisas (máx 2-3 linhas) já que é WhatsApp
10. 🔄 Se o prestador/human responder, pare de responder automaticamente`;

/**
 * Processar mensagem com histórico de conversa
 * @param {string} mensagem - Mensagem do cliente
 * @param {string} telefoneCliente - Telefone do cliente
 * @param {array} historico - Histórico da conversa
 * @param {object} contextoOS - Contexto da ordem de serviço (opcional)
 * @returns {string} Resposta da Zoé
 */
async function procesarMensagemZoe(mensagem, telefoneCliente, historico = [], contextoOS = {}) {
  try {
    console.log(`\n🤖 ZOÉ - Processando mensagem de ${telefoneCliente}`);
    console.log(`   Mensagem: "${mensagem}"`);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Construir histórico formatado
    let historicoFormatado = '';
    if (historico && historico.length > 0) {
      historicoFormatado = 'HISTÓRICO DA CONVERSA:\n';
      historico.slice(-5).forEach(msg => { // Últimas 5 mensagens
        const autor = msg.tipo === 'cliente' ? '👤 Cliente' : '🤖 Zoé';
        historicoFormatado += `${autor}: ${msg.texto}\n`;
      });
      historicoFormatado += '\n';
    }

    // Contexto da ordem de serviço
    let contextoOSTexto = '';
    if (contextoOS && Object.keys(contextoOS).length > 0) {
      contextoOSTexto = `CONTEXTO DA ORDEM DE SERVIÇO:
- Serviço: ${contextoOS.tipo || 'Não especificado'}
- Status: ${contextoOS.status || 'Pendente'}
- Prestador Atribuído: ${contextoOS.prestador || 'Em busca'}
- Tempo Estimado de Chegada: ${contextoOS.tempoEstimado || '5-10 minutos'}
- Data/Hora da Solicitação: ${contextoOS.dataSolicitacao || 'Agora'}

`;
    }

    // Prompt para Zoé
    const prompt = `${PERSONALIDADE_ZOE}

${contextoOSTexto}
${historicoFormatado}
MENSAGEM DO CLIENTE: "${mensagem}"

RESPONDA COMO ZOÉ:
- Se for primeira interação (não há histórico), apresente-se conforme instruído
- Mantenha tom amigável e profissional
- Resposta concisa (máximo 2-3 linhas de WhatsApp)
- Use emojis com moderação
- Seja genuinamente atenciosa`;

    try {
      console.log('📡 Tentando com Gemini...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const resposta = response.text().trim();

      console.log(`✅ Resposta Zoé gerada (Gemini): "${resposta}"`);
      return resposta;

    } catch (geminiError) {
      console.warn('⚠️ Gemini falhou:', geminiError.message);
      console.log('📝 Usando resposta inteligente local (sem Gemini)...');
      
      // Fallback: Resposta local inteligente e contextualizada
      const respostasZoe = [
        {
          pattern: /oi|olá|opa|e aí/i,
          resposta: `Olá! 👋 Sou a Zoé, assistente de atendimento. Como posso ajudá-lo enquanto aguarda resposta do nosso prestador?`
        },
        {
          pattern: /quando|tempo|quanto|chega|min/i,
          resposta: `⏱️ Seu prestador está chegando em aproximadamente ${contextoOS.tempoEstimado || '5-10 minutos'}. Alguma dúvida sobre o atendimento?`
        },
        {
          pattern: /saudação|satisf|feliz|bom|legal|legal/i,
          resposta: `😊 Fico feliz em ajudar! Estou aqui para tirar suas dúvidas. O que você gostaria de saber?`
        },
        {
          pattern: /serviço|tipo|qual|o quê/i,
          resposta: `📋 Seu atendimento é de ${contextoOS.tipo || 'manutenção'}. Precisa de mais informações sobre o serviço?`
        },
        {
          pattern: /obrigado|valeu|thanks/i,
          resposta: `De nada! 😊 Fico à disposição se precisar de mais algo. Estamos aqui para ajudar!`
        },
        {
          pattern: /urgente|rápido|rapido|pressa|problema/i,
          resposta: `⚠️ Entendo a urgência! Seu prestador já foi notificado e está a caminho. Está tudo bem aí?`
        }
      ];

      // Procurar resposta baseada no padrão da mensagem
      let respostaEscolhida = null;
      for (const item of respostasZoe) {
        if (item.pattern.test(mensagem)) {
          respostaEscolhida = item.resposta;
          break;
        }
      }

      // Se não encontrou padrão, usar resposta genérica
      if (!respostaEscolhida) {
        respostaEscolhida = `👋 Ótimo! Entendi sua mensagem. Nosso prestador em breve responde. Posso ajudar com algo?`;
      }

      console.log(`✅ Resposta Zoé gerada (Local): "${respostaEscolhida}"`);
      return respostaEscolhida;
    }

  } catch (error) {
    console.error('❌ Erro crítico ao processar mensagem Zoé:', error.message);
    
    // Resposta fallback final - SEMPRE responde
    const respostaFinal = '👋 Olá! Sou a Zoé, assistente de atendimento. Como posso ajudá-lo?';
    console.log(`✅ Resposta Zoé gerada (Fallback Final): "${respostaFinal}"`);
    return respostaFinal;
  }
}

/**
 * Decidir se deve responder automaticamente
 * Responde se passou mais de 5 segundos desde a última mensagem do prestador
 * 
 * @param {array} mensagens - Array de mensagens da conversa
 * @returns {boolean} true se deve responder com Zoé
 */
function deveResponderAutomaticamente(mensagens = []) {
  if (!mensagens || mensagens.length === 0) {
    return true; // Primeira mensagem, Zoé responde
  }

  // Procurar última mensagem do prestador (tipo === 'prestador' ou autor que não é 'cliente' ou 'zoe')
  const ultimaMensagemPrestador = mensagens.findLast(m => 
    m.tipo === 'prestador' || 
    (m.autor && m.autor !== 'cliente' && m.autor !== 'zoe')
  );

  if (!ultimaMensagemPrestador) {
    return true; // Nenhuma mensagem do prestador, Zoé responde
  }

  // Verificar tempo desde última mensagem do prestador
  const agora = new Date();
  const tempoMensagem = new Date(ultimaMensagemPrestador.timestamp);
  const diferenca = (agora - tempoMensagem) / 1000; // Diferença em segundos

  console.log(`⏱️ Tempo desde última resposta do prestador: ${diferenca.toFixed(1)}s`);

  return diferenca > 5; // Responder se passou mais de 5 segundos
}

module.exports = {
  procesarMensagemZoe,
  deveResponderAutomaticamente,
  PERSONALIDADE_ZOE
};
