import React, { useState } from 'react';
import { Viewport } from '../../types';
import { WORKSPACE_TEMPLATES, WorkspaceTemplate } from '../../services/data/templateWorkspaces';
import {
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  RotateCw,
  Terminal,
  Download,
  Presentation,
  BookOpen,
  LayoutGrid,
  ChevronDown,
  Check
} from 'lucide-react';

interface Props {
  viewport: Viewport;
  onViewportChange: (vp: Viewport) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  activeTemplateId: string | null;
  onSelectTemplate: (template: WorkspaceTemplate) => void;
  onOpenInspector: () => void;
  onOpenExport: () => void;
  onOpenSpecModal: () => void;
  onTogglePresentation: () => void;
  onAutoLayout: () => void;
}

export const TopNavigation: React.FC<Props> = ({
  viewport,
  onViewportChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  activeTemplateId,
  onSelectTemplate,
  onOpenInspector,
  onOpenExport,
  onOpenSpecModal,
  onTogglePresentation,
  onAutoLayout
}) => {
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  const handleZoom = (factor: number) => {
    const newZoom = Math.min(Math.max(viewport.zoom * factor, 0.2), 2.5);
    onViewportChange({ ...viewport, zoom: Math.round(newZoom * 100) / 100 });
  };

  const handleResetZoom = () => {
    onViewportChange({ x: 80, y: 50, zoom: 1.0 });
  };

  return (
    <header className="h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between select-none z-30">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                SynapseCanvas
              </h1>
              <span className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                WebMCP Native
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Collaborative Agent-Native Spatial Intelligence & Generative App Studio
            </p>
          </div>
        </div>

        {/* Template Switcher Dropdown */}
        <div className="relative ml-3">
          <button
            onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 transition-colors shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Templates</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isTemplateMenuOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 space-y-1 z-50 animate-fade-in">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                Workspace Templates
              </div>
              {WORKSPACE_TEMPLATES.map(tpl => (
                <div
                  key={tpl.id}
                  onClick={() => {
                    onSelectTemplate(tpl);
                    setIsTemplateMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                    activeTemplateId === tpl.id
                      ? 'bg-indigo-950/80 border border-indigo-500/40 text-slate-100'
                      : 'hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-slate-100">{tpl.name}</span>
                    <span className="text-[9px] font-mono bg-slate-800 text-indigo-300 px-1.5 py-0.2 rounded">
                      {tpl.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{tpl.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Controls (Undo, Redo, Zoom, Auto-Layout) */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner">
        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Zoom */}
        <button
          onClick={() => handleZoom(0.85)}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="px-2 py-1 text-xs font-mono font-bold text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset Zoom"
        >
          {Math.round(viewport.zoom * 100)}%
        </button>
        <button
          onClick={() => handleZoom(1.15)}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Auto Layout */}
        <button
          onClick={onAutoLayout}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Re-arrange Canvas with DAG Layout"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Auto-Layout</span>
        </button>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2">
        {/* Presentation View */}
        <button
          onClick={onTogglePresentation}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors border border-slate-800"
          title="Presentation Mode"
        >
          <Presentation className="w-4 h-4 text-emerald-400" />
        </button>

        {/* WebMCP Inspector */}
        <button
          onClick={onOpenInspector}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-200 transition-all shadow-sm"
          title="Inspect WebMCP Tools"
        >
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span>WebMCP Inspector</span>
          <span className="bg-sky-500/20 text-sky-300 font-mono text-[10px] px-1.5 py-0.2 rounded-full">
            10 Tools
          </span>
        </button>

        {/* Export Modal */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Spec Info Modal */}
        <button
          onClick={onOpenSpecModal}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors border border-slate-800"
          title="WebMCP Architecture & Submission Docs"
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
        </button>
      </div>
    </header>
  );
};
