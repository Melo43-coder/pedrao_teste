import React, { useEffect, useState, useMemo } from "react";
import {
  PieChart, Pie, Tooltip, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area
} from "recharts";
import { FiUsers, FiTruck, FiAlertCircle, FiCalendar, FiBarChart2, FiPieChart, FiMap, FiActivity, FiMapPin } from "react-icons/fi";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import firebase from "../../services/firebase";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Importar imagens para ícones personalizados
const carIconUrl = "/assets/icons/car.png";
const personIconUrl = "/assets/icons/user.png";

// Componente para controlar o mapa - fazer zoom/pan automático
function MapController({ markers }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers && markers.length > 0) {
      // Criar bounds dos marcadores
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);
  
  return null;
}

// Componente de Marcador customizado
function OrderMarker({ marker, theme }) {
  const prioridadeColor = marker.prioridade === 'Alta' ? '#ef4444' : marker.prioridade === 'Média' ? '#f59e0b' : '#11A561';
  const statusIcon = marker.status === 'Pendente' ? '⏳' : marker.status === 'Em andamento' ? '🔄' : marker.status === 'Concluída' ? '✅' : marker.status === 'Cancelada' ? '❌' : '⚠️';
  
  const customIcon = L.divIcon({
    html: `<div style="
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${prioridadeColor};
      border: 4px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      font-weight: bold;
      box-shadow: 0 4px 12px ${prioridadeColor}80;
      animation: pulse 2s infinite;
    ">
      ${statusIcon}
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: 'custom-marker'
  });
  
  return (
    <Marker position={[marker.lat, marker.lng]} icon={customIcon}>
      <Popup>
        <div style={{ fontSize: '13px', minWidth: '250px' }}>
          <div style={{ backgroundColor: prioridadeColor, color: 'white', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
            <div style={{ fontWeight: '700', fontSize: '14px' }}>{marker.nome}</div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>Prioridade: {marker.prioridade}</div>
          </div>
          <div style={{ display: 'grid', gap: '6px' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>📍 ENDEREÇO</div>
              <div style={{ fontSize: '12px' }}>{marker.endereco}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>📞 TELEFONE</div>
              <div style={{ fontSize: '12px' }}>{marker.telefone || 'Não informado'}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>STATUS</div>
              <div style={{ fontSize: '12px' }}>{marker.status}</div>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Componente de Marcador para Prestador em Tempo Real
function PrestadorMarker({ prestador, theme }) {
  // Ícone customizado para prestador - boneco clean
  const customIcon = L.divIcon({
    html: `<div style="
      position: relative;
      width: 44px;
      height: 44px;
    ">
      <div style="
        position: absolute;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.15);
        animation: pulse-ring 2.5s ease-in-out infinite;
      "></div>
      <div style="
        position: absolute;
        width: 32px;
        height: 32px;
        top: 6px;
        left: 6px;
        border-radius: 50%;
        background: #2C30D5;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
      ">
        👤
      </div>
    </div>
    <style>
      @keyframes pulse-ring {
        0%, 100% { transform: scale(0.95); opacity: 0.8; }
        50% { transform: scale(1.15); opacity: 0.3; }
      }
    </style>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    className: 'prestador-marker'
  });
  
  // Calcular tempo desde última atualização
  const getTempoAtualizacao = (timestamp) => {
    if (!timestamp) return 'Desconhecido';
    const agora = new Date();
    const ultima = new Date(timestamp);
    const diffMs = agora - ultima;
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 1) return 'Agora mesmo';
    if (diffMin === 1) return '1 minuto atrás';
    if (diffMin < 60) return `${diffMin} minutos atrás`;
    const diffHoras = Math.floor(diffMin / 60);
    if (diffHoras === 1) return '1 hora atrás';
    return `${diffHoras} horas atrás`;
  };

  return (
    <Marker position={[prestador.latitude, prestador.longitude]} icon={customIcon}>
      <Popup>
        <div style={{ fontSize: '13px', minWidth: '280px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #2C30D5 0%, #2563eb 100%)', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>🚗</span>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>{prestador.nome}</div>
            </div>
            <div style={{ fontSize: '11px', opacity: 0.95, fontWeight: '500' }}>
              Prestador em Movimento
            </div>
          </div>
          
          <div style={{ display: 'grid', gap: '10px' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '600', marginBottom: '3px', textTransform: 'uppercase' }}>
                📱 Prestador
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                {prestador.prestadorId || 'ID não informado'}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '600', marginBottom: '3px', textTransform: 'uppercase' }}>
                  🟢 Status
                </div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: prestador.isOnline ? '#11A561' : '#ef4444' }}>
                  {prestador.isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '600', marginBottom: '3px', textTransform: 'uppercase' }}>
                  ✅ Disponível
                </div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: prestador.isAvailable ? '#11A561' : '#f59e0b' }}>
                  {prestador.isAvailable ? 'Sim' : 'Ocupado'}
                </div>
              </div>
            </div>
            
            <div>
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '600', marginBottom: '3px', textTransform: 'uppercase' }}>
                ⏱️ Última Atualização
              </div>
              <div style={{ fontSize: '12px', color: '#11A561', fontWeight: '600' }}>
                {getTempoAtualizacao(prestador.timestamp)}
              </div>
            </div>
            
            {prestador.speed >= 0 && (
              <div>
                <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '600', marginBottom: '3px', textTransform: 'uppercase' }}>
                  🚀 Velocidade
                </div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                  {prestador.speed > 0 ? `${Math.round(prestador.speed)} km/h` : 'Parado'}
                </div>
              </div>
            )}
            
            {prestador.accuracy > 0 && (
              <div>
                <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '600', marginBottom: '3px', textTransform: 'uppercase' }}>
                  📡 Precisão GPS
                </div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b' }}>
                  {Math.round(prestador.accuracy)} metros
                </div>
              </div>
            )}
            
            <div style={{ 
              marginTop: '8px', 
              padding: '8px', 
              background: '#f1f5f9', 
              borderRadius: '6px',
              fontSize: '11px',
              color: '#64748b',
              textAlign: 'center'
            }}>
              🟢 Rastreamento em Tempo Real Ativo
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

