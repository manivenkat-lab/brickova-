
import React, { useState, useRef, useEffect } from 'react';
import { Property } from '../types';
import { getMarketAdvice } from '../services/geminiService';

interface AIAssistantProps {
  properties: Property[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ properties }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Greetings. I am your Brickova Strategic Market Advisor. How may I assist your investment strategy today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    const context = properties.map(p => 
      `${p.propertyCode}: ${p.title} in ${p.location}, ₹${p.price?.toLocaleString() || '0'}, ${p.isVerified ? 'Verified' : 'Pending'}`
    ).join(' | ');

    const advice = await getMarketAdvice(userMsg, context);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'assistant', text: advice }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[300]">
      {isOpen ? (
        <div className="bg-white w-[320px] md:w-[380px] h-[500px] md:h-[600px] rounded-2xl md:rounded-[2rem] shadow-premium flex flex-col border border-beige-200 overflow-hidden duration-700">
           <div className="bg-navy p-6 md:p-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center text-navy shadow-soft">
                    <i className="fa-solid fa-chess-knight text-xl text-gold"></i>
                 </div>
                 <div>
                    <h4 className="font-black text-xs md:text-sm tracking-tight uppercase">Strategic Advisor</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                       <div className="w-1 h-1 bg-success rounded-full animate-pulse"></div>
                       <span className="text-[8px] md:text-[9px] font-black text-white/60 uppercase tracking-widest">System Online</span>
                    </div>
                 </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-all"><i className="fa-solid fa-xmark text-lg"></i></button>
           </div>

           <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 bg-beige-50/20 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-4 md:p-5 rounded-xl md:rounded-[1.5rem] text-[10px] md:text-xs font-medium shadow-soft leading-relaxed ${
                    m.role === 'user' 
                    ? 'bg-navy text-white rounded-br-none' 
                    : 'bg-white text-navy rounded-bl-none border border-beige-100'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 p-3">
                  <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce delay-200"></div>
                </div>
              )}
           </div>

           <div className="p-6 md:p-8 bg-white border-t border-beige-100">
              <div className="flex gap-3">
                 <input 
                  type="text" placeholder="Inquire about yields..."
                  className="flex-1 bg-beige-50 border border-beige-200 rounded-lg md:rounded-xl px-4 md:px-5 py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-navy focus:border-navy transition-all outline-none"
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                 />
                 <button onClick={handleSend} className="w-10 h-10 md:w-12 md:h-12 bg-navy text-white rounded-lg md:rounded-xl flex items-center justify-center hover:bg-navy-ultra transition-all shadow-soft">
                    <i className="fa-solid fa-paper-plane text-gold text-xs"></i>
                 </button>
              </div>
           </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 md:w-16 md:h-16 bg-navy text-white rounded-xl md:rounded-2xl shadow-elevated flex items-center justify-center text-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white/20 relative group"
        >
          <i className="fa-solid fa-brain text-gold text-lg md:text-xl"></i>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-alert rounded-full animate-pulse border-2 border-white shadow-soft"></span>
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
