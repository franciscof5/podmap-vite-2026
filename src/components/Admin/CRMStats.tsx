import React from 'react';
import { Podcast } from '../../types';
import { Mic, Users, DollarSign, Target, TrendingUp, Globe, Building } from 'lucide-react';

interface CRMStatsProps {
  podcasts: Podcast[];
}

export const CRMStats: React.FC<CRMStatsProps> = ({ podcasts }) => {
  const totalPodcasts = podcasts.length;
  const activeCustomers = podcasts.filter((p) => p.stage === 'customer').length;
  const activePartners = podcasts.filter((p) => p.stage === 'partner').length;
  const warmLeads = podcasts.filter((p) => p.stage === 'lead').length;
  const totalContacts = podcasts.reduce(
    (acc, p) => acc + (p.hosts?.length || 0) + (p.producers?.length || 0),
    0
  );
  const countriesCount = new Set(podcasts.map((p) => p.country)).size;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/40 shrink-0">
          <Mic className="w-4 h-4" />
        </div>
        <div>
          <div className="text-lg font-extrabold text-white">{totalPodcasts}</div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Total Podcasts
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/40 shrink-0">
          <DollarSign className="w-4 h-4" />
        </div>
        <div>
          <div className="text-lg font-extrabold text-emerald-300">{activeCustomers}</div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Active Customers
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/40 shrink-0">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div>
          <div className="text-lg font-extrabold text-indigo-300">{activePartners}</div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Active Partners
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/40 shrink-0">
          <Target className="w-4 h-4" />
        </div>
        <div>
          <div className="text-lg font-extrabold text-amber-300">{warmLeads}</div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Warm Leads
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-rose-950 text-rose-400 border border-rose-800/40 shrink-0">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <div className="text-lg font-extrabold text-rose-300">{totalContacts}</div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Total CRM Contacts
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/40 shrink-0">
          <Globe className="w-4 h-4" />
        </div>
        <div>
          <div className="text-lg font-extrabold text-cyan-300">{countriesCount}</div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Countries Reached
          </div>
        </div>
      </div>

    </div>
  );
};
