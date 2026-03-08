
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Property } from '../types';

interface LiveConsultationProps {
  property: Property;
  onClose: () => void;
}

const LiveConsultation: React.FC<LiveConsultationProps> = ({ property, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'ACTIVE' | 'ERROR'>('IDLE');
  const [transcript, setTranscript] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const createBlob = (data: Float32Array): { data: string; mimeType: string } => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const startConsultation = async () => {
    setStatus('CONNECTING');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inCtx;
      outputAudioContextRef.current = outCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('ACTIVE');
            setIsActive(true);
            const source = inCtx.createMediaStreamSource(stream);
            const processor = inCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(s => s.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            source.connect(processor);
            processor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscript(prev => [...prev, `AI: ${text}`]);
            }
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
            }
          },
          onerror: (e) => { console.error(e); setStatus('ERROR'); },
          onclose: () => { setIsActive(false); setStatus('IDLE'); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: `You are the Brickova Elite Concierge. You are an expert realtor discussing the property: "${property.title}" located in ${property.location}. Price: ${property.price}. Features: ${property.amenities.join(', ')}. Description: ${property.description}. Be helpful, professional, and knowledgeable. Answer questions specifically about this asset.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
    }
  };

  const stopConsultation = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    setIsActive(false);
    setStatus('IDLE');
  };

  useEffect(() => {
    return () => stopConsultation();
  }, []);

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-navy/60 backdrop-blur-md p-6">
      <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-premium flex flex-col border border-beige-200">
        <div className="bg-navy p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 border border-white/10 ${isActive ? 'animate-pulse' : ''}`}>
              <i className={`fa-solid ${isActive ? 'fa-microphone-lines text-gold' : 'fa-headset'}`}></i>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Live Consultation</h3>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-tighter">Asset: {property.propertyCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-all"><i className="fa-solid fa-xmark"></i></button>
        </div>

        <div className="flex-1 p-10 flex flex-col items-center justify-center text-center space-y-8 min-h-[300px]">
          {status === 'IDLE' && (
            <div className="space-y-6">
              <div className="w-24 h-24 bg-beige-50 rounded-full flex items-center justify-center mx-auto border border-beige-200 text-navy-muted">
                <i className="fa-solid fa-microphone text-4xl"></i>
              </div>
              <p className="text-xs font-black uppercase text-navy tracking-widest leading-relaxed px-10">
                Initiate a voice protocol to discuss this estate with our AI Concierge.
              </p>
              <button onClick={startConsultation} className="bg-navy text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-navy-ultra transition-all shadow-soft">
                Start Secure Voice Line
              </button>
            </div>
          )}

          {status === 'CONNECTING' && (
            <div className="space-y-6">
              <i className="fa-solid fa-circle-notch fa-spin text-4xl text-gold"></i>
              <p className="text-[10px] font-black uppercase text-navy-muted tracking-widest">Establishing Encrypted Channel...</p>
            </div>
          )}

          {status === 'ACTIVE' && (
            <div className="space-y-10 w-full">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-1.5 h-12 bg-gold rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
              <div className="p-6 bg-beige-50 rounded-2xl border border-beige-200 min-h-[100px] flex items-center justify-center">
                 <p className="text-[10px] font-black uppercase text-navy tracking-widest">Secure voice line active. Start speaking...</p>
              </div>
              <button onClick={stopConsultation} className="bg-alert text-white px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-soft">
                Terminate Link
              </button>
            </div>
          )}

          {status === 'ERROR' && (
            <div className="space-y-6">
              <i className="fa-solid fa-triangle-exclamation text-4xl text-alert"></i>
              <p className="text-[10px] font-black uppercase text-navy tracking-widest">Protocol Sync Failure</p>
              <button onClick={startConsultation} className="text-gold font-black uppercase text-[10px] tracking-widest underline">Retry Sync</button>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-beige-100/50 text-center border-t border-beige-200">
           <p className="text-[8px] font-black text-navy-muted uppercase tracking-[0.3em]">End-to-End Encrypted Consultation Protocol</p>
        </div>
      </div>
    </div>
  );
};

export default LiveConsultation;
