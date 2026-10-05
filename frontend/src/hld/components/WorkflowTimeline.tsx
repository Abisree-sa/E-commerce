import React from 'react';
import { WorkflowStep } from '../types';
import { CheckCircle2, Play, Circle } from 'lucide-react';

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
}) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="glass-panel p-5 rounded-3xl border-slate-800 space-y-3 bg-slate-950/95 shadow-xl">
      <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2.5">
        <span className="flex items-center space-x-1.5 text-rose-400">
          <Play className="w-3.5 h-3.5 fill-current text-rose-500" />
          <span>Workflow Execution Timeline</span>
        </span>
        <span className="font-mono text-[11px] text-slate-400 font-bold">
          Step {currentStepIndex + 1} of {steps.length}
        </span>
      </div>

      {/* Vertical Step Timeline List — Full Title Visibility without Truncation */}
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;

          return (
            <button
              key={idx}
              onClick={() => onSelectStep(idx)}
              className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-between border cursor-pointer gap-2.5 ${
                isActive
                  ? 'bg-rose-600/90 text-white border-rose-400 shadow-lg shadow-rose-600/30 ring-2 ring-rose-400 scale-[1.01]'
                  : isCompleted
                  ? 'bg-slate-900/90 text-slate-300 border-emerald-500/30 hover:border-emerald-500/60'
                  : 'bg-slate-950/80 text-slate-400 border-slate-900 hover:border-slate-800'
              }`}
            >
              <div className="flex items-start space-x-2.5 w-full">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : isActive ? (
                  <Play className="w-4 h-4 text-white fill-current shrink-0 animate-pulse mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                )}

                <div className="w-full">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-[10px] opacity-80 uppercase flex-shrink-0">STEP {idx + 1}</span>
                    <span className="font-extrabold text-xs break-words leading-tight">{step.title}</span>
                  </div>
                  <div className="text-[10.5px] font-mono opacity-80 break-words mt-0.5">
                    {step.sourceNodeId} → {step.targetNodeId}
                  </div>
                </div>
              </div>

              <span className={`text-[9.5px] font-mono font-bold uppercase px-2 py-0.5 rounded flex-shrink-0 ${
                isActive
                  ? 'bg-white/20 text-white'
                  : isCompleted
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-slate-900 text-slate-500'
              }`}>
                {isActive ? 'CURRENT' : isCompleted ? 'DONE' : 'PENDING'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
