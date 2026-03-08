
import React, { useState, useMemo, useEffect } from 'react';
import { Property, PropertyType, Lead, LeadStatus, AppUser } from '../types';
import MortgageCalculator from './MortgageCalculator';
import LiveConsultation from './LiveConsultation';
import AIDecorator from './AIDecorator';
import { GoogleGenAI } from '@google/genai';
import { createLead } from '../services/leadService';

interface PropertyDetailsProps {
  property: Property;
  isShortlisted?: boolean;
  onToggleShortlist: (id: string) => void;
  onBack: () => void;
  formatPrice: (p: number) => string;
  onCaptureLead?: (lead: Lead) => void;
  currentUser?: AppUser | null;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800';

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, isShortlisted, onToggleShortlist, onBack, formatPrice, onCaptureLead, currentUser }) => {
  const [activeImg, setActiveImg] = useState(0);
  const propertyImages = property.images?.length > 0 ? property.images : [DEFAULT_IMAGE];
  const activeImage = propertyImages[activeImg] || DEFAULT_IMAGE;
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LOCATION' | 'FEATURES' | 'PLAN'>('OVERVIEW');
  const [showDetails, setShowDetails] = useState(true);
  const [showLive, setShowLive] = useState(false);
  const [showDecorator, setShowDecorator] = useState(false);
  const [nearbyIntelligence, setNearbyIntelligence] = useState<string>('');
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const isRent = property.type === PropertyType.RENT;

  const handleWhatsAppBooking = () => {
    const message = `Greetings, I am interested in ${isRent ? 'renting' : 'viewing'} the estate "${property.title}" in ${property.location}. (Ref: ${property.propertyCode})`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919999999999?text=${encoded}`, '_blank');
    
    if (onCaptureLead) {
      onCaptureLead({
        id: Math.random().toString(36).substr(2, 9),
        name: 'WhatsApp Lead',
        phone: 'WhatsApp User',
        email: 'N/A',
        propertyId: property.id,
        propertyTitle: property.title,
        source: 'WhatsApp',
        status: 'New',
        priority: 'Hot',
        assignedTo: property.ownerId || '',
        agencyId: property.agencyId || 'independent',
        followUpDate: new Date(),
        notes: [{ text: 'Inquiry initiated via WhatsApp', createdAt: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Lead);
    }
  };

  const handleManualInquiry = async () => {
    if (!leadName || !leadPhone) {
      alert("Please provide contact credentials.");
      return;
    }
    setIsSubmittingLead(true);
    
    try {
      const leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
        name: leadName,
        phone: leadPhone,
        email: '',
        propertyId: property.id,
        propertyTitle: property.title,
        source: 'Website',
        status: 'New',
        priority: 'Warm',
        assignedTo: property.ownerId || '',
        agencyId: property.agencyId || 'independent',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notes: [{ text: 'Strategic interest submitted via portal form.', createdAt: new Date().toISOString() }]
      };

      const id = await createLead(leadData, currentUser?.uid || 'public', currentUser?.agencyId || null);
      
      if (onCaptureLead) {
        onCaptureLead({ 
          ...leadData, 
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Lead);
      }
      setIsSubmittingLead(false);
      setLeadName('');
      setLeadPhone('');
      alert("Strategic inquiry archived. A professional associate will reach out shortly.");
    } catch (error) {
      console.error("Lead submission error:", error);
      alert("Failed to submit inquiry.");
      setIsSubmittingLead(false);
    }
  };

  const getMarketPriceRange = () => {
    const baseUnit = Math.round((property?.price || 0) / (property?.sqft || 1));
    const min = baseUnit * 0.92;
    const max = baseUnit * 1.08;
    const suffix = isRent ? "per sqft (monthly)" : "per sqft";
    return `₹${Math.round(min)?.toLocaleString?.('en-IN') || "-"} - ₹${Math.round(max)?.toLocaleString?.('en-IN') || "-"} ${suffix}`;
  };

  const fetchNearbyIntelligence = async () => {
    setIsLoadingNearby(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // FIX: Changed model to 'gemini-2.5-flash' as Maps grounding is only supported in Gemini 2.5 series.
      const addressLine = property.address?.addressLine || property.location || '';
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this location for real estate investment: ${property.location}, specifically around ${addressLine}. Use your Google Maps intelligence to find 3 top-rated restaurants, the nearest luxury hospital, and the closest major airport. Summarize in 3 professional bullet points.`,
        config: {
          tools: [{ googleMaps: {} }]
        }
      });
      setNearbyIntelligence(response.text || "Nearby data synchronization pending.");
    } catch (err) {
      setNearbyIntelligence("Satellite protocol unavailable.");
    } finally {
      setIsLoadingNearby(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'LOCATION' && !nearbyIntelligence) {
      fetchNearbyIntelligence();
    }
  }, [activeTab]);

  const mapSrc = useMemo(() => {
    if (property.googleMapUrl && property.googleMapUrl.includes('query=')) {
      const urlObj = new URL(property.googleMapUrl);
      const query = urlObj.searchParams.get('query');
      if (query) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
      }
    }
    const addressLine = property.address?.addressLine || '';
    const city = property.address?.city || property.city || '';
    const area = property.address?.area || '';
    const country = property.address?.country || 'India';
    const query = encodeURIComponent(`${addressLine}, ${area}, ${city}, ${country}`);
    return `https://maps.google.com/maps?q=${query}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  }, [property]);

  const currencySymbol = '₹';

  return (
    <div className="max-w-7xl mx-auto py-4 md:py-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 text-navy bg-beige-50">
      {showLive && <LiveConsultation property={property} onClose={() => setShowLive(false)} />}
      {showDecorator && <AIDecorator property={property} onClose={() => setShowDecorator(false)} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8 gap-4 px-4 md:px-0">
        <button onClick={onBack} className="w-fit flex items-center gap-2 md:gap-3 py-2 text-[10px] md:text-[10px] font-black uppercase tracking-[0.2em] text-navy-muted hover:text-navy transition-all group active:scale-95">
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Return to List
        </button>
        <div className="flex gap-2 md:gap-4 w-full md:w-auto">
           <button onClick={() => setShowDecorator(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-6 py-3 md:py-3.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-white border border-beige-200 text-navy hover:border-gold transition-all shadow-soft active:scale-95">
              <i className="fa-solid fa-wand-magic-sparkles text-gold"></i> AI Staging
           </button>
           <button 
            onClick={() => onToggleShortlist(property.id)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-8 py-3 md:py-3.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border active:scale-95 ${isShortlisted ? 'bg-navy text-white border-navy shadow-elevated' : 'bg-white border-beige-200 text-navy-muted'}`}
          >
            <i className={`fa-${isShortlisted ? 'solid' : 'regular'} fa-bookmark text-xs`}></i>
            {isShortlisted ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        <div className="lg:col-span-8 space-y-6 md:space-y-10 px-4 md:px-0">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl md:rounded-[2.5rem] overflow-hidden border-4 md:border-6 border-white shadow-premium group bg-white">
            <img 
              src={activeImage} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
              onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }}
            />
            <div className="absolute top-3 md:top-6 left-3 md:left-6 flex flex-col gap-1.5 md:gap-2">
              {property.isVerified && (
                <div className="px-3 py-1.5 md:py-2 bg-success text-white text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-soft flex items-center gap-1.5 md:gap-2">
                  <i className="fa-solid fa-certificate"></i> Verified Asset
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowLive(true)}
              className="absolute bottom-3 md:bottom-6 right-3 md:right-6 bg-navy/95 backdrop-blur-md text-white px-5 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] shadow-elevated hover:bg-navy-ultra transition-all flex items-center gap-2 md:gap-3 active:scale-95"
            >
              <i className="fa-solid fa-headset text-gold text-xs md:text-base"></i> Virtual Briefing
            </button>
          </div>

          <div className="flex gap-2.5 md:gap-4 overflow-x-auto pb-2 no-scrollbar px-1">
            {propertyImages.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 w-20 sm:w-28 md:w-36 h-14 sm:h-20 md:h-24 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all duration-500 active:scale-95 ${activeImg === i ? 'border-navy scale-105 shadow-elevated' : 'border-transparent opacity-60'}`}
              >
                <img 
                  src={img || DEFAULT_IMAGE} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }}
                />
              </button>
            ))}
          </div>

          <div className="bg-white p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-beige-200 flex gap-1 md:gap-2 shadow-soft overflow-x-auto no-scrollbar mx-1">
            {(['OVERVIEW', 'LOCATION', 'FEATURES', 'PLAN'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[80px] py-2.5 md:py-3.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 active:scale-95 ${activeTab === tab ? 'bg-navy text-white shadow-premium' : 'text-navy-muted hover:text-navy hover:bg-beige-50'}`}
              >
                {tab === 'PLAN' ? 'Map' : tab === 'FEATURES' ? 'Specs' : tab === 'LOCATION' ? 'Satellite' : 'Summary'}
              </button>
            ))}
          </div>

          <div className="space-y-6 md:space-y-10 min-h-[300px] px-1">
            {activeTab === 'OVERVIEW' && (
              <div className="animate-in fade-in duration-700 space-y-8 md:space-y-12">
                <div className="space-y-3 md:space-y-6">
                  <h2 className="text-lg md:text-3xl font-[950] text-navy uppercase tracking-tighter">Strategic Narrative</h2>
                  <p className="font-sans text-navy-muted font-medium leading-relaxed text-sm md:text-lg border-l-4 md:border-l-8 border-gold/40 pl-5 md:pl-10 py-1 md:py-2 whitespace-pre-wrap">
                    {property.description}
                  </p>
                </div>
                <div className="space-y-4 md:space-y-8">
                  <h2 className="text-[10px] md:text-sm font-black text-navy uppercase tracking-[0.3em] flex items-center gap-3 md:gap-4">
                     <div className="h-px md:h-0.5 bg-beige-200 flex-1"></div>
                     Exclusive Amenities
                     <div className="h-px md:h-0.5 bg-beige-200 flex-1"></div>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                    {property.amenities.map((item, idx) => (
                      <div key={idx} className="bg-white border border-beige-200 px-4 md:px-6 py-3.5 md:py-5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase text-navy-muted flex items-center justify-center shadow-soft text-center leading-tight">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'LOCATION' && (
              <div className="animate-in fade-in duration-700 space-y-6 md:space-y-10">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-lg md:text-3xl font-[950] text-navy uppercase tracking-tighter">Geospatial Data</h2>
                    <button onClick={() => window.open(property.googleMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address?.addressLine || property.location || '')}`, '_blank')} className="w-full md:w-auto text-[9px] md:text-[10px] font-black uppercase tracking-widest text-navy bg-white px-6 md:px-8 py-3.5 md:py-3.5 rounded-xl md:rounded-xl border border-beige-200 shadow-soft active:scale-95">
                      External Map
                    </button>
                 </div>
                 <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl md:rounded-[2.5rem] overflow-hidden border-4 border-white shadow-premium bg-white">
                    <iframe src={mapSrc} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
                 </div>
              </div>
            )}

            {activeTab === 'FEATURES' && (
              <div className="animate-in fade-in duration-700 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                {Object.entries(property.features).map(([key, value]) => (
                  <div key={key} className="bg-white border border-beige-200 p-5 md:p-8 rounded-xl md:rounded-2xl flex items-center justify-between shadow-soft">
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-navy-muted">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <i className={`fa-solid ${value ? 'fa-circle-check text-success' : 'fa-circle-xmark text-alert'} text-lg md:text-2xl opacity-80`}></i>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'PLAN' && (
              <div className="animate-in fade-in duration-700 space-y-6 md:space-y-10">
                <h2 className="text-lg md:text-3xl font-[950] text-navy uppercase tracking-tighter">Structural Plan</h2>
                <div className="bg-white rounded-2xl md:rounded-[3rem] p-6 md:p-8 flex items-center justify-center border-4 border-white min-h-[300px] md:min-h-[500px] shadow-premium overflow-hidden">
                  {property.floorPlanUrl ? (
                    <img src={property.floorPlanUrl} className="max-w-full h-auto rounded-xl" alt="Floor Plan" />
                  ) : (
                    <div className="text-center opacity-30">
                      <i className="fa-solid fa-compass-drafting text-5xl md:text-8xl mb-4 md:mb-8 text-navy"></i>
                      <p className="text-[9px] md:text-[11px] font-black uppercase text-navy tracking-widest">Blueprint Pending</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-beige-200 space-y-6 md:space-y-10 shadow-premium mx-1">
             <button onClick={() => setShowDetails(!showDetails)} className="w-full flex justify-between items-center text-left group">
               <h2 className="text-base md:text-2xl font-[950] text-navy uppercase tracking-tighter">Technical Audit Summary</h2>
               <i className={`fa-solid ${showDetails ? 'fa-minus' : 'fa-plus'} text-xs md:text-lg text-navy-muted transition-transform`}></i>
             </button>
             {showDetails && (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 md:gap-y-10 gap-x-8 md:gap-x-16 pt-6 md:pt-10 border-t border-beige-100">
                  <div className="space-y-4 md:space-y-8">
                    <div className="flex justify-between border-b border-beige-50 pb-3 md:pb-4">
                      <span className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest">Protocol ID</span>
                      <span className="text-[10px] md:text-[13px] font-black text-navy">{property.propertyCode}</span>
                    </div>
                    <div className="flex justify-between border-b border-beige-50 pb-3 md:pb-4">
                      <span className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest">Lot Mass</span>
                      <span className="text-[10px] md:text-[13px] font-black text-navy">{property?.technicalDetails?.lotSize?.toLocaleString?.() || "-"} m²</span>
                    </div>
                  </div>
                  <div className="space-y-4 md:space-y-8">
                    <div className="flex justify-between border-b border-beige-50 pb-3 md:pb-4">
                      <span className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest">Value Index</span>
                      <span className="text-[10px] md:text-[13px] font-black text-gold">{formatPrice(property.price)}</span>
                    </div>
                    <div className="flex justify-between border-b border-beige-50 pb-3 md:pb-4">
                      <span className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest">Year Built</span>
                      <span className="text-[10px] md:text-[13px] font-black text-navy">{property.technicalDetails.yearBuilt || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-4 md:space-y-8">
                    <div className="flex justify-between border-b border-beige-50 pb-3 md:pb-4">
                      <span className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest">Net Volume</span>
                      <span className="text-[10px] md:text-[13px] font-black text-navy">{property?.sqft?.toLocaleString?.() || "-"} SQFT</span>
                    </div>
                    <div className="flex justify-between border-b border-beige-50 pb-3 md:pb-4">
                      <span className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest">Config</span>
                      <span className="text-[10px] md:text-[13px] font-black text-navy">{property.bhk || 'N/A'}</span>
                    </div>
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6 md:space-y-10 px-4 md:px-0">
           <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-3xl border border-beige-200 shadow-premium space-y-6 md:space-y-10 lg:sticky lg:top-20">
              <div className="space-y-4 md:space-y-6">
                <div className="text-3xl md:text-5xl font-[1000] text-navy tracking-tighter leading-none">
                  {formatPrice(property.price)}
                </div>
                <div className="bg-beige-50 border border-beige-200 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-inner">
                  <span className="text-[9px] md:text-[10px] font-black uppercase text-navy tracking-widest block mb-1.5 md:mb-2">Market Range Index</span>
                  <p className="text-[11px] md:text-[14px] font-bold text-navy-muted leading-relaxed italic">{getMarketPriceRange()}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 md:gap-6 py-5 md:py-8 border-y border-beige-100">
                <div className="text-center space-y-1.5 md:space-y-2">
                   <div className="text-gold/60"><i className="fa-solid fa-bed text-lg md:text-xl"></i></div>
                   <div className="text-base md:text-2xl font-[950] text-navy">{property.bhk?.toString().split(' ')?.[0] || '4'}</div>
                   <div className="text-[7px] md:text-[9px] font-black text-navy-muted uppercase tracking-widest">Rooms</div>
                </div>
                <div className="text-center space-y-1.5 md:space-y-2 border-x border-beige-50">
                   <div className="text-gold/60"><i className="fa-solid fa-bath text-lg md:text-xl"></i></div>
                   <div className="text-base md:text-2xl font-[950] text-navy">{property.technicalDetails.bathrooms || '5'}</div>
                   <div className="text-[7px] md:text-[9px] font-black text-navy-muted uppercase tracking-widest">Baths</div>
                </div>
                <div className="text-center space-y-1.5 md:space-y-2">
                   <div className="text-gold/60"><i className="fa-solid fa-maximize text-lg md:text-xl"></i></div>
                   <div className="text-base md:text-2xl font-[950] text-navy">{property?.sqft?.toLocaleString?.() || "-"}</div>
                   <div className="text-[7px] md:text-[9px] font-black text-navy-muted uppercase tracking-widest">Area</div>
                </div>
              </div>

              {!isRent && <MortgageCalculator propertyPrice={property.price} currencySymbol={currencySymbol} />}

              <div className="space-y-3 md:space-y-6 pt-2">
                <button onClick={handleWhatsAppBooking} className="w-full bg-navy text-white py-4 md:py-6 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-[12px] tracking-[0.3em] shadow-elevated hover:bg-navy-ultra transition-all active:scale-[0.98]">
                  Request Briefing
                </button>
                <div className="space-y-2.5 md:space-y-4">
                  <input 
                    type="text" 
                    placeholder="Professional Name" 
                    className="w-full bg-beige-50 border border-beige-200 rounded-xl md:rounded-xl px-5 md:px-5 py-3.5 md:py-4 text-[10px] md:text-xs font-black uppercase outline-none focus:border-gold/30 shadow-inner transition-all" 
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Contact Mobile" 
                    className="w-full bg-beige-50 border border-beige-200 rounded-xl md:rounded-xl px-5 md:px-5 py-3.5 md:py-4 text-[10px] md:text-xs font-black uppercase outline-none focus:border-gold/30 shadow-inner transition-all" 
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                  />
                  <button 
                    onClick={handleManualInquiry}
                    disabled={isSubmittingLead}
                    className="w-full bg-white text-navy border border-beige-200 py-3.5 md:py-4 rounded-xl md:rounded-xl font-black uppercase text-[10px] md:text-[11px] tracking-[0.3em] hover:bg-navy hover:text-white transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmittingLead ? <i className="fa-solid fa-sync animate-spin mr-2"></i> : 'Submit Interest'}
                  </button>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
