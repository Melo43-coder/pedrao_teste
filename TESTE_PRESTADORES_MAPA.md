# 🧪 Como Testar Localização de Prestadores

## Problema Identificado
Os prestadores não aparecem no mapa porque **não existem dados de localização no Firebase ainda**.

---

## ✅ Solução Rápida: Adicionar Dados de Teste

### Opção 1: Via Console do Navegador (MAIS RÁPIDO)

1. **Abra o Dashboard** e faça login
2. **Abra o Console do navegador** (F12 → Console)
3. **Cole e execute este código:**

```javascript
// Adicionar localizações de teste no Firebase
async function adicionarPrestadoresTest() {
  const firebase = window.firebase || (await import('./services/firebase')).default;
  const companyCnpj = localStorage.getItem('companyCnpj') || '12345678000190';
  
  console.log('🚀 Adicionando prestadores de teste...');
  
  // Prestador 1 - João Silva (São Paulo Centro)
  await firebase.updatePrestadorLocation(companyCnpj, 'prestador1', {
    latitude: -23.5505,
    longitude: -46.6333,
    nome: 'João Silva',
    osAtual: '#12345',
    velocidade: 45
  });
  console.log('✅ Prestador 1: João Silva adicionado');
  
  // Prestador 2 - Maria Santos (São Paulo Zona Oeste)
  await firebase.updatePrestadorLocation(companyCnpj, 'prestador2', {
    latitude: -23.5489,
    longitude: -46.6388,
    nome: 'Maria Santos',
    osAtual: '#12346',
    velocidade: 30
  });
  console.log('✅ Prestador 2: Maria Santos adicionada');
  
  // Prestador 3 - Pedro Oliveira (São Paulo Zona Sul)
  await firebase.updatePrestadorLocation(companyCnpj, 'prestador3', {
    latitude: -23.5610,
    longitude: -46.6560,
    nome: 'Pedro Oliveira',
    osAtual: null,
    velocidade: 0
  });
  console.log('✅ Prestador 3: Pedro Oliveira adicionado');
  
  console.log('🎉 Pronto! Aguarde 5 segundos e os marcadores aparecerão no mapa.');
}

// Executar
adicionarPrestadoresTest();
```

4. **Aguarde 5 segundos** (tempo de atualização automática)
5. **Veja os marcadores azuis 🚗** aparecerem no mapa!

---

### Opção 2: Via Firestore Console (MANUAL)

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto **zillo-base**
3. Vá em **Firestore Database**
4. Navegue até: `companies/{seu-cnpj}/prestadoresLocation`
5. **Adicione um documento** com ID `prestador1`:

```json
{
  "prestadorId": "prestador1",
  "nome": "João Silva",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "timestamp": "2025-12-19T10:30:00.000Z",
  "osAtual": "#12345",
  "velocidade": 45,
  "updatedAt": "2025-12-19T10:30:00.000Z"
}
```

---

## 🔍 Verificar se Está Funcionando

### 1. Console do Navegador
Deve mostrar:
```
📍 Localizações de prestadores: 3
```

### 2. Mapa
Deve exibir:
- 🚗 Marcadores azuis pulsantes (prestadores)
- Badge **"3 Prestadores Online"** (azul)

### 3. Popup ao Clicar
Ao clicar no marcador azul, deve mostrar:
- Nome do prestador
- ID do prestador
- OS atual em execução
- Última atualização
- Velocidade

---

## 📱 Próximo Passo: App Mobile

Depois de testar no dashboard, implemente no app React Native:

```javascript
// No app mobile - enviar localização real
import * as Location from 'expo-location';
import firebase from './services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function startLocationTracking() {
  const companyCnpj = await AsyncStorage.getItem('companyCnpj');
  const prestadorId = await AsyncStorage.getItem('prestadorId');
  const userName = await AsyncStorage.getItem('userName');
  
  setInterval(async () => {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    
    await firebase.updatePrestadorLocation(companyCnpj, prestadorId, {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      nome: userName,
      osAtual: '#12345', // OS sendo executada
      velocidade: location.coords.speed * 3.6 // m/s para km/h
    });
  }, 5000); // A cada 5 segundos
}
```

---

## 🐛 Troubleshooting

### Prestadores não aparecem?
1. ✅ Verifique o console: deve mostrar `📍 Localizações de prestadores: X`
2. ✅ Confirme que os dados existem no Firestore
3. ✅ Verifique se o CNPJ está correto: `localStorage.getItem('companyCnpj')`
4. ✅ Aguarde 5 segundos (atualização automática)

### Erro no console?
- **"CNPJ inválido"**: Verifique se está logado corretamente
- **"Permissão negada"**: Ajuste as regras do Firestore
- **"Função não encontrada"**: Limpe o cache do navegador (Ctrl+Shift+R)

---

## 📊 Dados Esperados no Firebase

```
companies/
  └─ 12345678000190/
      └─ prestadoresLocation/
          ├─ prestador1/
          │   ├─ prestadorId: "prestador1"
          │   ├─ nome: "João Silva"
          │   ├─ latitude: -23.5505
          │   ├─ longitude: -46.6333
          │   ├─ timestamp: "2025-12-19T10:30:00.000Z"
          │   ├─ osAtual: "#12345"
          │   └─ velocidade: 45
          │
          ├─ prestador2/ (...)
          └─ prestador3/ (...)
```

---

## 🎯 Resultado Final

Após adicionar os dados de teste:
- ✅ Mapa exibe marcadores azuis pulsantes
- ✅ Badge mostra "X Prestadores Online"
- ✅ Popup com informações detalhadas
- ✅ Atualização automática a cada 5 segundos
- ✅ Auto-zoom para exibir todos os marcadores

**Agora você pode visualizar seus prestadores em tempo real! 🚀**
