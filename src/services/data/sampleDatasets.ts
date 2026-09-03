export interface DatasetDefinition {
  id: string;
  name: string;
  description: string;
  rowCount: number;
  columns: { name: string; type: string }[];
  data: Record<string, any>[];
}

export const SAMPLE_DATASETS: Record<string, DatasetDefinition> = {
  saas_metrics: {
    id: 'saas_metrics',
    name: 'SaaS Business Metrics (2026)',
    description: 'Monthly ARR, MRR, customer churn, CAC, and LTV data across enterprise tiers',
    rowCount: 8,
    columns: [
      { name: 'month', type: 'VARCHAR' },
      { name: 'mrr_usd', type: 'INTEGER' },
      { name: 'arr_usd', type: 'INTEGER' },
      { name: 'net_retention_pct', type: 'DECIMAL' },
      { name: 'churn_rate_pct', type: 'DECIMAL' },
      { name: 'new_customers', type: 'INTEGER' },
      { name: 'cac_usd', type: 'INTEGER' },
      { name: 'ltv_usd', type: 'INTEGER' }
    ],
    data: [
      { month: '2026-01', mrr_usd: 142000, arr_usd: 1704000, net_retention_pct: 114.2, churn_rate_pct: 1.8, new_customers: 64, cac_usd: 480, ltv_usd: 6200 },
      { month: '2026-02', mrr_usd: 156000, arr_usd: 1872000, net_retention_pct: 116.5, churn_rate_pct: 1.6, new_customers: 78, cac_usd: 450, ltv_usd: 6800 },
      { month: '2026-03', mrr_usd: 173000, arr_usd: 2076000, net_retention_pct: 118.0, churn_rate_pct: 1.4, new_customers: 92, cac_usd: 420, ltv_usd: 7400 },
      { month: '2026-04', mrr_usd: 194000, arr_usd: 2328000, net_retention_pct: 119.4, churn_rate_pct: 1.3, new_customers: 110, cac_usd: 390, ltv_usd: 7900 },
      { month: '2026-05', mrr_usd: 218000, arr_usd: 2616000, net_retention_pct: 121.2, churn_rate_pct: 1.1, new_customers: 128, cac_usd: 370, ltv_usd: 8500 },
      { month: '2026-06', mrr_usd: 245000, arr_usd: 2940000, net_retention_pct: 122.8, churn_rate_pct: 0.9, new_customers: 145, cac_usd: 350, ltv_usd: 9100 },
      { month: '2026-07', mrr_usd: 278000, arr_usd: 3336000, net_retention_pct: 124.5, churn_rate_pct: 0.8, new_customers: 168, cac_usd: 330, ltv_usd: 9800 },
      { month: '2026-08', mrr_usd: 312000, arr_usd: 3744000, net_retention_pct: 126.1, churn_rate_pct: 0.7, new_customers: 194, cac_usd: 310, ltv_usd: 10400 }
    ]
  },
  ecommerce_sales: {
    id: 'ecommerce_sales',
    name: 'Global E-Commerce Omnichannel Sales',
    description: 'Product catalog sales performance, conversion rates, and profit margins',
    rowCount: 8,
    columns: [
      { name: 'category', type: 'VARCHAR' },
      { name: 'units_sold', type: 'INTEGER' },
      { name: 'gross_revenue', type: 'DECIMAL' },
      { name: 'margin_pct', type: 'DECIMAL' },
      { name: 'conversion_pct', type: 'DECIMAL' },
      { name: 'return_rate_pct', type: 'DECIMAL' }
    ],
    data: [
      { category: 'AI Edge Devices', units_sold: 4820, gross_revenue: 1446000, margin_pct: 42.5, conversion_pct: 4.8, return_rate_pct: 1.2 },
      { category: 'Neural Synthesizers', units_sold: 2150, gross_revenue: 860000, margin_pct: 54.0, conversion_pct: 3.2, return_rate_pct: 2.1 },
      { category: 'Haptic Wearables', units_sold: 7300, gross_revenue: 1825000, margin_pct: 38.0, conversion_pct: 5.6, return_rate_pct: 1.8 },
      { category: 'Autonomous Drones', units_sold: 1420, gross_revenue: 1704000, margin_pct: 48.2, conversion_pct: 2.4, return_rate_pct: 2.9 },
      { category: 'Smart Workspace Hubs', units_sold: 9100, gross_revenue: 2275000, margin_pct: 36.5, conversion_pct: 6.1, return_rate_pct: 1.1 },
      { category: 'Quantum Key Encoders', units_sold: 840, gross_revenue: 1260000, margin_pct: 62.0, conversion_pct: 1.9, return_rate_pct: 0.5 },
      { category: 'Bio-feedback Monitors', units_sold: 5600, gross_revenue: 1120000, margin_pct: 45.0, conversion_pct: 4.2, return_rate_pct: 1.4 },
      { category: 'Spatial Audio Helmets', units_sold: 3900, gross_revenue: 1560000, margin_pct: 51.5, conversion_pct: 3.8, return_rate_pct: 1.6 }
    ]
  },
  ai_benchmarks: {
    id: 'ai_benchmarks',
    name: 'LLM & Agentic Intelligence Benchmarks',
    description: 'Comparative reasoning, tool use, latency, and cost across leading foundation models',
    rowCount: 6,
    columns: [
      { name: 'model', type: 'VARCHAR' },
      { name: 'webmcp_tool_accuracy_pct', type: 'DECIMAL' },
      { name: 'reasoning_score_mmlu', type: 'DECIMAL' },
      { name: 'code_generation_eval', type: 'DECIMAL' },
      { name: 'p95_latency_ms', type: 'INTEGER' },
      { name: 'cost_per_1m_tokens', type: 'DECIMAL' }
    ],
    data: [
      { model: 'GPT-5 Omni Pro', webmcp_tool_accuracy_pct: 98.4, reasoning_score_mmlu: 94.2, code_generation_eval: 96.1, p95_latency_ms: 380, cost_per_1m_tokens: 3.50 },
      { model: 'Claude 3.7 Sonnet', webmcp_tool_accuracy_pct: 97.8, reasoning_score_mmlu: 93.6, code_generation_eval: 95.8, p95_latency_ms: 420, cost_per_1m_tokens: 3.00 },
      { model: 'Gemini 2.5 Flash', webmcp_tool_accuracy_pct: 95.2, reasoning_score_mmlu: 91.0, code_generation_eval: 92.4, p95_latency_ms: 180, cost_per_1m_tokens: 0.75 },
      { model: 'DeepSeek R2 Pro', webmcp_tool_accuracy_pct: 94.6, reasoning_score_mmlu: 92.1, code_generation_eval: 93.5, p95_latency_ms: 540, cost_per_1m_tokens: 0.55 },
      { model: 'OpenCodex-70B', webmcp_tool_accuracy_pct: 93.1, reasoning_score_mmlu: 88.7, code_generation_eval: 94.0, p95_latency_ms: 290, cost_per_1m_tokens: 0.40 },
      { model: 'Llama 3.3 70B Local', webmcp_tool_accuracy_pct: 91.5, reasoning_score_mmlu: 87.2, code_generation_eval: 89.8, p95_latency_ms: 120, cost_per_1m_tokens: 0.00 }
    ]
  }
};

