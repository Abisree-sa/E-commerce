import React, { useState, useEffect, useRef } from 'react';
import { lldDiagramsData, judgeSteps } from '../data/lldDiagramsData';
import { LldNode, LldConnection, LldDiagramData } from '../types';
import { LldDiagramCanvas } from './LldDiagramCanvas';
import { LldWorkflowStepPanel } from './LldWorkflowStepPanel';
import { LldControlBar } from './LldControlBar';
import { LldJudgeModeModal } from './LldJudgeModeModal';
import { LldTracePanels } from './LldTracePanels';
import { Layers, ArrowLeft, Play, LayoutGrid, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LldVisualizerApp: React.FC = () => {
  const [selectedDiagramId, setSelectedDiagramId] = useState<string>('LLD-01');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTraceMode, setActiveTraceMode] = useState<string>('none');

  const [isJudgeMode, setIsJudgeMode] = useState<boolean>(false);
  const [currentJudgeStepIndex, setCurrentJudgeStepIndex] = useState<number>(0);

  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [selectedReviewModule, setSelectedReviewModule] = useState<string>('all');

  const [selectedNode, setSelectedNode] = useState<LldNode | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<LldConnection | null>(null);

  const currentDiagram: LldDiagramData = lldDiagramsData[selectedDiagramId] || lldDiagramsData['LLD-01'];
  const currentScenario = currentDiagram.scenarios[0] || null;
  const currentStep = currentScenario?.steps[currentStepIndex] || null;
  const totalSteps = currentScenario?.steps.length || 0;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize step when diagram changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setSelectedNode(null);
    setSelectedConnection(null);
  }, [selectedDiagramId]);

  // Playback timer ticker
  useEffect(() => {
    if (isPlaying && currentScenario && totalSteps > 0) {
      const stepDuration = (currentStep?.durationMs || 1000) / playbackSpeed;

      timerRef.current = setTimeout(() => {
        if (currentStepIndex < totalSteps - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false); // Finished scenario
        }
      }, stepDuration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, currentScenario, playbackSpeed, currentStep, totalSteps]);

  const handlePlay = () => {
    if (currentScenario && currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0); // Restart from beginning if at end
    }
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSelectedNode(null);
    setSelectedConnection(null);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentScenario && currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleJudgeStepSelect = (idx: number) => {
    setCurrentJudgeStepIndex(idx);
    const targetJudgeStep = judgeSteps[idx];
    if (targetJudgeStep && targetJudgeStep.diagramId) {
      setSelectedDiagramId(targetJudgeStep.diagramId);
      setCurrentStepIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Visualizer Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md px-6 py-3">
        <div className="max-w-[1650px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                  LLD MASTER VISUALIZER
                </span>
                <span className="text-xs text-slate-400 font-mono">SALESTORM Low-Level Design Engine</span>
              </div>
              <h1 className="text-lg font-black text-white tracking-tight">{currentDiagram.title}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/hld"
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold hover:text-white transition-colors flex items-center space-x-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Switch to HLD Visualizer</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-grow max-w-[1650px] mx-auto w-full p-4 md:p-6 space-y-4">
        {/* Control Bar Component */}
        <LldControlBar
          selectedDiagramId={selectedDiagramId}
          onSelectDiagram={setSelectedDiagramId}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleReset}
          onStepForward={handleStepForward}
          onStepBack={handleStepBack}
          playbackSpeed={playbackSpeed}
          onSpeedChange={setPlaybackSpeed}
          activeTraceMode={activeTraceMode}
          onTraceModeChange={setActiveTraceMode}
          isJudgeMode={isJudgeMode}
          onToggleJudgeMode={() => setIsJudgeMode(!isJudgeMode)}
          isReviewMode={isReviewMode}
          onToggleReviewMode={() => setIsReviewMode(!isReviewMode)}
        />

        {/* Interactive Trace Mode Inspection Banner */}
        <LldTracePanels activeMode={activeTraceMode} />

        {/* Review Mode Module Filter Bar */}
        {isReviewMode && (
          <div className="bg-slate-900 border border-sky-500/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">LLD REVIEW MODE — Module Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'inventory', 'payment', 'order', 'product', 'search', 'cart', 'system'].map((mod) => (
                <button
                  key={mod}
                  onClick={() => setSelectedReviewModule(mod)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-colors ${
                    selectedReviewModule === mod
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main 2-Column LLD Layout (60% Left Diagram Canvas, 40% Right Step Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[660px]">
          {/* LEFT SIDE: 60% (~7 Cols) Diagram Canvas */}
          <div className="lg:col-span-7 h-[660px] flex flex-col">
            <LldDiagramCanvas
              nodes={currentDiagram.nodes}
              connections={currentDiagram.connections}
              activeStep={currentStep}
              selectedNodeId={selectedNode?.id || null}
              selectedConnectionId={selectedConnection?.id || null}
              onSelectNode={(node) => {
                setSelectedNode(node);
                setSelectedConnection(null);
              }}
              onSelectConnection={(conn) => {
                setSelectedConnection(conn);
                setSelectedNode(null);
              }}
            />
          </div>

          {/* RIGHT SIDE: 40% (~5 Cols) Step Workflow & Class Inspector Panel */}
          <div className="lg:col-span-5 h-[660px] flex flex-col">
            <LldWorkflowStepPanel
              currentStep={currentStep}
              totalSteps={totalSteps}
              currentStepIndex={currentStepIndex}
              selectedNode={selectedNode}
              selectedConnection={selectedConnection}
              onSelectStep={setCurrentStepIndex}
            />
          </div>
        </div>
      </main>

      {/* Guided Judge Mode Floating Tour Modal */}
      {isJudgeMode && (
        <LldJudgeModeModal
          steps={judgeSteps}
          currentJudgeStepIndex={currentJudgeStepIndex}
          onSelectJudgeStep={handleJudgeStepSelect}
          onClose={() => setIsJudgeMode(false)}
        />
      )}
    </div>
  );
};

export default LldVisualizerApp;
