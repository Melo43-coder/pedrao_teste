# 📍 Rastreamento de Prestadores em Tempo Real

## 🎯 O que foi implementado

Adicionado rastreamento em tempo real dos prestadores no **Mapa do Dashboard Home**, exibindo simultaneamente:
- 📍 **Ordens de Serviço** (marcadores coloridos por prioridade)
- 🚗 **Prestadores em movimento** (marcadores azuis pulsantes)

---

## ✅ Funcionalidades Implementadas

### 1. **Mapa com Dual View**
- Exibe **OS** e **Prestadores** ao mesmo tempo
- Atualização automática a cada **5 segundos** para prestadores
- Atualização automática a cada **10 segundos** para OS

### 2. **Marcador de Prestador Customizado**
- 🚗 Ícone de carro azul pulsante
- Halo animado mostrando movimento
- Popup detalhado com informações:
  - Nome do prestador
  - ID do prestador
  - OS atual em execução
  - Última atualização (tempo relativo)
  - Velocidade (se disponível)

### 3. **Indicadores Visuais**
- Badge "X Prestadores Online" (azul pulsante)
- Contador "X OS no mapa"
- Auto-ajuste do zoom para exibir todos os marcadores

---

## 🔧 Funções Firebase Criadas

### `getPrestadoresLocation(cnpj)`
Busca localização de todos os prestadores da empresa

**Retorna:**
```javascript
[
  {
    id: "doc-id",
    prestadorId: "prestador1",
    nome: "João Silva",
    latitude: -23.5505,
    longitude: -46.6333,
    timestamp: "2025-12-19T10:30:00.000Z",
    osAtual: "#12345",
    velocidade: 45
  }
]
```

### `updatePrestadorLocation(cnpj, prestadorId, locationData)`
Atualiza localização do prestador (chamada pelo app mobile)

**Parâmetros:**
```javascript
{
  latitude: -23.5505,
  longitude: -46.6333,
  nome: "João Silva",
  osAtual: "#12345", // opcional
  velocidade: 45      // opcional (km/h)
}
```

---

## 📱 Como Integrar no App React Native

### 1. Enviar Localização do Prestador

Adicione no app mobile (ServiceExecutionScreen ou NavigationScreen):

```javascript
import * as Location from 'expo-location';
import firebase from '../services/firebase';

// Solicitar permissão de localização
async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    alert('Permissão de localização negada');
    return false;
  }
  return true;
}

// Iniciar rastreamento em tempo real
async function startLocationTracking() {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return;

  // Obter dados do AsyncStorage
  const companyCnpj = await AsyncStorage.getItem('companyCnpj');
  const prestadorId = await AsyncStorage.getItem('prestadorId');
  const userName = await AsyncStorage.getItem('userName');
  const osAtual = await AsyncStorage.getItem('osAtual'); // OS em execução

  // Atualizar localização a cada 5 segundos
  const locationInterval = setInterval(async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      // Enviar para Firebase
      await firebase.updatePrestadorLocation(companyCnpj, prestadorId, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        nome: userName,
        osAtual: osAtual || null,
        velocidade: location.coords.speed ? (location.coords.speed * 3.6) : 0 // m/s para km/h
      });

      console.log('📍 Localização enviada:', location.coords);
    } catch (err) {
      console.error('❌ Erro ao enviar localização:', err);
    }
  }, 5000); // A cada 5 segundos

  return locationInterval;
}

// Parar rastreamento
function stopLocationTracking(interval) {
  if (interval) {
    clearInterval(interval);
    console.log('🛑 Rastreamento parado');
  }
}
```

### 2. Iniciar Rastreamento ao Aceitar OS

```javascript
// ServiceListScreen.jsx - Ao aceitar uma OS
const handleAcceptOS = async (os) => {
  try {
    // Salvar OS atual
    await AsyncStorage.setItem('osAtual', os.codigo);
    
    // Iniciar rastreamento
    const trackingInterval = await startLocationTracking();
    
    // Salvar intervalo para parar depois
    setTrackingInterval(trackingInterval);
    
    // Navegar para execução
    navigation.navigate('ServiceExecution', { osId: os.id });
  } catch (err) {
    console.error('Erro ao aceitar OS:', err);
  }
};
```

