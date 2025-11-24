// ============================================
// GUIA: INTEGRAR UPLOAD DE ARQUIVOS NO CHAT
// Este é um template para FASE 2 do projeto
// ============================================

// PASSO 1: Adicionar import no Chat.jsx
/*
import { uploadFile, compressImage, validateFileSize, getFileIcon } from '../../utils/fileUpload';
*/

// PASSO 2: Adicionar estado para arquivo
/*
const [selecionandoArquivo, setSelecionandoArquivo] = useState(false);
const fileInputRef = useRef(null);
*/

// PASSO 3: Adicionar funções para lidar com arquivo

export function handleFileSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  
  // Validar tamanho (10MB max)
  if (!validateFileSize(file, 10)) {
    alert('Arquivo muito grande! Máximo 10MB');
    return;
  }
  
  // Validar tipo
  const typesPermitidos = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!typesPermitidos.includes(file.type)) {
    alert('Tipo de arquivo não permitido. Use: JPEG, PNG ou PDF');
    return;
  }
  
  processarArquivo(file);
}

export async function processarArquivo(file) {
  try {
    // Se for imagem, comprimir
    let arquivoProcessado = file;
    if (file.type.startsWith('image/')) {
      arquivoProcessado = await compressImage(file, 1200, 1200, 0.8);
    }
    
    // Fazer upload
    const fileData = await uploadFile(companyCnpj, arquivoProcessado, 'chats');
    
    // Enviar como anexo
    enviarMensagemComArquivo(fileData);
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    alert('Erro ao fazer upload do arquivo');
  }
}

export async function enviarMensagemComArquivo(fileData) {
  if (!chatSelecionado) return;
  
  try {
    const cpf = localStorage.getItem('userCpf') || 'user-' + new Date().getTime();
    await firebase.sendMessage(companyCnpj, chatSelecionado.id, {
      cpfEnvio: cpf,
      nomeEnvio: userName,
      conteudo: `📎 ${fileData.name}`,
      tipo: 'arquivo',
      arquivo: fileData,
      anexos: [fileData]
    });
    
    carregarMensagens(chatSelecionado.id);
    carregarChats();
  } catch (error) {
    console.error('Erro ao enviar arquivo:', error);
  }
}

// PASSO 4: Modificar o JSX do input area

/*
const inputAreaComUpload = (
  <div style={styles.inputArea}>
    <input
      ref={fileInputRef}
      type="file"
      onChange={handleFileSelect}
      style={{ display: 'none' }}
      accept="image/*,.pdf,.doc,.docx"
    />
    
    <textarea
      value={novaMsg}
      onChange={(e) => setNovaMsg(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleEnviarMensagem();
        }
      }}
      placeholder="Digite sua mensagem... (Shift+Enter para quebra)"
      style={styles.textarea}
    />
    
    <motion.button
      style={{
        padding: '10px 12px',
        backgroundColor: '#8b5cf6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem'
      }}
      onClick={() => fileInputRef.current?.click()}
      title="Enviar arquivo (Imagem, PDF, Doc)"
      whileHover={{ backgroundColor: '#7c3aed' }}
    >
      📎
    </motion.button>
    
    <motion.button
      style={styles.sendBtn}
      onClick={handleEnviarMensagem}
      disabled={!novaMsg.trim()}
      whileHover={{ backgroundColor: '#0284c7' }}
    >
      Enviar
    </motion.button>
  </div>
);
*/

// PASSO 5: Renderizar arquivo nas mensagens

/*
const renderizarMensagem = (msg) => {
  return (
    <motion.div
      key={msg.id}
      style={{
        ...styles.mensagem,
        ...(isEnviada ? styles.mensagemEnviada : styles.mensagemRecebida)
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {!isEnviada && (
        <div style={styles.mensagemHeader}>{msg.nomeEnvio}</div>
      )}
      
      {msg.tipo === 'arquivo' && msg.arquivo ? (
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{getFileIcon(msg.arquivo.type)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                {msg.arquivo.name}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                {msg.arquivo.size > 0 ? `${Math.round(msg.arquivo.size / 1024)}KB` : ''}
              </div>
            </div>
            <a
              href={msg.arquivo.url}
              download={msg.arquivo.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '6px',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer'
              }}
              title="Baixar arquivo"
            >
              ⬇️
            </a>
          </div>
          
          {msg.arquivo.type.startsWith('image/') && (
            <img
              src={msg.arquivo.url}
              alt="Imagem"
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                borderRadius: '6px',
                marginTop: '8px'
              }}
            />
          )}
        </div>
      ) : null}
      
      <div style={styles.mensagemConteudo}>{msg.conteudo}</div>
      <div style={styles.mensagemData}>
        {formatarData(msg.dataCriacao)}
      </div>
    </motion.div>
  );
};
*/

// ============================================
// ESTRUTURA DO OBJETO ARQUIVO
// ============================================

const exemploArquivo = {
  url: "https://firebase-storage.com/...arquivo.jpg",
  name: "documento.pdf",
  size: 245000, // em bytes
  type: "application/pdf",
  uploadedAt: "2025-11-24T10:30:00Z"
};

// ============================================
// ADICIONAR AO FIREBASE.JS
// ============================================

/*
// Adicionar esta função para atualizar mensagem com anexo
export async function updateMessageWithFile(cnpj, chatId, messageId, fileData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  try {
    const msgRef = doc(db, 'companies', companyId, 'chats', chatId, 'mensagens', messageId);
    await updateDoc(msgRef, { 
      arquivo: fileData,
      anexos: [fileData]
    });
  } catch (err) {
    console.error('Erro ao atualizar anexo:', err);
    throw err;
  }
}
*/

// ============================================
// REGRAS FIRESTORE PARA UPLOAD
// ============================================

/*
match /companies/{cnpj}/chats/{chatId}/mensagens/{msgId} {
  allow read, write: if request.auth != null;
  
  allow update: if request.resource.data.arquivo != null 
    && request.resource.data.arquivo.size < 10 * 1024 * 1024;
}
*/

// ============================================
// TIPOS DE ARQUIVO SUPORTADOS
// ============================================

const tiposArquivos = {
  imagens: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documentos: ['application/pdf'],
  word: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  excel: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  compactados: ['application/zip', 'application/x-rar-compressed']
};

// ============================================
// CSS PARA ÁREA DE DROP
// ============================================

/*
const dragDropStyles = {
  dragDropArea: {
    border: '2px dashed #0ea5e9',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: 'rgba(14, 165, 233, 0.05)',
    transition: 'all 0.2s'
  },
  dragDropAreaActive: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderColor: '#0284c7'
  }
};

function dragDropZone() {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect({ target: { files } });
    }
  };
  
  return (
    <div
      style={{
        ...dragDropStyles.dragDropArea,
        ...(isDragging && dragDropStyles.dragDropAreaActive)
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      📎 Arraste arquivos aqui ou clique para selecionar
    </div>
  );
}
*/

// ============================================
// TESTING UPLOAD
// ============================================

/*
async function testarUpload() {
  const file = new File(
    ["teste de conteúdo"],
    "teste.txt",
    { type: "text/plain" }
  );
  
  try {
    const resultado = await uploadFile("11222333000181", file, "chats");
    console.log("✅ Upload bem-sucedido:", resultado);
  } catch (error) {
    console.error("❌ Erro no upload:", error);
  }
}
*/

export {
  handleFileSelect,
  processarArquivo,
  enviarMensagemComArquivo,
  tiposArquivos
};
