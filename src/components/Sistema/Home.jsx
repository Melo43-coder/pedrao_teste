import React, { useEffect, useState, useMemo } from "react";
import {
  PieChart, Pie, Tooltip, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { FiUsers, FiTruck, FiAlertCircle, FiCalendar, FiBarChart2, FiPieChart, FiMap, FiActivity } from "react-icons/fi";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

// Importar imagens para ícones personalizados
// Você precisará criar esses arquivos na pasta public/assets/icons/
const carIconUrl = "/assets/icons/car.png";
const personIconUrl = "/assets/icons/user.png";

// Configuração dos ícones personalizados
const createCustomIcon = (url, size, className) => {
  return L.icon({
    iconUrl: url,
    iconSize: size,
    iconAnchor: [size[0]/2, size[1]],
    popupAnchor: [0, -size[1]],
    className: className
  });
};

// Dados simulados
const pieData = [
  { name: "Manutenção", value: 420 },
  { name: "Instalação", value: 380 },
  { name: "Consultoria", value: 290 },
  { name: "Suporte", value: 210 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

const barData = [
  { name: "Jan", receita: 42000, despesas: 28400, lucro: 13600 },
  { name: "Fev", receita: 38000, despesas: 22398, lucro: 15602 },
  { name: "Mar", receita: 52000, despesas: 29800, lucro: 22200 },
  { name: "Abr", receita: 47800, despesas: 25908, lucro: 21892 },
  { name: "Mai", receita: 55000, despesas: 31200, lucro: 23800 },
  { name: "Jun", receita: 58000, despesas: 33500, lucro: 24500 },
];

const growthData = [
  { name: "Jan", servicos: 100, meta: 95 },
  { name: "Fev", servicos: 120, meta: 115 },
  { name: "Mar", servicos: 180, meta: 140 },
  { name: "Abr", servicos: 240, meta: 180 },
  { name: "Mai", servicos: 280, meta: 220 },
  { name: "Jun", servicos: 320, meta: 260 },
];

const satisfacaoData = [
  { name: "Jan", satisfacao: 92 },
  { name: "Fev", satisfacao: 89 },
  { name: "Mar", satisfacao: 93 },
  { name: "Abr", satisfacao: 95 },
  { name: "Mai", satisfacao: 97 },
  { name: "Jun", satisfacao: 98 },
];

// Dados de técnicos (funcionários)
const initialTecnicos = [
  { id: 1, nome: "João Silva", cargo: "Técnico Sênior", lat: -23.5505, lng: -46.6333, tarefas: 12, veiculo: "Ford Ka - ABC-1234", status: "Em atendimento", cliente: "Empresa ABC", foto: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, nome: "Maria Oliveira", cargo: "Técnica Pleno", lat: -23.5485, lng: -46.6383, tarefas: 18, veiculo: "Honda CG - XYZ-9876", status: "Em deslocamento", cliente: "Empresa XYZ", foto: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 3, nome: "Carlos Santos", cargo: "Técnico Sênior", lat: -23.5520, lng: -46.6300, tarefas: 22, veiculo: "Fiat Uno - DEF-5678", status: "Em atendimento", cliente: "Empresa 123", foto: "https://randomuser.me/api/portraits/men/22.jpg" },
  { id: 4, nome: "Ana Pereira", cargo: "Técnica Júnior", lat: -23.5550, lng: -46.6400, tarefas: 9, veiculo: "Yamaha Factor - QWE-4321", status: "Disponível", cliente: "", foto: "https://randomuser.me/api/portraits/women/28.jpg" },
  { id: 5, nome: "Roberto Alves", cargo: "Técnico Pleno", lat: -23.5600, lng: -46.6350, tarefas: 15, veiculo: "VW Gol - GHI-7890", status: "Em deslocamento", cliente: "Empresa DEF", foto: "https://randomuser.me/api/portraits/men/45.jpg" },
  { id: 6, nome: "Juliana Costa", cargo: "Técnica Sênior", lat: -23.5450, lng: -46.6280, tarefas: 20, veiculo: "Chevrolet Onix - JKL-1234", status: "Em atendimento", cliente: "Empresa GHI", foto: "https://randomuser.me/api/portraits/women/15.jpg" },
];

// Dados de clientes
const initialClientes = [
  { id: 1, nome: "Empresa ABC", lat: -23.5515, lng: -46.6343, tipo: "cliente", endereco: "Av. Paulista, 1000", telefone: "(11) 3456-7890" },
  { id: 2, nome: "Empresa XYZ", lat: -23.5475, lng: -46.6373, tipo: "cliente", endereco: "Rua Augusta, 500", telefone: "(11) 2345-6789" },
  { id: 3, nome: "Empresa 123", lat: -23.5530, lng: -46.6310, tipo: "cliente", endereco: "Av. Rebouças, 750", telefone: "(11) 3456-7890" },
  { id: 4, nome: "Empresa DEF", lat: -23.5610, lng: -46.6360, tipo: "cliente", endereco: "Rua Oscar Freire, 200", telefone: "(11) 4567-8901" },
  { id: 5, nome: "Empresa GHI", lat: -23.5440, lng: -46.6270, tipo: "cliente", endereco: "Av. Brigadeiro Faria Lima, 3500", telefone: "(11) 5678-9012" },
];

// Componente do Mapa
const TechnicianMap = ({ tecnicos, clientes, showDensity, theme }) => {
  const [carIcon, setCarIcon] = useState(null);
  const [clientIcon, setClientIcon] = useState(null);
  
  useEffect(() => {
    // Criar ícones personalizados quando o componente montar
    setCarIcon(createCustomIcon(carIconUrl, [32, 32], 'car-icon'));
    setClientIcon(createCustomIcon(personIconUrl, [40, 40], 'client-icon-highlighted'));
  }, []);
  
  if (!carIcon || !clientIcon) {
    return (
      <div style={{ 
        height: 500, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: theme.bg,
        borderRadius: "8px"
      }}>
        <div style={{ textAlign: "center" }}>
          <div className="loading-spinner"></div>
          <p>Carregando mapa...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ height: 500, position: "relative" }}>
      <div style={{ 
        position: "absolute", 
        right: 10, 
        top: 10, 
        zIndex: 1000, 
        background: theme.cardBg, 
        padding: "8px 12px", 
        borderRadius: 8,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ 
              width: "16px", 
              height: "16px", 
              backgroundImage: `url(${carIconUrl})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat"
            }}></div>
            <span style={{ fontSize: "13px" }}>Técnicos</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ 
              width: "16px", 
              height: "16px", 
              backgroundImage: `url(${personIconUrl})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat"
            }}></div>
            <span style={{ fontSize: "13px" }}>Clientes</span>
          </div>
        </div>
      </div>
      
      <MapContainer center={[-23.5505, -46.6333]} zoom={14} style={{ height: "100%", width: "100%", borderRadius: "8px" }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marcadores de técnicos (carros) */}
        {tecnicos.map((t) => (
          <Marker
            key={`tecnico-${t.id}`}
            position={[t.lat, t.lng]}
            icon={carIcon}
          >
            <Popup className="custom-popup">
              <div style={{ padding: "4px", minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <img 
                    src={t.foto} 
                    alt={t.nome} 
                    style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} 
                  />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px" }}>{t.nome}</h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{t.cargo}</p>
                  </div>
                </div>
                <div style={{ fontSize: "13px" }}>
                  <p style={{ margin: "4px 0" }}><strong>Status:</strong> <span style={{ 
                    color: t.status === "Em atendimento" ? "#10b981" : t.status === "Em deslocamento" ? "#f59e0b" : "#3b82f6",
                    fontWeight: 500
                  }}>{t.status}</span></p>
                  <p style={{ margin: "4px 0" }}><strong>Veículo:</strong> {t.veiculo}</p>
                  <p style={{ margin: "4px 0" }}><strong>Tarefas concluídas:</strong> {t.tarefas}</p>
                  {t.cliente && <p style={{ margin: "4px 0" }}><strong>Cliente atual:</strong> {t.cliente}</p>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Marcadores de clientes (pessoas destacadas) */}
        {clientes.map((c) => (
          <Marker
            key={`cliente-${c.id}`}
            position={[c.lat, c.lng]}
            icon={clientIcon}
            zIndexOffset={1000} // Garante que os clientes fiquem acima dos técnicos
          >
            <Popup className="custom-popup client-popup">
              <div style={{ padding: "4px", minWidth: "200px" }}>
                <div style={{ 
                  backgroundColor: "#8b5cf6", 
                  padding: "10px", 
                  margin: "-12px -12px 10px -12px", 
                  borderRadius: "4px 4px 0 0",
                  color: "white"
                }}>
                  <h3 style={{ margin: 0, fontSize: "16px" }}>{c.nome}</h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", opacity: 0.9 }}>Cliente</p>
                </div>
                <div style={{ fontSize: "13px" }}>
                  <p style={{ margin: "4px 0" }}><strong>Endereço:</strong> {c.endereco}</p>
                  <p style={{ margin: "4px 0" }}><strong>Telefone:</strong> {c.telefone}</p>
                </div>
                <div style={{ 
                  display: "flex", 
                  gap: "8px", 
                  marginTop: "10px" 
                }}>
                  <button style={{
                    backgroundColor: "#8b5cf6",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}>
                    Ver Detalhes
                  </button>
                  <button style={{
                    backgroundColor: "#f1f5f9",
                    color: "#334155",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}>
                    Criar OS
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Círculos de densidade (opcional) */}
        {showDensity && tecnicos.map((t) => (
          <div 
            key={`density-${t.id}`}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: t.tarefas * 4,
              height: t.tarefas * 4,
              borderRadius: "50%",
              backgroundColor: t.status === "Em atendimento" ? "rgba(16, 185, 129, 0.15)" : 
                              t.status === "Em deslocamento" ? "rgba(245, 158, 11, 0.15)" : 
                              "rgba(59, 130, 246, 0.15)",
              transform: `translate(${t.lat}px, ${t.lng}px)`,
              transition: "all 0.5s ease"
            }}
          />
        ))}
      </MapContainer>
      
      {/* Adicione CSS para estilizar os ícones */}
      <style jsx>{`
        .car-icon {
          filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
        }
        
        .client-icon-highlighted {
          filter: drop-shadow(0 0 5px rgba(139, 92, 246, 0.8));
          transform: scale(1.1);
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 3px 14px rgba(0, 0, 0, 0.2);
        }
        
        .client-popup .leaflet-popup-content-wrapper {
          border: 2px solid #8b5cf6;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #3b82f6;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Componente principal
export default function Dashboard() {
  const [tecnicos, setTecnicos] = useState(initialTecnicos);
  const [clientes] = useState(initialClientes);
  const [showDensity, setShowDensity] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentDate] = useState(new Date());

  // Movimento aleatório dos técnicos para simular deslocamento
  useEffect(() => {
    const interval = setInterval(() => {
      setTecnicos(prev => prev.map(t => ({
        ...t,
        lat: t.lat + (Math.random() - 0.5) * 0.002,
        lng: t.lng + (Math.random() - 0.5) * 0.002,
        tarefas: Math.max(5, Math.min(30, t.tarefas + Math.floor(Math.random() * 3) - 1))
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Estilo baseado no modo (claro/escuro)
  const theme = darkMode ? {
    bg: "#0f172a",
    cardBg: "#1e293b",
    text: "#f8fafc",
    subtext: "#cbd5e1",
    border: "#334155",
    highlight: "#3b82f6"
  } : {
    bg: "#f1f5f9",
    cardBg: "#ffffff",
    text: "#0f172a",
    subtext: "#64748b",
    border: "#e2e8f0",
    highlight: "#3b82f6"
  };

  return (
    <div style={{ 
      padding: "24px", 
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
        marginBottom: 32,
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: "16px"
      }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "4px" }}>
            SmartOps Pro
            <span style={{ 
              backgroundColor: theme.highlight, 
              color: "white", 
              fontSize: "12px", 
              padding: "3px 8px", 
              borderRadius: "12px", 
              marginLeft: "12px", 
              verticalAlign: "middle" 
            }}>
              DASHBOARD
            </span>
          </h1>
          <p style={{ color: theme.subtext, margin: 0 }}>
            {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
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

      {/* Cards de métricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 24 }}>
        <MetricCard 
          icon={<FiUsers size={24} />}
          title="Técnicos Ativos"
          value={tecnicos.length}
          change="+2"
          theme={theme}
        />
        <MetricCard 
          icon={<FiTruck size={24} />}
          title="Atendimentos Hoje"
          value={Math.floor(tecnicos.reduce((sum, t) => sum + t.tarefas, 0) * 0.65)}
          change="+12%"
          theme={theme}
        />
        <MetricCard 
          icon={<FiAlertCircle size={24} />}
          title="Chamados Pendentes"
          value={Math.floor(tecnicos.reduce((sum, t) => sum + t.tarefas, 0) * 0.35)}
          change="-5%"
          theme={theme}
          isNegative={false}
        />
        <MetricCard 
          icon={<FiActivity size={24} />}
          title="Tempo Médio"
          value="45 min"
          change="-8%"
          theme={theme}
          isNegative={false}
        />
      </div>

      {/* Gráficos e mapa */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>
        {/* Mapa de localização em tempo real */}
        <Card title="Localização em Tempo Real" icon={<FiMap />} gridSpan={8} theme={theme}>
          <TechnicianMap 
            tecnicos={tecnicos} 
            clientes={clientes} 
            showDensity={showDensity} 
            theme={theme} 
          />
        </Card>

        {/* Seção lateral */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, gridColumn: "span 4" }}>
          {/* Técnico destaque */}
          <Card title="Técnico Destaque" icon={<FiUsers />} theme={theme}>
            {/* Encontrando o técnico com mais tarefas */}
            {(() => {
              const tecnicoMaisAtivo = tecnicos.reduce((a, b) => (a.tarefas > b.tarefas ? a : b));
              return (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                    <img 
                      src={tecnicoMaisAtivo.foto} 
                      alt={tecnicoMaisAtivo.nome} 
                      style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover" }} 
                    />
                    <div>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "18px" }}>{tecnicoMaisAtivo.nome}</h3>
                      <p style={{ margin: 0, color: theme.subtext }}>{tecnicoMaisAtivo.cargo}</p>
                      <div style={{ 
                        display: "inline-block", 
                        background: "#10b981", 
                        color: "white", 
                        padding: "2px 8px", 
                        borderRadius: "12px", 
                        fontSize: "12px",
                        marginTop: "6px" 
                      }}>
                        {tecnicoMaisAtivo.status}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "12px",
                    background: darkMode ? "#0f172a" : "#f8fafc",
                    padding: "12px",
                    borderRadius: "8px"
                  }}>
                    <div>
                      <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: theme.subtext }}>Tarefas Concluídas</p>
                      <p style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>{tecnicoMaisAtivo.tarefas}</p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: theme.subtext }}>Cliente Atual</p>
                      <p style={{ margin: 0, fontSize: "14px" }}>{tecnicoMaisAtivo.cliente || "Disponível"}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </Card>

          {/* Satisfação do cliente */}
          <Card title="Satisfação do Cliente" icon={<FiActivity />} theme={theme}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={satisfacaoData}>
                <defs>
                  <linearGradient id="colorSatisfacao" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="name" stroke={theme.subtext} />
                <YAxis domain={[80, 100]} stroke={theme.subtext} />
                <Tooltip contentStyle={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }} />
                <Area 
                  type="monotone" 
                  dataKey="satisfacao" 
                  stroke="#10b981" 
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
                <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: theme.subtext }}>Média de Satisfação</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: 600, color: "#10b981" }}>94%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Distribuição de serviços */}
        <Card title="Distribuição de Serviços" icon={<FiPieChart />} gridSpan={4} theme={theme}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie 
                data={pieData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Crescimento de serviços */}
        <Card title="Crescimento de Serviços" icon={<FiBarChart2 />} gridSpan={4} theme={theme}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis dataKey="name" stroke={theme.subtext} />
              <YAxis stroke={theme.subtext} />
              <Tooltip contentStyle={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="servicos" 
                name="Serviços Realizados"
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 6, strokeWidth: 2, fill: theme.cardBg }} 
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="meta" 
                name="Meta Mensal"
                stroke="#f59e0b" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 4, strokeWidth: 2, fill: theme.cardBg }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

                {/* Desempenho financeiro */}
        <Card title="Desempenho Financeiro" icon={<FiCalendar />} gridSpan={4} theme={theme}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis dataKey="name" stroke={theme.subtext} />
              <YAxis stroke={theme.subtext} />
              <Tooltip contentStyle={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }} />
              <Legend />
              <Bar dataKey="receita" name="Receita" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lucro" name="Lucro" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
      padding: 24,
      borderRadius: 16,
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      transition: "all 0.3s ease",
      gridColumn: `span ${gridSpan}`,
      border: `1px solid ${theme.border}`,
      height: "fit-content"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: 16 }}>
        {icon && <div style={{ color: theme.highlight }}>{icon}</div>}
        <h2 style={{ fontSize: "18px", margin: 0, fontWeight: 600, color: theme.text }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// Componente de Card de Métrica
function MetricCard({ icon, title, value, change, theme, isNegative = true }) {
  return (
    <div style={{
      background: theme.cardBg,
      padding: "20px",
      borderRadius: 16,
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      transition: "all 0.3s ease",
      border: `1px solid ${theme.border}`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{ 
          backgroundColor: theme.bg === "#0f172a" ? "#334155" : "#f1f5f9", 
          padding: "10px", 
          borderRadius: "12px",
          color: theme.highlight
        }}>
          {icon}
        </div>
        <div style={{ 
          backgroundColor: isNegative ? "#dcfce7" : "#fee2e2", 
          color: isNegative ? "#10b981" : "#ef4444", 
          padding: "4px 8px", 
          borderRadius: "12px", 
          fontSize: "13px", 
          fontWeight: 500 
        }}>
          {change}
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: "28px", margin: "0 0 4px 0", fontWeight: 700, color: theme.text }}>{value}</h3>
        <p style={{ margin: 0, color: theme.subtext, fontSize: "14px" }}>{title}</p>
      </div>
    </div>
  );
}

// Estilo para botões
const buttonStyle = {
  border: "none",
  padding: "10px 16px",
  borderRadius: 10,
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s ease"
};