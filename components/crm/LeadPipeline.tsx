
import React from 'react';
import { Lead, LeadStatus } from '../../types';
import LeadCard from './LeadCard';
import { motion } from 'framer-motion';

interface LeadPipelineProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onAddLead: (status: LeadStatus) => void;
}

const COLUMNS: LeadStatus[] = ['New', 'Contacted', 'Site Visit', 'Negotiation', 'Closed', 'Lost'];

const LeadPipeline: React.FC<LeadPipelineProps> = ({ leads, onLeadClick, onStatusChange, onAddLead }) => {
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      onStatusChange(leadId, status);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar min-h-[600px] px-1">
      {COLUMNS.map((status, idx) => (
        <div 
          key={status}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status)}
          className="flex-shrink-0 w-72 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                status === 'New' ? 'bg-blue-500' : 
                status === 'Contacted' ? 'bg-indigo-500' : 
                status === 'Site Visit' ? 'bg-gold' : 
                status === 'Negotiation' ? 'bg-orange-500' : 
                status === 'Closed' ? 'bg-success' : 
                'bg-alert'
              }`}></span>
              {status}
              <span className="text-navy-muted/40 ml-1">({leads.filter(l => l.status === status).length})</span>
            </h3>
            <button 
              onClick={() => onAddLead(status)}
              className="w-6 h-6 rounded-lg bg-beige-100 text-navy-muted hover:bg-navy hover:text-white transition-all flex items-center justify-center active:scale-90"
              title={`Add ${status} Lead`}
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
            </button>
          </div>

          <div className="flex-1 bg-beige-100/30 rounded-2xl p-2 space-y-3 border border-dashed border-beige-200 min-h-[400px] transition-colors hover:bg-beige-100/50">
            {leads.filter(l => l.status === status).map(lead => (
              <motion.div 
                layout
                key={lead.id}
                draggable
                onDragStart={(e: any) => handleDragStart(e, lead.id)}
                className="cursor-grab active:cursor-grabbing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <LeadCard 
                  lead={lead} 
                  onClick={onLeadClick} 
                  onStatusChange={onStatusChange}
                />
              </motion.div>
            ))}
            {leads.filter(l => l.status === status).length === 0 && (
              <div className="h-32 flex flex-col items-center justify-center text-[8px] font-black uppercase tracking-widest text-navy-muted/20 border-2 border-dashed border-beige-200/50 rounded-xl">
                <i className="fa-solid fa-plus mb-2"></i>
                Drop here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeadPipeline;
