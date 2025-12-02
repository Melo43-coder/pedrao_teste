/**
 * EXEMPLOS DE COMO TORNAR COMPONENTES RESPONSIVOS
 * Copie e cole o código nos seus componentes
 */

// ============================================
// EXEMPLO 1: Componente simples com useResponsive
// ============================================
import React from 'react';
import { useResponsive } from '../Responsive';
import '../../styles/responsive.css';

export function ComponenteResponsivo() {
  const { isMobile, isTablet, isDesktop, width, height } = useResponsive();

  return (
    <div style={{
      padding: isMobile ? 8 : isTablet ? 12 : 16,
      fontSize: isMobile ? 12 : 14,
      backgroundColor: isMobile ? '#f9fafb' : 'white'
    }}>
      <h1 style={{
        fontSize: isMobile ? 18 : isTablet ? 20 : 24
      }}>
        Título Responsivo
      </h1>

      {isMobile && <p>Conteúdo específico para mobile</p>}
      {isTablet && <p>Conteúdo específico para tablet</p>}
      {isDesktop && <p>Conteúdo específico para desktop</p>}
    </div>
  );
}

// ============================================
// EXEMPLO 2: Grid responsivo de cards
// ============================================
import React from 'react';
import { ResponsiveGrid } from '../Responsive';

export function GridCards({ items }) {
  return (
    <ResponsiveGrid
      columns={{
        mobile: 1,
        tablet: 2,
        desktop: 3
      }}
      gap={12}
    >
      {items.map(item => (
        <div
          key={item.id}
          style={{
            padding: 16,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            backgroundColor: 'white'
          }}
        >
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </ResponsiveGrid>
  );
}

// ============================================
// EXEMPLO 3: Tabela responsiva
// ============================================
import React from 'react';
import { ResponsiveTable } from '../Responsive';

export function TabelaResponsiva({ data }) {
  const headers = ['Nome', 'Email', 'Telefone'];
  const rows = data.map(item => [
    item.nome,
    item.email,
    item.telefone
  ]);

  return (
    <ResponsiveTable
      headers={headers}
      rows={rows}
    />
  );
}

// ============================================
// EXEMPLO 4: Layout flexível de sidebar + content
// ============================================
import React, { useState } from 'react';
import { useResponsive } from '../Responsive';

export function LayoutComSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useResponsive();

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100%'
    }}>
      {/* Sidebar */}
      <div
        style={{
          position: isMobile ? 'fixed' : 'relative',
          left: isMobile && !sidebarOpen ? '-100%' : 0,
          width: isMobile ? '80vw' : '250px',
          height: isMobile ? '100vh' : 'auto',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          zIndex: 999,
          transition: 'left 0.3s ease',
          overflow: isMobile ? 'auto' : 'visible'
        }}
      >
        {/* Conteúdo sidebar */}
        <nav>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>

      {/* Backdrop mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 998
          }}
        />
      )}

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto'
      }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            display: isMobile ? 'block' : 'none',
            margin: 8
          }}
        >
          ☰ Menu
        </button>
        <p>Seu conteúdo aqui</p>
      </div>
    </div>
  );
}

// ============================================
// EXEMPLO 5: Formulário responsivo
// ============================================
import React, { useState } from 'react';
import { useResponsive } from '../Responsive';

export function FormularioResponsivo() {
  const { isMobile } = useResponsive();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  return (
    <form style={{
      maxWidth: isMobile ? '95vw' : '600px',
      margin: '0 auto',
      padding: isMobile ? 12 : 20,
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? 10 : 16
    }}>
      <div className="form-group">
        <label>Nome</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{
            width: '100%',
            padding: 10,
            fontSize: 14,
            border: '1px solid #d1d5db',
            borderRadius: 6
          }}
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={{
            width: '100%',
            padding: 10,
            fontSize: 14,
            border: '1px solid #d1d5db',
            borderRadius: 6
          }}
        />
      </div>

      <div className="form-group" style={{
        gridColumn: isMobile ? '1' : '1 / -1'
      }}>
        <label>Telefone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          style={{
            width: '100%',
            padding: 10,
            fontSize: 14,
            border: '1px solid #d1d5db',
            borderRadius: 6
          }}
        />
      </div>

      <button
        type="submit"
        style={{
          gridColumn: '1 / -1',
          padding: 12,
          backgroundColor: '#0ea5e9',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          minHeight: 44
        }}
      >
        Enviar
      </button>
    </form>
  );
}

// ============================================
// EXEMPLO 6: Modal responsivo
// ============================================
import React, { useState } from 'react';
import { ResponsiveModal } from '../Responsive';

export function ComponenteComModal() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setModalOpen(true)}>
        Abrir Modal
      </button>

      <ResponsiveModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Meu Modal Responsivo"
      >
        <p>Este modal se adapta automaticamente!</p>
        <button onClick={() => setModalOpen(false)}>
          Fechar
        </button>
      </ResponsiveModal>
    </>
  );
}

// ============================================
// EXEMPLO 7: Header/Navbar responsivo
// ============================================
import React, { useState } from 'react';
import { useResponsive } from '../Responsive';

export function NavbarResponsiva() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isMobile } = useResponsive();

  const menuItems = ['Home', 'Sobre', 'Serviços', 'Contato'];

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? 10 : 16,
      backgroundColor: '#0ea5e9',
      color: 'white'
    }}>
      <h1 style={{ fontSize: isMobile ? 14 : 18 }}>Logo</h1>

      {isMobile ? (
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: 24,
            cursor: 'pointer'
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      ) : (
        <nav style={{ display: 'flex', gap: 16 }}>
          {menuItems.map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: 14
              }}
            >
              {item}
            </a>
          ))}
        </nav>
      )}

      {isMobile && menuOpen && (
        <nav style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#0ea5e9',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 16
        }}>
          {menuItems.map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: 14
              }}
            >
              {item}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

// ============================================
// EXEMPLO 8: Chat responsivo (como em Chat.jsx)
// ============================================
import React, { useState } from 'react';
import { useResponsive } from '../Responsive';

export function ChatResponsivo() {
  const { isMobile } = useResponsive();
  const [messages, setMessages] = useState([]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      flexDirection: isMobile ? 'column' : 'row'
    }}>
      {/* Lista de chats */}
      <div
        style={{
          flex: isMobile ? '0 0 30vh' : '0 0 280px',
          borderRight: !isMobile ? '1px solid #e5e7eb' : 'none',
          borderBottom: isMobile ? '1px solid #e5e7eb' : 'none',
          overflow: 'auto',
          backgroundColor: 'white'
        }}
      >
        <div style={{ padding: 12 }}>
          <h3>Chats</h3>
          {/* Chat list items */}
        </div>
      </div>

      {/* Mensagens */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? 8 : 16 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ marginBottom: 12 }}>
              {msg.text}
            </div>
          ))}
        </div>

        <div style={{
          padding: isMobile ? 8 : 12,
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: 8
        }}>
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            style={{
              flex: 1,
              padding: 8,
              fontSize: 12,
              border: '1px solid #d1d5db',
              borderRadius: 4
            }}
          />
          <button style={{
            padding: 8,
            minWidth: 44,
            minHeight: 44
          }}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

export default {
  ComponenteResponsivo,
  GridCards,
  TabelaResponsiva,
  LayoutComSidebar,
  FormularioResponsivo,
  ComponenteComModal,
  NavbarResponsiva,
  ChatResponsivo
};
