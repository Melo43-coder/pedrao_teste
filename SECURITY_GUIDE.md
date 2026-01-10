# 🔒 GUIA DE SEGURANÇA - Sistema Zillo Base

## ⚠️ MUDANÇAS CRÍTICAS IMPLEMENTADAS

### 1. **Credenciais Firebase Protegidas**
As credenciais do Firebase foram movidas para variáveis de ambiente.

**AÇÕES NECESSÁRIAS:**
1. Crie um arquivo `.env` na raiz do projeto
2. Copie o conteúdo de `.env.example`
3. Substitua os valores pelas suas credenciais reais
4. **NUNCA** commite o arquivo `.env` no Git

```bash
# .env
REACT_APP_FIREBASE_API_KEY=sua-api-key-aqui
REACT_APP_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
# ... outras configurações
```

### 2. **Autenticação Segura**
- ✅ Removido fallback inseguro de senhas em texto plano
- ✅ Implementado sistema de expiração de token
- ✅ Adicionado rate limiting para prevenir brute force
- ✅ Monitoramento de inatividade (15 minutos)
- ✅ Timeout de sessão configurável (1 hora padrão)

### 3. **Proteção de Rotas Aprimorada**
- Verificação de token com expiração
- Validação de autenticação em todas as rotas protegidas
- Redirecionamento automático ao expirar sessão

### 4. **Headers de Segurança HTTP**
Adicionados ao `index.html`:
- **X-Content-Type-Options**: Previne MIME sniffing
- **X-Frame-Options**: Previne clickjacking
- **X-XSS-Protection**: Proteção contra XSS
- **Content-Security-Policy**: Controla recursos permitidos
- **Referrer Policy**: Controla informações de referência

### 5. **Validação e Sanitização**
Novo arquivo `utils/security.js` com:
- Sanitização de inputs (previne XSS)
- Validação de CNPJ
- Validação de email
- Validação de força de senha
- Detecção de SQL Injection
- Rate Limiter para login
- Geração de tokens CSRF

## 📋 CHECKLIST DE SEGURANÇA

### Firebase Console (URGENTE)
- [ ] Habilitar Email/Password Authentication
- [ ] Configurar regras de segurança do Firestore:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita apenas para usuários autenticados
    match /companies/{companyId} {
      allow read, write: if request.auth != null;
      
      match /users/{userId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
                       (request.auth.token.role == 'admin' || 
                        request.auth.uid == userId);
      }
    }
  }
}
```

### Configurações de Produção
- [ ] Configurar domínios autorizados no Firebase Console
- [ ] Habilitar App Check para proteção contra bots
- [ ] Configurar CORS apropriadamente
- [ ] Configurar HTTPS obrigatório
- [ ] Revisar e atualizar CSP conforme necessário

### Boas Práticas
- [ ] Nunca armazene senhas em texto plano
- [ ] Use HTTPS em produção
- [ ] Mantenha dependências atualizadas
- [ ] Realize auditorias de segurança regulares
- [ ] Monitore logs de autenticação
- [ ] Implemente logging de tentativas de login falhas
- [ ] Configure backups automáticos do Firestore

## 🚨 VULNERABILIDADES CORRIGIDAS

### ❌ Antes (INSEGURO):
1. ⚠️ Credenciais Firebase expostas no código
2. ⚠️ Senhas em texto plano no Firestore
3. ⚠️ Autenticação sem expiração de token
4. ⚠️ Sem proteção contra brute force
5. ⚠️ Headers de segurança ausentes
6. ⚠️ Validação de entrada inexistente

### ✅ Depois (SEGURO):
1. ✅ Credenciais em variáveis de ambiente
2. ✅ Apenas Firebase Auth (sem senhas em texto plano)
3. ✅ Tokens com expiração e renovação
4. ✅ Rate limiting implementado
5. ✅ Headers de segurança completos
6. ✅ Validação e sanitização de todas as entradas

## 📚 COMO USAR AS NOVAS FUNCIONALIDADES

### Usar Rate Limiter no Login:
```javascript
import { RateLimiter } from '../utils/security';

const loginLimiter = new RateLimiter(5, 900000); // 5 tentativas em 15min

const handleLogin = async () => {
  const identifier = `${cnpj}-${usuario}`;
  const rateCheck = loginLimiter.isAllowed(identifier);
  
  if (!rateCheck.allowed) {
    setErro(`Muitas tentativas. Aguarde ${rateCheck.timeUntilReset} minutos.`);
    return;
  }
  
  // Prosseguir com login...
};
```

### Validar Senha:
```javascript
import { validatePasswordStrength } from '../utils/security';

const result = validatePasswordStrength(senha);
if (!result.valid) {
  setErro(result.message);
  return;
}
```

### Sanitizar Inputs:
```javascript
import { sanitizeInput } from '../utils/security';

const safeName = sanitizeInput(userInput);
```

## 🔐 CONFIGURAÇÃO DO FIREBASE (Passo a Passo)

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em **Authentication** → **Sign-in method**
4. Habilite **Email/Password**
5. Vá em **Firestore Database** → **Rules**
6. Aplique as regras de segurança mencionadas acima
7. Em **Project Settings**, adicione domínios autorizados

## ⚡ PRÓXIMOS PASSOS RECOMENDADOS

1. **Implementar 2FA (Two-Factor Authentication)**
2. **Adicionar captcha no login**
3. **Implementar logs de auditoria**
4. **Configurar alertas de segurança**
5. **Adicionar testes de segurança automatizados**
6. **Implementar política de rotação de senhas**

## 📞 SUPORTE

Se encontrar problemas de segurança, entre em contato imediatamente com a equipe de desenvolvimento.

---

**Última atualização:** Janeiro 2026
**Versão:** 2.0 - Segurança Reforçada
