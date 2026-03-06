import React, { useState } from 'react';
import { loginWithGoogle } from '../services/authService';

interface GoogleLoginProps {
  onLoginSuccess: (user: any) => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        onLoginSuccess(user);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert(`Domain Unauthorized: Please add "${window.location.hostname}" to your Authorized Domains in the Firebase Console (Authentication > Settings > Authorized domains).`);
      } else if (error.code === 'auth/configuration-not-found') {
        alert("Configuration Not Found: Please ensure Google Sign-In is enabled in your Firebase Console (Authentication > Sign-in method).");
      } else {
        alert(`Login failed: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-[3rem] p-16 shadow-premium border border-beige-200 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-navy"></div>
        
        <div className="w-24 h-24 bg-beige-50 text-navy rounded-[2rem] flex items-center justify-center text-4xl mb-12 shadow-soft mx-auto border border-beige-200">
          <i className="fa-brands fa-google text-gold"></i>
        </div>
        
        <h2 className="text-4xl font-black text-navy tracking-tighter mb-4 uppercase">Welcome to Brickova</h2>
        <p className="text-navy-muted font-black uppercase tracking-[0.2em] mb-16 leading-relaxed text-[11px] opacity-70 px-4">
          Authenticate with your professional profile to manage premium asset inventory.
        </p>
        
        <button 
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full group relative flex items-center justify-center gap-5 bg-navy text-white px-8 py-6 rounded-[2rem] transition-all hover:bg-navy-ultra hover:shadow-navy disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center gap-4">
              <i className="fa-solid fa-circle-notch animate-spin text-gold"></i>
              <span className="text-[11px] font-black uppercase tracking-widest">Validating...</span>
            </div>
          ) : (
            <>
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6 grayscale invert" alt="Google" />
              <span className="text-[11px] font-black uppercase tracking-widest">Entry via Google System</span>
            </>
          )}
        </button>

        <div className="mt-20 pt-12 border-t border-beige-100 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-navy-muted">
          <div className="flex flex-col items-center gap-3 group">
            <img 
              src="https://img.icons8.com/ios-filled/100/b8926a/shield.png" 
              alt="Encrypted" 
              className="w-6 h-6 md:w-7 md:h-7 opacity-80 group-hover:scale-110 transition-transform duration-500" 
            />
            <span className="opacity-80">Encrypted</span>
          </div>
          <div className="flex flex-col items-center gap-3 group">
            <img 
              src="https://img.icons8.com/ios-filled/100/b8926a/verified-badge.png" 
              alt="Verified" 
              className="w-6 h-6 md:w-7 md:h-7 opacity-80 group-hover:scale-110 transition-transform duration-500" 
            />
            <span className="opacity-80">Verified</span>
          </div>
          <div className="flex flex-col items-center gap-3 group">
            <img 
              src="https://img.icons8.com/ios-filled/100/b8926a/contract.png" 
              alt="Audited" 
              className="w-6 h-6 md:w-7 md:h-7 opacity-80 group-hover:scale-110 transition-transform duration-500" 
            />
            <span className="opacity-80">Audited</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleLogin;