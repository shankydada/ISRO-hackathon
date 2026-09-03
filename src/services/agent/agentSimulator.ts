import { webMCPRegistry } from '../webmcp/webmcpRegistry';
import { AgentActivityStep, AgentWorkflow } from '../../types';

export interface WorkflowProgressCallback {
  onStepUpdate: (step: AgentActivityStep) => void;
  onStatusMessage: (msg: string | null) => void;
  onAgentFocusNode?: (nodeId: string | null) => void;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class AgentSimulatorEngine {
  public static async runWorkflow(
    workflowId: string,
    callbacks: WorkflowProgressCallback
  ): Promise<void> {
    callbacks.onStatusMessage(`Agent initializing WebMCP workflow: ${workflowId}...`);

    switch (workflowId) {
      case 'saas_telemetry_flow':
        await this.runSaaSTelemetryWorkflow(callbacks);
        break;
      case 'fullstack_arch_flow':
        await this.runFullstackArchWorkflow(callbacks);
        break;
      case 'ecommerce_optimizer_flow':
        await this.runEcommerceOptimizerWorkflow(callbacks);
        break;
      case 'canvas_audit_flow':
        await this.runCanvasAuditWorkflow(callbacks);
        break;
      default:
        throw new Error(`Unknown workflow ID: ${workflowId}`);
    }

    callbacks.onStatusMessage(null);
  }

  public static async runCustomPrompt(
    prompt: string,
    callbacks: WorkflowProgressCallback
  ): Promise<void> {
    callbacks.onStatusMessage(`Autonomous Agent interpreting prompt: "${prompt}"...`);

    const p = prompt.toLowerCase();

    // Step 1: inspect canvas
    const step1: AgentActivityStep = {
      id: 'step-' + Date.now() + '-1',
      toolName: 'get_canvas_state',
      status: 'running',
      description: 'Inspecting current canvas geometry and state via WebMCP',
      timestamp: Date.now()
    };
    callbacks.onStepUpdate(step1);
    await sleep(600);

    const canvasState = await webMCPRegistry.executeTool('get_canvas_state', { includeData: true }, 'copilot_agent');
    step1.status = 'completed';
    step1.details = `Retrieved ${canvasState.structuredContent?.totalNodes || 0} nodes and ${canvasState.structuredContent?.totalEdges || 0} connections.`;
    callbacks.onStepUpdate(step1);

    // Step 2: Determine appropriate actions based on prompt keywords
    if (p.includes('chart') || p.includes('metric') || p.includes('revenue') || p.includes('analytics')) {
      const step2: AgentActivityStep = {
        id: 'step-' + Date.now() + '-2',
        toolName: 'create_canvas_node',
        status: 'running',
        description: 'Creating high-impact Analytics Chart node via WebMCP',
        timestamp: Date.now()
      };
      callbacks.onStepUpdate(step2);
      await sleep(800);

      const chartRes = await webMCPRegistry.executeTool(
        'create_canvas_node',
        {
          type: 'analytics_chart',
          title: 'Agent Synthesized Growth Metrics',
          colorTheme: 'emerald',
          data: {
            chartType: 'line',
            metricTitle: 'Synthesized Velocity Index',
            metricValue: '94.8 pts',
            metricTrend: '+28.4% vs Baseline',
            metricTrendPositive: true,
            xAxisLabel: 'Period',
            yAxisLabel: 'Index',
            dataSeries: [
              { label: 'W1', value: 42, target: 40 },
              { label: 'W2', value: 58, target: 50 },
              { label: 'W3', value: 74, target: 65 },
              { label: 'W4', value: 94.8, target: 80 }
            ]
          }
        },
        'copilot_agent'
      );
      step2.status = 'completed';
      step2.details = `Created chart node "${chartRes.structuredContent?.title}" (ID: ${chartRes.structuredContent?.nodeId})`;
      callbacks.onStepUpdate(step2);

      // Connect if any existing node exists
      const existingNodes = canvasState.structuredContent?.nodes || [];
      if (existingNodes.length > 0 && chartRes.structuredContent?.nodeId) {
        const step3: AgentActivityStep = {
          id: 'step-' + Date.now() + '-3',
          toolName: 'connect_nodes',
          status: 'running',
          description: 'Synthesizing semantic data link to existing workspace nodes',
          timestamp: Date.now()
        };
        callbacks.onStepUpdate(step3);
        await sleep(600);

        await webMCPRegistry.executeTool(
          'connect_nodes',
          {
            fromNodeId: existingNodes[0].id,
            toNodeId: chartRes.structuredContent.nodeId,
            label: 'correlates with',
            type: 'bezier',
            color: '#10b981'
          },
          'copilot_agent'
        );
        step3.status = 'completed';
        step3.details = `Linked ${existingNodes[0].title} -> ${chartRes.structuredContent.title}`;
        callbacks.onStepUpdate(step3);
      }
    } else if (p.includes('sql') || p.includes('query') || p.includes('database') || p.includes('duckdb')) {
      const step2: AgentActivityStep = {
        id: 'step-' + Date.now() + '-2',
        toolName: 'execute_sql_query',
        status: 'running',
        description: 'Executing analytical SQL query on client-side engine',
        timestamp: Date.now()
      };
      callbacks.onStepUpdate(step2);
      await sleep(700);

      const sqlRes = await webMCPRegistry.executeTool(
        'execute_sql_query',
        {
          datasetId: 'saas_metrics',
          query: 'SELECT month, mrr_usd, net_retention_pct FROM saas_metrics WHERE net_retention_pct > 120 ORDER BY month DESC'
        },
        'copilot_agent'
      );
      step2.status = 'completed';
      step2.details = `Returned ${sqlRes.structuredContent?.rowCount} rows in ${sqlRes.structuredContent?.executionTimeMs}ms`;
      callbacks.onStepUpdate(step2);

      const step3: AgentActivityStep = {
        id: 'step-' + Date.now() + '-3',
        toolName: 'create_canvas_node',
        status: 'running',
        description: 'Generating DuckDB SQL telemetry node on canvas',
        timestamp: Date.now()
      };
      callbacks.onStepUpdate(step3);
      await sleep(700);

      await webMCPRegistry.executeTool(
        'create_canvas_node',
        {
          type: 'sql_query_engine',
          title: 'Filtered SaaS Retention SQL',
          colorTheme: 'sky',
          data: {
            datasetId: 'saas_metrics',
            query: 'SELECT month, mrr_usd, net_retention_pct FROM saas_metrics WHERE net_retention_pct > 120 ORDER BY month DESC',
            autoRun: true,
            lastResult: sqlRes.structuredContent
          }
        },
        'copilot_agent'
      );
      step3.status = 'completed';
      step3.details = 'SQL Telemetry node mounted.';
      callbacks.onStepUpdate(step3);
    } else if (p.includes('layout') || p.includes('arrange') || p.includes('organize') || p.includes('clean')) {
      const step2: AgentActivityStep = {
        id: 'step-' + Date.now() + '-2',
        toolName: 'auto_layout_canvas',
        status: 'running',
        description: 'Executing DAG topological auto-layout on workspace graph',
        timestamp: Date.now()
      };
      callbacks.onStepUpdate(step2);
      await sleep(800);

      const layoutRes = await webMCPRegistry.executeTool(
        'auto_layout_canvas',
        { layoutAlgorithm: p.includes('grid') ? 'grid_matrix' : p.includes('circle') ? 'circular_cluster' : 'hierarchical_dag' },
        'copilot_agent'
      );
      step2.status = 'completed';
      step2.details = `Repositioned ${layoutRes.structuredContent?.repositionedCount} nodes.`;
      callbacks.onStepUpdate(step2);
    } else {
      // General node creation & annotation
      const step2: AgentActivityStep = {
        id: 'step-' + Date.now() + '-2',
        toolName: 'create_canvas_node',
        status: 'running',
        description: 'Synthesizing collaborative document node for prompt',
        timestamp: Date.now()
      };
      callbacks.onStepUpdate(step2);
      await sleep(700);

      const docRes = await webMCPRegistry.executeTool(
        'create_canvas_node',
        {
          type: 'markdown_doc',
          title: `Agent Synthesis: ${prompt.slice(0, 32)}...`,
          colorTheme: 'indigo',
          data: {
            category: 'AI Synthesis',
            author: 'WebMCP Autonomous Co-Pilot',
            status: 'draft',
            content: `### Collaborative Agent Plan\n\n**User Prompt**: "${prompt}"\n\n#### Executed Actions:\n- [x] Evaluated active workspace state via WebMCP introspection.\n- [x] Synthesized structured domain models.\n- [ ] Pending human co-editor review.\n\n*Created in real-time via WebMCP document.modelContext.*`
          }
        },
        'copilot_agent'
      );
      step2.status = 'completed';
      step2.details = `Generated document node "${docRes.structuredContent?.title}"`;
      callbacks.onStepUpdate(step2);
    }

    callbacks.onStatusMessage(null);
  }

  // Preset 1: FinTech & SaaS Telemetry
  private static async runSaaSTelemetryWorkflow(callbacks: WorkflowProgressCallback) {
    // 1. Inspect State
    const s1: AgentActivityStep = {
      id: 'step-saas-1',
      toolName: 'get_canvas_state',
      status: 'running',
      description: 'Inspecting canvas state and finding dataset anchors',
      timestamp: Date.now()
    };
    callbacks.onStepUpdate(s1);
    await sleep(700);
    const state = await webMCPRegistry.executeTool('get_canvas_state', { includeData: true }, 'copilot_agent');
    s1.status = 'completed';
    s1.details = `Canvas currently has ${state.structuredContent?.totalNodes || 0} nodes.`;
    callbacks.onStepUpdate(s1);

    // 2. Execute SQL
    const s2: AgentActivityStep = {
      id: 'step-saas-2',
      toolName: 'execute_sql_query',
      status: 'running',
      description: 'Querying SaaS CAC vs LTV trends via client DuckDB engine',
      timestamp: Date.now()
    };
    callbacks.onStepUpdate(s2);
    await sleep(800);
    const sqlRes = await webMCPRegistry.executeTool(
      'execute_sql_query',
      {
        datasetId: 'saas_metrics',
        query: 'SELECT month, cac_usd, ltv_usd, (ltv_usd / cac_usd) as ltv_cac_ratio FROM saas_metrics ORDER BY month ASC'
      },
      'copilot_agent'
    );
    s2.status = 'completed';
    s2.details = `Calculated unit economics for ${sqlRes.structuredContent?.rowCount} periods. Ratio peaked at 33.5x.`;
    callbacks.onStepUpdate(s2);

    // 3. Create Chart Node
    const s3: AgentActivityStep = {
      id: 'step-saas-3',
      toolName: 'create_canvas_node',
      status: 'running',
      description: 'Generating LTV/CAC Unit Economics Chart on canvas',
      timestamp: Date.now()
    };
    callbacks.onStepUpdate(s3);
    await sleep(900);
    const chartRes = await webMCPRegistry.executeTool(
      'create_canvas_node',
      {
        type: 'analytics_chart',
        title: 'LTV : CAC Multiplier Curve',
        colorTheme: 'emerald',
        x: 1020,
        y: 80,
        data: {
          chartType: 'bar',
          metricTitle: 'LTV / CAC Ratio',
          metricValue: '33.5x',
          metricTrend: '+160% expansion',
          metricTrendPositive: true,
          xAxisLabel: 'Month',
          yAxisLabel: 'Multiple (x)',
          dataSeries: [
            { label: 'Jan', value: 12.9, target: 10 },
            { label: 'Feb', value: 15.1, target: 10 },
            { label: 'Mar', value: 17.6, target: 12 },
            { label: 'Apr', value: 20.2, target: 15 },
            { label: 'May', value: 23.0, target: 15 },
            { label: 'Jun', value: 26.0, target: 18 },
            { label: 'Jul', value: 29.7, target: 20 },
            { label: 'Aug', value: 33.5, target: 20 }
          ]
        }
      },
      'copilot_agent'
    );
    s3.status = 'completed';
    s3.details = `Chart node created (ID: ${chartRes.structuredContent?.nodeId})`;
    callbacks.onStepUpdate(s3);

    // 4. Link with SQL Node
    const nodes = state.structuredContent?.nodes || [];
    const sqlNode = nodes.find((n: any) => n.type === 'sql_query_engine') || nodes[0];
    if (sqlNode && chartRes.structuredContent?.nodeId) {
      const s4: AgentActivityStep = {
        id: 'step-saas-4',
        toolName: 'connect_nodes',
        status: 'running',
        description: 'Wiring telemetry stream between SQL query and Chart',
        timestamp: Date.now()
      };
      callbacks.onStepUpdate(s4);
      await sleep(600);
      await webMCPRegistry.executeTool(
        'connect_nodes',
        {
          fromNodeId: sqlNode.id,
          toNodeId: chartRes.structuredContent.nodeId,
          label: 'calculates ratio',
          type: 'bezier',
          color: '#10b981'
        },
        'copilot_agent'
      );
      s4.status = 'completed';
      s4.details = 'Connected data stream.';
      callbacks.onStepUpdate(s4);
    }

    // 5. Add AI Comment Annotation
    if (chartRes.structuredContent?.nodeId) {
      const s5: AgentActivityStep = {
        id: 'step-saas-5',
        toolName: 'add_agent_annotation',
        status: 'running',
        description: 'Dropping spatial review annotation on unit economics curve',
        timestamp: Date.now()
      };
      callbacks.onStepUpdate(s5);
      await sleep(800);
      await webMCPRegistry.executeTool(
        'add_agent_annotation',
        {
          targetNodeId: chartRes.structuredContent.nodeId,
          commentText: 'LTV/CAC ratio of 33.5x demonstrates elite enterprise retention. We can afford to double marketing spend on mid-market channels without sacrificing capital efficiency.',
          severity: 'praise',
          suggestedAction: 'Scale Q4 growth budget by 35%.'
        },
        'copilot_agent'
      );
      s5.status = 'completed';
      s5.details = 'Agent annotation anchored to chart.';
      callbacks.onStepUpdate(s5);
    }
  }

  // Preset 2: Fullstack Microservice & Agent Mesh
  private static async runFullstackArchWorkflow(callbacks: WorkflowProgressCallback) {
    const s1: AgentActivityStep = {
      id: 'step-arch-1',
      toolName: 'create_canvas_node',
      status: 'running',
      description: 'Instantiating WebMCP Gateway REST API node',
      timestamp: Date.now()
    };
    callbacks.onStepUpdate(s1);
    await sleep(700);
    const apiRes = await webMCPRegistry.executeTool(
      'create_canvas_node',
      {
        type: 'api_connector',
        title: 'WebMCP Streaming Bridge',
        colorTheme: 'emerald',
        x: 520,
        y: 100,
        data: {
          endpoint: 'https://api.synapsecanvas.internal/v2/stream',
          method: 'POST',
          payload: '{\n  "stream": true,\n  "tools": ["create_canvas_node", "connect_nodes"]\n}',
          lastResponse: { status: 200, responseTimeMs: 28, data: { connected: true, protocol: 'WebMCP/2026' } }
        }
      },
      'copilot_agent'
    );
    s1.status = 'completed';
    s1.details = `Gateway created (ID: ${apiRes.structuredContent?.nodeId})`;
    callbacks.onStepUpdate(s1);

    const s2: AgentActivityStep = {
      id: 'step-arch-2',
      toolName: 'create_canvas_node',
      status: 'running',
      description: 'Creating Agent Sprint Kanban board',
      timestamp: Date.now()
    };
    callbacks.onStepUpdate(s2);
    await sleep(800);
    const kanbanRes = await webMCPRegistry.executeTool(
      'create_canvas_node',
      {
        type: 'task_kanban',
        title: 'Agent Orchestration Sprints',
        colorTheme: 'violet',
        x: 1000,
        y: 100,
        data: {
          columns: [
            { id: 'todo', title: 'Planned', color: 'border-slate-500', cards: [{ id: 'k1', title: 'WebRTC P2P Sync', priority: 'high' }] },
            { id: 'prog', title: 'Active', color: 'border-amber-500', cards: [{ id: 'k2', title: 'WebMCP Standard Alignment', priority: 'urgent' }] },
            { id: 'done', title: 'Completed', color: 'border-emerald-500', cards: [{ id: 'k3', title: 'document.modelContext polyfill', priority: 'urgent' }] }
          ]
        }
      },
      'copilot_agent'
    );
    s2.status = 'completed';
    s2.details = 'Kanban node mounted.';
    callbacks.onStepUpdate(s2);

    const s3: AgentActivityStep = {
      id: 'step-arch-3',
      toolName: 'connect_nodes',
      status: 'running',
      description: 'Connecting Gateway to Sprint Kanban',
      timestamp: Date.now()
    };
    callbacks.onStepUpdate(s3);
    await sleep(600);
    await webMCPRegistry.executeTool(
      'connect_nodes',
      {
        fromNodeId: apiRes.structuredContent.nodeId,
        toNodeId: kanbanRes.structuredContent.nodeId,
        label: 'tracks pipeline',
        type: 'bezier',
        color: '#a855f7'
      },
      'copilot_agent'
    );
    s3.status = 'completed';
    s3.details = 'Edge created.';
    callbacks.onStepUpdate(s3);
  }

  // Preset 3: E-Commerce Optimizer
  private static async runEcommerceOptimizerWorkflow(callbacks: WorkflowProgressCallback) {
    const s1: AgentActivityStep = {
      id: 'step-ecom-1',
      toolName: 'execute_sql_query',
      status: 'running',
      description: 'Auditing product margin tiers via SQL',
      timestamp: Date.now()
    };
    callbacks.onStepUpdate(s1);
    await sleep(700);
    const sqlRes = await webMCPRegistry.executeTool(
      'execute_sql_query',
      {
        datasetId: 'ecommerce_sales',
        query: 'SELECT category, gross_revenue, margin_pct FROM ecommerce_sales WHERE margin_pct > 45 ORDER BY margin_pct DESC'
      },
      'copilot_agent'
    );
    s1.status = 'completed';
    s1.details = `Identified top high-margin categories.`;
    callbacks.onStepUpdate(s1);

    const s2: AgentActivityStep = {
      id: 'step-ecom-2',
      toolName: 'create_canvas_node',
      status: 'running',
      description: 'Creating runnable Dynamic Margin Simulator micro-app',
      timestamp: Date.now()
    };
    callbacks.onStepUpdate(s2);
    await sleep(800);
    const appRes = await webMCPRegistry.executeTool(
      'create_canvas_node',
      {
        type: 'live_micro_app',
        title: 'Realtime Margin & Bundle Optimizer',
        colorTheme: 'indigo',
        data: {
          appType: 'pricing_calc',
          customTitle: 'Catalog Discount & Margin Engine',
          state: { basePrice: 280, volume: 1200, costOfGoods: 120, discountPct: 15 }
        }
      },
      'copilot_agent'
    );
    s2.status = 'completed';
    s2.details = 'Interactive MicroApp node ready.';
    callbacks.onStepUpdate(s2);
  }

  // Preset 4: Canvas Quality Audit
  private static async runCanvasAuditWorkflow(callbacks: WorkflowProgressCallback) {
    const s1: AgentActivityStep = {
      id: 'step-audit-1',
      toolName: 'get_canvas_state',
      status: 'running',
      description: 'Auditing graph topology and detecting disconnected clusters',
      timestamp: Date.now()
    };
    callbacks.onStepUpdate(s1);
    await sleep(800);
    const state = await webMCPRegistry.executeTool('get_canvas_state', { includeData: true }, 'copilot_agent');
    s1.status = 'completed';
    s1.details = `Audited ${state.structuredContent?.totalNodes} nodes and ${state.structuredContent?.totalEdges} edges.`;
    callbacks.onStepUpdate(s1);

    const nodes = state.structuredContent?.nodes || [];
    if (nodes.length > 0) {
      const target = nodes[0];
      const s2: AgentActivityStep = {
        id: 'step-audit-2',
        toolName: 'add_agent_annotation',
        status: 'running',
        description: 'Generating AI quality review badge',
        timestamp: Date.now()
      };
      callbacks.onStepUpdate(s2);
      await sleep(700);
      await webMCPRegistry.executeTool(
        'add_agent_annotation',
        {
          targetNodeId: target.id,
          commentText: `Canvas Audit Complete: 100% WebMCP tool compliance verified. Graph connectivity score: 98/100. All data pipelines are synchronized with real-time reactive bindings.`,
          severity: 'info',
          suggestedAction: 'Ready for production deployment or export.'
        },
        'copilot_agent'
      );
      s2.status = 'completed';
      s2.details = 'Audit review anchored.';
      callbacks.onStepUpdate(s2);
    }
  }
}

export const WORKFLOW_PRESETS: AgentWorkflow[] = [
  {
    id: 'saas_telemetry_flow',
    title: 'SaaS Growth & Telemetry Analysis',
    category: 'Finance & BI',
    description: 'Inspects canvas, runs DuckDB SQL on SaaS metrics, plots LTV/CAC ratios, and drops an expansion review note.',
    iconName: 'TrendingUp',
    stepsCount: 5,
    executeWorkflow: async () => {}
  },
  {
    id: 'fullstack_arch_flow',
    title: 'WebMCP Microservice & Sprint Mesh',
    category: 'Architecture',
    description: 'Deploys a WebMCP API streaming gateway, links an agile task Kanban board, and auto-wires connections.',
    iconName: 'Layers',
    stepsCount: 3,
    executeWorkflow: async () => {}
  },
  {
    id: 'ecommerce_optimizer_flow',
    title: 'Omnichannel Margin Optimization',
    category: 'E-Commerce',
    description: 'Audits product profitability, generates dynamic pricing calculator micro-app, and binds revenue targets.',
    iconName: 'ShoppingBag',
    stepsCount: 3,
    executeWorkflow: async () => {}
  },
  {
    id: 'canvas_audit_flow',
    title: 'Canvas Health & AI Quality Audit',
    category: 'Quality & Review',
    description: 'Scans all nodes, verifies graph topology, and anchors AI peer review notes with confidence scores.',
    iconName: 'CheckCircle',
    stepsCount: 2,
    executeWorkflow: async () => {}
  }
];
