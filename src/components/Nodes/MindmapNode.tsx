import React, { useState } from 'react';
import { CanvasNode, MindmapData, MindmapBranch } from '../../types';
import { GitFork, Plus, Trash2 } from 'lucide-react';

interface Props {
  node: CanvasNode;
  onUpdate: (data: Partial<MindmapData>) => void;
}

export const MindmapNode: React.FC<Props> = ({ node, onUpdate }) => {
  const data = (node.data || {}) as MindmapData;
  const [rootTopic, setRootTopic] = useState(data.rootTopic || node.title || 'Central Idea');
  const branches = data.branches || [
    { id: 'b1', label: 'Feature Requirements', color: '#6366f1' },
    { id: 'b2', label: 'Technical Dependencies', color: '#38bdf8' },
    { id: 'b3', label: 'Deployment Strategy', color: '#10b981' }
  ];
  const [newBranchText, setNewBranchText] = useState('');

  const handleAddBranch = () => {
    if (!newBranchText.trim()) return;
    const colors = ['#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#ec4899'];
    const newBranch: MindmapBranch = {
      id: 'b-' + Math.random().toString(36).substring(2, 7),
      label: newBranchText.trim(),
      color: colors[branches.length % colors.length]
    };
    const updated = [...branches, newBranch];
    onUpdate({ rootTopic, branches: updated });
    setNewBranchText('');
  };

  const handleDeleteBranch = (id: string) => {
    const updated = branches.filter(b => b.id !== id);
    onUpdate({ rootTopic, branches: updated });
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Root Node Header */}
      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800 text-xs">
        <GitFork className="w-4 h-4 text-violet-400" />
        <input
          type="text"
          value={rootTopic}
          onChange={(e) => {
            setRootTopic(e.target.value);
            onUpdate({ rootTopic: e.target.value, branches });
          }}
          className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-violet-500"
          placeholder="Central Mindmap Topic..."
        />
      </div>

      {/* Branches List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {branches.map(branch => (
          <div
            key={branch.id}
            className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-200 transition-colors group"
          >
            <div className="flex items-center gap-2 flex-1 mr-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: branch.color || '#6366f1' }} />
              <span className="font-medium">{branch.label}</span>
            </div>
            <button
              onClick={() => handleDeleteBranch(branch.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Add Branch input */}
        <div className="flex gap-1.5 pt-1">
          <input
            type="text"
            value={newBranchText}
            onChange={(e) => setNewBranchText(e.target.value)}
            placeholder="Add concept branch..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddBranch()}
            className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={handleAddBranch}
            className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
