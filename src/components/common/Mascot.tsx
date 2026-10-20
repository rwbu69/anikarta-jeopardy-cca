import React from 'react';

interface MascotProps {
  variant?: 'avatar' | 'companion' | 'compact' | 'podium';
  speechBubble?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Mascot: React.FC<MascotProps> = ({
  variant = 'companion',
  speechBubble,
  size,
  className = '',
  style = {}
}) => {
  if (variant === 'avatar') {
    const s = size || 38;
    return (
      <div 
        className={`mascot-avatar ${className}`}
        style={{
          width: `${s}px`,
          height: `${s}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid var(--border-warm-darker)',
          boxShadow: '0 2px 4px rgba(61,49,42,0.12)',
          backgroundColor: '#FFF4E8',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...style
        }}
        title="Anikarta Mascot"
      >
        <img 
          src="/mascot.webp" 
          alt="Mascot Avatar" 
          style={{
            width: '120%',
            height: '120%',
            objectFit: 'cover',
            transform: 'translateY(10%) scale(1.15)'
          }} 
        />
      </div>
    );
  }

  if (variant === 'compact') {
    const s = size || 80;
    return (
      <div className={`mascot-compact ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', ...style }}>
        <img 
          src="/mascot.webp" 
          alt="Mascot" 
          style={{ height: `${s}px`, width: 'auto', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} 
        />
        {speechBubble && (
          <div className="mascot-speech-bubble" style={{ fontSize: '0.85rem' }}>
            {speechBubble}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'podium') {
    const s = size || 140;
    return (
      <div className={`mascot-podium ${className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', ...style }}>
        <img 
          src="/mascot.webp" 
          alt="Mascot Cheering" 
          style={{
            height: `${s}px`,
            width: 'auto',
            filter: 'drop-shadow(0 8px 16px rgba(229,122,147,0.3))',
            animation: 'mascotFloat 2.5s ease-in-out infinite'
          }} 
        />
        {speechBubble && (
          <div className="mascot-speech-bubble" style={{ textAlign: 'center', fontWeight: 700 }}>
            {speechBubble}
          </div>
        )}
      </div>
    );
  }

  // Default 'companion' (with visual novel dialogue feel)
  const s = size || 120;
  return (
    <div 
      className={`mascot-companion ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        ...style
      }}
    >
      <img 
        src="/mascot.webp" 
        alt="Visual Novel Mascot" 
        style={{
          height: `${s}px`,
          width: 'auto',
          filter: 'drop-shadow(0 6px 12px rgba(61,49,42,0.12))',
          flexShrink: 0,
          animation: 'mascotFloat 3s ease-in-out infinite'
        }}
      />
      {speechBubble && (
        <div 
          className="mascot-speech-bubble"
          style={{
            background: '#FFFFFF',
            border: '2px solid var(--border-warm-darker)',
            borderRadius: '16px',
            padding: '12px 18px',
            boxShadow: '0 3px 0 var(--border-warm-darker)',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            position: 'relative',
            lineHeight: 1.4
          }}
        >
          {speechBubble}
        </div>
      )}
    </div>
  );
};