/**
 * Executes a simple SQL SELECT engine on the client side
 */
export function executeClientSql(query: string, datasetId: string): {
  columns: { name: string; type: string }[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
} {
  const startTime = performance.now();
  const dataset = SAMPLE_DATASETS[datasetId] || SAMPLE_DATASETS['saas_metrics'];

  try {
    const trimmed = query.trim().replace(/;$/, '');
    
    // Simple parser for SELECT * FROM ... WHERE ... ORDER BY ... LIMIT ...
    let rows = [...dataset.data];

    // Check WHERE clause
    const whereMatch = trimmed.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
    if (whereMatch) {
      const condition = whereMatch[1].trim();
      // Safe evaluation of basic conditions
      const conditionParts = condition.split(/\s+AND\s+/i);
      for (const part of conditionParts) {
        const opMatch = part.match(/([a-zA-Z_0-9]+)\s*(=|!=|>|<|>=|<=|LIKE)\s*(.+)/i);
        if (opMatch) {
          const [, field, op, rawVal] = opMatch;
          const cleanVal = rawVal.replace(/^'|'$/g, '').replace(/^"|"$/g, '');
          const numVal = Number(cleanVal);
          const isNum = !isNaN(numVal) && cleanVal !== '';

          rows = rows.filter(row => {
            const rowVal = row[field];
            if (rowVal === undefined) return true;
            if (op === '=') return String(rowVal).toLowerCase() === cleanVal.toLowerCase();
            if (op === '!=') return String(rowVal).toLowerCase() !== cleanVal.toLowerCase();
            if (op === '>' && isNum) return Number(rowVal) > numVal;
            if (op === '<' && isNum) return Number(rowVal) < numVal;
            if (op === '>=' && isNum) return Number(rowVal) >= numVal;
            if (op === '<=' && isNum) return Number(rowVal) <= numVal;
            if (op.toUpperCase() === 'LIKE') {
              const regex = new RegExp(cleanVal.replace(/%/g, '.*'), 'i');
              return regex.test(String(rowVal));
            }
            return true;
          });
        }
      }
    }

    // Check ORDER BY clause
    const orderMatch = trimmed.match(/ORDER\s+BY\s+([a-zA-Z_0-9]+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
      const field = orderMatch[1];
      const direction = (orderMatch[2] || 'ASC').toUpperCase();
      rows.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return direction === 'DESC' ? valB - valA : valA - valB;
        }
        return direction === 'DESC'
          ? String(valB).localeCompare(String(valA))
          : String(valA).localeCompare(String(valB));
      });
    }

    // Check LIMIT clause
    const limitMatch = trimmed.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      rows = rows.slice(0, limit);
    }

    // Check SELECT fields
    const selectMatch = trimmed.match(/SELECT\s+(.+?)\s+FROM/i);
    let columns = dataset.columns;
    if (selectMatch && selectMatch[1].trim() !== '*') {
      const requestedFields = selectMatch[1].split(',').map(f => f.trim());
      columns = dataset.columns.filter(col => requestedFields.includes(col.name));
      rows = rows.map(row => {
        const filteredRow: Record<string, any> = {};
        for (const f of requestedFields) {
          if (row[f] !== undefined) filteredRow[f] = row[f];
        }
        return filteredRow;
      });
    }

    const duration = Math.round((performance.now() - startTime) * 10) / 10;
    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.max(0.4, duration)
    };
  } catch (err: any) {
    return {
      columns: dataset.columns,
      rows: [],
      rowCount: 0,
      executionTimeMs: Math.round(performance.now() - startTime),
      error: err.message || 'Syntax or evaluation error in SQL query'
    };
  }
}
