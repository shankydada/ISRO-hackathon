import React, { useState, useEffect } from 'react';
import { webMCPRegistry } from '../../services/webmcp/webmcpRegistry';
import { WebMCPToolDefinition, ToolInvocationLog } from '../../types';
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Copy,
  Terminal,
  Activity,
  ChevronRight,
  ChevronDown,
  Layers,
  X,
  FileJson
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialLogs?: ToolInvocationLog[];
}

export const WebMCPInspectorModal: React.FC<Props> = ({ isOpen, onClose, initialLogs = [] }) => {
  const [tools, setTools] = useState<WebMCPToolDefinition[]>([]);
  const [selectedToolName, setSelectedToolName] = useState<string>('create_canvas_node');
  const [testInputJson, setTestInputJson] = useState<string>('{\n  "type": "analytics_chart",\n  "title": "WebMCP Realtime Metric"\n}');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'tools' | 'logs' | 'manifest'>('tools');
  const [logs, setLogs] = useState<ToolInvocationLog[]>(initialLogs);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTools(webMCPRegistry.getTools());
      const unsub = webMCPRegistry.subscribeLogs((newLogs) => {
        setLogs([...newLogs]);
      });
      return () => unsub();
    }
  }, [isOpen]);

  const selectedTool = tools.find(t => t.name === selectedToolName) || tools[0];

  const handleSelectTool = (tool: WebMCPToolDefinition) => {
    setSelectedToolName(tool.name);
    // Generate default template JSON based on properties
    const defaultObj: Record<string, any> = {};
    const props = tool.inputSchema?.properties || {};
    for (const [key, prop] of Object.entries(props)) {
      if (prop.type === 'string') {
        defaultObj[key] = prop.enum ? prop.enum[0] : (key === 'title' ? 'New WebMCP Node' : 'sample_value');
      } else if (prop.type === 'number') {
        defaultObj[key] = 100;
      } else if (prop.type === 'boolean') {
        defaultObj[key] = true;
      } else if (prop.type === 'object') {
        defaultObj[key] = {};
      }
    }
    setTestInputJson(JSON.stringify(defaultObj, null, 2));
    setExecutionResult(null);
  };

  const handleRunTool = async () => {
    if (!selectedTool) return;
    setIsExecuting(true);
    try {
      let parsedInput = {};
      if (testInputJson.trim()) {
        parsedInput = JSON.parse(testInputJson);
      }
      const res = await webMCPRegistry.executeTool(selectedTool.name, parsedInput, 'manual_test');
      setExecutionResult({ success: true, result: res });
    } catch (err: any) {
      setExecutionResult({ success: false, error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isOpen) return null;

  const filteredTools = tools.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">WebMCP Inspector & Tool Console</h2>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-2 py-0.5 rounded-full">
                  document.modelContext
                </span>
              </div>
              <p className="text-xs text-slate-400">
                W3C Web Machine Learning CG Open Standard • {tools.length} Tools Registered
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('tools')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'tools' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tools Registry ({tools.length})
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'logs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>Audit Logs ({logs.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('manifest')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'manifest' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Manifest
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {activeTab === 'tools' && (
          <div className="flex-1 grid grid-cols-12 overflow-hidden">
            {/* Left Tools List (4 cols) */}
            <div className="col-span-4 bg-slate-950/60 border-r border-slate-800 flex flex-col min-h-0">
              <div className="p-3 border-b border-slate-800">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search registered tools..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredTools.map(tool => {
                  const isSel = selectedTool?.name === tool.name;
                  return (
                    <div
                      key={tool.name}
                      onClick={() => handleSelectTool(tool)}
                      className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                        isSel
                          ? 'bg-indigo-950/60 border-indigo-500/50 text-slate-100 shadow-sm'
                          : 'bg-slate-900/40 border-transparent hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-semibold text-indigo-400">{tool.name}</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSel ? 'rotate-90 text-indigo-400' : 'text-slate-400'}`} />
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{tool.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Tool Playground (8 cols) */}
            <div className="col-span-8 p-5 overflow-y-auto flex flex-col gap-4">
              {selectedTool ? (
                <>
                  {/* Tool Header Card */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-mono text-base font-bold text-slate-100">{selectedTool.name}</div>
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-0.5 rounded-full font-mono">
                        document.modelContext.registerTool
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedTool.description}</p>
                  </div>

                  {/* Input Schema Details */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>JSON Input Schema</span>
                    </h4>
                    <pre className="bg-slate-900 p-3 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800 max-h-40">
                      {JSON.stringify(selectedTool.inputSchema, null, 2)}
                    </pre>
                  </div>

                  {/* Interactive Runner */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Execute Tool (Test Console)</span>
                      </h4>
                      <button
                        onClick={handleRunTool}
                        disabled={isExecuting}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                      >
                        <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : 'fill-current'}`} />
                        <span>{isExecuting ? 'Executing...' : 'Run Tool'}</span>
                      </button>
                    </div>

                    <textarea
                      value={testInputJson}
                      onChange={(e) => setTestInputJson(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-500"
                      placeholder="Input JSON..."
                      spellCheck={false}
                    />

                    {/* Result Output */}
                    {executionResult && (
                      <div className={`mt-2 p-3 rounded-lg border text-xs font-mono ${
                        executionResult.success
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                      }`}>
                        <div className="font-semibold mb-1 flex items-center gap-1.5">
                          {executionResult.success ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                          <span>{executionResult.success ? 'Execution Succeeded' : 'Execution Error'}</span>
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap max-h-48 text-[11px]">
                          {JSON.stringify(executionResult.result || executionResult.error, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                  Select a registered tool from the left list to test.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'logs' && (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  No WebMCP tool calls recorded yet. Try running an Autonomous Agent workflow or testing a tool above!
                </div>
              ) : (
                logs.map(log => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <div
                      key={log.id}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden text-xs"
                    >
                      <div
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-900/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {log.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span className="font-mono font-bold text-slate-100">{log.toolName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                            log.invokedBy === 'copilot_agent'
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                              : log.invokedBy === 'manual_test'
                              ? 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          }`}>
                            {log.invokedBy.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{log.durationMs}ms</span>
                          </div>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-slate-950 border-t border-slate-800/80 grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[10px] text-slate-400 font-mono mb-1 uppercase font-semibold">Input Payload:</div>
                            <pre className="bg-slate-900 p-2.5 rounded text-[11px] font-mono text-sky-300 overflow-x-auto max-h-48 border border-slate-800">
                              {JSON.stringify(log.input, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 font-mono mb-1 uppercase font-semibold">Output Result:</div>
                            <pre className="bg-slate-900 p-2.5 rounded text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48 border border-slate-800">
                              {JSON.stringify(log.output, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Manifest Tab */}
        {activeTab === 'manifest' && (
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-300">
                Standard WebMCP Server Manifest schema compatible with Claude Desktop, Cursor, and OpenAI Codex:
              </div>
              <button
                onClick={() => {
                  const manifest = {
                    serverName: 'synapse-canvas-webmcp',
                    version: '2026.1',
                    tools: tools.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema }))
                  };
                  navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
                  alert('Manifest copied to clipboard!');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </button>
            </div>
            <pre className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-auto">
              {JSON.stringify(
                {
                  $schema: 'https://modelcontextprotocol.io/schema/draft/webmcp-manifest.json',
                  name: 'synapse-canvas-webmcp',
                  version: '2026.1.0',
                  description: 'WebMCP Spatial Intelligence and Generative Workspace Protocol Interface',
                  runtimeTarget: 'document.modelContext (W3C WebML CG)',
                  tools: tools.map(t => ({
                    name: t.name,
                    description: t.description,
                    inputSchema: t.inputSchema
                  }))
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
