import React, { useState } from 'react';
import { CanvasNode, MicroAppData } from '../../types';
import { Cpu, DollarSign, Percent, Zap, RefreshCw, Layers } from 'lucide-react';

interface Props {
  node: CanvasNode;
  onUpdate: (data: Partial<MicroAppData>) => void;
}

export const MicroAppNode: React.FC<Props> = ({ node, onUpdate }) => {
  const data = (node.data || {}) as MicroAppData;
  const appType = data.appType || 'roi_estimator';

  // State for ROI Simulator
  const [arr, setArr] = useState<number>(data.state?.currentARR || 3744000);
  const [growthPct, setGrowthPct] = useState<number>(data.state?.growthRatePct || 25);
  const [burnRate, setBurnRate] = useState<number>(data.state?.burnRateUsd || 45000);
  const [cashBalance, setCashBalance] = useState<number>(data.state?.cashBalance || 1850000);

  // State for Pricing Calculator
  const [basePrice, setBasePrice] = useState<number>(data.state?.basePrice || 249);
  const [volume, setVolume] = useState<number>(data.state?.volume || 800);
  const [cogs, setCogs] = useState<number>(data.state?.costOfGoods || 110);
  const [discount, setDiscount] = useState<number>(data.state?.discountPct || 15);

  // Calculations for ROI Simulator
  const projectedArr = Math.round(arr * (1 + growthPct / 100));
  const runwayMonths = burnRate > 0 ? Math.round((cashBalance / burnRate) * 10) / 10 : 999;
  const valuationMultiple = 8.5 + (growthPct / 10);
  const enterpriseValuation = Math.round((arr * valuationMultiple) / 1000000 * 10) / 10;

  // Calculations for Pricing Engine
  const effectivePrice = Math.round(basePrice * (1 - discount / 100) * 10) / 10;
  const unitMargin = Math.round((effectivePrice - cogs) * 10) / 10;
  const marginPct = effectivePrice > 0 ? Math.round((unitMargin / effectivePrice) * 1000) / 10 : 0;
  const grossProfit = Math.round(unitMargin * volume);

  const switchAppType = (type: MicroAppData['appType']) => {
    onUpdate({
      appType: type,
      customTitle: type === 'roi_estimator' ? 'SaaS Runway & ROI Simulator' : 'Dynamic Tier Pricing Engine',
      state: type === 'roi_estimator'
        ? { currentARR: arr, growthRatePct: growthPct, burnRateUsd: burnRate, cashBalance }
        : { basePrice, volume, costOfGoods: cogs, discountPct: discount }
    });
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* App Header & Mode Switcher */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <Cpu className="w-3.5 h-3.5 text-violet-400" />
          <span>{data.customTitle || 'Interactive Micro-App'}</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
          <button
            onClick={() => switchAppType('roi_estimator')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              appType === 'roi_estimator' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Runway / ROI
          </button>
          <button
            onClick={() => switchAppType('pricing_calc')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              appType === 'pricing_calc' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tier Pricing
          </button>
        </div>
      </div>

      {/* App Body */}
      {appType === 'roi_estimator' ? (
        <div className="flex-1 flex flex-col justify-between gap-2 text-xs">
          {/* Controls */}
          <div className="space-y-2 bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
            <div>
              <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                <span>Annual ARR:</span>
                <span className="font-mono text-violet-300 font-semibold">${arr.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500000"
                max="10000000"
                step="250000"
                value={arr}
                onChange={(e) => setArr(Number(e.target.value))}
                className="w-full accent-violet-500 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                <span>YoY Growth Rate:</span>
                <span className="font-mono text-emerald-400 font-semibold">{growthPct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={growthPct}
                onChange={(e) => setGrowthPct(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                <span>Monthly Burn Rate:</span>
                <span className="font-mono text-rose-300 font-semibold">${burnRate.toLocaleString()}/mo</span>
              </div>
              <input
                type="range"
                min="10000"
                max="200000"
                step="5000"
                value={burnRate}
                onChange={(e) => setBurnRate(Number(e.target.value))}
                className="w-full accent-rose-500 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Computed Output Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded">
              <div className="text-[10px] text-slate-400">Runway Forecast</div>
              <div className="text-lg font-bold font-mono text-sky-400">{runwayMonths} mos</div>
              <div className="text-[9px] text-slate-400">At ${burnRate.toLocaleString()}/mo burn</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded">
              <div className="text-[10px] text-slate-400">Enterprise Valuation</div>
              <div className="text-lg font-bold font-mono text-emerald-400">${enterpriseValuation}M</div>
              <div className="text-[9px] text-slate-400">{valuationMultiple.toFixed(1)}x ARR multiple</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between gap-2 text-xs">
          {/* Controls */}
          <div className="space-y-2 bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
            <div>
              <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                <span>Base MSRP:</span>
                <span className="font-mono text-indigo-300 font-semibold">${basePrice}</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                <span>Volume Discount:</span>
                <span className="font-mono text-amber-400 font-semibold">{discount}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                <span>Order Volume (Units):</span>
                <span className="font-mono text-sky-400 font-semibold">{volume.toLocaleString()} units</span>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-sky-500 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Computed Output Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded">
              <div className="text-[10px] text-slate-400">Effective Unit Margin</div>
              <div className="text-lg font-bold font-mono text-emerald-400">${unitMargin} ({marginPct}%)</div>
              <div className="text-[9px] text-slate-400">COGS: ${cogs} / unit</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded">
              <div className="text-[10px] text-slate-400">Total Gross Profit</div>
              <div className="text-lg font-bold font-mono text-violet-400">${grossProfit.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400">Across {volume.toLocaleString()} units</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 mt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <Zap className="w-2.5 h-2.5 text-violet-400" />
          <span>Live Reactive Sandbox</span>
        </span>
        <span>WebMCP State Bound</span>
      </div>
    </div>
  );
};
