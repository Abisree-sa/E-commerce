import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward, Award, Search, Layers, Eye } from 'lucide-react';
import { lldDiagramsData } from '../data/lldDiagramsData';

interface LldControlBarProps {
  selectedDiagramId: string;
  onSelectDiagram: (id: string) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  activeTraceMode: string;
  onTraceModeChange: (mode: string) => void;
  isJudgeMode: boolean;
  onToggleJudgeMode: () => void;
  isReviewMode: boolean;
  onToggleReviewMode: () => void;
}

export const LldControlBar: React.FC<LldControlBarProps> = ({
  selectedDiagramId,
  onSelectDiagram,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBack,
  playbackSpeed,
  onSpeedChange,
  activeTraceMode,
  onTraceModeChange,
  isJudgeMode,
  onToggleJudgeMode,
  isReviewMode,
  onToggleReviewMode,
}) => {
  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
      {/* Diagram Dropdown Selector */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider hidden sm:inline">LLD Diagram:</span>
        </div>
        <select
          value={selectedDiagramId}
          onChange={(e) => onSelectDiagram(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 max-w-xs"
        >
          {Object.values(lldDiagramsData).map((diag) => (
            <option key={diag.id} value={diag.id}>
              {diag.code}: {diag.title}
            </option>
          ))}
        </select>
      </div>

      {/* Sequence Animation Playback Controls */}
      <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl">
        <button
          onClick={onStepBack}
          title="Step Backward"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {isPlaying ? (
          <button
            onClick={onPause}
            title="Pause Execution"
            className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs flex items-center space-x-1 shadow-lg shadow-rose-600/30 hover:bg-rose-600 transition-colors"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>PAUSE</span>
          </button>
        ) : (
          <button
            onClick={onPlay}
            title="Play Animated Flow"
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 shadow-lg shadow-emerald-600/30 hover:bg-emerald-600 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>PLAY</span>
          </button>
        )}

        <button
          onClick={onStepForward}
          title="Step Forward"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={onReset}
          title="Reset Sequence"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-800 mx-1" />

        {/* Speed Selector */}
        <div className="flex items-center space-x-1 font-mono text-xs">
          <FastForward className="w-3.5 h-3.5 text-slate-400" />
          {[0.5, 1, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => onSpeedChange(spd)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                playbackSpeed === spd ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Trace Modes & Special Modes */}
      <div className="flex items-center space-x-2">
        <select
          value={activeTraceMode}
          onChange={(e) => onTraceModeChange(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
        >
          <option value="none">Trace Mode: None</option>
          <option value="feature">Trace Feature</option>
          <option value="attribute">Trace Attribute</option>
          <option value="method">Trace Method</option>
          <option value="api">Trace API</option>
          <option value="event">Trace Event</option>
        </select>

        {/* Judge Mode Toggle Button */}
        <button
          onClick={onToggleJudgeMode}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            isJudgeMode
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
              : 'bg-slate-900 text-amber-400 border border-amber-500/30 hover:bg-amber-500/10'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>LLD JUDGE MODE</span>
        </button>

        {/* Review Mode Toggle Button */}
        <button
          onClick={onToggleReviewMode}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            isReviewMode
              ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30'
              : 'bg-slate-900 text-sky-400 border border-sky-500/30 hover:bg-sky-500/10'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>REVIEW MODE</span>
        </button>
      </div>
    </div>
  );
};
