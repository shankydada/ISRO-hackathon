import React from 'react';
import { CanvasEdge, CanvasNode } from '../../types';

interface Props {
  edges: CanvasEdge[];
  nodes: CanvasNode[];
  selectedEdgeIds: string[];
  onSelectEdge: (e: React.MouseEvent, edgeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
}

export const EdgeRenderer: React.FC<Props> = ({
  edges,
  nodes,
  selectedEdgeIds,
  onSelectEdge,
  onDeleteEdge
}) => {
  const nodeMap = new Map<string, CanvasNode>(nodes.map(n => [n.id, n]));

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
      <defs>
        {/* Directional Arrowheads */}
        <marker
          id="arrow-default"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
        </marker>
        <marker
          id="arrow-selected"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
        </marker>
        <marker
          id="arrow-emerald"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
        </marker>
        <marker
          id="arrow-violet"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7" />
        </marker>
      </defs>

      {edges.map(edge => {
        const source = nodeMap.get(edge.fromNodeId);
        const target = nodeMap.get(edge.toNodeId);
        if (!source || !target) return null;

        // Calculate anchors
        // Source right center
        const sx = source.x + source.width;
        const sy = source.y + source.height / 2;

        // Target left center
        const tx = target.x;
        const ty = target.y + target.height / 2;

        // Bezier control points
        const dx = Math.max(Math.abs(tx - sx) * 0.5, 40);
        const pathData = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;

        const midX = (sx + tx) / 2;
        const midY = (sy + ty) / 2;

        const isSelected = selectedEdgeIds.includes(edge.id);
        const strokeColor = isSelected ? '#818cf8' : edge.color || '#38bdf8';

        return (
          <g key={edge.id} className="pointer-events-auto group">
            {/* Wider clickable hit-box */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="24"
              className="cursor-pointer"
              onClick={(e) => onSelectEdge(e, edge.id)}
            />

            {/* Rendered Stroke */}
            <path
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isSelected ? 3 : 2}
              strokeOpacity={isSelected ? 1 : 0.8}
              markerEnd={isSelected ? 'url(#arrow-selected)' : 'url(#arrow-default)'}
              className={`${edge.animated ? 'edge-flow-animated' : ''} transition-all`}
            />

            {/* Semantic Label Badge */}
            {edge.label && (
              <g transform={`translate(${midX}, ${midY})`} className="cursor-pointer" onClick={(e) => onSelectEdge(e, edge.id)}>
                <rect
                  x="-45"
                  y="-12"
                  width="90"
                  height="22"
                  rx="11"
                  fill="#0f172a"
                  stroke={strokeColor}
                  strokeWidth="1"
                  className="group-hover:stroke-indigo-400"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  className="text-[10px] font-semibold fill-slate-300 pointer-events-none uppercase tracking-wider"
                >
                  {edge.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
