import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="logo-container">
      <svg 
        className="logo-svg" 
        viewBox="0 0 512 512" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient métallique argent chrome */}
          <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="25%" stopColor="#f0f0f0" stopOpacity="1" />
            <stop offset="50%" stopColor="#d4d4d4" stopOpacity="1" />
            <stop offset="75%" stopColor="#b8b8b8" stopOpacity="1" />
            <stop offset="100%" stopColor="#9a9a9a" stopOpacity="1" />
          </linearGradient>
          
          {/* Fond dégradé sombre */}
          <linearGradient id="darkBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2a2a2a" stopOpacity="1" />
            <stop offset="100%" stopColor="#0f0f0f" stopOpacity="1" />
          </linearGradient>
          
          {/* Ombre portée */}
          <filter id="shadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
            <feOffset dx="0" dy="3" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Highlight pour effet 3D */}
          <linearGradient id="highlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Fond arrondi noir */}
        <rect width="512" height="512" rx="110" fill="url(#darkBg)"/>
        
        {/* Effet de brillance sur le fond */}
        <rect width="512" height="256" rx="110" fill="url(#highlight)" opacity="0.1"/>
        
        {/* Groupe principal avec ombre */}
        <g filter="url(#shadow)">
          {/* Toit de la maison */}
          <path d="M 256 90 L 410 220 L 380 220 L 256 115 L 132 220 L 102 220 Z" 
                fill="url(#metalGradient)" 
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinejoin="round"
                opacity="0.95"/>
          
          {/* Corps de la maison avec coins arrondis */}
          <path d="M 132 220 L 132 380 Q 132 400 152 400 L 360 400 Q 380 400 380 380 L 380 220 Z" 
                fill="none" 
                stroke="url(#metalGradient)" 
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.95"/>
          
          {/* Barres de graphique ascendant à l'intérieur */}
          <g>
            {/* Barre 1 - courte */}
            <rect x="180" y="310" width="38" height="70" 
                  rx="6"
                  fill="url(#metalGradient)"
                  opacity="0.9"/>
            
            {/* Barre 2 - moyenne */}
            <rect x="237" y="260" width="38" height="120" 
                  rx="6"
                  fill="url(#metalGradient)"
                  opacity="0.95"/>
            
            {/* Barre 3 - haute */}
            <rect x="294" y="210" width="38" height="170" 
                  rx="6"
                  fill="url(#metalGradient)"
                  opacity="1"/>
          </g>
        </g>
        
        {/* Reflets pour effet métallique 3D */}
        <g opacity="0.3">
          <path d="M 256 90 L 410 220 L 380 220 L 256 115 Z" 
                fill="url(#highlight)"/>
          <rect x="294" y="210" width="20" height="170" 
                rx="6"
                fill="url(#highlight)"/>
        </g>
      </svg>
      
      <span className="logo-text">Real Estate AI</span>
    </div>
  );
};

export default Logo;
