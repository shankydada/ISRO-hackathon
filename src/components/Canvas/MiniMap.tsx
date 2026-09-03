import React from 'react';
import { CanvasNode, Viewport } from '../../types';

interface Props {
  nodes: CanvasNode[];
  viewport: Viewport;
  onNavigate: (x: number, y: number) => void;
}

export const MiniMap: React.FC<Props> = ({ nodes, viewport, onNavigate }) => {
  const mapW = 180;
  const mapH = 120;

  // Find canvas bounding box
  const minX = Math.min(0, ...nodes.map(n => n.x)) - 200;
  const minY = Math.min(0, ...nodes.map(n => n.y)) - 200;
  const maxX = Math.max(2000, ...nodes.map(n => n.x + n.width)) + 200;
  const maxY = Math.max(1400, ...nodes.map(n => n.y + n.height)) + 200;

  const totalW = maxX - minX;
  const totalH = maxY - minY;

  const scale = Math.min(mapW / totalW, mapH / totalH);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const canvasTargetX = minX + clickX / scale;
    const canvasTargetY = minY + clickY / scale;

    onNavigate(-canvasTargetX * viewport.zoom + window.innerWidth / 2, -canvasTargetY * viewport.zoom + window.innerHeight / 2);
  };

  return (
    <div
      onClick={handleClick}
      className="absolute bottom-6 right-6 w-[180px] h-[120px] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden shadow-2xl cursor-pointer select-none group z-20"
      title="Click to pan viewport"
    >
      <div className="relative w-full h-full bg-slate-950/80">
        {/* Nodes representations */}
        {nodes.map(n => {
          const nx = (n.x - minX) * scale;
          const ny = (n.y - minY) * scale;
          const nw = n.width * scale;
          const nh = n.height * scale;

          return (
            <div
              key={n.id}
              style={{
                left: `${nx}px`,
                top: `${ny}px`,
                width: `${Math.max(4, nw)}px`,
                height: `${Math.max(3, nh)}px`
              }}
              className="absolute bg-indigo-500/60 border border-indigo-400/80 rounded-sm"
            />
          );
        })}

        {/* Viewport Box */}
        {(() => {
          const vx = (-viewport.x / viewport.zoom - minX) * scale;
          const vy = (-viewport.y / viewport.zoom - minY) * scale;
          const vw = (window.innerWidth / viewport.zoom) * scale;
          const vh = (window.innerHeight / viewport.zoom) * scale;

          return (
            <div
              style={{
                left: `${vx}px`,
                top: `${vy}px`,
                width: `${Math.max(10, vw)}px`,
                height: `${Math.max(8, vh)}px`
              }}
              className="absolute border border-sky-400 bg-sky-500/15 pointer-events-none rounded-sm"
            />
          );
        })()}
      </div>
      <div className="absolute top-1 left-2 text-[9px] font-mono text-slate-400 tracking-wider uppercase">
        Minimap
      </div>
    </div>
  );
};
