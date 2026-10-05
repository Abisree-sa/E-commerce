import React, { useState, useEffect, useRef } from 'react';
import { LldNode, LldConnection, LldWorkflowStep } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Database, Server, Cpu, Key, FileCode, Zap, Sparkles } from 'lucide-react';

interface LldDiagramCanvasProps {
  nodes: LldNode[];
  connections: LldConnection[];
  activeStep: LldWorkflowStep | null;
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  onSelectNode: (node: LldNode) => void;
  onSelectConnection: (connection: LldConnection) => void;
}

export const LldDiagramCanvas: React.FC<LldDiagramCanvasProps> = ({
  nodes,
  connections,
  activeStep,
  selectedNodeId,
  selectedConnectionId,
  onSelectNode,
  onSelectConnection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [userZoom, setUserZoom] = useState<number>(1);
  const [fitScale, setFitScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Auto-fit calculation ensuring 100% of nodes & text fit in Full View without clipping
  const calculateAutoFit = () => {
    if (!containerRef.current || nodes.length === 0) return;

    const containerW = containerRef.current.clientWidth || 800;
    const containerH = containerRef.current.clientHeight || 600;

    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + (n.width || 280)));
    const maxY = Math.max(...nodes.map((n) => n.y + (n.height || 180)));

    const graphW = Math.max(maxX - minX, 350);
    const graphH = Math.max(maxY - minY, 250);

    const padding = 70;
    const scaleX = (containerW - padding * 2) / graphW;
    const scaleY = (containerH - padding * 2) / graphH;
    const autoScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.45), 0.92);

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

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setUserZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 2.5));
  };

  // Mouse Drag Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = () => setUserZoom((prev) => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setUserZoom((prev) => Math.max(prev - 0.15, 0.4));
  const handleResetZoom = () => calculateAutoFit();

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => console.error(err));
      } else {
        document.exitFullscreen().catch((err) => console.error(err));
      }
    }
  };

  const currentScale = fitScale * userZoom;

  // Calculates exact intersection point on node rectangle border so arrows hit outer edge cleanly
  const getNodeBorderPoint = (sourceId: string, targetId: string): { x: number; y: number } => {
    const sNode = nodes.find((n) => n.id === sourceId);
    const tNode = nodes.find((n) => n.id === targetId);

    if (!sNode || !tNode) return { x: 0, y: 0 };

    const sW = sNode.width || 280;
    const sH = sNode.height || 180;
    const tW = tNode.width || 280;
    const tH = tNode.height || 180;

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

  const getNodeIcon = (type: LldNode['type']) => {
    switch (type) {
      case 'controller': return <Server className="w-4 h-4 text-cyan-400" />;
      case 'service': return <Cpu className="w-4 h-4 text-rose-400" />;
      case 'repository': return <Database className="w-4 h-4 text-amber-400" />;
      case 'entity': return <FileCode className="w-4 h-4 text-emerald-400" />;
      case 'database': return <Database className="w-4 h-4 text-blue-400" />;
      case 'cache': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'broker': return <Key className="w-4 h-4 text-purple-400" />;
      case 'state': return <Sparkles className="w-4 h-4 text-amber-300" />;
      default: return <Server className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNodeHeaderColor = (type: LldNode['type']) => {
    switch (type) {
      case 'controller': return 'bg-cyan-950/90 border-cyan-500/40 text-cyan-300';
      case 'service': return 'bg-rose-950/90 border-rose-500/40 text-rose-300';
      case 'repository': return 'bg-amber-950/90 border-amber-500/40 text-amber-300';
      case 'entity': return 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300';
      case 'database': return 'bg-blue-950/90 border-blue-500/40 text-blue-300';
      case 'cache': return 'bg-yellow-950/90 border-yellow-500/40 text-yellow-300';
      case 'broker': return 'bg-purple-950/90 border-purple-500/40 text-purple-300';
      case 'state': return 'bg-amber-950/90 border-amber-400/40 text-amber-200';
      default: return 'bg-slate-900 border-slate-700 text-slate-300';
    }
  };

  const isStepActive = (conn: LldConnection): boolean => {
    if (!activeStep) return false;
    return (
      (conn.source === activeStep.sourceNodeId && conn.target === activeStep.targetNodeId) ||
      (conn.source === activeStep.targetNodeId && conn.target === activeStep.sourceNodeId)
    );
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full h-full min-h-[600px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:28px_28px] opacity-35 pointer-events-none" />

      {/* Canvas Top Controls */}
      <div className="absolute top-4 left-4 z-30 flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl backdrop-blur-md shadow-xl text-xs font-mono">
        <span className="text-slate-400">Scale:</span>
        <span className="text-rose-400 font-bold">{Math.round(currentScale * 100)}%</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300 font-medium">Full View Centered</span>
      </div>

      <div className="absolute top-4 right-4 z-30 flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl backdrop-blur-md shadow-xl">
        <button
          onClick={handleZoomIn}
          title="Zoom In (+)"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out (-)"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          title="Reset / Fit View"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-800 mx-1" />
        <button
          onClick={handleFullscreen}
          title="Toggle Fullscreen"
          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive Zoomable Canvas */}
      <div
        className="w-full h-full origin-top-left transition-transform duration-150 ease-out"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${currentScale})`,
        }}
      >
        {/* SVG Connectors Overlay */}
        <svg className="absolute inset-0 w-[4500px] h-[4500px] pointer-events-none overflow-visible">
          <defs>
            <marker id="arrow-neutral" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
            </marker>
            <marker id="arrow-async" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
            </marker>
            <marker id="arrow-sql" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>
          </defs>

          {connections.map((conn) => {
            const startPt = getNodeBorderPoint(conn.source, conn.target);
            const endPt = getNodeBorderPoint(conn.target, conn.source);
            const active = isStepActive(conn);
            const isAsync = conn.type === 'async_event';
            const isSql = conn.type === 'sql_query';
            const isSelected = selectedConnectionId === conn.id;

            const strokeColor = active
              ? '#f43f5e'
              : isAsync
              ? '#a855f7'
              : isSql
              ? '#38bdf8'
              : isSelected
              ? '#fbbf24'
              : '#475569';

            const strokeWidth = active ? 4 : isSelected ? 3 : 2;
            const markerId = active
              ? 'url(#arrow-active)'
              : isAsync
              ? 'url(#arrow-async)'
              : isSql
              ? 'url(#arrow-sql)'
              : 'url(#arrow-neutral)';

            // Smooth Bezier Curve Path
            const dx = endPt.x - startPt.x;
            const dy = endPt.y - startPt.y;
            const controlPt1 = { x: startPt.x + dx * 0.4, y: startPt.y };
            const controlPt2 = { x: endPt.x - dx * 0.4, y: endPt.y };
            const pathD = `M ${startPt.x} ${startPt.y} C ${controlPt1.x} ${controlPt1.y}, ${controlPt2.x} ${controlPt2.y}, ${endPt.x} ${endPt.y}`;

            const midX = (startPt.x + endPt.x) / 2;
            const midY = (startPt.y + endPt.y) / 2;

            // Dynamically calculated pill width to fit 100% of label text without truncation
            const labelText = conn.label || '';
            const badgeWidth = Math.max(labelText.length * 7.5 + 24, 140);

            return (
              <g key={conn.id} className="pointer-events-auto cursor-pointer" onClick={() => onSelectConnection(conn)}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isAsync ? '6 4' : 'none'}
                  markerEnd={markerId}
                  className="transition-all duration-300 hover:stroke-rose-400"
                />

                {/* Animated Packet on Active Step ONLY */}
                {active && (
                  <circle r="6" fill="#f43f5e" className="animate-pulse">
                    <animateMotion path={pathD} dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Edge Label Badge - Dynamic Pill Width ensuring 100% Text Visibility */}
                {labelText && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x={-badgeWidth / 2}
                      y="-12"
                      width={badgeWidth}
                      height="24"
                      rx="7"
                      fill="#0f172a"
                      stroke={strokeColor}
                      strokeWidth="1.5"
                      className="opacity-95 shadow-lg"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={active ? '#f43f5e' : '#f1f5f9'}
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {labelText}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* LLD Class Compartment Cards — Full Text Visibility without Truncation */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isActiveNode = activeStep?.sourceNodeId === node.id || activeStep?.targetNodeId === node.id;
          const width = node.width || 280;
          const minHeight = node.height || 180;

          return (
            <div
              key={node.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node);
              }}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${width}px`,
                minHeight: `${minHeight}px`,
              }}
              className={`absolute rounded-2xl border flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-2xl backdrop-blur-xl pointer-events-auto ${
                isActiveNode
                  ? 'border-rose-500 bg-slate-900 ring-4 ring-rose-500/30 shadow-rose-950/80 scale-[1.03] z-20'
                  : isSelected
                  ? 'border-amber-400 bg-slate-900 ring-2 ring-amber-400/30 z-20'
                  : 'border-slate-800 bg-slate-900/95 hover:border-slate-700 hover:bg-slate-900 z-10'
              }`}
            >
              {/* UML Class Header Compartment */}
              <div className={`p-3 rounded-t-2xl border-b flex items-center justify-between ${getNodeHeaderColor(node.type)}`}>
                <div className="flex items-center space-x-2 w-full">
                  <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 flex-shrink-0">{getNodeIcon(node.type)}</div>
                  <div className="w-full overflow-hidden">
                    <span className="text-[9px] font-mono uppercase tracking-wider block text-slate-400">
                      &lt;&lt;{node.type}&gt;&gt;
                    </span>
                    <h4 className="text-xs font-black font-mono tracking-wide text-white break-words leading-tight">{node.label}</h4>
                  </div>
                </div>
              </div>

              {/* Body Compartments */}
              <div className="p-3 space-y-2.5 text-left">
                {/* Spring Annotations Badges */}
                {node.springAnnotations && node.springAnnotations.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {node.springAnnotations.map((anno, idx) => (
                      <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold">
                        {anno}
                      </span>
                    ))}
                  </div>
                )}

                {/* Attributes Compartment — Full Text Visibility */}
                {node.attributes && node.attributes.length > 0 && (
                  <div className="border-t border-slate-800 pt-2 space-y-1">
                    <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Attributes</p>
                    <div className="space-y-1.5 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                      {node.attributes.map((attr, i) => (
                        <div key={i} className="flex items-start justify-between text-[10px] font-mono gap-2 leading-snug">
                          <span className="text-slate-200 font-medium break-all">
                            <span className="text-slate-500 mr-1">-</span>
                            {attr.name}
                          </span>
                          <span className="text-amber-300 font-bold flex-shrink-0">{attr.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Methods Compartment — Full Text Visibility */}
                {node.methods && node.methods.length > 0 && (
                  <div className="border-t border-slate-800 pt-2 space-y-1">
                    <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Methods</p>
                    <div className="space-y-1.5 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                      {node.methods.map((m, i) => (
                        <div key={i} className="flex items-start justify-between text-[10px] font-mono text-emerald-300 gap-2 leading-snug">
                          <span className="break-all">
                            <span className="text-emerald-400 font-bold mr-1">{m.visibility}</span>
                            {m.name}({m.parameters || ''})
                          </span>
                          {m.transactional && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-sans font-bold flex-shrink-0">
                              @Tx
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Package Bar — Full Package Path Visibility */}
              {node.package && (
                <div className="p-2 bg-slate-950/90 rounded-b-2xl border-t border-slate-800 text-center">
                  <p className="text-[9px] font-mono text-slate-400 break-all">{node.package}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Canvas Bottom Legend Pill */}
      <div className="absolute bottom-4 left-4 z-30 hidden md:flex items-center space-x-3 bg-slate-900/95 border border-slate-800 px-4 py-2 rounded-xl backdrop-blur-md shadow-xl text-xs font-mono">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-slate-200 font-bold">Active Step</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-0.5 bg-slate-400" />
          <span className="text-slate-300">Sync Method</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-0.5 bg-purple-400 border-dashed" />
          <span className="text-purple-300">Async Event</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-0.5 bg-cyan-400" />
          <span className="text-cyan-300">SQL / ORM Query</span>
        </div>
      </div>
    </div>
  );
};
