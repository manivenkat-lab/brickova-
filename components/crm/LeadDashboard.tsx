
import React from 'react';
import { Lead, Activity } from '../../types';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

interface LeadDashboardProps {
  leads: Lead[];
  activities: Activity[];
}

const LeadDashboard: React.FC<LeadDashboardProps> = ({ leads, activities }) => {
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'New').length,
    siteVisits: leads.filter(l => l.status === 'Site Visit').length,
    closed: leads.filter(l => l.status === 'Closed').length,
    conversion: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'Closed').length / leads.length) * 100) : 0
  };

  const handleExportExcel = () => {
    const exportData = leads.map(l => ({
      Name: l.name,
      Email: l.email,
      Phone: l.phone,
      Status: l.status,
      Priority: l.priority,
      Source: l.source,
      'Property Title': l.propertyTitle,
      'Created At': l.createdAt instanceof Date ? l.createdAt.toLocaleDateString() : (l.createdAt?.toDate ? l.createdAt.toDate().toLocaleDateString() : 'N/A')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    XLSX.writeFile(wb, `brickova-crm-${dateStr}.xlsx`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-beige-200 shadow-soft">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-navy uppercase tracking-widest">Performance Overview</h3>
          <p className="text-[9px] text-navy-muted font-bold uppercase tracking-widest opacity-60">Real-time lead conversion analytics</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="bg-beige-50 text-navy px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border border-beige-200 hover:bg-navy hover:text-white transition-all flex items-center gap-3 active:scale-95"
        >
          <i className="fa-solid fa-file-excel text-success"></i> Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Leads', value: stats.total, icon: 'fa-users', color: 'text-navy' },
          { label: 'New Leads', value: stats.new, icon: 'fa-sparkles', color: 'text-blue-500' },
          { label: 'Site Visits', value: stats.siteVisits, icon: 'fa-house-circle-check', color: 'text-gold' },
          { label: 'Closed Deals', value: stats.closed, icon: 'fa-handshake', color: 'text-success' },
          { label: 'Conversion', value: `${stats.conversion}%`, icon: 'fa-chart-line', color: 'text-navy' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-beige-200 shadow-soft flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <i className={`fa-solid ${stat.icon} text-xs ${stat.color} opacity-60`}></i>
              <span className="text-[8px] font-black uppercase tracking-widest text-navy-muted opacity-50">{stat.label}</span>
            </div>
            <span className="text-xl font-black text-navy">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Log */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-beige-200 shadow-soft overflow-hidden flex flex-col">
          <div className="p-4 border-b border-beige-100 bg-beige-50/50">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-navy">Recent Activity</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
            {activities.length > 0 ? (
              <div className="divide-y divide-beige-100">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-beige-50 transition-colors">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center shrink-0">
                        <i className={`fa-solid ${
                          activity.action.includes('Created') ? 'fa-plus text-success' :
                          activity.action.includes('Updated') ? 'fa-pen text-gold' :
                          'fa-trash text-alert'
                        } text-[10px]`}></i>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-navy leading-tight">
                          <span className="text-gold">{activity.userName}</span> {activity.action.toLowerCase()} for <span className="text-navy-muted">{activity.leadName}</span>
                        </p>
                        <span className="text-[8px] font-black uppercase tracking-widest text-navy-muted/40">
                          {activity.timestamp ? format(activity.timestamp.toDate(), 'MMM dd, HH:mm') : 'Just now'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-navy-muted/30">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Lead Distribution Chart / Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-beige-200 shadow-soft p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-navy">Pipeline Distribution</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-navy-muted">
                <span className="w-2 h-2 rounded-full bg-gold"></span> Active
              </span>
              <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-navy-muted">
                <span className="w-2 h-2 rounded-full bg-success"></span> Closed
              </span>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-around gap-4 px-4">
            {['New', 'Contacted', 'Site Visit', 'Negotiation', 'Closed', 'Lost'].map((status) => {
              const count = leads.filter(l => l.status === status).length;
              const maxCount = Math.max(...['New', 'Contacted', 'Site Visit', 'Negotiation', 'Closed', 'Lost'].map(s => leads.filter(l => l.status === s).length), 1);
              const height = (count / maxCount) * 100;
              
              return (
                <div key={status} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="w-full relative flex items-end justify-center h-full">
                    <div 
                      className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ${
                        status === 'Closed' ? 'bg-success/80' : 
                        status === 'Lost' ? 'bg-alert/80' : 
                        'bg-navy/80 group-hover:bg-gold'
                      }`}
                      style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                    >
                      {count > 0 && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-navy">{count}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-navy-muted rotate-45 md:rotate-0 mt-2">{status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDashboard;
