import React, { useState } from 'react';
import { CanvasNode, TaskKanbanData, KanbanCard } from '../../types';
import { Columns3, Plus, MoreVertical, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Props {
  node: CanvasNode;
  onUpdate: (data: Partial<TaskKanbanData>) => void;
}

export const KanbanNode: React.FC<Props> = ({ node, onUpdate }) => {
  const data = (node.data || {}) as TaskKanbanData;
  const columns = data.columns || [
    { id: 'todo', title: 'To Do', color: 'border-slate-500', cards: [] },
    { id: 'in_progress', title: 'In Progress', color: 'border-amber-500', cards: [] },
    { id: 'done', title: 'Completed', color: 'border-emerald-500', cards: [] }
  ];

  const [newCardText, setNewCardText] = useState('');
  const [activeColId, setActiveColId] = useState<string | null>(null);

  const priorityBadges = {
    urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    medium: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  const handleAddCard = (colId: string) => {
    if (!newCardText.trim()) return;
    const updatedCols = columns.map(col => {
      if (col.id === colId) {
        const newCard: KanbanCard = {
          id: 'card-' + Math.random().toString(36).substring(2, 7),
          title: newCardText.trim(),
          priority: 'medium',
          assignee: 'Human/Agent'
        };
        return { ...col, cards: [...col.cards, newCard] };
      }
      return col;
    });
    onUpdate({ columns: updatedCols });
    setNewCardText('');
    setActiveColId(null);
  };

  const moveCard = (cardId: string, fromColId: string, toColId: string) => {
    let movedCard: KanbanCard | undefined;
    const updatedCols = columns.map(col => {
      if (col.id === fromColId) {
        movedCard = col.cards.find(c => c.id === cardId);
        return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
      }
      return col;
    }).map(col => {
      if (col.id === toColId && movedCard) {
        return { ...col, cards: [...col.cards, movedCard] };
      }
      return col;
    });
    onUpdate({ columns: updatedCols });
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <Columns3 className="w-3.5 h-3.5 text-violet-400" />
          <span>{node.title || 'Task Kanban'}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {columns.reduce((sum, col) => sum + col.cards.length, 0)} Total Tasks
        </span>
      </div>

      {/* Columns Grid */}
      <div className="flex-1 grid grid-cols-3 gap-2 overflow-x-auto min-h-0">
        {columns.map(col => (
          <div key={col.id} className="bg-slate-950/70 border border-slate-800 rounded-lg p-2 flex flex-col min-w-[150px]">
            {/* Column Header */}
            <div className={`flex items-center justify-between pb-1.5 mb-1.5 border-b ${col.color || 'border-slate-700'} text-[11px] font-semibold text-slate-300`}>
              <span>{col.title}</span>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.2 rounded-full">
                {col.cards.length}
              </span>
            </div>

            {/* Card List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
              {col.cards.map(card => (
                <div
                  key={card.id}
                  className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 p-2 rounded text-xs shadow-sm transition-all group"
                >
                  <div className="text-slate-200 font-medium mb-1 line-clamp-2">{card.title}</div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`px-1.5 py-0.2 rounded border uppercase text-[9px] font-semibold ${priorityBadges[card.priority || 'medium']}`}>
                      {card.priority}
                    </span>
                    {card.assignee && (
                      <span className="text-slate-400">{card.assignee}</span>
                    )}
                  </div>
                  {/* Quick move buttons */}
                  <div className="hidden group-hover:flex items-center justify-end gap-1 mt-1.5 pt-1 border-t border-slate-800 text-[9px] text-slate-400">
                    {columns.filter(c => c.id !== col.id).map(targetCol => (
                      <button
                        key={targetCol.id}
                        onClick={() => moveCard(card.id, col.id, targetCol.id)}
                        className="hover:text-indigo-400 px-1 py-0.5 bg-slate-800 rounded"
                      >
                        → {targetCol.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {activeColId === col.id ? (
                <div className="p-1.5 bg-slate-900 rounded border border-slate-700">
                  <input
                    type="text"
                    value={newCardText}
                    onChange={(e) => setNewCardText(e.target.value)}
                    placeholder="Task summary..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:border-violet-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCard(col.id);
                      if (e.key === 'Escape') setActiveColId(null);
                    }}
                  />
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setActiveColId(null)}
                      className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAddCard(col.id)}
                      className="px-2 py-0.5 text-[10px] bg-violet-600 hover:bg-violet-500 text-white rounded font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveColId(col.id);
                    setNewCardText('');
                  }}
                  className="w-full py-1 border border-dashed border-slate-800 hover:border-slate-600 text-slate-400 hover:text-slate-200 rounded text-[11px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Task</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
