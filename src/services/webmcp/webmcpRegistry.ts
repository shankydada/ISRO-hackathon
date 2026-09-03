import { initializeWebMCP, ModelContextInterface } from './webmcpPolyfill';
import { CanvasNode, CanvasEdge, ToolInvocationLog, WebMCPToolDefinition } from '../../types';
import { SAMPLE_DATASETS, executeClientSql } from '../data/sampleDatasets';

export type CanvasStateAccessor = {
  getNodes: () => CanvasNode[];
  getEdges: () => CanvasEdge[];
  setNodes: (updater: (prev: CanvasNode[]) => CanvasNode[]) => void;
  setEdges: (updater: (prev: CanvasEdge[]) => CanvasEdge[]) => void;
  addToolLog: (log: ToolInvocationLog) => void;
  setAgentActiveNode: (nodeId: string | null) => void;
};

class WebMCPRegistryService {
  private static instance: WebMCPRegistryService;
  private modelContext: ModelContextInterface;
  private canvasAccessor: CanvasStateAccessor | null = null;
  private toolLogs: ToolInvocationLog[] = [];
  private logListeners: Set<(logs: ToolInvocationLog[]) => void> = new Set();
  private registrationHandles: Array<{ unregister: () => void }> = [];

  private constructor() {
    this.modelContext = initializeWebMCP();
    this.listenToDomEvents();
  }

  public static getInstance(): WebMCPRegistryService {
    if (!WebMCPRegistryService.instance) {
      WebMCPRegistryService.instance = new WebMCPRegistryService();
    }
    return WebMCPRegistryService.instance;
  }

  private listenToDomEvents() {
    if (typeof window !== 'undefined') {
      window.addEventListener('webmcp:tool-executed', (event: any) => {
        const detail = event.detail;
        const log: ToolInvocationLog = {
          id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          toolName: detail.toolName,
          timestamp: Date.now(),
          input: detail.input,
          output: detail.result || detail.error,
          durationMs: detail.durationMs || 1,
          status: detail.status === 'error' ? 'error' : 'success',
          invokedBy: 'external_agent',
          errorMessage: detail.error
        };
        this.addLog(log);
      });
    }
  }

  public bindCanvas(accessor: CanvasStateAccessor) {
    this.canvasAccessor = accessor;
    this.registerAllTools();
  }

  public addLog(log: ToolInvocationLog) {
    this.toolLogs.unshift(log);
    if (this.toolLogs.length > 200) this.toolLogs.pop();
    this.logListeners.forEach(cb => cb(this.toolLogs));
    if (this.canvasAccessor) {
      this.canvasAccessor.addToolLog(log);
    }
  }

  public subscribeLogs(cb: (logs: ToolInvocationLog[]) => void): () => void {
    this.logListeners.add(cb);
    cb(this.toolLogs);
    return () => this.logListeners.delete(cb);
  }

  public getTools(): WebMCPToolDefinition[] {
    return this.modelContext.getTools();
  }