### 3. Parar Rastreamento ao Concluir OS

```javascript
// ServiceExecutionScreen.jsx - Ao concluir OS
const handleCompleteOS = async () => {
  try {
    // Atualizar status no Firebase
    await firebase.updateServiceOrder(companyCnpj, osId, {
      status: 'Concluída',
      dataConclusao: new Date().toISOString()
    });
    
    // Parar rastreamento
    stopLocationTracking(trackingInterval);
    
    // Limpar OS atual
    await AsyncStorage.removeItem('osAtual');
    
    // Voltar para lista
    navigation.goBack();
  } catch (err) {
    console.error('Erro ao concluir OS:', err);
  }
};
```

---

## 📦 Dependências Necessárias (App Mobile)

```bash
npm install expo-location
npm install @react-native-async-storage/async-storage
```

---

## 🧪 Como Testar

### 1. **No Dashboard Web:**
1. Acesse a página **Home**
2. Verifique o **Mapa de Ordens de Serviço**
3. Deve aparecer badge "X Prestadores Online" (inicialmente 0)

### 2. **No App Mobile:**
1. Faça login como prestador
2. Aceite uma OS
3. O rastreamento inicia automaticamente
4. Localize está sendo enviada a cada 5 segundos

### 3. **Verificação no Dashboard:**
1. Após alguns segundos, o mapa deve mostrar:
   - 🚗 Marcador azul pulsante (prestador)
   - Badge "1 Prestador Online"
2. Clique no marcador do prestador para ver detalhes
3. Observe atualização em tempo real (até 5s de delay)

---

## 🎨 Elementos Visuais

### Marcador de OS (Prioridade)
- 🔴 **Alta** - Vermelho (#ef4444)
- 🟡 **Média** - Amarelo (#f59e0b)
- 🟢 **Baixa** - Verde (#10b981)

### Marcador de Prestador
- 🚗 **Ícone** - Carro azul
- 💙 **Cor** - Azul (#3b82f6)
- 🌀 **Animação** - Halo pulsante
- ⏱️ **Atualização** - Tempo relativo ("2 minutos atrás")

---

## 📊 Estrutura de Dados no Firebase

```
companies/
  └─ {cnpj}/
      └─ prestadoresLocation/
          └─ {prestadorId}/
              ├─ prestadorId: "prestador1"
              ├─ nome: "João Silva"
              ├─ latitude: -23.5505
              ├─ longitude: -46.6333
              ├─ timestamp: "2025-12-19T10:30:00.000Z"
              ├─ osAtual: "#12345" (opcional)
              ├─ velocidade: 45 (opcional)
              └─ updatedAt: "2025-12-19T10:30:00.000Z"
```

---

## 🔒 Permissões Necessárias (App Mobile)

### Android - `AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### iOS - `Info.plist`
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Precisamos da sua localização para rastreamento em tempo real</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>Rastreamento em tempo real de ordens de serviço</string>
```

---

## 💡 Melhorias Futuras

- [ ] Histórico de trajeto (linha conectando posições)
- [ ] Estimativa de tempo de chegada (ETA)
- [ ] Alertas de prestador parado por muito tempo
- [ ] Rastreamento em background (quando app fechado)
- [ ] Modo "economia de bateria" (atualização a cada 30s)
- [ ] Notificação quando prestador chegar próximo à OS

---

## 🎯 Resultado Final

Dashboard exibe em tempo real:
- ✅ Todas as OS no mapa com prioridade visual
- ✅ Prestadores em movimento com localização atualizada
- ✅ Informações detalhadas ao clicar nos marcadores
- ✅ Auto-zoom para exibir todos os elementos
- ✅ Atualização automática sem reload de página

**O gestor pode acompanhar todos os prestadores em campo simultaneamente!** 🚀
