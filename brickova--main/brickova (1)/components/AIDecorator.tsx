
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Property } from '../types';

interface AIDecoratorProps {
  property: Property;
  onClose: () => void;
}

const STYLES = [
  { id: 'modern', label: 'Mid-Century Modern', icon: 'fa-couch' },
  { id: 'minimal', label: 'Japandi Minimalism', icon: 'fa-leaf' },
  { id: 'industrial', label: 'Industrial Loft', icon: 'fa-building-columns' },
  { id: 'scandinavian', label: 'Nordic Clean', icon: 'fa-snowflake' },
  { id: 'luxury', label: 'European Baroque', icon: 'fa-crown' }
];

const AIDecorator: React.FC<AIDecoratorProps> = ({ property, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(property.images?.[0] || '');
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRestyle = async () => {
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const imgRes = await fetch(selectedImage);
      const blob = await imgRes.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      const base64Data = base64.split(',')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: `Redecorate this room in ${selectedStyle} style. Keep the structural elements the same but change the furniture, lighting, and decor to match the ${selectedStyle} aesthetic. High luxury professional architectural visualization.` }
          ]
        }
      });

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part?.inlineData) {
        setResultImage(`data:image/png;base64,${part.inlineData.data}`);
      }
    } catch (err) {
      console.error(err);
      alert("AI Protocol Error. Please re-initiate visualization.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-navy/80 backdrop-blur-lg p-6">
      <div className="bg-beige-50 w-full max-w-6xl rounded-[3rem] overflow-hidden shadow-premium flex flex-col md:flex-row h-[85vh] border border-beige-300">
        <div className="w-full md:w-80 bg-white border-r border-beige-200 p-10 flex flex-col space-y-10">
          <div className="space-y-2">
            <h3 className="text-xl font-[900] text-navy uppercase tracking-tight">AI Staging Hub</h3>
            <p className="text-[10px] font-bold text-navy-muted uppercase tracking-widest">Visualization Protocol</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-navy uppercase tracking-widest">Select Canvas</h4>
            <div className="grid grid-cols-2 gap-2">
              {property.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(img)} className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-gold scale-105 shadow-soft' : 'border-transparent opacity-60'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <h4 className="text-[10px] font-black text-navy uppercase tracking-widest">Style Palette</h4>
            <div className="space-y-2">
              {STYLES.map(style => (
                <button key={style.id} onClick={() => setSelectedStyle(style.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedStyle === style.id ? 'bg-navy text-white shadow-soft' : 'bg-beige-100 text-navy-muted hover:text-navy'}`}>
                  <i className={`fa-solid ${style.icon} opacity-60`}></i>
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleRestyle} disabled={isProcessing} className="w-full bg-gold text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-premium hover:bg-gold-dark transition-all disabled:opacity-50 flex items-center justify-center gap-3">
            {isProcessing ? <i className="fa-solid fa-wand-sparkles animate-spin"></i> : <i className="fa-solid fa-sparkles"></i>}
            {isProcessing ? 'Processing...' : 'Apply AI Protocol'}
          </button>
        </div>

        <div className="flex-1 bg-beige-100 relative overflow-hidden flex flex-col">
          <div className="h-16 flex items-center justify-between px-10 border-b border-beige-200 bg-white/50 backdrop-blur-md">
            <span className="text-[9px] font-black uppercase text-navy-muted tracking-[0.4em]">Rendering Engine: V3.1 Neural</span>
            <button onClick={onClose} className="text-navy hover:text-gold transition-all"><i className="fa-solid fa-xmark text-lg"></i></button>
          </div>

          <div className="flex-1 p-12 flex items-center justify-center">
             <div className="relative w-full max-w-4xl aspect-[16/9] bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-beige-200">
               {isProcessing ? (
                 <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-black uppercase text-navy tracking-[0.2em]">Synthesizing Interior Architecture...</p>
                 </div>
               ) : null}
               
               <img src={resultImage || selectedImage} className="w-full h-full object-cover transition-opacity duration-1000" />
               
               {resultImage && !isProcessing && (
                 <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center bg-navy/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                    <div className="text-white">
                       <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Generated Output</p>
                       <h5 className="text-xs font-black uppercase">{selectedStyle} Protocol Applied</h5>
                    </div>
                    <button onClick={() => setResultImage(null)} className="text-[10px] font-black uppercase text-white border border-white/20 px-6 py-2 rounded-xl hover:bg-white/10">Reset Protocol</button>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDecorator;
