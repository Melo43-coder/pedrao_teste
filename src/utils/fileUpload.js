// Utility para upload de arquivos para Firebase Storage

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const storage = getStorage();

// Upload um arquivo para Firebase Storage
export async function uploadFile(cnpj, file, folder = 'chats') {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `companies/${cnpj}/${folder}/${fileName}`);
    
    // Upload o arquivo
    const snapshot = await uploadBytes(storageRef, file);
    
    // Obter URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    throw error;
  }
}

// Deletar um arquivo do Firebase Storage
export async function deleteFile(fileUrl) {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw error;
  }
}

// Comprimir imagem antes do upload
export async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Manter proporção
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  });
}

// Validar tipo de arquivo
export function validateFileType(file, allowedTypes = []) {
  if (allowedTypes.length === 0) {
    // Tipos padrão permitidos
    allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
  }
  
  return allowedTypes.includes(file.type);
}

// Validar tamanho do arquivo (em MB)
export function validateFileSize(file, maxSizeMB = 10) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

// Obter ícone baseado no tipo de arquivo
export function getFileIcon(fileType) {
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
  if (fileType.includes('audio')) return '🎵';
  if (fileType.includes('video')) return '🎬';
  return '📎';
}

// Formatar tamanho de arquivo para leitura humana
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
