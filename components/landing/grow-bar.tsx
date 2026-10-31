"use client";
import { m, useReducedMotion } from "motion/react";
export function GrowBar({ width, order }: { width: string; order: number }) {
 const reduce = useReducedMotion();
 return <m.div className="h-full rounded-full bg-lime" initial={reduce ? false : { width: 0 }} whileInView={{ width }} viewport={{ once: true, amount: .3 }} transition={{ duration: 1.2, delay: order * .08, ease: [.22, 1, .36, 1] }} />;
}
