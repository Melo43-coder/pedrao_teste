/**
 * TESTE DE RESPONSIVIDADE - Copie este componente para testar
 * 
 * Uso:
 * 1. Crie um novo arquivo: src/components/Sistema/TesteResponsividade.jsx
 * 2. Cole este código
 * 3. Importe em Dashboard.jsx e adicione à rota
 * 4. Abra o navegador e redimensione a tela
 */

import React from 'react';
import { useResponsive, ResponsiveGrid, ResponsiveTable, ResponsiveModal } from '../Responsive';
import '../../styles/responsive.css';
import '../../styles/sistema.css';

export default function TesteResponsividade() {
  const { isMobile, isTablet, isDesktop, width, height, isLandscape } = useResponsive();
  const [modalOpen, setModalOpen] = React.useState(false);

  const mockData = [
    { id: 1, nome: 'João Silva', email: 'joao@email.com', status: 'Ativo' },
    { id: 2, nome: 'Maria Santos', email: 'maria@email.com', status: 'Ativo' },
    { id: 3, nome: 'Pedro Costa', email: 'pedro@email.com', status: 'Inativo' },
  ];

  const tableHeaders = ['Nome', 'Email', 'Status'];
  const tableRows = mockData.map(d => [d.nome, d.email, d.status]);

  return (
    <div style={{ padding: isMobile ? 8 : 16, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: isMobile ? 12 : 16,
        borderRadius: 8,
        marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: isMobile ? 18 : 24, margin: 0 }}>
          🧪 Teste de Responsividade
        </h1>
      </div>

      {/* Info da tela */}
      <div style={{
        backgroundColor: 'white',
        padding: isMobile ? 12 : 16,
        borderRadius: 8,
        marginBottom: 16,
        fontSize: isMobile ? 11 : 13,
        fontFamily: 'monospace'
      }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Resolução:</strong> {width}px × {height}px
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Device:</strong> {isMobile ? '📱 Mobile' : isTablet ? '📱 Tablet' : '💻 Desktop'}
        </div>
        <div>
          <strong>Orientação:</strong> {isLandscape ? '🔄 Landscape' : '📱 Portrait'}
        </div>
      </div>

      {/* Status responsividade */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gap: isMobile ? 8 : 12,
        marginBottom: 16
      }}>
        <div style={{
          backgroundColor: isMobile ? '#dbeafe' : '#e0e7ff',
          padding: isMobile ? 10 : 12,
          borderRadius: 6,
          textAlign: 'center',
          fontSize: isMobile ? 11 : 12
        }}>
          <div style={{ fontWeight: 'bold' }}>📱 Mobile</div>
          <div style={{ marginTop: 4 }}>
            {isMobile ? '✅ Ativo' : '⚫ Inativo'}
          </div>
        </div>

        <div style={{
          backgroundColor: isTablet ? '#dbeafe' : '#e0e7ff',
          padding: isMobile ? 10 : 12,
          borderRadius: 6,
          textAlign: 'center',
          fontSize: isMobile ? 11 : 12
        }}>
          <div style={{ fontWeight: 'bold' }}>📱 Tablet</div>
          <div style={{ marginTop: 4 }}>
            {isTablet ? '✅ Ativo' : '⚫ Inativo'}
          </div>
        </div>

        <div style={{
          backgroundColor: isDesktop ? '#dbeafe' : '#e0e7ff',
          padding: isMobile ? 10 : 12,
          borderRadius: 6,
          textAlign: 'center',
          fontSize: isMobile ? 11 : 12,
          gridColumn: isMobile ? 'auto' : 'auto'
        }}>
          <div style={{ fontWeight: 'bold' }}>💻 Desktop</div>
          <div style={{ marginTop: 4 }}>
            {isDesktop ? '✅ Ativo' : '⚫ Inativo'}
          </div>
        </div>
      </div>

      {/* Grid Responsivo */}
      <div style={{
        backgroundColor: 'white',
        padding: isMobile ? 12 : 16,
        borderRadius: 8,
        marginBottom: 16
      }}>
        <h2 style={{ fontSize: isMobile ? 14 : 16, marginTop: 0 }}>📊 Grid Responsivo</h2>
        <ResponsiveGrid
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap={isMobile ? 8 : 12}
        >
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              style={{
                backgroundColor: '#f3f4f6',
                padding: isMobile ? 12 : 16,
                borderRadius: 6,
                textAlign: 'center',
                border: '2px dashed #d1d5db'
              }}
            >
              <div style={{ fontSize: isMobile ? 24 : 28 }}>📦</div>
              <div style={{ fontSize: isMobile ? 11 : 12, marginTop: 4 }}>Card {i}</div>
            </div>
          ))}
        </ResponsiveGrid>
      </div>

      {/* Tabela Responsiva */}
      <div style={{
        backgroundColor: 'white',
        padding: isMobile ? 12 : 16,
        borderRadius: 8,
        marginBottom: 16
      }}>
        <h2 style={{ fontSize: isMobile ? 14 : 16, marginTop: 0 }}>📋 Tabela Responsiva</h2>
        <ResponsiveTable
          headers={tableHeaders}
          rows={tableRows}
        />
      </div>

      {/* Modal */}
      <div style={{
        backgroundColor: 'white',
        padding: isMobile ? 12 : 16,
        borderRadius: 8,
        marginBottom: 16,
        textAlign: 'center'
      }}>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: isMobile ? 8 : 12,
            minHeight: 44,
            minWidth: 44,
            backgroundColor: '#2C30D5',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: isMobile ? 11 : 12,
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Abrir Modal Responsivo
        </button>
      </div>

      <ResponsiveModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal Responsivo"
      >
        <p style={{ fontSize: isMobile ? 12 : 14 }}>
          Este modal se adapta automaticamente ao tamanho da tela!
        </p>
        <p style={{ fontSize: isMobile ? 12 : 14 }}>
          Tente redimensionar a janela e veja como ele se comporta.
        </p>
        <button
          onClick={() => setModalOpen(false)}
          style={{
            width: '100%',
            padding: 10,
            minHeight: 44,
            backgroundColor: '#2C30D5',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 12,
            cursor: 'pointer',
            fontWeight: 500,
            marginTop: 12
          }}
        >
          Fechar
        </button>
      </ResponsiveModal>

      {/* Componentes Responsivos */}
      <div style={{
        backgroundColor: 'white',
        padding: isMobile ? 12 : 16,
        borderRadius: 8,
        marginBottom: 16
      }}>
        <h2 style={{ fontSize: isMobile ? 14 : 16, marginTop: 0 }}>🎨 Componentes Responsivos</h2>
        
        {/* Texto adaptativo */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: isMobile ? 12 : 14 }}>📝 Texto Adaptativo</h3>
          <p style={{
            fontSize: isMobile ? 'clamp(11px, 2vw, 12px)' : 'clamp(12px, 2vw, 14px)',
            margin: 0
          }}>
            Este texto se adapta automaticamente com clamp()
          </p>
        </div>

        {/* Flexbox responsivo */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: isMobile ? 12 : 14 }}>🔄 Flexbox Responsivo</h3>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 8 : 12
          }}>
            <div style={{
              flex: 1,
              backgroundColor: '#f3f4f6',
              padding: isMobile ? 8 : 12,
              borderRadius: 4,
              fontSize: isMobile ? 11 : 12
            }}>
              Item 1
            </div>
            <div style={{
              flex: 1,
              backgroundColor: '#f3f4f6',
              padding: isMobile ? 8 : 12,
              borderRadius: 4,
              fontSize: isMobile ? 11 : 12
            }}>
              Item 2
            </div>
            <div style={{
              flex: 1,
              backgroundColor: '#f3f4f6',
              padding: isMobile ? 8 : 12,
              borderRadius: 4,
              fontSize: isMobile ? 11 : 12
            }}>
              Item 3
            </div>
          </div>
        </div>

        {/* Inputs responsivos */}
        <div>
          <h3 style={{ fontSize: isMobile ? 12 : 14 }}>⌨️ Inputs Responsivos</h3>
          <input
            type="text"
            placeholder="Digite algo..."
            style={{
              width: '100%',
              padding: isMobile ? 8 : 10,
              minHeight: 44,
              fontSize: isMobile ? 11 : 12,
              border: '1px solid #d1d5db',
              borderRadius: 4,
              marginBottom: 8
            }}
          />
          <input
            type="email"
            placeholder="Seu email..."
            style={{
              width: '100%',
              padding: isMobile ? 8 : 10,
              minHeight: 44,
              fontSize: isMobile ? 11 : 12,
              border: '1px solid #d1d5db',
              borderRadius: 4
            }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div style={{
        backgroundColor: '#ecfdf5',
        padding: isMobile ? 12 : 16,
        borderRadius: 8,
        marginBottom: 16
      }}>
        <h2 style={{ fontSize: isMobile ? 14 : 16, marginTop: 0 }}>✅ Checklist</h2>
        <ul style={{
          fontSize: isMobile ? 11 : 12,
          margin: 0,
          paddingLeft: 20
        }}>
          <li>Layout adapta sem quebras</li>
          <li>Texto é legível</li>
          <li>Botões são clicáveis (44px)</li>
          <li>Inputs têm tamanho correto</li>
          <li>Sem scroll horizontal</li>
          <li>Grid muda de colunas</li>
          <li>Tabelas se adaptam</li>
          <li>Modal é responsivo</li>
          <li>Espaçamento apropriado</li>
          <li>Transições suaves</li>
        </ul>
      </div>

      {/* Status Final */}
      <div style={{
        backgroundColor: '#dbeafe',
        padding: isMobile ? 12 : 16,
        borderRadius: 8,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: isMobile ? 18 : 20, marginBottom: 8 }}>🚀</div>
        <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 'bold' }}>
          Sistema 100% Responsivo!
        </div>
        <div style={{ fontSize: isMobile ? 10 : 11, marginTop: 8 }}>
          Redimensione a janela para ver as mudanças
        </div>
      </div>
    </div>
  );
}
