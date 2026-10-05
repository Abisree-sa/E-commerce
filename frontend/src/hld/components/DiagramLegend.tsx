import React from 'react';
import { HelpCircle } from 'lucide-react';

export const DiagramLegend: React.FC = () => {
  return (
    <div className="glass-panel p-4 rounded-2xl border-slate-800 space-y-3 text-xs">
      <div className="font-bold text-white flex items-center space-x-1.5 text-xs uppercase tracking-wider">
        <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
        <span>Architecture Legend</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50"></div>
          <span className="text-slate-300">HTTP Request</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></div>
          <span className="text-slate-300">HTTP Response / Success</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></div>
          <span className="text-slate-300">SQL Query / DB Read</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></div>
          <span className="text-slate-300">Redis Cache Operation</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50"></div>
          <span className="text-slate-300">Kafka Event Stream</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50"></div>
          <span className="text-slate-300">Event Consumer</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50 animate-ping"></div>
          <span className="text-rose-400 font-bold">Node Outage / Failure</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></div>
          <span className="text-emerald-400 font-bold">Automatic Failover</span>
        </div>
      </div>
    </div>
  );
};
