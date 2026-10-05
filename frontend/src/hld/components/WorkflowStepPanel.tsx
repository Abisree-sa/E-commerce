import React from 'react';
import { WorkflowStep, HldNode, HldConnection } from '../types';
import { Activity, ArrowRight, Zap, CheckCircle2, Info, FileText, Database, ShieldCheck, HelpCircle } from 'lucide-react';

interface WorkflowStepPanelProps {
  step: WorkflowStep | null;
  currentStepIndex: number;
  totalSteps: number;
  selectedNode: HldNode | null;
  selectedConnection: HldConnection | null;
  onClearSelection: () => void;
}

export const WorkflowStepPanel: React.FC<WorkflowStepPanelProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  selectedNode,
  selectedConnection,
  onClearSelection,
}) => {
  const getPacketBadge = (type: string) => {
    switch (type) {
      case 'cache_hit': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'cache_miss': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'query': return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'event': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'consumer': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'failure': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'failover': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default: return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. CURRENT STEP DETAIL CARD — FULL TEXT VISIBILITY WITHOUT TRUNCATION */}
      <div className="glass-panel p-5 rounded-3xl border-slate-800 space-y-3.5 bg-slate-950/95 shadow-2xl border border-rose-500/30">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-xs">
              STEP {currentStepIndex + 1} / {totalSteps}
            </span>
            {step && (
              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase border ${getPacketBadge(step.packetType)}`}>
                {step.packetType.replace('_', ' ')}
              </span>
            )}
          </div>

          <div className="text-xs font-black text-rose-400 flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-rose-500 animate-pulse flex-shrink-0" />
            <span className="break-words font-extrabold text-sm text-white">{step?.title || 'Initial State'}</span>
          </div>
        </div>

        {step ? (
          <>
            {/* From -> To Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">FROM (Source)</span>
                <span className="font-extrabold text-cyan-400 text-xs block break-words">
                  {step.fromName || step.sourceNodeId}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">TO (Destination)</span>
                <span className="font-extrabold text-cyan-400 text-xs block break-words">
                  {step.toName || step.targetNodeId}
                </span>
              </div>
            </div>

            {/* Action & Data Payload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">ACTION</span>
                <span className="font-bold text-white text-xs block break-words leading-relaxed">{step.action}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">DATA PAYLOAD</span>
                <span className="font-mono text-emerald-400 text-xs block break-all leading-relaxed">{step.payload}</span>
              </div>
            </div>

            {/* Result & Next Step Row */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex flex-wrap justify-between items-center gap-2">
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">RESULT</span>
                <span className="font-extrabold text-rose-400 text-xs block break-words">{step.result}</span>
              </div>
              <div className="text-right">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">NEXT STEP</span>
                <span className="font-medium text-slate-300 text-xs block break-words">
                  {step.nextStep || `Step ${currentStepIndex + 2}`}
                </span>
              </div>
            </div>

            {/* Why This Step Exists Explanation */}
            {(step.explanation || step.why) && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center space-x-1.5 text-rose-400 font-bold text-xs">
                  <HelpCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Why This Step Exists</span>
                </div>
                <p className="text-slate-300 leading-relaxed italic text-xs pt-1">{step.explanation || step.why}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-slate-400 text-xs py-4 text-center">Select or play a scenario to view detailed execution steps.</div>
        )}
      </div>

      {/* 2. SELECTED NODE OR CONNECTION OVERLAY INSPECTOR */}
      {(selectedNode || selectedConnection) && (
        <div className="glass-panel p-4 rounded-3xl border-slate-800 bg-slate-950/95 space-y-3 relative border border-cyan-500/30">
          <button
            onClick={onClearSelection}
            className="absolute top-4 right-4 text-[10px] font-bold text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
          >
            CLOSE
          </button>

          {selectedNode && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold uppercase border border-cyan-500/30">
                  {selectedNode.type}
                </span>
                <span className="font-black text-white text-sm">{selectedNode.label}</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">{selectedNode.description}</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 font-mono">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">RECEIVES:</span>
                  <span className="text-cyan-400 font-bold break-words">{selectedNode.receives}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">PRODUCES:</span>
                  <span className="text-emerald-400 font-bold break-words">{selectedNode.produces}</span>
                </div>
              </div>
            </div>
          )}

          {selectedConnection && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold uppercase border border-purple-500/30">
                  {selectedConnection.protocol}
                </span>
                <span className="font-black text-white text-xs">{selectedConnection.label || 'Connection Link'}</span>
              </div>
              <p className="text-slate-300 text-xs">
                From <strong className="text-cyan-400">{selectedConnection.source}</strong> to{' '}
                <strong className="text-cyan-400">{selectedConnection.target}</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
