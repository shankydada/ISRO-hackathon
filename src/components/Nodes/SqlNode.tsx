import React, { useState } from 'react';
import { CanvasNode, SqlQueryData, SqlExecutionResult } from '../../types';
import { Database, Play, Clock, Table, AlertCircle } from 'lucide-react';
import { SAMPLE_DATASETS, executeClientSql } from '../../services/data/sampleDatasets';

interface Props {
  node: CanvasNode;
  onUpdate: (data: Partial<SqlQueryData>) => void;
}

export const SqlNode: React.FC<Props> = ({ node, onUpdate }) => {
  const data = (node.data || {}) as SqlQueryData;
  const [query, setQuery] = useState(data.query || 'SELECT month, mrr_usd, arr_usd FROM saas_metrics LIMIT 5');
  const [selectedDataset, setSelectedDataset] = useState(data.datasetId || 'saas_metrics');
  const [result, setResult] = useState<SqlExecutionResult | undefined>(data.lastResult);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunQuery = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = executeClientSql(query, selectedDataset);
      setResult(res);
      setIsRunning(false);
      onUpdate({ query, datasetId: selectedDataset, lastResult: res });
    }, 80);
  };

  const handleDatasetChange = (datasetId: string) => {
    setSelectedDataset(datasetId);
    let defaultQ = 'SELECT * FROM ' + datasetId + ' LIMIT 5';
    if (datasetId === 'saas_metrics') {
      defaultQ = 'SELECT month, mrr_usd, arr_usd, churn_rate_pct FROM saas_metrics LIMIT 5';
    } else if (datasetId === 'ecommerce_sales') {
      defaultQ = 'SELECT category, units_sold, gross_revenue, margin_pct FROM ecommerce_sales LIMIT 5';
    } else if (datasetId === 'ai_benchmarks') {
      defaultQ = 'SELECT model, webmcp_tool_accuracy_pct, reasoning_score_mmlu FROM ai_benchmarks LIMIT 5';
    }
    setQuery(defaultQ);
    const res = executeClientSql(defaultQ, datasetId);
    setResult(res);
    onUpdate({ datasetId, query: defaultQ, lastResult: res });
  };

  return (
    <div className="flex flex-col h-full select-text">
      {/* SQL Controls Bar */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-sky-400" />
          <select
            value={selectedDataset}
            onChange={(e) => handleDatasetChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-sky-500"
          >
            {Object.values(SAMPLE_DATASETS).map(ds => (
              <option key={ds.id} value={ds.id}>{ds.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRunQuery}
          disabled={isRunning}
          className="flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          <Play className={`w-3 h-3 ${isRunning ? 'animate-spin' : 'fill-current'}`} />
          <span>{isRunning ? 'Running...' : 'Run SQL'}</span>
        </button>
      </div>

      {/* SQL Query Editor */}
      <div className="relative mb-2">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SELECT * FROM saas_metrics..."
          rows={3}
          className="w-full bg-slate-950/90 border border-slate-800 rounded p-2 text-xs font-mono text-sky-300 focus:outline-none focus:border-sky-500 resize-none"
          spellCheck={false}
        />
        <div className="absolute right-2 bottom-2 text-[9px] text-slate-400 font-mono">
          DuckDB-Engine / SQL-92
        </div>
      </div>

      {/* Execution Results View */}
      <div className="flex-1 bg-slate-950/80 rounded border border-slate-800/80 overflow-hidden flex flex-col">
        {result?.error ? (
          <div className="p-3 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{result.error}</span>
          </div>
        ) : result && result.rows.length > 0 ? (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead className="bg-slate-900/90 sticky top-0 border-b border-slate-800">
                <tr>
                  {result.columns.map(col => (
                    <th key={col.name} className="px-2.5 py-1 font-semibold text-slate-300 font-mono">
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {result.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/40 font-mono">
                    {result.columns.map(col => (
                      <td key={col.name} className="px-2.5 py-1 text-slate-200">
                        {typeof row[col.name] === 'number'
                          ? row[col.name].toLocaleString()
                          : String(row[col.name] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400 gap-1.5">
            <Table className="w-4 h-4" />
            <span>Click "Run SQL" to execute query</span>
          </div>
        )}

        {/* Query Stats Footer */}
        {result && (
          <div className="bg-slate-900/90 px-2.5 py-1 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{result.executionTimeMs}ms execution time</span>
            </div>
            <span>{result.rowCount} rows returned</span>
          </div>
        )}
      </div>
    </div>
  );
};