const COLORS = ["#2C30D5", "#11A561", "#f59e0b", "#889DD3", "#ec4899", "#32DAF3"];

// Componente do Mapa - Mostra Ordens de Serviço e Prestadores em Tempo Real
const ServiceOrderMap = ({ ordensServico, theme, companyCnpj, setOrdensServico }) => {
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [filtroResponsavel, setFiltroResponsavel] = useState("");
  const [prestadoresLocalizacao, setPrestadoresLocalizacao] = useState([]);

  // 🔄 Carregar localização dos prestadores em tempo real
  useEffect(() => {
    if (!companyCnpj) return;

    async function loadPrestadoresLocalizacao() {
      try {
        const locations = await firebase.getPrestadoresLocation(companyCnpj);
        console.log('📍 Localizações de prestadores:', locations.length);
        setPrestadoresLocalizacao(locations);
      } catch (err) {
        console.error('Erro ao carregar localização dos prestadores:', err);
      }
    }

    loadPrestadoresLocalizacao();
    
    // Atualizar a cada 5 segundos para rastreamento em tempo real
    const interval = setInterval(loadPrestadoresLocalizacao, 5000);
    return () => clearInterval(interval);
  }, [companyCnpj]);

  // Filtrar ordens de serviço
  const ordensFiltradas = useMemo(() => {
    return (ordensServico || []).filter(os => {
      const matchStatus = !filtroStatus || os.status === filtroStatus;
      const matchPrioridade = !filtroPrioridade || os.prioridade === filtroPrioridade;
      const matchResponsavel = !filtroResponsavel || os.responsavel === filtroResponsavel;
      return matchStatus && matchPrioridade && matchResponsavel;
    });
  }, [ordensServico, filtroStatus, filtroPrioridade, filtroResponsavel]);

  // Obter lista única de responsáveis
  const responsaveis = useMemo(() => {
    const set = new Set((ordensServico || []).map(os => os.responsavel).filter(Boolean));
    return Array.from(set);
  }, [ordensServico]);

  const markers = useMemo(() => {
    if (!ordensFiltradas || ordensFiltradas.length === 0) return [];
    
    return ordensFiltradas
      .filter(ox => ox.latitude && ox.longitude)
      .map(ox => {
        const lat = parseFloat(ox.latitude);
        const lng = parseFloat(ox.longitude);
        
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          return null;
        }
        
        return {
          id: ox.id, 
          nome: ox.cliente, 
          lat: lat, 
          lng: lng, 
          telefone: ox.telefone,
          endereco: `${ox.endereco}, ${ox.numero}`,
          status: ox.status,
          prioridade: ox.prioridade,
          cep: ox.cep,
          cidade: ox.cidade,
          estado: ox.estado,
          responsavel: ox.responsavel
        };
      })
      .filter(Boolean);
  }, [ordensFiltradas]);

  return (
    <div style={{ height: 500, position: 'relative', background: theme.cardBg, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Filtros do Mapa */}
      <div style={{ 
        padding: '6px 10px', 
        background: theme.cardBg, 
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        alignItems: 'center',
        zIndex: 999
      }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.text, display: 'flex', alignItems: 'center', gap: '4px' }}>
          Status:
          <select 
            value={filtroStatus} 
            onChange={e => setFiltroStatus(e.target.value)}
            style={{
              background: theme.inputBg || theme.cardBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              padding: '4px 6px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="">Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluída">Concluída</option>
            <option value="Cancelada">Cancelada</option>
            <option value="Aguardando Peça">Aguardando Peça</option>
          </select>
        </label>

        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.text, display: 'flex', alignItems: 'center', gap: '4px' }}>
          Prioridade:
          <select 
            value={filtroPrioridade} 
            onChange={e => setFiltroPrioridade(e.target.value)}
            style={{
              background: theme.inputBg || theme.cardBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              padding: '4px 6px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="">Todos</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
        </label>

        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.text, display: 'flex', alignItems: 'center', gap: '4px' }}>
          Responsável:
          <select 
            value={filtroResponsavel} 
            onChange={e => setFiltroResponsavel(e.target.value)}
            style={{
              background: theme.inputBg || theme.cardBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              padding: '4px 6px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="">Todos</option>
            {responsaveis.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        <button
          onClick={async () => {
            const ordensComErro = ordensServico.filter(os => !os.latitude || !os.longitude);
            
            if (ordensComErro.length === 0) {
              alert('✅ Todas as ordens já têm coordenadas!');
              return;
            }
            
            let sucessos = 0;
            let erros = 0;
            
            for (const os of ordensComErro) {
              try {
                const endereco = `${os.endereco}, ${os.numero}, ${os.cidade}, ${os.estado}`;
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`
                );
                const results = await response.json();
                
                if (results.length > 0) {
                  const lat = parseFloat(results[0].lat);
                  const lon = parseFloat(results[0].lon);
                  
                  await firebase.updateServiceOrder(companyCnpj, os.id, {
                    latitude: lat,
                    longitude: lon
                  });
                  
                  sucessos++;
                } else {
                  erros++;
                }
              } catch (err) {
                erros++;
              }
              
              await new Promise(r => setTimeout(r, 1000));
            }
            
            const list = await firebase.listServiceOrders(companyCnpj);
            const comCoordenadas = list.filter(os => os.latitude && os.longitude);
            setOrdensServico(comCoordenadas);
            alert(`✅ Geocoding concluído!\n✅ Sucessos: ${sucessos}\n❌ Erros: ${erros}`);
          }}
          style={{
            background: theme.highlight,
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.7rem',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
        >
          📍 Localizar ({ordensServico.filter(os => !os.latitude || !os.longitude).length})
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Indicador de Prestadores em Tempo Real */}
          {prestadoresLocalizacao.length > 0 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              padding: '4px 8px',
              background: 'linear-gradient(135deg, #2C30D5 0%, #2563eb 100%)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              animation: 'pulse 2s infinite'
            }}>
              <span style={{ fontSize: '14px' }}>🚗</span>
              <span>{prestadoresLocalizacao.length} Online</span>
            </div>
          )}
          
          {/* Contador de OS no mapa */}
          <div style={{ 
            fontSize: '0.7rem', 
            color: theme.subtext, 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <span>📍</span>
            <span>{markers.length} OS</span>
          </div>
        </div>
      </div>

      {/* Mapa com Leaflet */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {(markers.length > 0 || prestadoresLocalizacao.length > 0) ? (
          <MapContainer 
            center={[-23.5505, -46.6333]} 
            zoom={14} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
              maxZoom={19}
            />
            
            {/* Marcadores de Ordens de Serviço */}
            {markers.map(m => (
              <OrderMarker key={`os-${m.id}`} marker={m} theme={theme} />
            ))}
            
            {/* Marcadores de Prestadores em Tempo Real */}
            {prestadoresLocalizacao.map((prestador, idx) => (
              <PrestadorMarker 
                key={`prestador-${prestador.prestadorId || idx}`} 
                prestador={prestador} 
                theme={theme} 
              />
            ))}
            
            <MapController markers={[...markers, ...prestadoresLocalizacao.map(p => ({ lat: p.latitude, lng: p.longitude }))]} />
          </MapContainer>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.subtext, fontSize: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📍</div>
              <div>Nenhuma ordem de serviço ou prestador encontrado</div>
              <div style={{ fontSize: '12px', marginTop: '8px' }}>Ajuste os filtros ou crie novas ordens</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 4px 12px currentColor; }
          50% { box-shadow: 0 4px 20px currentColor; }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Componente principal
export default function Dashboard() {
  const [ordensServico, setOrdensServico] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const companyCnpj = localStorage.getItem("companyCnpj") || "";

  // Carregar Ordens de Serviço do Firebase
  useEffect(() => {
    async function loadOrdensServico() {
      if (!companyCnpj) return;
      try {
        const list = await firebase.listServiceOrders(companyCnpj);
        console.log('📋 Ordens carregadas:', list.length);
        
        // Verificar quais têm coordenadas
        const comCoordenadas = list.filter(os => os.latitude && os.longitude);
        const semCoordenadas = list.filter(os => !os.latitude || !os.longitude);
        
        console.log(`✅ Com coordenadas: ${comCoordenadas.length}`);
        console.log(`❌ Sem coordenadas: ${semCoordenadas.length}`);
        
        if (semCoordenadas.length > 0) {
          console.log('Ordens sem coordenadas:', semCoordenadas.map(os => ({ id: os.id, cliente: os.cliente, endereco: os.endereco })));
        }
        
        setOrdensServico(comCoordenadas);
      } catch (err) {
        console.error('Erro ao carregar ordens de serviço:', err);
      }
    }
    loadOrdensServico();
    
    // Recarregar a cada 10 segundos para pegar novas OS
    const interval = setInterval(loadOrdensServico, 10000);
    return () => clearInterval(interval);
  }, [companyCnpj]);

  // Carregar avaliações de satisfação
  useEffect(() => {
    async function loadAvaliacoes() {
      if (!companyCnpj) return;
      try {
        const ratings = await firebase.getSatisfactionRatings(companyCnpj);
        console.log('⭐ Avaliações carregadas:', ratings.length);
        setAvaliacoes(ratings);
      } catch (err) {
        console.error('Erro ao carregar avaliações:', err);
      }
    }
    loadAvaliacoes();
    
    // Recarregar a cada 10 segundos para pegar novas avaliações
    const interval = setInterval(loadAvaliacoes, 10000);
    return () => clearInterval(interval);
  }, [companyCnpj]);

  // Estilo baseado no modo (claro/escuro)
  const theme = darkMode ? {
    bg: "#0f172a",
    cardBg: "#1e293b",
    text: "#f8fafc",
    subtext: "#cbd5e1",
    border: "#334155",
    highlight: "#2C30D5"
  } : {
    bg: "#f1f5f9",
    cardBg: "#ffffff",
    text: "#0f172a",
    subtext: "#64748b",
    border: "#e2e8f0",
    highlight: "#2C30D5"
  };

  return (
    <div style={{ 
      padding: "8px 12px", 
      fontFamily: "'Inter', system-ui, sans-serif", 
      background: theme.bg, 
      minHeight: "100vh",
      color: theme.text,
      transition: "all 0.3s ease"
    }}>
      {/* Cabeçalho */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 8,
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: "6px"
      }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "0", lineHeight: 1.3 }}>
            Dashboard
          </h1>
          <p style={{ color: theme.subtext, margin: 0, fontSize: "11px" }}>
            {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            style={{
              ...buttonStyle,
              backgroundColor: darkMode ? "#334155" : "#e2e8f0",
              color: darkMode ? "#f8fafc" : "#0f172a",
            }}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Modo Claro" : "Modo Escuro"}
          </button>
          <button style={{
            ...buttonStyle,
            backgroundColor: theme.highlight,
            color: "white"
          }}>
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Cards de métricas principais - Grid responsivo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8, marginBottom: 8 }}>
        <MetricCard 
          icon={<FiUsers size={26} />}
          title="Prestadores Ativos"
          value={new Set(ordensServico.filter(os => os.responsavel).map(os => os.responsavel)).size}
          subtitle={`${ordensServico.length} ordens gerenciadas`}
          theme={theme}
          gradient="linear-gradient(135deg, #2C30D5 0%, #889DD3 100%)"
        />
        <MetricCard 
          icon={<FiTruck size={26} />}
          title="Ordens Totais"
          value={ordensServico.length}
          subtitle={`${ordensServico.filter(os => os.status === 'Em andamento').length} em andamento agora`}
          theme={theme}
          gradient="linear-gradient(135deg, #889DD3 0%, #2C30D5 100%)"
        />
        <MetricCard 
          icon={<FiAlertCircle size={26} />}
          title="Ordens Pendentes"
          value={ordensServico.filter(os => os.status === 'Pendente').length}
          subtitle={`${ordensServico.filter(os => os.prioridade === 'Alta' && os.status === 'Pendente').length} de alta prioridade`}
          theme={theme}
          gradient="linear-gradient(135deg, #fbbf24 0%, #f97316 100%)"
          alert={ordensServico.filter(os => os.status === 'Pendente').length > 5}
        />
        <MetricCard 
          icon={<FiActivity size={26} />}
          title="Taxa de Conclusão"
          value={ordensServico.length > 0 ? Math.round((ordensServico.filter(os => os.status === 'Concluída').length / ordensServico.length) * 100) + "%" : "0%"}
          subtitle={`${ordensServico.filter(os => os.status === 'Concluída').length} ordens concluídas`}
          theme={theme}
          gradient="linear-gradient(135deg, #11A561 0%, #0d8550 100%)"
        />
      </div>

      {/* Cards de KPIs adicionais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 6, marginBottom: 8 }}>
        <MiniCard 
          icon="⏱️"
          title="Média de Tempo"
          value={useMemo(() => {
            const concluidas = ordensServico.filter(os => os.status === 'Concluída' && os.dataConclusao && os.dataAbertura);
            if (concluidas.length === 0) return 'N/A';
            const tempos = concluidas.map(os => {
              const inicio = new Date(os.dataAbertura);
              const fim = new Date(os.dataConclusao);
              return (fim - inicio) / (1000 * 60 * 60); // horas
            });
            const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;
            return `${media.toFixed(1)}h`;
          }, [ordensServico])}
          theme={theme}
        />
        <MiniCard 
          icon="🔥"
          title="Alta Prioridade"
          value={ordensServico.filter(os => os.prioridade === 'Alta').length}
          theme={theme}
          color="#ef4444"
        />
        <MiniCard 
          icon="⭐"
          title="Satisfação Média"
          value={useMemo(() => {
            if (avaliacoes.length === 0) return 'N/A';
            const media = avaliacoes.reduce((acc, a) => acc + (a.nota || 0), 0) / avaliacoes.length;
            return `${media.toFixed(1)}/10`;
          }, [avaliacoes])}
          theme={theme}
          color="#11A561"
        />
        <MiniCard 
          icon="📍"
          title="Com Localização"
          value={`${ordensServico.filter(os => os.latitude && os.longitude).length}/${ordensServico.length}`}
          theme={theme}
        />
        <MiniCard 
          icon="✅"
          title="Concluídas Hoje"
          value={useMemo(() => {
            const hoje = new Date().toDateString();
            return ordensServico.filter(os => {
              if (!os.dataConclusao) return false;
              return new Date(os.dataConclusao).toDateString() === hoje;
            }).length;
          }, [ordensServico])}
          theme={theme}
          color="#11A561"
        />
        <MiniCard 
          icon="🕐"
          title="Aguardando Peça"
          value={ordensServico.filter(os => os.status === 'Aguardando Peça').length}
          theme={theme}
          color="#f59e0b"
        />
      </div>

      {/* Gráficos e mapa */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 8 }}>
        {/* Mapa de Ordens de Serviço */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span>Ordens de Serviço no Mapa</span>
              {ordensServico && ordensServico.length > 0 && (
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  background: '#11A56120', 
                  color: '#11A561' 
                }}>
                  {ordensServico.length} OS
                </span>
              )}
            </div>
          }
          icon={<FiMap />} 
          gridSpan={8} 
          theme={theme}
        >
          <ServiceOrderMap 
            ordensServico={ordensServico}
            theme={theme}
            companyCnpj={companyCnpj}
            setOrdensServico={setOrdensServico}
          />
        </Card>

        {/* Seção lateral */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, gridColumn: "span 4" }}>
          {/* Top 5 Prestadores Mais Ativos */}
          <Card title="🏆 Top Prestadores" icon={<FiUsers />} theme={theme}>
            <div style={{ display: 'grid', gap: '4px' }}>
              {useMemo(() => {
                const prestadorStats = {};
                ordensServico.forEach(os => {
                  const nome = os.responsavel || 'Não atribuído';
                  if (!prestadorStats[nome]) {
                    prestadorStats[nome] = { total: 0, concluidas: 0 };
                  }
                  prestadorStats[nome].total++;
                  if (os.status === 'Concluída') {
                    prestadorStats[nome].concluidas++;
                  }
                });
                
                return Object.entries(prestadorStats)
                  .map(([nome, stats]) => ({
                    nome,
                    total: stats.total,
                    concluidas: stats.concluidas,
                    taxa: stats.total > 0 ? Math.round((stats.concluidas / stats.total) * 100) : 0
                  }))
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 5)
                  .map((prestador, idx) => (
                    <div key={idx} style={{
                      padding: '6px 8px',
                      background: darkMode ? "#0f172a" : "#f8fafc",
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: `1px solid ${theme.border}`
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${COLORS[idx % COLORS.length]}, ${COLORS[(idx + 1) % COLORS.length]})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '11px'
                      }}>
                        #{idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '11px', marginBottom: '2px', lineHeight: 1.2 }}>
                          {prestador.nome}
                        </div>
                        <div style={{ fontSize: '9px', color: theme.subtext, lineHeight: 1.2 }}>
                          {prestador.total} OS • {prestador.concluidas} OK • {prestador.taxa}%
                        </div>
                      </div>
                    </div>
                  ));
              }, [ordensServico, darkMode, theme])}
            </div>
          </Card>

          {/* Última Ordem de Serviço */}
          <Card title="Última Ordem de Serviço" icon={<FiMapPin />} theme={theme}>
            {/* Mostrando a ordem mais recente */}
            {(() => {
              const ultimaOS = ordensServico.length > 0 ? ordensServico[ordensServico.length - 1] : null;
              if (!ultimaOS) {
                return <div style={{ color: theme.subtext, textAlign: "center", padding: "20px" }}>Nenhuma ordem de serviço cadastrada</div>;
              }
              const prioridadeCor = ultimaOS.prioridade === 'Alta' ? '#ef4444' : ultimaOS.prioridade === 'Média' ? '#f59e0b' : '#11A561';
              return (
                <>
                  <div style={{ marginBottom: "8px" }}>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "14px", lineHeight: 1.3 }}>{ultimaOS.cliente}</h3>
                    <p style={{ margin: 0, color: theme.subtext, fontSize: "11px", lineHeight: 1.3 }}>{ultimaOS.endereco}, {ultimaOS.numero}</p>
                    <div style={{ 
                      display: "inline-block", 
                      background: prioridadeCor, 
                      color: "white", 
                      padding: "3px 8px", 
                      borderRadius: "8px", 
                      fontSize: "10px",
                      marginTop: "4px",
                      fontWeight: 600
                    }}>
                      {ultimaOS.prioridade}
                    </div>
                  </div>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "6px",
                    background: darkMode ? "#0f172a" : "#f8fafc",
                    padding: "6px 8px",
                    borderRadius: "6px"
                  }}>
                    <div>
                      <p style={{ margin: "0 0 2px 0", fontSize: "10px", color: theme.subtext, lineHeight: 1 }}>Status</p>
                      <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, lineHeight: 1.2 }}>{ultimaOS.status}</p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 2px 0", fontSize: "10px", color: theme.subtext, lineHeight: 1 }}>Responsável</p>
                      <p style={{ margin: 0, fontSize: "11px", lineHeight: 1.2 }}>{ultimaOS.responsavel || "Não atribuído"}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </Card>

          {/* Satisfação do cliente - Gráfico */}
          <Card title="Satisfação do Cliente" icon={<FiActivity />} theme={theme}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={useMemo(() => {
                // Agrupar avaliações por dia do mês atual
                const now = new Date();
                const mesAtual = now.getMonth() + 1;
                const anoAtual = now.getFullYear();
                
                const avaliacoesMes = (avaliacoes || []).filter(a => a.mes === mesAtual && a.ano === anoAtual);
                
                // Criar array com 30 dias
                const dados = [];
                for (let dia = 1; dia <= 30; dia++) {
                  const notas = avaliacoesMes.filter(a => {
                    const data = new Date(a.data);
                    return data.getDate() === dia;
                  }).map(a => a.nota);
                  
                  const media = notas.length > 0 ? (notas.reduce((a, b) => a + b, 0) / notas.length) * 10 : 0;
                  
                  dados.push({
                    name: `Dia ${dia}`,
                    satisfacao: parseFloat(media.toFixed(1))
                  });
                }
                
                // Retornar apenas os primeiros 15 dias para visibilidade
                return dados.slice(0, 15);
              }, [avaliacoes])}>
                <defs>
                  <linearGradient id="colorSatisfacao" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#11A561" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#11A561" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="name" stroke={theme.subtext} />
                <YAxis domain={[0, 10]} stroke={theme.subtext} />
                <Tooltip contentStyle={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }} formatter={(value) => `${value}/10`} />
                <Area 
                  type="monotone" 
                  dataKey="satisfacao" 
                  stroke="#11A561" 
                  fillOpacity={1} 
                  fill="url(#colorSatisfacao)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              marginTop: "12px",
              background: darkMode ? "#0f172a" : "#f8fafc",
              padding: "12px",
              borderRadius: "8px"
            }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: theme.subtext }}>Média de Satisfação (Este Mês)</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: 600, color: "#11A561" }}>
                  {useMemo(() => {
                    const now = new Date();
                    const mesAtual = now.getMonth() + 1;
                    const anoAtual = now.getFullYear();
                    const avaliacoesMes = (avaliacoes || []).filter(a => a.mes === mesAtual && a.ano === anoAtual);
                    
                    if (avaliacoesMes.length === 0) return '0/10';
                    
                    const media = avaliacoesMes.reduce((acc, a) => acc + (a.nota || 0), 0) / avaliacoesMes.length;
                    return `${media.toFixed(1)}/10`;
                  }, [avaliacoes])}
                </p>
              </div>
            </div>
          </Card>

          {/* Solicitar Avaliação - Enviar pergunta ao cliente */}
          <Card title="Solicitar Avaliação de Satisfação" icon={<FiActivity />} theme={theme}>
            {(() => {
              const ultimaOS = ordensServico.length > 0 ? ordensServico[ordensServico.length - 1] : null;
              if (!ultimaOS) {
                return <div style={{ color: theme.subtext, textAlign: "center", padding: "20px" }}>Nenhuma ordem de serviço para avaliar</div>;
              }
              
              return (
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ padding: '12px', background: darkMode ? "#0f172a" : "#f8fafc", borderRadius: '8px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: theme.subtext }}>Solicitando avaliação para:</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: theme.text }}>{ultimaOS.cliente}</p>
                  </div>
                  
                  <button
                    onClick={async () => {
                      if (!ultimaOS.telefone) {
                        alert('❌ Telefone do cliente não informado');
                        return;
                      }
                      
                      try {
                        const mensagem = `Vc esta satisfeito com o serviço? Entre 0 a 10 qual o nivel que vc nos da por favor?\n\nOrdem de Serviço: #${ultimaOS.id}\nCliente: ${ultimaOS.cliente}`;
                        
                        await firebase.sendWhatsAppMessage(
                          companyCnpj,
                          ultimaOS.telefone,
                          mensagem
                        );
                        alert('✅ Pergunta de satisfação enviada com sucesso!');
                      } catch (err) {
                        alert(`❌ Erro ao enviar: ${err.message}`);
                      }
                    }}
                    style={{
                      padding: '14px',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#2C30D5',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                    }}
                    onMouseOver={e => e.target.style.opacity = '0.8'}
                    onMouseOut={e => e.target.style.opacity = '1'}
                  >
                    📱 Solicitar Avaliação via WhatsApp (0-10)
                  </button>
                </div>
              );
            })()}
          </Card>
        </div>
      </div>

      {/* Gráficos de análise */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 8, marginTop: 8 }}>
        {/* Distribuição por Status - Dados Reais */}
        <Card title="📊 Distribuição por Status" icon={<FiPieChart />} gridSpan={4} theme={theme}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie 
                data={useMemo(() => {
                  const statusCount = {};
                  ordensServico.forEach(os => {
                    const status = os.status || 'Não definido';
                    statusCount[status] = (statusCount[status] || 0) + 1;
                  });
                  return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
                }, [ordensServico])} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={70}
                innerRadius={45}
                paddingAngle={2}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ 
            marginTop: 6, 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: 4,
            fontSize: '10px'
          }}>
            {useMemo(() => {
              const statusCount = {};
              ordensServico.forEach(os => {
                const status = os.status || 'Não definido';
                statusCount[status] = (statusCount[status] || 0) + 1;
              });
              return Object.entries(statusCount).map(([status, count], idx) => (
                <div key={status} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 4,
                  padding: '3px 6px',
                  background: darkMode ? "#0f172a" : "#f8fafc",
                  borderRadius: '4px'
                }}>
                  <div style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    background: COLORS[idx % COLORS.length] 
                  }} />
                  <span style={{ color: theme.text, fontWeight: 600 }}>{count}</span>
                  <span style={{ color: theme.subtext }}>{status}</span>
                </div>
              ));
            }, [ordensServico, darkMode, theme])}
          </div>
        </Card>

        {/* Ordens nos Últimos 7 Dias - Dados Reais */}
        <Card title="📈 Ordens nos Últimos 7 Dias" icon={<FiBarChart2 />} gridSpan={4} theme={theme}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={useMemo(() => {
              const hoje = new Date();
              const ultimos7Dias = [];
              
              for (let i = 6; i >= 0; i--) {
                const data = new Date(hoje);
                data.setDate(hoje.getDate() - i);
                const dataStr = data.toDateString();
                
                const ordensNoDia = ordensServico.filter(os => {
                  if (!os.dataAbertura) return false;
                  return new Date(os.dataAbertura).toDateString() === dataStr;
                }).length;
                
                ultimos7Dias.push({
                  name: format(data, 'dd/MM', { locale: ptBR }),
                  ordens: ordensNoDia
                });
              }
              
              return ultimos7Dias;
            }, [ordensServico])}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis dataKey="name" stroke={theme.subtext} style={{ fontSize: '10px' }} />
              <YAxis stroke={theme.subtext} style={{ fontSize: '10px' }} />
              <Tooltip contentStyle={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text, fontSize: '11px' }} />
              <Bar dataKey="ordens" name="Ordens Abertas" fill="#2C30D5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Ordens por Prioridade */}
        <Card title="🔥 Ordens por Prioridade" icon={<FiCalendar />} gridSpan={4} theme={theme}>
          <div style={{ display: 'grid', gap: '6px', paddingTop: '6px' }}>
            {useMemo(() => {
              const prioridades = ['Alta', 'Média', 'Baixa'];
              const cores = { 'Alta': '#ef4444', 'Média': '#f59e0b', 'Baixa': '#11A561' };
              const icons = { 'Alta': '🔴', 'Média': '🟡', 'Baixa': '🟢' };
              
              return prioridades.map(prioridade => {
                const total = ordensServico.filter(os => os.prioridade === prioridade).length;
                const pendentes = ordensServico.filter(os => os.prioridade === prioridade && os.status === 'Pendente').length;
                const emAndamento = ordensServico.filter(os => os.prioridade === prioridade && os.status === 'Em andamento').length;
                const porcentagem = ordensServico.length > 0 ? (total / ordensServico.length) * 100 : 0;
                
                return (
                  <div key={prioridade} style={{
                    padding: '8px 10px',
                    background: darkMode ? "#0f172a" : "#f8fafc",
                    borderRadius: '8px',
                    border: `2px solid ${cores[prioridade]}20`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '16px' }}>{icons[prioridade]}</span>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: theme.text }}>
                          {prioridade}
                        </span>
                      </div>
                      <span style={{ 
                        fontWeight: 800, 
                        fontSize: '20px', 
                        color: cores[prioridade]
                      }}>
                        {total}
                      </span>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: darkMode ? "#1e293b" : "#e2e8f0",
                      borderRadius: '3px',
                      overflow: 'hidden',
                      marginBottom: '4px'
                    }}>
                      <div style={{
                        width: `${porcentagem}%`,
                        height: '100%',
                        background: cores[prioridade],
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '9px',
                      color: theme.subtext
                    }}>
                      <span>⏳ {pendentes}</span>
                      <span>🔄 {emAndamento}</span>
                    </div>
                  </div>
                );
              });
            }, [ordensServico, darkMode, theme])}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Componente de Card
