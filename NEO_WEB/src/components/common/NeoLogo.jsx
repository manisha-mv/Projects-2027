import React from 'react';
import userLogoImg from '../../assets/neo-hospital-logo.jpg';

/**
 * NeoLogoMark - Displays the exact uploaded logo image provided by the user.
 * Preserves the exact design, proportions, colors, and graphics.
 */
export const NeoLogoMark = ({ size = 64, className = '', style = {} }) => {
  return (
    <img
      src={userLogoImg}
      alt="NEO Hospital Official Logo"
      width={size}
      height={size}
      className={`neo-logo-exact-img ${className}`}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: 16,
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
    />
  );
};

/**
 * NeoLogoFull - Displays the exact logo image along with hospital title text if requested.
 */
export const NeoLogoFull = ({ height = 48, showTagline = true, className = '' }) => {
  return (
    <div className={`neo-logo-full ${className}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <img
        src={userLogoImg}
        alt="NEO Hospital Official Logo"
        style={{ height: height, width: height, objectFit: 'contain', borderRadius: 8 }}
      />
      {showTagline && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4C1D95', letterSpacing: '-0.02em' }}>
            NEO<span style={{ color: '#0D9488' }}>Care</span>
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', color: '#64748B', textTransform: 'uppercase' }}>
            HOSPITAL
          </span>
        </div>
      )}
    </div>
  );
};

export default NeoLogoMark;
