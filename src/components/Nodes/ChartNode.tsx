import React, { useState } from 'react';
import { CanvasNode, AnalyticsChartData } from '../../types';
import { BarChart3, TrendingUp, TrendingDown, Layers, PieChart, Activity } from 'lucide-react';

interface Props {
  node: CanvasNode;
  onUpdate: (data: Partial<AnalyticsChartData>) => void;
}

export const ChartNode: React.FC<Props> = ({ node, onUpdate }) => {
  const data = (node.data || {}) as AnalyticsChartData;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const series = data.dataSeries || [
    { label: 'Q1', value: 45, target: 40 },
    { label: 'Q2', value: 72, target: 60 },
    { label: 'Q3', value: 95, target: 80 },
    { label: 'Q4', value: 120, target: 100 }
  ];

  const chartType = data.chartType || 'bar';
  const maxValue = Math.max(...series.map(s => Math.max(s.value, s.target || 0)), 10) * 1.15;

  const toggleChartType = () => {
    const types: AnalyticsChartData['chartType'][] = ['bar', 'area', 'line', 'pie'];
    const nextIdx = (types.indexOf(chartType) + 1) % types.length;
    onUpdate({ chartType: types[nextIdx] });
  };

  // SVG dimensions for chart drawing
  const svgWidth = 360;
  const svgHeight = 160;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;
  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const points = series.map((item, idx) => {
    const x = paddingLeft + (idx / Math.max(series.length - 1, 1)) * chartW;
    const y = paddingTop + chartH - (item.value / maxValue) * chartH;
    return { x, y, ...item };
  });

  const areaPath = points.length > 0
    ? `M ${points[0].x} ${paddingTop + chartH} ` +
      points.map(p => `L ${p.x} ${p.y}`).join(' ') +
      ` L ${points[points.length - 1].x} ${paddingTop + chartH} Z`
    : '';

  const linePath = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <div className="flex flex-col h-full select-none">
      {/* KPI Headline Card */}
      <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800/80 mb-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{data.metricTitle || node.title}</div>
          <div className="text-2xl font-bold text-slate-100 tracking-tight mt-0.5">{data.metricValue || '100%'}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {data.metricTrend && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              data.metricTrendPositive !== false
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {data.metricTrendPositive !== false ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{data.metricTrend}</span>
            </div>
          )}
          <button
            onClick={toggleChartType}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded transition-colors"
          >
            {chartType === 'bar' && <BarChart3 className="w-3 h-3 text-emerald-400" />}
            {chartType === 'area' && <Layers className="w-3 h-3 text-indigo-400" />}
            {chartType === 'line' && <Activity className="w-3 h-3 text-sky-400" />}
            {chartType === 'pie' && <PieChart className="w-3 h-3 text-amber-400" />}
            <span className="capitalize">{chartType} View</span>
          </button>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="flex-1 bg-slate-950/60 rounded-lg p-2 border border-slate-800/60 flex flex-col justify-center relative overflow-hidden">
        {chartType === 'pie' ? (
          <div className="flex items-center justify-around h-full py-2">
            <svg width="130" height="130" viewBox="-65 -65 130 130">
              {(() => {
                const total = series.reduce((acc, s) => acc + s.value, 0) || 1;
                let currentAngle = 0;
                const colors = ['#10b981', '#6366f1', '#38bdf8', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];
                return series.map((s, i) => {
                  const sliceAngle = (s.value / total) * 2 * Math.PI;
                  const x1 = 50 * Math.cos(currentAngle);
                  const y1 = 50 * Math.sin(currentAngle);
                  const x2 = 50 * Math.cos(currentAngle + sliceAngle);
                  const y2 = 50 * Math.sin(currentAngle + sliceAngle);
                  const largeArc = sliceAngle > Math.PI ? 1 : 0;
                  const path = `M 0 0 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  currentAngle += sliceAngle;
                  return (
                    <path
                      key={i}
                      d={path}
                      fill={colors[i % colors.length]}
                      className="transition-all hover:opacity-80 cursor-pointer"
                      onMouseEnter={() => setHoverIndex(i)}
                      onMouseLeave={() => setHoverIndex(null)}
                    />
                  );
                });
              })()}
            </svg>
            <div className="flex flex-col gap-1 text-[11px] max-h-36 overflow-y-auto pr-1">
              {series.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-sm ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-indigo-500' : i === 2 ? 'bg-sky-500' : 'bg-amber-500'}`} />
                  <span className="text-slate-300 font-medium truncate max-w-[100px]">{s.label}:</span>
                  <span className="text-slate-100 font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => {
                const y = paddingTop + chartH * ratio;
                const val = Math.round(maxValue * (1 - ratio));
                return (
                  <g key={i}>
                    <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <text x={paddingLeft - 6} y={y + 3} textAnchor="end" className="text-[9px] fill-slate-400 font-mono">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Area Chart Mode */}
              {chartType === 'area' && (
                <>
                  <path d={areaPath} fill="url(#areaGradient)" />
                  <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" />
                </>
              )}

              {/* Line Chart Mode */}
              {chartType === 'line' && (
                <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              )}

              {/* Bar Chart Mode */}
              {chartType === 'bar' && (
                series.map((item, idx) => {
                  const barCount = series.length;
                  const barSpacing = chartW / barCount;
                  const barWidth = Math.min(barSpacing * 0.65, 36);
                  const x = paddingLeft + idx * barSpacing + (barSpacing - barWidth) / 2;
                  const barHeight = (item.value / maxValue) * chartH;
                  const y = paddingTop + chartH - barHeight;
                  const isHover = hoverIndex === idx;

                  return (
                    <g key={idx}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        fill={isHover ? '#6ee7b7' : 'url(#barGradient)'}
                        className="transition-colors cursor-pointer"
                        onMouseEnter={() => setHoverIndex(idx)}
                        onMouseLeave={() => setHoverIndex(null)}
                      />
                      {/* Target Indicator Line */}
                      {item.target && (
                        <line
                          x1={x - 2}
                          y1={paddingTop + chartH - (item.target / maxValue) * chartH}
                          x2={x + barWidth + 2}
                          y2={paddingTop + chartH - (item.target / maxValue) * chartH}
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeDasharray="2 2"
                        />
                      )}
                    </g>
                  );
                })
              )}

              {/* Points for Line / Area */}
              {(chartType === 'line' || chartType === 'area') &&
                points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={hoverIndex === idx ? 5 : 3.5}
                    fill={chartType === 'area' ? '#10b981' : '#38bdf8'}
                    stroke="#0f172a"
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoverIndex(idx)}
                    onMouseLeave={() => setHoverIndex(null)}
                  />
                ))}

              {/* X Axis Labels */}
              {series.map((item, idx) => {
                let x = paddingLeft + (idx / Math.max(series.length - 1, 1)) * chartW;
                if (chartType === 'bar') {
                  const barSpacing = chartW / series.length;
                  x = paddingLeft + idx * barSpacing + barSpacing / 2;
                }
                return (
                  <text
                    key={idx}
                    x={x}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-300 font-medium"
                  >
                    {item.label}
                  </text>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoverIndex !== null && series[hoverIndex] && (
              <div className="absolute top-2 right-2 bg-slate-900/95 border border-slate-700 px-2.5 py-1.5 rounded shadow-lg text-[11px] pointer-events-none z-10 animate-fade-in">
                <div className="font-semibold text-slate-200">{series[hoverIndex].label}</div>
                <div className="text-emerald-400 font-mono font-bold">Value: {series[hoverIndex].value}</div>
                {series[hoverIndex].target && (
                  <div className="text-amber-400 font-mono text-[10px]">Target: {series[hoverIndex].target}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Axis Footer */}
      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
        <span>{data.xAxisLabel ? `X: ${data.xAxisLabel}` : 'Real-time telemetry'}</span>
        <span>{data.yAxisLabel ? `Y: ${data.yAxisLabel}` : 'Live WebMCP Stream'}</span>
      </div>
    </div>
  );
};
