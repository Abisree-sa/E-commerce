import React from 'react';
import { HldNode, HldConnection } from '../types';
import { X, Server, Database, Zap, Cpu, ShieldCheck, ArrowRight, Activity, Globe, Layers } from 'lucide-react';

interface ComponentDetailPanelProps {
  selectedNode: HldNode | null;
  selectedConnection: HldConnection | null;
  onClose: () => void;
}

export const ComponentDetailPanel: React.FC<ComponentDetailPanelProps> = ({
  selectedNode,
  selectedConnection,
  onClose,
}) => {
  if (!selectedNode && !selectedConnection) return null;

  return (
    <div className="w-80 md:w-96 glass-panel border-l border-slate-800 bg-slate-950/95 p-6 shadow-2xl flex flex-col justify-between h-full overflow-y-auto space-y-6 z-40">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                {selectedNode ? 'COMPONENT DETAILS' : 'CONNECTION DETAILS'}
              </span>
              <h2 className="text-lg font-black text-white">
                {selectedNode ? selectedNode.label : selectedConnection?.label || 'Data Connection'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedNode && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Type / Component Role</div>
              <div className="text-sm font-bold text-white capitalize mt-0.5">{selectedNode.type}</div>
            </div>

            <div>
              <div className="font-bold text-slate-300 text-xs mb-1 uppercase tracking-wider">Responsibility</div>
              <p className="text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                {selectedNode.responsibility}
              </p>
            </div>

            <div>
              <div className="font-bold text-slate-300 text-xs mb-1 uppercase tracking-wider">Receives</div>
              <p className="text-cyan-400 font-mono bg-cyan-950/20 p-2.5 rounded-xl border border-cyan-500/20">
                {selectedNode.receives}
              </p>
            </div>

            <div>
              <div className="font-bold text-slate-300 text-xs mb-1 uppercase tracking-wider">Produces</div>
              <p className="text-emerald-400 font-mono bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20">
                {selectedNode.produces}
              </p>
            </div>

            <div>
              <div className="font-bold text-slate-300 text-xs mb-1 uppercase tracking-wider">Data Ownership</div>
              <p className="text-amber-400 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20">
                {selectedNode.dataOwnership}
              </p>
            </div>

            <div>
              <div className="font-bold text-slate-300 text-xs mb-1 uppercase tracking-wider">Communication Protocol</div>
              <p className="text-purple-300 bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/20 font-mono">
                {selectedNode.communication}
              </p>
            </div>

            <div>
              <div className="font-bold text-rose-400 text-xs mb-1 uppercase tracking-wider">Why It Exists (Architecture Reasoning)</div>
              <p className="text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {selectedNode.whyItExists}
              </p>
            </div>
          </div>
        )}

        {selectedConnection && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Protocol</div>
              <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{selectedConnection.protocol} ({selectedConnection.type || 'sync'})</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Source</div>
                <div className="font-bold text-white text-xs">{selectedConnection.source}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Destination</div>
                <div className="font-bold text-white text-xs">{selectedConnection.target}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        SALESTORM System Architecture Visualizer
      </div>
    </div>
  );
};
