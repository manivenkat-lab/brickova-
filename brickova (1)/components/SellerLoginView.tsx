
import React from 'react';
import GoogleLogin from './GoogleLogin';

const BuildingSkyline = () => (
  <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06] overflow-hidden select-none">
    <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 450" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#0f172a" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
        {Array.from({ length: 55 }).map((_, i) => {
          const x = (i * 26) % 1200;
          const h = 50 + Math.random() * 380;
          const w = 22 + Math.random() * 45;
          const depth = 12 + Math.random() * 20;
          
          return (
            <g key={i} transform={`translate(${x}, ${450 - h})`}>
              <path d={`M0,0 L${depth},-${depth/2} L${w + depth},-${depth/2} L${w},0 Z`} strokeWidth="0.5" />
              <path d={`M${w},0 L${w + depth},-${depth/2} L${w + depth},${h - depth/2} L${w},${h} Z`} strokeWidth="0.6" fill="#0f172a" opacity="0.08" />
              <rect x="0" y="0" width={w} height={h} strokeWidth="0.8" />
            </g>
          );
        })}
      </g>
    </svg>
  </div>
);

const SellerLoginView: React.FC<SellerLoginViewProps> = ({ onLoginSuccess }) => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-beige-50 relative overflow-hidden flex items-center justify-center py-10 md:py-16 px-6">
      <BuildingSkyline />
      {/* Background Decorative Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(#0f172a_3px,transparent_3px)] [background-size:80px_80px]"></div>
      </div>

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-center relative z-10">
        <div className="space-y-8 md:space-y-12 duration-1000">
          <div className="space-y-4 md:space-y-6">
            <h4 className="text-gold font-black uppercase tracking-[0.4em] text-[10px] md:text-[12px] border-l-4 border-gold pl-4 md:pl-6">Direct Seller Access</h4>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-[1000] text-navy tracking-tighter leading-[0.9] uppercase">
              Monetize <br className="hidden sm:block" />
              <span className="text-gold italic font-serif lowercase tracking-normal">Your Properties.</span>
            </h1>
            <p className="text-navy-muted text-sm md:text-xl font-medium max-w-lg leading-relaxed uppercase tracking-widest opacity-80">
              Connect directly with verified buyers in a secure real estate marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
            <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-premium border border-beige-200 group transition-all duration-700">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-navy text-white rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-8 group-hover:scale-105 transition-transform shadow-elevated">
                <i className="fa-solid fa-handshake-simple text-xl md:text-2xl text-gold"></i>
              </div>
              <h5 className="font-[900] text-navy mb-2 md:mb-4 uppercase text-[10px] md:text-[13px] tracking-widest">Direct Sales</h5>
              <p className="text-navy-muted text-[8px] md:text-[11px] font-bold uppercase leading-relaxed opacity-70 tracking-wider">Sell directly to buyers without unnecessary delays.</p>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-premium border border-beige-200 group transition-all duration-700">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white text-navy rounded-xl md:rounded-2xl border-2 border-navy flex items-center justify-center mb-4 md:mb-8 group-hover:scale-105 transition-transform shadow-soft">
                <i className="fa-solid fa-fingerprint text-xl md:text-2xl text-gold"></i>
              </div>
              <h5 className="font-[900] text-navy mb-2 md:mb-4 uppercase text-[10px] md:text-[13px] tracking-widest">Verified Listings</h5>
              <p className="text-navy-muted text-[8px] md:text-[11px] font-bold uppercase leading-relaxed opacity-70 tracking-wider">All properties are verified to ensure secure and transparent deals.</p>
            </div>
          </div>
        </div>

        <div className="duration-1000 delay-300">
          <GoogleLogin onLoginSuccess={onLoginSuccess} />
        </div>
      </div>
    </div>
  );
};

interface SellerLoginViewProps {
  onLoginSuccess: (user: any) => void;
}

export default SellerLoginView;
