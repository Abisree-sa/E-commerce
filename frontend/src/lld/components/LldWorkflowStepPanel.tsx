import React from 'react';
import { LldWorkflowStep, LldNode, LldConnection } from '../types';
import { ArrowRight, Database, ShieldCheck, CheckCircle2, FileCode, HelpCircle, Layers, ArrowLeft, Terminal, Cpu } from 'lucide-react';

interface LldWorkflowStepPanelProps {
  currentStep: LldWorkflowStep | null;
  totalSteps: number;
  currentStepIndex: number;
  selectedNode: LldNode | null;
  selectedConnection: LldConnection | null;
  onSelectStep: (index: number) => void;
}

export const LldWorkflowStepPanel: React.FC<LldWorkflowStepPanelProps> = ({
  currentStep,
  totalSteps,
  currentStepIndex,
  selectedNode,
  selectedConnection,
  onSelectStep,
}) => {
  return (
    <div className="w-full h-full bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col overflow-y-auto space-y-5 shadow-2xl custom-scrollbar">
      {/* Step Counter Badge */}
      {currentStep && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-mono font-bold text-xs border border-rose-500/30">
              STEP {currentStep.stepNumber} / {totalSteps}
            </span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Execution</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {currentStep.durationMs}ms
          </span>
        </div>
      )}

      {/* Main Step Detail View */}
      {currentStep ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span className="text-rose-500">▶</span>
              <span>{currentStep.title}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{currentStep.explanation}</p>
          </div>

          {/* FROM -> TO Visual Card */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">FROM (Caller)</p>
              <p className="text-xs font-mono font-bold text-rose-400 truncate mt-0.5">{currentStep.fromName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">TO (Target)</p>
              <p className="text-xs font-mono font-bold text-cyan-400 truncate mt-0.5">{currentStep.toName}</p>
            </div>
          </div>

          {/* Method Call Signature */}
          {currentStep.method && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1">
                <FileCode className="w-3 h-3 text-rose-400" />
                <span>Method Signature</span>
              </p>
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl font-mono text-xs text-emerald-300 break-all">
                {currentStep.method}
              </div>
            </div>
          )}

          {/* Validation Guard */}
          {currentStep.validation && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Validation Guard</span>
              </p>
              <div className="bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-xl font-mono text-xs text-amber-200">
                {currentStep.validation}
              </div>
            </div>
          )}

          {/* Database Operation */}
          {currentStep.databaseOperation && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1">
                <Database className="w-3 h-3 text-cyan-400" />
                <span>Database / SQL Operation</span>
              </p>
              <div className="bg-cyan-950/30 border border-cyan-500/30 p-2.5 rounded-xl font-mono text-xs text-cyan-200 break-all">
                {currentStep.databaseOperation}
              </div>
            </div>
          )}

          {/* Transaction Boundary */}
          {currentStep.transaction && (
            <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Transaction Scope</span>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                {currentStep.transaction}
              </span>
            </div>
          )}

          {/* Result Payload */}
          {currentStep.result && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Execution Result</span>
              </p>
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl font-mono text-xs text-emerald-200">
                {currentStep.result}
              </div>
            </div>
          )}

          {/* Why This Step Exists */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
            <h5 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Why This Step Exists</span>
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed italic">{currentStep.whyThisStepExists}</p>
          </div>
        </div>
      ) : selectedNode ? (
        /* Selected Node Detail Inspector */
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-bold uppercase text-rose-400 tracking-wider">Class / Node Inspector</span>
            <h3 className="text-lg font-black text-white font-mono mt-0.5">{selectedNode.label}</h3>
            {selectedNode.package && <p className="text-xs font-mono text-slate-400">{selectedNode.package}</p>}
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-300">Responsibilities</h5>
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
              {selectedNode.responsibilities}
            </p>
          </div>

          {selectedNode.attributes && selectedNode.attributes.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-300">Attributes & Database Mapping</h5>
              <div className="space-y-1.5">
                {selectedNode.attributes.map((attr, i) => (
                  <div key={i} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-300">
                      <span>{attr.name}</span>
                      <span className="text-amber-400 text-[10px]">{attr.type}</span>
                    </div>
                    {attr.dbColumn && <p className="text-[10px] font-mono text-cyan-400">DB Column: {attr.dbColumn}</p>}
                    <p className="text-[11px] text-slate-400">{attr.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedNode.methods && selectedNode.methods.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-300">Methods & Operations</h5>
              <div className="space-y-1.5">
                {selectedNode.methods.map((m, i) => (
                  <div key={i} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
                    <div className="flex items-center space-x-1 text-emerald-400 font-bold">
                      <span>{m.visibility}</span>
                      <span>{m.name}({m.parameters})</span>
                    </div>
                    <p className="text-[11px] font-sans text-slate-300">{m.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : selectedConnection ? (
        /* Selected Edge Detail Inspector */
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-bold uppercase text-sky-400 tracking-wider">Edge / Communication Link</span>
            <h3 className="text-base font-bold text-white font-mono mt-0.5">{selectedConnection.label || 'Connection'}</h3>
          </div>
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <p className="text-slate-300"><strong className="text-slate-400">Source:</strong> {selectedConnection.source}</p>
            <p className="text-slate-300"><strong className="text-slate-400">Target:</strong> {selectedConnection.target}</p>
            <p className="text-slate-300"><strong className="text-slate-400">Type:</strong> {selectedConnection.type}</p>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
            <Layers className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-bold text-slate-300">Interactive LLD Workflow Inspector</h4>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Press <strong className="text-rose-400">PLAY</strong> or click any node/class in the left diagram to view low-level methods, attributes, and SQL queries.
          </p>
        </div>
      )}
    </div>
  );
};
