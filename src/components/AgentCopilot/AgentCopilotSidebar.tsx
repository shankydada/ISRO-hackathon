import React, { useState } from 'react';
import { AgentActivityStep, AgentWorkflow } from '../../types';
import { WORKFLOW_PRESETS, AgentSimulatorEngine } from '../../services/agent/agentSimulator';
import {
  Bot,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  Loader2,
  TrendingUp,
  Layers,
  ShoppingBag,
  CheckCircle,
  Send,
  Zap,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  isAgentRunning: boolean;
  currentAgentAction: string | null;
  activeSteps: AgentActivityStep[];
  onStepUpdate: (step: AgentActivityStep) => void;
  onStatusMessage: (msg: string | null) => void;
  onSetAgentRunning: (running: boolean) => void;
}

const iconMap: Record<string, React.FC<any>> = {
  TrendingUp,
  Layers,
  ShoppingBag,
  CheckCircle
};

export const AgentCopilotSidebar: React.FC<Props> = ({
  isOpen,
  onToggle,
  isAgentRunning,
  currentAgentAction,
  activeSteps,
  onStepUpdate,
  onStatusMessage,
  onSetAgentRunning
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  const handleRunPreset = async (wf: AgentWorkflow) => {
    if (isAgentRunning) return;
    onSetAgentRunning(true);
    setSelectedWorkflowId(wf.id);

    try {
      await AgentSimulatorEngine.runWorkflow(wf.id, {
        onStepUpdate,
        onStatusMessage
      });
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    } catch (err: any) {
      console.error(err);
    } finally {
      onSetAgentRunning(false);
      setSelectedWorkflowId(null);
    }
  };

  const handleRunCustomPrompt = async () => {
    if (!customPrompt.trim() || isAgentRunning) return;
    onSetAgentRunning(true);
    const promptText = customPrompt.trim();
    setCustomPrompt('');

    try {
      await AgentSimulatorEngine.runCustomPrompt(promptText, {
        onStepUpdate,
        onStatusMessage
      });
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
    } catch (err: any) {
      console.error(err);
    } finally {
      onSetAgentRunning(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-20 right-6 z-30 flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full shadow-2xl font-medium text-xs border border-indigo-400/30 transition-all hover:scale-105"
      >
        <Bot className="w-4 h-4 text-white animate-pulse" />
        <span>Agent Co-Pilot</span>
        <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded-full font-mono">WebMCP</span>
      </button>
    );
  }

  return (
    <div className="fixed top-16 right-0 bottom-0 w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 flex flex-col z-30 shadow-2xl">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-slate-100">WebMCP Agent Co-Pilot</h3>
              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-mono px-1.5 py-0.2 rounded">
                AUTONOMOUS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Direct typed control via WebMCP tools</p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Live Agent Status Bar */}
      {isAgentRunning && (
        <div className="bg-purple-950/50 border-b border-purple-500/30 px-4 py-2.5 flex items-center gap-2.5 text-xs text-purple-200">
          <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
          <div className="truncate font-medium">{currentAgentAction || 'Agent executing WebMCP tools...'}</div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Natural Language Prompt Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Instruct Agent</span>
            </span>
            <span className="text-[10px] text-slate-400">Natural Language</span>
          </div>
          <div className="relative">
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Query SaaS churn metrics, build an ARR chart, and link it with an executive summary..."
              rows={3}
              disabled={isAgentRunning}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRunCustomPrompt();
                }
              }}
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50 resize-none shadow-inner"
            />
            <button
              onClick={handleRunCustomPrompt}
              disabled={!customPrompt.trim() || isAgentRunning}
              className="absolute right-2 bottom-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md transition-all"
            >
              <Send className="w-3 h-3" />
              <span>Run</span>
            </button>
          </div>
        </div>

        {/* Autonomous Workflows */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click Autonomous Workflows</span>
            </span>
            <span className="text-[10px] text-slate-400">WebMCP Chains</span>
          </div>

          <div className="space-y-2">
            {WORKFLOW_PRESETS.map(wf => {
              const Icon = iconMap[wf.iconName] || TrendingUp;
              const isSelected = selectedWorkflowId === wf.id;

              return (
                <div
                  key={wf.id}
                  onClick={() => handleRunPreset(wf)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/60 border-purple-500/60 shadow-lg shadow-purple-500/10'
                      : isAgentRunning
                      ? 'bg-slate-950/40 border-slate-800/80 opacity-60 cursor-not-allowed'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-xs text-slate-100">{wf.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                      {wf.stepsCount} steps
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pl-8">{wf.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Execution Steps Trace */}
        {activeSteps.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Execution Activity Trace</span>
              <span className="text-[10px] font-mono text-purple-400">{activeSteps.length} Tools</span>
            </div>

            <div className="space-y-1.5">
              {activeSteps.map(step => (
                <div
                  key={step.id}
                  className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5 text-xs text-slate-300"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {step.status === 'running' ? (
                        <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                      ) : step.status === 'completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className="font-mono font-semibold text-indigo-300 text-[11px]">{step.toolName}</span>
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                      step.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5">{step.description}</p>
                  {step.details && (
                    <p className="text-[10px] text-emerald-400/90 font-mono pl-5 mt-0.5">{step.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Target: document.modelContext</span>
        <span className="text-emerald-400 font-mono font-medium">Ready</span>
      </div>
    </div>
  );
};
