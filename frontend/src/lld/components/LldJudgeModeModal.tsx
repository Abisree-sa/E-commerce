import React from 'react';
import { JudgeStep } from '../types';
import { Award, CheckCircle2, ArrowRight, ShieldCheck, Cpu, Code2, Sparkles, X } from 'lucide-react';

interface LldJudgeModeModalProps {
  steps: JudgeStep[];
  currentJudgeStepIndex: number;
  onSelectJudgeStep: (index: number) => void;
  onClose: () => void;
}

export const LldJudgeModeModal: React.FC<LldJudgeModeModalProps> = ({
  steps,
  currentJudgeStepIndex,
  onSelectJudgeStep,
  onClose,
}) => {
  const currentStep = steps[currentJudgeStepIndex] || steps[0];

  return (
    <div className="fixed inset-x-4 bottom-6 z-50 max-w-4xl mx-auto bg-slate-950/95 border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl backdrop-blur-xl text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide uppercase">SALESTORM LLD JUDGE MODE</h3>
            <p className="text-xs text-amber-300 font-medium">Guided Architecture & Code Review Tour for Hackathon Evaluation</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
            STEP {currentStep.stepNumber} / {steps.length}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Step Title & Key Takeaway */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{currentStep.title}</span>
          </h4>

          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Key Takeaway</span>
            <p className="text-xs text-slate-200 leading-relaxed">{currentStep.keyTakeaway}</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1 font-mono text-xs text-emerald-300">
            <span className="text-[10px] font-sans font-bold uppercase text-slate-400 tracking-wider">Implementation Highlight</span>
            <p>{currentStep.codeHighlight}</p>
          </div>
        </div>

        {/* Architectural Insight Card */}
        <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl flex flex-col justify-between space-y-2">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Architectural Insight</span>
            </span>
            <p className="text-xs text-amber-100 mt-2 leading-relaxed italic">{currentStep.architecturalInsight}</p>
          </div>

          <div className="pt-2 border-t border-amber-500/20 flex justify-between items-center text-[10px] text-amber-300 font-mono">
            <span>Status: VERIFIED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
        <button
          disabled={currentJudgeStepIndex === 0}
          onClick={() => onSelectJudgeStep(currentJudgeStepIndex - 1)}
          className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
        >
          Previous Step
        </button>

        <div className="flex items-center space-x-1">
          {steps.map((s, idx) => (
            <button
              key={s.stepNumber}
              onClick={() => onSelectJudgeStep(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentJudgeStepIndex === idx ? 'bg-amber-400 w-6' : 'bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <button
          disabled={currentJudgeStepIndex === steps.length - 1}
          onClick={() => onSelectJudgeStep(currentJudgeStepIndex + 1)}
          className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/30 hover:bg-amber-400 disabled:opacity-40 flex items-center space-x-1"
        >
          <span>Next Judge Step</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
