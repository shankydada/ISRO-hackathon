import React, { useState } from 'react';
import { CanvasNode, CanvasEdge } from '../../types';
import { webMCPRegistry } from '../../services/webmcp/webmcpRegistry';
import { Download, Copy, Check, X, FileText, FileJson, Code } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export const ExportModal: React.FC<Props> = ({ isOpen, onClose, nodes, edges }) => {
  const [format, setFormat] = useState<'markdown' | 'json' | 'manifest'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateExportContent = () => {
    if (format === 'json') {
      return JSON.stringify({ nodes, edges, exportedAt: new Date().toISOString(), version: '2026.1' }, null, 2);
    }
    if (format === 'manifest') {
      const tools = webMCPRegistry.getTools();
      return JSON.stringify(
        {
          $schema: 'https://modelcontextprotocol.io/schema/draft/webmcp-manifest.json',
          name: 'synapse-canvas-webmcp',
          version: '2026.1.0',
          tools: tools.map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema
          }))
        },
        null,
        2
      );
    }

    // Markdown Executive Report
    let report = `# SynapseCanvas — Executive Project Brief & Architecture Graph\n`;
    report += `*Generated automatically via WebMCP (document.modelContext)*\n`;
    report += `*Date: ${new Date().toLocaleDateString()}*\n\n`;
    report += `## 1. Executive Summary\n`;
    report += `SynapseCanvas is a collaborative agent-native spatial canvas where humans and AI agents interact seamlessly.\n`;
    report += `- Total Active Nodes: **${nodes.length}**\n`;
    report += `- Total Semantic Connections: **${edges.length}**\n\n`;

    report += `## 2. Workspace Graph Elements\n`;
    nodes.forEach((n, i) => {
      report += `### ${i + 1}. [${n.type.toUpperCase()}] ${n.title}\n`;
      report += `- **Position**: (X: ${n.x}, Y: ${n.y}, Width: ${n.width}px, Height: ${n.height}px)\n`;
      report += `- **Theme**: ${n.colorTheme || 'indigo'}\n`;
      if (n.tags && n.tags.length > 0) {
        report += `- **Tags**: ${n.tags.join(', ')}\n`;
      }
      if (n.type === 'markdown_doc' && n.data?.content) {
        report += `\n${n.data.content}\n\n`;
      } else if (n.type === 'analytics_chart' && n.data) {
        report += `- **Metric**: ${n.data.metricTitle} = ${n.data.metricValue} (${n.data.metricTrend || ''})\n`;
      } else if (n.type === 'sql_query_engine' && n.data) {
        report += `\`\`\`sql\n${n.data.query}\n\`\`\`\n`;
      }
      report += `\n---\n\n`;
    });

    report += `## 3. WebMCP Semantic Edges\n`;
    edges.forEach((e, i) => {
      report += `- **Connection ${i + 1}**: Node \`${e.fromNodeId}\` ➔ Node \`${e.toNodeId}\` [Relation: *"${e.label || 'connected'}"*]\n`;
    });

    return report;
  };

  const content = generateExportContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = format === 'markdown' ? 'synapse-canvas-brief.md' : format === 'json' ? 'synapse-workspace.json' : 'webmcp-manifest.json';
    const mime = format === 'markdown' ? 'text/markdown' : 'application/json';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl h-[75vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-base text-slate-100">Export Workspace Artifact</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setFormat('markdown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              format === 'markdown' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown Executive Brief</span>
          </button>
          <button
            onClick={() => setFormat('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              format === 'json' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Full Workspace JSON</span>
          </button>
          <button
            onClick={() => setFormat('manifest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              format === 'manifest' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>WebMCP Manifest Schema</span>
          </button>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 p-4 overflow-y-auto">
          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap">
            {content}
          </pre>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Export ready for sharing, documentation, or upstream MCP servers.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
