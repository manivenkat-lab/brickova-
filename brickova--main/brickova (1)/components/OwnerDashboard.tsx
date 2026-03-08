
import React, { useState, useEffect, useMemo } from 'react';
import { Property, PropertyType, PropertyCategory } from '../types';
import PropertyForm from './PropertyForm';
import { getMyProperties } from '../services/propertyService';
import { auth } from '../firebase';

interface OwnerDashboardProps {
  properties: Property[];
  onAddProperty: (p: Property) => void;
  onUpdateProperty: (p: Property) => void;
  onUpdateAvailability: (id: string) => void;
  onDeleteProperty: (id: string) => void;
  role: 'OWNER' | 'AGENT';
  onLogout: () => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ 
  properties, 
  onAddProperty, 
  onUpdateProperty,
  onDeleteProperty,
  role,
  onLogout
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [activeView, setActiveView] = useState<'LISTINGS' | 'INTERESTS'>('LISTINGS');
  const myProperties = useMemo(() => {
    if (!auth.currentUser) return [];
    return properties.filter(p => p.ownerId === auth.currentUser?.uid);
  }, [properties]);

  if (isAdding || editingProperty) return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8">
       <div className="absolute inset-0 bg-navy/60 backdrop-blur-xl" onClick={() => { setIsAdding(false); setEditingProperty(null); }}></div>
       <div className="relative w-full max-w-2xl animate-in zoom-in-95 duration-500">
          <PropertyForm 
            role={role} 
            initialData={editingProperty}
            onSuccess={(p) => { 
              if (editingProperty) {
                onUpdateProperty(p);
              } else {
                onAddProperty(p);
              }
              setIsAdding(false); 
              setEditingProperty(null);
            }} 
            onCancel={() => { setIsAdding(false); setEditingProperty(null); }} 
          />
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-24 animate-in fade-in duration-700 text-navy">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10 mb-12 md:mb-20">
        <div className="space-y-2 md:space-y-4">
          <h2 className="text-3xl md:text-5xl font-[900] text-navy tracking-tighter uppercase">
            {role === 'AGENT' ? 'Agent Dashboard' : 'Seller Dashboard'}
          </h2>
          <p className="text-navy-muted font-bold uppercase tracking-[0.3em] text-[10px] md:text-[11px]">
            Manage your property listings and track interested buyers.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onLogout}
            className="px-8 py-5 rounded-[2rem] border-2 border-beige-200 text-navy-muted font-black uppercase tracking-widest text-[10px] hover:bg-beige-50 transition-all flex items-center justify-center gap-3"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-navy text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.25em] text-[10px] hover:bg-navy-ultra transition-all shadow-navy flex items-center justify-center gap-4 active:scale-[0.98]"
          >
            <i className="fa-solid fa-plus text-gold"></i> Add Property
          </button>
        </div>
      </div>

      <div className="flex gap-10 mb-16 border-b border-beige-200">
         {(['LISTINGS', 'INTERESTS'] as const).map(v => (
           <button 
             key={v}
             onClick={() => setActiveView(v)}
             className={`pb-6 font-black text-xs uppercase tracking-[0.4em] transition-all border-b-4 ${activeView === v ? 'text-navy border-gold' : 'text-navy-muted border-transparent hover:text-navy hover:border-beige-200'}`}
           >
             {v === 'LISTINGS' ? 'My Listings' : 'Interested Buyers'}
           </button>
         ))}
      </div>

      {activeView === 'LISTINGS' && (
        <div className="space-y-10">
          {myProperties.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {(myProperties ?? []).map(p => (
                <div key={p.id} className="bg-white rounded-[3rem] p-8 md:p-10 border border-beige-200 flex flex-col md:flex-row gap-8 md:gap-10 items-center group hover:border-navy/20 transition-all shadow-soft">
                  <div className="w-full md:w-56 h-48 md:h-36 overflow-hidden rounded-2xl flex-shrink-0 relative border-2 border-beige-50 shadow-sm">
                    <img 
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'; }}
                    />
                    <div className="absolute top-3 left-3 bg-navy/90 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-black text-white uppercase tracking-widest shadow-soft">
                       {p.category === PropertyCategory.PLOT ? 'Commercial' : 'Residency'}
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-[900] text-navy uppercase truncate max-w-[220px] tracking-tight">{p.title}</h3>
                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${p.isVerified ? 'bg-success/5 text-success border-success/20 shadow-soft' : 'bg-alert/5 text-alert border-alert/20'}`}>
                          {p.isVerified ? 'Verified' : 'Pending'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-black text-navy">₹{p.price != null ? Number(p.price).toLocaleString('en-IN') : "Price on request"}</p>
                        {p.category === PropertyCategory.PLOT && (
                           <span className="text-[10px] text-navy-muted font-black uppercase tracking-widest opacity-60">(@ ₹{p.pricePerSqft != null ? Number(p.pricePerSqft).toLocaleString('en-IN') : "0"}/sqft)</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 border-y border-beige-100 py-4">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-navy-muted tracking-widest opacity-50">Views</span>
                          <span className="text-sm font-black text-navy">{p.stats?.views != null ? Number(p.stats.views).toLocaleString('en-IN') : '0'} Views</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-navy-muted tracking-widest opacity-50">Property ID</span>
                          <span className="text-sm font-black text-navy">{p.propertyCode}</span>
                       </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setEditingProperty(p)} className="flex-1 py-4 bg-beige-50 text-navy rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-navy hover:text-white border border-beige-200 transition-all active:scale-[0.98]">Edit Property</button>
                      <button onClick={() => onDeleteProperty(p.id)} className="px-6 py-4 border-2 border-alert/20 text-alert rounded-2xl hover:bg-alert hover:text-white transition-all active:scale-[0.95]"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 md:py-48 bg-white rounded-[3rem] md:rounded-[4rem] border-4 border-dashed border-beige-200 p-6">
               <i className="fa-solid fa-folder-closed text-6xl md:text-8xl text-beige-200 mb-6 md:mb-10"></i>
               <p className="font-black uppercase text-[10px] md:text-xs tracking-[0.5em] text-navy-muted">You haven't added any properties yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
