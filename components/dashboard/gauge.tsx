"use client";
import { m, useReducedMotion } from "motion/react";
import { Check, AlertTriangle, Info } from "lucide-react";
import { METRIC_META, targetStatus } from "@/lib/recipes";
import type { Metric, Target } from "@/lib/types";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
const polar = (angle: number, radius = 65) => ({ x: 90 + radius * Math.cos(angle * Math.PI / 180), y: 90 + radius * Math.sin(angle * Math.PI / 180) });
function arc(start: number, end: number) { const a = polar(start), b = polar(Math.max(start + .01, end)); return `M ${a.x} ${a.y} A 65 65 0 ${end - start > 180 ? 1 : 0} 1 ${b.x} ${b.y}`; }
export function Gauge({ metric, value, target, live }: { metric: Metric; value: number; target: Target; live: boolean }) {
 const meta = METRIC_META[metric], status = targetStatus(value, target); const reduce = useReducedMotion();
 const angle = (v: number) => 150 + Math.max(0, Math.min(1, (v - meta.scale[0]) / (meta.scale[1] - meta.scale[0]))) * 240;
 const color = status.tone === "good" ? "#B8FF2E" : status.tone === "near" ? "#FFC76A" : "#FF709F";
 const StatusIcon = status.tone === "good" ? Check : AlertTriangle;
 const startPercent = (angle(target.min) - 150) / 240 * (200 / 3);
 const bandPercent = (angle(target.max) - angle(target.min)) / 240 * (200 / 3);
 const valuePercent = (angle(value) - 150) / 240 * (200 / 3);
 const display = value.toLocaleString("en-IN", { minimumFractionDigits: meta.decimals, maximumFractionDigits: meta.decimals });
 return <div className={cn("room-card relative px-4 pb-4 pt-4", status.tone === "bad" ? "border-[#FF709F66]" : "neon-cyan")}>
  <div className="flex items-center justify-between gap-2"><h3 className="font-mono text-[10px] uppercase tracking-wider text-[#C9CFF0]">{meta.label}</h3><Tooltip content={`${meta.label} target: ${target.min}–${target.max} ${meta.unit}. Source: ${target.source}`}><button type="button" aria-label={`${meta.label} target source`} className="rounded p-1 text-[#C9CFF0] hover:text-white"><Info className="size-3.5" /></button></Tooltip></div>
  <div className="relative mx-auto mt-1 max-w-[210px]"><svg viewBox="0 0 180 150" className="w-full" role="img" aria-label={`${meta.label}: ${display} ${meta.unit}. ${status.label}. Target ${target.min} to ${target.max}.`}>
   <path d={arc(150, 390)} fill="none" stroke="#29335D" strokeWidth="8" strokeLinecap="round" />
   <m.circle cx="90" cy="90" r="65" pathLength={100} transform="rotate(150 90 90)" animate={{ strokeDasharray: `${bandPercent} 100`, strokeDashoffset: -startPercent }} transition={{ duration: reduce ? 0 : .7 }} fill="none" stroke="#B8FF2E" strokeOpacity=".3" strokeWidth="13" strokeLinecap="round" />
   <m.circle cx="90" cy="90" r="65" pathLength={100} transform="rotate(150 90 90)" animate={{ strokeDasharray: `${Math.max(.1, valuePercent)} 100` }} transition={{ duration: reduce ? 0 : .8, ease: [.22, 1, .36, 1] }} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
   {[150, 210, 270, 330, 390].map(a => { const p1 = polar(a, 53), p2 = polar(a, 57); return <line key={a} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#69759E" strokeWidth="1" />; })}
   <m.g animate={{ rotate: angle(value) - 270 }} transition={{ type: "spring", stiffness: 65, damping: 16 }} style={{ transformOrigin: "90px 90px" }}><path d="M87 90L90 40L93 90Z" fill={color} opacity=".8" /></m.g><circle cx="90" cy="90" r="5" fill="#10163D" stroke={color} strokeWidth="2" />
   <text x="90" y="124" textAnchor="middle" fill="#F4F6FF" fontSize={metric === "co2" ? "26" : "29"} fontFamily="var(--font-mono)" fontWeight="600" letterSpacing="-1">{display}</text><text x="90" y="141" textAnchor="middle" fill="#C9CFF0" fontSize="9" fontFamily="var(--font-mono)">{meta.unit}</text>
  </svg></div>
  <div className="-mt-1 flex items-center justify-between gap-2"><span className="font-mono text-[9px]" style={{ color }}>{<StatusIcon className="mr-1 inline size-3" />}{status.label}</span><span className="font-mono text-[9px] text-[#C9CFF0]">{metric === "co2" && target.max === 1000 ? `≤ ${target.max.toLocaleString("en-IN")}` : `${target.min}–${target.max}`}</span></div>
  <p className="mt-2 border-t border-white/8 pt-2 font-mono text-[8px] uppercase tracking-wider text-[#C9CFF0]">{live ? "ESP32 · device reading" : "Simulated sensor"} · {target.source.startsWith("Demo") ? "demo target" : "sourced target"}</p>
 </div>;
}
