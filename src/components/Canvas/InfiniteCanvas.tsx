import React, { useState, useRef, useEffect } from 'react';
import { CanvasNode, CanvasEdge, Viewport } from '../../types';
import { NodeRenderer } from './NodeRenderer';
import { EdgeRenderer } from './EdgeRenderer';
import { MiniMap } from './MiniMap';

interface Props {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: Viewport;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  onViewportChange: (viewport: Viewport) => void;
  onSelectNode: (e: React.MouseEvent, nodeId: string) => void;
  onSelectEdge: (e: React.MouseEvent, edgeId: string) => void;
  onClearSelection: () => void;
  onMoveNode: (nodeId: string, dx: number, dy: number) => void;
  onUpdateNode: (nodeId: string, partial: Partial<CanvasNode>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (node: CanvasNode) => void;
  onDeleteEdge: (edgeId: string) => void;
  onConnectNodes: (fromId: string, toId: string) => void;
}

export const InfiniteCanvas: React.FC<Props> = ({
  nodes,
  edges,
  viewport,
  selectedNodeIds,
  selectedEdgeIds,
  onViewportChange,
  onSelectNode,
  onSelectEdge,
  onClearSelection,
  onMoveNode,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onDeleteEdge,
  onConnectNodes
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);

  // Connecting state
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle Wheel Zoom & Pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.2), 2.5);

      // Zoom toward cursor
      const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const newX = cursorX - (cursorX - viewport.x) * (newZoom / viewport.zoom);
      const newY = cursorY - (cursorY - viewport.y) * (newZoom / viewport.zoom);

      onViewportChange({ x: newX, y: newY, zoom: newZoom });
    } else {
      // Pan
      onViewportChange({
        ...viewport,
        x: viewport.x - e.deltaX,
        y: viewport.y - e.deltaY
      });
    }
  };

  // Background Pan via Mouse Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    // If left click on empty background or middle click
    if (e.button === 1 || (e.button === 0 && e.target === containerRef.current)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      onClearSelection();
      if (connectingSourceId) setConnectingSourceId(null);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning && panStart) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        onViewportChange({
          ...viewport,
          x: viewport.x + dx,
          y: viewport.y + dy
        });
        setPanStart({ x: e.clientX, y: e.clientY });
      }

      if (connectingSourceId) {
        const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
        const canvasX = (e.clientX - rect.left - viewport.x) / viewport.zoom;
        const canvasY = (e.clientY - rect.top - viewport.y) / viewport.zoom;
        setMousePos({ x: canvasX, y: canvasY });
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      setPanStart(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, panStart, viewport, onViewportChange, connectingSourceId]);

  const handleStartConnecting = (fromNodeId: string) => {
    if (connectingSourceId === fromNodeId) {
      setConnectingSourceId(null);
    } else {
      setConnectingSourceId(fromNodeId);
    }
  };

  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    if (connectingSourceId && connectingSourceId !== nodeId) {
      onConnectNodes(connectingSourceId, nodeId);
      setConnectingSourceId(null);
      return;
    }
    onSelectNode(e, nodeId);
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      className={`relative w-full h-full overflow-hidden bg-slate-950 canvas-grid-dots ${
        isPanning ? 'cursor-grabbing' : connectingSourceId ? 'cursor-crosshair' : 'cursor-default'
      }`}
    >
      {/* Canvas World Layer */}
      <div
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0'
        }}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <div className="relative w-0 h-0 pointer-events-auto">
          {/* Edges Layer */}
          <EdgeRenderer
            edges={edges}
            nodes={nodes}
            selectedEdgeIds={selectedEdgeIds}
            onSelectEdge={onSelectEdge}
            onDeleteEdge={onDeleteEdge}
          />

          {/* Temporary Connection Line when dragging arrow */}
          {connectingSourceId && (() => {
            const src = nodes.find(n => n.id === connectingSourceId);
            if (!src) return null;
            const sx = src.x + src.width;
            const sy = src.y + src.height / 2;
            return (
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-50">
                <line
                  x1={sx}
                  y1={sy}
                  x2={mousePos.x}
                  y2={mousePos.y}
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
              </svg>
            );
          })()}

          {/* Nodes Layer */}
          {nodes.map(node => (
            <NodeRenderer
              key={node.id}
              node={node}
              isSelected={selectedNodeIds.includes(node.id)}
              zoom={viewport.zoom}
              onSelect={(e) => handleNodeClick(e, node.id)}
              onMove={onMoveNode}
              onUpdateNode={onUpdateNode}
              onDeleteNode={onDeleteNode}
              onDuplicateNode={onDuplicateNode}
              onStartConnecting={handleStartConnecting}
              isConnectingSource={connectingSourceId === node.id}
            />
          ))}
        </div>
      </div>

      {/* Minimap overlay */}
      <MiniMap
        nodes={nodes}
        viewport={viewport}
        onNavigate={(x, y) => onViewportChange({ ...viewport, x, y })}
      />

      {/* Connecting banner indicator */}
      {connectingSourceId && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-sky-950/90 border border-sky-500/50 text-sky-200 px-4 py-1.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce z-30">
          <span>Click any target node to establish connection</span>
          <button
            onClick={() => setConnectingSourceId(null)}
            className="text-xs bg-sky-800 hover:bg-sky-700 px-2 py-0.5 rounded text-white"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
