import React, { useState, useEffect, useRef } from 'react';
import { hldDiagramsData } from '../data/hldDiagramsData';
import { HldNode, HldConnection, HldDiagramData } from '../types';
import { DiagramCanvas } from './DiagramCanvas';
import { ControlBar } from './ControlBar';
import { WorkflowStepPanel } from './WorkflowStepPanel';
import { WorkflowTimeline } from './WorkflowTimeline';
import { Layers, ArrowLeft, Play, LayoutGrid } from 'lucide-react';

export const HldVisualizerApp: React.FC = () => {
  const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [selectedTraceFeatureId, setSelectedTraceFeatureId] = useState<string>('all');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  const [selectedNode, setSelectedNode] = useState<HldNode | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<HldConnection | null>(null);

  const currentDiagram: HldDiagramData | null = selectedDiagramId ? hldDiagramsData[selectedDiagramId] || null : null;
  const currentScenario = currentDiagram?.scenarios.find((s) => s.id === selectedScenarioId) || currentDiagram?.scenarios[0] || null;
  const currentStep = currentScenario?.steps[currentStepIndex] || null;

  // Auto-advance timer reference for Play simulation
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize scenario when diagram changes
  useEffect(() => {
    if (currentDiagram) {
      const defaultSc = currentDiagram.scenarios[0];
      setSelectedScenarioId(defaultSc?.id || '');
      setCurrentStepIndex(0);
      setIsPlaying(false);
      setSelectedNode(null);
      setSelectedConnection(null);
      setSelectedTraceFeatureId('all');
    }
  }, [selectedDiagramId]);

  // Playback timer ticker
  useEffect(() => {
    if (isPlaying && currentScenario) {
      const stepDuration = (currentStep?.durationMs || 1000) / playbackSpeed;

      timerRef.current = setTimeout(() => {
        if (currentStepIndex < currentScenario.steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false); // Finished scenario
        }
      }, stepDuration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, currentScenario, playbackSpeed, currentStep]);

  const handlePlay = () => {
    if (currentScenario && currentStepIndex >= currentScenario.steps.length - 1) {
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
    if (currentScenario && currentStepIndex < currentScenario.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Compute feature trace highlighted nodes and connections
  const getTraceHighlight = (): { nodeIds?: string[]; connectionIds?: string[] } => {
    if (selectedTraceFeatureId === 'all' || !currentDiagram) return {};

    switch (selectedTraceFeatureId) {
      case 'search':
        return {
          nodeIds: ['cust', 'client', 'cdn_waf', 'load_balancer', 'api_gateway', 'search_svc', 'redis', 'postgres'],
          connectionIds: ['c1', 'c2', 'c3', 'c4', 'c8', 'c3'],
        };
      case 'checkout':
        return {
          nodeIds: ['cust', 'client', 'api_gateway', 'inventory_svc', 'postgres', 'users_10k', 'dbs'],
          connectionIds: ['c1', 'c6', 'c10', 'c2'],
        };
      case 'payment':
        return {
          nodeIds: ['pay_svc', 'pay_db', 'kafka', 'payment_svc', 'postgres'],
          connectionIds: ['c11', 'c12', 'c2', 'c3'],
        };
      case 'failover':
        return {
          nodeIds: ['load_balancer', 'inv_1', 'inv_2', 'inv_3', 'lb', 'gw_1', 'gw_2'],
          connectionIds: ['c2', 'c3', 'c4'],
        };
      case 'recovery':
        return {
          nodeIds: ['kafka', 'order_svc', 'order_db'],
          connectionIds: ['c13', 'c14', 'c4', 'c5'],
        };
      default:
        return {};
    }
  };

  const traceHighlight = getTraceHighlight();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col select-none">
      {/* Header Banner */}
      {!isPresentationMode && (
        <div className="glass-panel border-b border-slate-800 bg-slate-950/95 py-4 px-6 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-bold uppercase tracking-widest mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>HLD • Interactive System Design Visualizer</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                SALESTORM — High-Level Design Visualizer
              </h1>
            </div>

            {selectedDiagramId && (
              <button
                onClick={() => setSelectedDiagramId(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center space-x-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All 10 HLD Diagrams</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
        {!selectedDiagramId ? (
          /* ================================================================= */
          /* LANDING PAGE: GRID OF ALL 10 HLD DIAGRAM CARDS                   */
          /* ================================================================= */
          <div className="max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-white flex items-center space-x-2">
                  <LayoutGrid className="w-5 h-5 text-rose-500" />
                  <span>High-Level Design Architecture Suite</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  10 Interactive architecture diagrams with live animated workflow scenarios.
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-black border border-rose-500/30">
                10 / 10 Diagrams Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {Object.values(hldDiagramsData).map((diag) => (
                <div
                  key={diag.id}
                  onClick={() => setSelectedDiagramId(diag.id)}
                  className="glass-panel p-6 rounded-3xl border-slate-800 hover:border-rose-500/50 hover:bg-slate-900/60 transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-4 shadow-2xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-black tracking-wider">
                        {diag.code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Interactive</span>
                    </div>

                    <h3 className="text-lg font-black text-white group-hover:text-rose-400 transition-colors">
                      {diag.title}
                    </h3>
                    <div className="text-xs font-semibold text-rose-400/80 mt-0.5">{diag.subtitle}</div>
                    <p className="text-slate-400 text-xs leading-relaxed mt-2 line-clamp-3">
                      {diag.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">{diag.scenarios.length} Animated Scenarios</span>
                    <button className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 group-hover:bg-rose-600 text-rose-400 group-hover:text-white text-xs font-bold transition-all flex items-center space-x-1">
                      <span>Open Diagram</span>
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* SELECTED HLD VIEW: STRICT 60% LEFT / 40% RIGHT SPLIT SCREEN AREA   */
          /* ================================================================= */
          <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
            {/* Diagram Title Header & Transport Bar */}
            <div className="shrink-0 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-wider mb-0.5">
                    {currentDiagram?.code}
                  </div>
                  <h2 className="text-xl font-black text-white inline-block ml-2">{currentDiagram?.title}</h2>
                  <span className="text-slate-400 text-xs ml-3 hidden md:inline">{currentDiagram?.subtitle}</span>
                </div>
              </div>

              {/* Transport Control Bar */}
              <ControlBar
                isPlaying={isPlaying}
                playbackSpeed={playbackSpeed}
                scenarios={currentDiagram?.scenarios || []}
                selectedScenarioId={selectedScenarioId}
                selectedTraceFeatureId={selectedTraceFeatureId}
                isPresentationMode={isPresentationMode}
                onPlay={handlePlay}
                onPause={handlePause}
                onReset={handleReset}
                onStepForward={handleStepForward}
                onStepBack={handleStepBack}
                onChangeSpeed={setPlaybackSpeed}
                onSelectScenario={setSelectedScenarioId}
                onSelectTraceFeature={setSelectedTraceFeatureId}
                onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
              />
            </div>

            {/* STRICT 2-COLUMN NON-OVERLAPPING FLEX LAYOUT (LEFT 60% | RIGHT 40%) */}
            <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 overflow-hidden">
              {/* LEFT COLUMN (60% WIDTH): ARCHITECTURE DIAGRAM CANVAS */}
              <div className="w-full lg:w-[60%] lg:flex-none flex flex-col min-w-0 h-[560px] lg:h-full relative overflow-hidden rounded-3xl">
                <DiagramCanvas
                  nodes={currentDiagram?.nodes || []}
                  connections={currentDiagram?.connections || []}
                  activeStep={currentStep}
                  selectedNodeId={selectedNode?.id || null}
                  selectedConnectionId={selectedConnection?.id || null}
                  highlightedNodeIds={traceHighlight.nodeIds}
                  highlightedConnectionIds={traceHighlight.connectionIds}
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

              {/* RIGHT COLUMN (40% WIDTH): WORKFLOW TIMELINE & CURRENT STEP DETAILS PANEL */}
              <div className="w-full lg:w-[40%] lg:flex-none flex flex-col min-w-0 h-auto lg:h-full overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                {/* 1. WORKFLOW TIMELINE LIST (Step 1 -> Step 2 -> Step 3 ...) */}
                <WorkflowTimeline
                  steps={currentScenario?.steps || []}
                  currentStepIndex={currentStepIndex}
                  onSelectStep={(idx) => {
                    setIsPlaying(false);
                    setCurrentStepIndex(idx);
                  }}
                />

                {/* 2. CURRENT STEP DETAILS & CLICKED ELEMENT PANEL */}
                <WorkflowStepPanel
                  step={currentStep}
                  currentStepIndex={currentStepIndex}
                  totalSteps={currentScenario?.steps.length || 0}
                  selectedNode={selectedNode}
                  selectedConnection={selectedConnection}
                  onClearSelection={() => {
                    setSelectedNode(null);
                    setSelectedConnection(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
