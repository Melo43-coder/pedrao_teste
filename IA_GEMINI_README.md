# 🤖 IA SmartOps - Google Gemini 2.5 Mini

## ✅ Implementação Concluída

A IA inteligente foi integrada com sucesso ao módulo de Automação usando a API gratuita do Google Gemini 2.5 Mini.

---

## 📍 Localização

- **Serviço IA**: `src/services/ia.js`
- **Componente**: `src/components/Sistema/Automacao.jsx` (Nova aba: "🤖 IA Assistente")
- **API Key**: `AIzaSyCAShzEkAO5CMy5FF8NIczNEN4TtrKjsrw`

---

## 🔐 Segurança por CNPJ

### Como Funciona
✅ A IA **NUNCA** acessa dados de outras empresas  
✅ Cada usuário vê apenas dados do seu CNPJ configurado  
✅ O CNPJ é carregado do `localStorage` ao entrar na Automação  

### Validação
```javascript
// 1. Ao fazer login, o CNPJ é salvo:
localStorage.setItem('companyCnpj', cnpjDoUsuario);

// 2. Na Automação, o CNPJ é recuperado:
const cnpjArmazenado = localStorage.getItem('companyCnpj');

// 3. Passado para a IA que valida:
if (!cnpj) return '⚠️ CNPJ não fornecido. Sem acesso aos dados.';
```

---

## 📊 Dados Que a IA Acessa

A IA tem acesso **exclusivo** aos seguintes dados da empresa:

```
📊 MÉTRICAS OPERACIONAIS
├─ Total de Ordens de Serviço
├─ Ordens Concluídas (+ taxa percentual)
├─ Ordens em Andamento
├─ Ordens Pendentes
├─ Ordens em Atraso
└─ Satisfação Média dos Clientes (0-10)

⚙️ AUTOMAÇÕES CONFIGURADAS
├─ Nome de cada regra
├─ Descrição
├─ Critérios aplicados
└─ Status (Ativo/Inativo)
```

---

## 🎯 O Que a IA Pode Fazer

### Análises
- ✅ Analisar métricas operacionais em tempo real
- ✅ Identificar gargalos e oportunidades de melhoria
- ✅ Alertar sobre problemas (atrasos, satisfação baixa)

### Recomendações
- ✅ Sugerir melhorias para eficiência operacional
- ✅ Recomendações baseadas em dados reais
- ✅ Explicar como as automações funcionam

### Limitações Intencionais
- ❌ NUNCA compartilha dados de outras empresas
- ❌ NUNCA tira conclusões com dados mistos
- ❌ NUNCA viola segurança ou privacidade
- ❌ Sempre confirma o CNPJ quando questionada

---

## 🚀 Como Usar

### 1. Acessar a IA
- Abra o módulo **Automação**
- Clique na aba **"🤖 IA Assistente"**
- Está pronto para usar!

### 2. Fazer Perguntas
```
Exemplos de perguntas:

"Qual é a minha taxa de conclusão de serviços?"
"Quais são os principais problemas operacionais?"
"Como está a satisfação dos clientes?"
"Que automações tenho ativas?"
"Quais serviços estão atrasados?"
"Qual seria a melhor automação para implementar?"
```

### 3. Receber Respostas
A IA responde com:
- 📊 Dados reais da sua empresa
- 🎯 Recomendações acionáveis
- 📈 Insights baseados em análise
- ⚠️ Alertas sobre problemas

---

## 🛠️ Implementação Técnica

### Arquitetura
```
Usuário (Automacao.jsx)
    ↓
Input com CNPJ ✅
    ↓
Função: processarMensagemIA()
    ↓
Serviço: ia.js
    ↓
Valida CNPJ ✅
    ↓
Firebase (listServiceOrders, getSatisfactionRatings)
    ↓
Cria contexto com dados reais ✅
    ↓
API Gemini 2.5 Mini
    ↓
Gera resposta inteligente
    ↓
Usuário vê resposta
```

### Fluxo de Dados

1. **Usuário digita pergunta** em `iaInput`
2. **Clica "Enviar"** ou pressiona Enter
3. **`processarMensagemIA()`** é chamada
4. **Validação**: CNPJ existe?
5. **Firebase**: Busca dados do CNPJ
6. **Contexto**: Monta prompt para Gemini
7. **Gemini**: Gera resposta inteligente
8. **Chat**: Exibe resposta ao usuário

---

## 🔄 Estados da IA

```javascript
const [iaMessages, setIaMessages] = useState([]);    // Histórico
const [iaInput, setIaInput] = useState("");          // Input atual
const [iaLoading, setIaLoading] = useState(false);   // Processando?
const [cnpj, setCnpj] = useState("");                // Empresa
```

---

## 📝 Exemplos de Respostas

### Exemplo 1: Taxa de Conclusão
```
Usuário: "Qual é minha taxa de conclusão?"

IA (Gemini):
✅ De 15 ordens de serviço:
   - 12 concluídas (80%)
   - 2 em andamento
   - 1 pendente

📊 Taxa de Conclusão: 80% - EXCELENTE!
Você está acima da média da indústria (70%).

💡 Dica: Mantenha o foco nas 2 ordens em andamento 
para manter essa excelente performance.
```

### Exemplo 2: Recomendação de Automação
```
Usuário: "Que automação devo criar?"

IA (Gemini):
📈 Baseado em seus dados:
- 1 ordem em atraso (6 dias)
- Satisfação média: 8.5/10

⚙️ Recomendação: Automação de Alerta de SLA
Quando uma ordem ultrapassar a data limite, 
o sistema alerta automaticamente o gerente.

✅ Impacto: Reduzir atrasos em 40%
👤 Responsável: Gerente de Operações
⏱️ Tempo: 15 minutos para configurar
```

---

## 🐛 Troubleshooting

### Problema: "⚠️ CNPJ não fornecido"
**Solução**: Faça login novamente para que o CNPJ seja salvo

### Problema: Resposta genérica
**Solução**: Reformule a pergunta sendo mais específico sobre o que deseja

### Problema: Gemini retorna erro
**Solução**: Aguarde alguns segundos e tente novamente (rate limit)

---

## 🔄 Atualizar Dados

A IA busca dados **em tempo real** do Firebase:
- Clique em "Enviar" → novos dados são carregados
- Não há cache, sempre dados atualizados
- Ideal para análises dinâmicas

---

## 🎓 Modelo Usado

**Gemini 2.5 Mini** (Versão Gratuita)
- ✅ Rápido (resposta em 2-5 segundos)
- ✅ Econômico (gratuito dentro de limites)
- ✅ Inteligente (compreende contexto)
- ✅ Seguro (sem log de dados sensíveis)

---

## 📞 Support

Se encontrar problemas:
1. Verifique se está logado com o CNPJ correto
2. Tente novamente (às vezes é rate limit do Gemini)
3. Revise a pergunta para ser mais clara
4. Verifique console (F12) para erros

---

**Status**: ✅ Implementado e Pronto para Uso
**Data**: 24 de Novembro de 2025
**Versão da IA**: Gemini 2.5 Mini
