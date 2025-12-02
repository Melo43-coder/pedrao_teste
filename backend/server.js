const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const admin = require('firebase-admin');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();

// Inicializar Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Adicionar suporte a form-urlencoded

// Inicializar Firebase Admin
let db = null;
try {
  // Comentado por enquanto - usar Firebase Functions ou Cloud Firestore REST API depois
  // admin.initializeApp({
  //   projectId: process.env.FIREBASE_PROJECT_ID,
  // });
  // db = admin.firestore();
  console.log('⚠️ Firebase Admin desabilitado. Configure credenciais para ativar.');
} catch (err) {
  console.warn('⚠️ Firebase Admin não inicializado:', err.message);
}

// Configurações do Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

// Armazenar mensagens recebidas em memória (temporário)
const receivedMessages = [];

// Rota para enviar mensagem WhatsApp
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { phone, message } = req.body;

    // Validar entrada
    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'Número de telefone e mensagem são obrigatórios'
      });
    }

    // Formatar número
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55') && formattedPhone.length === 11) {
      formattedPhone = '55' + formattedPhone;
    }

    try {
      // Tentar enviar mensagem via Twilio
      const result = await client.messages.create({
        from: twilioWhatsAppNumber,
        to: `whatsapp:+${formattedPhone}`,
        body: message
      });

      console.log(`✅ Mensagem enviada para ${phone}: ${result.sid}`);

      res.json({
        success: true,
        messageId: result.sid,
        status: result.status,
        via: 'twilio'
      });
    } catch (twilioError) {
      console.warn('⚠️ Erro ao enviar via Twilio:', twilioError.message);
      
      // FALLBACK: Modo sandbox - simular envio
      console.log(`📱 FALLBACK SANDBOX: Simulando envio para ${phone}`);
      console.log(`   Mensagem: "${message}"`);
      
      const simulatedMessageId = 'SIM_' + Date.now();
      
      res.json({
        success: true,
        messageId: simulatedMessageId,
        status: 'simulated',
        via: 'sandbox',
        message: 'Mensagem simulada (Twilio em modo sandbox)'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para receber webhooks do Twilio (respostas do cliente)
app.post('/api/whatsapp/webhook', async (req, res) => {
  try {
    console.log('\n🔍 WEBHOOK COMPLETO:', JSON.stringify(req.body, null, 2));
    
    const from = req.body.From || req.body.from || 'unknown';
    const body = req.body.Body || req.body.body || '';
    const smsMessageSid = req.body.SmsMessageSid || req.body.MessageSid || 'unknown';

    console.log(`\n📨 Mensagem recebida:`);
    console.log(`   De: ${from}`);
    console.log(`   Corpo: "${body}"`);
    console.log(`   SID: ${smsMessageSid}`);

    // Formatar número do cliente
    const clientPhone = from.replace('whatsapp:', '').replace('+', '').replace(/\D/g, '');
    console.log(`📱 Telefone do cliente (formatado): ${clientPhone}`);

    // Verificar tipo de mídia
    let messageType = 'texto';
    let mediaUrl = null;
    let mediaType = null;

    // Foto/Imagem
    if (req.body.NumMedia && parseInt(req.body.NumMedia) > 0) {
      const mediaContentType = req.body.MediaContentType0;
      mediaUrl = req.body.MediaUrl0;
      
      if (mediaContentType?.includes('image')) {
        messageType = 'imagem';
        mediaType = 'image';
        console.log(`📸 Foto/Imagem recebida: ${mediaUrl}`);
      } else if (mediaContentType?.includes('audio')) {
        messageType = 'audio';
        mediaType = 'audio';
        console.log(`🎙️ Áudio/Voz recebida: ${mediaUrl}`);
      } else if (mediaContentType?.includes('video')) {
        messageType = 'video';
        mediaType = 'video';
        console.log(`🎬 Vídeo recebido: ${mediaUrl}`);
      } else if (mediaContentType?.includes('pdf') || mediaContentType?.includes('application')) {
        messageType = 'documento';
        mediaType = 'document';
        console.log(`📄 Documento/PDF recebido: ${mediaUrl}`);
      } else {
        messageType = 'arquivo';
        mediaType = 'file';
        console.log(`📎 Arquivo recebido: ${mediaUrl}`);
      }
    }

    // Armazenar na memória
    const message = {
      id: smsMessageSid,
      from: from,
      clientPhone: clientPhone,
      body: body || `[${messageType.toUpperCase()}]`,
      timestamp: new Date().toISOString(),
      type: messageType,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      mediaContentType: req.body.MediaContentType0,
      saved: false
    };
    
    receivedMessages.push(message);
    console.log(`✅ Mensagem (${messageType}) armazenada em memória`);
    console.log(`📊 Total de mensagens recebidas: ${receivedMessages.length}`);

    // Resposta padrão para Twilio
    res.json({ success: true, message: 'Webhook recebido e armazenado' });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

// Rota para o frontend consultar mensagens recebidas
app.get('/api/whatsapp/messages', (req, res) => {
  const { phone, cnpj } = req.query;
  
  console.log(`\n🔍 === CONSULTANDO MENSAGENS ===`);
  console.log(`   Telefone (param): ${phone}`);
  console.log(`   Total de mensagens no servidor: ${receivedMessages.length}`);
  console.log(`   Todas as mensagens:`, receivedMessages.map(m => ({ id: m.id, from: m.clientPhone, body: m.body, type: m.type })));
  
  if (!phone) {
    return res.status(400).json({ error: 'Telefone requerido' });
  }
  
  // Normalizar o telefone da query
  let normalizedPhone = phone.replace(/\D/g, '');
  if (!normalizedPhone.startsWith('55')) {
    normalizedPhone = '55' + normalizedPhone;
  }
  
  console.log(`   Telefone (normalizado): ${normalizedPhone}`);
  
  // Filtrar mensagens do cliente - comparar com ambos os formatos
  const clientMessages = receivedMessages.filter(msg => {
    const match = msg.clientPhone === normalizedPhone || msg.clientPhone === phone.replace(/\D/g, '');
    if (match) {
      console.log(`   ✅ Match encontrado: ${msg.clientPhone} (${msg.type})`);
    }
    return match;
  });
  
  console.log(`✅ Retornando ${clientMessages.length} mensagens`);
  
  res.json({
    phone: normalizedPhone,
    messages: clientMessages,
    total: clientMessages.length
  });
});

// Rota para marcar mensagens como salvas no Firebase
app.post('/api/whatsapp/mark-saved', (req, res) => {
  const { messageSid } = req.body;
  
  const message = receivedMessages.find(m => m.id === messageSid);
  if (message) {
    message.saved = true;
    console.log(`✅ Mensagem ${messageSid} marcada como salva`);
  }
  
  res.json({ success: true });
});

// Rota para processar mensagens com ZOE usando Groq
app.post('/api/zoe/process-message', async (req, res) => {
  try {
    console.log('\n🤖 === ZOE ACIONADA COM GROQ ===');
    const { mensagem, telefoneCliente, historico, contextoOS } = req.body;
    
    console.log('📨 Mensagem do cliente:', mensagem);
    console.log('📱 Telefone:', telefoneCliente);
    console.log('📋 Contexto:', contextoOS);

    // Preparar histórico de conversa para Groq
    const conversationHistory = historico && historico.length > 0
      ? historico.map(m => ({
          role: m.role,
          content: m.content
        }))
      : [];

    // Adicionar mensagem atual
    conversationHistory.push({
      role: 'user',
      content: mensagem
    });

    console.log('📚 Histórico preparado:', conversationHistory.length, 'mensagens');

    // Prompt do sistema para ZOE
    const systemPrompt = `Você é ZOE, uma assistente de atendimento ao cliente da empresa Assistus. 
Sua responsabilidade é conversar de forma natural, amigável e profissional com clientes enquanto eles aguardam um prestador de serviço.

Características:
- Seja conversacional e natural, como um humano
- Use emojis apropriados quando relevante
- Pergunte sobre a necessidade do cliente
- Colete informações úteis (o quê, quando, onde, urgência)
- Seja empático e compreensivo
- Mantenha a conversa fluindo naturalmente
- Não repita as mesmas coisas
- Seja breve mas informativo

Contexto da empresa:
- Empresa: Assistus
- Tipo de serviço: ${contextoOS?.tipo || 'Serviços em geral'}
- Cliente: ${contextoOS?.clienteNome || 'Cliente'}

Responda apenas em português brasileiro de forma natural e conversacional.`;

    // Chamar Groq API
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...conversationHistory
      ],
      model: 'llama-3.3-70b-versatile', // Modelo mais recente e ativo do Groq
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1.0
    });

    const resposta = response.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem no momento.';

    console.log('✅ Resposta ZOE (IA):', resposta);
    
    res.json({
      success: true,
      resposta: resposta,
      modelo: 'zoe-groq-ia',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao processar ZOE:', error);
    
    // Fallback para resposta padrão se Groq falhar
    const mensagem = req.body.mensagem || '';
    let respostaFallback = 'Desculpe, tive um problema. Deixa eu tentar entender melhor: ' + mensagem;
    
    res.json({
      success: true,
      resposta: respostaFallback,
      modelo: 'zoe-fallback',
      erro: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log('📱 WhatsApp API pronta para receber mensagens');
});