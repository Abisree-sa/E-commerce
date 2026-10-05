import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Zap, Eye, Sliders, Shield } from 'lucide-react';
import { HldScenario } from '../types';

interface ControlBarProps {
  isPlaying: boolean;
  playbackSpeed: number;
  scenarios: HldScenario[];
  selectedScenarioId: string;
  selectedTraceFeatureId: string;
  isPresentationMode: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onChangeSpeed: (speed: number) => void;
  onSelectScenario: (scenarioId: string) => void;
  onSelectTraceFeature: (traceId: string) => void;
  onTogglePresentationMode: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isPlaying,
  playbackSpeed,
  scenarios,
  selectedScenarioId,
  selectedTraceFeatureId,
  isPresentationMode,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBack,
  onChangeSpeed,
  onSelectScenario,
  onSelectTraceFeature,
  onTogglePresentationMode,
}) => {
  const traceOptions = [
    { id: 'all', label: 'All Architecture Features (Default)' },
    { id: 'search', label: 'Trace: Product Search & Redis Cache' },
    { id: 'checkout', label: 'Trace: Flash Sale Checkout & Atomic Stock' },
    { id: 'payment', label: 'Trace: Payment & Event Outbox' },
    { id: 'failover', label: 'Trace: Load Balancer Failover' },
    { id: 'recovery', label: 'Trace: Order Service Outage Recovery' },
  ];

  return (
    <div className="glass-panel p-4 rounded-3xl border-slate-800 bg-slate-950/95 flex flex-wrap items-center justify-between gap-3 shadow-2xl border border-slate-800">
      {/* Left: Playback Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={isPlaying ? onPause : onPlay}
          className={`px-4 py-2 rounded-2xl font-black text-xs flex items-center space-x-2 transition-all duration-300 shadow-lg ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 scale-105'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>PLAY WORKFLOW</span>
            </>
          )}
        </button>

        <button
          onClick={onStepBack}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Previous Step"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={onStepForward}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Next Step"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={onReset}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
          title="Reset Animation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Speed Selector */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px] font-bold">
          <span className="px-2 text-slate-500 uppercase text-[9px]">Speed</span>
          {[0.5, 1, 1.5, 2].map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                playbackSpeed === s
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Center & Right: Scenario Selector, Trace Feature Selector & Presentation Mode */}
      <div className="flex items-center space-x-3 flex-wrap">
        {/* Scenario Selector Dropdown */}
        {scenarios.length > 0 && (
          <div className="flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-rose-400" />
            <select
              value={selectedScenarioId}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-rose-500"
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  Scenario: {sc.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Trace Feature Dropdown */}
        <div className="flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={selectedTraceFeatureId}
            onChange={(e) => onSelectTraceFeature(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-cyan-300 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            {traceOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Presentation Mode Toggle */}
        <button
          onClick={onTogglePresentationMode}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
            isPresentationMode
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{isPresentationMode ? 'Exit Presentation' : 'Presentation Mode'}</span>
        </button>
      </div>
    </div>
  );
};
