import React, { useState, useRef, useEffect } from 'react';
import { CanvasNode, NodeType } from '../../types';
import { MarkdownNode } from '../Nodes/MarkdownNode';
import { ChartNode } from '../Nodes/ChartNode';
import { SqlNode } from '../Nodes/SqlNode';
import { MicroAppNode } from '../Nodes/MicroAppNode';
import { KanbanNode } from '../Nodes/KanbanNode';
import { ApiConnectorNode } from '../Nodes/ApiConnectorNode';
import { CommentNode } from '../Nodes/CommentNode';
import { MindmapNode } from '../Nodes/MindmapNode';
import {
  GripHorizontal,
  Trash2,
  Copy,
  Sparkles,
  Pin,
  Bot,
  User,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';

interface Props {
  node: CanvasNode;
  isSelected: boolean;
  zoom: number;
  onSelect: (e: React.MouseEvent, nodeId: string) => void;
  onMove: (nodeId: string, deltaX: number, deltaY: number) => void;
  onUpdateNode: (nodeId: string, partial: Partial<CanvasNode>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (node: CanvasNode) => void;
  onStartConnecting: (fromNodeId: string) => void;
  isConnectingSource?: boolean;
}

const themeStyles: Record<string, { border: string; header: string; accent: string; glow: string }> = {
  indigo: {
    border: 'border-indigo-500/40 hover:border-indigo-500/80',
    header: 'bg-indigo-950/50 border-b border-indigo-900/50 text-indigo-200',
    accent: 'bg-indigo-500',
    glow: 'rgba(99, 102, 241, 0.4)'
  },
  emerald: {
    border: 'border-emerald-500/40 hover:border-emerald-500/80',
    header: 'bg-emerald-950/50 border-b border-emerald-900/50 text-emerald-200',
    accent: 'bg-emerald-500',
    glow: 'rgba(16, 185, 129, 0.4)'
  },
  sky: {
    border: 'border-sky-500/40 hover:border-sky-500/80',
    header: 'bg-sky-950/50 border-b border-sky-900/50 text-sky-200',
    accent: 'bg-sky-500',
    glow: 'rgba(56, 189, 248, 0.4)'
  },
  amber: {
    border: 'border-amber-500/40 hover:border-amber-500/80',
    header: 'bg-amber-950/50 border-b border-amber-900/50 text-amber-200',
    accent: 'bg-amber-500',
    glow: 'rgba(245, 158, 11, 0.4)'
  },
  rose: {
    border: 'border-rose-500/40 hover:border-rose-500/80',
    header: 'bg-rose-950/50 border-b border-rose-900/50 text-rose-200',
    accent: 'bg-rose-500',
    glow: 'rgba(244, 63, 94, 0.4)'
  },
  violet: {
    border: 'border-violet-500/40 hover:border-violet-500/80',
    header: 'bg-violet-950/50 border-b border-violet-900/50 text-violet-200',
    accent: 'bg-violet-500',
    glow: 'rgba(139, 92, 246, 0.4)'
  },
  slate: {
    border: 'border-slate-700/60 hover:border-slate-600',
    header: 'bg-slate-900/80 border-b border-slate-800 text-slate-300',
    accent: 'bg-slate-500',
    glow: 'rgba(148, 163, 184, 0.3)'
  }
};

export const NodeRenderer: React.FC<Props> = ({
  node,
  isSelected,
  zoom,
  onSelect,
  onMove,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onStartConnecting,
  isConnectingSource
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const theme = themeStyles[node.colorTheme || 'indigo'] || themeStyles.indigo;

  // Handle Dragging
  const handleMouseDownHeader = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    e.stopPropagation();
    onSelect(e, node.id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!isDragging || !dragStart) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      if (dx !== 0 || dy !== 0) {
        onMove(node.id, dx, dy);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, zoom, node.id, onMove]);

  // Handle Resizing
  const handleMouseDownResize = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY, w: node.width, h: node.height });
  };

  useEffect(() => {
    if (!isResizing || !resizeStart) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dw = (e.clientX - resizeStart.x) / zoom;
      const dh = (e.clientY - resizeStart.y) / zoom;
      const newW = Math.max(320, Math.min(1000, resizeStart.w + dw));
      const newH = Math.max(220, Math.min(900, resizeStart.h + dh));
      onUpdateNode(node.id, { width: Math.round(newW), height: Math.round(newH) });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeStart(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart, zoom, node.id, onUpdateNode]);

  const handleDataUpdate = (partialData: any, newTitle?: string) => {
    onUpdateNode(node.id, {
      data: { ...node.data, ...partialData },
      title: newTitle !== undefined ? newTitle : node.title
    });
  };

  return (
    <div
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        width: `${node.width}px`,
        height: `${node.height}px`,
        position: 'absolute',
        top: 0,
        left: 0
      }}
      onClick={(e) => onSelect(e, node.id)}
      className={`rounded-xl backdrop-blur-md bg-slate-900/90 border transition-shadow duration-200 flex flex-col shadow-2xl ${
        theme.border
      } ${
        isSelected
          ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 shadow-indigo-500/20'
          : ''
      } ${
        node.isAgentActive ? 'agent-active-glow ring-2 ring-purple-400 ring-offset-1' : ''
      } ${isConnectingSource ? 'ring-2 ring-sky-400 animate-pulse' : ''}`}
    >
      {/* Node Header */}
      <div
        onMouseDown={handleMouseDownHeader}
        className={`px-3 py-2 rounded-t-xl flex items-center justify-between cursor-grab active:cursor-grabbing select-none ${theme.header}`}
      >
        <div className="flex items-center gap-2 flex-1 mr-2 min-w-0">
          <GripHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: theme.accent }} />
          <span className="font-semibold text-xs tracking-tight truncate text-slate-100">
            {node.title}
          </span>
          {node.isAgentActive && (
            <span className="flex items-center gap-1 text-[9px] bg-purple-500/20 border border-purple-400/30 text-purple-300 px-1.5 py-0.2 rounded-full animate-pulse">
              <Bot className="w-2.5 h-2.5" />
              <span>Agent Live</span>
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Connector handle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id);
            }}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-sky-300 transition-colors"
            title="Connect Arrow to Node"
          >
            <ExternalLink className="w-3 h-3" />
          </button>

          {/* Duplicate button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateNode(node);
            }}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Duplicate Node"
          >
            <Copy className="w-3 h-3" />
          </button>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteNode(node.id);
            }}
            className="p-1 hover:bg-rose-950/60 rounded text-slate-400 hover:text-rose-400 transition-colors"
            title="Delete Node"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Node Content Body */}
      <div className="flex-1 p-3 overflow-hidden flex flex-col">
        {node.type === 'markdown_doc' && (
          <MarkdownNode node={node} onUpdate={handleDataUpdate} />
        )}
        {node.type === 'analytics_chart' && (
          <ChartNode node={node} onUpdate={handleDataUpdate} />
        )}
        {node.type === 'sql_query_engine' && (
          <SqlNode node={node} onUpdate={handleDataUpdate} />
        )}
        {node.type === 'live_micro_app' && (
          <MicroAppNode node={node} onUpdate={handleDataUpdate} />
        )}
        {node.type === 'task_kanban' && (
          <KanbanNode node={node} onUpdate={handleDataUpdate} />
        )}
        {node.type === 'api_connector' && (
          <ApiConnectorNode node={node} onUpdate={handleDataUpdate} />
        )}
        {node.type === 'ai_comment' && (
          <CommentNode node={node} onUpdate={handleDataUpdate} onResolve={() => onDeleteNode(node.id)} />
        )}
        {node.type === 'mindmap_node' && (
          <MindmapNode node={node} onUpdate={handleDataUpdate} />
        )}
      </div>

      {/* Connector Ports (Top, Right, Bottom, Left) */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onStartConnecting(node.id);
        }}
        className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-sky-500 hover:bg-sky-400 border-2 border-slate-900 rounded-full cursor-crosshair shadow-md hover:scale-125 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
        title="Connect to another node"
      />

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDownResize}
        className="absolute right-1 bottom-1 w-3.5 h-3.5 cursor-nwse-resize opacity-40 hover:opacity-100 flex items-center justify-center text-slate-400"
      >
        <svg viewBox="0 0 6 6" className="w-2.5 h-2.5 fill-current">
          <circle cx="5" cy="5" r="0.8" />
          <circle cx="5" cy="2.5" r="0.8" />
          <circle cx="2.5" cy="5" r="0.8" />
        </svg>
      </div>
    </div>
  );
};
