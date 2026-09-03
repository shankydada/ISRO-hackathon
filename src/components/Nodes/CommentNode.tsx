import React from 'react';
import { CanvasNode, AiCommentData } from '../../types';
import { MessageSquareQuote, CheckCircle2, Bot, Sparkles, Check } from 'lucide-react';

interface Props {
  node: CanvasNode;
  onUpdate: (data: Partial<AiCommentData>) => void;
  onResolve?: () => void;
}

export const CommentNode: React.FC<Props> = ({ node, onUpdate, onResolve }) => {
  const data = (node.data || {}) as AiCommentData;
  const isResolved = data.status === 'resolved';

  const severityConfigs = {
    praise: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'PRAISE', icon: Sparkles },
    suggestion: { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'SUGGESTION', icon: Bot },
    critical: { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'CRITICAL', icon: MessageSquareQuote },
    info: { bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20', label: 'INFO', icon: Bot }
  };

  const severity = data.severity || 'suggestion';
  const cfg = severityConfigs[severity];

  const toggleResolved = () => {
    const nextStatus = isResolved ? 'open' : 'resolved';
    onUpdate({ status: nextStatus });
    if (onResolve && nextStatus === 'resolved') {
      onResolve();
    }
  };

  return (
    <div className={`flex flex-col h-full select-text transition-opacity ${isResolved ? 'opacity-60' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
            <Bot className="w-3 h-3 text-indigo-400" />
          </div>
          <div>
            <div className="font-semibold text-slate-200 text-xs">{data.authorName || 'Agent Co-Pilot'}</div>
            <div className="text-[9px] text-slate-400">{data.timestamp || 'Just now'}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${cfg.bg}`}>
            {cfg.label}
          </span>
          <button
            onClick={toggleResolved}
            className={`p-1 rounded text-xs transition-colors ${
              isResolved ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={isResolved ? 'Mark as Open' : 'Mark as Resolved'}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto text-xs text-slate-200 leading-relaxed pr-1 mb-2">
        <p className="italic bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
          "{data.commentText || 'No comment text provided.'}"
        </p>
      </div>

      {/* Suggested Action */}
      {data.suggestedAction && (
        <div className="bg-indigo-950/30 border border-indigo-800/40 p-2 rounded text-[11px] flex items-center justify-between gap-2">
          <div className="text-indigo-200 truncate">
            <span className="font-semibold text-indigo-300">Action: </span>
            {data.suggestedAction}
          </div>
          <button
            onClick={toggleResolved}
            className="shrink-0 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-semibold transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};
