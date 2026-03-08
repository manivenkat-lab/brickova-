
import React, { useState, useRef, useEffect } from 'react';
import { Property, PropertyCategory, PropertyType, MembershipTier, BHKType, PropertyAddress, PropertyTechnicalDetails, Agent } from '../types';
import { generatePropertyDescription } from '../services/geminiService';
import { INDIAN_CITIES } from '../constants';
import { uploadMultipleImages, uploadImage } from '../services/storageService';
import { createProperty, updateProperty } from '../services/propertyService';

interface PropertyFormProps {
  onSuccess: (p: Property) => void;
  onCancel: () => void;
  initialData?: Property | null;
  role?: 'OWNER' | 'AGENT';
  agentProfile?: Agent; // Passing profile to check limits
  existingPropertiesCount?: number; // Count to check against limits
}

type FormTab = 'BASIC' | 'LOCATION' | 'STRUCTURAL' | 'REVIEW';

const DRAFT_KEY = 'mhomes_property_form_draft_v2';

const PropertyForm: React.FC<PropertyFormProps> = ({ onSuccess, onCancel, initialData, role, agentProfile, existingPropertiesCount = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FormTab>('BASIC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
  const [images, setImages] = useState<any[]>(initialData?.images || []);
  const [verificationDocUrl, setVerificationDocUrl] = useState<string>(initialData?.verificationDocUrl || '');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [docFile, setDocFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    propertyType: initialData?.propertyType || 'Flat',
    title: initialData?.title || '',
    price: initialData?.price?.toString() || '',
    pricePerSqft: initialData?.pricePerSqft?.toString() || '',
    location: initialData?.location || INDIAN_CITIES?.[0] || 'Mumbai',
    category: initialData?.category || PropertyCategory.DEVELOPED,
    bhk: initialData?.bhk || BHKType.BHK3,
    type: initialData?.type || PropertyType.SALE,
    sqft: initialData?.sqft?.toString() || '',
    facing: initialData?.facing || 'East',
    isCorner: initialData?.isCorner || false,
    openSides: initialData?.openSides?.toString() || '1',
    boundaryWall: initialData?.boundaryWall || false,
    roadWidth: initialData?.roadWidth?.toString() || '30',
    amenities: initialData?.amenities?.join(', ') || '',
    description: initialData?.description || '',
    floorPlanUrl: initialData?.floorPlanUrl || '',
    googleMapUrl: initialData?.googleMapUrl || '',
    ownerName: initialData?.ownerName || agentProfile?.name || '',
    ownerPhone: initialData?.ownerPhone || agentProfile?.phone || '',
    // Plot specific
    plotArea: initialData?.plotArea?.toString() || '',
    plotType: initialData?.plotType || 'Residential',
    approvedLayout: initialData?.approvedLayout || false,
    // Flat/Apartment specific
    floorNo: initialData?.floorNo?.toString() || '',
    totalFloors: initialData?.totalFloors?.toString() || '',
    bathrooms: initialData?.bathrooms?.toString() || '',
    furnishing: initialData?.furnishing || 'Unfurnished',
    balcony: initialData?.balcony || false,
    parking: initialData?.parking || false,
    ageOfProperty: initialData?.ageOfProperty?.toString() || '',
    // Villa specific
    builtUpArea: initialData?.builtUpArea?.toString() || '',
    garden: initialData?.garden || false,
    address: {
      addressLine: initialData?.address?.addressLine || '',
      city: initialData?.address?.city || '',
      area: initialData?.address?.area || '',
      state: initialData?.address?.state || '',
      zip: initialData?.address?.zip || '',
      country: initialData?.address?.country || 'India',
      floorNo: initialData?.address?.floorNo || '',
      roomNo: initialData?.address?.roomNo || ''
    },
    technicalDetails: {
      lotSize: initialData?.technicalDetails?.lotSize?.toString() || '',
      rooms: initialData?.technicalDetails?.rooms?.toString() || '',
      bathrooms: initialData?.technicalDetails?.bathrooms?.toString() || '',
      yearBuilt: initialData?.technicalDetails?.yearBuilt?.toString() || '',
      garages: initialData?.technicalDetails?.garages?.toString() || '',
      garageSize: initialData?.technicalDetails?.garageSize || '',
      availableFrom: initialData?.technicalDetails?.availableFrom || '',
      basement: initialData?.technicalDetails?.basement || '',
      externalConstruction: initialData?.technicalDetails?.externalConstruction || '',
      roofing: initialData?.technicalDetails?.roofing || ''
    }
  });

  const getListingLimit = (tier?: MembershipTier) => {
    if (role === 'OWNER') return 1; // Direct sellers get 1 free
    switch(tier) {
      case MembershipTier.FREE_AGENT: return 3;
      case MembershipTier.PRO_AGENT: return 15;
      case MembershipTier.ELITE_PARTNER: return 25;
      case MembershipTier.GOLD_AGENCY: return 50;
      case MembershipTier.PLATINUM_HUB: return 9999;
      default: return 1;
    }
  };

  useEffect(() => {
    if (!initialData) {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Draft error:", e);
        }
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialData) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      } catch (e) {
        console.warn("Draft persist failed", e);
      }
    }
  }, [formData, initialData]);

  const fileToDataUri = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files].slice(0, 10));
      const uris = await Promise.all(files.map(fileToDataUri));
      setImages(prev => [...prev, ...uris].slice(0, 10));
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFile(file);
      try {
        const uri = await fileToDataUri(file);
        setVerificationDocUrl(uri);
      } catch (error) {
        alert("Error reading file.");
      }
    }
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        setFormData(prev => ({ ...prev, googleMapUrl: mapsLink }));
        setIsDetectingLocation(false);
      }, () => {
        setIsDetectingLocation(false);
        alert("GPS Signal denied.");
      });
    } else {
      setIsDetectingLocation(false);
      alert("Browser doesn't support geolocation.");
    }
  };

  useEffect(() => {
    if (formData.category === PropertyCategory.PLOT && formData.sqft && formData.pricePerSqft) {
      const calculatedTotal = Number(formData.sqft) * Number(formData.pricePerSqft);
      if (!isNaN(calculatedTotal)) {
        setFormData(prev => ({ ...prev, price: calculatedTotal.toString() }));
      }
    }
  }, [formData.sqft, formData.pricePerSqft, formData.category]);

  const handleGeminiGen = async () => {
    if (!formData.title || !formData.location) {
      alert("Missing basic info.");
      return;
    }
    setLoading(true);
    const desc = await generatePropertyDescription({
      title: formData.title,
      location: formData.location,
      bhk: formData.category === PropertyCategory.PLOT ? 'Plot/Land' : formData.bhk.toString(),
      amenities: formData.amenities.split(',').map(s => s.trim())
    });
    setFormData({...formData, description: desc || ''});
    setLoading(false);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, address: { ...formData.address, [name]: value } });
  };

  const handleTechChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, technicalDetails: { ...formData.technicalDetails, [name]: value } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enforcement Logic
    if (!initialData) {
      const limit = getListingLimit(agentProfile?.tier);
      if (existingPropertiesCount >= limit) {
        alert(`Inventory Limit Reached. Your current schema (${agentProfile?.tier || 'Individual'}) supports max ${limit} active listings. Upgrade via Partner Hub for higher volume.`);
        return;
      }
    }

    if (images.length === 0) { alert("At least one image is required."); return; }
    if (!verificationDocUrl) { alert("Verification document required."); return; }

    setIsSubmitting(true);
    try {
      let finalImages = [...images];
      let finalDocUrl = verificationDocUrl;

      // Upload new files if any
      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadMultipleImages(imageFiles, 'properties');
        // Filter out data URIs and replace with real URLs
        const existingUrls = images.filter(img => !img.startsWith('data:'));
        finalImages = [...existingUrls, ...uploadedUrls];
      }

      if (docFile) {
        finalDocUrl = await uploadImage(docFile, 'documents');
      }

      const p: any = {
        propertyCode: initialData?.propertyCode || `MH-${Math.floor(Math.random() * 900) + 100}`,
        category: formData.category,
        propertyType: formData.propertyType,
        ownerId: agentProfile?.id || initialData?.ownerId || 'current-user',
        agencyId: agentProfile?.agencyId || initialData?.agencyId,
        listedBy: initialData?.listedBy || role || 'OWNER',
        tier: agentProfile?.tier || initialData?.tier || MembershipTier.FREE_AGENT,
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        pricePerSqft: formData.propertyType === 'Plot' ? Number(formData.pricePerSqft) : undefined,
        location: formData.location,
        googleMapUrl: formData.googleMapUrl,
        address: formData.address,
        technicalDetails: {
          lotSize: formData.technicalDetails.lotSize ? Number(formData.technicalDetails.lotSize) : undefined,
          rooms: formData.technicalDetails.rooms ? Number(formData.technicalDetails.rooms) : undefined,
          bathrooms: formData.technicalDetails.bathrooms ? Number(formData.technicalDetails.bathrooms) : undefined,
          yearBuilt: formData.technicalDetails.yearBuilt ? Number(formData.technicalDetails.yearBuilt) : undefined,
          garages: formData.technicalDetails.garages ? Number(formData.technicalDetails.garages) : undefined,
          garageSize: formData.technicalDetails.garageSize,
          availableFrom: formData.technicalDetails.availableFrom,
          basement: formData.technicalDetails.basement,
          externalConstruction: formData.technicalDetails.externalConstruction,
          roofing: formData.technicalDetails.roofing
        },
        type: formData.type,
        bhk: formData.propertyType !== 'Plot' ? formData.bhk : undefined,
        facing: formData.propertyType === 'Plot' ? formData.facing as any : undefined,
        isCorner: formData.propertyType === 'Plot' ? formData.isCorner : undefined,
        openSides: formData.propertyType === 'Plot' ? Number(formData.openSides) : undefined,
        boundaryWall: formData.propertyType === 'Plot' ? formData.boundaryWall : undefined,
        roadWidth: formData.propertyType === 'Plot' ? Number(formData.roadWidth) : undefined,
        plotArea: formData.propertyType === 'Plot' || formData.propertyType === 'Villa' ? Number(formData.plotArea) : undefined,
        plotType: formData.propertyType === 'Plot' ? formData.plotType : undefined,
        approvedLayout: formData.propertyType === 'Plot' ? formData.approvedLayout : undefined,
        floorNo: (formData.propertyType === 'Flat' || formData.propertyType === 'Apartment') ? Number(formData.floorNo) : undefined,
        totalFloors: (formData.propertyType === 'Flat' || formData.propertyType === 'Apartment' || formData.propertyType === 'Villa') ? Number(formData.totalFloors) : undefined,
        bathrooms: formData.propertyType !== 'Plot' ? Number(formData.bathrooms) : undefined,
        furnishing: formData.propertyType !== 'Plot' ? formData.furnishing : undefined,
        balcony: (formData.propertyType === 'Flat' || formData.propertyType === 'Apartment') ? formData.balcony : undefined,
        parking: formData.propertyType !== 'Plot' ? formData.parking : undefined,
        ageOfProperty: (formData.propertyType === 'Flat' || formData.propertyType === 'Apartment') ? Number(formData.ageOfProperty) : undefined,
        builtUpArea: formData.propertyType === 'Villa' ? Number(formData.builtUpArea) : undefined,
        garden: formData.propertyType === 'Villa' ? formData.garden : undefined,
        images: finalImages,
        verificationDocUrl: finalDocUrl,
        floorPlanUrl: formData.floorPlanUrl,
        energyRating: initialData?.energyRating || 'A',
        energyIndex: initialData?.energyIndex || 120,
        ownerName: formData.ownerName || initialData?.ownerName || agentProfile?.name || 'Strategic Partner',
        ownerEmail: initialData?.ownerEmail || agentProfile?.email || 'admin@global.mhomes',
        ownerPhone: formData.ownerPhone || initialData?.ownerPhone || agentProfile?.phone || '',
        amenities: formData.amenities.split(',').map(s => s.trim()),
        sqft: Number(formData.sqft),
        isVerified: (agentProfile?.tier !== MembershipTier.FREE_AGENT) || initialData?.isVerified || false,
        blockchainHash: initialData?.blockchainHash || ('0x' + Math.random().toString(16).substr(2, 8)),
        neighborhoodScores: initialData?.neighborhoodScores || { schools: 4.5, safety: 4.2, connectivity: 4.8, lifestyle: 4.8 },
        features: initialData?.features || { smartHome: true, pool: false, gym: true, security247: true, centralAir: true, evCharging: true, equippedKitchen: true, mediaRoom: false },
        stats: initialData?.stats || { views: 0, leads: 0, interests: 0 },
        status: "active"
      };
      
      if (initialData?.id) {
        await updateProperty(initialData.id, p);
        setIsSubmitting(false);
        alert("Property updated successfully");
        onSuccess({ ...p, id: initialData.id });
      } else {
        const id = await createProperty(p, agentProfile?.id || initialData?.ownerId || 'current-user', agentProfile?.agencyId || initialData?.agencyId || null);
        setIsSubmitting(false);
        alert("Property listed successfully");
        onSuccess({ ...p, id });
      }

      localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to list property. Please try again.");
      setIsSubmitting(false);
    }
  };

  const tabs: { id: FormTab; label: string; icon: string }[] = [
    { id: 'BASIC', label: 'Basics', icon: 'fa-signature' },
    { id: 'LOCATION', label: 'Address', icon: 'fa-location-dot' },
    { id: 'STRUCTURAL', label: 'Configuration', icon: 'fa-ruler-combined' },
    { id: 'REVIEW', label: 'Verification', icon: 'fa-shield-halved' }
  ];

  return (
    <div className="bg-white rounded-none md:rounded-[2rem] overflow-hidden shadow-premium w-full h-full md:h-auto md:max-h-[92vh] flex flex-col border-none md:border md:border-beige-200">
      <div className="bg-navy p-6 md:p-10 text-white shrink-0">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-lg md:text-2xl font-[900] uppercase tracking-tighter">
            {initialData ? 'Update Property' : 'List New Property'}
          </h2>
          <button onClick={onCancel} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex gap-1 md:gap-2 bg-white/5 p-1 rounded-lg md:rounded-xl border border-white/10 shadow-inner overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => !isSubmitting && setActiveTab(tab.id)}
              disabled={isSubmitting}
              className={`flex-1 min-w-[70px] md:min-w-[100px] py-2 md:py-3 px-1 md:px-3 rounded-md md:rounded-lg flex items-center justify-center gap-1.5 md:gap-2 text-[7px] md:text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-gold text-white shadow-premium' : 'text-white/40 hover:bg-white/5'}`}
            >
              <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`}></i>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 md:p-10 bg-beige-50/30 custom-scrollbar no-scrollbar">
        {isSubmitting ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 animate-in zoom-in-95 duration-1000">
            <div className="relative">
               <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-gold/10 rounded-full"></div>
               <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-t-gold rounded-full absolute inset-0 animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center text-gold"><i className="fa-solid fa-microchip text-xl md:text-2xl"></i></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-base md:text-lg font-[900] text-navy uppercase tracking-widest">Processing Data...</h3>
              <p className="text-[8px] md:text-[10px] font-black text-navy-muted uppercase tracking-[0.3em] opacity-60">Listing your asset on the network.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {activeTab === 'BASIC' && (
              <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1.5">
                  <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Property Type</label>
                  <select 
                    className="w-full bg-white border border-beige-200 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-navy outline-none cursor-pointer shadow-soft appearance-none transition-all" 
                    value={formData.propertyType} 
                    onChange={e => {
                      const val = e.target.value as any;
                      setFormData({
                        ...formData, 
                        propertyType: val,
                        category: val === 'Plot' ? PropertyCategory.PLOT : PropertyCategory.DEVELOPED
                      });
                    }}
                  >
                    <option value="Plot">Plot</option>
                    <option value="Flat">Flat</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>

                <div className="space-y-4 md:space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Property / Project Title</label>
                    <input type="text" placeholder="e.g. Prestige Heights, Mantri Towers..." className="w-full bg-white border border-beige-200 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy outline-none focus:border-gold/50 shadow-soft transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Transaction Type</label>
                      <select className="w-full bg-white border border-beige-200 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-navy outline-none cursor-pointer shadow-soft appearance-none transition-all" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                        <option value={PropertyType.SALE}>Outright Sale</option>
                        <option value={PropertyType.RENT}>Rent / Lease</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Primary City</label>
                      <select className="w-full bg-white border border-beige-200 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-navy outline-none cursor-pointer shadow-soft appearance-none transition-all" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>{INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Owner / Agent Name</label>
                      <input type="text" placeholder="Full Name" className="w-full bg-white border border-beige-200 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy outline-none shadow-soft" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Contact Number</label>
                      <input type="tel" placeholder="Phone Number" className="w-full bg-white border border-beige-200 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy outline-none shadow-soft" value={formData.ownerPhone} onChange={e => setFormData({...formData, ownerPhone: e.target.value})} required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Total Price (₹)</label>
                    <input type="number" placeholder="Enter total value in INR" className="w-full bg-white border border-beige-200 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy outline-none shadow-soft" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between items-center border-b border-beige-200 pb-2">
                      <h4 className="text-[8px] md:text-[10px] font-black uppercase text-navy tracking-[0.2em]">Detailed Description</h4>
                      <button type="button" onClick={handleGeminiGen} disabled={loading} className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-gold bg-gold/10 border border-gold/30 px-3 py-1.5 md:px-4 md:py-2 rounded-md md:rounded-lg hover:bg-gold hover:text-white transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50">
                        <i className={`fa-solid fa-microchip-ai ${loading ? 'animate-pulse' : ''}`}></i> AI Auto-Fill
                      </button>
                   </div>
                   <textarea placeholder="Highlight key features, connectivity, and locality advantages..." className="w-full bg-white border border-beige-200 rounded-lg md:rounded-2xl px-4 py-3 md:px-6 md:py-5 text-[10px] md:text-xs font-medium text-navy-muted outline-none h-24 md:h-32 focus:border-gold/50 shadow-soft resize-none leading-relaxed transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <button type="button" onClick={() => setActiveTab('LOCATION')} className="w-full py-4 md:py-5 bg-navy text-white rounded-lg md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.3em] shadow-navy hover:bg-navy-ultra transition-all flex items-center justify-center gap-3 active:scale-[0.98]">Address & Mapping <i className="fa-solid fa-chevron-right text-gold"></i></button>
              </div>
            )}

            {activeTab === 'LOCATION' && (
              <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Flat / House / Plot No. & Street</label>
                    <input name="addressLine" type="text" placeholder="Plot 24, Street 5, Hitech City..." className="w-full bg-white border border-beige-200 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy outline-none shadow-soft" value={formData.address.addressLine} onChange={handleAddressChange} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Area / Locality</label>
                      <input name="area" type="text" placeholder="e.g. Indiranagar, Juhu..." className="w-full bg-white border border-beige-200 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy outline-none shadow-soft" value={formData.address.area} onChange={handleAddressChange} required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">City</label>
                      <input name="city" type="text" placeholder="e.g. Bangalore, Mumbai..." className="w-full bg-white border border-beige-200 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy outline-none shadow-soft" value={formData.address.city} onChange={handleAddressChange} required />
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 bg-white border border-beige-200 rounded-xl md:rounded-[2rem] text-center space-y-4 md:space-y-6 shadow-premium">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-beige-50 rounded-lg md:rounded-2xl flex items-center justify-center mx-auto border border-beige-200 text-gold shadow-sm text-xl md:text-2xl">
                    <i className="fa-solid fa-satellite"></i>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm md:text-base font-[900] text-navy uppercase tracking-widest">Geo-Location Pin</h4>
                    <p className="text-[8px] md:text-[9px] font-bold text-navy-muted uppercase tracking-[0.2em] max-w-xs mx-auto">Get exact coordinates via GPS.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    className="bg-navy text-white px-6 py-3.5 md:px-8 md:py-4 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-navy-ultra transition-all flex items-center gap-2 md:gap-3 mx-auto shadow-navy disabled:opacity-50 active:scale-95"
                  >
                    {isDetectingLocation ? (
                      <><i className="fa-solid fa-sync animate-spin text-gold"></i> Locating...</>
                    ) : (
                      <><i className="fa-solid fa-location-arrow text-gold"></i> Use Current Location</>
                    )}
                  </button>
                </div>

                <div className="flex gap-3 md:gap-4 pt-4">
                  <button type="button" onClick={() => setActiveTab('BASIC')} className="flex-1 py-4 md:py-5 border border-beige-200 text-navy-muted rounded-lg md:rounded-2xl font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-soft">Back</button>
                  <button type="button" onClick={() => setActiveTab('STRUCTURAL')} className="flex-[2] py-4 md:py-5 bg-navy text-white rounded-lg md:rounded-2xl font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-navy hover:bg-navy-ultra transition-all flex items-center justify-center gap-2 md:gap-3">Property Config <i className="fa-solid fa-chevron-right text-gold"></i></button>
                </div>
              </div>
            )}
            
            {activeTab === 'STRUCTURAL' && (
              <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="p-5 md:p-6 bg-white border border-beige-200 rounded-xl md:rounded-[2rem] shadow-soft space-y-4 md:space-y-6">
                   <h4 className="text-[8px] md:text-[10px] font-black text-navy uppercase tracking-widest border-b border-beige-100 pb-2 md:pb-3">Property Parameters</h4>
                   
                   {formData.propertyType === 'Plot' ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Plot Area (SQFT)</label>
                           <input type="number" className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy shadow-inner outline-none" value={formData.plotArea} onChange={e => setFormData({...formData, plotArea: e.target.value, sqft: e.target.value})} required />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Plot Facing</label>
                           <select className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-navy shadow-inner outline-none" value={formData.facing} onChange={e => setFormData({...formData, facing: e.target.value as any})}>
                             <option value="East">East</option><option value="West">West</option><option value="North">North</option><option value="South">South</option>
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Road Width (FT)</label>
                           <input type="number" className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy shadow-inner outline-none" value={formData.roadWidth} onChange={e => setFormData({...formData, roadWidth: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Plot Type</label>
                           <select className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-navy shadow-inner outline-none" value={formData.plotType} onChange={e => setFormData({...formData, plotType: e.target.value as any})}>
                             <option value="Residential">Residential</option><option value="Commercial">Commercial</option>
                           </select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                           <input type="checkbox" className="w-4 h-4 rounded border-beige-300 text-gold focus:ring-gold" checked={formData.isCorner} onChange={e => setFormData({...formData, isCorner: e.target.checked})} />
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest">Corner Plot</label>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                           <input type="checkbox" className="w-4 h-4 rounded border-beige-300 text-gold focus:ring-gold" checked={formData.approvedLayout} onChange={e => setFormData({...formData, approvedLayout: e.target.checked})} />
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest">Approved Layout</label>
                        </div>
                     </div>
                   ) : (formData.propertyType === 'Flat' || formData.propertyType === 'Apartment') ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">BHK Type</label>
                           <select className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-navy shadow-inner outline-none" value={formData.bhk} onChange={e => setFormData({...formData, bhk: e.target.value as any})}>
                             {Object.values(BHKType).map(t => <option key={t} value={t}>{t}</option>)}
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Floor Number</label>
                           <input type="number" className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy shadow-inner outline-none" value={formData.floorNo} onChange={e => setFormData({...formData, floorNo: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Total Floors</label>
                           <input type="number" className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy shadow-inner outline-none" value={formData.totalFloors} onChange={e => setFormData({...formData, totalFloors: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Bathrooms</label>
                           <input type="number" className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy shadow-inner outline-none" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Furnishing</label>
                           <select className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-navy shadow-inner outline-none" value={formData.furnishing} onChange={e => setFormData({...formData, furnishing: e.target.value as any})}>
                             <option value="Unfurnished">Unfurnished</option><option value="Semi-Furnished">Semi-Furnished</option><option value="Fully-Furnished">Fully-Furnished</option>
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Age of Property (Yrs)</label>
                           <input type="number" className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy shadow-inner outline-none" value={formData.ageOfProperty} onChange={e => setFormData({...formData, ageOfProperty: e.target.value})} />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                           <input type="checkbox" className="w-4 h-4 rounded border-beige-300 text-gold focus:ring-gold" checked={formData.balcony} onChange={e => setFormData({...formData, balcony: e.target.checked})} />
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest">Balcony</label>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                           <input type="checkbox" className="w-4 h-4 rounded border-beige-300 text-gold focus:ring-gold" checked={formData.parking} onChange={e => setFormData({...formData, parking: e.target.checked})} />
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest">Parking</label>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Carpet Area (SQFT)</label>
                           <input type="number" className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy shadow-inner outline-none" value={formData.sqft} onChange={e => setFormData({...formData, sqft: e.target.value})} required />
                        </div>
                     </div>
                   ) : (
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">BHK Type</label>
                           <select className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-navy shadow-inner outline-none" value={formData.bhk} onChange={e => setFormData({...formData, bhk: e.target.value as any})}>
                             {Object.values(BHKType).map(t => <option key={t} value={t}>{t}</option>)}
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Built-up Area (SQFT)</label>
                           <input type="number" className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy shadow-inner outline-none" value={formData.builtUpArea} onChange={e => setFormData({...formData, builtUpArea: e.target.value, sqft: e.target.value})} required />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Plot Area (SQFT)</label>
                           <input type="number" className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy shadow-inner outline-none" value={formData.plotArea} onChange={e => setFormData({...formData, plotArea: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Total Floors</label>
                           <input type="number" className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[10px] md:text-xs font-bold text-navy shadow-inner outline-none" value={formData.totalFloors} onChange={e => setFormData({...formData, totalFloors: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest ml-2">Furnishing</label>
                           <select className="w-full bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-3 py-2.5 md:px-5 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-navy shadow-inner outline-none" value={formData.furnishing} onChange={e => setFormData({...formData, furnishing: e.target.value as any})}>
                             <option value="Unfurnished">Unfurnished</option><option value="Semi-Furnished">Semi-Furnished</option><option value="Fully-Furnished">Fully-Furnished</option>
                           </select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                           <input type="checkbox" className="w-4 h-4 rounded border-beige-300 text-gold focus:ring-gold" checked={formData.parking} onChange={e => setFormData({...formData, parking: e.target.checked})} />
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest">Parking</label>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                           <input type="checkbox" className="w-4 h-4 rounded border-beige-300 text-gold focus:ring-gold" checked={formData.garden} onChange={e => setFormData({...formData, garden: e.target.checked})} />
                           <label className="text-[8px] md:text-[10px] font-black uppercase text-navy-muted tracking-widest">Garden / Lawn</label>
                        </div>
                     </div>
                   )}
                </div>

                <div className="flex gap-3 md:gap-4 pt-4">
                   <button type="button" onClick={() => setActiveTab('LOCATION')} className="flex-1 py-4 md:py-5 border border-beige-200 text-navy-muted rounded-lg md:rounded-2xl font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-soft">Back</button>
                   <button type="button" onClick={() => setActiveTab('REVIEW')} className="flex-[2] py-4 md:py-5 bg-navy text-white rounded-lg md:rounded-2xl font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-navy hover:bg-navy-ultra transition-all flex items-center justify-center gap-2 md:gap-3">Verification Docs <i className="fa-solid fa-chevron-right text-gold"></i></button>
                </div>
              </div>
            )}

            {activeTab === 'REVIEW' && (
              <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-5 md:p-6 bg-white border border-beige-200 rounded-xl md:rounded-[2rem] shadow-soft space-y-4 md:space-y-6">
                    <div className="flex items-center gap-2 md:gap-3 border-b border-beige-100 pb-2 md:pb-3">
                       <i className="fa-solid fa-file-contract text-gold text-lg md:text-xl"></i>
                       <h5 className="text-[9px] md:text-[11px] font-black text-navy uppercase tracking-[0.2em]">Title Documents</h5>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <div className="relative group">
                         <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleDocUpload} />
                         <div className={`w-full border-2 border-dashed rounded-xl md:rounded-2xl px-4 py-6 md:px-5 md:py-8 text-center transition-all duration-300 ${verificationDocUrl ? 'border-success bg-success/5' : 'border-beige-300 bg-beige-50'}`}>
                            <i className={`fa-solid ${verificationDocUrl ? 'fa-file-circle-check text-success' : 'fa-file-shield text-navy-muted'} text-2xl md:text-3xl mb-2 md:mb-3`}></i>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-navy">{verificationDocUrl ? 'Document Attached' : 'Upload Sale Deed / RERA PDF'}</p>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 md:p-6 bg-white border border-beige-200 rounded-xl md:rounded-[2rem] shadow-soft space-y-4 md:space-y-6">
                    <div className="flex items-center gap-2 md:gap-3 border-b border-beige-100 pb-2 md:pb-3">
                       <i className="fa-solid fa-camera-retro text-gold text-lg md:text-xl"></i>
                       <h5 className="text-[9px] md:text-[11px] font-black text-navy uppercase tracking-[0.2em]">Property Photos</h5>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[8px] md:text-[9px] font-black uppercase text-navy-muted tracking-widest ml-2 block">Upload Gallery ({images.length}/10)</label>
                      <div className="grid grid-cols-5 md:grid-cols-4 gap-1.5 md:gap-2 mb-2">
                         {images.map((img, i) => (
                           <div key={i} className="aspect-square rounded-md md:rounded-lg border border-beige-200 overflow-hidden relative group">
                              <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125" />
                              <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-navy/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><i className="fa-solid fa-trash-can text-[10px]"></i></button>
                           </div>
                         ))}
                         {images.length < 10 && (
                           <div className="aspect-square rounded-md md:rounded-lg border-2 border-dashed border-beige-300 bg-beige-50 flex items-center justify-center text-navy-muted relative cursor-pointer hover:border-gold">
                             <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                             <i className="fa-solid fa-plus text-xs"></i>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-navy p-6 md:p-10 rounded-xl md:rounded-[2rem] shadow-premium text-center space-y-3 md:space-y-4 relative overflow-hidden group">
                   <p className="text-[8px] md:text-[9px] font-black text-white/50 uppercase tracking-[0.3em] relative z-10">Property System ID:</p>
                   <div className="inline-block px-4 py-2 md:px-8 md:py-3 bg-white/5 border border-gold/30 rounded-lg md:rounded-xl relative z-10">
                      <span className="text-base md:text-xl font-[900] text-gold tracking-tighter uppercase font-serif italic">MH-VERIFIED-IND</span>
                   </div>
                </div>

                <button type="submit" className="w-full bg-navy text-white py-4 md:py-6 rounded-lg md:rounded-2xl font-black uppercase text-[10px] md:text-[12px] tracking-[0.3em] md:tracking-[0.4em] shadow-navy hover:bg-navy-ultra transition-all active:scale-[0.98]">Post Property Listing</button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default PropertyForm;
