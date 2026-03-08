
import React from 'react';
import { Lead } from '../../types';
import { format } from 'date-fns';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  onStatusChange: (leadId: string, status: any) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick, onStatusChange }) => {
  const priorityColors = {
    Hot: 'bg-alert/10 text-alert border-alert/20',
    Warm: 'bg-gold/10 text-gold border-gold/20',
    Cold: 'bg-navy-muted/10 text-navy-muted border-navy-muted/20'
  };

  const sourceIcons = {
    Website: 'fa-globe',
    Call: 'fa-phone',
    WhatsApp: 'fa-whatsapp',
    Referral: 'fa-user-group'
  };

  return (
    <div 
      onClick={() => onClick(lead)}
      className="bg-white p-4 rounded-xl border border-beige-200 shadow-soft hover:shadow-premium transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${lead.priority === 'Hot' ? 'bg-alert' : lead.priority === 'Warm' ? 'bg-gold' : 'bg-navy-muted'}`}></div>
      
      <div className="flex justify-between items-start mb-2">
        <div className="space-y-0.5 flex-1 min-w-0">
          <h4 className="text-xs font-black text-navy uppercase tracking-tight truncate">{lead.name}</h4>
          {lead.propertyTitle && (
            <p className="text-[8px] font-bold text-gold uppercase tracking-widest truncate">
              <i className="fa-solid fa-house-chimney mr-1 text-[7px]"></i>
              {lead.propertyTitle}
            </p>
          )}
        </div>
        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ml-2 ${priorityColors[lead.priority]}`}>
          {lead.priority}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[9px] font-bold text-navy-muted uppercase tracking-widest mb-3">
        <i className={`fa-solid ${sourceIcons[lead.source] || 'fa-circle-info'} text-[8px]`}></i>
        {lead.source}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-navy-muted font-medium">
          <i className="fa-solid fa-envelope w-3"></i>
          <span className="truncate">{lead.email}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-navy-muted font-medium">
          <i className="fa-solid fa-phone w-3"></i>
          <span>{lead.phone}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-beige-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase tracking-widest text-navy-muted/50">Follow-up</span>
          <span className="text-[9px] font-bold text-navy">
            {lead.followUpDate ? (typeof lead.followUpDate === 'string' ? format(new Date(lead.followUpDate), 'MMM dd') : format(lead.followUpDate.toDate(), 'MMM dd')) : 'No date'}
          </span>
        </div>
        <div className="flex -space-x-2">
          {lead.notes && lead.notes.length > 0 && (
            <div className="w-5 h-5 rounded-full bg-beige-100 flex items-center justify-center border border-white">
              <i className="fa-solid fa-note-sticky text-[8px] text-navy-muted"></i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
