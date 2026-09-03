import React, { useState } from 'react';
import { CanvasNode, MarkdownDocData } from '../../types';
import { FileText, Edit3, CheckCircle2, Tag, User } from 'lucide-react';

interface Props {
  node: CanvasNode;
  onUpdate: (data: Partial<MarkdownDocData>, title?: string) => void;
}

export const MarkdownNode: React.FC<Props> = ({ node, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const data = (node.data || {}) as MarkdownDocData;
  const [content, setContent] = useState(data.content || '');
  const [title, setTitle] = useState(node.title || '');

  const handleSave = () => {
    onUpdate({ content }, title);
    setIsEditing(false);
  };

  const statusColors = {
    draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    in_review: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  const status = data.status || 'draft';

  // Simple markdown renderer for headers, bold, bullet points, blockquotes, checkboxes
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-bold text-slate-100 mt-2 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-sm font-semibold text-slate-200 mt-2 mb-1">{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-2 border-indigo-400 pl-3 my-2 text-xs italic text-indigo-200/90 bg-indigo-950/20 py-1 rounded-r">
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
        return (
          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 my-1">
            <input type="checkbox" checked readOnly className="rounded text-indigo-500 bg-slate-800 border-slate-700" />
            <span className="line-through text-slate-400">{line.replace(/- \[[xX]\] /, '')}</span>
          </div>
        );
      }
      if (line.startsWith('- [ ] ')) {
        return (
          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 my-1">
            <input type="checkbox" checked={false} readOnly className="rounded text-indigo-500 bg-slate-800 border-slate-700" />
            <span>{line.replace('- [ ] ', '')}</span>
          </div>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="text-xs text-slate-300 ml-4 list-disc my-0.5">
            {line.replace('- ', '')}
          </li>
        );
      }
      if (line.startsWith('```')) {
        return null;
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      // Format bold text
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed my-0.5">
          {parts.map((p, i) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={i} className="text-slate-100 font-semibold">{p.slice(2, -2)}</strong>;
            }
            return p;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full select-text">
      {/* Node Subheader */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium text-slate-300">{data.category || 'Documentation'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${statusColors[status]}`}>
            {status.replace('_', ' ').toUpperCase()}
          </span>
          <button
            onClick={() => {
              if (isEditing) handleSave();
              else setIsEditing(true);
            }}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title={isEditing ? 'Save Changes' : 'Edit Document'}
          >
            {isEditing ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Edit3 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isEditing ? (
          <div className="flex flex-col gap-2 h-full">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document Title"
              className="bg-slate-900/80 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type markdown content..."
              className="flex-1 w-full bg-slate-900/80 border border-slate-700 rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-none min-h-[160px]"
            />
            <button
              onClick={handleSave}
              className="self-end px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium"
            >
              Save Document
            </button>
          </div>
        ) : (
          <div className="prose prose-invert prose-xs max-w-none">
            {renderMarkdown(data.content || '')}
          </div>
        )}
      </div>

      {/* Node Footer */}
      {data.author && (
        <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            <span>{data.author}</span>
          </div>
          {node.tags && node.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="w-2.5 h-2.5 text-slate-400" />
              <span>{node.tags[0]}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
