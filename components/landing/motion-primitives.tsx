"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, m, useInView, useReducedMotion } from "motion/react";
import { EASE, cn } from "@/lib/utils";
export function Reveal({ children, className, order = 0, x = 0, rotate = 0 }: { children: ReactNode; className?: string; order?: number; x?: number; rotate?: number }) {
 const reduce = useReducedMotion();
 return <m.div className={className} initial={reduce ? false : { opacity: 0, y: 24, x, rotate }} whileInView={{ opacity: 1, y: 0, x: 0, rotate: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .65, delay: order * .08, ease: EASE }}>{children}</m.div>;
}
export function CountUp({ value, decimals = 0, prefix = "", suffix = "", className }: { value: number; decimals?: number; prefix?: string; suffix?: string; className?: string }) {
 const ref = useRef<HTMLSpanElement>(null); const inView = useInView(ref, { once: true, amount: .3 }); const reduce = useReducedMotion(); const [n, setN] = useState(reduce ? value : 0);
 useEffect(() => { if (!inView) return; if (reduce) return; const controls = animate(0, value, { duration: 1.2, ease: EASE, onUpdate: setN }); return () => controls.stop(); }, [inView, value, reduce]);
 return <span ref={ref} className={cn("tabular-nums", className)} ><span className="sr-only">{prefix}{value.toFixed(decimals)}{suffix}</span><span aria-hidden="true">{prefix}{(reduce ? value : n).toFixed(decimals)}{suffix}</span></span>;
}
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) { return <span className={cn("eyebrow", className)}>{children}</span>; }
