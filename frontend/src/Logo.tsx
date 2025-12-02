import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="logo-container">
      <svg 
        className="logo-svg" 
        viewBox="0 0 64 64" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Defs avec gradient argent chrome */}
        <defs>
          <linearGradient id="silverChrome" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#e8e8e8" />
            <stop offset="50%" stopColor="#d0d0d0" />
            <stop offset="75%" stopColor="#c0c0c0" />
            <stop offset="100%" stopColor="#a0a0a0" />
          </linearGradient>
        </defs>

        {/* Maison style Apple - minimaliste */}
        {/* Toit - ligne supérieure formant un triangle arrondi */}
        <path 
          d="M 32 12 L 48 28 L 52 28 C 54 28 55 29 55 31 L 55 50 C 55 52 54 53 52 53 L 12 53 C 10 53 9 52 9 50 L 9 31 C 9 29 10 28 12 28 L 16 28 Z" 
          fill="none" 
          stroke="url(#silverChrome)" 
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Porte simple - rectangle minimaliste */}
        <rect 
          x="26" 
          y="36" 
          width="12" 
          height="14" 
          fill="none" 
          stroke="url(#silverChrome)" 
          strokeWidth="1.8"
          rx="1"
        />
        
        {/* Poignée de porte */}
        <circle 
          cx="35.5" 
          cy="43" 
          r="0.8" 
          fill="url(#silverChrome)"
        />
      </svg>
      
      <span className="logo-text">Real Estate AI</span>
    </div>
  );
};

export default Logo;
