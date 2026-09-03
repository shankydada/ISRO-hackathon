import { CanvasNode, CanvasEdge } from '../../types';

export interface WorkspaceTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  initialViewport: { x: number; y: number; zoom: number };
}

export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: 'saas_growth_center',
    name: 'FinTech & SaaS Intelligence Center',
    category: 'Finance & Analytics',
    description: 'Real-time ARR telemetry, DuckDB SQL analysis, interactive runway forecasting, and AI agent peer review.',
    badge: 'Popular',
    initialViewport: { x: 80, y: 40, zoom: 0.88 },
    nodes: [
      {
        id: 'node-exec-brief',
        type: 'markdown_doc',
        title: 'Q3 2026 SaaS Growth Strategy',
        x: 100,
        y: 80,
        width: 380,
        height: 440,
        colorTheme: 'indigo',
        tags: ['Strategy', 'Executive', 'Q3-2026'],
        data: {
          category: 'Executive Summary',
          author: 'Alex Mercer (Lead Strategist)',
          status: 'approved',
          content: '### Executive Brief: Synapse Protocol Expansion\n\nOur ARR crossed **$3.74M** in August 2026, marking an unprecedented **126.1% net dollar retention**.\n\n#### Key Milestones Achieved:\n- [x] **WebMCP Integration**: Inverted browser agent paradigm with zero DOM scraping.\n- [x] **CAC Optimization**: Reduced blended CAC from $480 to $310.\n- [ ] **Enterprise Mesh**: Deploy regional edge clusters across EU & APAC.\n\n> "WebMCP transformed our customer onboarding time by 64% through direct agent-native tool binding."'
        },
        lastModifiedBy: { name: 'Alex Mercer', type: 'human', timestamp: Date.now() - 3600000 }
      },
      {
        id: 'node-sql-engine',
        type: 'sql_query_engine',
        title: 'DuckDB In-Browser SQL Telemetry',
        x: 520,
        y: 80,
        width: 440,
        height: 440,
        colorTheme: 'sky',
        tags: ['SQL', 'DuckDB', 'Telemetry'],
        data: {
          datasetId: 'saas_metrics',
          query: 'SELECT month, mrr_usd, arr_usd, churn_rate_pct\nFROM saas_metrics\nWHERE mrr_usd > 150000\nORDER BY month ASC\nLIMIT 6',
          autoRun: true,
          lastResult: {
            columns: [
              { name: 'month', type: 'VARCHAR' },
              { name: 'mrr_usd', type: 'INTEGER' },
              { name: 'arr_usd', type: 'INTEGER' },
              { name: 'churn_rate_pct', type: 'DECIMAL' }
            ],
            rows: [
              { month: '2026-02', mrr_usd: 156000, arr_usd: 1872000, churn_rate_pct: 1.6 },
              { month: '2026-03', mrr_usd: 173000, arr_usd: 2076000, churn_rate_pct: 1.4 },
              { month: '2026-04', mrr_usd: 194000, arr_usd: 2328000, churn_rate_pct: 1.3 },
              { month: '2026-05', mrr_usd: 218000, arr_usd: 2616000, churn_rate_pct: 1.1 },
              { month: '2026-06', mrr_usd: 245000, arr_usd: 2940000, churn_rate_pct: 0.9 },
              { month: '2026-07', mrr_usd: 278000, arr_usd: 3336000, churn_rate_pct: 0.8 }
            ],
            rowCount: 6,
            executionTimeMs: 1.2
          }
        },
        lastModifiedBy: { name: 'Agent Copilot', type: 'agent', timestamp: Date.now() - 1200000 }
      },
      {
        id: 'node-arr-chart',
        type: 'analytics_chart',
        title: 'ARR & MRR Trajectory (2026)',
        x: 1000,
        y: 80,
        width: 440,
        height: 440,
        colorTheme: 'emerald',
        tags: ['Analytics', 'KPI', 'Revenue'],
        data: {
          chartType: 'area',
          metricTitle: 'Annual Recurring Revenue',
          metricValue: '$3,744,000',
          metricTrend: '+119.7% YoY',
          metricTrendPositive: true,
          xAxisLabel: 'Month',
          yAxisLabel: 'MRR ($K)',
          dataSeries: [
            { label: 'Jan', value: 142, target: 130 },
            { label: 'Feb', value: 156, target: 145 },
            { label: 'Mar', value: 173, target: 160 },
            { label: 'Apr', value: 194, target: 180 },
            { label: 'May', value: 218, target: 200 },
            { label: 'Jun', value: 245, target: 225 },
            { label: 'Jul', value: 278, target: 250 },
            { label: 'Aug', value: 312, target: 280 }
          ]
        },
        lastModifiedBy: { name: 'Agent Copilot', type: 'agent', timestamp: Date.now() - 1100000 }
      },
      {
        id: 'node-runway-calc',
        type: 'live_micro_app',
        title: 'Interactive Runway & Growth Simulator',
        x: 520,
        y: 560,
        width: 440,
        height: 380,
        colorTheme: 'violet',
        tags: ['Simulation', 'Interactive', 'MicroApp'],
        data: {
          appType: 'roi_estimator',
          customTitle: 'SaaS Unit Economics & ROI Simulator',
          description: 'Adjust growth velocity to project runway & valuation multiple.',
          state: {
            currentARR: 3744000,
            growthRatePct: 15,
            burnRateUsd: 45000,
            cashBalance: 1850000
          }
        },
        lastModifiedBy: { name: 'Sarah Chen', type: 'human', timestamp: Date.now() - 600000 }
      },
      {
        id: 'node-ai-review',
        type: 'ai_comment',
        title: 'WebMCP Agent Intelligence Note',
        x: 1000,
        y: 560,
        width: 440,
        height: 260,
        colorTheme: 'amber',
        tags: ['Audit', 'Agent-Note'],
        data: {
          targetNodeId: 'node-arr-chart',
          authorName: 'GPT-5 Omni (WebMCP Agent)',
          authorRole: 'agent',
          severity: 'suggestion',
          status: 'open',
          timestamp: 'Just now',
          commentText: 'Current net retention of 126.1% indicates exceptional product-market fit. Recommending shifting 15% of inbound CAC budget toward expansion upsells on existing Tier-1 enterprise accounts.',
          suggestedAction: 'Update Q4 CAC allocation model in MicroApp simulator.'
        },
        lastModifiedBy: { name: 'WebMCP Agent', type: 'agent', timestamp: Date.now() - 300000 }
      }
    ],
    edges: [
      {
        id: 'edge-sql-to-chart',
        fromNodeId: 'node-sql-engine',
        toNodeId: 'node-arr-chart',
        label: 'streams data',
        type: 'bezier',
        color: '#38bdf8',
        animated: true,
        style: 'solid'
      },
      {
        id: 'edge-brief-to-sql',
        fromNodeId: 'node-exec-brief',
        toNodeId: 'node-sql-engine',
        label: 'queries metrics',
        type: 'bezier',
        color: '#818cf8',
        animated: false,
        style: 'dashed'
      },
      {
        id: 'edge-chart-to-calc',
        fromNodeId: 'node-arr-chart',
        toNodeId: 'node-runway-calc',
        label: 'projects runway',
        type: 'bezier',
        color: '#a855f7',
        animated: true,
        style: 'solid'
      },
      {
        id: 'edge-chart-to-comment',
        fromNodeId: 'node-arr-chart',
        toNodeId: 'node-ai-review',
        label: 'agent critique',
        type: 'bezier',
        color: '#f59e0b',
        animated: false,
        style: 'dotted'
      }
    ]
  },
  {
    id: 'fullstack_system_mesh',
    name: 'AI Agent Swarm & Microservice Mesh',
    category: 'Architecture & DevOps',
    description: 'System architecture diagram with live WebMCP endpoint tester, task kanban, and model benchmark comparisons.',
    badge: 'New',
    initialViewport: { x: 70, y: 50, zoom: 0.85 },
    nodes: [
      {
        id: 'node-arch-spec',
        type: 'markdown_doc',
        title: 'WebMCP Agent Architecture v2.4',
        x: 80,
        y: 80,
        width: 380,
        height: 420,
        colorTheme: 'indigo',
        tags: ['Architecture', 'WebMCP', 'Specs'],
        data: {
          category: 'System Architecture',
          author: 'Lead Architect',
          status: 'in_review',
          content: '### WebMCP Autonomous Orchestration\n\n- **Client Standard**: document.modelContext\n- **Transport**: In-Browser DOM Event RPC\n- **Security**: Strict JSON Schema Validation\n\nWebMCP acts as the typed RPC bridge between browser agents and application state.'
        }
      },
      {
        id: 'node-api-tool',
        type: 'api_connector',
        title: 'WebMCP Tool Gateway',
        x: 500,
        y: 80,
        width: 420,
        height: 420,
        colorTheme: 'emerald',
        tags: ['API', 'Gateway', 'REST'],
        data: {
          endpoint: 'https://api.synapsecanvas.internal/v1/tools/execute',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WebMCP-Version': '2026.1'
          },
          payload: '{\n  "tool": "create_canvas_node",\n  "params": {\n    "type": "analytics_chart",\n    "title": "Agent Telemetry"\n  }\n}',
          lastResponse: {
            status: 200,
            responseTimeMs: 42,
            data: { success: true, nodeId: 'node-gen-842', status: 'created' }
          }
        }
      },
      {
        id: 'node-benchmarks',
        type: 'analytics_chart',
        title: 'Model WebMCP Tool Accuracy (%)',
        x: 960,
        y: 80,
        width: 440,
        height: 420,
        colorTheme: 'sky',
        tags: ['AI-Eval', 'Benchmarks'],
        data: {
          chartType: 'bar',
          metricTitle: 'WebMCP Zero-Shot Success Rate',
          metricValue: '98.4%',
          metricTrend: '+14.2% vs CV Scraper',
          metricTrendPositive: true,
          xAxisLabel: 'Model',
          yAxisLabel: 'Accuracy %',
          dataSeries: [
            { label: 'GPT-5', value: 98.4, target: 95 },
            { label: 'Claude 3.7', value: 97.8, target: 95 },
            { label: 'Gemini 2.5', value: 95.2, target: 90 },
            { label: 'DeepSeek R2', value: 94.6, target: 90 },
            { label: 'Codex 70B', value: 93.1, target: 85 }
          ]
        }
      },
      {
        id: 'node-sprint-kanban',
        type: 'task_kanban',
        title: 'WebMCP Feature Roadmap',
        x: 500,
        y: 540,
        width: 600,
        height: 380,
        colorTheme: 'violet',
        tags: ['Sprint', 'Roadmap', 'Kanban'],
        data: {
          columns: [
            {
              id: 'col-backlog',
              title: 'Backlog',
              color: 'border-slate-500',
              cards: [
                { id: 'c1', title: 'WebAudio Voice Stream Tool', priority: 'medium', assignee: 'Devin', tags: ['Audio', 'WebMCP'] },
                { id: 'c2', title: 'WebGPU Shader Node', priority: 'low', assignee: 'Maya', tags: ['Graphics'] }
              ]
            },
            {
              id: 'col-in-progress',
              title: 'In Progress',
              color: 'border-amber-500',
              cards: [
                { id: 'c3', title: 'Bidirectional Canvas Sync', priority: 'urgent', assignee: 'Liam', tags: ['Realtime'] },
                { id: 'c4', title: 'W3C Origin Trial Validator', priority: 'high', assignee: 'Elena', tags: ['Compliance'] }
              ]
            },
            {
              id: 'col-done',
              title: 'Shipped',
              color: 'border-emerald-500',
              cards: [
                { id: 'c5', title: 'document.modelContext API', priority: 'urgent', assignee: 'Core', tags: ['WebMCP'] },
                { id: 'c6', title: 'DuckDB In-Browser SQL', priority: 'high', assignee: 'Core', tags: ['Analytics'] }
              ]
            }
          ]
        }
      }
    ],
    edges: [
      {
        id: 'edge-arch-to-api',
        fromNodeId: 'node-arch-spec',
        toNodeId: 'node-api-tool',
        label: 'specifies endpoints',
        type: 'bezier',
        color: '#6366f1',
        animated: true,
        style: 'solid'
      },
      {
        id: 'edge-api-to-bench',
        fromNodeId: 'node-api-tool',
        toNodeId: 'node-benchmarks',
        label: 'measures latency',
        type: 'bezier',
        color: '#38bdf8',
        animated: true,
        style: 'solid'
      },
      {
        id: 'edge-api-to-kanban',
        fromNodeId: 'node-api-tool',
        toNodeId: 'node-sprint-kanban',
        label: 'tracks sprint tasks',
        type: 'bezier',
        color: '#a855f7',
        animated: false,
        style: 'dashed'
      }
    ]
  },
  {
    id: 'ecommerce_growth_funnel',
    name: 'E-Commerce Omnichannel Growth Funnel',
    category: 'E-Commerce & Retail',
    description: 'Product catalog margin optimization, dynamic pricing calculator, and AI inventory audit.',
    badge: 'Commerce',
    initialViewport: { x: 80, y: 50, zoom: 0.86 },
    nodes: [
      {
        id: 'node-ecom-plan',
        type: 'markdown_doc',
        title: 'Omnichannel Margin Optimization',
        x: 100,
        y: 80,
        width: 380,
        height: 420,
        colorTheme: 'rose',
        tags: ['E-Commerce', 'Retail', 'Strategy'],
        data: {
          category: 'Retail Strategy',
          author: 'Marcus Vance',
          status: 'approved',
          content: '### Q4 Omnichannel Growth Strategy\n\nAnalyzing **$12.04M** in gross revenue across 8 product categories.\n\n- Top Margins: **Quantum Key Encoders (62.0%)** & **Neural Synthesizers (54.0%)**.\n- High Velocity: **Smart Workspace Hubs (9,100 units)**.\n\nAgent automation handles dynamic tier-discount thresholds in real time.'
        }
      },
      {
        id: 'node-ecom-chart',
        type: 'analytics_chart',
        title: 'Category Margin & Revenue Breakdown',
        x: 520,
        y: 80,
        width: 440,
        height: 420,
        colorTheme: 'emerald',
        tags: ['Margins', 'Revenue'],
        data: {
          chartType: 'bar',
          metricTitle: 'Gross Margin Average',
          metricValue: '47.2%',
          metricTrend: '+5.4% vs Q2 target',
          metricTrendPositive: true,
          xAxisLabel: 'Category',
          yAxisLabel: 'Margin %',
          dataSeries: [
            { label: 'Quantum Encoders', value: 62.0, target: 50 },
            { label: 'Neural Synth', value: 54.0, target: 50 },
            { label: 'Spatial Audio', value: 51.5, target: 45 },
            { label: 'Drones', value: 48.2, target: 45 },
            { label: 'Bio-Monitors', value: 45.0, target: 40 },
            { label: 'AI Edge Dev', value: 42.5, target: 40 },
            { label: 'Wearables', value: 38.0, target: 35 },
            { label: 'Smart Hubs', value: 36.5, target: 35 }
          ]
        }
      },
      {
        id: 'node-pricing-calc',
        type: 'live_micro_app',
        title: 'Dynamic Discount & Pricing Engine',
        x: 1000,
        y: 80,
        width: 420,
        height: 420,
        colorTheme: 'indigo',
        tags: ['Interactive', 'Pricing'],
        data: {
          appType: 'pricing_calc',
          customTitle: 'Tiered Volume Discount Simulator',
          description: 'Calculates break-even price and net profit per tier.',
          state: {
            basePrice: 249,
            volume: 500,
            costOfGoods: 110,
            discountPct: 12
          }
        }
      }
    ],
    edges: [
      {
        id: 'edge-ecom-plan-to-chart',
        fromNodeId: 'node-ecom-plan',
        toNodeId: 'node-ecom-chart',
        label: 'visualizes margins',
        type: 'bezier',
        color: '#10b981',
        animated: true,
        style: 'solid'
      },
      {
        id: 'edge-chart-to-pricing',
        fromNodeId: 'node-ecom-chart',
        toNodeId: 'node-pricing-calc',
        label: 'feeds unit costs',
        type: 'bezier',
        color: '#6366f1',
        animated: true,
        style: 'solid'
      }
    ]
  }
];
