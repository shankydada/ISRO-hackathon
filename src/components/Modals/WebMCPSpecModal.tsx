import React from 'react';
import { BookOpen, X, Code2, Cpu, CheckCircle2, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WebMCPSpecModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">The WebMCP Challenge Submission & Spec Brief</h2>
              <p className="text-xs text-slate-400">OpenAI & W3C Web Machine Learning CG Standards Implementation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-slate-200 text-xs leading-relaxed">
          {/* Section 1: Why use case is a strong fit */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <h3>1. Why SynapseCanvas is an Ideal Fit for WebMCP</h3>
            </div>
            <p>
              Traditional web canvases (Figma, Miro, Retool, BI Dashboards) are fundamentally built for human pointer events. When AI agents attempt to operate them via computer vision scraping or DOM clicking, they suffer from <strong>spatial coordinate distortion</strong>, <strong>pan/zoom offset hallucinations</strong>, and <strong>DOM element opacity</strong>.
            </p>
            <p>
              <strong>WebMCP inverts this paradigm</strong>: SynapseCanvas registers typed, structured tools via <code className="text-indigo-300 font-mono">document.modelContext.registerTool</code>, exposing exact graph models, coordinates, SQL data execution, and micro-app state directly to in-browser agents. The agent does not need to guess; it manipulates the canvas with mathematical precision while the human collaborates in real-time.
            </p>
          </div>

          {/* Section 2: Better User Experience */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <h3>2. How WebMCP Creates a Radically Better User Experience</h3>
            </div>
            <ul className="space-y-1.5 list-disc pl-5 text-slate-300">
              <li>
                <strong>Zero-Latency Zero-Hallucination Execution</strong>: The agent executes verified JSON Schema tools, avoiding broken clicks or incorrect button targets.
              </li>
              <li>
                <strong>Real-Time Co-Presence</strong>: When the agent calls tools, the canvas glows with pulsing indicators, updates nodes in place, and draws semantic edges dynamically.
              </li>
              <li>
                <strong>Client-Side Speed & Privacy</strong>: Queries run locally in the browser engine (DuckDB-compatible client SQL, reactive state calculations) without roundtrips to external servers.
              </li>
            </ul>
          </div>

          {/* Section 3: Difficult or Impossible Before */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <h3>3. What People and Agents Can Do Together That Was Impossible Before</h3>
            </div>
            <p>
              Before WebMCP, an agent in ChatGPT or Chrome could only output static text or code snippets for the user to manually copy-paste into disparate tools.
            </p>
            <p>
              With <strong>SynapseCanvas + WebMCP</strong>:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-slate-100 mb-1 text-[11px]">Synchronous Co-Editing</div>
                <p className="text-[11px] text-slate-400">
                  While a human sketches an architecture outline, the agent queries the live backend API, computes token latency, generates an analytics chart, and anchors AI peer review notes.
                </p>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-slate-100 mb-1 text-[11px]">Dynamic Micro-App Instantiation</div>
                <p className="text-[11px] text-slate-400">
                  Agents can dynamically instantiate runnable reactive components (such as SaaS runway calculators or volume pricing simulators) and wire their inputs to live datasets.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Implementation Overview */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Code2 className="w-4 h-4" />
              <h3>4. WebMCP Implementation Architecture</h3>
            </div>
            <p>
              The application implements the official W3C Web Machine Learning CG draft standard:
            </p>
            <pre className="bg-slate-900 p-3 rounded-lg text-xs font-mono text-purple-300 overflow-x-auto border border-slate-800">
{`// Standard WebMCP Registration in SynapseCanvas
document.modelContext.registerTool({
  name: "create_canvas_node",
  description: "Create a new visual or computational node on the canvas",
  inputSchema: {
    type: "object",
    properties: {
      type: { type: "string", enum: ["markdown_doc", "analytics_chart", "sql_query_engine", "live_micro_app", ...] },
      title: { type: "string" },
      x: { type: "number" },
      y: { type: "number" },
      data: { type: "object" }
    },
    required: ["type", "title"]
  },
  execute: async (input) => {
    // Client-side atomic mutation & live rendering
    return {
      content: [{ type: "text", text: "Created node successfully" }],
      structuredContent: { nodeId: "node-...", status: "created" }
    };
  }
});`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
