import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useResponsive } from '../Responsive';
import '../../../styles/sistema.css';

export default function SistemaLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isMobile, isTablet } = useResponsive();

  // Fechar sidebar em mobile por padrão
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div className="sistema-layout">
      {/* Backdrop para mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="sistema-sidebar-backdrop active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sistema-sidebar ${sidebarOpen ? 'active' : ''}`}
        style={{
          width: isMobile ? '85vw' : isTablet ? '200px' : '280px',
          backgroundColor: 'white',
          boxShadow: sidebarOpen && isMobile ? '2px 0 10px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <Sidebar />
      </div>

      {/* Content */}
      <div className="sistema-content">
        {/* Header com botão toggle */}
        <div
          className="header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '10px 12px' : '12px 16px',
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <button
            className="toggle-sidebar-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: isMobile ? 'flex' : 'none',
              background: '#0ea5e9',
              color: 'white',
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <h1
            style={{
              fontSize: isMobile ? '14px' : isTablet ? '16px' : '18px',
              fontWeight: '600',
              margin: 0,
              flex: 1,
              marginLeft: isMobile ? '12px' : 0,
            }}
          >
            SmartOps
          </h1>
        </div>

        {/* Main Content */}
        <div className="sistema-main">
          {children}
        </div>
      </div>
    </div>
  );
}
