import React, { useState } from 'react';
import { CanvasNode, ApiConnectorData } from '../../types';
import { Globe, Send, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface Props {
  node: CanvasNode;
  onUpdate: (data: Partial<ApiConnectorData>) => void;
}

export const ApiConnectorNode: React.FC<Props> = ({ node, onUpdate }) => {
  const data = (node.data || {}) as ApiConnectorData;
  const [endpoint, setEndpoint] = useState(data.endpoint || 'https://api.synapsecanvas.internal/v1/health');
  const [method, setMethod] = useState(data.method || 'POST');
  const [payload, setPayload] = useState(data.payload || '{\n  "query": "system_status",\n  "mode": "realtime"\n}');
  const [response, setResponse] = useState(data.lastResponse || {
    status: 200,
    responseTimeMs: 34,
    data: { status: 'healthy', version: '2026.3-webmcp', latency_p95: '42ms' }
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    setIsLoading(true);
    setTimeout(() => {
      let parsedPayload: any = {};
      try {
        parsedPayload = JSON.parse(payload);
      } catch (_) {
        parsedPayload = { raw: payload };
      }

      const mockRes = {
        status: 200,
        responseTimeMs: Math.floor(Math.random() * 35) + 15,
        data: {
          success: true,
          endpoint,
          method,
          timestamp: new Date().toISOString(),
          receivedPayload: parsedPayload,
          gateway: 'Cloudflare Workers / WebMCP Mesh'
        }
      };
      setResponse(mockRes);
      setIsLoading(false);
      onUpdate({ endpoint, method, payload, lastResponse: mockRes });
    }, 250);
  };

  const methodColors = {
    GET: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    POST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className="flex flex-col h-full select-text">
      {/* Endpoint Bar */}
      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-800 text-xs">
        <select
          value={method}
          onChange={(e: any) => setMethod(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 font-bold px-1.5 py-1 rounded text-[11px] focus:outline-none"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>

        <input
          type="text"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
        />

        <button
          onClick={handleSend}
          disabled={isLoading}
          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
        >
          <Send className={`w-3 h-3 ${isLoading ? 'animate-pulse' : ''}`} />
          <span>{isLoading ? '...' : 'Send'}</span>
        </button>
      </div>

      {/* Payload Editor */}
      <div className="mb-2">
        <div className="text-[10px] text-slate-400 mb-1 font-medium flex justify-between">
          <span>Request Body (JSON)</span>
          <span className="font-mono text-indigo-400">application/json</span>
        </div>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-500 resize-none"
          spellCheck={false}
        />
      </div>

      {/* Response Viewer */}
      <div className="flex-1 bg-slate-950/80 rounded border border-slate-800 overflow-hidden flex flex-col min-h-0">
        <div className="bg-slate-900/90 px-2.5 py-1 border-b border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${response.status === 200 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              {response.status} OK
            </span>
            <span className="text-slate-400 text-[10px]">Response JSON</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <Clock className="w-3 h-3 text-sky-400" />
            <span>{response.responseTimeMs}ms</span>
          </div>
        </div>

        <div className="flex-1 p-2 overflow-y-auto text-xs font-mono text-slate-300">
          <pre className="whitespace-pre-wrap">{JSON.stringify(response.data, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};
