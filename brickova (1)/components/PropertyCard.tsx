import React from 'react';
import { Property, PropertyType, PropertyCategory } from '../types';

interface PropertyCardProps {
  property: Property;
  isShortlisted?: boolean;
  onToggleShortlist: (id: string) => void;
  onSelect: (p: Property) => void;
  formatPrice: (price: number) => string;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800';

const PropertyCard: React.FC<PropertyCardProps> = ({ property, isShortlisted, onToggleShortlist, onSelect, formatPrice }) => {
  const propertyImage = property?.images?.[0] || DEFAULT_IMAGE;

  return (
    <div 
      className="group bg-white rounded-2xl md:rounded-[2rem] overflow-hidden border border-beige-200 hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full relative cursor-pointer"
      onClick={() => onSelect(property)}
    >
      <div className="relative h-56 sm:h-60 md:h-64 overflow-hidden">
        <img 
          src={propertyImage} 
          alt={property?.title || "Property"} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_IMAGE;
          }}
        />
        <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-1.5 md:gap-2">
           {property?.isVerified && (
             <div className="px-2.5 py-1.5 md:px-3 md:py-1.5 bg-success text-white text-[8px] md:text-[8px] font-black uppercase tracking-[0.2em] rounded-md shadow-glass flex items-center gap-1.5 md:gap-1.5">
                <i className="fa-solid fa-shield-halved text-[9px] md:text-[10px]"></i> Verified
             </div>
           )}
           <div className={`px-2.5 py-1.5 md:px-3 md:py-1.5 ${property?.type === PropertyType.RENT ? 'bg-navy-light' : 'bg-navy'} text-white text-[8px] md:text-[8px] font-black uppercase tracking-[0.2em] rounded-md shadow-glass`}>
              {property?.category === PropertyCategory.PLOT ? 'Commercial Land' : property?.type === PropertyType.RENT ? 'Rent' : 'Direct Sale'}
           </div>
        </div>
        
        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-white/90 backdrop-blur-md text-navy px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-md text-[8px] md:text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 md:gap-2 border border-beige-200/50">
           <i className="fa-solid fa-chart-line text-gold"></i> {property?.stats?.views != null ? Number(property.stats.views).toLocaleString('en-IN') : '0'} Reach
        </div>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleShortlist(property?.id || "");
        }}
        className={`absolute top-[12.5rem] sm:top-[14.5rem] md:top-[15.5rem] right-4 md:right-4 w-11 h-11 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all z-10 shadow-elevated border-2 active:scale-90 ${isShortlisted ? 'bg-navy border-navy text-white' : 'bg-white border-beige-200 text-navy-muted hover:text-gold'}`}
      >
        <i className={`fa-${isShortlisted ? 'solid' : 'regular'} fa-bookmark text-sm md:text-xs`}></i>
      </button>

      <div className="p-5 md:p-8 flex flex-col flex-1 space-y-4 md:space-y-5">
        <div className="space-y-2 md:space-y-3">
           <h3 className="text-sm md:text-lg font-black text-navy leading-tight group-hover:text-gold transition-colors tracking-tight uppercase line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] font-montserrat">
            {property?.title ?? "Untitled"}
           </h3>
           
           <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-xs md:text-sm font-black text-gold font-montserrat">
                {formatPrice(property?.price || 0)}
              </span>
              <div className="flex items-center gap-3 text-[8px] md:text-[9px] font-black text-navy-muted uppercase tracking-widest">
                {property?.propertyType !== 'Plot' && (
                  <span className="flex items-center gap-1.5"><i className="fa-solid fa-bed opacity-40"></i> {property?.bhk ?? "-"}</span>
                )}
                <span className="flex items-center gap-1.5"><i className="fa-solid fa-ruler-combined opacity-40"></i> {property?.sqft ?? property?.plotArea ?? "-"} SQFT</span>
              </div>
           </div>

           <p className="text-[8px] md:text-[9px] text-navy-muted font-black uppercase tracking-[0.15em] md:tracking-[0.2em] flex items-center gap-1.5 md:gap-2 pt-1">
             <i className="fa-solid fa-location-dot text-gold/60"></i>
             {property?.city ?? "Location not specified"}
           </p>
        </div>

        <div className="pt-4 md:pt-6 flex items-center justify-between mt-auto border-t border-beige-100">
           <div className="flex flex-col">
              <span className="text-[7px] md:text-[8px] font-black text-navy-muted uppercase tracking-widest opacity-50">Total Value</span>
              <span className="text-sm md:text-base font-black text-navy tracking-tighter">
                ₹{property?.price && property.price > 0 ? Number(property.price).toLocaleString('en-IN') : "Price on request"}
              </span>
           </div>
           <button className="px-5 py-2.5 bg-navy text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gold transition-colors shadow-soft">
             View Details
           </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
