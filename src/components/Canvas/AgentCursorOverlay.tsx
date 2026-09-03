import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface Props {
  isActive: boolean;
  x: number;
  y: number;
  actionText?: string | null;
  agentName?: string;
}

export const AgentCursorOverlay: React.FC<Props> = ({
  isActive,
  x,
  y,
  actionText,
  agentName = 'GPT-5 Omni (WebMCP)'
}) => {
  if (!isActive) return null;

  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 100
      }}
      className="agent-cursor-float"
    >
      {/* SVG Cursor Pointer */}
      <svg width="24" height="24" viewBox="0 0 24 24" className="filter drop-shadow-lg">
        <path
          d="M 2 2 L 8 20 L 12 13 L 20 10 Z"
          fill="#a855f7"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Floating Agent Badge */}
      <div className="absolute left-5 top-3 flex items-center gap-1.5 bg-purple-950/95 border border-purple-400/60 text-purple-100 px-2.5 py-1 rounded-full shadow-2xl text-[10px] font-mono whitespace-nowrap animate-fade-in">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
        <span className="font-bold">{agentName}</span>
        {actionText && (
          <span className="text-purple-300 font-sans border-l border-purple-700 pl-1.5 max-w-[200px] truncate">
            {actionText}
          </span>
        )}
      </div>
    </div>
  );
};
