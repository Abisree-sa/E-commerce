import React, { useState, useEffect, useRef } from 'react';
import { HldNode, HldConnection, WorkflowStep } from '../types';
import { AlertTriangle, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface DiagramCanvasProps {
  nodes: HldNode[];
  connections: HldConnection[];
  activeStep: WorkflowStep | null;
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  highlightedNodeIds?: string[];
  highlightedConnectionIds?: string[];
  onSelectNode: (node: HldNode) => void;
  onSelectConnection: (connection: HldConnection) => void;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  nodes,
  connections,
  activeStep,
  selectedNodeId,
  selectedConnectionId,
  highlightedNodeIds,
  highlightedConnectionIds,
  onSelectNode,
  onSelectConnection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [userZoom, setUserZoom] = useState<number>(1);
  const [fitScale, setFitScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Auto-fit calculation engine ensuring 100% of nodes & labels fit in Full View without clipping
  const calculateAutoFit = () => {
    if (!containerRef.current || nodes.length === 0) return;

    const containerW = containerRef.current.clientWidth || 750;
    const containerH = containerRef.current.clientHeight || 600;

    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + (n.width || 180)));
    const maxY = Math.max(...nodes.map((n) => n.y + (n.height || 85)));

    const graphW = Math.max(maxX - minX, 320);
    const graphH = Math.max(maxY - minY, 220);

    const padding = 65;
    const scaleX = (containerW - padding * 2) / graphW;
    const scaleY = (containerH - padding * 2) / graphH;
    const autoScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.45), 0.95);

    const graphCenterX = (minX + maxX) / 2;
    const graphCenterY = (minY + maxY) / 2;

    const translateX = containerW / 2 - graphCenterX * autoScale;
    const translateY = containerH / 2 - graphCenterY * autoScale;

    setFitScale(autoScale);
    setPanOffset({ x: translateX, y: translateY });
    setUserZoom(1);
  };

  useEffect(() => {
    calculateAutoFit();
    const handleResize = () => calculateAutoFit();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [nodes]);

  const getNodeColor = (type: string, isFailed?: boolean) => {
    if (isFailed) return { bg: 'bg-rose-950/95', border: 'border-rose-500', stroke: '#f43f5e', text: 'text-rose-400' };
    switch (type) {
      case 'client': return { bg: 'bg-slate-900/95', border: 'border-cyan-500/70', stroke: '#06b6d4', text: 'text-cyan-400' };
      case 'gateway': return { bg: 'bg-slate-900/95', border: 'border-amber-500/70', stroke: '#f59e0b', text: 'text-amber-400' };
      case 'service': return { bg: 'bg-slate-900/95', border: 'border-rose-500/70', stroke: '#f43f5e', text: 'text-rose-400' };
      case 'cache': return { bg: 'bg-slate-900/95', border: 'border-rose-600/70', stroke: '#e11d48', text: 'text-rose-300' };
      case 'database': return { bg: 'bg-slate-900/95', border: 'border-amber-600/70', stroke: '#d97706', text: 'text-amber-300' };
      case 'broker': return { bg: 'bg-slate-900/95', border: 'border-purple-500/70', stroke: '#c084fc', text: 'text-purple-300' };
      case 'external': return { bg: 'bg-slate-900/95', border: 'border-indigo-500/70', stroke: '#818cf8', text: 'text-indigo-300' };
      case 'loadbalancer': return { bg: 'bg-slate-900/95', border: 'border-emerald-500/70', stroke: '#10b981', text: 'text-emerald-400' };
      case 'cdn': return { bg: 'bg-slate-900/95', border: 'border-sky-500/70', stroke: '#0284c7', text: 'text-sky-400' };
      default: return { bg: 'bg-slate-900/95', border: 'border-slate-700', stroke: '#64748b', text: 'text-slate-300' };
    }
  };

  const isActiveConnection = (conn: HldConnection) => {
    if (!activeStep) return false;
    return (
      (conn.source === activeStep.sourceNodeId && conn.target === activeStep.targetNodeId) ||
      (conn.source === activeStep.targetNodeId && conn.target === activeStep.sourceNodeId)
    );
  };

  // Calculates exact intersection point on node rectangle border so arrows hit outer edge cleanly
  const getNodeBorderPoint = (sourceId: string, targetId: string): { x: number; y: number } => {
    const sNode = nodes.find((n) => n.id === sourceId);
    const tNode = nodes.find((n) => n.id === targetId);

    if (!sNode || !tNode) return { x: 0, y: 0 };

    const sW = sNode.width || 180;
    const sH = sNode.height || 85;
    const tW = tNode.width || 180;
    const tH = tNode.height || 85;

    const sCenter = { x: sNode.x + sW / 2, y: sNode.y + sH / 2 };
    const tCenter = { x: tNode.x + tW / 2, y: tNode.y + tH / 2 };

    const dx = tCenter.x - sCenter.x;
    const dy = tCenter.y - sCenter.y;

    if (dx === 0 && dy === 0) return sCenter;

    const scaleX = (sW / 2) / Math.abs(dx || 0.001);
    const scaleY = (sH / 2) / Math.abs(dy || 0.001);
    const scale = Math.min(scaleX, scaleY);

    return {
      x: sCenter.x + dx * scale,
      y: sCenter.y + dy * scale,
    };
  };

  const effectiveScale = fitScale * userZoom;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[660px] glass-panel rounded-3xl border-slate-800 overflow-hidden bg-slate-950/95 select-none shadow-2xl"
    >
      {/* Background Architectural Grid Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" width="100%" height="100%">
        <defs>
          <pattern id="arch-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#475569" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#arch-grid)" />
      </svg>

      {/* SVG Canvas & Node Layer */}
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-200 origin-top-left"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${effectiveScale})`,
        }}
      >
        <svg className="absolute inset-0 w-[4500px] h-[4500px] overflow-visible pointer-events-none z-10">
          <defs>
            <marker id="arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
            </marker>

            <marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
            </marker>

            <marker id="arrow-selected" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>

            <marker id="arrow-async" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c084fc" />
            </marker>
          </defs>

          {/* RENDER CONNECTIONS WITH BORDER INTERSECTION MATHEMATICS & SMOOTH CURVES */}
          {connections.map((conn) => {
            const active = isActiveConnection(conn);
            const isSelected = selectedConnectionId === conn.id;

            const isTraceFiltered =
              highlightedConnectionIds && highlightedConnectionIds.length > 0
                ? !highlightedConnectionIds.includes(conn.id)
                : false;

            const startPt = getNodeBorderPoint(conn.source, conn.target);
            const endPt = getNodeBorderPoint(conn.target, conn.source);

            const dx = endPt.x - startPt.x;
            const dy = endPt.y - startPt.y;

            // Smooth Bezier Curve Path
            const controlPt1 = { x: startPt.x + dx * 0.4, y: startPt.y };
            const controlPt2 = { x: endPt.x - dx * 0.4, y: endPt.y };
            const pathD = `M ${startPt.x} ${startPt.y} C ${controlPt1.x} ${controlPt1.y}, ${controlPt2.x} ${controlPt2.y}, ${endPt.x} ${endPt.y}`;

            const midX = (startPt.x + endPt.x) / 2;
            const midY = (startPt.y + endPt.y) / 2;

            const isAsync = conn.protocol === 'Kafka Event' || conn.type === 'async';

            const strokeColor = active
              ? '#f43f5e'
              : isSelected
              ? '#38bdf8'
              : isAsync
              ? '#c084fc'
              : isTraceFiltered
              ? '#1e293b'
              : '#64748b';

            const strokeMarker = active
              ? 'url(#arrow-active)'
              : isSelected
              ? 'url(#arrow-selected)'
              : isAsync
              ? 'url(#arrow-async)'
              : 'url(#arrow-default)';

            // Dynamic pill width based on label text length to prevent text clipping
            const labelText = conn.label || conn.protocol || '';
            const badgeWidth = Math.max(labelText.length * 7.5 + 24, 110);

            return (
              <g
                key={conn.id}
                className={`pointer-events-auto cursor-pointer transition-opacity duration-300 ${
                  isTraceFiltered ? 'opacity-25' : 'opacity-100'
                }`}
                onClick={() => onSelectConnection(conn)}
              >
                {/* Outer Glow for Currently Active Step Line */}
                {active && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="8"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Primary Connection Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={active ? 4 : isSelected ? 3 : 2}
                  strokeDasharray={isAsync ? '6,6' : 'none'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd={strokeMarker}
                  className="transition-all duration-300"
                />

                {/* Connection Label Badge — Dynamic Pill Width ensuring 100% Visibility */}
                {labelText && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x={-badgeWidth / 2}
                      y="-12"
                      width={badgeWidth}
                      height="24"
                      rx="7"
                      fill="#0f172a"
                      stroke={active ? '#f43f5e' : isSelected ? '#38bdf8' : isAsync ? '#c084fc' : '#334155'}
                      strokeWidth="1.5"
                      className="shadow-lg opacity-95"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={active ? '#ffffff' : isAsync ? '#e9d5ff' : '#cbd5e1'}
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {labelText}
                    </text>
                  </g>
                )}

                {/* ANIMATED TRAVELLING DATA PACKET (ONLY FOR ACTIVE STEP) */}
                {active && (
                  <g>
                    <circle r="10" fill="#f43f5e" opacity="0.4">
                      <animateMotion path={pathD} dur="1.2s" repeatCount="indefinite" />
                    </circle>
                    <circle r="4.5" fill="#ffffff">
                      <animateMotion path={pathD} dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* RENDER ARCHITECTURE COMPONENT NODES — FULL TEXT VISIBILITY WITHOUT CLIPPING */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isActiveInStep = activeStep?.sourceNodeId === node.id || activeStep?.targetNodeId === node.id;
          const isFailed = activeStep?.failedNodeId === node.id;

          const isTraceFiltered =
            highlightedNodeIds && highlightedNodeIds.length > 0
              ? !highlightedNodeIds.includes(node.id)
              : false;

          const styleColor = getNodeColor(node.type, isFailed);

          const w = node.width || 180;
          const minH = node.height || 85;

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node)}
              className={`absolute rounded-2xl ${styleColor.bg} border-2 ${styleColor.border} p-3.5 cursor-pointer transition-all duration-300 flex flex-col justify-between group shadow-2xl backdrop-blur-xl ${
                isTraceFiltered
                  ? 'opacity-25 grayscale'
                  : isSelected
                  ? 'ring-4 ring-amber-400/50 scale-105 z-30'
                  : isActiveInStep
                  ? 'ring-4 ring-rose-500/70 scale-105 z-20 shadow-2xl shadow-rose-500/40'
                  : isFailed
                  ? 'animate-pulse ring-4 ring-rose-600 z-30'
                  : 'hover:scale-102 hover:border-white/50 z-10'
              }`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${w}px`,
                minHeight: `${minH}px`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${styleColor.text}`}>
                  {node.type}
                </span>
                {isFailed ? (
                  <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </div>

              {/* Full Title Visibility — No Truncation */}
              <div className="font-black text-white text-[13px] leading-snug mt-1 break-words font-sans group-hover:text-rose-300">
                {node.label}
              </div>

              {/* Full Subtitle / Protocol Visibility */}
              {node.communication && (
                <div className="text-[10px] font-mono text-slate-300 mt-1 break-words leading-tight">
                  {node.communication}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FIXED CANVAS LEGEND OVERLAY */}
      <div className="absolute bottom-4 left-4 glass-panel p-3 rounded-2xl border-slate-800 bg-slate-950/90 text-xs space-y-1.5 z-30 border shadow-xl backdrop-blur-md">
        <div className="font-black text-slate-400 uppercase tracking-widest text-[9.5px]">Architecture Legend</div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 bg-slate-400"></span>
            <span className="text-slate-200 font-medium">Sync REST</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 bg-purple-400 border-dashed border-t border-purple-400"></span>
            <span className="text-purple-300 font-bold">Async Event</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-1 bg-rose-500 rounded font-bold"></span>
            <span className="text-rose-400 font-bold">Active Step (Red)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-cyan-300 font-bold">Data Packet</span>
          </div>
        </div>
      </div>

      {/* CANVAS ZOOM & FIT VIEW CONTROLS */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-1.5 glass-panel p-1.5 rounded-2xl border-slate-800 z-30 text-xs bg-slate-950/90 shadow-xl backdrop-blur-md">
        <button
          onClick={() => setUserZoom((z) => Math.max(0.5, z - 0.1))}
          className="p-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white font-bold transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="px-2 text-slate-300 font-mono text-xs font-bold">
          {Math.round(effectiveScale * 100)}%
        </span>
        <button
          onClick={() => setUserZoom((z) => Math.min(1.6, z + 0.1))}
          className="p-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white font-bold transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={calculateAutoFit}
          className="px-3 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-500 font-bold text-xs flex items-center space-x-1 shadow-md transition-colors"
          title="Recalculate Fit View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Fit View</span>
        </button>
      </div>
    </div>
  );
};
