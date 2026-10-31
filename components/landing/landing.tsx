"use client";
import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { m, useReducedMotion, useScroll } from "motion/react";
import { SiteHeader } from "@/components/site-header";
export function LandingShell({ children }: { children: ReactNode }) {
 const reduce = useReducedMotion(); const { scrollYProgress } = useScroll();
 useEffect(() => { if (reduce) return; const lenis = new Lenis({ duration: 1.05, smoothWheel: true, anchors: { offset: -90 } }); let frame: number; const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf); }; frame = requestAnimationFrame(raf); return () => { cancelAnimationFrame(frame); lenis.destroy(); }; }, [reduce]);
 return <><m.div aria-hidden="true" className="signature fixed inset-x-0 top-0 z-[60] h-[3px] origin-left" style={{ scaleX: scrollYProgress }} /><SiteHeader /><main id="main-content">{children}</main></>;
}
