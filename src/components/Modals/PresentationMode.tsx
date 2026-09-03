import React, { useState } from 'react';
import { CanvasNode, Viewport } from '../../types';
import { Presentation, ChevronLeft, ChevronRight, X, Play, Maximize2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  nodes: CanvasNode[];
  onFocusNode: (node: CanvasNode) => void;
}

export const PresentationMode: React.FC<Props> = ({ isOpen, onClose, nodes, onFocusNode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || nodes.length === 0) return null;

  const currentNode = nodes[currentIndex] || nodes[0];

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % nodes.length;
    setCurrentIndex(nextIdx);
    onFocusNode(nodes[nextIdx]);
  };

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + nodes.length) % nodes.length;
    setCurrentIndex(prevIdx);
    onFocusNode(nodes[prevIdx]);
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/40 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 text-slate-100 animate-fade-in">
      <div className="flex items-center gap-2">
        <Presentation className="w-5 h-5 text-indigo-400" />
        <div>
          <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
            <span>Slide {currentIndex + 1} of {nodes.length}:</span>
            <span className="text-indigo-300 font-mono">{currentNode.title}</span>
          </div>
          <div className="text-[10px] text-slate-400 uppercase font-mono">
            Type: {currentNode.type.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors border border-slate-700"
          title="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={onClose}
        className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
        title="Exit Presentation"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
