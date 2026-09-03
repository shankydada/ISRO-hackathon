export type NodeType =
  | 'markdown_doc'
  | 'analytics_chart'
  | 'sql_query_engine'
  | 'live_micro_app'
  | 'task_kanban'
  | 'mindmap_node'
  | 'api_connector'
  | 'ai_comment';

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeDimension {
  width: number;
  height: number;
}

export interface MarkdownDocData {
  content: string;
  category?: string;
  author?: string;
  status?: 'draft' | 'in_review' | 'approved';
}

export interface ChartDataPoint {
  label: string;
  value: number;
  target?: number;
  secondaryValue?: number;
  category?: string;
}

export interface AnalyticsChartData {
  chartType: 'bar' | 'line' | 'area' | 'pie' | 'radar';
  metricTitle: string;
  metricValue: string;
  metricTrend?: string;
  metricTrendPositive?: boolean;
  dataSeries: ChartDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface SqlColumn {
  name: string;
  type: string;
}

export interface SqlExecutionResult {
  columns: SqlColumn[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}

export interface SqlQueryData {
  query: string;
  datasetId: string;
  lastResult?: SqlExecutionResult;
  autoRun?: boolean;
}

export interface MicroAppData {
  appType: 'pricing_calc' | 'roi_estimator' | 'countdown_timer' | 'unit_converter' | 'custom_widget';
  state: Record<string, any>;
  customTitle?: string;
  description?: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  tags?: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

export interface TaskKanbanData {
  columns: KanbanColumn[];
}

export interface MindmapBranch {
  id: string;
  label: string;
  color?: string;
  children?: MindmapBranch[];
}

export interface MindmapData {
  rootTopic: string;
  branches: MindmapBranch[];
}

export interface ApiConnectorData {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  payload?: string;
  lastResponse?: {
    status: number;
    data: any;
    responseTimeMs: number;
  };
  mockSuccess?: boolean;
}

export interface AiCommentData {
  targetNodeId?: string;
  authorName: string;
  authorRole: 'agent' | 'human' | 'reviewer';
  commentText: string;
  severity: 'info' | 'suggestion' | 'critical' | 'praise';
  status: 'open' | 'resolved';
  timestamp: string;
  suggestedAction?: string;
}

export type NodeData =
  | MarkdownDocData
  | AnalyticsChartData
  | SqlQueryData
  | MicroAppData
  | TaskKanbanData
  | MindmapData
  | ApiConnectorData
  | AiCommentData;

export interface CanvasNode {
  id: string;
  type: NodeType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: any;
  colorTheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' | 'slate';
  tags?: string[];
  pinned?: boolean;
  lastModifiedBy?: {
    name: string;
    type: 'human' | 'agent';
    timestamp: number;
  };
  isAgentActive?: boolean;
}

export interface CanvasEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  type?: 'straight' | 'bezier' | 'orthogonal';
  color?: string;
  animated?: boolean;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface WebMCPToolInputSchema {
  type: 'object';
  properties: Record<string, {
    type: string;
    description?: string;
    enum?: string[];
    items?: any;
    properties?: any;
    default?: any;
  }>;
  required?: string[];
}

export interface WebMCPToolDefinition {
  name: string;
  description: string;
  inputSchema: WebMCPToolInputSchema;
  execute: (input: any) => Promise<{
    content: Array<{
      type: 'text' | 'image' | 'resource' | 'json';
      text?: string;
      data?: any;
      mimeType?: string;
    }>;
    structuredContent?: any;
    isError?: boolean;
  }>;
}

export interface ToolInvocationLog {
  id: string;
  toolName: string;
  timestamp: number;
  input: any;
  output: any;
  durationMs: number;
  status: 'success' | 'error';
  invokedBy: 'external_agent' | 'copilot_agent' | 'manual_test';
  errorMessage?: string;
}

export interface AgentActivityStep {
  id: string;
  toolName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  description: string;
  details?: string;
  timestamp: number;
  durationMs?: number;
}

export interface AgentWorkflow {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: string;
  stepsCount: number;
  executeWorkflow: () => Promise<void>;
}

export interface WorkspaceState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: Viewport;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  history: Array<{ nodes: CanvasNode[]; edges: CanvasEdge[] }>;
  historyIndex: number;
  activeTemplateId: string | null;
  toolLogs: ToolInvocationLog[];
  isAgentRunning: boolean;
  currentAgentAction: string | null;
  activeAgentSteps: AgentActivityStep[];
}
