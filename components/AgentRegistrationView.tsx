
import React, { useState, useEffect } from 'react';
import { Agent, MembershipTier, UserRole, Agency, Lead, AppUser } from '../types';
import { createAgency, joinAgencyByCode } from '../services/agencyService';

interface AgentRegistrationViewProps {
  currentUser: AppUser | null;
  onRegistrationSuccess: (updatedUser: AppUser) => void;
  existingAgencies?: Agency[];
}

type Step = 1 | 2 | 3;

const AgentRegistrationView: React.FC<AgentRegistrationViewProps> = ({ currentUser, onRegistrationSuccess, existingAgencies = [] }) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Setting up your account...');
  const [selectedTier, setSelectedTier] = useState<MembershipTier>(MembershipTier.PRO_AGENT);
  const [registrationType, setRegistrationType] = useState<'ADMIN' | 'EMPLOYEE'>('ADMIN');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    agencyName: '',
    inviteCode: '',
    licenseNo: '',
    experience: '5',
    specialization: 'Luxury Penthouses, Sea-view Assets, Hitech City Plots',
    portfolioValue: '50'
  });

  const loadingSequence = [
    'Verifying RERA License...',
    'Checking Identity...',
    'Authenticating Professional Record...',
    'Saving your profile...',
    'Setting up your dashboard...'
  ];

  useEffect(() => {
    if (isLoading) {
      let i = 0;
      const interval = setInterval(() => {
        if (i < loadingSequence.length) {
          setLoadingText(loadingSequence[i]);
          i++;
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
      return;
    }

    if (!currentUser) {
      alert("Please login first to register as an agent.");
      return;
    }

    setIsLoading(true);
    
    try {
      if (registrationType === 'ADMIN') {
        const agency = await createAgency({
          name: formData.agencyName,
          adminUid: currentUser.uid
        });
        
        // Construct updated user object
        const updatedUser: AppUser = {
          ...currentUser,
          role: UserRole.AGENCY_ADMIN,
          agencyId: agency.id,
          agencyCode: agency.code
        };
        
        onRegistrationSuccess(updatedUser);
      } else {
        const result = await joinAgencyByCode(currentUser.uid, formData.inviteCode);
        
        // Construct updated user object
        const updatedUser: AppUser = {
          ...currentUser,
          role: UserRole.AGENT,
          agencyId: result.agencyId,
          agencyCode: formData.inviteCode.toUpperCase()
        };
        
        onRegistrationSuccess(updatedUser);
      }
    } catch (error: any) {
      alert(error.message || "Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  const agentTiers = [
    { 
      id: MembershipTier.FREE_AGENT, 
      label: 'Free Agent', 
      price: '₹0',
      period: '/ month',
      icon: 'fa-user-clock', 
      benefits: ['3 Active Listings', 'Personal Dashboard', 'Basic Reach'] 
    },
    { 
      id: MembershipTier.PRO_AGENT, 
      label: 'Pro Agent', 
      price: '₹999',
      period: '/ month',
      icon: 'fa-gem', 
      benefits: ['15 Active Listings', 'Verified Badge', 'Priority Visibility', 'Lead CRM'] 
    }
  ];

  const agencyTiers = [
    { 
      id: MembershipTier.ELITE_PARTNER, 
      label: 'Elite Partner', 
      price: '₹1,999',
      period: '/ month',
      icon: 'fa-briefcase', 
      benefits: ['25 Active Listings', 'Team Dashboard', 'Verified Status'] 
    },
    { 
      id: MembershipTier.GOLD_AGENCY, 
      label: 'Gold Agency', 
      price: '₹4,999',
      period: '/ month',
      icon: 'fa-crown', 
      benefits: ['50 Active Listings', 'Advanced Analytics', 'Lead Routing'] 
    },
    { 
      id: MembershipTier.PLATINUM_HUB, 
      label: 'Platinum Hub', 
      price: '₹9,999',
      period: '/ month',
      icon: 'fa-rocket', 
      benefits: ['Unlimited Listings', 'White Label Portal', '24/7 Priority Support'] 
    }
  ];

  const displayedTiers = registrationType === 'ADMIN' ? [...agentTiers, ...agencyTiers].slice(0, 4) : agentTiers;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-beige-50 relative overflow-hidden flex flex-col items-center py-20 px-6">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute top-[10%] left-[5%] w-[800px] h-[800px] bg-gold/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      <div className="max-w-[1000px] w-full relative z-10 space-y-12">
        <div className="flex justify-center items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-black border-2 transition-all ${currentStep === s ? 'bg-navy border-navy text-white scale-110 shadow-premium' : currentStep > s ? 'bg-success border-success text-white' : 'bg-white border-beige-300 text-navy-muted'}`}>
                {currentStep > s ? <i className="fa-solid fa-check text-sm"></i> : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-16 rounded-full ${currentStep > s ? 'bg-success' : 'bg-beige-300'}`}></div>}
            </div>
          ))}
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-5xl font-[900] text-navy tracking-tighter uppercase">Agent Registration</h1>
          <p className="text-navy-muted font-black uppercase tracking-[0.4em] text-[11px]">Join India's most trusted real estate marketplace</p>
        </div>

        <div className="bg-white border border-beige-200 p-10 md:p-14 rounded-[3rem] shadow-premium">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-8">
               <div className="relative">
                 <div className="w-28 h-28 border-4 border-gold/10 rounded-[2rem]"></div>
                 <div className="w-28 h-28 border-4 border-t-navy rounded-[2rem] absolute inset-0 animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center text-gold"><i className="fa-solid fa-shield-halved text-3xl"></i></div>
               </div>
               <div className="space-y-2">
                 <h2 className="text-xl font-black text-navy uppercase tracking-widest">{loadingText}</h2>
                 <p className="text-[10px] font-bold text-navy-muted uppercase tracking-widest">Verifying your license with RERA standards</p>
               </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-12">
              {currentStep === 1 && (
                <div className="space-y-10 duration-500">
                  <div className="grid grid-cols-2 gap-3 bg-beige-100 p-1.5 rounded-2xl border border-beige-200">
                    <button 
                      type="button" 
                      onClick={() => setRegistrationType('ADMIN')}
                      className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${registrationType === 'ADMIN' ? 'bg-navy text-white shadow-soft' : 'text-navy-muted hover:text-navy'}`}
                    >
                      Register as Agency
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setRegistrationType('EMPLOYEE')}
                      className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${registrationType === 'EMPLOYEE' ? 'bg-navy text-white shadow-soft' : 'text-navy-muted hover:text-navy'}`}
                    >
                      Join an Agency
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-navy-muted uppercase tracking-[0.2em] ml-4">Full Name</label>
                      <input 
                        type="text" required placeholder="e.g. Rahul Sharma"
                        className="w-full bg-beige-50 border border-beige-200 rounded-2xl px-8 py-5 text-xs font-black text-navy outline-none focus:border-gold/50 shadow-soft"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-navy-muted uppercase tracking-[0.2em] ml-4">Email Address</label>
                      <input 
                        type="email" required placeholder="rahul@premiumrealty.in"
                        className="w-full bg-beige-50 border border-beige-200 rounded-2xl px-8 py-5 text-xs font-black text-navy outline-none focus:border-gold/50 shadow-soft"
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    {registrationType === 'ADMIN' ? (
                      <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black text-navy-muted uppercase tracking-[0.2em] ml-4">Agency / Firm Name</label>
                        <input 
                          type="text" required placeholder="e.g. Skyline India Realty"
                          className="w-full bg-beige-50 border border-beige-200 rounded-2xl px-8 py-5 text-xs font-black text-navy outline-none focus:border-gold/50 shadow-soft"
                          value={formData.agencyName} onChange={e => setFormData({...formData, agencyName: e.target.value})}
                        />
                      </div>
                    ) : (
                      <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black text-navy-muted uppercase tracking-[0.2em] ml-4">Agency Invite Code</label>
                        <input 
                          type="text" required placeholder="Enter 6-digit Agency Code"
                          className="w-full bg-beige-50 border border-beige-200 rounded-2xl px-8 py-5 text-xs font-black text-navy outline-none focus:border-gold/50 shadow-soft"
                          value={formData.inviteCode} onChange={e => setFormData({...formData, inviteCode: e.target.value})}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 duration-500">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-navy-muted uppercase tracking-[0.2em] ml-4">RERA License Number</label>
                    <input 
                      type="text" required placeholder="e.g. PRM/KA/RERA/1251/..."
                      className="w-full bg-beige-50 border border-beige-200 rounded-2xl px-8 py-5 text-xs font-black text-navy outline-none focus:border-gold/50 shadow-soft"
                      value={formData.licenseNo} onChange={e => setFormData({...formData, licenseNo: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-navy-muted uppercase tracking-[0.2em] ml-4">Years of Experience</label>
                    <input 
                      type="number" required
                      className="w-full bg-beige-50 border border-beige-200 rounded-2xl px-8 py-5 text-xs font-black text-navy outline-none focus:border-gold/50 shadow-soft"
                      value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-navy-muted uppercase tracking-[0.2em] ml-4">Specialization</label>
                    <input 
                      type="text" required placeholder="Luxury Villas, Commercial Office Space, Hitech City Plots"
                      className="w-full bg-beige-50 border border-beige-200 rounded-2xl px-8 py-5 text-xs font-black text-navy outline-none focus:border-gold/50 shadow-soft"
                      value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 duration-500">
                  {displayedTiers.map((tier) => (
                    <button 
                      key={tier.id} type="button" 
                      onClick={() => setSelectedTier(tier.id)}
                      className={`relative p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center text-center space-y-6 ${selectedTier === tier.id ? 'bg-navy border-navy text-white shadow-premium scale-105' : 'bg-beige-50 border-beige-200 text-navy-muted hover:border-gold/40'}`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${selectedTier === tier.id ? 'bg-white/10 text-white shadow-soft' : 'bg-white border border-beige-200 text-gold shadow-soft'}`}>
                        <i className={`fa-solid ${tier.icon}`}></i>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase tracking-widest">{tier.label}</h4>
                        <div className="text-2xl font-[900] tracking-tighter">{tier.price}</div>
                        <p className="text-[8px] font-bold uppercase opacity-60 tracking-widest">{tier.period}</p>
                      </div>
                      <ul className="space-y-3 flex-1">
                        {tier.benefits.map((b, i) => (
                          <li key={i} className="text-[9px] font-black uppercase tracking-widest border-b border-white/5 pb-1">{b}</li>
                        ))}
                      </ul>
                      <div className={`w-full py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${selectedTier === tier.id ? 'bg-white text-navy border-white' : 'bg-beige-100 border-beige-300 text-navy-muted'}`}>
                        {selectedTier === tier.id ? 'Select Plan' : 'Choose Plan'}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4 pt-6">
                {currentStep > 1 && (
                  <button type="button" onClick={() => setCurrentStep((currentStep - 1) as Step)} className="flex-1 py-6 rounded-[2rem] border-2 border-beige-200 text-navy-muted font-black uppercase text-[10px] tracking-widest hover:bg-beige-50 transition-all">Back</button>
                )}
                <button type="submit" className="flex-[2] bg-navy text-white py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-premium transition-all hover:bg-navy-ultra active:scale-[0.98] flex items-center justify-center gap-4">
                  {currentStep === 3 ? 'Complete Registration' : 'Next Step'} <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </button>
              </div>
            </form>
          )}
        </div>
        
        <div className="text-center">
           <p className="text-[10px] font-black text-navy-muted uppercase tracking-[0.2em]">Partnering for Trust & Transparency in Indian Real Estate</p>
        </div>
      </div>
    </div>
  );
};

export default AgentRegistrationView;
