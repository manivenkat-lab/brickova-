
import React, { useState } from 'react';
import { Lead, LeadStatus, LeadPriority, LeadNote } from '../../types';
import { format } from 'date-fns';

interface LeadDetailsProps {
  lead: Lead;
  onUpdate: (data: Partial<Lead>) => void;
  onDelete: (id: string) => void;
  onAddNote: (text: string) => void;
  onClose: () => void;
}

const LeadDetails: React.FC<LeadDetailsProps> = ({ lead, onUpdate, onDelete, onAddNote, onClose }) => {
  const [noteText, setNoteText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ status: e.target.value as LeadStatus });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ priority: e.target.value as LeadPriority });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    onAddNote(noteText);
    setNoteText('');
  };

  const safeFormat = (val: any, pattern: string) => {
    if (!val) return 'Not set';
    const date = val instanceof Date ? val : (val?.toDate ? val.toDate() : new Date(val));
    return isNaN(date.getTime()) ? 'Invalid date' : format(date, pattern);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-beige-200 overflow-hidden shadow-elevated max-w-4xl w-full mx-auto flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">
      {/* Left Panel: Info */}
      <div className="flex-1 p-8 md:p-10 space-y-8 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-beige-100">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-navy uppercase tracking-tighter">{lead.name}</h2>
            <p className="text-[10px] font-black text-navy-muted uppercase tracking-[0.2em]">{lead.email}</p>
            <p className="text-[10px] font-black text-navy-muted uppercase tracking-[0.2em]">{lead.phone}</p>
          </div>
          <button onClick={onClose} className="text-navy-muted hover:text-navy transition-all">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-navy-muted">Status</label>
            <select 
              value={lead.status} 
              onChange={handleStatusChange}
              className="w-full bg-beige-50 border border-beige-200 rounded-xl px-4 py-3 text-xs font-bold text-navy outline-none focus:border-gold/50 appearance-none"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Site Visit">Site Visit</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed">Closed</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-navy-muted">Priority</label>
            <select 
              value={lead.priority} 
              onChange={handlePriorityChange}
              className="w-full bg-beige-50 border border-beige-200 rounded-xl px-4 py-3 text-xs font-bold text-navy outline-none focus:border-gold/50 appearance-none"
            >
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-navy">Lead Details</h3>
            <button 
              onClick={() => onDelete(lead.id)}
              className="text-[9px] font-black uppercase tracking-widest text-alert hover:underline flex items-center gap-1.5"
            >
              <i className="fa-solid fa-trash-can text-[8px]"></i>
              Delete Lead
            </button>
          </div>
          <div className="bg-beige-50 rounded-2xl p-6 space-y-4 border border-beige-100">
            <div className="flex justify-between text-[10px]">
              <span className="font-black uppercase tracking-widest text-navy-muted">Source</span>
              <span className="font-bold text-navy">{lead.source}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="font-black uppercase tracking-widest text-navy-muted">Follow-up</span>
              <span className="font-bold text-navy">
                {safeFormat(lead.followUpDate, 'PPP')}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="font-black uppercase tracking-widest text-navy-muted">Created</span>
              <span className="font-bold text-navy">
                {safeFormat(lead.createdAt, 'PPP')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Notes */}
      <div className="flex-1 p-8 md:p-10 flex flex-col h-full bg-beige-50/30">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-navy mb-6">Activity & Notes</h3>
        
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
          {lead.notes && lead.notes.length > 0 ? (
            lead.notes.map((note, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-beige-100 shadow-soft">
                <p className="text-xs text-navy font-medium leading-relaxed">{note.text}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-navy-muted/40 mt-2">
                  {safeFormat(note.createdAt, 'MMM dd, HH:mm')}
                </p>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <i className="fa-solid fa-note-sticky text-3xl mb-3"></i>
              <p className="text-[9px] font-black uppercase tracking-widest">No notes yet</p>
            </div>
          )}
        </div>

        <form onSubmit={handleAddNote} className="relative">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a progress note..."
            className="w-full bg-white border border-beige-200 rounded-2xl px-5 py-4 text-xs font-medium text-navy outline-none focus:border-gold/50 shadow-soft resize-none h-24"
          />
          <button 
            type="submit"
            className="absolute bottom-4 right-4 bg-navy text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-premium hover:scale-105 active:scale-95 transition-all"
          >
            <i className="fa-solid fa-paper-plane text-gold text-xs"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeadDetails;
