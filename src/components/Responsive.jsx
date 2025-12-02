import React, { useState, useEffect } from 'react';

/**
 * Hook customizado para detectar responsividade
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 481,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 481 && window.innerWidth < 1024,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024,
    isLandscape: typeof window !== 'undefined' ? window.innerWidth > window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < 481,
        isTablet: width >= 481 && width < 1024,
        isDesktop: width >= 1024,
        isLandscape: width > height,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

/**
 * Componente para criar layouts responsivos
 */
export const ResponsiveContainer = ({ children, style = {} }) => {
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        width: '100%',
        maxWidth: isMobile ? '100vw' : 'auto',
        overflow: 'hidden',
        ...style
      }}
    >
      {children}
    </div>
  );
};

/**
 * Grid responsivo
 */
export const ResponsiveGrid = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 12,
  style = {}
}) => {
  const { isMobile, isTablet } = useResponsive();

  let gridColumns = columns.desktop;
  if (isMobile) gridColumns = columns.mobile;
  else if (isTablet) gridColumns = columns.tablet;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: `${gap}px`,
        width: '100%',
        ...style
      }}
    >
      {children}
    </div>
  );
};

/**
 * Flexbox responsivo
 */
export const ResponsiveFlex = ({
  children,
  direction = 'row',
  wrap = true,
  gap = 12,
  style = {}
}) => {
  const { isMobile } = useResponsive();

  const flexDirection = isMobile ? 'column' : direction;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: flexDirection,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        gap: `${gap}px`,
        width: '100%',
        ...style
      }}
    >
      {children}
    </div>
  );
};

/**
 * Componente de navegação com drawer para mobile
 */
export const ResponsiveNav = ({ children, style = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useResponsive();

  return (
    <>
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 998
          }}
        />
      )}
      <nav
        style={{
          position: isMobile && isOpen ? 'fixed' : 'relative',
          left: isMobile && !isOpen ? '-100%' : 0,
          top: isMobile ? 0 : 'auto',
          width: isMobile ? '85vw' : '100%',
          height: isMobile ? '100vh' : 'auto',
          zIndex: 999,
          transition: 'left 0.3s ease',
          overflow: isMobile ? 'auto' : 'visible',
          ...style
        }}
      >
        {children}
      </nav>
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      )}
    </>
  );
};

/**
 * Componente de tabela responsiva
 */
export const ResponsiveTable = ({ headers = [], rows = [], style = {} }) => {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div style={{ overflow: 'auto', width: '100%', ...style }}>
        {rows.map((row, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: '12px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#fff'
            }}
          >
            {headers.map((header, hIdx) => (
              <div key={hIdx} style={{ marginBottom: '8px' }}>
                <strong style={{ fontSize: '11px', color: '#666' }}>{header}</strong>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>{row[hIdx]}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        ...style
      }}
    >
      <thead>
        <tr>
          {headers.map((header, idx) => (
            <th
              key={idx}
              style={{
                padding: '12px',
                textAlign: 'left',
                borderBottom: '2px solid #ddd',
                background: '#f5f5f5'
              }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rIdx) => (
          <tr key={rIdx} style={{ borderBottom: '1px solid #ddd' }}>
            {row.map((cell, cIdx) => (
              <td
                key={cIdx}
                style={{
                  padding: '10px',
                  textAlign: 'left'
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

/**
 * Modal/Dialog responsivo
 */
export const ResponsiveModal = ({
  isOpen = false,
  onClose = () => {},
  title = '',
  children,
  style = {}
}) => {
  const { isMobile } = useResponsive();

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: isMobile ? '50%' : '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? '95vw' : '80vw',
          maxWidth: isMobile ? '95vw' : '600px',
          maxHeight: '90vh',
          background: 'white',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          overflow: 'auto',
          ...style
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: isMobile ? '14px' : '18px' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </>
  );
};

export default {
  useResponsive,
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveNav,
  ResponsiveTable,
  ResponsiveModal
};
