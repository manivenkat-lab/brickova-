
import React, { useState } from 'react';
import { Lead, LeadStatus, LeadPriority, LeadSource, Property, Agent } from '../../types';
import { format } from 'date-fns';

interface LeadFormProps {
  lead?: Lead;
  properties: Property[];
  agents: Agent[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const LeadForm: React.FC<LeadFormProps> = ({ lead, properties, agents, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    propertyId: lead?.propertyId || '',
    propertyTitle: lead?.propertyTitle || '',
    source: lead?.source || 'Website' as LeadSource,
    status: lead?.status || 'New' as LeadStatus,
    priority: lead?.priority || 'Warm' as LeadPriority,
    assignedTo: lead?.assignedTo || '',
    followUpDate: lead?.followUpDate ? (typeof lead.followUpDate === 'string' ? lead.followUpDate : format(lead.followUpDate.toDate(), 'yyyy-MM-dd')) : format(new Date(), 'yyyy-MM-dd'),
    notes: lead?.notes?.[0]?.text || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'propertyId') {
      const selectedProp = properties.find(p => p.id === value);
      setFormData(prev => ({ 
        ...prev, 
        propertyId: value, 
        propertyTitle: selectedProp?.title || '' 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-beige-200 shadow-soft max-w-2xl mx-auto">
      <h2 className="text-xl font-black text-navy uppercase tracking-widest mb-6">
        {lead ? 'Edit Lead' : 'Add New Lead'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-navy-muted">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-beige-50 border border-beige-200 rounded-xl px-4 py-3 text-xs font-bold text-navy outline-none focus:border-gold/50 transition-all"
              placeholder="Enter lead name"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-navy-muted">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full bg-beige-50 border border-beige-200 rounded-xl px-4 py-3 text-xs font-bold text-navy outline-none focus:border-gold/50 transition-all"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-navy-muted">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-beige-50 border border-beige-200 rounded-xl px-4 py-3 text-xs font-bold text-navy outline-none focus:border-gold/50 transition-all"
            placeholder="email@example.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-navy-muted">Interested Property</label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              className="w-full bg-beige-50 border border-beige-200 rounded-xl px-4 py-3 text-xs font-bold text-navy outline-none focus:border-gold/50 transition-all appearance-none"
            >
              <option value="">General Inquiry</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-navy-muted">Lead Source</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full bg-beige-50 border border-beige-200 rounded-xl px-4 py-3 text-xs font-bold text-navy outline-none focus:border-gold/50 transition-all appearance-none"
            >
              <option value="Website">Website</option>
              <option value="Call">Call</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Referral">Referral</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-navy-muted">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-beige-50 border border-beige-200 rounded-xl px-4 py-3 text-xs font-bold text-navy outline-none focus:border-gold/50 transition-all appearance-none"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Site Visit">Site Visit</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed">Closed</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-navy-muted">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-beige-50 border border-beige-200 rounded-xl px-4 py-3 text-xs font-bold text-navy outline-none focus:border-gold/50 transition-all appearance-none"
            >
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-navy-muted">Assigned Agent</label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full bg-beige-50 border border-beige-200 rounded-xl px-4 py-3 text-xs font-bold text-navy outline-none focus:border-gold/50 transition-all appearance-none"
            >
              <option value="">Select Agent</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-navy-muted">Follow-up Date</label>
            <input
              type="date"
              name="followUpDate"
              value={formData.followUpDate}
              onChange={handleChange}
              className="w-full bg-beige-50 border border-beige-200 rounded-xl px-4 py-3 text-xs font-bold text-navy outline-none focus:border-gold/50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-navy-muted">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full bg-beige-50 border border-beige-200 rounded-xl px-4 py-3 text-xs font-bold text-navy outline-none focus:border-gold/50 transition-all resize-none"
            placeholder="Enter lead notes..."
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-4 sm:py-3 text-[10px] font-black uppercase tracking-widest text-navy-muted hover:text-navy transition-all order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-navy text-white px-8 py-4 sm:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-premium hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 order-1 sm:order-2"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Saving...
              </span>
            ) : (
              lead ? 'Update Lead' : 'Create Lead'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
