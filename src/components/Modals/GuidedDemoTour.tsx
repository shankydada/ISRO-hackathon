import React, { useState, useEffect } from 'react';
import { Viewport, CanvasNode } from '../../types';
import { webMCPRegistry } from '../../services/webmcp/webmcpRegistry';
import { soundService } from '../../services/sound/soundService';
import { Play, Pause, SkipForward, X, Sparkles, Video, Bot, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  nodes: CanvasNode[];
  onViewportChange: (vp: Viewport) => void;
  onOpenInspector: () => void;
  onCloseInspector: () => void;
}

interface TourScene {
  id: string;
  durationMs: number;
  title: string;
  subtitle: string;
  narrationPrompt: string;
  targetNodeId?: string;
  action?: () => Promise<void>;
  targetViewport?: { x: number; y: number; zoom: number };
}

export const GuidedDemoTour: React.FC<Props> = ({
  isOpen,
  onClose,
  nodes,
  onViewportChange,
  onOpenInspector,
  onCloseInspector
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  const scenes: TourScene[] = [
    {
      id: 'scene-intro',
      durationMs: 7000,
      title: 'Scene 1: Welcome to SynapseCanvas & WebMCP',
      subtitle: 'Inverting the web from fragile DOM-scraping to structured typed tools.',
      narrationPrompt: 'SynapseCanvas enables humans and AI agents to co-create seamlessly on an infinite spatial canvas.',
      targetViewport: { x: 80, y: 40, zoom: 0.85 }
    },
    {
      id: 'scene-sql',
      durationMs: 7000,
      title: 'Scene 2: In-Browser Client DuckDB SQL Engine',
      subtitle: 'Sub-millisecond data aggregation directly inside the browser environment.',
      narrationPrompt: 'Executing client-side SQL queries on SaaS metrics in 0.8ms without external roundtrips.',
      targetNodeId: 'node-sql-engine',
      targetViewport: { x: -280, y: 20, zoom: 1.05 },
      action: async () => {
        soundService.playToolSuccess();
        await webMCPRegistry.executeTool('execute_sql_query', {
          datasetId: 'saas_metrics',
          query: 'SELECT month, mrr_usd, net_retention_pct FROM saas_metrics WHERE mrr_usd > 200000 ORDER BY month ASC'
        }, 'manual_test');
      }
    },
    {
      id: 'scene-chart',
      durationMs: 7000,
      title: 'Scene 3: Real-Time Interactive Analytics & Micro-Apps',
      subtitle: 'Reactive stateful widgets and dynamic SVG charts with KPI telemetry.',
      narrationPrompt: 'Human builders and AI agents share bi-directional state with instant calculations.',
      targetNodeId: 'node-arr-chart',
      targetViewport: { x: -700, y: 20, zoom: 1.05 },
      action: async () => {
        soundService.playNodeCreated();
      }
    },
    {
      id: 'scene-agent',
      durationMs: 8000,
      title: 'Scene 4: Autonomous WebMCP Tool Orchestration',
      subtitle: 'Agents discover and invoke document.modelContext tools with mathematical precision.',
      narrationPrompt: 'Agent is executing get_canvas_state -> create_canvas_node -> connect_nodes.',
      targetViewport: { x: -300, y: -200, zoom: 0.9 },
      action: async () => {
        soundService.playAgentPulse();
        const res = await webMCPRegistry.executeTool('create_canvas_node', {
          type: 'analytics_chart',
          title: 'Live Tour Agent Synthesis',
          x: 1000,
          y: 560,
          colorTheme: 'violet',
          data: {
            chartType: 'line',
            metricTitle: 'Synthesized Velocity',
            metricValue: '99.2%',
            dataSeries: [{ label: 'T1', value: 30 }, { label: 'T2', value: 65 }, { label: 'T3', value: 99 }]
          }
        }, 'copilot_agent');
        soundService.playToolSuccess();
      }
    },
    {
      id: 'scene-inspector',
      durationMs: 7000,
      title: 'Scene 5: WebMCP Inspector & W3C Standard Schemas',
      subtitle: 'Deep developer visibility into registered tools, schemas, and millisecond latency logs.',
      narrationPrompt: 'Opening the WebMCP Inspector to verify all 10 registered tools and latency audits.',
      action: async () => {
        onOpenInspector();
        soundService.playToolSuccess();
      }
    },
    {
      id: 'scene-conclusion',
      durationMs: 6000,
      title: 'Scene 6: Open Web Standard for Collaborative AI',
      subtitle: 'Open source under MIT License, ready for ChatGPT in-app browser & Chrome Canary.',
      narrationPrompt: 'SynapseCanvas showcases the future of the agent-native web. Ready to submit!',
      targetViewport: { x: 80, y: 40, zoom: 0.8 },
      action: async () => {
        onCloseInspector();
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.7 } });
      }
    }
  ];

  const currentScene = scenes[currentSceneIdx] || scenes[0];

  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    if (currentScene.targetViewport) {
      onViewportChange(currentScene.targetViewport);
    }
    if (currentScene.action) {
      currentScene.action();
    }

    const interval = 50;
    const totalTicks = currentScene.durationMs / interval;
    let currentTick = 0;

    const timer = setInterval(() => {
      currentTick++;
      setProgressPct((currentTick / totalTicks) * 100);

      if (currentTick >= totalTicks) {
        clearInterval(timer);
        if (currentSceneIdx < scenes.length - 1) {
          setCurrentSceneIdx(prev => prev + 1);
          setProgressPct(0);
        } else {
          setIsPlaying(false);
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, currentSceneIdx, currentScene, onViewportChange, scenes.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/50 rounded-2xl shadow-2xl p-4 text-slate-100 animate-fade-in">
      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-75"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
            <Video className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>{currentScene.title}</span>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded">
                Scene {currentSceneIdx + 1}/{scenes.length}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
            title={isPlaying ? 'Pause Demo' : 'Play Demo'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              if (currentSceneIdx < scenes.length - 1) {
                setCurrentSceneIdx(prev => prev + 1);
                setProgressPct(0);
              }
            }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Skip to Next Scene"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              onCloseInspector();
              onClose();
            }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            title="Exit Demo Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtitles / Narrator Caption */}
      <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-xs">
        <p className="text-indigo-300 font-semibold mb-0.5">{currentScene.subtitle}</p>
        <p className="text-slate-300 italic text-[11px]">"{currentScene.narrationPrompt}"</p>
      </div>
    </div>
  );
};