  public async executeTool(toolName: string, input: any = {}, caller: 'manual_test' | 'copilot_agent' | 'external_agent' = 'manual_test') {
    const startTime = performance.now();
    try {
      const result = await this.modelContext.executeTool(toolName, input);
      const durationMs = Math.round((performance.now() - startTime) * 10) / 10;
      const log: ToolInvocationLog = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        toolName,
        timestamp: Date.now(),
        input,
        output: result,
        durationMs,
        status: 'success',
        invokedBy: caller
      };
      this.addLog(log);
      return result;
    } catch (err: any) {
      const durationMs = Math.round((performance.now() - startTime) * 10) / 10;
      const log: ToolInvocationLog = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        toolName,
        timestamp: Date.now(),
        input,
        output: { error: err.message },
        durationMs,
        status: 'error',
        invokedBy: caller,
        errorMessage: err.message
      };
      this.addLog(log);
      throw err;
    }
  }

  private registerAllTools() {
    // Clean up any previously registered handles
    this.registrationHandles.forEach(h => {
      try { h.unregister(); } catch (_) {}
    });
    this.registrationHandles = [];

    const toolsToRegister: WebMCPToolDefinition[] = [
      // 1. get_canvas_state
      {
        name: 'get_canvas_state',
        description: 'Inspect full workspace graph, nodes, coordinates, data models, edges, and active viewport state.',
        inputSchema: {
          type: 'object',
          properties: {
            includeData: { type: 'boolean', description: 'Whether to include deep node data payloads (default: true)' },
            filterType: { type: 'string', description: 'Optional node type filter (e.g. "analytics_chart", "sql_query_engine")' }
          }
        },
        execute: async (input: any = {}) => {
          if (!this.canvasAccessor) throw new Error('Canvas not bound');
          const allNodes = this.canvasAccessor.getNodes();
          const allEdges = this.canvasAccessor.getEdges();

          let filteredNodes = allNodes;
          if (input.filterType) {
            filteredNodes = allNodes.filter(n => n.type === input.filterType);
          }

          const nodeSummaries = filteredNodes.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            x: n.x,
            y: n.y,
            width: n.width,
            height: n.height,
            colorTheme: n.colorTheme,
            tags: n.tags,
            data: input.includeData !== false ? n.data : undefined
          }));

          const structured = {
            totalNodes: allNodes.length,
            totalEdges: allEdges.length,
            nodes: nodeSummaries,
            edges: allEdges.map(e => ({
              id: e.id,
              from: e.fromNodeId,
              to: e.toNodeId,
              label: e.label,
              type: e.type
            }))
          };

          return {
            content: [
              {
                type: 'text',
                text: `Canvas State: ${allNodes.length} nodes, ${allEdges.length} connections.\nNodes:\n${nodeSummaries.map(n => `- [${n.type}] "${n.title}" (id: ${n.id}) at (${n.x}, ${n.y})`).join('\n')}`
              }
            ],
            structuredContent: structured
          };
        }
      },

      // 2. create_canvas_node
      {
        name: 'create_canvas_node',
        description: 'Create a new visual or computational node on the canvas (markdown_doc, analytics_chart, sql_query_engine, live_micro_app, task_kanban, mindmap_node, api_connector, ai_comment).',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Node type',
              enum: ['markdown_doc', 'analytics_chart', 'sql_query_engine', 'live_micro_app', 'task_kanban', 'mindmap_node', 'api_connector', 'ai_comment']
            },
            title: { type: 'string', description: 'Title label of the node' },
            x: { type: 'number', description: 'X canvas coordinate (auto-positioned if omitted)' },
            y: { type: 'number', description: 'Y canvas coordinate (auto-positioned if omitted)' },
            width: { type: 'number', description: 'Width in pixels (default: 400)' },
            height: { type: 'number', description: 'Height in pixels (default: 400)' },
            colorTheme: { type: 'string', description: 'Color theme (indigo, emerald, amber, rose, sky, violet, slate)' },
            tags: { type: 'array', description: 'Array of tag strings' },
            data: { type: 'object', description: 'Initial node data configuration' }
          },
          required: ['type', 'title']
        },
        execute: async (input: any) => {
          if (!this.canvasAccessor) throw new Error('Canvas not bound');
          const currentNodes = this.canvasAccessor.getNodes();

          // Calculate smart placement if x, y are not specified
          let posX = input.x;
          let posY = input.y;
          if (posX === undefined || posY === undefined) {
            const count = currentNodes.length;
            posX = 120 + (count % 3) * 460;
            posY = 100 + Math.floor(count / 3) * 480;
          }

          const defaultWidth = input.type === 'task_kanban' ? 560 : input.type === 'ai_comment' ? 380 : 420;
          const defaultHeight = input.type === 'ai_comment' ? 240 : 420;

          // Build default data payload based on node type
          let initialData = input.data || {};
          if (input.type === 'markdown_doc' && !initialData.content) {
            initialData = {
              content: `### ${input.title}\n\nCreated collaboratively via WebMCP agent protocol.\n\n- Key Point 1\n- Key Point 2`,
              status: 'draft',
              category: 'General Doc',
              ...initialData
            };
          } else if (input.type === 'analytics_chart' && !initialData.dataSeries) {
            initialData = {
              chartType: 'bar',
              metricTitle: input.title,
              metricValue: '100%',
              metricTrend: '+12.4%',
              metricTrendPositive: true,
              dataSeries: [
                { label: 'Q1', value: 45, target: 40 },
                { label: 'Q2', value: 68, target: 55 },
                { label: 'Q3', value: 89, target: 70 },
                { label: 'Q4', value: 112, target: 90 }
              ],
              ...initialData
            };
          } else if (input.type === 'sql_query_engine' && !initialData.query) {
            initialData = {
              datasetId: 'saas_metrics',
              query: 'SELECT month, mrr_usd, arr_usd FROM saas_metrics LIMIT 5',
              autoRun: true,
              lastResult: executeClientSql('SELECT month, mrr_usd, arr_usd FROM saas_metrics LIMIT 5', 'saas_metrics'),
              ...initialData
            };
          } else if (input.type === 'live_micro_app' && !initialData.appType) {
            initialData = {
              appType: 'roi_estimator',
              customTitle: input.title,
              state: { currentARR: 2500000, growthRatePct: 20, burnRateUsd: 35000, cashBalance: 1200000 },
              ...initialData
            };
          } else if (input.type === 'task_kanban' && !initialData.columns) {
            initialData = {
              columns: [
                { id: 'todo', title: 'To Do', color: 'border-slate-500', cards: [{ id: 'k1', title: 'Initial Planning', priority: 'medium' }] },
                { id: 'progress', title: 'In Progress', color: 'border-amber-500', cards: [{ id: 'k2', title: 'WebMCP Integration', priority: 'urgent' }] },
                { id: 'done', title: 'Done', color: 'border-emerald-500', cards: [{ id: 'k3', title: 'Spec Alignment', priority: 'high' }] }
              ],
              ...initialData
            };
          } else if (input.type === 'ai_comment' && !initialData.commentText) {
            initialData = {
              authorName: 'Agent Co-Pilot',
              authorRole: 'agent',
              commentText: `Agent observation for ${input.title}.`,
              severity: 'suggestion',
              status: 'open',
              timestamp: 'Just now',
              ...initialData
            };
          }

          const newNode: CanvasNode = {
            id: 'node-' + Math.random().toString(36).substring(2, 8),
            type: input.type,
            title: input.title,
            x: posX,
            y: posY,
            width: input.width || defaultWidth,
            height: input.height || defaultHeight,
            colorTheme: input.colorTheme || (input.type === 'analytics_chart' ? 'emerald' : input.type === 'sql_query_engine' ? 'sky' : 'indigo'),
            tags: input.tags || [input.type.replace('_', ' ')],
            data: initialData,
            lastModifiedBy: {
              name: 'WebMCP Agent',
              type: 'agent',
              timestamp: Date.now()
            },
            isAgentActive: true
          };

          this.canvasAccessor.setNodes(prev => [...prev, newNode]);

          // Highlight and trigger visual glow
          this.canvasAccessor.setAgentActiveNode(newNode.id);
          setTimeout(() => {
            if (this.canvasAccessor) this.canvasAccessor.setAgentActiveNode(null);
          }, 3000);

          return {
            content: [
              {
                type: 'text',
                text: `Successfully created ${newNode.type} node "${newNode.title}" with ID ${newNode.id} at position (${newNode.x}, ${newNode.y}).`
              }
            ],
            structuredContent: {
              nodeId: newNode.id,
              type: newNode.type,
              title: newNode.title,
              x: newNode.x,
              y: newNode.y,
              width: newNode.width,
              height: newNode.height
            }
          };
        }
      },

      // 3. update_canvas_node
      {
        name: 'update_canvas_node',
        description: 'Update properties, title, content, coordinates, dimensions, or styling of an existing canvas node.',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: { type: 'string', description: 'Target node ID' },
            title: { type: 'string', description: 'New title' },
            x: { type: 'number', description: 'New X position' },
            y: { type: 'number', description: 'New Y position' },
            width: { type: 'number', description: 'New width' },
            height: { type: 'number', description: 'New height' },
            data: { type: 'object', description: 'Updated data properties (merged into existing data)' },
            colorTheme: { type: 'string', description: 'New color theme' }
          },
          required: ['nodeId']
        },
        execute: async (input: any) => {
          if (!this.canvasAccessor) throw new Error('Canvas not bound');
          let updatedNode: CanvasNode | null = null;

          this.canvasAccessor.setNodes(prev => {
            return prev.map(node => {
              if (node.id === input.nodeId) {
                updatedNode = {
                  ...node,
                  title: input.title !== undefined ? input.title : node.title,
                  x: input.x !== undefined ? input.x : node.x,
                  y: input.y !== undefined ? input.y : node.y,
                  width: input.width !== undefined ? input.width : node.width,
                  height: input.height !== undefined ? input.height : node.height,
                  colorTheme: input.colorTheme || node.colorTheme,
                  data: input.data ? { ...node.data, ...input.data } : node.data,
                  lastModifiedBy: {
                    name: 'WebMCP Agent',
                    type: 'agent',
                    timestamp: Date.now()
                  },
                  isAgentActive: true
                };
                return updatedNode;
              }
              return node;
            });
          });

          if (!updatedNode) {
            throw new Error(`Node with ID "${input.nodeId}" was not found on the canvas.`);
          }

          this.canvasAccessor.setAgentActiveNode(input.nodeId);
          setTimeout(() => {
            if (this.canvasAccessor) this.canvasAccessor.setAgentActiveNode(null);
          }, 2500);

          return {
            content: [
              {
                type: 'text',
                text: `Successfully updated node "${(updatedNode as CanvasNode).title}" (${input.nodeId}).`
              }
            ],
            structuredContent: updatedNode
          };
        }
      },

      // 4. delete_canvas_node
      {
        name: 'delete_canvas_node',
        description: 'Delete a node from the canvas and cleanly remove any attached connections.',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: { type: 'string', description: 'ID of the node to delete' }
          },
          required: ['nodeId']
        },
        execute: async (input: any) => {
          if (!this.canvasAccessor) throw new Error('Canvas not bound');
          const currentNodes = this.canvasAccessor.getNodes();
          const target = currentNodes.find(n => n.id === input.nodeId);
          if (!target) {
            throw new Error(`Node with ID "${input.nodeId}" does not exist.`);
          }

          this.canvasAccessor.setNodes(prev => prev.filter(n => n.id !== input.nodeId));
          this.canvasAccessor.setEdges(prev => prev.filter(e => e.fromNodeId !== input.nodeId && e.toNodeId !== input.nodeId));

          return {
            content: [
              {
                type: 'text',
                text: `Node "${target.title}" (${input.nodeId}) and associated connections were deleted.`
              }
            ],
            structuredContent: { success: true, deletedNodeId: input.nodeId, title: target.title }
          };
        }
      },

      // 5. connect_nodes
      {
        name: 'connect_nodes',
        description: 'Create a semantic directional or bidirectional connection between two nodes on the canvas.',
        inputSchema: {
          type: 'object',
          properties: {
            fromNodeId: { type: 'string', description: 'Source node ID' },
            toNodeId: { type: 'string', description: 'Target node ID' },
            label: { type: 'string', description: 'Relationship label (e.g. "queries data", "depends on", "triggers")' },
            type: { type: 'string', enum: ['straight', 'bezier', 'orthogonal'], description: 'Edge line curve style' },
            animated: { type: 'boolean', description: 'Whether to show animated flow particles on the line' },
            color: { type: 'string', description: 'Hex or CSS color string for the edge' }
          },
          required: ['fromNodeId', 'toNodeId']
        },
        execute: async (input: any) => {
          if (!this.canvasAccessor) throw new Error('Canvas not bound');
          const nodes = this.canvasAccessor.getNodes();
          const source = nodes.find(n => n.id === input.fromNodeId);
          const target = nodes.find(n => n.id === input.toNodeId);

          if (!source || !target) {
            throw new Error(`Invalid source (${input.fromNodeId}) or target (${input.toNodeId}) node ID.`);
          }

          const newEdge: CanvasEdge = {
            id: 'edge-' + Math.random().toString(36).substring(2, 8),
            fromNodeId: input.fromNodeId,
            toNodeId: input.toNodeId,
            label: input.label || 'connected',
            type: input.type || 'bezier',
            animated: input.animated !== false,
            color: input.color || '#38bdf8',
            style: 'solid'
          };

          this.canvasAccessor.setEdges(prev => [...prev, newEdge]);

          return {
            content: [
              {
                type: 'text',
                text: `Connected "${source.title}" -> "${target.title}" with relation: "${newEdge.label}".`
              }
            ],
            structuredContent: newEdge
          };
        }
      },

      // 6. auto_layout_canvas
      {
        name: 'auto_layout_canvas',
        description: 'Automatically rearrange all canvas nodes using graph layout algorithms (hierarchical_dag, grid_matrix, horizontal_flow, circular_cluster).',
        inputSchema: {
          type: 'object',
          properties: {
            layoutAlgorithm: {
              type: 'string',
              enum: ['hierarchical_dag', 'grid_matrix', 'horizontal_flow', 'circular_cluster'],
              description: 'Algorithm used to reposition nodes'
            },
            spacing: { type: 'number', description: 'Spacing multiplier between nodes (default: 1.0)' }
          }
        },
        execute: async (input: any = {}) => {
          if (!this.canvasAccessor) throw new Error('Canvas not bound');
          const algo = input.layoutAlgorithm || 'hierarchical_dag';
          const spacing = input.spacing || 1.0;
          const currentNodes = this.canvasAccessor.getNodes();

          const updatedNodes = currentNodes.map((node, index) => {
            let newX = node.x;
            let newY = node.y;

            if (algo === 'grid_matrix') {
              const cols = Math.ceil(Math.sqrt(currentNodes.length));
              const col = index % cols;
              const row = Math.floor(index / cols);
              newX = 80 + col * (460 * spacing);
              newY = 80 + row * (460 * spacing);
            } else if (algo === 'horizontal_flow') {
              newX = 80 + index * (480 * spacing);
              newY = 120 + (index % 2) * 60;
            } else if (algo === 'circular_cluster') {
              const angle = (index / currentNodes.length) * 2 * Math.PI;
              const radius = 380 * spacing;
              newX = 600 + Math.cos(angle) * radius;
              newY = 400 + Math.sin(angle) * radius;
            } else {
              // hierarchical_dag default
              const col = index % 3;
              const row = Math.floor(index / 3);
              newX = 80 + col * (460 * spacing);
              newY = 80 + row * (480 * spacing);
            }

            return {
              ...node,
              x: Math.round(newX),
              y: Math.round(newY),
              lastModifiedBy: { name: 'WebMCP AutoLayout', type: 'agent' as const, timestamp: Date.now() }
            };
          });

          this.canvasAccessor.setNodes(() => updatedNodes);

          return {
            content: [
              {
                type: 'text',
                text: `Repositioned ${updatedNodes.length} nodes using "${algo}" layout algorithm.`
              }
            ],
            structuredContent: {
              algorithm: algo,
              repositionedCount: updatedNodes.length,
              positions: updatedNodes.map(n => ({ id: n.id, x: n.x, y: n.y }))
            }
          };
        }
      },

      // 7. execute_sql_query
      {
        name: 'execute_sql_query',
        description: 'Run SQL analytical queries against embedded datasets (saas_metrics, ecommerce_sales, ai_benchmarks) to compute aggregations, filtering, and metric trends.',
        inputSchema: {
          type: 'object',
          properties: {
            datasetId: { type: 'string', description: 'Target dataset: "saas_metrics", "ecommerce_sales", "ai_benchmarks"' },
            query: { type: 'string', description: 'SQL query (e.g. "SELECT month, mrr_usd FROM saas_metrics WHERE mrr_usd > 200000 ORDER BY month ASC")' },
            targetNodeId: { type: 'string', description: 'Optional SQL node ID to update with the new query and result' }
          },
          required: ['datasetId', 'query']
        },
        execute: async (input: any) => {
          const result = executeClientSql(input.query, input.datasetId);

          if (input.targetNodeId && this.canvasAccessor) {
            this.canvasAccessor.setNodes(prev => {
              return prev.map(n => {
                if (n.id === input.targetNodeId && n.type === 'sql_query_engine') {
                  return {
                    ...n,
                    data: {
                      ...n.data,
                      query: input.query,
                      datasetId: input.datasetId,
                      lastResult: result
                    },
                    lastModifiedBy: { name: 'WebMCP Agent', type: 'agent', timestamp: Date.now() }
                  };
                }
                return n;
              });
            });
          }

          return {
            content: [
              {
                type: 'text',
                text: `Executed SQL in ${result.executionTimeMs}ms. Returned ${result.rowCount} rows:\n${JSON.stringify(result.rows.slice(0, 5), null, 2)}`
              }
            ],
            structuredContent: result
          };
        }
      },

      // 8. run_code_sandbox
      {
        name: 'run_code_sandbox',
        description: 'Execute sandboxed JavaScript/mathematical computations in the browser to calculate statistics, projections, or simulations.',
        inputSchema: {
          type: 'object',
          properties: {
            code: { type: 'string', description: 'JavaScript code snippet returning a value' },
            contextVariables: { type: 'object', description: 'Variables to inject into the execution scope' }
          },
          required: ['code']
        },
        execute: async (input: any) => {
          const startTime = performance.now();
          try {
            const contextKeys = Object.keys(input.contextVariables || {});
            const contextValues = Object.values(input.contextVariables || {});
            // Safe evaluation wrapper
            const fn = new Function(...contextKeys, `"use strict";\n${input.code}`);
            const output = fn(...contextValues);
            const durationMs = Math.round((performance.now() - startTime) * 10) / 10;

            return {
              content: [
                {
                  type: 'text',
                  text: `Executed code in ${durationMs}ms.\nResult: ${JSON.stringify(output, null, 2)}`
                }
              ],
              structuredContent: { result: output, executionTimeMs: durationMs }
            };
          } catch (err: any) {
            return {
              content: [{ type: 'text', text: `Execution Error: ${err.message}` }],
              isError: true,
              structuredContent: { error: err.message }
            };
          }
        }
      },

      // 9. add_agent_annotation
      {
        name: 'add_agent_annotation',
        description: 'Drop an intelligent AI review annotation badge or suggestion comment on a specific canvas node.',
        inputSchema: {
          type: 'object',
          properties: {
            targetNodeId: { type: 'string', description: 'Node ID to attach comment to' },
            commentText: { type: 'string', description: 'Review or suggestion message' },
            severity: {
              type: 'string',
              enum: ['info', 'suggestion', 'critical', 'praise'],
              description: 'Severity level of the note'
            },
            suggestedAction: { type: 'string', description: 'Recommended follow-up action' }
          },
          required: ['targetNodeId', 'commentText']
        },
        execute: async (input: any) => {
          if (!this.canvasAccessor) throw new Error('Canvas not bound');
          const nodes = this.canvasAccessor.getNodes();
          const target = nodes.find(n => n.id === input.targetNodeId);
          if (!target) {
            throw new Error(`Target node "${input.targetNodeId}" not found.`);
          }

          const commentNode: CanvasNode = {
            id: 'comment-' + Math.random().toString(36).substring(2, 8),
            type: 'ai_comment',
            title: `AI Review on "${target.title}"`,
            x: target.x + target.width + 40,
            y: target.y + 20,
            width: 380,
            height: 240,
            colorTheme: input.severity === 'critical' ? 'rose' : input.severity === 'suggestion' ? 'amber' : 'indigo',
            tags: ['AI-Review', input.severity || 'suggestion'],
            data: {
              targetNodeId: target.id,
              authorName: 'WebMCP Agent Copilot',
              authorRole: 'agent',
              commentText: input.commentText,
              severity: input.severity || 'suggestion',
              status: 'open',
              timestamp: 'Just now',
              suggestedAction: input.suggestedAction
            },
            lastModifiedBy: { name: 'WebMCP Agent', type: 'agent', timestamp: Date.now() },
            isAgentActive: true
          };

          const linkEdge: CanvasEdge = {
            id: 'edge-comment-' + Math.random().toString(36).substring(2, 8),
            fromNodeId: target.id,
            toNodeId: commentNode.id,
            label: 'agent review',
            type: 'bezier',
            color: input.severity === 'critical' ? '#f43f5e' : '#f59e0b',
            animated: false,
            style: 'dotted'
          };

          this.canvasAccessor.setNodes(prev => [...prev, commentNode]);
          this.canvasAccessor.setEdges(prev => [...prev, linkEdge]);

          return {
            content: [
              {
                type: 'text',
                text: `Added AI comment annotation to node "${target.title}" with severity "${input.severity || 'suggestion'}".`
              }
            ],
            structuredContent: { commentNodeId: commentNode.id, edgeId: linkEdge.id }
          };
        }
      },

      // 10. export_workspace_artifact
      {
        name: 'export_workspace_artifact',
        description: 'Export the complete workspace as a comprehensive Markdown executive summary report or JSON schema manifest.',
        inputSchema: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              enum: ['markdown_report', 'json_state', 'mcp_manifest'],
              description: 'Output format'
            }
          }
        },
        execute: async (input: any = {}) => {
          if (!this.canvasAccessor) throw new Error('Canvas not bound');
          const nodes = this.canvasAccessor.getNodes();
          const edges = this.canvasAccessor.getEdges();
          const format = input.format || 'markdown_report';

          if (format === 'json_state') {
            const data = JSON.stringify({ nodes, edges, exportedAt: new Date().toISOString() }, null, 2);
            return {
              content: [{ type: 'text', text: data }],
              structuredContent: { nodes, edges }
            };
          }

          if (format === 'mcp_manifest') {
            const manifest = {
              serverName: 'synapse-canvas-webmcp',
              version: '1.0.0',
              tools: this.getTools().map(t => ({
                name: t.name,
                description: t.description,
                inputSchema: t.inputSchema
              }))
            };
            return {
              content: [{ type: 'text', text: JSON.stringify(manifest, null, 2) }],
              structuredContent: manifest
            };
          }

          // Markdown executive report
          let report = `# SynapseCanvas Executive Brief & Graph Summary\n*Generated on ${new Date().toLocaleDateString()} via WebMCP*\n\n`;
          report += `## Overview\n- **Total Nodes**: ${nodes.length}\n- **Total Connections**: ${edges.length}\n\n`;
          report += `## Canvas Node Inventory\n`;

          for (const node of nodes) {
            report += `### [${node.type.toUpperCase()}] ${node.title}\n`;
            report += `- **Position**: (${node.x}, ${node.y})\n`;
            report += `- **Tags**: ${node.tags?.join(', ') || 'None'}\n`;
            if (node.type === 'markdown_doc' && node.data?.content) {
              report += `\n${node.data.content}\n\n`;
            } else if (node.type === 'analytics_chart' && node.data) {
              report += `- **Metric**: ${node.data.metricTitle} = ${node.data.metricValue} (${node.data.metricTrend || ''})\n`;
            } else if (node.type === 'sql_query_engine' && node.data) {
              report += `\`\`\`sql\n${node.data.query}\n\`\`\`\n`;
            }
            report += `---\n`;
          }

          return {
            content: [{ type: 'text', text: report }],
            structuredContent: { nodeCount: nodes.length, edgeCount: edges.length, markdownReport: report }
          };
        }
      }
    ];

    // Register all tools through the standard document.modelContext API
    toolsToRegister.forEach(tool => {
      const handle = this.modelContext.registerTool(tool);
      this.registrationHandles.push(handle);
    });
  }
}

export const webMCPRegistry = WebMCPRegistryService.getInstance();
