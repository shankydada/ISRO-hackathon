import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CanvasNode, CanvasEdge, Viewport, NodeType, ToolInvocationLog, AgentActivityStep } from './types';
import { WORKSPACE_TEMPLATES, WorkspaceTemplate } from './services/data/templateWorkspaces';
import { webMCPRegistry } from './services/webmcp/webmcpRegistry';
import { declarativeWebMCP } from './services/webmcp/declarativeWebMCP';
import { soundService } from './services/sound/soundService';
import { InfiniteCanvas } from './components/Canvas/InfiniteCanvas';
import { AgentCursorOverlay } from './components/Canvas/AgentCursorOverlay';
import { TopNavigation } from './components/Toolbar/TopNavigation';
import { BottomToolbar } from './components/Toolbar/BottomToolbar';
import { WebMCPInspectorModal } from './components/WebMCPInspector/WebMCPInspectorModal';
import { AgentCopilotSidebar } from './components/AgentCopilot/AgentCopilotSidebar';
import { ExportModal } from './components/Modals/ExportModal';
import { PresentationMode } from './components/Modals/PresentationMode';
import { WebMCPSpecModal } from './components/Modals/WebMCPSpecModal';
import { GuidedDemoTour } from './components/Modals/GuidedDemoTour';

export const App: React.FC = () => {
  // Initialize with the FinTech & SaaS Intelligence Center template
  const defaultTemplate = WORKSPACE_TEMPLATES[0];

  const [nodes, setNodes] = useState<CanvasNode[]>(defaultTemplate.nodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(defaultTemplate.edges);
  const [viewport, setViewport] = useState<Viewport>(defaultTemplate.initialViewport);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(defaultTemplate.id);

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);

  // History for Undo / Redo
  const [history, setHistory] = useState<Array<{ nodes: CanvasNode[]; edges: CanvasEdge[] }>>([
    { nodes: defaultTemplate.nodes, edges: defaultTemplate.edges }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Modals & Sidebars
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isGuidedTourOpen, setIsGuidedTourOpen] = useState(false);

  // Agent State & Cursor Position
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [currentAgentAction, setCurrentAgentAction] = useState<string | null>(null);
  const [agentCursorPos, setAgentCursorPos] = useState<{ x: number; y: number }>({ x: 500, y: 300 });
  const [activeSteps, setActiveSteps] = useState<AgentActivityStep[]>([]);
  const [toolLogs, setToolLogs] = useState<ToolInvocationLog[]>([]);

  // Refs for current state inside WebMCP callbacks
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  // Push state to Undo History
  const pushHistory = useCallback((newNodes: CanvasNode[], newEdges: CanvasEdge[]) => {
    setHistory(prev => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, { nodes: newNodes, edges: newEdges }].slice(-30);
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Bind WebMCP Registry & Declarative Engine to Canvas State Accessor
  useEffect(() => {
    webMCPRegistry.bindCanvas({
      getNodes: () => nodesRef.current,
      getEdges: () => edgesRef.current,
      setNodes: (updater) => {
        setNodes(prev => {
          const next = updater(prev);
          pushHistory(next, edgesRef.current);
          return next;
        });
      },
      setEdges: (updater) => {
        setEdges(prev => {
          const next = updater(prev);
          pushHistory(nodesRef.current, next);
          return next;
        });
      },
      addToolLog: (log) => {
        setToolLogs(prev => [log, ...prev].slice(0, 100));
        soundService.playToolSuccess();
      },
      setAgentActiveNode: (nodeId) => {
        setNodes(prev => {
          const found = prev.find(n => n.id === nodeId);
          if (found) {
            setAgentCursorPos({ x: found.x + found.width / 2, y: found.y - 40 });
          }
          return prev.map(n => ({
            ...n,
            isAgentActive: n.id === nodeId
          }));
        });
      }
    });

    declarativeWebMCP.scanAndRegisterForms();
  }, [pushHistory]);

  // Undo / Redo Handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const snapshot = history[targetIndex];
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      setHistoryIndex(targetIndex);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const snapshot = history[targetIndex];
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      setHistoryIndex(targetIndex);
    }
  }, [history, historyIndex]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing if user is inside an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeIds.length > 0) {
          e.preventDefault();
          selectedNodeIds.forEach(id => handleDeleteNode(id));
        }
        if (selectedEdgeIds.length > 0) {
          e.preventDefault();
          selectedEdgeIds.forEach(id => handleDeleteEdge(id));
        }
      } else if (e.key === 'Escape') {
        setSelectedNodeIds([]);
        setSelectedEdgeIds([]);
        setIsInspectorOpen(false);
        setIsExportOpen(false);
        setIsSpecModalOpen(false);
        setIsPresentationOpen(false);
        setIsGuidedTourOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedNodeIds, selectedEdgeIds]);

  // Node & Edge Actions
  const handleSelectNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (e.shiftKey) {
      setSelectedNodeIds(prev =>
        prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
      );
    } else {
      setSelectedNodeIds([nodeId]);
      setSelectedEdgeIds([]);
    }
  };

  const handleSelectEdge = (e: React.MouseEvent, edgeId: string) => {
    e.stopPropagation();
    setSelectedEdgeIds([edgeId]);
    setSelectedNodeIds([]);
  };

  const handleClearSelection = () => {
    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
  };

  const handleMoveNode = (nodeId: string, dx: number, dy: number) => {
    setNodes(prev =>
      prev.map(n => {
        if (n.id === nodeId || (selectedNodeIds.includes(nodeId) && selectedNodeIds.includes(n.id))) {
          return { ...n, x: Math.round(n.x + dx), y: Math.round(n.y + dy) };
        }
        return n;
      })
    );
  };

  const handleUpdateNode = (nodeId: string, partial: Partial<CanvasNode>) => {
    setNodes(prev => {
      const next = prev.map(n => (n.id === nodeId ? { ...n, ...partial } : n));
      pushHistory(next, edgesRef.current);
      return next;
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(prev => {
      const nextNodes = prev.filter(n => n.id !== nodeId);
      setEdges(ePrev => {
        const nextEdges = ePrev.filter(e => e.fromNodeId !== nodeId && e.toNodeId !== nodeId);
        pushHistory(nextNodes, nextEdges);
        return nextEdges;
      });
      return nextNodes;
    });
    setSelectedNodeIds(prev => prev.filter(id => id !== nodeId));
  };

  const handleDuplicateNode = (node: CanvasNode) => {
    const dupNode: CanvasNode = {
      ...node,
      id: 'node-' + Math.random().toString(36).substring(2, 8),
      title: `${node.title} (Copy)`,
      x: node.x + 40,
      y: node.y + 40,
      lastModifiedBy: { name: 'User', type: 'human', timestamp: Date.now() }
    };
    setNodes(prev => {
      const next = [...prev, dupNode];
      pushHistory(next, edgesRef.current);
      return next;
    });
    soundService.playNodeCreated();
    setSelectedNodeIds([dupNode.id]);
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges(prev => {
      const next = prev.filter(e => e.id !== edgeId);
      pushHistory(nodesRef.current, next);
      return next;
    });
    setSelectedEdgeIds(prev => prev.filter(id => id !== edgeId));
  };

  const handleConnectNodes = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const exists = edges.some(e => e.fromNodeId === fromId && e.toNodeId === toId);
    if (exists) return;

    const newEdge: CanvasEdge = {
      id: 'edge-' + Math.random().toString(36).substring(2, 8),
      fromNodeId: fromId,
      toNodeId: toId,
      label: 'relates to',
      type: 'bezier',
      animated: true,
      color: '#38bdf8',
      style: 'solid'
    };

    setEdges(prev => {
      const next = [...prev, newEdge];
      pushHistory(nodesRef.current, next);
      return next;
    });
    soundService.playConnectSound();
  };

  const handleAddNode = (type: NodeType) => {
    const centerX = (-viewport.x + window.innerWidth / 2) / viewport.zoom - 200;
    const centerY = (-viewport.y + window.innerHeight / 2) / viewport.zoom - 150;

    const titleMap: Record<NodeType, string> = {
      markdown_doc: 'Executive Strategy Note',
      analytics_chart: 'Performance KPI Metric',
      sql_query_engine: 'DuckDB SQL Analysis',
      live_micro_app: 'Interactive ROI Estimator',
      task_kanban: 'Roadmap Sprints',
      mindmap_node: 'System Concept Map',
      api_connector: 'WebMCP Gateway API',
      ai_comment: 'AI Agent Peer Note'
    };

    webMCPRegistry.executeTool('create_canvas_node', {
      type,
      title: titleMap[type] || 'New Node',
      x: Math.round(centerX),
      y: Math.round(centerY)
    }, 'manual_test');
    soundService.playNodeCreated();
  };

  const handleSelectTemplate = (tpl: WorkspaceTemplate) => {
    setNodes(tpl.nodes);
    setEdges(tpl.edges);
    setViewport(tpl.initialViewport);
    setActiveTemplateId(tpl.id);
    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
    pushHistory(tpl.nodes, tpl.edges);
    soundService.playNodeCreated();
  };

  const handleAutoLayout = () => {
    webMCPRegistry.executeTool('auto_layout_canvas', { layoutAlgorithm: 'hierarchical_dag' }, 'manual_test');
    soundService.playToolSuccess();
  };

  const handleClearCanvas = () => {
    if (confirm('Are you sure you want to clear the entire workspace?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNodeIds([]);
      setSelectedEdgeIds([]);
      pushHistory([], []);
    }
  };

  const handleFocusNode = (node: CanvasNode) => {
    const targetX = -node.x * viewport.zoom + window.innerWidth / 2 - (node.width * viewport.zoom) / 2;
    const targetY = -node.y * viewport.zoom + window.innerHeight / 2 - (node.height * viewport.zoom) / 2;
    setViewport({ ...viewport, x: targetX, y: targetY });
    setSelectedNodeIds([node.id]);
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none text-slate-100">
      {/* Top Navigation Bar */}
      <TopNavigation
        viewport={viewport}
        onViewportChange={setViewport}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        activeTemplateId={activeTemplateId}
        onSelectTemplate={handleSelectTemplate}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSpecModal={() => setIsSpecModalOpen(true)}
        onTogglePresentation={() => setIsPresentationOpen(!isPresentationOpen)}
        onOpenGuidedTour={() => setIsGuidedTourOpen(true)}
        onAutoLayout={handleAutoLayout}
      />

      {/* Main Canvas Area */}
      <main className="flex-1 relative overflow-hidden">
        <InfiniteCanvas
          nodes={nodes}
          edges={edges}
          viewport={viewport}
          selectedNodeIds={selectedNodeIds}
          selectedEdgeIds={selectedEdgeIds}
          onViewportChange={setViewport}
          onSelectNode={handleSelectNode}
          onSelectEdge={handleSelectEdge}
          onClearSelection={handleClearSelection}
          onMoveNode={handleMoveNode}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onDeleteEdge={handleDeleteEdge}
          onConnectNodes={handleConnectNodes}
        />

        {/* Floating Animated Agent Cursor Overlay */}
        <AgentCursorOverlay
          isActive={isAgentRunning}
          x={agentCursorPos.x * viewport.zoom + viewport.x}
          y={agentCursorPos.y * viewport.zoom + viewport.y}
          actionText={currentAgentAction}
          agentName="GPT-5 Omni (WebMCP)"
        />

        {/* Bottom Tool Palette */}
        <BottomToolbar
          onAddNode={handleAddNode}
          onClearCanvas={handleClearCanvas}
        />

        {/* Autonomous Agent Co-Pilot Sidebar */}
        <AgentCopilotSidebar
          isOpen={isCopilotOpen}
          onToggle={() => setIsCopilotOpen(!isCopilotOpen)}
          isAgentRunning={isAgentRunning}
          currentAgentAction={currentAgentAction}
          activeSteps={activeSteps}
          onStepUpdate={(step) => {
            setActiveSteps(prev => {
              const existingIdx = prev.findIndex(s => s.id === step.id);
              if (existingIdx >= 0) {
                const next = [...prev];
                next[existingIdx] = step;
                return next;
              }
              return [step, ...prev];
            });
          }}
          onStatusMessage={setCurrentAgentAction}
          onSetAgentRunning={setIsAgentRunning}
        />

        {/* Presentation Overlay */}
        <PresentationMode
          isOpen={isPresentationOpen}
          onClose={() => setIsPresentationOpen(false)}
          nodes={nodes}
          onFocusNode={handleFocusNode}
        />

        {/* Guided 3-Minute Video Demo Tour */}
        <GuidedDemoTour
          isOpen={isGuidedTourOpen}
          onClose={() => setIsGuidedTourOpen(false)}
          nodes={nodes}
          onViewportChange={setViewport}
          onOpenInspector={() => setIsInspectorOpen(true)}
          onCloseInspector={() => setIsInspectorOpen(false)}
        />
      </main>

      {/* Modals */}
      <WebMCPInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        initialLogs={toolLogs}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        nodes={nodes}
        edges={edges}
      />

      <WebMCPSpecModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />
    </div>
  );
};
