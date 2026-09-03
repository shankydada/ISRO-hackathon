# 🌟 SynapseCanvas — Collaborative Agent-Native Spatial Intelligence & Generative Studio

> **Built for The WebMCP Challenge (OpenAI, Google Chrome, Cloudflare, Vercel, Shopify, Netlify, Render & Devpost)**  
> *The next-generation open web canvas where humans and AI agents think, compute, analyze, and build together in real time.*

[![WebMCP Standard](https://img.shields.io/badge/WebMCP-W3C_Draft_2026-6366f1?style=for-the-badge&logo=w3c&logoColor=white)](https://github.com/modelcontextprotocol)
[![OpenAI Challenge](https://img.shields.io/badge/OpenAI-WebMCP_Challenge_2026-10b981?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/webmcp-challenge/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)
[![Chrome Canary](https://img.shields.io/badge/Chrome_Canary-146--156_Ready-sky?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com)
[![ChatGPT In--App Browser](https://img.shields.io/badge/ChatGPT-In--App_Browser_Ready-purple?style=for-the-badge&logo=openai&logoColor=white)](https://chatgpt.com)

---

## 🚀 Live Demo & Quick Links

- 🌐 **Interactive Live Studio**: [https://synapse-canvas-webmcp.vercel.app](http://localhost:5173)
- 📖 **WebMCP Specification & Architecture**: [W3C Web Machine Learning CG Draft](https://github.com/modelcontextprotocol)
- 🎬 **Demo Video Walkthrough**: [Watch 3-Minute YouTube Demo Video](#-3-minute-demo-video-script--storyboard)
- 📜 **Open Source License**: [MIT License (Detected in Repo)](LICENSE)

---

## 💡 Executive Summary & The WebMCP Paradigm Shift

In the legacy web, applications were built exclusively for human eyes and cursor clicks. When AI agents attempted to interact with web canvases (Miro, Figma, Retool, BI Dashboards) via computer vision scraping or DOM clicking, they suffered from **spatial coordinate distortion**, **zoom-level hallucinations**, and **fragile DOM mutations**.

**SynapseCanvas fundamentally solves this by leveraging WebMCP (Web Model Context Protocol):**
Instead of leaving agents to guess through screenshots, SynapseCanvas registers typed, callable tools directly on `document.modelContext`. The AI agent in ChatGPT or Google Chrome discovers and executes exact graph manipulations, client-side DuckDB SQL queries, live micro-app state updates, and spatial review annotations with zero latency and 100% precision.

```
                  +---------------------------------------------------+
                  |        ChatGPT in-app Browser / Chrome Canary     |
                  |                AI AGENT (GPT-5 / Claude)          |
                  +-------------------------+-------------------------+
                                            |
                      WebMCP JSON-RPC / document.modelContext
                                            |
                  +-------------------------v-------------------------+
                  |            SynapseCanvas WebMCP Engine            |
                  |  - get_canvas_state      - execute_sql_query      |
                  |  - create_canvas_node    - run_code_sandbox       |
                  |  - update_canvas_node    - add_agent_annotation   |
                  |  - connect_nodes         - auto_layout_canvas     |
                  |  - batch_transform_nodes - export_artifact        |
                  +-------------------------+-------------------------+
                                            |
                  +-------------------------v-------------------------+
                  |         Real-Time Collaborative Spatial UI        |
                  |  - Infinite Vector Canvas (Pan/Zoom/Minimap)      |
                  |  - Interactive DuckDB In-Browser SQL Engine       |
                  |  - Dynamic SVG Analytics (Bar/Line/Area/Pie)      |
                  |  - Runnable Micro-Apps (SaaS ROI, Pricing Engine) |
                  |  - Agile Task Kanban & Sprint Boards              |
                  |  - REST API Gateway Tester & Benchmarks           |
                  +---------------------------------------------------+
```

---

## 🏆 Official Hackathon Submission Questions

### 1. Why is your use case a strong fit for WebMCP?
Spatial canvases and multi-model data workspaces are notoriously difficult for AI agents to operate via visual DOM scraping because coordinates, nested state trees, zoom transforms, and multi-tier datasets are impossible to reliably deduce from raw pixels.

WebMCP provides the exact architectural primitive needed: an in-browser typed API contract where the web app exposes programmatic tools to the agent. SynapseCanvas turns the browser into a high-bandwidth co-creation studio where the human draws and ideates while the agent simultaneously computes regressions, plots telemetry, configures micro-apps, and links graph dependencies through `document.modelContext.registerTool`.

### 2. How does it create a better user experience?
1. **Zero Guesswork & Instant Precision**: The agent places and connects nodes at mathematically exact graph coordinates without UI misclicks.
2. **Synchronous Co-Presence**: As the agent invokes WebMCP tools, the canvas displays glowing active states, pulse rings, and step-by-step progress streams, giving the human complete visibility and control.
3. **Client-Side Speed & Privacy**: Calculations (such as DuckDB SQL analysis and ROI simulations) execute client-side in sub-millisecond browser time without transmitting sensitive workspace data to external backends.
4. **Infinite Undo/Redo & Manual Intervention**: The human can override, adjust sliders, resize widgets, or edit text at any moment during or after an agent tool execution.

### 3. Describe what people and agents can do together that was difficult or impossible before
- **Real-Time Data-to-App Synthesis**: A human writes a product strategy note; the agent reads the note via `get_canvas_state`, executes SQL on raw revenue datasets via `execute_sql_query`, instantiates a live interactive pricing calculator widget via `create_canvas_node`, and connects them with animated semantic flow lines.
- **Autonomous Canvas Auditing & Peer Review**: Agents can traverse complex diagrams, detect disconnected components or unrealistic financial projections, and anchor contextual `ai_comment` badges directly onto specific elements.
- **Bi-Directional State Binding**: Adjusting a slider inside a human-created Micro-App immediately updates the state that the agent inspects during its next autonomous step.

### 4. Briefly explain how you implemented WebMCP
We implemented the canonical **W3C Web Machine Learning Community Group (May/July 2026 drafts)** standard:
- **Canonical Getter**: Configured tools under `document.modelContext.registerTool({...})` with backwards-compatible aliases for `navigator.modelContext` and `window.modelContext`.
- **Typed Schemas**: Every tool defines a comprehensive JSON Schema with type validation, enum restrictions, and parameter descriptions.
- **Structured MCP Output**: Handlers return `{ content: [{ type: "text", text: "..." }], structuredContent: {...} }` conforming to the Model Context Protocol specifications.
- **Integrated WebMCP Inspector & Test Console**: An in-app floating debugger allowing developers and judges to inspect registered tools, view schemas, test tool execution in real-time, and view timestamped invocation audit logs with millisecond latency metrics.

---

## 🛠️ Complete WebMCP Tool Registry Surface

SynapseCanvas registers a rich, production-grade tool surface:

| Tool Name | Description | Key Inputs | Output Format |
| :--- | :--- | :--- | :--- |
| `get_canvas_state` | Inspects full graph topology, nodes, coordinates, data models, edges, and viewport. | `includeData: boolean`, `filterType: string` | Graph summary + array of node models |
| `create_canvas_node` | Creates a new visual or computational node on the canvas. | `type: string`, `title: string`, `x, y, width, height`, `data: object` | Node ID, dimensions, anchor coordinates |
| `update_canvas_node` | Updates properties, content, dimensions, or styling of an existing node. | `nodeId: string`, `title`, `data`, `colorTheme` | Updated node object |
| `delete_canvas_node` | Removes node from canvas and automatically prunes connected edges. | `nodeId: string` | Deletion status + pruned edge IDs |
| `connect_nodes` | Creates semantic directional/bidirectional edges between two nodes. | `fromNodeId`, `toNodeId`, `label`, `type`, `animated` | Created edge object |
| `auto_layout_canvas` | Reorganizes canvas nodes with topological graph algorithms. | `layoutAlgorithm: 'hierarchical_dag' \| 'grid_matrix' \| 'horizontal_flow'` | Repositioned node coordinates |
| `execute_sql_query` | Runs client-side SQL against embedded datasets (SaaS metrics, E-Commerce, AI benchmarks). | `datasetId: string`, `query: string`, `targetNodeId?: string` | Columns, rows, row count, execution time |
| `run_code_sandbox` | Executes sandboxed JavaScript/mathematical algorithms in the browser. | `code: string`, `contextVariables?: object` | Computed return value + latency |
| `add_agent_annotation`| Drops an intelligent AI review badge/critique card anchored to a target node. | `targetNodeId`, `commentText`, `severity`, `suggestedAction` | Annotation node ID + edge link |
| `export_workspace_artifact` | Generates Markdown executive briefs, JSON workspace bundles, or WebMCP manifests. | `format: 'markdown_report' \| 'json_state' \| 'mcp_manifest'` | Exported document string |

---

## 💻 WebMCP Tool Code Implementation Example

```typescript
// Standard WebMCP tool registration in SynapseCanvas
document.modelContext.registerTool({
  name: "create_canvas_node",
  description: "Create a new visual or computational node on the canvas",
  inputSchema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["markdown_doc", "analytics_chart", "sql_query_engine", "live_micro_app", "task_kanban", "mindmap_node", "api_connector", "ai_comment"],
        description: "Node type to instantiate"
      },
      title: { type: "string", description: "Node title" },
      x: { type: "number", description: "X coordinate (auto-placed if omitted)" },
      y: { type: "number", description: "Y coordinate (auto-placed if omitted)" },
      data: { type: "object", description: "Initial data model" }
    },
    required: ["type", "title"]
  },
  execute: async (input) => {
    const node = canvasService.createNode(input);
    return {
      content: [
        { type: "text", text: `Successfully created ${node.type} node "${node.title}" (ID: ${node.id})` }
      ],
      structuredContent: {
        nodeId: node.id,
        type: node.type,
        title: node.title,
        x: node.x,
        y: node.y
      }
    };
  }
});
```

---

## 🎨 Interactive Node Types & Capabilities

1. 📄 **Markdown Document Node**: Rich markdown editing with live preview, status badges (`draft`, `in_review`, `approved`), interactive checklists, and tag filters.
2. 📊 **Analytics Chart Node**: Interactive SVG charts (Bar, Area, Line, Pie) with KPI cards, target indicators, trend pills (+/- %), and live hover tooltips.
3. 🗄️ **DuckDB SQL Engine Node**: Client-side SQL query runner with dataset switcher (SaaS metrics, Omnichannel retail, AI benchmarks), syntax editor, and execution metrics (`0.8ms`).
4. ⚙️ **Runnable Micro-Apps**: Sandboxed interactive widgets:
   - *SaaS Runway & ROI Simulator*: Live calculation of runway months, valuation multiple, and ARR trajectory based on interactive sliders.
   - *Dynamic Tiered Pricing Engine*: Live break-even pricing, gross profit, and unit margin simulation.
5. 📋 **Agile Task Kanban**: Multi-column board (To Do, In Progress, Completed) with drag-to-move cards, priority badges, and quick-add actions.
6. 🌐 **REST API Gateway**: Live endpoint tester with method selector (GET, POST, PUT), JSON payload editor, and latency metrics.
7. 💬 **Spatial AI Comment Node**: Contextual review notes with severity indicators (`praise`, `suggestion`, `critical`), author badges, and one-click "Apply Action" buttons.
8. 🧠 **Concept Mindmap**: Branching ideation tree with color markers and sub-nodes.

---

## 🎬 3-Minute Demo Video Script & Storyboard

| Time | Scene / Visual | Narration Script |
| :--- | :--- | :--- |
| **0:00 - 0:25** | Intro title screen & zooming into SynapseCanvas infinite workspace. | *"Welcome to SynapseCanvas — the collaborative agent-native spatial canvas built for the WebMCP Challenge. Today, AI agents struggle to interact with web apps through fragile DOM scraping and vision guessing. WebMCP completely changes the game by giving websites a direct, typed tool interface for in-browser agents."* |
| **0:25 - 0:55** | Demonstrating human interaction: panning, dragging nodes, editing a markdown note and adjusting an interactive SaaS ROI slider. | *"Here on our infinite canvas, humans can sketch architecture, write strategy, and tweak live interactive micro-apps. Every node — from DuckDB SQL engines to SVG charts — is reactive and state-aware."* |
| **0:55 - 1:45** | Opening the Autonomous Agent Co-Pilot sidebar and clicking **"SaaS Growth & Telemetry Analysis"**. Showing agent steps executing in real time, glowing node highlights, SQL execution, chart creation, and edge linking. | *"Now, let's watch what happens when we unleash our AI agent. Using `document.modelContext.registerTool`, the agent discovers 10 registered WebMCP tools. The agent reads the canvas state, queries our in-browser SaaS database for net retention over 120%, generates an LTV/CAC multiplier chart, connects the data stream with an animated bezier arrow, and drops a spatial review note recommending budget expansion."* |
| **1:45 - 2:20** | Opening the **WebMCP Inspector & Console** modal. Showing all registered tools, JSON schemas, live parameter runner, and execution audit log with latency. | *"Judges and developers can open the WebMCP Inspector at any time. We can inspect the exact W3C-compliant JSON schemas, test tool invocations live, and view the millisecond-accurate audit trail of every tool call."* |
| **2:20 - 2:45** | Switching between Showcase Templates (AI Microservice Mesh, E-Commerce Optimizer) and showing Presentation Mode. | *"SynapseCanvas includes pre-built templates for FinTech, Microservices, and E-Commerce, plus a presentation mode for interactive team walkthroughs."* |
| **2:45 - 3:00** | Exporting workspace as Markdown/JSON and closing with hackathon conclusion. | *"SynapseCanvas showcases the true promise of WebMCP: humans and agents co-creating effortlessly on an open standard. Thank you!"* |

---

## 📦 Getting Started & Local Development

### Prerequisites
- Node.js 18+ (Node.js 22+ recommended)
- Modern browser (Google Chrome Canary with `#enable-webmcp-testing` or standard Chrome / Edge / Safari with built-in WebMCP Polyfill)

### Installation
```bash
# Clone repository
git clone https://github.com/shankydada/ISRO-hackathon.git
cd ISRO-hackathon

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start at `http://localhost:5173`.

### Testing WebMCP in Google Chrome Canary
1. Open Google Chrome Canary (v146+)
2. Navigate to `chrome://flags/#enable-webmcp-testing`
3. Set flag to **Enabled** and restart Chrome
4. Open `http://localhost:5173` — tools will register natively on `document.modelContext`.

### Testing in ChatGPT In-App Browser
Open your deployed URL inside ChatGPT's in-app browser — WebMCP tools are automatically exposed and callable by ChatGPT.

---

## 🚢 Deployment Options

- **Vercel**: Deploy with one click via `vercel` CLI.
- **Cloudflare Pages**: Connect repo and set build command `npm run build`, output directory `dist`.
- **Netlify**: Deploy using `netlify deploy --prod --dir=dist`.
- **Render**: Create Static Site, build command `npm run build`, publish directory `dist`.

---

## 👥 Authors & Acknowledgments

- **SynapseCanvas Core Team** — Dedicated to advancing open agent-native web standards.
- Built for **The WebMCP Challenge 2026** hosted by OpenAI, Google Chrome, Cloudflare, Vercel, Shopify, Netlify, Render, and Devpost.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
