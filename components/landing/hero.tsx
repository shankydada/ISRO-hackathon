"use client";
import { useRef } from "react";
import Link from "next/link";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, ScanLine, Sparkles, Wind, Thermometer, Droplets, ArrowDown, MapPin } from "lucide-react";
import { TrialPhoto } from "@/components/trial-photo";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "./motion-primitives";
import { EASE } from "@/lib/utils";
export function Hero() {
 const ref = useRef<HTMLElement>(null); const reduce = useReducedMotion();
 const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
 const y = useTransform(scrollYProgress, [0, 1], [0, 40]);
 const words = ["Crops", "that", "don't", "care", "about", "the", "weather."];
 return <section ref={ref} className="relative isolate overflow-hidden bg-paper" aria-labelledby="hero-title">
  <div aria-hidden="true" className="signature absolute inset-y-0 left-0 -z-20 hidden w-[45%] lg:block" />
  <div aria-hidden="true" className="signature absolute inset-x-0 top-0 -z-20 h-[900px] sm:h-[650px] lg:hidden" />
  <div className="grid min-h-[calc(100svh-76px)] lg:grid-cols-[45%_55%]">
   <div className="relative px-6 pb-12 pt-12 text-white sm:px-10 lg:py-16 xl:px-16 2xl:pl-[max(80px,calc((100vw-1560px)/2))]">
    <RevealHero order={0}><Eyebrow className="border border-white/15 bg-ink/80 text-[9px] xl:text-[10px]">MYCOTECH · RISE@IITs 2027 · IIT PATNA</Eyebrow></RevealHero>
    <h1 id="hero-title" className="mt-8 max-w-[650px] font-heading text-[clamp(54px,5.4vw,96px)] font-bold leading-[1.01] tracking-[-.065em]">{words.map((word, i) => <m.span key={word} className={`inline-block ${i < words.length - 1 ? "mr-[.19em]" : "text-lime"}`} initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: i * .04, ease: EASE }}>{word}</m.span>)}</h1>
    <RevealHero order={9}><p className="mt-7 max-w-[490px] text-[16px] leading-[1.7] text-white/90 xl:text-[18px]">An AI + IoT grow ecosystem: sensors and cameras read each crop, and our AI gives it the light, moisture, oxygen and CO₂ it needs — warning of disease before it spreads. Starting with mushrooms in Bihar.</p></RevealHero>
    <RevealHero order={10}><div className="mt-8 flex flex-wrap gap-3"><Button asChild variant="lime" size="lg" className="text-[13px]"><Link href="/dashboard">Open live grow room <ArrowUpRight /></Link></Button><Button asChild variant="outline" size="lg" className="border-white/50 text-white hover:bg-white/10"><Link href="/scan"><ScanLine /> Scan a crop</Link></Button></div></RevealHero>
    <RevealHero order={11}><div className="mt-10 flex items-center gap-5 border-t border-white/20 pt-5 font-mono text-[9px] uppercase tracking-widest text-white"><span className="flex items-center gap-2"><MapPin className="size-3.5 text-lime" /> Rooted in Bihar</span><span className="h-3 w-px bg-white/30" /><span>Built to grow anywhere</span></div></RevealHero>
   </div>
   <div className="relative flex items-center px-6 pb-16 pt-10 sm:px-12 lg:py-14 lg:pl-8 lg:pr-12 xl:pl-14 xl:pr-20 2xl:pr-[max(80px,calc((100vw-1560px)/2))]">
    <m.div aria-hidden="true" className="pointer-events-none absolute left-[5%] top-[15%] -z-10 h-[75%] w-[90%] rounded-full bg-[radial-gradient(ellipse,#b8ff2e65_0%,#00d5ff30_45%,transparent_72%)] blur-3xl" animate={reduce ? undefined : { x: [-12, 16, -12], y: [8, -12, 8], scale: [1, 1.08, 1] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} />
    <m.div style={{ y: reduce ? 0 : y }} className="relative mx-auto w-full max-w-[650px]">
     <div className="relative">
      <div className="absolute -right-3 -top-3 hidden h-full w-full rounded-[28px] border border-electric/20 sm:block" aria-hidden="true" />
      <TrialPhoto file="harvest-hand.jpg" alt="A person holding fresh white milky mushrooms harvested in a MycoTech Bihar trial" priority sizes="(max-width: 1024px) 90vw, 48vw" className="aspect-[4/4.6] max-h-[690px] rounded-[26px] shadow-[0_25px_70px_#0a0f2e30] sm:aspect-[4/4.3] lg:aspect-[4/5.25]" position="center 42%" badge={false} />
      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/40 bg-ink/65 px-3 py-2 font-mono text-[9px] tracking-wide text-white backdrop-blur-md"><span className="size-1.5 rounded-full bg-lime" /> FIELD NOTES / BIHAR, INDIA</div>
      <div className="absolute bottom-5 right-5"><span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-2.5 py-1.5 font-mono text-[8px] font-bold text-ink"><span className="size-1.5 rounded-full bg-ink" />REAL PHOTO · OUR TRIAL</span></div>
      <div className="absolute -bottom-7 left-3 right-3 rounded-2xl border border-white/35 bg-ink/85 p-4 text-white shadow-xl backdrop-blur-xl sm:-left-7 sm:right-auto sm:w-[315px] sm:p-5">
       <div className="mb-3 flex items-center justify-between"><span className="flex items-center gap-2 font-mono text-[9px] tracking-wider text-lime"><Sparkles className="size-3.5" /> AI RECIPE · ICAR WINDOW</span><span className="rounded bg-white/10 px-1.5 py-1 font-mono text-[8px] text-white/80">MILKY</span></div>
       <p className="font-heading text-base font-semibold">Crop: milky mushroom</p>
       <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[10px] text-white/90"><span className="flex items-center gap-1.5"><Thermometer className="size-3.5 text-cyan" />30–35°C</span><span className="flex items-center gap-1.5"><Droplets className="size-3.5 text-cyan" />RH 80–90%</span></div>
       <p className="mt-3 flex items-center gap-2 border-t border-white/15 pt-3 font-mono text-[10px] text-white/85"><Wind className="size-3.5 text-lime" /> Air: O₂ in, CO₂ out</p>
      </div>
     </div>
    </m.div>
   </div>
  </div>
  <div className="pointer-events-none absolute bottom-5 right-10 hidden items-center gap-3 font-mono text-[9px] uppercase tracking-widest text-muted lg:flex">Scroll to grow <ArrowDown className="size-3.5" /></div>
 </section>;
}
function RevealHero({ children, order }: { children: React.ReactNode; order: number }) { const reduce = useReducedMotion(); return <m.div initial={reduce ? false : { y: 24 }} animate={{ y: 0 }} transition={{ duration: .4, delay: order * .04, ease: EASE }}>{children}</m.div>; }
