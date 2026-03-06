
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-10 w-auto" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* House Shape (Pentagon) */}
      <path 
        d="M50 10 L90 40 V90 H10 V40 L50 10 Z" 
        fill="#0f172a" 
      />
      {/* Stylized 'B' (Vertical stem + two horizontal bars with rounded ends) */}
      <rect x="30" y="42" width="8" height="41" fill="#b8926a" />
      <rect x="30" y="42" width="35" height="18" rx="9" fill="#b8926a" />
      <rect x="30" y="65" width="35" height="18" rx="9" fill="#b8926a" />
    </svg>
  );
};

export default Logo;
