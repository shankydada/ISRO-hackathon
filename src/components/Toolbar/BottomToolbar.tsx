import React from 'react';
import { NodeType } from '../../types';
import {
  FileText,
  BarChart3,
  Database,
  Cpu,
  Columns3,
  GitFork,
  Globe,
  MessageSquareQuote,
  Trash2,
  Plus
} from 'lucide-react';

interface Props {
  onAddNode: (type: NodeType) => void;
  onClearCanvas: () => void;
}

export const BottomToolbar: React.FC<Props> = ({ onAddNode, onClearCanvas }) => {
  const nodeButtons: Array<{
    type: NodeType;
    label: string;
    icon: React.FC<any>;
    color: string;
  }> = [
    { type: 'markdown_doc', label: 'Doc Note', icon: FileText, color: 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50' },
    { type: 'analytics_chart', label: 'Analytics Chart', icon: BarChart3, color: 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50' },
    { type: 'sql_query_engine', label: 'SQL Engine', icon: Database, color: 'text-sky-400 hover:text-sky-300 hover:bg-sky-950/50' },
    { type: 'live_micro_app', label: 'Micro-App', icon: Cpu, color: 'text-violet-400 hover:text-violet-300 hover:bg-violet-950/50' },
    { type: 'task_kanban', label: 'Kanban Board', icon: Columns3, color: 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/50' },
    { type: 'mindmap_node', label: 'Mindmap', icon: GitFork, color: 'text-pink-400 hover:text-pink-300 hover:bg-pink-950/50' },
    { type: 'api_connector', label: 'API Gateway', icon: Globe, color: 'text-teal-400 hover:text-teal-300 hover:bg-teal-950/50' },
    { type: 'ai_comment', label: 'AI Review Note', icon: MessageSquareQuote, color: 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/50' }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 p-2 rounded-2xl shadow-2xl">
      <div className="flex items-center gap-1">
        {nodeButtons.map(btn => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.type}
              onClick={() => onAddNode(btn.type)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 transition-all border border-transparent hover:border-slate-700/80 ${btn.color}`}
              title={`Add ${btn.label}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">{btn.label}</span>
            </button>
          );
        })}
      </div>

      <div className="h-6 w-px bg-slate-800 mx-1" />

      {/* Clear Canvas */}
      <button
        onClick={onClearCanvas}
        className="p-2 hover:bg-rose-950/50 rounded-xl text-slate-400 hover:text-rose-400 transition-colors"
        title="Clear Workspace"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
