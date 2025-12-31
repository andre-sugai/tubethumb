import React from 'react';

const OrganicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 bg-[#2b2d42]"> {/* Lead Gray Base */}
      {/* Organic Noise Texture */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Subtle vignettes for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30 pointer-events-none" />
    </div>
  );
};

export default OrganicBackground;