function Card({ title, children, icon, gridSpan = 1, theme }) {
  return (
    <div style={{
      background: theme.cardBg,
      padding: 12,
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      transition: "all 0.3s ease",
      gridColumn: `span ${gridSpan}`,
      border: `1px solid ${theme.border}`,
      height: "fit-content",
      position: "relative",
      overflow: "hidden"
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
      e.currentTarget.style.transform = "translateY(0)";
    }}>
      {/* Borda superior decorativa com gradiente */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        background: "linear-gradient(90deg, #2C30D5, #889DD3, #ec4899, #f59e0b)",
        backgroundSize: "200% 100%",
        animation: "gradientShift 3s ease infinite"
      }} />
      
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: 8, paddingTop: "2px" }}>
        {icon && <div style={{ color: theme.highlight, fontSize: "16px" }}>{icon}</div>}
        <h2 style={{ fontSize: "14px", margin: 0, fontWeight: 700, color: theme.text, lineHeight: 1.3 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// Componente de Card de Métrica - Visual aprimorado
function MetricCard({ icon, title, value, subtitle, theme, gradient, alert = false }) {
  return (
    <div style={{
      background: gradient || theme.cardBg,
      padding: "12px",
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      transition: "all 0.3s ease",
      border: alert ? `2px solid #ef4444` : `1px solid ${theme.border}`,
      position: "relative",
      overflow: "hidden",
      cursor: "pointer",
      transform: "translateY(0)"
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
    }}>
      {/* Decoração de fundo */}
      <div style={{
        position: "absolute",
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: gradient ? "rgba(255,255,255,0.15)" : theme.border,
        filter: "blur(40px)"
      }} />
      
      {/* Ícone */}
      <div style={{ 
        display: "inline-flex",
        backgroundColor: gradient ? "rgba(255,255,255,0.25)" : theme.bg,
        padding: "8px", 
        borderRadius: "10px",
        color: gradient ? "white" : theme.highlight,
        marginBottom: "6px",
        boxShadow: gradient ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
      }}>
        {icon}
      </div>
      
      {/* Conteúdo */}
      <div>
        <h3 style={{ 
          fontSize: "28px", 
          margin: "0 0 2px 0", 
          fontWeight: 800, 
          color: gradient ? "white" : theme.text,
          letterSpacing: "-0.5px",
          lineHeight: 1
        }}>
          {value}
        </h3>
        <p style={{ 
          margin: "0 0 2px 0", 
          color: gradient ? "rgba(255,255,255,0.95)" : theme.text, 
          fontSize: "13px",
          fontWeight: 600,
          lineHeight: 1.2
        }}>
          {title}
        </p>
        <p style={{ 
          margin: 0, 
          color: gradient ? "rgba(255,255,255,0.75)" : theme.subtext, 
          fontSize: "10px",
          fontWeight: 500,
          lineHeight: 1.2
        }}>
          {subtitle}
        </p>
      </div>
      
      {/* Badge de alerta */}
      {alert && (
        <div style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "#ef4444",
          color: "white",
          padding: "3px 8px",
          borderRadius: "10px",
          fontSize: "10px",
          fontWeight: 700,
          animation: "pulse 2s infinite"
        }}>
          ⚠️ ATENÇÃO
        </div>
      )}
    </div>
  );
}

// Componente de Mini Card para KPIs secundários
function MiniCard({ icon, title, value, theme, color }) {
  return (
    <div style={{
      background: theme.cardBg,
      padding: "8px 10px",
      borderRadius: 10,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      transition: "all 0.2s ease",
      border: `1px solid ${theme.border}`,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
    }}>
      <div style={{
        fontSize: "20px",
        lineHeight: 1
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: "9px", 
          color: theme.subtext, 
          marginBottom: "2px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          lineHeight: 1
        }}>
          {title}
        </div>
        <div style={{ 
          fontSize: "18px", 
          fontWeight: 700, 
          color: color || theme.text,
          letterSpacing: "-0.5px",
          lineHeight: 1
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// Estilo para botões
const buttonStyle = {
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: "4px",
  transition: "all 0.2s ease"
};
