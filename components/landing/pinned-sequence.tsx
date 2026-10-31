"use client";
import { useRef, useState } from "react";
import { m, useScroll, useTransform, useMotionValueEvent, useReducedMotion, type MotionValue } from "motion/react";
import { Radio, Cpu, Fan, CircuitBoard } from "lucide-react";
import { Reveal } from "./motion-primitives";
import { Card } from "@/components/ui/card";
const steps = [
 { tag: "SENSE", title: "Read the crop", icon: Radio, text: "Temperature & humidity, substrate moisture, CO₂ and O₂, light level & hours, a camera on every rack.", detail: "Every rack. Every minute." },
 { tag: "PREDICT", title: "Predict & decide", icon: Cpu, text: "Crop recipes from ICAR data; a vision model for disease and ripeness; learns from every batch; runs offline at the edge.", detail: "A recipe, not a guess." },
 { tag: "ACT", title: "Fix it automatically", icon: Fan, text: "LED grow lights, fogger/humidifier, fresh-air fan (O₂ in, CO₂ out), heater/cooler, WhatsApp alert in Hindi.", detail: "The right response. In time." }
];
export function PinnedSequence() {
 const ref = useRef<HTMLDivElement>(null); const [active, setActive] = useState(0); const reduce = useReducedMotion();
 const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
 const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
 useMotionValueEvent(scrollYProgress, "change", v => setActive(Math.min(2, Math.floor(v * 3))));
 return <><div ref={ref} className="relative hidden h-[300vh] lg:block"><div className="sticky top-[76px] flex h-[calc(100vh-76px)] min-h-[600px] items-center overflow-hidden"><div className="section-wrap grid grid-cols-[1fr_1.1fr] items-center gap-16">
  <div className="space-y-3">{steps.map((s, i) => <button type="button" key={s.tag} onClick={() => { if (!ref.current) return; const top = ref.current.offsetTop - 76; window.scrollTo({ top: top + (ref.current.offsetHeight - window.innerHeight + 76) * ((i + .2) / 3), behavior: reduce ? "instant" : "smooth" }); }} aria-current={active === i ? "step" : undefined} className={`w-full rounded-2xl border p-6 text-left transition-colors duration-500 ${active === i ? "border-electric/25 bg-white shadow-blue" : "border-transparent bg-transparent"}`}><div className="flex gap-5"><span className={`grid size-12 shrink-0 place-items-center rounded-xl transition-colors duration-500 ${active === i ? "signature text-white" : "bg-paper-2 text-muted"}`}><s.icon className="size-5" /></span><div><p className={`label mb-2 ${active === i ? "text-electric" : "text-muted"}`}>0{i + 1} / {s.tag}</p><h3 className="font-heading text-2xl font-bold tracking-tight">{s.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p></div></div></button>)}</div>
  <div className="relative"><div className="absolute inset-10 -z-10 rounded-full bg-[radial-gradient(ellipse,#2340ff12,#00d5ff08,transparent_70%)]" /><LoopDiagram active={active} pathLength={pathLength} /><div className="mt-2 text-center"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-muted">SENSE → PREDICT → ACT → REPEAT</p><p className="mt-3 font-heading text-xl font-semibold">{steps[active].detail}</p><div className="mt-5 flex justify-center gap-2">{steps.map((s, i) => <span key={s.tag} className={`h-1.5 rounded-full transition-all duration-500 ${active === i ? "w-9 bg-electric" : "w-3 bg-electric/15"}`} />)}</div></div></div>
 </div></div></div>
 <div className="section-wrap my-10 grid gap-4 lg:hidden">{steps.map((s, i) => <Reveal key={s.tag} order={i}><Card className="p-6"><div className="flex items-center gap-4"><span className="signature grid size-11 place-items-center rounded-xl text-white"><s.icon className="size-5" /></span><div><p className="label text-electric">0{i + 1} / {s.tag}</p><h3 className="mt-1 font-heading text-2xl font-bold">{s.title}</h3></div></div><p className="mt-4 text-sm leading-relaxed text-muted">{s.text}</p></Card></Reveal>)}</div></>;
}
function LoopDiagram({ active, pathLength }: { active: number; pathLength: MotionValue<number> }) {
 const reduce = useReducedMotion();
 return <svg viewBox="0 0 520 420" role="img" aria-label={`Closed-loop growing system: sensors read the crop, AI predicts and decides, actuators adjust the room. Current step: ${steps[active].tag}.`} className="w-full">
  <defs><linearGradient id="loop-gradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#2340FF" /><stop offset="1" stopColor="#7A2BFF" /></linearGradient></defs>
  <path d="M260 85C375 85 435 155 435 235C435 330 355 355 260 355C165 355 85 330 85 235C85 155 145 85 260 85Z" fill="none" stroke="#DAE1FA" strokeWidth="3" strokeDasharray="5 8" />
  <m.path d="M260 85C375 85 435 155 435 235C435 330 355 355 260 355C165 355 85 330 85 235C85 155 145 85 260 85Z" fill="none" stroke="url(#loop-gradient)" strokeWidth="4" strokeLinecap="round" style={{ pathLength: reduce ? 1 : pathLength }} />
  <circle cx="260" cy="223" r="83" fill="#EAF0FF" /><circle cx="260" cy="223" r="66" fill="white" stroke="#DAE1FA" />
  <foreignObject x="215" y="180" width="90" height="90"><div className="flex h-full flex-col items-center justify-center gap-2 text-electric"><CircuitBoard className="size-9" /><span className="font-mono text-[9px] font-bold tracking-wider">MYCOTECH</span></div></foreignObject>
  {[{ x: 260, y: 85, icon: Radio, label: "SENSORS", n: 0 }, { x: 430, y: 270, icon: Cpu, label: "AI ENGINE", n: 1 }, { x: 90, y: 270, icon: Fan, label: "ACTUATORS", n: 2 }].map(node => <g key={node.label}><circle cx={node.x} cy={node.y} r="46" fill={active === node.n ? "#0A0F2E" : "white"} stroke={active === node.n ? "#2340FF" : "#DAE1FA"} strokeWidth="2" className="transition-colors duration-500" /><foreignObject x={node.x - 35} y={node.y - 29} width="70" height="65"><div className={`flex flex-col items-center gap-2 ${active === node.n ? "text-lime" : "text-electric"}`}><node.icon className="size-6" /><span className="font-mono text-[8px] font-bold">{node.label}</span></div></foreignObject></g>)}
  <path d="M413 157L425 165L427 151M338 345L325 350L335 359M92 180L96 166L107 175" fill="none" stroke="#2340FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
 </svg>;
}
